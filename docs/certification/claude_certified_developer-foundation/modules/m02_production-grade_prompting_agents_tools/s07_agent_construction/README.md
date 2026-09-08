# Building a Production Agent: The Loop, Wiring Paths, Orchestration, and Human-in-the-Loop

An **agent** is a multi-step tool-use loop with:

- Managed context
- Tool execution
- State tracking
- A defined goal

You have already seen the individual building blocks:

- Tool schemas
- Tool-use loops
- Context management
- Extended thinking
- Memory strategies

This section connects those pieces into a production-ready system.

Importantly, many failures only appear when all components interact over multiple turns. Problems that never appear in isolated testing begin to emerge:

- Tool-routing decisions compound over time
- Context fills more quickly than expected
- Earlier tool outputs affect later decisions
- Incorrect intermediate results cascade into downstream failures

Before building any agent, start with a more fundamental question:

> **Does this problem actually require an agent?**

Agents introduce:

- More context consumption
- More orchestration complexity
- More potential failure modes

Choosing the correct pattern is the first design decision.

---

# Workflow or Agent: Decide Before Writing Code

The most common architectural mistake is using an agent when a workflow would suffice.

Workflows and agents solve different problems.

Using the wrong one either:

- Adds unnecessary complexity
- Or creates a system that cannot handle real-world variability

## Decision Matrix

| Choose a Workflow When... | Choose an Agent When... |
|---------------------------|-------------------------|
| You can enumerate all steps in code. | You know the goal and tools but cannot enumerate the exact path. |
| Error costs are significant and require deterministic guardrails. | The path through the work cannot be predefined. |
| Observability through standard application tooling is required. | Some non-determinism is acceptable. |
| Inputs fall into predictable categories. | User inputs vary significantly. |
| Every execution follows the same sequence. | Different situations require different tool sequences. |
| Rules are known ahead of time. | Creative or adaptive tool sequencing is required. |

---

# Core Principle

Start with the simplest pattern that works:

```text
Single API Call
       ↓
Workflow
       ↓
Agent
```

Move upward only when the simpler pattern cannot handle the required variability.

---

# The Agent Pattern Is Constant

Once you've decided an agent is necessary, the core pattern remains the same regardless of implementation.

Every agent performs:

```text
Goal
   ↓
Reason
   ↓
Choose Tool
   ↓
Execute Tool
   ↓
Update Context
   ↓
Continue Until Complete
```

What changes is who owns the infrastructure around the loop.

---

## Wiring Paths: Who Runs the Loop, and What You Take On

The three paths differ in one variable: **how much of the agent's runtime you own**.

The table is ordered from top to bottom by how much infrastructure you hand off.

Choose based on your deployment and compliance constraints. Do not choose solely based on which option is fastest to prototype.

| Path | Raw Messages API Loop | Agent SDK | Claude Managed Agents |
|--------|--------|--------|--------|
| **Who runs the loop** | Your code runs every iteration. You send the request, read the tool-use blocks, execute the tools, and append the results yourself. | The SDK runs the loop inside your own process. It iterates and manages context, and your code still executes the tools the agent calls. | Anthropic runs the loop and the sandbox. Your application sends user events and streams results back over server-sent events. |
| **What you own** | The full loop, tool execution, context management, retries, and exit conditions. Nothing is provided for you. | Tool execution and the surrounding application. The SDK provides the loop structure, context management, and tool registration. | The application layer and the agent definition. You define the model, system prompt, tools, MCP servers, and skills once, then reference the agent by ID across sessions. |
| **Choose this when** | You need full control over each step, you have constraints a library does not accommodate, or you are teaching yourself how the loop works before adding abstraction. | You want the loop, context handling, and tool scaffolding that power Claude Code without rebuilding them, and you want the agent running in your own environment in Python or TypeScript. | You need long-running execution measured in minutes or hours, you want a managed sandbox, or you want to avoid building the loop, the sandbox, and the tool-execution layer entirely. Also available on Claude Platform on AWS with some feature differences. Verify capability parity against your deployment surface before committing. |
| **What to check before committing** | The maintenance cost is yours. Every behavior the SDK would provide automatically, including context management and parallel tool handling, becomes code you must write, test, monitor, and maintain. | Whether filesystem-based features such as **CLAUDE.md** and skills are loaded is controlled by the `settingSources` configuration. Do not rely on defaults. Explicitly set `settingSources` to the sources you intend (for example `["user", "project", "local"]` to mirror Claude Code CLI behavior, or `[]` to run completely isolated with only programmatically supplied configuration). Confirm current default behavior against the Agent SDK documentation at build time. | Sessions are stateful and stored server-side, making them ineligible for **Zero Data Retention (ZDR)** and currently unavailable under a **HIPAA Business Associate Agreement (BAA)**. Managed Agents are currently in public beta and require the `managed-agents-2026-04-01` beta header. Build with a migration plan because behaviors may evolve between releases. |

---

### Summary

| Path | Best For | Trade-Off |
|--------|----------|-----------|
| **Raw Messages API** | Maximum control and custom architecture | Highest implementation and maintenance burden |
| **Agent SDK** | Running agents in your environment with less infrastructure work | Still responsible for tool execution and application logic |
| **Claude Managed Agents** | Long-running agents with managed execution and sandboxing | Server-side state, compliance limitations, and beta platform dependencies |

### Rule of Thumb
1. Start with **Agent SDK** when you want a production-ready loop without building orchestration from scratch.

2. Use **Raw Messages API** when you need complete control over execution, context, and compliance behavior.

3. Use **Claude Managed Agents** when operational simplicity and long-running execution matter more than owning the runtime
---

# Managed Agents: What Changes?

With a raw loop or SDK:

```text
Your Application
        ↓
Runs each iteration
```

With Managed Agents:

```text
Anthropic Infrastructure
        ↓
Runs each iteration
```

Your application sends events and receives agent results.

---
## What You Stop Owning, and What You Take On Instead

This comparison applies specifically to **Claude Managed Agents** and helps clarify what operational responsibilities move from your team to Anthropic, and what new responsibilities remain on your side.

| Category | What You Stop Owning | What You Take On Instead |
|----------|----------------------|--------------------------|
| **Execution & Infrastructure** | The iteration loop, the execution sandbox, the retries inside the loop, and the tool-execution runtime. Anthropic runs all of it server-side. | An agent definition managed as a versioned API resource, plus an application layer that sends events and consumes the streamed results. |
| **Session Duration & State** | Long-running execution management. Sessions can run for minutes or hours without your process holding the loop open. | Server-side session state. Sessions are stateful and stored by Anthropic, and are subject to its data-handling policies and constraints (see the compliance constraints section). |
| **Sandbox Lifecycle** | Sandbox provisioning and teardown for tool execution. | A dependency on the managed sandbox's available tools and its execution model, rather than your own environment. |

---

## Choose Managed Agents When

Use **Claude Managed Agents** when one or more of the following conditions apply:

1. **The task runs for a long time**
   - Execution may last minutes or hours.
   - Keeping your own process responsible for the full loop becomes operationally difficult.

2. **You want a managed sandbox**
   - You would otherwise need to build, secure, monitor, and maintain an execution environment for tool calls.
   - Managed Agents remove much of that infrastructure burden.

3. **You do not want to build the agent runtime**
   - Anthropic handles:
     - Iteration
     - Context management
     - Runtime orchestration
     - Tool-execution infrastructure

   - Your team focuses on:
     - Agent definition
     - Business logic
     - Integrations
     - Application UI and workflows

---

## Key Trade-Off

| Benefit | Trade-Off |
|----------|-----------|
| Managed execution infrastructure | Less control over the runtime environment |
| Long-running sessions without managing the loop yourself | Session state is stored server-side |
| No need to build a sandbox | Dependence on managed sandbox capabilities |
| Reduced operational complexity | Must work within platform capabilities and compliance constraints |

### Summary

```text
Raw Messages API
    ↓ Maximum Control
    ↓ Maximum Ownership

Agent SDK
    ↓ Shared Ownership

Claude Managed Agents
    ↓ Minimum Infrastructure Ownership
    ↓ Maximum Platform Management
```

Managed Agents are generally the best fit when operational simplicity and long-running execution matter more than owning every part of the runtime infrastructure yourself.

---

# When Managed Agents Make Sense

Choose Managed Agents when:

### 1. Tasks Run for a Long Time

Execution measured in:

- Minutes
- Hours

is difficult to manage manually.

---

### 2. You Need a Managed Sandbox

Instead of building:

- Security controls
- Isolation
- Runtime infrastructure

you use Anthropic's managed environment.

---

### 3. You Want Infrastructure Off Your Plate

If you would otherwise build:

- Loop orchestration
- Sandbox execution
- Runtime management

Managed Agents can significantly reduce operational work.

---

# Constraints That Override Convenience

Managed Agents store session state server-side.

As a result:

### Not Appropriate For

- Zero Data Retention (ZDR) workloads
- HIPAA-covered workloads
- Certain regulated environments

For those environments:

✅ Raw loop

✅ Agent SDK

❌ Managed Agents

The compliance requirement determines the architecture before convenience does.

---

# Wiring the Loop: Four Universal Steps

Regardless of implementation path, every agent follows the same structure.

---

## Step 1: Register Tools

Register every tool the agent may use.

Claude cannot call a tool it does not know exists.

Good tool registration includes:

- Name
- Description
- Input schema
- Scope

---

## Step 2: Set the System Prompt

The system prompt should clearly define:

- The task
- Available tools
- Constraints

### Weak Prompt

```text
Help the user.
```

### Strong Prompt

```text
Analyze invoices using the registered accounting tools.
Use only those tools when data verification is required.
```

Narrow prompts generally produce more reliable routing.

---

## Step 3: Handle the Tool-Use Loop

Every `tool_use` issued by Claude must be:

```text
tool_use
      ↓
Run Tool
      ↓
tool_result
```

No exceptions.

Whether the infrastructure loops automatically or manually, your tools must still execute and return results.

---

## Step 4: Define Exit Conditions

Agents require explicit stopping rules.

Without them:

```text
Goal reached?
      ↓
No explicit stopping condition
      ↓
More tool calls
      ↓
More tool calls
      ↓
More tool calls
```

Define what completion means.

Examples:

- Required files generated
- Analysis completed
- User question answered
- Confidence threshold reached

---

## Loop Wiring Checklist: Verify These Regardless of Path

Whether you use the **Raw Messages API**, **Agent SDK**, or **Claude Managed Agents**, the following checks should be completed before the agent is considered production-ready.

| # | Item | What to Verify |
|---|------|----------------|
| **1** | **Tools registered** | Every tool the agent may need is included in the registration list. No unregistered tools are referenced in the system prompt. |
| **2** | **System prompt scoped** | The system prompt explicitly names the task and the available tools. It does not describe tools the agent does not have, and it does not omit tools that require task-specific guidance. |
| **3** | **Tool-use loop implemented** | Your code handles every `tool_use` block Claude issues and returns a corresponding `tool_result` block before the next assistant turn. All tool-use blocks from a single assistant turn must be resolved together. |
| **4** | **HITL insertion point defined** | At least one Human-in-the-Loop (HITL) checkpoint exists within the workflow. Define where execution pauses for human review before deployment. |
| **5** | **Exit conditions defined** | The loop has a clear stopping criterion that does not rely on Claude deciding to stop on its own. The completion condition should be explicitly implemented in application logic. |

---

### Why These Checks Matter

| Area | Common Failure if Missing |
|--------|--------------------------|
| Tools Registered | Claude attempts to solve tasks without the necessary capabilities. |
| System Prompt Scoped | Tool routing becomes inconsistent and agent behavior drifts. |
| Tool-Use Loop Implemented | Tool calls remain unresolved, causing workflow failures. |
| HITL Defined | High-risk actions execute without human oversight. |
| Exit Conditions Defined | Agents continue making tool calls after the objective has already been achieved. |

### Rule of Thumb

Before deploying an agent, verify:

```text
Tools
   ✓
System Prompt
   ✓
Tool Loop
   ✓
Human Checkpoint
   ✓
Exit Conditions
   ✓
```

If any item is missing, the agent may appear functional during testing but fail unpredictably in production.

---

# Human-in-the-Loop (HITL)

Human-in-the-Loop checkpoints pause execution and require human approval before continuing.

The placement depends on one question:

> What is the worst possible outcome if the agent proceeds unchecked?

---
## Human-in-the-Loop (HITL): Insertion Points and Risk Levels

A human-in-the-loop (HITL) checkpoint pauses agent execution and routes the workflow to a human reviewer before continuing.

The key question is:

> What is the worst possible outcome if the agent executes this step without human review?

| Insertion Point | What Triggers the Check | Risk Level It Addresses |
|----------------|------------------------|--------------------------|
| **Before a destructive tool call** | The agent is about to execute a write, delete, modify, or send operation. | **High:** Irreversible actions where a wrong call cannot be undone. |
| **After a planning step** | The agent has generated a plan and is about to begin executing it. | **Medium:** Incorrect plans that would produce the wrong outcome even if every step executes successfully. |
| **On unexpected output** | A tool result contains an error flag, an empty result, or a value outside expected bounds. | **Variable:** Catches failure modes that retry logic alone will not resolve. |

---

### Practical Examples

| Scenario | Recommended HITL Point | Why |
|-----------|------------------------|-----|
| Deleting records from a database | **Before a destructive tool call** | Mistakes may be permanent. |
| Sending customer communications | **Before a destructive tool call** | Incorrect messages may have operational or legal consequences. |
| Executing a generated migration plan | **After a planning step** | Validate the strategy before committing resources. |
| Running infrastructure changes | **After a planning step** | Ensures the execution path is correct before action begins. |
| Tool returns unexpected or empty results | **On unexpected output** | Human review can determine whether to retry, stop, or adjust the workflow. |
| Financial calculations produce out-of-range values | **On unexpected output** | Prevents downstream actions based on potentially invalid inputs. |

### Key Takeaway

The safest place to insert HITL review is immediately before the point where mistakes become expensive:

- **High-risk actions** → Review before execution.
- **Complex plans** → Review before implementation.
- **Unexpected results** → Review before continuing.

A well-designed production agent does not rely solely on model reasoning. It strategically inserts human review at points where automation risk exceeds the cost of human oversight.
---

## Example

```text
Generate Plan
       ↓
Human Review
       ↓
Approve
       ↓
Begin Execution
```

or

```text
Delete Records
       ↓
Human Approval
       ↓
Execute
```

---

# Tool Orchestration: Over-Tooling vs Under-Tooling

The quality of routing depends on:

1. Tool descriptions
2. Number of registered tools

---

## Over-Tooling

Most common production problem.

Teams register:

```text
Every possible tool
```

just in case.

Result:

- Routing confusion
- Increased context cost
- Lower selection accuracy

---

## Under-Tooling

Too few tools force Claude to:

- Guess
- Work around limitations
- Return incomplete results

---
## When Agents Are the Right Call

| When Agents Are the Right Call | What You Take On When You Use an Agent | When to Choose a Workflow Instead |
|--------------------------------|----------------------------------------|-----------------------------------|
| Goal-directed tasks where the exact path cannot be enumerated in advance. Handling variable inputs that would require dozens of conditional branches in a workflow. | Agents add behavioral complexity: the path through the task emerges from the model's reasoning over accumulated context rather than from explicit branching logic in your code. Observability often requires transcript-level tooling rather than standard operational logging. | When you can enumerate the steps in code, use a workflow. Agents are the last step in progression. Start with the simplest pattern that solves the problem: a single API call, then a workflow, then an agent. Move up only when the simpler pattern cannot handle the variability the task requires. |

### Key Takeaway

```text
Single API Call
       ↓
Workflow
       ↓
Agent
```

Use an **agent** only when:

- The goal is known but the path is not.
- Inputs vary significantly.
- Tool sequencing must be decided dynamically.
- Fixed branching logic becomes impractical.

Use a **workflow** when:

- The execution path is known.
- Steps can be explicitly coded.
- Determinism and predictability are important.
- Standard monitoring and operational tooling are sufficient.
---

## Recommended Approach

Start with:

```text
Minimum viable toolset
```

Add tools only when evaluations demonstrate a real capability gap.

---


# Regulated Data Constraints

In production environments, compliance requirements often determine implementation choices before technical considerations do.

The constraint influences:

- Endpoint selection
- Credentials
- Logging
- Storage
- Region selection

before prompts and tools are even discussed.

---

## Regulated Data Constraints: What Usually Gets Ruled Out vs. What Survives Review

| Constraint | What It Tends to Rule Out in Code | What Usually Survives a Code Review |
|------------|-----------------------------------|------------------------------------|
| **Attorney-client privilege** | Calls from consumer-grade Claude.ai surfaces that the firm cannot audit end-to-end. Code paths that send privileged document content to any endpoint the firm has not approved for privileged material, regardless of how prompts or system messages are structured. | Direct API or SDK calls from inside the firm's own application, authenticated via SSO and routed through a firm-approved LLM gateway with full request and response logging. Tool calls and tool results stay inside the audited path. Organizations should implement conversation logging in the application layer and route it to an approved log destination. |
| **HIPAA (PHI handling)** | Code that sends Protected Health Information (PHI) to any endpoint or delivery route not covered by a Business Associate Agreement (BAA) for the specific configuration in use. This includes any logging or retention path not scoped under the same BAA. | Direct API or SDK calls on a BAA-covered configuration, or cloud-mediated routes through AWS Bedrock or Google Vertex AI using HIPAA-eligible cloud environments. Verify covered configurations and feature eligibility before deployment. |
| **GDPR and data residency** | Delivery routes where model-execution regions cannot be pinned, or where requests may be processed outside an approved geographic boundary. Using a global endpoint without explicit regional controls is the common failure pattern. | Cloud-mediated routes such as AWS Bedrock or Vertex AI configured with a specific approved region. Where regional residency is required, deployment and routing must remain inside that jurisdiction. |
| **FedRAMP and government** | Any code path that calls endpoints outside authorized government cloud environments. This includes development or test environments that use commercial endpoints while production uses regulated ones. | Authorized deployment paths such as Claude for Government (C4G), Amazon Bedrock GovCloud, or Vertex AI Assured Workloads. Verify current authorization status before implementation. |
| **Internal data-residency policy** | SDK clients or cloud providers that are not on the organization's approved-vendor list, even if they are technically capable of supporting the workload. Procurement and governance requirements override engineering preferences. | Deployment through the organization's approved cloud vendor and endpoint configuration. Build against the approved route from the start rather than switching platforms later in the project. |

### Notes

- These constraints determine **endpoint selection, credential configuration, logging requirements, region selection, and deployment architecture** before prompt design, tooling, memory, or agent orchestration decisions are made.
- **SOC 2** is not included in this table because it primarily governs organizational security and operational controls rather than endpoint selection.
- Always verify current compliance, authorization, residency, and feature-support requirements against official documentation and organizational policies at build time.

---

# Agent Design Summary

## Agents Are Best For

✅ Goal-driven work

✅ Variable inputs

✅ Unknown execution paths

✅ Multi-tool planning

✅ Adaptive workflows

---

## Workflows Are Best For

✅ Fixed sequences

✅ Deterministic operations

✅ Strong operational control

✅ Low-complexity automation

✅ Predictable inputs

---

# Key Takeaways

1. Decide whether you need an agent before building one.
2. Workflows are simpler and should be preferred when possible.
3. Every agent follows the same four-step loop: register tools, define prompts, execute tool calls, and enforce exit conditions.
4. Raw loops, SDKs, and Managed Agents differ primarily in who owns the infrastructure.
5. Managed Agents reduce operational burden but introduce compliance considerations.
6. Human-in-the-loop checkpoints should be placed where mistakes become expensive or irreversible.
7. Over-tooling is more common than under-tooling and often harms routing quality.
8. Regulatory requirements frequently determine architecture before implementation begins.
9. The best production agents are intentionally constrained, observable, and built around clear stopping conditions.

# The agent that edited a production file

## Setup

*The agent works end-to-end in testing because your test environment is forgiving, but production is not. The agent has the same tools, the same loop, and the same system prompt, but the HITL checkpoint is missing because testing never surfaced a use case where it was needed.*

### A file-editing agent, tested in a scratch directory, deployed to a customer environment

A developer built an agent that could read, modify, and write configuration files. The system prompt gave it access to three tools, including `read_file`, `write_file`, and `validate_config`. The agent's loop was straightforward. After each write, it would re-run `validate_config`, and if the config still failed validation, the agent would adjust its edit and write again, up to a cap of ten iterations before stopping. The agent was tested against a scratch directory with a copy of the target config. It worked correctly on every test case, typically converging on a valid config in two or three iterations.

When deployed to a customer environment, the agent correctly identified that a configuration parameter was out of range. It proposed a correction, called `write_file`, re-ran `validate_config`, and got back a pass. The loop terminated cleanly after a single iteration, exactly as designed. The ten-iteration cap was never reached because it was never needed. The loop design was correct, but the exit condition was the problem.

The parameter the agent corrected was a rate limit that the customer's application relied on. `validate_config` checked that the value was within the schema's allowed range, which it now was. What `validate_config` did not check, and was never designed to check, was whether downstream systems depended on the old value. Within minutes of the write, the customer's application started failing because requests were being throttled at a rate it was not built to handle.

The agent's loop did exactly what the developer asked it to do. It edited, validated, and exited when validation passed. The failure was not in the loop. The failure was that the loop's exit condition (`validate_config` returns pass) was scoped to the file the agent was editing, and there was no checkpoint between "validation passed on this file" and "write committed to the customer environment." The missing piece was a checkpoint in the loop design: before the first `write_file` call hit the live customer config, pause and surface the proposed change for human review. In practice this means the loop needs an explicit branch between 'proposed change ready' and 'write committed', a state the developer never added because tests never produced a case that required it.

## What to Watch Out for

The pattern this incident illustrates is a permissions question that never got asked during design. The agent had write access because the task involved file editing, and the task itself was legitimate. What the team missed was the gap between an agent that proposes a change and one that commits it. In a disposable test environment, that gap never surfaces because nothing a "wrong write" touches matters in testing, but production is different.

The design question that was never asked:

> "What is the worst outcome if `write_file` runs without a human check?"

The answer to that question determines whether a human-in-the-loop checkpoint is required before the tool can execute.

If a tool can take an irreversible action in production, it needs a checkpoint before it runs. Register that constraint during design, when you're scoping the tool surface, not after the first incident occurs.



# Complete the agent wiring

The partial agent implementation below has two gaps. Write the missing content for each gap: (1) the description for update_record, and (2) the HITL checkpoint code.

```python
tools = [
  {
    "name": "read_record",
    "description": "Use this to read a customer record by customer_id.",
    "input_schema": {
      "type": "object",
      "properties": {
        "customer_id": {"type": "string"}
      },
      "required": ["customer_id"]
    }
  },
  {
    "name": "update_record",
    "description": [BLANK, write the description for this tool],
    "input_schema": {
      "type": "object",
      "properties": {
        "customer_id": {"type": "string"},
        "field": {"type": "string"},
        "new_value": {"type": "string"}
      },
      "required": ["customer_id", "field", "new_value"]
    }
  }
]

def run_agent_loop(user_request):
    messages = [{"role": "user", "content": user_request}]

    while True:
        response = client.messages.create(
            model=model, max_tokens=4096,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            return response

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":

                    [BLANK, insert HITL checkpoint before executing update_record]

                    result = execute_tool(block.name, block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result
                    })

            messages.append({"role": "user", "content": tool_results})
```

# Question

## Complete the agent checkpoint

This part of the agent implementation is missing logic. Write the missing content in each gap.

The scenario: an agent proposes a configuration change and must require a human review before committing the change to a production environment.

### Gap 1

Add a checkpoint that surfaces the proposed change for human approval before any write occurs.

### Gap 2

Add a branch that only allows the write operation to execute if the human reviewer approves the change.

---

# Complete the agent checkpoint

This part of the agent implementation is missing logic. Write the missing content in each gap. Fill the descriptions for `update_record` and `gap_1`. Fill in the code for `gap_2`.

---

## Gap 1

### Description for `update_record`

Use this to update a specific field on a customer record. Only call this tool after a `read_record` call has confirmed the current value and the proposed change has been reviewed. Do not use this for bulk updates or schema changes.

The restrictive description tells the agent when not to call the tool, what must be true before it is called, and what it should never be used for, in language the model can route on. A bare description would let the agent call `update_record` whenever it inferred an update was needed, including before reading the current value or on fields the operator did not intend to change.

---

## Gap 2

### HITL checkpoint code

```python
if block.type == "tool_use":
    if block.name == "update_record":
        print(
            f"Proposed update, customer_id: {block.input['customer_id']}, "
            f"field: {block.input['field']}, new_value: {block.input['new_value']}"
        )
        approval = input(
            "Approve this update? (yes/no): "
        ).strip().lower()

        if approval != "yes":
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": "Update rejected by operator."
            })
            continue

    result = execute_tool(block.name, block.input)
```

The checkpoint sits inside the loop and gates on the tool name, so `read_record` calls pass through unchanged and `update_record` calls pause for explicit approval. A single up-front approval cannot gate a specific update the model has not yet proposed. Approving after `execute_tool` has run means the irreversible work is already done.