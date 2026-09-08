---
name: notebook_template_setup
displayName: Notebook Template Setup
description: >-
  Creates or updates Jupyter notebooks using module-scoped base templates with
  optional explanatory markdown cells. Supports template selection and versioned
  template updates over time.
user-invocable: true
---

# Notebook Template Setup Skill

Use this skill to create or normalize notebooks to a known base template for a
specific module/section.

## Why this skill exists

Notebook structure in this repository is intentionally standardized by section.
This skill ensures every notebook in a section starts with the same required
setup cells, then optionally adds instructional markdown cells.

## Template selector

Always require a template identifier.

Supported templates right now:
1. `ccar_m02_s03_base_v1`

Future module templates can be added later as:
- `ccar_m02_s04_base_v1`
- `ccdvf_m0x_s0y_base_v1`
- etc.

## Inputs

Use these inputs when invoking the skill:
1. `target_notebook_path` (required)
2. `template_id` (required)
3. `with_explanations` (optional, default: `true`)
4. `explanation_level` (optional: `brief` or `detailed`, default: `detailed`)
5. `overwrite_existing_cells` (optional, default: `false`)

## Procedure

1. Confirm the target notebook file exists (or create it if requested).
2. Load notebook cells and preserve existing execution metadata unless user asks
   for a reset.
3. Apply the selected template.
4. If `with_explanations=true`, insert markdown cells between setup code blocks
   to explain purpose and execution order.
5. Keep cell metadata valid:
   - Existing cells retain unique `id`
   - All cells keep `metadata.language`
6. Validate notebook JSON after update.

## Template: ccar_m02_s03_base_v1

This is the current base template for:
- CCAR-F
- M02 Building with the Claude API
- S03 Accessing Claude with the API

### Required code cell sequence

1) Import and environment loading
```python
# Import

from anthropic import Anthropic
from dotenv import load_dotenv

# Env var
load_dotenv()
```

2) Model and client setup
```python
# Define model and client
model = "claude-haiku-4-5-20251001"

client = Anthropic()
```

3) Message state
```python
## Make an initial list of messages
messages = []
```

4) Helper functions
```python
## Define helper functions
def add_user_message(messages, text):
    return messages.append({"role": "user", "content": text})

def add_assistant_message(messages, text):
    return messages.append({"role": "assistant", "content": text})

def chat(messages, system=None):
    params = {
        "model": model,
        "max_tokens": 1000,
        "messages": messages,
    }

    if system:
        params["system"] = system

    message = client.messages.create(**params)
    return message.content[0].text
```

5) Final working cell placeholder
```python
""
```

### Optional explanatory markdown cells

When `with_explanations=true`, add markdown cells that explain:
1. Imports and environment purpose
2. Model/client setup
3. Why message history is a list
4. What each helper function does
5. What to run next in the final cell

## Update policy

This skill should be updated frequently as templates evolve.

When updating this skill:
1. Add a new template id instead of rewriting old behavior.
2. Keep previous template ids stable for reproducibility.
3. Record changes in the changelog below.

## Changelog

- v1: Added `ccar_m02_s03_base_v1` template with optional explanation cells.

## Guardrails

1. Do not read `.env` files directly.
2. Do not rename notebooks unless explicitly requested.
3. Do not remove user-authored lesson cells unless `overwrite_existing_cells=true`.
4. Keep notebook edits minimal and template-focused.
