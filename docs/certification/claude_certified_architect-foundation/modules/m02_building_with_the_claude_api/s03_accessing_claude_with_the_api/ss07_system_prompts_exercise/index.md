# SS07 · System Prompts Exercise

[:material-notebook-outline: Open Jupyter Notebook](../../notebooks/04.sys_prompt_exercise.ipynb){ .md-button .md-button--primary }

## Exercise Overview

In this exercise, you will compare Claude's response to the same request in two modes:
1. Without a system prompt (baseline)
2. With a concise system prompt (constrained output)

## Objectives

1. Practice building a small chat flow with helper functions
2. Observe how system prompts change response behavior
3. Evaluate output differences in verbosity, format, and instruction-following

## Steps

1. Run the setup cells to import dependencies, configure the model, and initialize `messages`.
2. Run the helper-function cell (`add_user_message`, `add_assistant_message`, `chat`).
3. Submit a baseline prompt and inspect the first output.
4. Add a system prompt and run the same request again.
5. Compare the two outputs and document your observations.

## What To Look For

Use these checks while reviewing results:
1. Is the system-prompt response shorter?
2. Does it better follow requested format constraints?
3. Is the output more consistent with your role/style instruction?

## Reflection

Write 2-3 notes after running the notebook:
1. Which system prompt wording worked best and why?
2. What behavior changed the most?
3. What prompt tweak would you test next?
