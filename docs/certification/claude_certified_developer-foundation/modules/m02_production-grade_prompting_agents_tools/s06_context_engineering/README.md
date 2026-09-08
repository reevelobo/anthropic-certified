# The Stream That Left a Half-Written Tool Call in the History

## Setup

*A streamed response can appear correct on screen and still corrupt the next request.*

The text may render successfully, the user may see an answer, and the handler may append the turn to conversation history.

However, if the stream is interrupted before the message fully completes, the stored assistant turn may contain incomplete content. This becomes especially dangerous when the interrupted content includes a partially constructed `tool_use` block.

The resulting failure usually surfaces on a later request, making the root cause difficult to trace.

---

# Postmortem: Partial `tool_use` Block Committed to History After a Dropped Stream

An agent application used streaming so that operators could watch responses appear in real time.

The streaming handler worked as follows:

1. Receive stream events.
2. Append `content_block_delta` fragments to local state.
3. When the read loop ends, append the assembled assistant turn to conversation history.

During development and local testing, streams always completed successfully.

Every stream ended with:

```text
message_stop
```

As a result:

- Every assistant turn was complete.
- Every tool call was valid.
- No failures appeared.

---

## What Changed in Production?

A temporary network interruption caused a stream to terminate unexpectedly.

The interruption happened after:

```text
content_block_start
```

for a `tool_use` block

and after several:

```text
content_block_delta
```

events

but before:

```text
content_block_stop
```

and before:

```text
message_stop
```

---

## The Incomplete Tool Call

The tool-use block had begun receiving JSON input.

The stream might have looked like:

```text
content_block_start
```

```json
{
  "customer_id":
```

```json
{
  "customer_id": 12345,
```

*stream disconnects*

The JSON was incomplete.

The tool block never closed.

The message never completed.

---

## The Handler's Mistake

The handler treated:

```text
stream ended
```

as equivalent to:

```text
message completed
```

Those are not the same thing.

When the connection dropped:

- The read loop exited.
- The handler appended the partially assembled assistant turn to history.
- The corrupted `tool_use` block was now part of the conversation state.

---

# Why the Failure Appeared Later

The operator saw partial output and retried the request.

The retry included the stored conversation history.

That history now contained:

```text
Assistant Turn
└── Incomplete tool_use block
```

When the retry request was sent, the API attempted to validate the message structure.

Validation failed because the historical tool block contained malformed input.

The API returned an error pointing at the retry request.

---

## Why Diagnosis Took So Long

The team inspected:

- Tool schemas
- Tool arguments
- Retry logic
- Validation code

because the failure appeared during the retry.

The real cause was not the retry.

The real cause occurred one request earlier when the streaming handler persisted an incomplete assistant turn.

This created a classic situation:

```text
Cause
      ↓
Interrupted stream
      ↓
Corrupted history
      ↓
Retry request
      ↓
Validation error
```

The error surfaces on the retry even though the corruption happened earlier.

---

# Root Cause

The handler assumed:

```text
Read Loop Exit
=
Valid Assistant Turn
```

This assumption is incorrect.

A stream can stop because:

- The message completed
- The network failed
- The client disconnected
- A timeout occurred

Only one of those situations guarantees valid output.

---

# The Correct Rule

## Only `message_stop` Means Complete

```text
message_stop
```

is the only reliable indicator that a streamed message is finished.

Anything accumulated before that point must be treated as provisional.

### Safe Pattern

```text
Receive stream
        ↓
Assemble content
        ↓
Receive message_stop
        ↓
Persist assistant turn
```

### Unsafe Pattern

```text
Receive stream
        ↓
Read loop exits
        ↓
Persist assistant turn
```

---

# Recovery Strategy

When a stream is interrupted:

### Step 1

Discard the partial assistant turn.

### Step 2

Do not write the incomplete turn to history.

### Step 3

Retry using the last known complete conversation state.

### Step 4

Allow Claude to regenerate the response.

---

# Architectural Rule

Conversation history should contain only:

✅ Completed content blocks

✅ Closed tool calls

✅ Fully assembled assistant turns

✅ Messages that reached `message_stop`

Never store:

❌ Partial text blocks

❌ Incomplete tool inputs

❌ Half-built `tool_use` blocks

❌ Interrupted assistant turns

---

# Warning Signs in Production

If you encounter:

- Validation errors on retry requests
- Malformed `tool_use` inputs in history
- Random failures after network interruptions
- Tool-use pairing errors that seem unrelated to current code

investigate the prior streamed turn before changing:

- Schemas
- Tool definitions
- Retry mechanisms

The corruption may already exist in conversation history.

---

# What to Watch Out For

A stream ending is **not** the same thing as a message completing.

| Event | Meaning |
|---------|---------|
| Read loop ended | Connection stopped for some reason |
| `message_stop` received | Message successfully completed |

Only the second guarantees valid state.

When a handler commits turns whenever a stream ends rather than when `message_stop` arrives, interrupted streams can silently inject corrupted blocks into history.

The resulting failure often appears on the next request, making the true source difficult to identify.

---

# Best Practices

1. Track `message_stop` explicitly.
2. Treat all streamed content as provisional until completion.
3. Never save incomplete assistant turns.
4. Discard interrupted streams.
5. Retry from the last completed turn.
6. Investigate prior streamed turns when validation failures appear unexpectedly.
7. Remember that the location of the error is not always the location of the bug.

---

# Key Takeaway

The critical distinction is:

> **"The stream ended" does not mean "the message completed."**

Only `message_stop` means the response is structurally complete.

If an interrupted stream writes a half-built `tool_use` block into history, the resulting validation error typically appears on the next request, not the one that caused the corruption.

The safest strategy is simple:

```text
No message_stop
        ↓
No history write
```

Discard the partial turn, retry from the last complete state, and keep corrupted blocks out of conversation history.

# The Session That Ran Fine in Development, Then Hit a Ceiling in Production

## Setup

*Tool outputs consume context in exactly the same way that prompts, documents, and user messages do.*

The context window is a fixed budget that contains everything Claude needs to see on a given turn:

- System prompts
- User messages
- Assistant messages
- Tool calls
- Tool results
- Retrieved documents
- Other injected context

When tool outputs are small, each turn consumes only a modest amount of that budget.

When tool outputs become larger, each turn consumes significantly more of the same budget.

The context window itself has not changed.

What changes is how quickly each turn spends it.

As a result, an agent that comfortably survives twenty turns during development can begin failing at turn eight in production without any change to the model, prompt, or code.

---

# Postmortem: Context Budget Never Measured Against Production Tool Outputs

A team built an agent to process sales receipts.

The team imposed a:

```text
40,000-token context budget
```

as a cost-control measure.

This was **not** a model limitation.

The selected Claude model supported substantially more context:

- 200k tokens as a standard context window
- Up to 1M tokens on current flagship models

The team simply chose to operate within a 40k-token budget.

---

## Development Environment

Development used a controlled fixture set:

- 20 receipts
- Approximately 800 tokens returned per tool call

### Result

```text
20 turns × 800 tokens
≈ 16,000 tool-output tokens
```

After accounting for:

- System prompt
- User messages
- Assistant responses

the entire workflow consumed approximately:

```text
18,000 tokens
```

Well below the team's:

```text
40,000-token budget
```

Everything appeared healthy.

---

## Production Environment

Production receipts were significantly more complex.

Many included:

- Supporting documentation
- Transaction records
- Email correspondence
- Additional attachments

Average tool output increased from:

```text
~800 tokens
```

to approximately:

```text
~3,200 tokens
```

per call.

---

## What Happened?

After only eight turns:

```text
8 × 3,200
=
25,600 tokens
```

of tool output had accumulated.

When combined with:

- System prompts
- User messages
- Assistant messages
- Prior tool calls

the running total approached the team's:

```text
40,000-token budget
```

The budget was exhausted around:

```text
Turn 8
```

before the analysis completed.

---

# Symptoms Observed

The failure did not initially look like a context problem.

Operators reported:

- Incorrect tool selection
- Missing information
- Incomplete analyses
- Inconsistent reasoning

The behavior resembled a broken tool schema.

---

# Actual Root Cause

The problem was not tool routing.

The problem was context pressure.

Over time:

```text
Tool Result
      ↓
Added to Context
      ↓
Never Removed
      ↓
Context Grows
      ↓
Important Instructions Lose Influence
```

Large accumulated tool outputs crowded the working context.

The agent was making decisions using a context window dominated by historical tool data.

Critical information became progressively less effective, including:

- Original instructions
- Planning context
- Task objectives

The agent's behavior degraded because the context window was overloaded.

---

# Development vs. Production

| Metric | Development | Production |
|----------|-------------|-------------|
| **Context window available** | 200k standard, 1M on current Opus and Sonnet | 200k standard, 1M on current Opus and Sonnet |
| **Team budget cap** | 40k tokens | 40k tokens |
| **Average tool output** | ~800 tokens per call | ~3,200 tokens per call |
| **Turns before budget fills** | Sessions completed without reaching the cap | Cap reached at turn 8 |
| **Observed symptom** | None. Sessions completed cleanly | Wrong tool selections and incomplete outputs starting around turn 8 |
| **Root cause identified by** | Not applicable | Token usage audit, two days after deployment |
| **Fix** | Not applicable | Prune tool outputs after use and apply compaction proactively before the cap is reached |

---

# Why Development Didn't Catch the Problem

This failure mode is extremely common.

Development fixtures are almost always smaller than production data.

Typical development assumptions include:

```text
Small documents
Small tool outputs
Short sessions
Predictable inputs
```

Production often contains:

```text
Larger documents
Long conversations
Unexpected edge cases
Bigger tool outputs
```

The result is that token growth curves observed in testing do not represent real-world usage.

---

# The Diagnostic Trap

Many teams initially interpret the symptom as:

```text
Wrong tool selected
```

when the actual problem is:

```text
Context budget exhausted
```

These failures often look similar.

### Tool Routing Failure

```text
Bad schema
      ↓
Wrong tool selected
```

### Context Overflow Failure

```text
Too much accumulated context
      ↓
Model loses effective guidance
      ↓
Wrong tool selected
```

The visible behavior is nearly identical.

The underlying causes are completely different.

---

# The Fix

The team implemented two changes.

## 1. Prune Tool Outputs

After a tool result had served its purpose:

```text
Tool Output
      ↓
Used
      ↓
Removed
```

instead of remaining in context for the entire session.

This prevented old data from continuously accumulating.

---

## 2. Compact Before Reaching the Budget Limit

Instead of waiting until the budget ceiling was reached:

```text
Approaching Limit
      ↓
Compact Context
      ↓
Continue Session
```

A summary preserved:

- Key findings
- Decisions made
- Relevant state

while reducing token consumption.

---

# What to Watch Out For

A production context problem often appears as:

- Tool-selection degradation
- Lower-quality reasoning
- Missing details
- Incomplete responses

before anyone notices token growth.

If quality suddenly drops after a predictable number of turns:

```text
Turn 7
Turn 8
Turn 9
```

check token usage before debugging:

- Tool schemas
- Prompt wording
- Agent architecture

The context budget may already be exhausted.

---

# Prevention Checklist

Before shipping a multi-turn agent:

✅ Measure token costs using the largest production-like inputs available.

✅ Estimate cumulative tool-output growth across many turns.

✅ Monitor context usage during testing.

✅ Set compaction thresholds before reaching the limit.

✅ Prune tool outputs that no longer provide value.

✅ Validate assumptions with real data, not just fixtures.

✅ Use token-counting endpoints to verify budget estimates.

---

# Key Takeaway

The context window did not shrink.

The tool outputs grew.

That single change was enough to move a workflow from:

```text
20 successful turns
```

to:

```text
Failure at turn 8
```

The lesson is simple:

> Always measure context growth against realistic production outputs before deployment.

When agent quality degrades after a predictable number of turns, investigate context pressure before assuming the problem lies in prompts, schemas, or tool routing.