# Prompting Modes: Zero-Shot, One-Shot, Multi-Shot

## The Three Modes

Separate from how you word a prompt is how many worked examples you provide inside it.

### Zero-Shot

**Zero-shot** prompting provides instructions without any examples.

You simply describe the task and ask the model to perform it.

**Example:**

```text
Classify the sentiment of this review as Positive, Negative, or Neutral.
Review: "The product arrived on time and worked perfectly."
```

### One-Shot

**One-shot** prompting includes a single example showing an input paired with the desired output.

The example helps demonstrate the format and style you want the model to follow.

**Example:**

```text
Example:
Review: "The battery died after one day."
Sentiment: Negative

Now classify:
Review: "The product arrived on time and worked perfectly."
Sentiment:
```

### Multi-Shot (Few-Shot)

**Multi-shot**, also known as **few-shot**, prompting includes several examples.

These examples help the model learn patterns, edge cases, formatting requirements, and decision rules from the prompt itself.

**Example:**

```text
Review: "The battery died after one day."
Sentiment: Negative

Review: "Works as expected."
Sentiment: Positive

Review: "It's okay, nothing special."
Sentiment: Neutral

Now classify:
Review: "The product arrived on time and worked perfectly."
Sentiment:
```

### Key Point

Examples are **not training data**.

They exist only within the current prompt and serve as demonstrations of the behavior, structure, or output format you want the model to produce.

Often, an example communicates expectations more effectively than a lengthy written explanation.

---

## The Cost and Quality Trade-Off

Every example added to a prompt:

- Consumes tokens
- Increases cost
- Uses context window capacity

As a result, prompting strategy is always a trade-off between quality and efficiency.

### When to Use Zero-Shot

Use zero-shot prompting when:

- The task is simple
- The expected output is obvious
- No special formatting is required
- The model already performs reliably

### When to Use One-Shot or Multi-Shot

Use examples when:

- The output must follow a specific structure
- Formatting requirements are strict
- Casing matters
- Edge cases cause inconsistent behavior
- The model repeatedly misunderstands instructions

In practice, one or two well-designed examples often solve a problem faster than adding several paragraphs of additional instructions.

### Best Practice

Add only the minimum amount of prompting needed to achieve reliable results.

A smaller prompt:

- Costs less
- Uses less context
- Is easier to maintain
- Often performs just as well

---

## Mode Choice Interacts with Model Choice

Prompting mode and model selection are related optimization levers.

A more capable model may successfully perform a task using zero-shot prompting, while a smaller model might require one-shot or multi-shot examples to produce equivalent results.

### Example

- A higher-capability model may correctly generate structured JSON from instructions alone.
- A lower-cost model may need a few examples showing the desired JSON format before it becomes reliable.

Because of this relationship, adding examples can sometimes allow a less expensive model to meet quality requirements.

### Recommended Approach

Evaluate both factors together:

1. Start with the simplest prompt possible.
2. Use the least expensive model that meets quality requirements.
3. Add examples only when evaluations show they improve reliability.
4. Upgrade to a more capable model only when additional prompting is insufficient.

### Key Takeaway

Think of prompting mode and model choice as complementary controls:

- **Model Choice** determines baseline capability.
- **Prompting Mode** determines how much guidance the model receives.

The most effective solution is usually the combination that achieves your quality target with the lowest overall cost and complexity.