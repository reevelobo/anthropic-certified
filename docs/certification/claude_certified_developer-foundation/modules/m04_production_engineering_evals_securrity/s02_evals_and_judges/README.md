# Defining Done Before You Ship: Evals and a Calibrated Judge

Your success metric is simple: the code works correctly. The agents and tools you built in the prior modules answer correctly when you try them by hand. The gap is that "I tried it a few times and it looked right" is not a signal you can track.

The first thing production hardening needs is a way to turn that intuition into a measurable number that you can track as the prompt, the tools, or the model change. That is what an eval gives you, and the rest of this module leans on it.

---

# Write the Design Document That States What's Done, Safe, and Affordable

Before you write any production code, write down what you are going to build and how you will know it is right. A design document is that written record. It is a short file, usually a single markdown page, that states:

- The success criteria for the features
- The failures the system must survive
- The cost and latency the system must stay inside
- The trust boundary the system must defend

It is the planning step that comes before implementation, and it exists so that you define what is correct instead of rationalizing whatever the model produces later.

The reason the document comes first is that every production layer in this module is based on it:

- The success criteria become the cases against which your eval is graded.
- The failures you listed become the retriable and terminal cases your error handling must cover.
- The cost and latency numbers become the budget you instrument against and the floor you refuse to optimize below.
- The trust boundary becomes the input you treat as data and the action you gate with a hook.

Writing those four decisions down once, before you build, is what keeps the layers consistent with each other instead of each one solving a different problem.

A useful design document holds four decisions, each stated concretely enough that someone could check the built system against it.

## 1. Success Criteria

Success criteria name what the feature must produce.

State the output for representative cases in terms specific enough to grade, because a vague goal like **"summarize the thread"** cannot be checked while **"a two-sentence summary that lists every action item and its owner"** can.

These criteria are what your eval set is built from, so writing them first is what makes the eval possible.

## 2. Failure Handling

Failure handling names the failures the system must survive and what it does for each.

List the errors production will throw, mark each one retriable or terminal, and say what the user gets when a failure cannot be recovered.

Deciding this on paper is what stops the first real rate-limit response from being the moment you discover you have no error path.

## 3. Cost and Latency Budget

Cost and latency budget names the ceiling the system must stay under and the reliability floor it cannot trade away.

Set hard cost and latency budgets before architecture is determined.

Write:

- The per-request budget
- The monthly cost ceiling
- The latency target
- The minimum reliability requirement

Setting these numbers before you build is what lets you check the architecture against the budget before a line of code is written.

## 4. Trust Boundary

Trust boundary names which inputs are untrusted and what the system is allowed to do.

Write down:

- Which content the agent reads that someone else can write
- The smallest set of actions and access the feature needs to do its job

Naming the boundary on paper is what turns least privilege into a design decision you can enforce with a hook rather than a setting you remember to add later.

If you build an agentic coding tool, this document is also what you hand in before it writes anything. Plan the work first and capture the result as a written artifact, then implement against it. A tool given clear success criteria and explicit constraints makes fewer assumptions and produces code you can check against the document you already agreed on.

The rest of this module teaches each of the four decisions in turn, and the cumulative task at the end asks you to harden a system against all four at once.

---

# An Eval Is the Test Set That Defines What a Feature Must Do Before It Ships

An eval works the way a thermometer does. It does not make the patient healthier. It just gives you a number you can trust.

Before you have one, **"done"** is a feeling. After, it is a score on a fixed set of cases.

You collect a set of input cases. For each one you write down the behavior you expect. You run the feature on every case and grade the output against that expected behavior.

The collection of cases, expectations, and grades is the eval.

**"Done"** stops being a feeling after a few manual tries and becomes a score.

You write the eval before the feature because it forces you to define success before implementation begins. Otherwise, you may find yourself rationalizing whatever output the model produces later.

The pipeline is small and requires the same framework every time:

1. Load a dataset of cases.
2. Run each case through the feature.
3. Grade each result.
4. Average the scores.

A minimal implementation is only a few functions.

```python
def run_test_case(test_case):
    """Run one case through the feature, then grade the result."""
    output = run_prompt(test_case)
    score = grade(test_case, output)  # grading covered below
    return {
        "output": output,
        "test_case": test_case,
        "score": score
    }

def run_eval(dataset):
    """Run every case and report the average score."""
    results = [run_test_case(c) for c in dataset]
    average = sum(r["score"] for r in results) / len(results)
    print(f"Average score: {average}")
    return results
```

The score on its own is not inherently good or bad. The first attempt scoring two or three out of ten is normal.

What matters is whether the number increases as you change:

- The prompt
- The tools
- The model

Change one of these at a time, so that you know which caused the improvement.

The eval is the instrument that makes that change measurable instead of a matter of opinion.

---

# Matching the Grading Method to the Shape of the Output

The grader is the part that turns an output into a measurable signal, usually a number between one and ten.

There are three ways to produce that signal, and choosing the wrong one is where eval effort gets wasted.

## 1. Exact or String Match

Works when the output has one correct form.

A classifier that must return one label, or a function that must return a known value, can be checked character by character.

It is:

- The cheapest grader
- The most brittle grader

Any acceptable paraphrase of an open-ended answer fails it.

It is the wrong tool anytime the output can be phrased more than one way.

## 2. Code-Graded Checks

Work when a function can validate the output.

Examples include:

- Valid JSON
- Parseable Python
- A number inside a range
- A response containing a required field

The output does not have to match a fixed string, only satisfy a rule.

This method catches format and syntax failures a string match would miss, and a human would find tedious to check by hand.

## 3. LLM-as-Judge

Works for open-ended outputs where quality matters but cannot be evaluated through pattern matching.

You give a second model:

- The output
- A rubric

The model returns:

- A score
- Supporting reasoning

This is the only method that scales questions like:

- "Is this summary faithful?"
- "Did this answer follow the instructions?"

No code rule captures those concepts.

It is also:

- The most expensive grader
- The noisiest grader

Using it when a code check would suffice adds cost and variance for no gain.

---

# Simple Code Graders

A code grader is often just a parse attempt.

If the output parses into the required format, it scores well. If parsing throws an error, it scores zero.

That is enough to catch a whole class of format failures cheaply.

```python
import json
import ast

def validate_json(text):
    try:
        json.loads(text.strip())
        return 10  # parses as JSON
    except json.JSONDecodeError:
        return 0   # malformed, fail the case

def validate_python(text):
    try:
        ast.parse(text.strip())
        return 10
    except SyntaxError:
        return 0
```

---

# Choosing the Right Grader

Imagine a feature that should return the three capital cities of a region as a JSON array.

One run returns the array in a different order than your reference string.

An exact match scores zero because the characters do not line up, even though the answer is correct.

A code grader that parses the JSON and checks membership scores it well because:

- All three cities are present
- The structure is valid

Now imagine the feature should return a one-paragraph rationale for a recommendation.

A code grader can confirm only that it is a non-empty string, which is nearly worthless.

An exact match is hopeless because no two good rationales are worded the same way.

Only a judge can determine whether the rationale is faithful and complete.

The method follows directly from the output structure:

- One correct form → Exact match
- Structural rule → Code check
- Open-ended quality → Judge

---

# Cost Considerations

There is also a cost dimension that simple comparisons often understate.

Exact match and code checks:

- Run locally
- Cost essentially nothing per case
- Scale to thousands of test cases

A judge requires a second model call per case.

A thousand-case eval graded by a judge means a thousand additional API calls every time the eval runs.

That is reasonable for:

- Periodic full evaluations

It is wasteful for:

- Tight development loops

Many teams:

- Run code-based grading on every commit
- Reserve judge-based grading for scheduled quality evaluations

Matching the grader to the task is partly about signal and partly about how often you can afford to run it.

---

# Grader Selection Table

| Task Type | Grading Method | What It Catches | Where It Is Unreliable |
|------------|----------------|-----------------|-------------------------|
| Single correct label or value | Exact or string match | A wrong answer when there is exactly one correct answer, with zero ambiguity and near-zero cost | Fails every valid paraphrase or reordering, so it is wrong for anything open-ended |
| Structured or code output | Code-graded check | Invalid JSON, unparseable code, out-of-range numbers, and missing required fields | Says nothing about whether the content is good, only that it is well-formed |
| Open-ended quality | LLM-as-judge | Faithfulness, instruction following, completeness, and tone that no code rule expresses | Noisy and costly and produces a confident-looking number that means nothing until it is calibrated |

> **Of the three methods above, the judge is the only one you must build and tune, so it deserves deeper treatment.**

---

# Building and Calibrating the Judge

A judge is a second model call guided by a clear rubric.

What makes it usable is asking it to provide:

- Strengths
- Weaknesses
- Reasoning
- Score

rather than returning a score alone.

Without this, models tend to drift toward safe middle scores, often around six, regardless of actual quality.

Requiring reasoning first anchors the score to concrete observations.

```python
def grade_by_model(task, solution):
    eval_prompt = f"""
    You are an expert reviewer. Evaluate the solution for the task.

    Task: {task}
    Solution: {solution}

    Return JSON with:
      "strengths":  array of 1-3 points
      "weaknesses": array of 1-3 points
      "reasoning":  a one to two sentence explanation, 50 words maximum
      "score":      a number from 1 to 10
    """

    messages = [{"role": "user", "content": eval_prompt}]
    result = chat(messages)  # returns the JSON above

    return json.loads(result)
```

---

# Calibration Makes the Judge Trustworthy

Most people skip calibration. That is what makes the judge unreliable.

Start with a set of cases already labeled by humans.

Then:

1. Run the judge on the same cases.
2. Compare judge scores with human labels.
3. Measure agreement.

A judge that disagrees with humans half the time produces numbers that look rigorous but add no value.

Agreement testing turns the judge from a guess into evidence you can defend.

If agreement is low:

- Tighten score definitions.
- Add examples of good answers.
- Add examples of poor answers.
- Re-measure agreement.

Repeat until the rubric consistently aligns with human judgment.

---

# Coverage Matters More Than Perfection

A larger evaluation set with slightly noisier automated grading usually reveals more than a tiny set of carefully hand-graded examples.

The goal of an eval is not to create the perfect rubric.

The goal is to catch regressions.

Twenty cases that include irregular and edge inputs will catch failures that three carefully chosen examples never exercise.

When you need more cases, you can generate additional test cases from a small labeled seed set, then spot-check the results to maintain quality.

Coverage catches edge cases, and coverage comes from volume.

---

# The Eval Improvement Loop

The workflow is straightforward:

1. Set a goal.
2. Write an initial prompt.
3. Run the eval.
4. Examine failures.
5. Apply one prompt-engineering change.
6. Run the eval again.

Repeat until the score consistently reaches the target.

The eval is what tells you that a change helped rather than merely feeling different.

The key strategy is changing one thing at a time.

If you simultaneously:

- Rewrite the prompt
- Add examples
- Switch models

and the score changes, you learn nothing about which change mattered.

Instead:

1. Move one lever.
2. Re-run the eval.
3. Review per-case results.
4. Keep the change only if the score improves.

This is slower for one iteration but much faster over the lifetime of the feature because it teaches you what drives performance.

---

# Why Per-Case Results Matter

The average score is only part of the story.

A stable average can hide a change that:

- Fixed three cases
- Broke three different cases

The average remains unchanged even though behavior shifted significantly.

The per-case breakdown exposes those changes immediately.

---

# Turning Failures Into Improvements

A low score is actionable information.

When a case fails, the important question is not *whether* it failed but *why*.

Common patterns include:

- **Formatting failures** → Prompt output instructions
- **Factual failures on retrieved content** → Retrieval system
- **Failures on long inputs** → Context management

The eval identifies the failing case.

The per-case output identifies the category of failure.

That transforms the next iteration from guessing into targeted debugging.

---

# Summary

## Handles Well

Turns "looks right" into a tracked score you can defend and improve by making one deliberate change at a time.

## Adds Cost or Complexity

Authoring evaluation cases and calibrating a judge requires meaningful upfront work before the feature ships.

## Use a Different Approach

For a single fixed-format output, a code-based validation check is usually sufficient. Skip the judge entirely.

# The Demo That Passed and the Edge Case That Did Not

## Setup

You watched the agent answer correctly a dozen times, so you concluded it was done.

The problem was that those dozen attempts all used inputs that looked like the ones you had in mind when you built it.

---

## Postmortem: The Feature Passed Every Check It Had, and Still Extracted the Wrong Value

A team shipped a feature that extracted structured fields from customer messages.

Before launch, they ran it through roughly a dozen example messages, read the outputs, agreed they looked right, and moved into deployment.

The feature had input validation in place:

- It confirmed each message was non-empty text.
- It checked that a date field came back populated.
- It rejected extractions that returned a malformed or impossible date.

For two weeks it appeared to work as expected.

Then a customer sent a message that put two dates in one sentence:

> "I placed my order on March 3 but did not receive it until April 12."

The feature extracted **April 12** as the order date.

Every validation check passed because:

- Both dates were well-formed.
- The field came back populated.

Validation confirms that a value is the right shape.

Validation cannot confirm that the value is the right one.

Downstream logic acted on the wrong date, and a batch of records was updated incorrectly.

The review found no bug in the model or in the prompt.

The feature had never been measured against a message containing two dates because nobody had defined the expected behavior for that case as a graded example.

The dozen manual checks all used single-date messages, which is the input the builder pictured.

There was no holdout set, so there was no signal that the two-date input existed in the population.

The missing graded set was the root cause.

Some behavior change, most likely a prompt change naming which date to extract, corrected the output.

The eval did not fix the extraction.

The eval:

- Detected the failure
- Documented the expected behavior as a checkable case
- Guarded against the same regression on every future change

The two-date message became case one in that set.

---

## Finding Edge Cases Before Customers Do

One way to find inputs like this before a customer does is to ask the model to enumerate edge cases that could break the current implementation.

Examples include:

- Two dates in one sentence
- No date at all
- A relative date such as "next Tuesday"

Turn plausible edge cases into graded examples with a human-checked expected output.

This is the same case-generation technique discussed in the eval-building section, applied before launch rather than after a production incident.

---

## Why This Broke

Success was judged by impression instead of a graded set.

The eval is what:

- Surfaces failures
- Measures performance
- Guards against regression

The prompt is what changes the output.

Write the expected behavior down as graded cases before shipping, and use the model to help identify the edge inputs you did not think to test.


# Complete a partial eval for a summarization feature

This eval has two gaps. For the dataset, identify the specific output each input case should produce. For the judge prompt, match each score band to what it means. Drag each answer card from the bank onto its row below.

## DATASET.JSON

```json
[
  {
    "input": "Long support thread about a delayed refund, 14 messages",
    "expected_behavior": "A 2-sentence summary naming the issue (delayed refund) and the current status (escalated)"
  },
  {
    "input": "Meeting transcript where three action items are assigned",
    "expected_behavior": "..."
  },
  {
    "input": "Bug report with repro steps and one unrelated aside",
    "expected_behavior": "..."
  }
]
```

## JUDGE_PROMPT.TXT

```text
You are grading a summary against its expected behavior.

Summary: {output}
Expected behavior: {expected_behavior}

Return JSON with "strengths", "weaknesses", "reasoning", and "score".

Score scale: 1 to 3, 4 to 7, 8 to 10 (see below to complete the definitions).
```

## Answer Bank

1. A summary that lists all three action items with their owners
2. A summary of the bug and its repro steps that omits the unrelated aside
3. Misses required content
4. Partial: some required content present, some missing
5. Complete and faithful to the expected behavior

---

# Filled Answers

## Expected output for the meeting-transcript case

**A summary that lists all three action items with their owners**

## Expected output for the bug-report case

**A summary of the bug and its repro steps that omits the unrelated aside**

## Judge score band 1 to 3

**Misses required content**

## Judge score band 4 to 7

**Partial: some required content present, some missing**

## Judge score band 8 to 10

**Complete and faithful to the expected behavior**

---

# Technical Reasoning

## 1. Meeting Transcript → "A summary that lists all three action items with their owners"

### Why this is correct

The input explicitly states:

> "Meeting transcript where three action items are assigned"

A good evaluation target for summarization should capture the key actionable outcomes of the meeting. Merely summarizing the discussion would not satisfy the expected behavior because the most important information is the assigned tasks.

The answer choice:

> "A summary that lists all three action items with their owners"

is the only option that:

- Preserves all action items.
- Preserves accountability by including owners.
- Aligns directly with the input's focus on assigned actions.
- Represents a measurable expected behavior suitable for an eval.

---

## 2. Bug Report → "A summary of the bug and its repro steps that omits the unrelated aside"

### Why this is correct

The input states:

> "Bug report with repro steps and one unrelated aside"

An effective software bug summary should:

- Identify the bug.
- Keep the reproduction steps.
- Remove irrelevant information.

The phrase:

> "omits the unrelated aside"

is critical because summarization quality includes relevance filtering. A strong summarizer should compress useful information while dropping noise.

This answer is therefore the precise expected behavior.

---

## 3. Score Band 1–3 → "Misses required content"

### Why this is correct

The lowest scoring band should represent a failure to satisfy the expected behavior.

Examples:

- Missing the refund status.
- Omitting action items.
- Not mentioning repro steps.
- Producing an unrelated summary.

These outputs fail core requirements and therefore belong in the lowest range.

---

## 4. Score Band 4–7 → "Partial: some required content present, some missing"

### Why this is correct

Middle scores generally indicate mixed quality.

Examples:

- Includes only 2 of 3 action items.
- Mentions the bug but not all repro steps.
- Captures the issue but not the escalation status.

The summary shows some understanding but does not fully satisfy the expected behavior.

This is exactly what "partial" means in an evaluation rubric.

---

## 5. Score Band 8–10 → "Complete and faithful to the expected behavior"

### Why this is correct

The highest score should represent:

- Completeness.
- Accuracy.
- Faithfulness to the source content.
- Adherence to the expected behavior specification.

Examples:

- Refund summary includes both issue and current status.
- Meeting summary contains all three action items and owners.
- Bug summary contains the bug details and repro steps while excluding irrelevant content.

These characteristics match the definition:

> "Complete and faithful to the expected behavior"

which is therefore the correct mapping for scores 8–10.

---

# Final Answer Key

```text
Expected output for the meeting-transcript case:
→ A summary that lists all three action items with their owners

Expected output for the bug-report case:
→ A summary of the bug and its repro steps that omits the unrelated aside

Judge score band 1 to 3:
→ Misses required content

Judge score band 4 to 7:
→ Partial: some required content present, some missing

Judge score band 8 to 10:
→ Complete and faithful to the expected behavior
```