# Eight takeaways, one per enabling objective

## 1. When a prompt fails, the failure type tells you which technique is missing.

Output in the wrong shape points to a missing output constraint, drift across turns points to an underspecified system prompt, and a hallucinated structure points to the absence of few-shot examples.

The instinct to reword the instruction and try again rarely works, because none of those failures are phrasing problems.

Diagnose the failure type first, then add the technique that addresses it.

When prompt-level instructions are not enough because untested inputs still break the parser, move output control into the API with structured outputs:

- JSON outputs constrain the final response against a schema.
- Strict tool use validates the arguments Claude passes to your tools.

Tradeoffs:

- First-call compilation latency
- Additional input token consumption

### Key Learning

> Most prompt failures are not wording failures. They are missing-control failures.

---

## 2. Match the reasoning depth to the task before you tune the prompt.

Enable reasoning only where a reasoning pass changes the answer.

Calibrate the effort setting to the problem rather than raising it on every call.

Remember that thinking blocks return to the API unchanged or the next request fails.

Choosing which model to run, as distinct from whether to enable reasoning, is taught in the MSO Foundations module that precedes this one.

### Key Learning

> Use reasoning intentionally. More reasoning is not automatically better.

---

## 3. A stream ending is not a message completing.

Streaming improves perceived latency but requires assembling responses from partial events.

Best practices:

- Act on a block only after the block closes.
- Commit a turn to conversation history only after `message_stop`.
- On interrupted streams, discard the partial turn and retry.

Common failure mode:

A tool-use error appears on retry and seems related to the schema. The actual cause is frequently a half-built block created by a dropped stream.

### Key Learning

> Never treat a partial stream as a completed response.

---

## 4. Every wrong-tool selection traces back to the schema, and most of the time to the description.

Claude chooses tools primarily by reading the `description` field.

If two tools are described similarly, Claude cannot reliably distinguish them.

Example:

Bad descriptions:

- "Use this to find information."
- "Use this to find information."

From Claude's perspective, both tools appear equivalent.

The most effective schema improvement is adding an exclusion condition.

Example:

> Use this tool to query customer records. Do not use this tool for product documentation searches.

Write exclusion rules into the schema before deployment rather than waiting for errors to appear in logs.

When tools already exist elsewhere, MCP (Model Context Protocol) allows you to connect maintained servers instead of authoring every schema manually.

However:

- Every connected MCP server contributes tool definitions to the context window.
- Tool definitions increase context size even when tools are not invoked.

### Key Learning

> Tool descriptions and exclusions drive tool selection quality.

---

## 5. Context is a fixed budget, and tool outputs spend it faster than anything else in the loop.

Production tool outputs are frequently:

- 3× to 5× larger than development fixtures
- More variable than test data
- More expensive than expected

As a result:

- A workflow that survives 50 turns during testing may fail around turn 8 in production.

Techniques for recovering context budget:

### Pruning

Remove information that is no longer needed.

### Compaction

Summarize existing context into smaller representations.

### Subagent handoffs

Delegate work and transfer only the information that must survive.

If tool selection quality consistently degrades after a predictable number of turns:

1. Check context size first.
2. Investigate schema quality second.

### Key Learning

> Context exhaustion often masquerades as tool-selection problems.

---

## 6. The workflow-or-agent decision sets the cost of everything that follows, and human checkpoints belong in the design.

Use a workflow when:

- The exact steps are known.
- The procedure can be coded deterministically.

Use an agent when:

- The goal is known.
- Available tools are known.
- The path cannot be predetermined.

Choosing incorrectly creates production issues:

### Agent instead of workflow

Problems:

- Higher context cost
- Less predictable behavior
- Logic hidden inside transcripts

### Workflow instead of agent

Problems:

- Brittle execution paths
- Failure on unexpected inputs
- Poor adaptability

Human approval checkpoints should be designed before deployment.

Particularly important for:

- Customer-facing writes
- Data modification
- Irreversible actions
- External system updates

### Key Learning

> Human review belongs in the architecture, not the incident response plan.

---

## 7. Memory scope is decided by the shape of the session, not by what is easiest to implement.

### In-context memory

Advantages:

- Simple implementation
- No external storage

Limitations:

- State disappears when context disappears
- Does not scale to many sessions

### External memory

Advantages:

- State survives across sessions
- Better long-term continuity

Tradeoffs:

- Additional infrastructure
- Additional latency

### Summarized memory

Advantages:

- Lower storage cost
- Smaller context footprint

Tradeoffs:

- Information loss
- Dependent on summary quality

### Stateless systems

Best for:

- Short-lived jobs
- Single execution workflows
- Independent requests

A separate concept is carrying reusable instructions across tasks.

The preferred solution is a **Skill**:

- Stored as markdown
- Loaded when needed
- Matched through descriptions
- Avoids injecting the same instructions into every session

### Key Learning

> Memory design should follow session patterns, not implementation convenience.

---

## 8. Calculate the cost of a multimodal input before you write the ingestion code and match the API to the workload.

Visual token cost is determined by:

```text
⌈width / 28⌉ × ⌈height / 28⌉
```

Image cost depends on:

- Resolution
- Model tier
- Number of images

A production image may cost many times more than the small test images used during development.

Always estimate cost using your largest expected production inputs.

### Selecting the right ingestion method

#### Inline Base64

Best for:

- One-off images
- Single-use uploads

#### Files API

Best for:

- Assets reused across requests
- Shared images or PDFs
- Reference documents

#### Message Batches API

Best for:

- Offline processing
- High-volume workloads
- Lower per-token cost

Tradeoff:

- Non-deterministic latency

The important mistake to avoid:

> Calling the synchronous API in a loop is not batching.

### Key Learning

> Choose the API based on workload characteristics, not implementation convenience.

---

# What comes next

This module established the Developer primitive library, including the five interaction types that all subsequent Developer modules build upon.

Core foundations introduced include:

- Prompt engineering
- Structured outputs
- Tool schemas
- Context engineering
- Agent design
- Memory scoping
- Multimodal ingestion
- Streaming architectures
- Workflow design

These patterns form the basis of every advanced module that follows.

---

# Sources

1. **Claude 101 (Skilljar)**  
   Prompting foundations, tool-use basics, agents and workflows overview, context window concepts.

2. **Claude Code 101 In Action (Skilljar)**  
   Context management (`/compact`, `/clear`), Claude Code agent loops, production agent patterns.

3. **AI Fluency Framework Foundations (Skilljar)**  
   Prompting techniques, few-shot examples, constraint specification.

4. **Building with the Claude API (Skilljar)**  
   Tool schemas, message structures, streaming, structured outputs, Files API, Message Batches API, agent orchestration.

5. **https://platform.claude.com/**  
   Canonical reference for tools, agents, context windows, MCP, and API mechanics.

6. **Anthropic Blog: Building Effective Agents**  
   Workflow patterns including chaining, routing, parallelization, evaluator-optimizer structures, and agent design guidance.

---

# Final Production Readiness Checklist

✅ Production-ready prompting

✅ Structured outputs and schema validation

✅ Correct reasoning configuration

✅ Reliable streaming implementation

✅ Well-designed tool schemas

✅ Context window management

✅ Workflow vs. agent selection

✅ Human approval checkpoints

✅ Memory architecture planning

✅ Multimodal ingestion strategy

✅ Files API reuse patterns

✅ Batch-processing design

✅ Scalable production agent loops

You can now take a Claude prototype into production.

Production-ready prompts, tool-use loops, streaming pipelines, context management, memory strategies, multimodal ingestion, and checkpointed agent workflows should now remain stable under real-world usage rather than only under development-time testing.


# Key terms from this module

Alphabetical. Click a term to expand its definition.

## Claude Agent SDK

A managed agent runtime distributed as `@anthropic-ai/claude-agent-sdk` (Typescript) / `claude-agent-sdk` (Python). It gives a partner programmatic access to the same agent loop that powers Claude Code: iteration, tool execution, observation, termination, so the partner can embed an agent inside their own product instead of running Claude Code in a terminal. Distinct from the Anthropic SDK, which is a thin convenience wrapper over the API and does not run an agent loop.

## Context Window

The total number of tokens a model can process in a single request, including the system prompt, conversation history, tool definitions, tool results, and the model's own output. When the running total reaches the limit, earlier content must be removed or summarized before new content can be added.

## Function signature

Function signature is a programming term that means the declaration of a function: its name plus the list of parameters it accepts, including their names, types, and any default values.

## HITL

Human-in-the-loop refers to inserting a human review or approval step into an automated process before consequential action is taken.

## Refactor

Refactor refers to changing the internal structure of code without changing what it does from the outside. You reorganize, rename, or rewrite the implementation to make it cleaner, faster, easier to test, or easier to extend, but the behavior the rest of the system sees stays the same.

## SOC 2

Service Organization Control 2 is an audit framework developed by the American Institute of Certified Public Accountants (AICPA) for evaluating how a service organization handles customer data. It is the standard most commonly cited when a SaaS vendor or cloud service provider is asked to demonstrate that their security practices meet a recognized bar.

## State

State is the information an agent carries between turns: the conversation so far, what the user asked for, results from earlier tool calls.

## Stop_reason

A field in the API response that tells your code why the model stopped generating. The two values most relevant to agentic loops are `end_turn`, which means Claude has finished and is not requesting any further action, and `tool_use`, which means Claude has issued one or more `tool_use` blocks and is waiting for results before continuing.

## Subagent

A separate agent instance spun up by an orchestrating agent to handle a discrete subtask. Subagents do not inherit conversation history, skills, or context from the parent session, each starts clean and must be configured explicitly with the instructions and tools it needs. Results are returned to the orchestrator, which incorporates them into the broader task.

## Token

The unit Claude uses to measure and process text. The characters-per-token average depends on the tokenizer of the model at hand and differs between model generations. Treat any chars-per-token rule of thumb as model-dependent and confirm current tokenizer behavior at build time. Tokens are consumed by everything in the context window: prompts, responses, tool schemas, and tool results. They are the basis for both pricing and context budget calculations.

## Tool_use_block

A content block returned by the assistant when Claude wants to call a function. Contains the tool name, a unique ID, and the input arguments Claude wants passed to your code. Every `tool_use` block must be answered by a matching `tool_result` block in the immediately following user turn, with the same ID preserved exactly.

---
