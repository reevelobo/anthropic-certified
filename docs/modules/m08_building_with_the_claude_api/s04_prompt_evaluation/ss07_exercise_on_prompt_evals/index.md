# SS07 · Exercise on Prompt Evals

[:material-notebook-outline: Open Jupyter Notebook](../../notebooks/10.prompt_evals_exercise.ipynb){ .md-button .md-button--primary }

# Exercise Task: Give the Model Grader More Context on What a Good Solution Looks Like

## Step #1: Update the Dataset Generation Prompt

Update the dataset generation prompt to ask for some **"solution criteria"** to be included for each test case.

Example:

```json
{
  "task": "Create a JSON configuration for an AWS Lambda function that sets up a basic Python runtime with a memory allocation of 512MB and a timeout of 10 seconds",
  "format": "json",
  "solution_criteria": "Must include runtime, memory size, timeout, and basic structure for AWS Lambda configuration"
}
```

## Step #2: Update the `grade_by_model` Prompt

Update the `grade_by_model` prompt to include that solution criteria.

Example:

```text
Solution to Evaluate:

<solution>
{output}
</solution>

<!-- Add in the newly generated solution_criteria here -->
```

The goal is to provide the model grader with additional context about what a good solution should contain, allowing it to evaluate outputs more accurately against the expected requirements for each test case.