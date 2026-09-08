## Key takeaways

### 1. Set the standard before you build it.

An eval turns "done" from a feeling into a score on a fixed set of cases. The grading method must match the output:

- Exact match when there is one correct form
- A code check for structured output
- A judge for open-ended quality

Calibrate judges against human-labeled cases before trusting them. Write the eval first because identifying the expected behavior forces you to define success while the design can still change.

### 2. Match the test to the failure, and trace so you know where it happened.

Unit, functional, integration, and end-to-end tests each catch a different type of break. Most silent failures hide at the integration seam where two passing components hand off work.

A trace shows which step produced the bad result, turning a day of investigation into a short fix.

The same principle applies to retrieval:

- Fetch once for single-fact lookups
- Search across iterations when the question is genuinely multi-step

### 3. Sort every failure, then handle them individually.

The first question for any failure is whether waiting and retrying could resolve the issue.

Retriable failures should use:

- Exponential backoff
- A maximum retry cap
- A retry budget

Never use an immediate retry loop, which only amplifies the problem.

Tool failures should be returned to the model with the error flag set, rather than hidden behind an empty result that could be mistaken for valid data.

Every non-retriable failure requires a named fallback. Otherwise, an unhandled exception becomes the default behavior, which is how one bad response can take down the entire flow.

### 4. Measure cost and latency per call, and fan out only when a task truly splits.

You cannot budget what you do not measure.

Instrument the following for every call:

- Token cost
- Latency
- Error rate

Then tune a chosen lever instead of guessing from the invoice.

An orchestrator-worker pattern multiplies token cost by the number of subagents, approximately 15× in Anthropic's reported case. That cost is justified only when work naturally splits into independent parallel tasks, not when a single agent can complete tightly coupled work at a fraction of the cost.

### 5. Treat fetched content as data and enforce the boundary with a hook.

A model reads everything in its context as a single stream of tokens. There is no built-in boundary between trusted instructions and untrusted data.

An instruction hidden inside fetched content can influence agent behavior.

Trusting users is insufficient because the injection may arrive through content the agent reads.

Recommended practices:

- Treat untrusted input as data
- Apply least-privilege principles to agent identity
- Keep secrets out of committed configuration
- Enforce an action boundary with a hook that blocks and logs activity before tool execution

That boundary is the control point that regulated reviews can inspect and validate.

---

## What comes next

The next module focuses on turning production-ready systems into reusable accelerators and contributed intellectual property.

Topics include:

- Packaging a working build as a parameterized template
- Creating an MCP server
- Building a portable eval suite
- Contributing through channels accepted by maintainers
- Choosing, version-pinning, and securing deployment environments

The module also examines deployment across:

- First-party APIs
- Amazon Bedrock
- Google Vertex AI

The goal is to ensure that model updates or residency reviews do not disrupt production systems.

Deployment platform specifics, intentionally deferred in this module, are covered in the next module.

---

## Anthropic public references (time-sensitive)

| ID | Source | Type | Used for |
|----|--------|------|----------|
| S1 | <https://platform.claude.com/docs> | Product documentation | Eval tooling and grading methods, test levels, API error and status codes, retry and backoff guidance, tool-result error flag, observability and prompt caching, IAM and prompt-injection defenses |
| S2 | <https://code.claude.com/> | Product documentation | Claude Code hook lifecycle events (PreToolUse) and guardrail patterns |
| S3 | Anthropic research and engineering publications (<https://anthropic.com/>) | Engineering and research writing | Orchestrator-worker pattern and its roughly 15× token cost, agentic search versus RAG, Claude Code retrieval findings, and prompt-injection defenses |
| S4 | *Building with the Claude API* (Skilljar) | Anthropic course | Eval pipelines, code and model graders, RAG and retrieval mechanics, workflow patterns, and prompt caching |
| S5 | *Claude Code 101 In Action* (Skilljar) | Anthropic course | Claude Code hooks and configuration concepts continued from the previous module |

---

You can now prove that a Claude feature holds up under production traffic.

**Evals, tests, and traces; failure handling; cost and orchestration discipline; and a security boundary.** Each layer closes a gap where development environments can hide issues that production environments reveal.

# Key terms from this module

## Agentic search

Letting the model issue its own queries, read results, and refine its search across several rounds instead of retrieving a fixed context once.

**Characteristics:**
- Handles multi-step and exploratory questions
- Adapts to changing information sources
- Avoids maintaining a separate retrieval index
- Increases token usage and latency compared to simple retrieval

---

## Eval

A collection of input cases, expected behaviors, and grading criteria that defines what a feature must accomplish before release.

**Purpose:**
- Measures performance on a holdout test set
- Turns subjective judgments of "done" into measurable scores
- Enables comparison across prompt, tool, or model changes

---

## Exponential backoff

A retry strategy that increases the waiting period between retry attempts, usually up to a maximum limit and with a fixed retry count.

**Common features:**
- Growing delay between retries
- Maximum wait cap
- Retry budget or attempt limit
- Random jitter to avoid synchronized retries
- Respects `Retry-After` headers when provided

**Benefit:** Prevents retry storms that worsen rate limits or service overload.

---

## Hook-based guardrail

A control that executes at a specific point in the Claude Code lifecycle, such as `PreToolUse` before a tool call.

**Capabilities:**
- Validate requests before execution
- Block prohibited actions
- Log attempted actions for auditing

Unlike prompt instructions, hooks are **enforced controls** that execute before the protected action occurs, making them suitable for compliance and regulated environments.

---

## Integration test

A test focused on the boundary between two or more components.

**Example:**
- Retrieval system produces context
- Model consumes that context
- Test verifies the handoff works correctly

Integration tests detect failures that unit or functional tests can miss because individual components may behave correctly while their interaction does not.

---

## LLM-as-judge

A grading approach that uses a separate model and scoring rubric to evaluate open-ended outputs.

**Outputs:**
- Numerical score
- Structured reasoning or justification

**Important:** Results should be calibrated against human-labeled examples and agreement should be measured before relying on the judge in production.

---

## Orchestrator-worker pattern

A multi-agent architecture in which:

1. An orchestrator plans the work.
2. Multiple worker agents execute subtasks in parallel.
3. The orchestrator combines the results.

**Best for:**
- Large tasks that naturally divide into independent parts
- Parallelizable workflows

**Tradeoff:** Anthropic reports that this approach can consume roughly **15×** the tokens of a single-chat solution, so it should be used only when task decomposition provides meaningful benefits.

---

## Prompt injection

An attack where instructions hidden inside retrieved content are interpreted as commands.

**Why it happens:**
- Models read all context as a single token stream.
- There is no built-in distinction between trusted instructions and untrusted content.

**Defenses:**
- Treat retrieved content as data, not instructions
- Apply least-privilege permissions
- Enforce controls outside the prompt
- Use hooks or approval boundaries before tool execution

---

## Retriable vs. terminal error

A fundamental production distinction for handling failures.

### Retriable error
An error likely to succeed if attempted later.

**Examples:**
- Rate limiting
- Temporary overload
- Transient network issues

**Response:**
- Retry with exponential backoff

### Terminal error
An error that will continue to fail until something changes.

**Examples:**
- Invalid request format
- Missing required parameters
- Authentication misconfiguration

**Response:**
- Fail fast
- Surface the error
- Avoid wasting retry budget

---

### Summary

| Term | Core Idea |
|--------|----------|
| Agentic search | Multi-step, model-directed retrieval |
| Eval | Measurable definition of success |
| Exponential backoff | Safe retry strategy with increasing delays |
| Hook-based guardrail | Enforced pre-action control |
| Integration test | Validates component handoffs |
| LLM-as-judge | Model-based grading for open-ended outputs |
| Orchestrator-worker pattern | Parallel multi-agent execution |
| Prompt injection | Untrusted content acting as instructions |
| Retriable vs. terminal error | Distinguishing retryable and permanent failures |