# How LLMs Behave: Tokens, Context, Sampling, Non-Determinism

## Tokens: The Unit of Input, Output, and Cost

Claude does not read characters or words directly. It reads **tokens**, and the characters-per-token average depends on the tokenizer of the model at hand and differs between model generations.

Treat any characters-per-token rule of thumb as model-dependent and confirm current tokenizer behavior at build time.

Everything the model processes is counted in tokens:

- Your prompt
- The conversation history
- Tool definitions
- Tool results
- The response the model generates

Tokens are the unit of both pricing and budget, so when you estimate what a feature costs or whether an input fits, you are counting tokens, not words.

A useful habit is to think in tokens, since that is the unit the API bills in and the context window measures.

---

## The Context Window: A Fixed Budget

The **context window** is the total number of tokens the model can take in for a single request.

It holds everything at once:

- The system prompt
- The full conversation so far
- Any documents you inject
- Every tool result
- The model output

It is a fixed budget with two distinct edge behaviors:

1. A request whose input is already larger than the window is rejected with a validation error before generation begins.

2. A request that fits on input can still reach the ceiling during generation. Current models then stop and return the output generated so far with a `model_context_window_exceeded` stop reason rather than raising an error.

Either way, keeping a long session running requires the application to trim or summarize history before each call.

In development, the window rarely fills because test inputs are short. In production, longer inputs and more turns fill the window faster.

This is the failure Module 2 explores in detail.

---

## Sampling: Why the Same Prompt Can Give Different Answers

A language model does not pick one fixed next token.

At each step it produces a probability distribution over possible next tokens and then **samples** from it.

Settings such as temperature shape that distribution:

- A lower temperature concentrates probability on the most likely tokens and makes output more repeatable.
- A higher temperature spreads probability out and makes output more varied.

Because the choice is sampled rather than fixed, the same prompt run twice can return different wording even when both answers are correct.

This is a property of how the model generates.

### Important Note

Sampling controls are model-dependent.

The newest Claude models do not accept non-default sampling parameters. Setting:

- `temperature`
- `top_p`
- `top_k`

returns a 400 error, and behavior on those models is steered through prompting instead.

Even where temperature is accepted, a temperature of `0` makes outputs more repeatable but does **not** guarantee identical outputs across calls.

Confirm current parameter support in the API reference at build time.

---

## Non-Determinism: What It Means for Testing and Evals

**Non-determinism** is the primary consequence of sampling: identical inputs do not guarantee identical outputs.

That changes how you test a Claude feature.

A test that asserts the exact text of a response will be inconsistent because the model can express the same correct answer in many different ways.

Instead, assert on properties that must hold, such as:

- A required field is present
- A value is within an expected range
- The output structure parses correctly

When you need to judge meaning rather than structure, use an evaluation framework with a model-graded judge.

This is why the course treats evals as the standard for determining whether a feature is correct, and why Module 3 builds that capability.