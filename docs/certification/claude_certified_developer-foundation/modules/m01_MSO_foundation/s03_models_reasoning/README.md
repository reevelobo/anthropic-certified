# Model Options and Reasoning Modes

## The Claude Model Family

Claude is a family of models that currently spans four tiers:

- **Fable**
- **Opus**
- **Sonnet**
- **Haiku**

Each model represents a different tradeoff across cost, latency, and capability.

### Model Tiers

- **Sonnet** is the balanced default for most production workloads.
- **Haiku** is built for speed and cost efficiency on tasks that fit its capability envelope.
- **Opus** handles demanding work above the Sonnet capability envelope.
- **Fable** is the most capable tier, built for the most demanding reasoning, coding, and agentic workloads where maximum intelligence is the priority.

### Recommended Selection Strategy

A practical approach is:

1. Start with **Sonnet**.
2. Move up to a higher tier only when an evaluation shows the current tier is missing your quality target.
3. Move down to **Haiku** only when an evaluation shows the quality reduction is acceptable for the task.

Because the Claude family continues to evolve, confirm the current model lineup and model identifiers against the official [documentation](platform.claude.com/docs ) at build time.

---

## Reasoning Modes Are Separate from Model Choice

Choosing a model and choosing whether it reasons before answering are two separate decisions.

### Model Choice

Model choice determines which Claude family member performs the task:

- Fable
- Opus
- Sonnet
- Haiku

### Reasoning Mode

Reasoning mode determines how the model thinks before producing a response.

On current models, the reasoning system is known as **adaptive thinking**:

- The model decides when reasoning is needed.
- The model decides how much reasoning to perform.
- You control reasoning depth through an **effort setting** instead of a fixed reasoning token budget.

### Important Changes

The older `budget_tokens` control is deprecated.

On the newest model generations, using `budget_tokens` returns a **400 error**.

### Thinking Content

On the newest models:

- Thinking content is omitted from responses by default.
- You can request summarized thinking when you want reasoning details displayed.

### When Reasoning Helps

Reasoning provides the most value for:

- Complex multi-step analysis
- Difficult coding tasks
- Planning
- Agentic workflows
- Challenging reasoning problems

Reasoning is usually unnecessary for:

- Simple lookups
- Basic classification tasks
- Straightforward extraction tasks

The key concept is that:

- **Model choice** selects the model.
- **Reasoning mode** is configured separately for each request.

Because defaults vary across model generations, verify current reasoning behavior and defaults when building production systems.

---

## How the Two Work Together

Since model choice and reasoning mode are independent, you can configure them separately.

### Example Combinations

| Configuration | Characteristics |
|-------------|----------------|
| Capable model + reasoning off | Fast, direct responses |
| Smaller model + reasoning on | Additional thinking with lower base model capability |
| Capable model + high effort reasoning | Maximum quality for difficult tasks |

For the most demanding workloads, the typical approach is to pair:

- A highly capable model
- A higher reasoning effort setting

This combination prioritizes quality over cost and latency.

### Key Takeaway

Think of these as two independent levers:

1. **Model Choice** → Determines the underlying capability, cost, and latency profile.
2. **Reasoning Mode** → Determines how much deliberate thinking the model performs for a specific request.

By combining the two appropriately, you can optimize for the balance of quality, speed, and cost required by your application.