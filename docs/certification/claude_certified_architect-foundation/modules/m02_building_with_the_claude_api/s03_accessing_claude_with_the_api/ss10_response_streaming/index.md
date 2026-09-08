# SS10 · Response Streaming

When building chat applications with Claude, there's a significant user experience challenge: responses can take 10–30 seconds to generate, leaving users staring at a loading spinner.

[:material-notebook-outline: Open Jupyter Notebook](../../notebooks/06.response_streaming.ipynb){ .md-button .md-button--primary }

![alt text](image.png)

The solution is response streaming, which lets users see text appear chunk by chunk as Claude generates it, creating a much more responsive feel.

## The Problem with Standard Responses

In a typical chat setup, your server sends a user message to Claude and waits for the complete response before sending anything back to the client. This creates an awkward delay where users have no feedback that anything is happening.

![alt text](image-1.png)

## How Streaming Works

With streaming enabled, Claude immediately sends back an initial response indicating it has received your request and is starting to generate text. Then you receive a series of events, each containing a small piece of the overall response.

![alt text](image-2.png)

Your server can forward these text chunks to your client application as they arrive, allowing users to see the response building up word by word. All of these events are part of a single request to Claude.

![alt text](image-3.png)

## Understanding Stream Events

When you enable streaming, Claude sends back several types of events:

1. **MessageStart** – A new message is being sent
2. **ContentBlockStart** – Start of a new block containing text, tool use, or other content
3. **ContentBlockDelta** – Chunks of the actual generated text
4. **ContentBlockStop** – The current content block has been completed
5. **MessageDelta** – The current message is complete
6. **MessageStop** – End of information about the current message

![alt text](image-4.png)

The **ContentBlockDelta** events contain the actual generated text that you'll want to display to users.

## Basic Streaming Implementation

To enable streaming, add `stream=True` to your `messages.create` call:

```python
messages = []
add_user_message(messages, "Write a 1 sentence description of a fake database")

stream = client.messages.create(
    model=model,
    max_tokens=1000,
    messages=messages,
    stream=True
)

for event in stream:
    print(event)
```

![alt text](image-5.png)

## Simplified Text Streaming

Rather than manually parsing events, you can use the SDK's simplified streaming interface that extracts just the text content:

```python
with client.messages.stream(
    model=model,
    max_tokens=1000,
    messages=messages
) as stream:
    for text in stream.text_stream:
        print(text, end="")
```

This approach automatically filters out everything except the actual text content, which is usually what you need for displaying responses to users.

## Getting the Complete Message

While streaming individual chunks is great for user experience, you often need the complete message