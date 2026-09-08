# Extended Thinking: Turning Reasoning On, Calibrating Effort, and Reading It Back Correctly

The prompting techniques discussed earlier shape **what Claude produces**.

**Extended thinking** shapes **how much work Claude does before answering**.

When enabled, Claude performs an explicit reasoning step before generating the final response. Your job as a developer is to:

- Decide when the extra reasoning is worth the cost.
- Configure the appropriate effort level.
- Correctly handle reasoning blocks returned by the API.

---

# What Extended Thinking Does

When extended thinking is enabled, Claude reasons before generating its final answer.

In the API response, reasoning appears as a separate **thinking block** that precedes the final response block.

```text
Thinking Block
        ↓
Final Answer Block
```

### Important Note

On the newest Claude models:

- Thinking content is hidden by default.
- You must explicitly request a summarized display if you want reasoning content returned.

---

## Adaptive Thinking in Current Models

Current models use **adaptive thinking**.

Rather than specifying exactly how many reasoning tokens Claude should use, you:

1. Enable thinking with the `thinking` parameter (where not already enabled by default).
2. Configure an **effort setting**.
3. Allow Claude to determine how much reasoning is necessary.

### Deprecated Behavior

Older models supported:

```text
budget_tokens
```

This approach is deprecated.

On the newest model generations:

```text
budget_tokens
```

returns a **400 error**.

---

## Thinking Has a Cost

Reasoning tokens are billed the same way as output tokens.

That means:

- More thinking = more tokens
- More tokens = higher cost

As a result, extended thinking should be enabled selectively rather than used everywhere.

### Guiding Principle

Match the tool to the task.

Use additional reasoning only when the expected accuracy improvement justifies the extra cost.

---

# When to Use Extended Thinking

| Task Shape | Extended Thinking Call | Reason |
|------------|-----------------------|---------|
| Multi-step reasoning where the model must hold several constraints simultaneously, such as math derivations, multi-hop logic problems, or planning sequences of dependent actions. | Enable it and match the effort level to the complexity of the problem. | The reasoning phase helps Claude work through dependencies it might otherwise skip. |
| Mechanical or lookup tasks such as classification, format conversion, extraction, or short factual answers. | Leave it off. | Extended thinking usually does not improve results and only increases token usage. A constrained prompt is typically sufficient. |
| Agentic loops where the model plans across multiple tool calls. | Enable it and budget for planning effort rather than individual calls. | Reasoning during planning reduces downstream tool-selection mistakes. The carry-back rule applies in these workflows. |

---

# Multi-Step Reasoning Tasks

Examples include:

- Mathematical derivations
- Multi-hop reasoning
- Dependency planning
- Workflow decomposition
- Complex decision trees

### Recommendation

Enable extended thinking and adjust effort according to complexity.

The reasoning process gives Claude room to:

- Consider dependencies
- Evaluate alternatives
- Work through constraints systematically

Without reasoning, models may jump directly to answers and miss important intermediate steps.

---

# Mechanical and Lookup Tasks

Examples include:

- Ticket classification
- Sentiment detection
- Data extraction
- Format conversion
- Label generation
- Short factual lookups

### Recommendation

Leave extended thinking disabled.

These tasks generally benefit more from:

- Strong output constraints
- Clear schemas
- Well-designed prompts

rather than additional reasoning.

### Why?

You pay for extra thinking without receiving meaningful quality improvements.

---

# Agentic Loops

Agent workflows often require:

- Planning
- Tool selection
- Sequential execution
- Information gathering

### Recommendation

Enable extended thinking.

In agent environments, reasoning improves:

- Planning quality
- Tool selection accuracy
- Multi-step execution

Think of the cost as paying for planning rather than paying per individual tool call.

---

# The Carry-Back Rule

This is the most important implementation requirement when combining:

- Extended thinking
- Tool use

---

## Rule

Every thinking block returned by Claude must be sent back to the API **exactly as received** on subsequent turns.

### Do Not

- Edit it
- Rewrite it
- Summarize it
- Remove it

---

## Why?

Thinking blocks include a signature.

The signature verifies that reasoning content has not been modified.

If content changes:

```text
Thinking Block Changed
        ↓
Signature Invalid
        ↓
Request Rejected
```

The API refuses the request.

---

# Thinking Block Lifecycle

```text
Request
   ↓
Claude Generates Thinking Block
   ↓
Claude Generates Final Response
   ↓
Tool Call
   ↓
Next API Request
   ↓
Original Thinking Block Returned Unchanged
```

Every tool-use turn must preserve the thinking block exactly.

---

# Redacted Thinking Blocks

Some reasoning blocks may be returned in redacted form.

Characteristics:

- Contents are encrypted
- Humans cannot read them
- The model can still use them

Even though the contents are hidden:

✅ Return them unchanged.

❌ Do not remove them.

❌ Do not modify them.

The same signature validation rules apply.

---

# Common Developer Mistake

A common optimization attempt looks like:

```text
Reasoning block is large
        ↓
Remove it to save context
        ↓
Next request fails
```

This breaks the conversation because the API expects the reasoning block to remain intact.

---

# Correct Solution

If reasoning is consuming too much context:

✅ Use context-engineering techniques.

Possible approaches include:

- Context compaction
- Session resets
- Subagent handoffs
- Memory architecture improvements

Do **not** delete thinking blocks from active tool-use chains.

---

# Model Choice vs. Extended Thinking

These are different decisions.

| Decision | Purpose |
|-----------|----------|
| Model Choice | Selects the underlying model tier (Haiku, Sonnet, Opus, Fable). |
| Extended Thinking | Controls how much reasoning the chosen model performs before answering. |

You can combine them independently.

Examples:

| Configuration | Result |
|---------------|---------|
| Powerful model + thinking off | Fast, direct responses |
| Smaller model + thinking on | More deliberate reasoning from a less capable base model |
| Powerful model + high effort thinking | Maximum reasoning capability and quality |

Choosing models and capability tiers is covered in the MSO Foundations module.

---

# Summary

### Handles Well

- Hard reasoning problems
- Planning tasks
- Multi-step decision making
- Agent planning workflows

The additional reasoning often improves accuracy when mistakes are expensive.

---

### Adds Cost or Complexity

- More output tokens
- Higher latency
- Effort-setting calibration
- Carry-back requirements in tool-use loops

Extended thinking should be treated as an optimization tool, not a default setting.

---

### Use a Different Approach

For tasks such as:

- Classification
- Extraction
- Labeling
- Formatting
- Data transformation

A well-designed prompt with:

- Output constraints
- XML tagging
- Few-shot examples
- Structured outputs

is usually cheaper and equally effective.

---

# Key Takeaway

Extended thinking changes **how Claude solves a problem**, not **what task you give it**.

Enable it when success depends on careful reasoning, planning, or constraint tracking.

For straightforward tasks, keep it off and rely on strong prompt design instead.

The most important implementation rule is simple:

> When extended thinking is used together with tools, every thinking block must be returned to the API exactly as it was received.