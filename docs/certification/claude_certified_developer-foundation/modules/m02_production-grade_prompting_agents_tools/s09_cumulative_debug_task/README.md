# Cumulative Debug Task

## Overview
This section provides an integrated debugging exercise that combines prompting, tools, context handling, and agent behavior.

## Learning Focus
- Diagnose failures across multiple system layers.
- Apply iterative fixes while preserving correctness.


# Cumulative debug task · Identify each bug
***The agent implementation below has four planted bugs, one in each of four layers: the schema layer, the streaming layer where the response is assembled and committed, the context layer where the message structure is built, and the memory layer.***

Work through the two stages below. This screen covers Stage 1: identify each bug. Stage 2, writing the corrected version, is on the next screen.

```python
# --- TOOL DEFINITIONS ---
tools = [
  {
    "name": "get_customer_data",
    "description": "Gets data.",
    "input_schema": { "type": "object", "properties": { "id": {"type":"string"} }, "required": ["id"] }
  }
]

# --- AGENT LOOP ---
def run_agent(user_request, session_history):
  messages = session_history + [{"role":"user","content":user_request}]
  while True:
    blocks = {}
    stop_seen = False
    with client.messages.stream(
        model=model, max_tokens=4096, tools=tools, messages=messages,
        thinking={"type": "adaptive"}
    ) as stream:
      for event in stream:
        if event.type == "content_block_start":
          blocks[event.index] = init_block(event)
        elif event.type == "content_block_delta":
          apply_delta(blocks[event.index], event.delta)
        elif event.type == "message_stop":
          stop_seen = True
    assistant_content = [b for b in assemble(blocks) if b["type"] != "thinking"]
    messages.append({"role": "assistant", "content": assistant_content})
    response = finalize(blocks)
    if response.stop_reason == "end_turn":
      return response
    for block in response.content:
      if block.type == "tool_use":
        result = execute_tool(block.name, block.input)
        messages.append({"role":"user","content":[{"type":"tool_result",
                         "tool_use_id":block.id,"content":result}]})

# --- MEMORY ---
def build_session_history(prior_sessions):
  # Concatenating all prior session transcripts in-context
  full_history = []
  for session in prior_sessions:
    full_history.extend(session["messages"])
  return full_history
```

## Stage 1: Identify each bug
The implementation above has four bugs, one in each of four layers. For each bug: name the layer it belongs to and write one sentence describing what it causes at runtime.


### 1. Schema Layer Bug

**Bug:** The tool schema is overly vague (`"Gets data."`) and does not clearly define the purpose, expected inputs, or outputs of the tool.

**Runtime impact:** The model has insufficient information to reliably decide when to call the tool or how to construct the correct input, increasing the likelihood of incorrect tool usage.

---

### 2. Streaming Layer Bug

**Bug:** The code commits the assembled assistant message (`messages.append(...)`) before verifying that the stream completed successfully via the `message_stop` event.

**Runtime impact:** If streaming is interrupted or incomplete, a partial assistant response can be written into conversation history, corrupting the transcript and causing downstream tool-use or reasoning errors.

---

### 3. Context Layer Bug

**Bug:** The assistant message stored in `messages` removes all `thinking` blocks:

```python
assistant_content = [b for b in assemble(blocks) if b["type"] != "thinking"]
```

while the response is later reconstructed from:

```python
response = finalize(blocks)
```

**Runtime impact:** The conversation history no longer matches the model's actual response structure, causing context reconstruction issues and breaking continuity between turns.

---

### 4. Memory Layer Bug

**Bug:** `build_session_history()` concatenates every prior session transcript into the active context:

```python
for session in prior_sessions:
    full_history.extend(session["messages"])
```

**Runtime impact:** Context size grows indefinitely across sessions, leading to escalating token costs, increased latency, and eventual context-window exhaustion in long-running deployments.

---

# Cumulative debug task · Write the corrected version

## Stage 2

**Write the corrected version of each bug identified on the previous screen. For each one, show the fixed code and name what it changes.**

---

## 1. Schema Layer Fix

### What it changes

Makes the tool purpose explicit so the model can reliably determine when to call the tool and how to populate its arguments.

### Fixed code

```python
tools = [
  {
    "name": "get_customer_data",
    "description": (
      "Retrieve customer account information using a customer ID. "
      "Use this tool when the user asks about account details, "
      "subscription status, billing history, or customer records."
    ),
    "input_schema": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique customer identifier"
        }
      },
      "required": ["id"]
    }
  }
]
```

---

## 2. Streaming Layer Fix

### What it changes

Ensures a streamed response is committed only after the stream is completed successfully and a `message_stop` event is received.

### Fixed code

```python
with client.messages.stream(
    model=model,
    max_tokens=4096,
    tools=tools,
    messages=messages,
    thinking={"type": "adaptive"}
) as stream:

    for event in stream:
        if event.type == "content_block_start":
            blocks[event.index] = init_block(event)

        elif event.type == "content_block_delta":
            apply_delta(blocks[event.index], event.delta)

        elif event.type == "message_stop":
            stop_seen = True

if not stop_seen:
    raise RuntimeError("Stream terminated before message_stop")

response = finalize(blocks)
```

---

## 3. Context Layer Fix

### What it changes

Preserves the assistant response exactly as returned by the model, ensuring future turns receive a valid and complete conversation history.

### Fixed code

```python
response = finalize(blocks)

messages.append({
    "role": "assistant",
    "content": response.content
})
```

### Instead of

```python
assistant_content = [
    b for b in assemble(blocks)
    if b["type"] != "thinking"
]

messages.append({
    "role": "assistant",
    "content": assistant_content
})
```

---

## 4. Memory Layer Fix

### What it changes

Moves long-term state into external storage and injects only the information required for the current session, preventing context-window growth across sessions.

### Fixed code

```python
def build_session_history(customer_id):
    summary = database.load_session_summary(customer_id)

    if not summary:
        return []

    return [
        {
            "role": "system",
            "content": (
                f"Relevant prior session summary:\n{summary}"
            )
        }
    ]
```

### Instead of

```python
def build_session_history(prior_sessions):
    full_history = []

    for session in prior_sessions:
        full_history.extend(session["messages"])

    return full_history
```

---

# Summary

### Schema Layer
- Replace vague tool descriptions with explicit usage guidance.

### Streaming Layer
- Verify `message_stop` before committing the response.

### Context Layer
- Store the assistant response exactly as returned rather than rebuilding or filtering content.

### Memory Layer
- Use external persistence (summaries or retrieval) instead of concatenating all historical transcripts into the active context window.
``
