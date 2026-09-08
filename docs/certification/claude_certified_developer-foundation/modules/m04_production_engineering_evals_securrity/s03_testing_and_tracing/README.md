# Testing and Tracing

## Teaching
# Testing and tracing

The eval you just built tells you what good looks like as a number. It does not tell you where a failure happened, nor does it prevent a passing eval from hiding a break somewhere in the workflow.

A graded target needs a test and tracing layer underneath it: tests that isolate each failure type, and traces that show which step produced the bad result.

## Various test levels, each catching a failure the others miss

A test is only useful if you know which failure it identifies. Four levels divide the work, and most silent production breaks live at one particular level:

1. **A unit test** isolates one function, such as a parser or a tool wrapper, and checks it on its own. It tells you that one piece behaves, but nothing about how pieces fit together.

2. **A functional test** checks that one Claude call returns the expected shape for a given input: the right fields, the right type, a parseable response. It validates the call rather than the system around it.

3. **An integration test** exercises the handoff between two components, for example, where a retrieval result is passed into a model call. This is where most silent failures hide, because each side can pass its own tests while the handoff between them is broken.

4. **An end-to-end test** runs the whole flow the way a user would, from input to output. It catches breaks that only appear when everything runs together, at the cost of being the slowest to run and the hardest to localize.

---

# Tracing: finding the source of failure

Tests tell you that a failure exists, but they do not tell you which step caused it. That is what a trace adds.

A trace records each step of a run: the prompt, the tool calls, the intermediate outputs, and the timing. When a case fails, the trace lets you see which step produced the bad result. Without a trace, a failed eval tells you something is wrong but does not tell you where it failed.

This is the difference between a five-minute fix and a day spent tracing the workflow by hand. A trace reads like a timeline of the run, and the failing step is usually obvious once you can see the intermediate output.

```text
[trace run_id=8f21c]
case: "Where is my refund?"

step 1  retrieve(query)        ok     42ms   -> 3 chunks
step 2  build_prompt(chunks)   ok      1ms   -> prompt 1,240 tok
step 3  model.call(prompt)     ok    980ms   -> answer "..."
step 4  parse(answer)          FAIL    2ms   -> KeyError: amount

         final score: 0
         (failure localized to step 4, the parser)
```

The trace turns:

> "the case failed"

into:

> "step four: the parser raised a KeyError on a field the model did not return."

That is also what makes a change reviewable: you can show the step that moved rather than just the score that dropped.

---

# Routing between the two approaches so you pay for iteration only when you need it

You do not have to pick one strategy for everything. A cheap classification step can send single-fact lookups to the fetch-once path and multi-part questions to the search-across-rounds path. This allows you to spend on iteration only when the query needs it.

Defaulting everything to iterative search inflates cost and latency on questions a single fetch would have answered, while defaulting everything to a static index gives shallow answers on questions that needed several passes.

The router is one small model call that reads the query and picks the path.

```python
def route(query):
    kind = classify(query)        # cheap call: "lookup" or "multi_step"

    if kind == "lookup":
        return fetch_once(query)  # static retrieval, one pass

    return agentic_search(query)  # search across rounds
```

That one classification call costs far less than running iterative search on a query a single retrieval would have answered.

The router earns its cost whenever your traffic is mixed:

- Some queries are simple lookups.
- Some queries need several passes.

If every query is the same shape, skip the router and hardcode the path that fits.

---

# The reference you can keep open while you build

| Level | What it isolates | What it cannot catch |
|---------|---------|---------|
| **Unit** | One function, such as a parser or tool wrapper, on its own. | Anything about how components fit together. |
| **Functional** | One Claude call returning the expected shape for an input. | Failures in the system around that single call. |
| **Integration** | The seam where two components hand off, such as retrieval into the model. | Whole-flow behavior that only emerges end to end. |
| **End-to-end** | The full flow as a user runs it, input to output. | Where exactly the break is, since it sees only the final result. |
| **Retrieval choice** | Fetch a fixed set once for single-fact lookups in a stable corpus. | Multi-step questions and changing corpora, which need search across rounds. |

---

## Handles well

- Localizes a failure to a step.
- Matches each test to the break it can see.
- Helps identify integration failures that unit tests often miss.
- Makes debugging and review significantly faster through traces.

---

## Adds cost or complexity

- Tracing infrastructure must be implemented and maintained.
- Multiple test levels increase engineering overhead.
- End-to-end tests can be slow and expensive to run.

---

## Use a different approach

For a single-fact lookup in a stable corpus, **fetch-once retrieval** is usually better than iterative search because it is:

- Faster
- Cheaper
- Simpler

Iterative search should be reserved for:

- Multi-step reasoning
- Broad research questions
- Frequently changing corpora
- Cases requiring multiple retrieval rounds

## Watch Out
Without tracing, failures are hard to reproduce. Logging only final answers is not enough for root-cause analysis.

## Checkpoint
- List the minimum telemetry needed for debugging.
- Describe a trace that captures prompt, tool calls, and stop reasons.

# The pieces passed and the seam broke

## Setup

You tested the prompt and the parser in isolation. Both passed, so you trusted the whole flow.

### Trace excerpt: green unit and functional runs, a red end-to-end run at the handoff

A trace from an eval run shows the parser unit tests passing and the model-call functional test passing. Each returns the expected shape when tested in isolation. The end-to-end run fails.

Reading down the trace, the failure occurs at the handoff where the retrieval result is passed into the model call.

```text
PASS  test_parser_unit
      parser returns date objects

PASS  test_extract_shape_functional
      model call returns {primary_date, issue}

FAIL  test_full_flow_e2e

  [trace]
  step 1 retrieve(q)        ok   -> 3 chunks (list of dicts)
  step 2 build_prompt(ctx)  ok   -> ctx inserted as raw list
  step 3 model.call(prompt) ok   -> answer ignores the context
  step 4 assert answer...   FAIL -> model answered from memory

  cause:
  retrieve() returns [{"content": ...}],
  build_prompt() expected a plain string,
  so the model received malformed context.
```

Each side was correct in isolation.

- The retrieval function returns a list of chunk dictionaries.
- The prompt builder was written expecting a plain string.

This causes the context to arrive malformed and the model to answer from its own memory instead of the retrieved policy.

The handoff between the two components was never exercised, because no test covered that seam.

This is the failure the integration level exists to catch.

- A unit test cannot identify it, because the unit itself works.
- A functional test cannot identify it, because the call works on a well-formed input.
- Only a test that drives the retrieval-to-model handoff with real retrieved data can raise the mismatch before a user does.

---

## Why this broke

The format contract between the retrieval step and the prompt builder was never defined.

One returned a list of dictionaries, the other expected a plain string, and nothing enforced the boundary between them.

---

## How to prevent it

Add an integration test that drives the two components together with real retrieved data.

A unit test cannot catch this because each component works in isolation.

Only a test that exercises the handoff surfaces the mismatch before a user does.

# Diagnose which test level a failure belongs to

Try it now. Read the trace below, where the end-to-end test fails while every unit test passes. Identify where the break is, name the mechanism, and choose both the targeted fix and the test level that would have caught it from the three options shown.

```text
PASS  test_retrieve_unit
      returns 3 chunks for a known query

PASS  test_model_call_functional
      returns a well-formed answer string

FAIL  test_full_flow_e2e

step 1 retrieve(q)            ok -> [{"content": "..."}, ...]
step 2 build_prompt(chunks)   ok -> chunks placed without .content
step 3 model.call(prompt)     ok -> answer unrelated to the documents
step 4 assert "30 days"       FAIL -> phrase not in answer
```

## Option A: fix the parser

```python
def parse_date(s):
    return dateutil.parse(s)

# already passes its unit test
```

## Option B: fix the prompt wording

```python
prompt = "Answer carefully and cite the policy."

# rewords, ignores the seam
```

## Option C: align the handoff + add an integration test

```python
context = "\n".join(c["content"] for c in chunks)  # extract .content
prompt = build_prompt(question, context)

# new test drives retrieve() -> build_prompt() together on real chunks
```

### Answer Choices

**A**. Fix the parser (dateutil.parse already passes its unit test)

**B**. Fix the prompt wording ("Answer carefully and cite the policy")

**C**. Align the handoff and add an integration test on retrieve() -> build_prompt()

---

# Correct Answer

## ✅ Option C

**Align the handoff and add an integration test on `retrieve() -> build_prompt()`**

---

# Technical Reasoning

## Step-by-step trace analysis

The trace provides the root cause:

```text
step 1 retrieve(q)            ok -> [{"content": "..."}, ...]
step 2 build_prompt(chunks)   ok -> chunks placed without .content
step 3 model.call(prompt)     ok -> answer unrelated to the documents
step 4 assert "30 days"       FAIL -> phrase not in answer
```

The key clue is:

> "chunks placed without .content"

The retrieval component returns a list of dictionaries:

```python
[
  {"content": "..."},
  {"content": "..."},
  {"content": "..."}
]
```

However, the prompt-building step passes the entire list structure directly into the prompt rather than extracting the text content from each chunk.

As a result:

1. Retrieval succeeds.
2. Prompt construction technically succeeds.
3. The model receives malformed or unusable context.
4. The model ignores the retrieved documents.
5. The model responds using generic knowledge or prior training.
6. The expected phrase `"30 days"` never appears.
7. The end-to-end assertion fails.

---

## Why Option A is wrong

### Option A

```python
def parse_date(s):
    return dateutil.parse(s)
```

The parser is unrelated to the observed failure.

Evidence:

```text
PASS test_retrieve_unit
PASS test_model_call_functional
```

The option itself states:

```text
already passes its unit test
```

No date parsing operation appears anywhere in the failing trace.

The failure occurs before parsing is even relevant.

Therefore Option A does not address the root cause.

---

## Why Option B is wrong

### Option B

```python
prompt = "Answer carefully and cite the policy."
```

Changing prompt wording does not solve the underlying issue.

The problem is not instruction quality.

The problem is that the retrieved data never reaches the model in the format expected by the prompt builder.

Even a perfectly engineered prompt cannot compensate for missing or malformed context.

This is a data-flow failure, not a prompt-engineering failure.

Therefore Option B treats the symptom rather than the cause.

---

## Why Option C is correct

### Option C

```python
context = "\n".join(c["content"] for c in chunks)
prompt = build_prompt(question, context)
```

This converts the retrieval output:

```python
[
  {"content": "Refunds are processed within 30 days"},
  {"content": "..."},
  {"content": "..."}
]
```

into:

```text
Refunds are processed within 30 days
...
...
```

which matches the input format the prompt builder expects.

The model now receives the actual retrieved policy text and can ground its response on that information.

Benefits:

- Correctly transforms retrieval output.
- Restores the retrieval-to-prompt contract.
- Allows the model to use retrieved evidence.
- Fixes the root cause rather than masking it.

---

# What Failed?

## Failure Type

**Interface contract mismatch**

Also described as:

- Broken component handoff
- Integration failure
- Data-format mismatch at a seam

The upstream component returns:

```python
List[Dict]
```

while the downstream component expects:

```python
str
```

Both components are individually correct.

The integration between them is incorrect.

---

# Which Test Level Would Have Caught It?

## ✅ Integration Test

An integration test exists specifically to validate the interaction between components.

Example:

```python
chunks = retrieve("refund policy")
prompt = build_prompt(question, chunks)
```

This test immediately exposes the mismatch:

```python
retrieve()
```

returns:

```python
[{"content": "..."}]
```

while:

```python
build_prompt()
```

expects:

```python
"policy text..."
```

This is exactly the seam where the defect occurs.

---

## Why Unit Tests Miss It

Unit tests evaluate each component independently.

```python
retrieve()
```

✅ returns correct chunks

```python
build_prompt()
```

✅ builds valid prompts when given a string

Since the components are never connected during the test, the contract mismatch remains hidden.

---

## Why Functional Tests Miss It

Functional tests verify behavior of a single model call.

Example:

```python
model.call(prompt)
```

✅ returns a valid answer

The model behaves correctly.

The malformed context originates upstream and therefore falls outside the scope of the functional test.

---

## Why End-to-End Tests Detect It But Don't Localize It

An end-to-end test runs the complete workflow:

```text
retrieve -> build_prompt -> model -> assert
```

It detects the failure because the final answer is wrong.

However, the test only shows:

> "the workflow failed"

without necessarily identifying the exact component responsible.

That is why integration tests and traces are valuable.

---

# Root Cause Summary

**Root Cause**

Retrieval returns chunk dictionaries while prompt construction expects extracted text.

**Mechanism**

Broken handoff / interface contract mismatch.

**Targeted Fix**

Extract `chunk["content"]` before passing retrieved information into the prompt builder.

**Test Level That Should Catch It**

Integration testing between:

```text
retrieve() -> build_prompt()
```

because the defect exists at the seam between the two components.

---

# Final Answer

```text
Correct option: C

Failure mechanism:
Interface contract mismatch (broken handoff between components).

Root cause:
retrieve() returns chunk dictionaries, while build_prompt() expects plain text.

Targeted fix:
Extract chunk["content"] and pass normalized text into build_prompt().

Test level that would have caught it:
Integration test.

Why:
Both components pass independently, but the retrieval-to-prompt seam is broken.
```