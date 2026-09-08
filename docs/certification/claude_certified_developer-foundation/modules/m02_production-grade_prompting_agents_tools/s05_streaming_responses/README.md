# Streaming Responses and Handling Partial Output Without Corrupting State

Every request so far has waited for the complete response before doing anything with it.

That works well until:

- Responses become long
- Users are waiting interactively
- Perceived latency becomes important

Streaming solves this by sending output incrementally as the model generates it.

The benefit is that users start seeing results immediately.

The trade-off is that your application now has additional responsibilities:

- Assemble the final response from many events
- Track partial state correctly
- Handle interrupted streams safely
- Avoid saving incomplete responses to conversation history

---

# What Streaming Changes About the Response

In a normal (non-streamed) request, Claude returns a complete message:

```text
Request
   ↓
Complete Message
```

Everything arrives at once.

---

In a streamed request, Claude returns a sequence of events describing the message as it is being generated:

```text
Request
   ↓
message_start
   ↓
content_block_start
   ↓
content_block_delta
   ↓
content_block_delta
   ↓
content_block_stop
   ↓
message_delta
   ↓
message_stop
```

Your application listens to these events and rebuilds the completed message.

### Important Point

The final assembled message is identical to what a non-streamed request would have returned.

The difference is:

> Your application is responsible for assembling it.

---

# What Is Not Happening

Streaming does **not** mean Claude is maintaining a live mutable response object.

Each event is simply a small message describing a change.

Examples:

- A new content block starts
- Additional text arrives
- More JSON arrives for a tool call
- A block finishes
- The entire message finishes

Your code must apply those changes to local state.

---

# Streaming Event Sequence

## Event Processing Table

| Event | What It Signals | What Your Handler Does |
|---------|----------------|------------------------|
| **message_start** | A new message begins. Includes message shell and initial usage information. | Create an empty content array to begin collecting blocks. |
| **content_block_start** | A new content block starts. Includes block type (`text`, `tool_use`, or `thinking`) and index. | Create a slot for that block. Tool-use blocks include tool name and ID, but input may not be complete yet. |
| **content_block_delta** | Partial content for a block. May contain text fragments, tool-input JSON fragments, or thinking fragments. | Append the fragment to the correct block. Do not act on incomplete content. |
| **content_block_stop** | The block is complete. | Finalize the block. Tool-input JSON can now be safely parsed. |
| **message_delta** | Updates to the overall message, including final usage and `stop_reason`. | Store the `stop_reason` and updated metadata. |
| **message_stop** | The message is fully complete. | Mark the assembled content as a finished response. Treat it exactly like a non-streamed response. |

---

# Example: Building a Text Response

Suppose Claude generates:

```text
Hello world
```

The stream might arrive as:

```text
message_start
```

```text
content_block_start
```

```text
content_block_delta: "Hel"
```

```text
content_block_delta: "lo "
```

```text
content_block_delta: "world"
```

```text
content_block_stop
```

```text
message_stop
```

Your handler gradually assembles:

```text
Hel
↓
Hello
↓
Hello world
```

Only after `message_stop` is the turn considered complete.

---

# The Rule That Prevents State Corruption

## Never Act on a Partial Block

This rule is especially important for tool use.

A tool call's input arrives incrementally through multiple:

```text
content_block_delta
```

events.

The tool input may look like:

```json
{
  "account_id":
```

after one delta.

Then:

```json
{
  "account_id": 12345
```

after another.

Then eventually:

```json
{
  "account_id": 12345,
  "region": "US"
}
```

once the block finishes.

---

## Wrong Approach

Attempting to parse tool input before:

```text
content_block_stop
```

can result in:

- Invalid JSON errors
- Missing fields
- Incomplete tool arguments
- Incorrect tool execution

---

## Correct Approach

```text
Receive deltas
        ↓
Accumulate content
        ↓
Wait for content_block_stop
        ↓
Parse JSON
        ↓
Run tool
```

Treat the block as incomplete until it closes.

---

# Writing Streamed Messages to History

The same rule applies to conversation history.

### Incorrect

```text
Receive partial stream
        ↓
Save assistant turn immediately
```

This risks storing:

- Incomplete text
- Partial tool calls
- Corrupted message state

---

### Correct

```text
Receive stream
        ↓
Assemble blocks
        ↓
Receive message_stop
        ↓
Save complete assistant turn
```

Only completed messages belong in conversation history.

---

# When the Stream Stops Early

Streams can terminate unexpectedly.

Common causes include:

- Network interruptions
- Client disconnects
- Infrastructure failures
- Timeouts

The most dangerous mistake is treating partial output as complete output.

---

# Rule 1: Track Completion Explicitly

A streamed response is only complete if:

```text
message_stop
```

has been received.

Until then, all accumulated content is provisional.

---

# Rule 2: Discard Partial Assistant Turns

If a stream is interrupted before completion:

✅ Discard the incomplete assistant turn.

✅ Retry the request if needed.

❌ Do not save the partial response into history.

---

## Why?

A half-built text response may only cause cosmetic issues.

A half-built tool call becomes a structural problem and can break future requests entirely.

---

# Rule 3: Check stop_reason

Always inspect the value delivered in:

```text
message_delta
```

before continuing processing.

Examples:

| stop_reason | Meaning |
|-------------|----------|
| `end_turn` | Claude finished normally. |
| `tool_use` | Tool calls are ready for execution. |
| `max_tokens` | Response stopped because token limit was reached. |
| `model_context_window_exceeded` | Context limit reached during generation. |

---

## Tool-Use Example

If:

```text
stop_reason = tool_use
```

Then:

```text
Run tool
        ↓
Return tool_result
        ↓
Continue conversation
```

If the stop reason is something else, do not enter the tool-use path.

---

# Correct Streaming Lifecycle

```text
message_start
       ↓
Collect blocks
       ↓
Append deltas
       ↓
Close blocks
       ↓
Receive stop_reason
       ↓
Receive message_stop
       ↓
Commit to history
```

Only after the final step should the turn be treated as permanent.

---

# Handles Well

Streaming is especially useful for:

- Long generations
- Chat applications
- Interactive UIs
- Agent systems producing large outputs

Benefits include:

- Faster perceived performance
- Reduced waiting time
- Better user experience

---

# Adds Cost or Complexity

Streaming requires additional engineering work:

- State management
- Block assembly
- Event handling
- Interruption recovery
- Tool-call coordination

Most importantly:

> You must never act on partial blocks.

---

# Use a Different Approach

For:

- Short responses
- Backend jobs
- Internal automation
- Workloads where nobody is waiting

a non-streamed request is often the simpler choice.

Benefits:

- No event assembly
- No partial-state management
- Simpler implementation
- Fewer failure modes

---

# Key Takeaways

1. Streaming returns events, not complete messages.
2. Your application assembles the final response.
3. Tool inputs arrive incrementally and must not be parsed until `content_block_stop`.
4. Assistant turns should only be persisted after `message_stop`.
5. Interrupted streams should be discarded rather than saved.
6. Always inspect `stop_reason` before deciding what happens next.
7. Streaming improves responsiveness but requires careful state management.
8. For simple or non-interactive workloads, non-streamed responses are often the safer and simpler option.