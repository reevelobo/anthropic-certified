# Prompting Craft
---
# Teaching
# System Prompts, XML, Few-Shot, and Output Constraints

A prompt that works once during interactive use often breaks when exposed to real production inputs.

The solution is usually **not** to add more words. Instead, **identify which structural component is missing** and add that specific component.

This section explains how to diagnose prompt failures and introduces four techniques that improve reliability:

1. System prompts
2. XML tags
3. Few-shot examples
4. Output constraints

---

# Four Techniques That Give Claude a Reliable Output Shape

When a first-pass response misses the mark, developers often respond by rewriting the prompt and adding more instructions.

In practice, rewording rarely fixes the underlying issue because it changes how instructions are expressed rather than addressing the missing structural element.

For example:

- If Claude cannot distinguish instructions from input data, clearer wording will not solve the problem.
- If output formatting keeps changing, telling Claude to "format correctly" is usually insufficient.

Instead, determine what type of failure occurred and apply the appropriate technique.

## Diagnosis Table

| What You Observed | What the Prompt Is Missing | Why This Technique Is the Fix |
|-------------------|---------------------------|-------------------------------|
| The result comes back in the wrong shape: a sentence where you expected a label, or prose where you expected JSON. | An **output constraint**. The prompt never specified the form, field names, or stopping point of the response. | An output constraint controls response structure independent of content. Without one, Claude may generate plausible text that downstream systems cannot parse. |
| The content is off: scope drifts, tone changes, or Claude answers a broader question than requested. The issue becomes worse over longer conversations. | A **system prompt**, or a more specific one. The behavioral contract is too vague. | The system prompt defines persistent rules for every response. Without sufficient guidance, Claude may gradually drift in role, scope, or style. |
| The task is correct, but the structure is invented. Claude understood what to do but generated output in a format you never requested. | **Few-shot examples.** Claude cannot always infer an exact structure from instructions alone. | Examples demonstrate the pattern directly. A correct input-output pair provides a concrete format that textual description may fail to communicate. |
| Output works for tested inputs but fails on unusual inputs, edge cases, or unexpected fields. | A **constraint covering the variant**. The prompt only covers the happy path. | Explicitly covering edge cases through additional constraints or examples closes gaps that basic testing may not reveal. |

---

# Diagnosing a Classification Prompt That Returns the Wrong Output Shape

A simple rule:

> Name the failure, add the matching technique, and test again.

If the prompt still fails, repeat the diagnosis process.

If a prompt becomes longer and longer with every revision, that is usually a sign that diagnosis is being skipped and instructions are simply being added.

---

# Worked Example: A Classification Prompt Before and After

## Initial Prompt

A developer wants Claude to classify support tickets into three categories:

- billing
- technical
- escalation

The first version contains no output constraint:

```text
System:
"You are a support classifier. Classify the ticket."

User:
<ticket>I was charged twice for the same month.</ticket>
```

Possible outputs include:

```text
Billing
```

```text
billing
```

```text
This looks like a billing issue.
```

Although the classification is correct, the format varies.

The downstream router expects a fixed label and breaks on inconsistent responses.

This matches the first row in the diagnosis table:

- Correct content
- Incorrect output shape

The missing component is an **output constraint**.

---

## Improved Prompt

```text
System:
"You are a support classifier.
Classify each ticket into exactly one of:
BILLING, TECHNICAL, ESCALATION.
Return only the label.
No other text."

<sample_input>
My account shows two charges for April.
</sample_input>

<ideal_output>
BILLING
</ideal_output>

<sample_input>
The API keeps returning a 429 error.
</sample_input>

<ideal_output>
TECHNICAL
</ideal_output>

User:
<ticket>I was charged twice for the same month.</ticket>
```

---

## What Each Technique Is Doing

| Technique | Purpose |
|------------|---------|
| System Prompt | Defines the contract: one label from a fixed set and no extra text. |
| XML Tags | Separate examples and user input from instructions. |
| Few-Shot Examples | Demonstrate the exact casing and structure required. |
| Output Constraint | Restricts responses to accepted labels. |

Together, these techniques produce results that are reliable enough for programmatic routing.

---

# Prompt Design Decision Table

| Strategy | When to Use |
|-----------|------------|
| **Stack all four techniques** | Tasks with strict formats and edge cases that can be covered through examples. |
| **Simplify the prompt** | Simple tasks that do not require all techniques. A basic summarization task rarely needs examples and schemas. |
| **Diagnose before adding more** | Prompts that keep growing without improving. If several prompt revisions still fail, identify the failure category before adding more instructions. |

---

# When to Reach for Each Technique

## System Prompts

System prompts define the behavioral contract for the entire session.

Use them to establish:

- Role
- Scope
- Response style
- Rules that must remain consistent

Example:

```text
You are a financial analyst.
Respond with concise executive summaries.
Never provide investment recommendations.
```

---

## XML Tags

Use XML tags whenever instructions and data appear together.

Without clear boundaries, Claude may confuse:

- Instructions
- Input documents
- Code
- Examples

### Example

```xml
<docs>
...
</docs>

<my_code>
...
</my_code>
```

Descriptive tag names are preferred.

They do not need to match any official XML standard.

---

## Few-Shot Examples

Few-shot prompting demonstrates desired behavior rather than describing it.

Example structure:

```xml
<sample_input>
...
</sample_input>

<ideal_output>
...
</ideal_output>
```

Useful when:

- Formatting matters
- Structure matters
- Edge cases matter

A practical strategy is to reuse examples from high-performing evaluation outputs.

---

## Output Constraints

Output constraints act as the final safeguard before output reaches application code.

Define:

- Field names
- Data types
- Length limits
- Presence or absence of preamble text
- Behavior when data is missing

When strict machine readability is required, structured output features are preferable.

---

# The Iteration Loop: Diagnosing Before Re-Prompting

When output quality is poor, diagnose first.

## Common Failure Types

| Failure | Missing Technique |
|-----------|------------------|
| Wrong format | Output constraint |
| Wrong content or scope drift | Stronger system prompt |
| Correct task but invented structure | Few-shot examples |
| Works on normal inputs but fails on edge cases | Additional constraints or edge-case examples |

The fix is structural, not stylistic.

Examples:

- If Claude confuses instructions and content, use XML tags.
- If formatting drifts, use output constraints.
- If structure varies, use few-shot examples.

Do not rely solely on stronger wording.

---

# Moving Output Control from the Prompt into the API with Structured Outputs

Up to this point, output quality depends on instructions within the prompt.

However, prompts remain requests.

Claude can still occasionally produce:

- Invalid JSON
- Extra text
- Incorrect field names

Structured Outputs moves enforcement into the API itself.

---

## What Is Structured Output?

Instead of describing the desired format in words, you provide a JSON Schema.

The API then constrains generation so only tokens that produce valid schema-compliant output can be generated.

This technique is called **constrained decoding**.

---

# Two Structured Output Mechanisms

## 1. JSON Outputs

Constrains the model's final response.

Configure:

```text
output_config.format = json_schema
```

along with your schema.

### Benefits

- Guaranteed valid JSON
- Eliminates parse-and-retry logic
- Ideal for extraction and machine-readable output

### Typical Use Cases

- Field extraction
- API payload generation
- Structured reporting

---

## 2. Strict Tool Use

Constrains tool arguments passed by Claude.

Configure:

```text
strict = true
```

on tool definitions.

### Benefits

- Tool arguments follow schema
- Reduced runtime failures
- More reliable agent loops

### Typical Use Cases

- Function calling
- Agent workflows
- Automated actions

---

# Why Structured Outputs Matter in Production

Prompt-based constraints work well on tested inputs.

Problems emerge when unusual inputs appear.

A prompt may say:

```text
Return only JSON.
```

Yet an edge case produces:

```text
Here is the JSON you requested:

{...}
```

Structured output prevents such failures because enforcement occurs during generation itself.

This shifts correctness from:

> "Verify after generation"

to

> "Prevent invalid output from being generated."

---

# Costs and Trade-Offs of Structured Outputs

## 1. First Request on a New Schema Is Slower

The API compiles the schema into a grammar.

This introduces additional latency on the first request.

Compiled grammars are typically cached for 24 hours after last use.

---

## 2. Higher Input Token Usage

Structured outputs inject additional formatting instructions internally.

These extra tokens are billable.

The increase is usually small but relevant at scale.

---

## 3. Guaranteed Schema ≠ Guaranteed Success

Two important exceptions remain:

| Scenario | Result |
|-----------|---------|
| Model refusal | Response may stop with `stop_reason: refusal` |
| Token limit reached | Response may stop with `stop_reason: max_tokens` |

Applications should always inspect `stop_reason`.

---

## 4. Incompatible with Assistant Message Prefilling

These two approaches cannot be used together:

- Structured JSON outputs
- Assistant message prefilling

You must choose whichever best fits the use case.

---

# Key Takeaways

1. Diagnose failures before revising prompts.
2. Use the appropriate structural technique rather than simply adding more instructions.
3. System prompts define behavior.
4. XML tags define boundaries.
5. Few-shot examples define patterns.
6. Output constraints define structure.
7. Structured outputs move enforcement into the API and provide the strongest guarantee for production reliability.
8. Every constraint improves reliability but introduces trade-offs in complexity, latency, or token usage.

---
# Watch Out 
# The Prompt That Grew Longer Instead of Better

## Setup

Even when a prompt appears production-ready, it can still fail in subtle ways.

Common issues include:

- Edge cases causing fields to go missing
- Output constraints being ignored
- Parsers breaking despite seemingly correct answers

These failures often occur because the prompt lacks the right constraint, not because it lacks enough words.

---

# Six Revision Passes, Each One Longer Than the Last

The original prompt from the previous example asked Claude to classify support tickets into one of three categories:

- BILLING
- TECHNICAL
- ESCALATION

The first version was deliberately simple:

```text
System: "You are a support classifier. Classify the ticket."

User:
<ticket>I was charged twice for the same month.</ticket>
```

The following trace shows a common failure pattern: each revision adds more text, but the underlying problem remains unresolved.

## Revision History

| Pass | What Was Added | Output Behavior |
|--------|---------------|-----------------|
| **1** | "Classify this ticket as billing, technical, or escalation." | Returns full sentences such as *"This appears to be a billing issue."* Parser breaks. |
| **2** | Added *"Be concise."* and *"Use only the category name."* | Returns `"Billing"` sometimes and `"billing"` other times. Router breaks because of casing differences. |
| **3** | Added three paragraphs describing each category in detail. | Output is correct for simple tickets. Ambiguous tickets return `"billing/technical"` instead of a single label. Parser breaks on the slash. |
| **4** | Added *"Never return two categories."* and *"If ambiguous, choose the most likely one."* | Works on roughly 80% of tickets. Tickets fitting multiple categories return explanations instead of labels. |
| **5** | Added two additional paragraphs describing edge cases and emphasizing precision. | Prompt becomes extremely verbose. Responses exceed 2,000 characters. Latency increases while accuracy remains unchanged. |
| **6** | Replaced instructions with a JSON schema plus two few-shot examples showing exact input/output pairs. | Returns `{"category":"billing"}` consistently. Parser succeeds. Latency drops. Accuracy matches Pass 4. |

---

# What Actually Went Wrong?

Two separate failures occurred during the iteration process.

## Failure #1: Diagnostic Failure (Pass 4)

The developer correctly recognized that ambiguous tickets were causing problems.

However, the wrong solution was applied.

Instead of adding a structural constraint, additional descriptive instructions were added.

Result:

- The prompt became longer.
- The output remained unreliable.

The underlying issue was the absence of an enforceable output contract.

---

## Failure #2: Engineering Failure (Pass 5)

The developer continued adding instructions.

The prompt now contained:

- Long category descriptions
- Multiple edge-case explanations
- Repeated reminders

This caused a second issue unrelated to classification accuracy.

### Prompt Length Influences Response Length

LLMs often calibrate response style and verbosity against the input.

Long, verbose prompts commonly generate:

- Longer responses
- Higher token consumption
- Increased latency
- Greater cost

In this case:

- Accuracy did not improve.
- Response length exceeded 2,000 characters.
- Latency increased significantly.

The prompt became more expensive without becoming more reliable.

---

# The Correct Fix

The successful solution was not additional explanation.

The successful solution was structure.

Specifically:

1. An output constraint
2. Two few-shot examples

---

## Production Version

```text
System:
"You are a support classifier.
Classify each ticket into exactly one of:
BILLING, TECHNICAL, ESCALATION.
Return only the label.
No other text."

<sample_input>
My account shows two charges for April.
</sample_input>

<ideal_output>
BILLING
</ideal_output>

<sample_input>
The API keeps returning a 429 error.
</sample_input>

<ideal_output>
TECHNICAL
</ideal_output>

User:
<ticket>I was charged twice for the same month.</ticket>
```

---

# Why This Version Works

| Technique | Contribution |
|------------|-------------|
| **System Prompt** | Defines exactly what classifications are allowed. |
| **Output Constraint** | Restricts output to one label and no additional text. |
| **Few-Shot Examples** | Demonstrate correct casing and formatting. |
| **XML Tags** | Clearly separate examples, instructions, and user content. |

The result is:

- Consistent output
- Faster parsing
- Lower latency
- Greater reliability

---

# What to Watch Out For

A common anti-pattern is:

```text
Failure
↓
Add more words
↓
Failure
↓
Add even more words
↓
Failure
↓
Add another paragraph
```

Every revision in the example became longer, yet none introduced the missing output constraint until Pass 6.

The developer kept describing:

> "What a billing ticket looks like"

when the real requirement was:

> "Return exactly one uppercase label."

---

# The Key Pattern to Recognize

If three prompt revisions in a row have failed:

1. Stop adding text.
2. Diagnose the failure type.
3. Identify the missing technique.
4. Add that technique directly.

## Quick Diagnosis Guide

| Symptom | Missing Technique |
|----------|------------------|
| Wrong format | Output constraint |
| Scope drift or wrong content | Stronger system prompt |
| Correct task but wrong structure | Few-shot examples |
| Fails on edge cases | Constraint or example covering the variant |
| Instructions and data get mixed together | XML tags |

---

# Key Takeaway

The goal is not to create the longest prompt.

The goal is to create the **smallest prompt that reliably produces the required output**.

In this example, six increasingly verbose revisions were outperformed by a simple combination of:

- One clear output constraint
- Two few-shot examples

When prompts keep growing but results do not improve, stop writing and start diagnosing.

