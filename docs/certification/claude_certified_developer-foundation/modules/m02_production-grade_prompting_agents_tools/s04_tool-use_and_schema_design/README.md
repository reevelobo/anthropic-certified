# Tool Schemas Claude Selects Correctly: Definition, Loop, and Calling Patterns

Up to this point, prompt engineering has focused on shaping Claude's outputs. Tool use introduces a different challenge: Claude is no longer generating an answer directly. Instead, Claude must choose the correct action from a set of available tools.

Whether Claude chooses the right tool depends primarily on the quality of the tool schema you provide.

---
# How the Tool-Use Loop Works

One of the most common misconceptions about tool use is that Claude runs the tools itself.

It does not.

Instead, Claude:

1. Reads your tool definitions.
2. Chooses the tool that best fits the request.
3. Returns a tool call and the required arguments.
4. Waits for your application to execute the tool.
5. Receives the tool result.
6. Continues reasoning using that result.

Your application is responsible for executing tools. Claude is responsible for deciding *which* tool to call and *what inputs* should be provided.

This distinction is important because most production tool-use bugs occur at the boundary between what Claude owns and what application code owns.

If your application fails to return the result correctly, Claude never receives the information it requested and the tool-use loop breaks.

---

## Tool-Use Sequence

| Step | Stage | What Happens |
|--------|---------|-------------|
| **1** | Define Schema | You define the tool's name, description, and input schema. Claude uses this information to decide whether and when the tool should be called. |
| **2** | Send Message | Your application sends a request containing both the user's message and the available tool definitions. |
| **3** | tool_use Block | Claude selects a tool and returns a `tool_use` block containing the tool name, unique ID, and input arguments. The response includes `stop_reason: tool_use`. |
| **4** | Execute Tool | Your application executes the tool using the arguments provided by Claude. Claude is not waiting on an open connection; the assistant turn has already ended. |
| **5** | Return Result | Your application sends a new API request containing a `tool_result` block that references the original `tool_use` ID and includes the tool output. |
| **6** | Claude Continues | Claude uses the returned result as context and either generates another tool call or returns a final answer. |

---

## Step 1: Define Schema

You define a schema consisting of:

- A tool name
- A tool description
- An input schema

Claude reads this definition to determine:

- Whether the tool is relevant
- When it should be called
- Which inputs are required

### Example Responsibilities

**You define:**

- Name
- Description
- Parameters

**Claude decides:**

- Whether to call the tool
- When to call it
- What inputs to pass

> If incorrect tool selection happens consistently, the problem is usually in the schema design rather than elsewhere in the loop.

---

## Step 2: Send Message

Your application sends a request containing:

- The user's message
- The tool definitions

Example flow:

```text
User asks a question
        ↓
Application sends tools + message
        ↓
Claude evaluates available tools
```

Claude now decides whether:

- It can answer directly
- A tool is required

---

## Step 3: tool_use Block

If Claude determines that a tool is needed, it ends its turn by returning a `tool_use` block.

The block contains:

- Tool name
- Unique tool-use ID
- Input arguments

The response also includes:

```text
stop_reason: tool_use
```

This indicates that Claude requires the application to take action before the conversation can continue.

Example:

```text
tool_use
├── id: toolu_123
├── name: get_account_balance
└── input:
    └── account_id: 12345
```

At this point Claude has finished its turn.

---

## Step 4: Execute Tool

Your application receives the tool request and executes the corresponding function.

Important:

- Claude is not holding a connection open.
- Claude is not running in the background.
- Claude is not waiting for your server.

The assistant turn has already ended.

The model is stateless between API calls.

The application must:

1. Run the tool.
2. Collect the result.
3. Create a new API request.

Example:

```text
tool_use received
        ↓
Run function
        ↓
Get tool result
        ↓
Send new request
```

---

## Step 5: Return Result

The application creates a `tool_result` block.

This block must reference the original tool-use ID.

Example:

```text
tool_result
├── tool_use_id: toolu_123
└── content:
    └── Balance: $87.24
```

The ID must match exactly.

This pairing is how Claude associates a result with the request that produced it.

---

## Step 6: Claude Continues

Once the tool result is returned:

1. Claude receives the tool output.
2. Claude adds the result to the conversation context.
3. Claude decides what to do next.

Possible outcomes:

### Final Response

```text
User
  ↓
Tool Call
  ↓
Tool Result
  ↓
Claude Answer
```

### Another Tool Call

```text
User
  ↓
Tool Call #1
  ↓
Tool Result #1
  ↓
Tool Call #2
  ↓
Tool Result #2
  ↓
Claude Answer
```

Claude may continue issuing tool calls until it has enough information to finish the task.

---

## Important Production Rule

The loop is **not automatic**.

Claude never executes tools on its own.

Your application must always perform Steps 4 and 5:

```text
tool_use
      ↓
Execute tool
      ↓
Return tool_result
      ↓
Claude continues
```

If these steps are skipped:

- Claude never receives the requested data.
- The conversation cannot progress correctly.
- Tool-use workflows fail.

---

## Troubleshooting Guide

| Symptom | Most Likely Cause |
|----------|------------------|
| Claude consistently selects the wrong tool | Poor schema description |
| Tool call contains incorrect arguments | Weak input schema or ambiguous parameters |
| Validation error after tool execution | Missing or mismatched `tool_use_id` |
| Claude appears stuck after a tool call | Tool result was never returned |
| Tool routing becomes inconsistent as more tools are added | Overlapping descriptions and insufficient disambiguation |

---

## Key Takeaway

Claude's responsibility is to:

- Read tool schemas
- Select tools
- Generate tool arguments

Your application's responsibility is to:

- Execute the tools
- Return tool results
- Maintain the message history

A successful tool-use implementation depends on correctly completing the full six-step loop every time.
---


# Message Block Structure in a Tool-Use Conversation

Tool-use conversations are composed of structured content blocks rather than plain text.

Four block types appear in typical tool-use interactions.

## Block Types

| Block Type | Role | Contains | Critical Rule |
|------------|------|----------|---------------|
| **text block** | Assistant / Claude | Claude's prose response | Claude may return a text block alongside a `tool_use` block in the same turn. Preserve the entire content array when saving conversation history. Dropping text blocks removes context needed for later turns. |
| **tool_use block** | Assistant / Claude | Tool name, unique ID, and input arguments | Every `tool_use` block must be answered by a matching `tool_result` block in the immediately following user turn. |
| **tool_result block** | User | Matching tool-use ID, tool output, optional `is_error` flag | The `tool_use_id` must match exactly. Claude uses this ID to associate results with the correct tool call. |
| **thinking block** | Assistant / Claude (Extended Thinking only) | Claude's reasoning | Must be returned unchanged in future requests. Modified or removed thinking blocks fail signature validation. |

---

# Critical Tool-Use Invariant

The most important structural rule:

> Every `tool_use` block must receive a matching `tool_result` block in the immediately following user turn.

### Invalid Patterns

❌ Missing result:

```text
Assistant: tool_use
Assistant: another response
```

❌ Delayed result:

```text
Assistant: tool_use
User: normal message
User: tool_result
```

Both produce validation errors.

### Valid Pattern

```text
Assistant: tool_use
User: tool_result
Assistant: continues
```

---

# Schema Anatomy: How Claude Chooses a Tool

Every tool schema has three major components:

1. Name
2. Description
3. Input Schema

Of these, the **description** is usually the most important for tool selection.

---

## 1. Name

The name should be clear and specific.

### Good

```text
get_account_balance
```

### Poor

```text
get_data
```

Specific names help Claude distinguish tools.

---

## 2. Description

The description drives routing decisions.

A good description should include:

- When to use the tool
- When not to use the tool

### Bad

```text
Use this to find information.
```

Many tools could satisfy that description.

### Good

```text
Use this to retrieve the current balance
for a specific account ID.

Do not use this for transaction history.
```

The exclusion condition gives Claude a decision rule.

---

## 3. Input Schema

The `input_schema` defines parameters using JSON Schema.

This determines:

- Required fields
- Optional fields
- Input validation expectations

### Required Parameters

Mark fields as required only when the call cannot work without them.

### Optional Parameters

Use optional fields when:

- Defaults exist
- Missing values are meaningful
- Information may be unavailable

Overuse of required fields often causes Claude to invent input values.

---

# Decision Table: Schema Design Choices

## Tool Schema Design Decisions

| Decision | How to Handle It | Why It Matters |
|-----------|------------------|----------------|
| **Subtask dependency** | Use sequential calls when one tool depends on outputs from another. Use parallel calls when tasks are independent. | Claude defaults to parallel tool use where possible. If dependencies exist, model them as separate turns. Use `disable_parallel_tool_use` if necessary. |
| **Required fields** | Mark fields as required only when absolutely necessary. | Making everything required encourages Claude to fabricate values. |
| **Optional fields** | Use optional fields when defaults exist or information may be absent. | Allows Claude to omit unknown values instead of guessing. |
| **Description length** | Use 3-4 concise sentences describing purpose, triggers, exclusions, and outputs. | Too little detail causes guessing. Too much detail buries decision signals. |
| **Overlapping parameter types** | Add domain-specific differentiation in descriptions. | When signatures look similar, routing depends almost entirely on descriptions. |

---

# Worked Example: Wrong Tool Selection

## Problem

A developer creates two tools:

```text
search_knowledge_base
```

```text
get_cached_result
```

Both descriptions begin with:

```text
Use this to find information.
```

Tool names differ.

Descriptions do not.

Claude frequently selects the wrong tool.

---

## Why It Happens

At selection time, both tools appear nearly identical.

Claude lacks enough information to distinguish their intended use.

---

## Improved Descriptions

### search_knowledge_base

```text
Use this to search the knowledge base when
the user asks for information that requires
a fresh lookup.

Do not use this if a previous search in
the current session already answered the question.
```

### get_cached_result

```text
Use this to retrieve information that
was already fetched earlier in this session.

Only use this when search_knowledge_base
has already been called for the same query.
```

---

## Why This Works

The exclusion conditions create decision boundaries:

| Tool | Exclusion Condition |
|--------|--------------------|
| search_knowledge_base | Don't use when a previous search already exists |
| get_cached_result | Only use when a previous search exists |

Claude can now reason about tool selection correctly.

---

# When Exclusion Conditions Help

### Good Fit

✅ Distinct tools

✅ Different data sources

✅ Different workflows

✅ Clear routing logic

---

### Poor Fit

❌ Two tools performing almost identical actions

❌ Descriptions becoming increasingly long to keep tools apart

In these situations, merge tools and use a parameter such as:

```json
{
  "source": "cache"
}
```

instead of maintaining separate tools.

---

# MCP: An Alternative to Manual Schema Authoring

Everything above assumes that you write tool schemas yourself.

Sometimes that work has already been done.

This is where **Model Context Protocol (MCP)** becomes useful.

---

# What MCP Does

MCP moves:

- Tool definitions
- Tool execution
- Tool maintenance

into dedicated MCP servers.

Instead of writing schemas manually, your application connects to a server that exposes them.

---

## Example: GitHub

Without MCP:

You must create schemas for:

- Repositories
- Pull requests
- Issues
- Projects
- Comments
- Branch operations

and maintain them as GitHub's APIs evolve.

With MCP:

A GitHub MCP server already provides those definitions.

Your application simply consumes them.

---

# MCP Within the Tool-Use Loop

The execution loop does not change.

| Traditional Tools | MCP Tools |
|------------------|-----------|
| Define schemas manually | Fetch schemas from MCP server |
| Claude selects tool | Claude selects tool |
| Execute tool | Execute tool |
| Return result | Return result |

The only difference is where schemas come from.

---

# Managing MCP Context Cost

MCP tool definitions consume context window tokens.

This matters even before any tool is called.

### Best Practices

- Only connect servers you need.
- Avoid exposing unnecessary tools.
- Monitor context consumption.

---

# MCP Connector Controls

The API MCP Connector offers two useful controls.

| Setting | Purpose |
|----------|---------|
| `defer_loading` | Delays loading tool definitions until needed, reducing initial context usage. |
| `enabled` | Allows individual tools to be turned on or off. |

The MCP Connector requires:

```text
mcp-client-2025-11-20
```

beta header support.

---

# MCP Transports

MCP supports two transport mechanisms.

| Transport | Usage |
|------------|-------|
| **stdio** | Local MCP servers running as subprocesses |
| **Streamable HTTP** | Remote MCP servers accessed over the network |

### Recommendation

Use:

```text
Streamable HTTP
```

for new integrations.

The older SSE-only transport is deprecated.

---

# Choosing Between MCP and Manual Schemas

| Approach | Use When |
|-----------|----------|
| **Use MCP** | A high-quality MCP server already exists and covers your use case. |
| **Write Schemas Manually** | No MCP server exists or you need tight control over descriptions and scope. |
| **Use Both** | Use MCP for coverage and refine exposed tools with allowlists, denylists, and description tuning. |

---

# Key Takeaways

1. Claude selects tools; your application executes them.
2. Every `tool_use` block must be followed immediately by a matching `tool_result`.
3. Tool descriptions are the primary signal for tool routing.
4. Good descriptions include both inclusion and exclusion conditions.
5. Required fields should be genuinely required.
6. Parallel tool calls are appropriate only when subtasks are independent.
7. MCP provides prebuilt, maintainable tool ecosystems.
8. MCP does not change the tool-use loop, only where tool definitions originate.
9. Context-window discipline matters for both manual schemas and MCP-provided tools.
10. Precise schemas consistently outperform vague or excessively verbose ones.

# The Description That Sent Claude to the Wrong Tool

## Setup

*A schema can look correct and still fail.*

Typed parameters and successful happy-path testing tell you that a tool schema is structurally valid, but they do not tell you whether Claude can reliably choose between tools when a request sits near the boundary between two overlapping descriptions.

This is one of the most common production failures in tool-use systems:

> The tool call is valid, but it is the wrong tool.

These failures often remain hidden during development and only appear once real users begin sending more varied and ambiguous requests.

---

## A Debugging Conversation

*A composite example based on common tool-selection debugging patterns.*

A developer has spent most of the morning investigating incorrect tool selections.

Eventually, a senior developer asks a single question that reframes the entire problem.

### Conversation

**Developer:**

> Why does Claude keep calling `search_docs` when the answer is already in the context? I've re-run this four times, and it keeps going to the wrong tool.

**Senior Developer:**

> What does the description for `search_docs` say?

**Developer:**

> "Use this to find information about the product."

**Senior Developer:**

> And what does `get_context_summary` say?

**Developer:**

> "Use this to retrieve relevant information from the current session."

**Senior Developer:**

> Those descriptions are the same thing from Claude's perspective. Both say "find information." One of them needs to say when *not* to call it.

**Developer:**

> So I need to add an exclusion?

**Senior Developer:**

> Right. Try using:
>
> "Use this when the user asks a question that requires looking up content not already present in this conversation. Do not call this if the answer is available in the current session context."

**Senior Developer (continued):**

> Then let `get_context_summary` handle the in-context case. You will want to tighten that description the same way:
>
> "Only use this if the answer is already present in the current session. Do not use this to look up new information."
>
> Both tools need the boundary, not just one.

**Developer:**

> That's two sentences.

**Senior Developer:**

> Right. One sentence for when to use it. One sentence for when not to use it. That's the whole fix.

---

## What Went Wrong?

### Original Descriptions

#### search_docs

```text
Use this to find information about the product.
```

#### get_context_summary

```text
Use this to retrieve relevant information from the current session.
```

From a human perspective, these may appear different.

From Claude's perspective, however, both descriptions roughly communicate:

```text
Find information.
```

The distinction that matters most is missing:

- When should `search_docs` be chosen?
- When should `get_context_summary` be chosen?
- Under what circumstances should each tool NOT be used?

Without those boundaries, Claude must guess.

---

## The Fix: Add Exclusion Conditions

### Improved Description

#### search_docs

```text
Use this when the user asks a question that requires
looking up information not already present in the current
conversation.

Do not use this if the answer is available in the current
session context.
```

#### get_context_summary

```text
Use this when the information needed already exists
within the current session.

Do not use this for retrieving new information from
external sources or documentation.
```

---

## Why This Works

The descriptions now contain decision boundaries.

### Before

| Tool | Trigger |
|--------|----------|
| search_docs | Find information |
| get_context_summary | Find information |

Claude has no reliable distinction.

### After

| Tool | Use When | Do Not Use When |
|--------|-----------|----------------|
| search_docs | Information must be looked up externally | Information already exists in the conversation |
| get_context_summary | Information already exists in the conversation | New information must be retrieved |

Claude now has a clear routing rule.

---

## The Core Principle

Good tool descriptions contain **two parts**:

### 1. Inclusion Condition

When the tool should be used.

Example:

```text
Use this to retrieve a customer's current account balance.
```

### 2. Exclusion Condition

When the tool should not be used.

Example:

```text
Do not use this for transaction history or account activity.
```

Together, these create a decision boundary that Claude can reason about consistently.

---

## What to Watch Out For

Claude selects tools by reasoning over:

- Tool names
- Tool descriptions
- Available parameters
- Full conversation context

When two descriptions overlap heavily, Claude has little signal for choosing one over the other.

The result is often:

- Wrong tool selection
- Inconsistent routing
- Difficult-to-reproduce production bugs

---

## When Exclusion Conditions Are Enough

✅ Distinct tools with different purposes

✅ Tools that operate on different data sources

✅ Tools with clear business boundaries

✅ Routing based on conversation state

---

## When Exclusion Conditions Are Not Enough

Sometimes two tools are so similar that descriptions become increasingly long and complex in an attempt to separate them.

For example:

```text
search_customer
```

and

```text
lookup_customer
```

If descriptions require paragraphs of explanation to distinguish them, the better solution is often to merge them.

### Better Pattern

```json
{
  "operation": "search"
}
```

or

```json
{
  "source": "cache"
}
```

instead of maintaining multiple nearly identical tools.

---

## Diagnostic Checklist

When Claude repeatedly selects the wrong tool:

1. Compare tool descriptions side by side.
2. Look for overlapping language.
3. Identify whether both descriptions effectively mean the same thing.
4. Add an explicit "do not use this when..." boundary.
5. Test with ambiguous requests.
6. If boundaries remain unclear, consider merging the tools.

---

## Key Takeaway

A tool description should answer two questions:

1. **When should Claude use this tool?**
2. **When should Claude not use this tool?**

The most reliable schema pattern is often surprisingly simple:

> One sentence defining the trigger condition, and one sentence defining the exclusion condition.

That small addition frequently turns inconsistent tool routing into predictable production behavior.