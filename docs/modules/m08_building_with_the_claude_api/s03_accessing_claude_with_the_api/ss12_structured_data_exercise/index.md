# SS12 · Structured Data Exercise

[:material-notebook-outline: Open Jupyter Notebook](../../notebooks/08.structured_data_exercise.ipynb){ .md-button .md-button--primary }

# Exercise!

- Use message prefilling and stop sequences *only* to get three different commands in a single response
- There shouldn't be any comments or explanation
- Hint: message prefilling isn't limited to just characters like ```

```python
messages = []

prompt = """
Generate three different sample AWS CLI commands. Each should be very short.
"""

add_user_message(messages, prompt)

text = chat(messages)
text.strip()

from IPython.display import Markdown

Markdown(text)
```
