# Surviving production failure: tool errors

Your tests now tell you a failure exists and the trace tells you where it happens. The next question is what the system does the moment a failure happens in live traffic.

Production introduces failures a prototype never sees. The difference between a resilient system and a fragile one is whether you decided in advance how each kind of failure is handled.

---

# Every failure starts with one question: is it retriable or terminal?

The test is a single question:

> Would waiting and trying the exact same request again plausibly work?

If yes, it is **retriable**.

If not, it is **terminal**.

A rate limit clears with time; a malformed request will fail identically until the request itself is fixed.

Production traffic produces failures development never shows you:

- Rate-limit responses
- Timeouts
- Malformed tool results
- Transient network errors

The first decision for any failure is whether a later attempt is likely to succeed.

If so, the failure is retriable.

If not, retrying only wastes time and budget, making it terminal.

A rate-limit response or a temporary server overload is retriable, because the same request will probably go through in a moment.

A malformed request or an authentication failure is terminal, because retrying the identical bad request changes nothing.

Every subsequent handling decision depends on which bucket a failure lands in.

On the Anthropic API, the status code tells you the bucket:

- **429** means you hit a rate limit.
- **529** means the service is temporarily overloaded.

Both are retriable.

- **400** means a bad request.
- **401** means an authentication failure.

Both are terminal.

Server errors in the 5xx range, including:

- 500 Internal Error
- 504 Timeout

are also retriable because they are Anthropic-side faults that typically resolve on retry.

```python
RETRIABLE = {429, 529, 500, 502, 503, 504}   # rate limit, overload, transient
TERMINAL  = {400, 401, 403, 404}             # bad request, auth, missing

def is_retriable(status):
    return status in RETRIABLE   # everything else fails fast
```

---

## Why this distinction matters

This single distinction determines whether waiting helps.

A **retriable error** is one where the cause is transient:

- Service temporarily overloaded
- Connection dropped
- Temporary rate-limit breach

Time alone resolves it, so a later attempt may succeed.

A **terminal error** is one where the cause is embedded in the request itself:

- Malformed request body
- Expired API key
- Invalid model name

Time changes nothing because each request will produce the same failure.

Retrying a terminal error:

- Wastes retry budget
- Increases latency
- Hides the real issue beneath repeated failures

Correct classification preserves retry capacity for errors that actually benefit from it.

---

## Edge cases worth remembering

Some errors sit near the boundary:

### Timeout

Usually retriable because:

- Work may have taken longer than the client timeout

However:

- Repeated timeouts on expensive requests suggest the request itself needs redesign

### HTTP 500

Retriable because:

- The issue is server-side
- Often clears automatically

### HTTP 403

Terminal because:

- It is a permissions issue
- Retry cannot grant new permissions

When uncertain, the safer default is:

> Treat the error as terminal and surface it.

An incorrectly terminal classification fails loudly and gets fixed.

An incorrectly retriable classification can hammer a service while obscuring the actual root cause.

---

# The SDK already retries some failures, so know what it covers before you write your own

Before building a retry loop yourself, check what the SDK already provides.

Anthropic client libraries automatically retry transient failures with progressive retry delays up to a configurable limit.

The reason this matters:

> Avoid stacking multiple retry loops around the same operation.

Bad pattern:

```text
Your retry loop
    ↓
SDK retry loop
    ↓
Anthropic API
```

This multiplies the total number of attempts rather than limiting them.

Choose one place for retries:

### Option 1

Let the SDK handle transient failures and reserve your code for business-specific fallback logic.

### Option 2

Reduce SDK retries and manage the full retry strategy yourself.

Avoid:

> Multiple retry layers independently retrying the same failure.

---

# Retry-after headers are better than guessing

The API returns rate-limit headers that indicate:

- Remaining quota
- Reset timing
- Suggested retry window

The most useful header is:

```text
retry-after
```

A 429 or 529 response may include this value.

When present:

> Use it as the authoritative wait time.

Why?

Because the service is telling you exactly when capacity becomes available again.

Preferred logic:

```text
1. Read retry-after
2. Wait that duration
3. Retry
```

Fallback logic:

```text
1. No retry-after present
2. Use exponential backoff
```

The module's corrected retry implementation follows this pattern.

---

# Tool errors must come back to Claude explicitly rather than dropped

When your code runs a tool and that tool fails:

✅ Return the failure explicitly.

❌ Do not return an empty result.

When the error is returned, the model can:

- Try a different approach
- Ask for clarification
- Stop safely
- Explain the limitation

When the tool silently returns nothing:

- The model assumes success
- Empty data is treated as valid data
- Incorrect reasoning continues downstream

A visible failure is much safer than a confident answer built on missing information.

```python
def run_tool(tool_use):
    try:
        result = execute(tool_use)

        return {
            "type": "tool_result",
            "tool_use_id": tool_use.id,
            "content": result
        }

    except Exception as e:
        # surface the error so Claude can react
        # do NOT return empty output

        return {
            "type": "tool_result",
            "tool_use_id": tool_use.id,
            "is_error": True,
            "content": f"Tool failed: {e}"
        }
```

---

# Refusals require separate handling

A refusal is not a transport error.

The HTTP request succeeded.

The model made a policy decision.

```python
def run_tool(tool_use):

    # A refusal is a 200 at the HTTP layer.
    # The retriable classifier will not catch it.

    if response.stop_reason == "refusal":
        raise ValueError(
            "Model refused the request. Review input before retrying."
        )
```

Key point:

```text
HTTP Status = 200
Model Output = Refusal
```

Since the request itself succeeded, retrying generally serves no purpose.

Treat refusals as terminal and surface them clearly.

---

# The error-handling decision table you can keep open while you build

| Error type | Retriable or fail-fast | Backoff strategy | Fallback behavior |
|------------|------------------------|------------------|-------------------|
| Rate limit (429) | Retriable | Exponential backoff with jitter, honor retry-after, capped attempts | After the cap, raise a clean error or route to a cached or simpler result |
| Overloaded (529) | Retriable | Backoff; a 529 reflects Anthropic-side load, so it is not a rate-limit signal | Fail over to a fallback path or return a graceful error if it persists |
| Bad request (400) | Fail fast | No retry. The identical request will fail again | Fix or reject the input and surface the error to the caller |
| Tool result error | Depends on the tool | Retry only if the underlying cause is transient | Return the error flag to Claude so the model can react, never silence it |
| Refusal (200, stop_reason: "refusal") | Fail fast | No retry. The model made a content decision, not a transient error | Raise the refusal to the caller. Log it. Do not silently retry or treat it as valid output |

---

# Handles well

- Prevents one bad response from cascading into a larger outage.
- Preserves retry budget for failures that can actually recover.
- Exposes tool failures instead of masking them.
- Distinguishes transient infrastructure issues from permanent request issues.
- Supports graceful degradation through fallback paths.

---

# Adds cost or complexity

- Every failure path must be implemented.
- Every failure path must be tested.
- Retry logic requires monitoring and tuning.
- Tracing and fallback infrastructure increase maintenance overhead.
- Multiple failure classes introduce operational complexity.

---

# Use a different approach

Do **not** retry a terminal error.

Examples:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

Retrying these errors does not increase success probability.

It only:

- Consumes retry budget
- Increases latency
- Produces more identical failures

For stable request errors, fix the request rather than retrying it.

# The call that never failed in development

## Setup

In development, you called the endpoint a few dozen times and it returned cleanly every time, so there was no obvious reason to write an error path.

That is the trap.

Development traffic is low volume, runs on a stable connection, and rarely hits the conditions that cause a call to fail:

- Rate limits
- Timeouts
- Transient network drops
- Malformed responses under load

None of those show up when you are testing by hand, so the code that handles them never gets written.

The first time the call fails is in production, and the failure appears as an unhandled exception rather than a recoverable error.

---

# Anecdote: the first rate-limit response took the whole request down

A developer building a customer-facing feature called the API in a loop.

Every development run returned successfully because development traffic never came close to a rate limit.

The code was written without any error handling, because up until now, nothing had ever failed there.

```python
results = []                      # collect each response

for item in batch:
    # shipped version, no error path

    resp = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=msg(item)
    )

    results.append(resp.content)  # assumes every call returns 200
```

The feature shipped.

At the first traffic peak:

1. The API returned a rate-limit response.
2. An unhandled exception was raised.
3. The whole request failed.
4. No retry strategy existed.
5. The user saw a broken feature.

The developer's first instinct was to add immediate retries in a tight loop.

Unfortunately, this made the problem worse.

Each instant retry counted as another request against the same rate limit, deepening the throttling condition.

The real fix was the distinction introduced earlier:

> Determine whether the failure is retriable or terminal.

In this case:

```text
Rate limit (429)
```

is a retriable error.

Therefore the correct handling strategy is:

- Exponential backoff
- Capped retry attempts
- Honor the `retry-after` header when provided

rather than immediate retries.

Development never produced the failure, so the code path that would have handled it was never written.

---

# Why this broke

A retriable failure met code that had no error path.

After that, the failure met a retry strategy that immediately retried and deepened the rate limit.

The mistake occurred in two stages:

### Stage 1

No handling existed for transient failures.

```python
resp = client.messages.create(...)
```

was assumed to always succeed.

### Stage 2

Retries were added without backoff.

```text
Fail
↓
Retry instantly
↓
Fail again
↓
Retry instantly
↓
Hit rate limit harder
```

Instead of recovering, the application amplified the problem.

---

# Technical Analysis

## What development failed to reveal

Development environments rarely reproduce:

- Real production traffic volume
- Bursty request patterns
- Shared rate limits
- Network instability
- Temporary service overload

As a result, code like:

```python
resp = client.messages.create(...)
```

appears perfectly safe because every test run succeeds.

This creates a false assumption:

> "The API never fails."

Production eventually disproves that assumption.

---

## What should have been implemented

The response should be classified before deciding how to proceed.

### Retriable

Examples:

```text
429 Rate Limit
500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
504 Gateway Timeout
529 Overloaded
```

Action:

```text
Retry with exponential backoff
Honor retry-after if present
Cap the maximum number of attempts
```

### Terminal

Examples:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

Action:

```text
Fail immediately
Surface the error
Fix the request rather than retrying
```

---

## Correct retry pattern

```python
MAX_RETRIES = 5

for attempt in range(MAX_RETRIES):
    try:
        return client.messages.create(...)

    except RateLimitError as e:

        if attempt == MAX_RETRIES - 1:
            raise

        sleep_time = get_retry_after(e) or exponential_backoff(attempt)

        time.sleep(sleep_time)
```

Key characteristics:

- Retries only retriable failures.
- Waits before retrying.
- Honors service guidance.
- Has a maximum retry cap.
- Fails cleanly when recovery is unlikely.

---

# Lessons Learned

### Bad assumption

```text
The API has never failed in development,
therefore it does not need error handling.
```

### Reality

```text
The API has never failed in development
because development never produced production conditions.
```

### Incorrect fix

```text
Immediate retries in a tight loop.
```

### Correct fix

```text
Classify the error.
Retry only retriable failures.
Use exponential backoff.
Honor retry-after.
Cap retry attempts.
```

---

# Core Principle

> Production failures are inevitable. The question is not whether a call will fail, but whether the system already knows what to do when it does.

A resilient system treats failures as expected events, classifies them as retriable or terminal, and responds with a predefined recovery strategy instead of crashing or blindly retrying.

# Repair the broken error and retry path

The block below has one defect. Identify it and write the corrected version.

## BROKEN CODE SHOWN TO THE LEARNER

```python
def call_with_retry(make_call, max_attempts=5):
    for attempt in range(max_attempts):
        try:
            return make_call()
        except Exception:
            time.sleep(0)

    raise RetryBudgetExhausted()
```

---

# Correct Answer

## The defect

There is **no backoff between retry attempts**.

```python
time.sleep(0)
```

causes retries to fire immediately.

The loop also retries **every exception**, including terminal failures such as:

- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found

that a retry cannot fix.

Against a rate limit, each immediate retry counts as another request and pushes the caller further into the limit rather than allowing capacity to recover.

---

# Corrected Version

```python
def call_with_retry(make_call, max_attempts=5, cap=30):
    for attempt in range(max_attempts):
        try:
            return make_call()

        except anthropic.RateLimitError as e:
            wait = e.response.headers.get("retry-after")

            if wait is None:
                wait = min(cap, 2 ** attempt) + random.uniform(0, 1)

            time.sleep(float(wait))

        except anthropic.APIStatusError as e:
            if not is_retriable(e.status_code):
                raise  # fail fast on terminal errors

            time.sleep(
                min(cap, 2 ** attempt) + random.uniform(0, 1)
            )

    raise RetryBudgetExhausted()
```

---

# Technical Reasoning

## Why the original version fails

The original implementation treats every failure the same:

```python
except Exception:
    time.sleep(0)
```

This creates a tight retry loop:

```text
429 Rate Limit
↓
Retry immediately
↓
429 Rate Limit
↓
Retry immediately
↓
429 Rate Limit
```

The service never gets a chance to recover.

Instead of helping, the client amplifies the overload condition.

---

## Fix #1: Honor `retry-after`

```python
wait = e.response.headers.get("retry-after")
```

When a service returns a rate-limit response, it may provide a `retry-after` header indicating exactly how long to wait before sending another request.

Using that value is more accurate than guessing because the service itself is signaling when capacity is expected to become available.

Only when the header is missing should the client fall back to its own retry strategy.

---

## Fix #2: Exponential backoff with a cap

```python
wait = min(cap, 2 ** attempt) + random.uniform(0, 1)
```

The delay grows after each failed attempt:

```text
Attempt 1 → ~1 second
Attempt 2 → ~2 seconds
Attempt 3 → ~4 seconds
Attempt 4 → ~8 seconds
Attempt 5 → ~16 seconds
```

Benefits:

- Reduces pressure on the service.
- Improves the chance that a transient failure clears.
- Prevents retry storms during outages.
- The cap prevents unbounded wait times.

The added random jitter:

```python
random.uniform(0, 1)
```

helps prevent many clients from retrying at exactly the same moment.

---

## Fix #3: Fail fast on terminal errors

```python
if not is_retriable(e.status_code):
    raise
```

Not every error should be retried.

Examples of terminal failures:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
```

These failures occur because the request itself is invalid, unauthorized, or references a missing resource.

Retrying them will produce the same outcome repeatedly.

Correct behavior is to surface the error immediately so the caller can fix the underlying problem.

---

# Why This Version Is More Resilient

The corrected implementation applies three important production principles:

1. **Uses `retry-after` when the service provides one.**
2. **Falls back to exponential backoff with jitter and a cap.**
3. **Distinguishes retriable failures from terminal failures and fails fast when retrying cannot help.**

Together these changes prevent:

- Retry storms
- Wasted retry budget
- Unnecessary latency
- Hidden terminal errors

while still allowing transient failures such as rate limits, overloads, and temporary server errors to recover automatically.

---

# Final Answer

```text
The defect:
The retry loop performs immediate retries (time.sleep(0)) and retries every exception, including terminal errors that can never succeed on retry.

The three fixes:
1. Honor retry-after from the response header before falling back to backoff.
2. Use exponential backoff with jitter and a maximum cap between attempts.
3. Fail fast on terminal errors (400, 401, 403, 404) instead of retrying requests that will fail identically.
```

# Model selection in production

The previous screens kept a system inside its cost budget once the model was chosen. This screen handles the choice that sets that budget in the first place: which Claude model runs the workload.

Cost management optimizes spend within a model. Model selection determines the baseline that optimization works from.

---

# The model family and its capability tiers

Claude is a family of models that trade cost, latency, and capability against each other:

- **Fable** is the most capable for the most demanding reasoning, coding, and agentic work.
- **Opus** handles demanding work above the Sonnet envelope.
- **Sonnet** is the balanced default for most production workloads.
- **Haiku** is built for speed and cost efficiency on tasks that fit its envelope.

The same prompt runs on any of them, so model choice is a lever you set per workload and can change without rewriting the application.

Confirm the current lineup and model IDs against `platform.claude.com` at build time.

---

# The latency, cost, and quality trade-off

Upgrading model tier trades quality at the price of higher per-token cost and usually higher latency.

Downgrading the model tier buys speed and lower cost at the risk of a quality drop.

A higher-tier model can also process a request faster and cheaper if it reaches a conclusion in fewer tokens than a lower-tier model would.

The cost of a mistake belongs in that calculation: saving a few dollars a day on a lower-tier model is not a sound trade if the quality drop introduces errors that carry significant downstream cost.

There is no globally correct choice, only the right choice for a task at a quality standard.

The discipline is to make the trade-off measurable rather than reaching for the most capable model by default.

This is the most common and most expensive model-selection mistake in production.

The default is to:

1. Start with **Sonnet**.
2. Move up to **Opus** only when an eval shows Sonnet missing the quality bar.
3. Move down to **Haiku** only when an eval shows the quality drop is acceptable for the task.

---

# Routing: a default model plus an override on a task signal

A system does not have to use one model for everything.

A common production pattern is a **default model with an override**:

- Route the bulk of traffic to a balanced default.
- Send specific request types to a larger or smaller model based on a cheap signal read from the request.

Examples of routing signals:

- Task type
- Input length
- Difficulty classification

This is the same routing idea used for retrieval, applied to model choice:

> You pay for the more capable model only on the requests that need it.

Where every request is the same shape, skip the router and pin one model.

---

# When to step up and when to step down

### Step up a tier when:

- An eval shows the current model failing on the hardest cases in your traffic.
- The cost of a wrong answer is high.
- Quality requirements exceed the current model's capability envelope.

### Step down a tier when:

- An eval shows a cheaper model maintaining the required quality bar.
- Lower latency is valuable.
- Cost reduction is a priority.
- Most traffic can be handled successfully at the lower tier.

In both directions, the eval is the decision instrument.

A model change should be promoted only after it demonstrates improved results on real evaluation cases.

This is why the eval you built earlier is also the gate for a model decision.

---

## Handles well

- Matching each workload to the cheapest model that meets its quality bar.
- Making model-selection decisions based on measured eval performance rather than assumptions.
- Balancing cost, latency, and quality using evidence.
- Preventing unnecessary spend on overly capable models.

---

## Adds cost or complexity

- Routing introduces a classification step.
- Multiple model paths must be maintained.
- Monitoring becomes more complex.
- Model-selection logic must be evaluated and tested over time.

---

## Use a different approach

For uniform traffic operating against a single quality bar:

- Pin a single model.
- Skip the router.
- Keep the architecture simpler.

If every request has similar complexity and quality requirements, dynamic model selection often adds complexity without providing enough benefit.

# Choose the model and name the deciding constraint

For each scenario, pick the model tier (**Opus, Sonnet, or Haiku**) and identify the one constraint that drives the decision.

---

## Scenario 1

A high-volume classification step labels millions of short messages per day; an eval shows Haiku holding the quality bar. Which choice is best?

### Options

**A**. Opus, the deciding constraint is reasoning depth on ambiguous messages

**B**. Sonnet, the deciding constraint is balancing quality and speed across volume

**C**. Haiku, the deciding constraint is cost-at-volume, since the eval confirms the quality bar still holds

**D**. Opus, the deciding constraint is consistency across millions of requests

---

## Scenario 2

A multi-step agent plans a dependent refactor where a wrong early step is expensive; an eval shows Sonnet missing the bar on the hardest cases. Which choice is best?

### Options

**A**. Sonnet, the deciding constraint is cost efficiency on a long agent run

**B**. Opus, the deciding constraint is quality on hard reasoning where the cost of a wrong answer is high

**C**. Haiku, the deciding constraint is speed across many sequential steps

**D**. Sonnet, the deciding constraint is latency on dependent steps

---

## Scenario 3

Mixed traffic: most requests are simple lookups, a few are complex synthesis. Which approach is best?

### Options

**A**. Opus for everything, the deciding constraint is guaranteeing quality on the complex requests

**B**. Haiku for everything, the deciding constraint is minimizing cost across all traffic

**C**. Sonnet for everything, the deciding constraint is a single balanced model for mixed needs

**D**. Route: a Sonnet (or Haiku) default with an Opus override on the complex requests, the deciding constraint is that traffic is mixed

---

# Correct Answers

## Scenario 1

✅ **C. Haiku, the deciding constraint is cost-at-volume, since the eval confirms the quality bar still holds**

### Technical Reasoning

The scenario explicitly states:

> "an eval shows Haiku holding the quality bar"

The earlier model-selection framework establishes that once a cheaper model satisfies the required quality standard, the correct production decision is to use the cheaper model.

Key factors:

- Traffic volume is extremely high ("millions of short messages per day").
- Classification is generally a lightweight task.
- Quality has already been validated through evaluation.
- Cost savings scale directly with request volume.

Why the other answers are wrong:

- **A (Opus)**: Reasoning depth is not the stated requirement.
- **B (Sonnet)**: More expensive than necessary once Haiku passes the eval.
- **D (Opus)**: Consistency is not evidence that Opus is needed.

### Decisioning Constraint

```text
Cost at volume
```

The quality requirement has already been met, so cost becomes the dominant optimization variable.

---

## Scenario 2

✅ **B. Opus, the deciding constraint is quality on hard reasoning where the cost of a wrong answer is high**

### Technical Reasoning

The scenario contains two critical signals:

1. The work is a **multi-step dependent refactor**.
2. **Sonnet is failing the hardest evaluation cases.**

The model selection guidance says:

> Move up a tier when an eval shows the current model missing the quality bar on difficult cases.

A dependent refactor is especially sensitive because:

```text
Wrong Step 1
    ↓
Wrong Step 2
    ↓
Wrong Step 3
    ↓
Entire plan degrades
```

Errors compound across the workflow.

A stronger model is justified because:

- The cost of a mistake is high.
- Hard reasoning quality matters more than cost savings.
- The evaluation already demonstrates Sonnet is insufficient.

Why the other answers are wrong:

- **A (Sonnet)**: Contradicts the eval evidence.
- **C (Haiku)**: Prioritizes speed over quality when quality is the bottleneck.
- **D (Sonnet)**: Latency is not the dominant constraint.

### Decisioning Constraint

```text
Quality on difficult reasoning with high error cost
```

---

## Scenario 3

✅ **D. Route: a Sonnet (or Haiku) default with an Opus override on the complex requests, the deciding constraint is that traffic is mixed**

### Technical Reasoning

The earlier lesson explicitly recommends routing for mixed workloads.

The scenario contains two classes of requests:

### Simple Requests

```text
Lookups
Retrieval
Basic classification
Simple extraction
```

These can usually run on:

```text
Haiku or Sonnet
```

### Complex Requests

```text
Synthesis
Planning
Hard reasoning
Multi-step analysis
```

These may require:

```text
Opus
```

Routing prevents paying the premium model cost on every request.

Without routing:

```text
All traffic → Opus
```

Cost becomes unnecessarily high.

Or:

```text
All traffic → Haiku
```

Complex requests suffer quality degradation.

The optimal architecture is:

```text
Default Model
      ↓
Traffic Router
      ↓
Simple Requests → Haiku/Sonnet
Complex Requests → Opus
```

Why the other answers are wrong:

- **A (Opus for everything)**: Overspends on simple traffic.
- **B (Haiku for everything)**: Risks quality loss on synthesis workloads.
- **C (Sonnet for everything)**: Better than A or B but still ignores the benefits of workload-aware routing.

### Decisioning Constraint

```text
Traffic is mixed
```

Different request classes benefit from different model tiers.

---

# Summary Table

| Scenario | Correct Answer | Deciding Constraint |
|----------|---------------|---------------------|
| Scenario 1: High-volume classification | **C. Haiku** | Cost at volume after quality is proven by eval |
| Scenario 2: Multi-step refactor with Sonnet failing eval | **B. Opus** | Quality on hard reasoning where mistakes are expensive |
| Scenario 3: Mixed traffic | **D. Routed architecture** | Mixed workloads requiring different model capabilities |

---

# Final Answer Key

```text
Scenario 1 → C
Haiku, because the eval confirms the quality bar and cost-at-volume is the deciding constraint.

Scenario 2 → B
Opus, because Sonnet misses the quality bar and hard reasoning quality is the deciding constraint.

Scenario 3 → D
Route requests: Sonnet (or Haiku) by default with an Opus override for complex cases, because the traffic mix is the deciding constraint.
```