# SS13 · Quiz on Accessing Claude with the API

# Image Transcription

**Question:**

> You want to send a request to Claude's API. What's the minimum information you must include?

**Options:**

1. Only the API key and your question
2. Just your message text
3. API key, model name, messages, and max tokens
4. Your name, email, and message

**Button:**

- Next Question

---

# Correct Answer

✅ **API key, model name, messages, and max tokens**

---

# Technical Reasoning

When making a request to Claude's Messages API, the request must contain several required fields for the API to process the request successfully.

A minimal valid request typically includes:

```json
{
  "model": "claude-sonnet-4",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Hello Claude"
    }
  ]
}
```

Additionally, the request must be authenticated using an API key in the HTTP headers:

```http
x-api-key: YOUR_API_KEY
anthropic-version: 2023-06-01
```

## Why the Other Answers Are Wrong

### ❌ Only the API key and your question

Not sufficient.

The API also requires:

- A model identifier
- A `messages` array
- A `max_tokens` value

Without these fields, the API cannot determine which model to use or how many tokens it may generate.

---

### ❌ Just your message text

Not sufficient.

The API cannot process a request with only message text because:

- No authentication exists
- No model is specified
- No token limit is specified

---

### ✅ API key, model name, messages, and max tokens

Correct.

These elements represent the minimum information needed to:

1. Authenticate the request
2. Select a model
3. Provide the conversation content
4. Define generation limits

Together they form the minimum practical API request.

---

### ❌ Your name, email, and message

Not required.

The Claude API does not require:

- Personal name
- Email address

Authentication is handled through the API key, not by user identity information.

---

# Example Minimal Request

```bash
curl https://api.anthropic.com/v1/messages \
  --header "x-api-key: YOUR_API_KEY" \
  --header "anthropic-version: 2023-06-01" \
  --header "content-type: application/json" \
  --data '{
    "model": "claude-sonnet-4",
    "max_tokens": 100,
    "messages": [
      {
        "role": "user",
        "content": "Hello"
      }
    ]
  }'
```

# Key Takeaway

The minimum required information is:

- API Key (authentication)
- Model Name (which Claude model to use)
- Messages (conversation content)
- Max Tokens (output limit)

**Correct Answer: Option 3**

# Image Transcription

**Question:**

> You ask Claude "What is pizza?" and it answers. Then you ask "What toppings are popular?" but Claude doesn't understand what you're referring to. What's the problem?

**Options:**

1. Your internet connection is slow
2. Claude is broken
3. You asked too quickly
4. Claude doesn't remember previous messages

---

# Correct Answer

✅ **Claude doesn't remember previous messages**

---

# Technical Reasoning

Large Language Models do not automatically remember previous interactions unless the earlier messages are included in the API request.

When using the Claude API, every request is fundamentally stateless. This means Claude only sees the contents of the current `messages` array that you send with the request.

For example:

```python
messages = [
    {
        "role": "user",
        "content": "What is pizza?"
    }
]
```

Claude can answer because the context is present.

If a second request is sent as:

```python
messages = [
    {
        "role": "user",
        "content": "What toppings are popular?"
    }
]
```

Claude has no information about pizza because the earlier conversation was not included.

To maintain conversational context, you must send the complete conversation history:

```python
messages = [
    {
        "role": "user",
        "content": "What is pizza?"
    },
    {
        "role": "assistant",
        "content": "Pizza is a popular dish consisting of a baked flatbread with toppings."
    },
    {
        "role": "user",
        "content": "What toppings are popular?"
    }
]
```

Now Claude can correctly infer that "toppings" refers to pizza toppings.

---

# Why the Other Answers Are Wrong

### ❌ Your internet connection is slow

A slow internet connection might delay responses but it would not cause Claude to lose conversational context.

Context loss is a request construction issue, not a networking issue.

---

### ❌ Claude is broken

Claude is functioning as designed.

The API requires developers to provide conversation history when context is needed.

---

### ❌ You asked too quickly

The timing between messages has no impact on Claude's ability to understand context.

What matters is whether previous messages are included in the request.

---

### ✅ Claude doesn't remember previous messages

Correct.

Claude only knows what exists in the conversation history that is sent to the API.

If prior messages are omitted, Claude cannot reference them.

---

# Example of Incorrect Usage

```python
# Request 1
messages = [
    {"role": "user", "content": "What is pizza?"}
]

# Request 2
messages = [
    {"role": "user", "content": "What toppings are popular?"}
]
```

Result:

Claude may not know what "toppings" refers to.

---

# Example of Correct Usage

```python
messages = [
    {"role": "user", "content": "What is pizza?"},
    {
        "role": "assistant",
        "content": "Pizza is a baked flatbread dish topped with ingredients."
    },
    {"role": "user", "content": "What toppings are popular?"}
]
```

Result:

Claude understands that "toppings" refers to pizza toppings.

---

# Key Takeaway

Claude's API does not automatically retain memory between requests.

To maintain context:

- Include previous user messages
- Include previous assistant responses
- Send the conversation history in the `messages` array

**Correct Answer: Option 4 — Claude doesn't remember previous messages**

# Image Transcription

**Question:**

> When Claude processes your text, what's the first thing it does?

**Options:**

1. Generates a response immediately
2. Checks if it's appropriate content
3. Breaks it into smaller chunks called tokens
4. Translates it to another language

**Buttons:**

- Previous
- Next Question

---

# Correct Answer

✅ **Breaks it into smaller chunks called tokens**

---

# Technical Reasoning

Large Language Models (LLMs) such as Claude do not process raw text directly. Before any reasoning, understanding, or response generation can occur, the input text must first be converted into **tokens**.

A token is a small unit of text that may represent:

- A whole word
- Part of a word
- A punctuation mark
- A number
- Special symbols

For example:

```text
Hello, world!
```

might be broken into tokens similar to:

```text
["Hello", ",", " world", "!"]
```

The exact tokenization depends on the tokenizer used by the model.

---

# Why Tokenization Happens First

The neural network underlying Claude operates on numerical representations rather than raw text.

Processing typically follows this sequence:

```text
User Text
    ↓
Tokenization
    ↓
Convert Tokens to Numeric Representations
    ↓
Model Processing and Reasoning
    ↓
Generate Output Tokens
    ↓
Convert Tokens Back to Text
```

Without tokenization, the model cannot interpret the input.

---

# Why the Other Answers Are Wrong

### ❌ Generates a response immediately

Incorrect.

Claude cannot generate a response from raw text until the text has first been tokenized and converted into a format the neural network can understand.

Response generation occurs much later in the pipeline.

---

### ❌ Checks if it's appropriate content

Incorrect.

Safety and moderation systems may be applied during processing, but the text must first be tokenized so the model and associated systems can analyze it.

Tokenization is an earlier and more fundamental step.

---

### ✅ Breaks it into smaller chunks called tokens

Correct.

Tokenization is the first essential processing step that converts human-readable text into units that the model can work with computationally.

Every prompt sent to Claude is tokenized before any reasoning or response generation begins.

---

### ❌ Translates it to another language

Incorrect.

Claude does not automatically translate user input before processing.

If translation is needed, it occurs only when explicitly requested or when it is part of solving the task.

---

# Example

User input:

```text
Explain how AWS Lambda works.
```

Possible tokenization:

```text
["Explain", " how", " AWS", " Lambda", " works", "."]
```

Claude then processes these tokens, predicts the most appropriate next tokens, and ultimately generates a response.

---

# Why Tokens Matter

Tokenization is important because:

- Context windows are measured in tokens
- API usage is billed based on tokens
- Input limits are measured in tokens
- Output limits are measured in tokens
- Model reasoning operates on token sequences

For example:

```text
Short sentence  → fewer tokens
Long document   → more tokens
```

This is why Claude APIs expose concepts such as:

```json
{
  "max_tokens": 1024
}
```

The model limits output generation based on token counts rather than word counts.

---

# Key Takeaway

Before Claude can understand, reason about, moderate, or respond to your text, it must first convert the text into **tokens**.

**Correct Answer: Option 3 — Breaks it into smaller chunks called tokens**

# Image Transcription

**Question:**

> Users complain your chat app feels slow because they wait 20 seconds staring at a loading spinner, then all the generated text appears at once. What can fix this?

**Options:**

1. Asking shorter questions
2. Using a faster internet connection
3. Enabling response streaming
4. Using a different web browser

**Buttons:**

- Previous
- Next Question

---

# Correct Answer

✅ **Enabling response streaming**

---

# Technical Reasoning

Response streaming allows generated text to be delivered to the user incrementally as it is produced by the model, rather than waiting for the entire response to finish before displaying anything.

Without streaming, the flow looks like this:

```text
User Request
      ↓
Model Generates Entire Response
      ↓
Response Returned
      ↓
User Sees Text
```

If generation takes 20 seconds, the user sees nothing but a loading indicator for the entire duration.

With streaming enabled:

```text
User Request
      ↓
Model Starts Generating
      ↓
First Tokens Sent
      ↓
Additional Tokens Stream In
      ↓
Response Completes
```

The user begins seeing content almost immediately, creating a much more responsive experience.

---

# Why Streaming Improves Perceived Performance

Streaming reduces **perceived latency**.

Consider a response that takes 20 seconds to generate.

### Without Streaming

```text
0s    Loading...
5s    Loading...
10s   Loading...
15s   Loading...
20s   Entire answer appears
```

### With Streaming

```text
0s    Request sent
1s    First words appear
3s    First sentence appears
10s   Several paragraphs visible
20s   Response completes
```

Even though total generation time may still be 20 seconds, users feel the application is significantly faster because progress is visible.

---

# Why the Other Answers Are Wrong

### ❌ Asking shorter questions

Shorter prompts can sometimes reduce response time, but they do not solve the fundamental user experience problem.

Users would still wait until the entire response is generated before seeing anything.

---

### ❌ Using a faster internet connection

Network improvements may reduce transmission delays by a small amount, but the main delay in this scenario comes from model generation time.

The user experience problem is that generated content remains hidden until completion.

---

### ✅ Enabling response streaming

Correct.

Streaming allows users to receive tokens as they are generated, dramatically improving responsiveness and user satisfaction.

Most modern AI chat applications rely on streaming for exactly this reason.

---

### ❌ Using a different web browser

The browser does not control how the AI API delivers tokens.

Changing browsers will not resolve a lack of streaming in the application architecture.

---

# Example Without Streaming

```python
response = client.messages.create(
    model="claude-sonnet-4",
    max_tokens=1000,
    messages=[
        {
            "role": "user",
            "content": "Explain AWS Lambda"
        }
    ]
)

print(response.content)
```

Result:

```text
User sees nothing until the entire response is generated.
```

---

# Example With Streaming

```python
with client.messages.stream(
    model="claude-sonnet-4",
    max_tokens=1000,
    messages=[
        {
            "role": "user",
            "content": "Explain AWS Lambda"
        }
    ]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)
```

Result:

```text
The answer appears word-by-word or chunk-by-chunk as Claude generates it.
```

---

# Real-World Benefits of Streaming

Streaming provides:

- Faster perceived performance
- Better user engagement
- Reduced frustration during long generations
- Visible progress while responses are being created
- A chat experience similar to modern AI assistants

This is why most production AI applications enable streaming by default.

---

# Key Takeaway

The problem is not the total generation time. The problem is that users wait without seeing progress.

By enabling **response streaming**, the application can display generated text immediately as it becomes available, making the experience feel significantly faster and more interactive.

**Correct Answer: Option 3 — Enabling response streaming**

# Image Transcription

**Question:**

> You're building a web app that talks to Claude. Where should you store your API key?

**Options:**

1. In your mobile app that users install
2. In a text file on the user's computer
3. On your server that users can't access
4. In your JavaScript code that users download

**Buttons:**

- Previous
- Next Question

---

# Correct Answer

✅ **On your server that users can't access**

---

# Technical Reasoning

API keys are **secret credentials** that grant access to an API account and its associated resources. Anyone who obtains your API key can potentially:

- Make API requests on your behalf
- Consume your usage quota
- Generate costs charged to your account
- Access services you have permission to use

Because API keys are sensitive secrets, they must be stored only in environments that users cannot directly access.

The standard architecture looks like this:

```text
User Browser
      │
      ▼
Your Backend Server
      │
      │ (API Key Stored Here)
      ▼
Claude API
```

In this model:

1. The user sends requests to your backend.
2. Your backend securely attaches the API key.
3. The backend communicates with Claude.
4. The response is returned to the user.

The API key never leaves the server.

---

# Why the Other Answers Are Wrong

### ❌ In your mobile app that users install

Incorrect.

Applications installed on user devices can be reverse-engineered.

Attackers can inspect:

- Application binaries
- Configuration files
- Local storage
- Network traffic

Eventually, exposed secrets can be extracted.

Example:

```text
Mobile App
    ↓
Embedded API Key
    ↓
Attacker extracts key
    ↓
Unauthorized API usage
```

---

### ❌ In a text file on the user's computer

Incorrect.

Anything stored on a user's computer is accessible to the user and potentially to malware or other software.

This provides no meaningful protection for the API key.

---

### ✅ On your server that users can't access

Correct.

Backend servers are the standard and recommended location for storing API secrets.

Common secure storage methods include:

- Environment variables
- Secret management systems
- Cloud secret stores
- Vault services

Example:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxx
```

Backend code can then access:

```python
import os

api_key = os.environ["ANTHROPIC_API_KEY"]
```

The secret remains hidden from users.

---

### ❌ In your JavaScript code that users download

Incorrect.

Client-side JavaScript is fully visible to users.

For example:

```html
app.jsscript>
```

A user can simply:

```text
View Source
Open Developer Tools
Inspect Network Requests
Read JavaScript Files
```

Any API key embedded in frontend code should be considered compromised immediately.

---

# Secure Architecture Example

## Incorrect

```text
Browser
   │
   ├── API Key
   │
   ▼
Claude API
```

Problems:

- Users can see the key
- Attackers can steal the key
- Billing abuse becomes possible

---

## Correct

```text
Browser
   │
   ▼
Backend Server
   │
   ├── API Key Stored Securely
   │
   ▼
Claude API
```

Benefits:

- Users never see the key
- Access can be controlled
- Requests can be validated
- Usage can be monitored

---

# Example Backend Call

```python
from anthropic import Anthropic
import os

client = Anthropic(
    api_key=os.environ["ANTHROPIC_API_KEY"]
)

response = client.messages.create(
    model="claude-sonnet-4",
    max_tokens=200,
    messages=[
        {
            "role": "user",
            "content": "Hello"
        }
    ]
)
```

The API key remains on the server and is never exposed to the browser.

---

# Security Best Practices

Always:

- Store API keys on backend servers
- Use environment variables
- Rotate keys periodically
- Limit access permissions
- Monitor API usage
- Use secret-management solutions for production workloads

Never:

- Embed API keys in JavaScript
- Commit API keys to Git repositories
- Store API keys in mobile applications
- Place API keys in client-side configuration files

---

# Real-World Risk Example

Suppose a frontend application contains:

```javascript
const API_KEY = "sk-ant-xxxxxxxx";
```

A user can open browser developer tools and immediately see:

```javascript
const API_KEY = "sk-ant-xxxxxxxx";
```

The user could then:

```text
Copy the key
Send unlimited requests
Consume API credits
Generate unexpected charges
```

This is one of the most common API security mistakes.

---

# Key Takeaway

API keys are secrets and should never be accessible from client-side code, mobile apps, or user devices.

The secure and industry-standard approach is to store the API key **on your server that users can't access** and have the server communicate with Claude on behalf of users.

**Correct Answer: Option 3 — On your server that users can't access**

# Image Transcription

**Question:**

> You're building a math tutor bot. You want Claude to give hints instead of direct answers. What should you use?

**Options:**

1. Setting a very low word limit
2. Using all capital letters in your messages
3. A system prompt explaining the tutor role
4. Asking users to be more specific

**Buttons:**

- Previous
- Next Question

---

# Correct Answer

✅ **A system prompt explaining the tutor role**

---

# Technical Reasoning

A **system prompt** is the primary mechanism for defining Claude's behavior, personality, objectives, constraints, and response style.

If you want Claude to act as a math tutor that guides students through problem-solving rather than simply providing answers, the appropriate solution is to define that behavior in the system prompt.

For example:

```text
You are a math tutor.

Guide students toward solutions by providing hints and asking leading questions.

Do not immediately provide the final answer unless the student explicitly requests it after multiple attempts.

Encourage reasoning and step-by-step problem solving.
```

This instruction influences how Claude responds across the entire conversation.

---

# Why System Prompts Work

Claude processes instructions according to a hierarchy.

A simplified hierarchy looks like:

```text
System Prompt
      ↓
User Messages
      ↓
Assistant Responses
```

The system prompt establishes the role and behavioral rules that Claude should follow throughout the interaction.

For a tutoring application, the system prompt can define:

- Teaching style
- Level of guidance
- Allowed behaviors
- Disallowed behaviors
- Educational objectives

Example:

```text
Role: Math Tutor

Goal:
Help students learn.

Rules:
- Give hints before answers.
- Ask guiding questions.
- Encourage independent thinking.
- Explain concepts clearly.
```

This produces much more consistent tutoring behavior than relying on individual user prompts.

---

# Why the Other Answers Are Wrong

### ❌ Setting a very low word limit

Incorrect.

A low word limit merely restricts response length.

Example:

```text
Question: Solve x² - 4 = 0.
```

Claude could still reply:

```text
x = ±2
```

The answer is short, but it is still a direct answer.

A word limit does not change teaching behavior.

---

### ❌ Using all capital letters in your messages

Incorrect.

Writing prompts like:

```text
ONLY GIVE HINTS
```

does not create a persistent tutoring behavior.

Capitalization may add emphasis, but it is not a reliable mechanism for role definition.

---

### ✅ A system prompt explaining the tutor role

Correct.

System prompts are specifically designed to shape model behavior and establish consistent instructions.

This is the recommended approach for educational, coaching, tutoring, customer support, and other specialized applications.

---

### ❌ Asking users to be more specific

Incorrect.

User specificity can improve question clarity but does not determine whether Claude provides hints or final answers.

Behavioral control belongs in the system prompt.

---

# Example Without a System Prompt

User:

```text
Solve 2x + 4 = 10
```

Claude might respond:

```text
2x = 6

x = 3
```

The student receives the solution immediately.

---

# Example With a Tutoring System Prompt

System Prompt:

```text
You are a math tutor.

Never immediately solve a problem.

Provide hints and guide the student toward discovering the answer.
```

User:

```text
Solve 2x + 4 = 10
```

Possible Response:

```text
Try isolating x.

What happens if you subtract 4 from both sides of the equation?
```

This encourages learning rather than answer copying.

---

# Real-World Benefits

Using a tutoring-focused system prompt can:

- Encourage critical thinking
- Improve student engagement
- Promote deeper understanding
- Reduce dependence on answer copying
- Create a more effective learning experience

For educational applications, system prompts are the standard way to enforce instructional behavior.

---

# Example API Request

```json
{
  "model": "claude-sonnet-4",
  "system": "You are a math tutor. Give hints before answers and encourage step-by-step reasoning.",
  "messages": [
    {
      "role": "user",
      "content": "Help me solve x^2 - 9 = 0"
    }
  ],
  "max_tokens": 300
}
```

The system prompt ensures the tutoring strategy is consistently applied.

---

# Key Takeaway

If you want Claude to behave like a math tutor and provide hints instead of direct answers, the correct solution is to define that behavior in a **system prompt**.

System prompts are the primary mechanism for controlling role, tone, behavior, and response strategy.

**Correct Answer: Option 3 — A system prompt explaining the tutor role**

# Image Transcription

**Question:**

> You want Claude to give very predictable, consistent answers for a factual Q&A app. What temperature setting should you use?

**Options:**

1. Temperature doesn't matter for facts
2. Low temperature (near 0.0)
3. Medium temperature (around 0.5)
4. High temperature (near 1.0)

**Buttons:**

- Previous
- Next Question

---

# Correct Answer

✅ **Low temperature (near 0.0)**

---

# Technical Reasoning

Temperature is a model parameter that controls the amount of randomness in token selection during text generation.

When Claude generates text, it does not simply choose one fixed response. Instead, it calculates probabilities for many possible next tokens.

For example:

```text
Capital of France is:
```

The model may assign probabilities such as:

```text
Paris      : 95%
London     : 2%
Berlin     : 1%
Madrid     : 1%
Other      : 1%
```

Temperature affects how strongly Claude favors the highest-probability tokens.

---

# Understanding Temperature

A simplified view:

```text
Lower Temperature
        ↓
Less Randomness
        ↓
More Deterministic Output
        ↓
More Consistent Responses
```

```text
Higher Temperature
        ↓
More Randomness
        ↓
More Variation
        ↓
More Creative Responses
```

For factual applications, consistency is usually more important than creativity.

---

# Why Low Temperature Is Best for Factual Q&A

A factual Q&A system should:

- Produce reliable answers
- Minimize unnecessary variation
- Return similar answers for the same question
- Reduce creative improvisation

Low temperature encourages Claude to choose the most likely tokens repeatedly.

For example:

Question:

```text
What is the capital of France?
```

At temperature near 0:

```text
Paris is the capital of France.
```

Repeated requests will often generate highly similar responses.

---

# Why the Other Answers Are Wrong

### ❌ Temperature doesn't matter for facts

Incorrect.

Temperature influences token selection regardless of topic.

Even when discussing facts, higher temperatures can lead to:

- Alternative wording
- Additional speculation
- Less predictable outputs

Temperature absolutely affects response consistency.

---

### ✅ Low temperature (near 0.0)

Correct.

Low temperature minimizes randomness and increases determinism.

This is generally preferred for:

- Factual Q&A systems
- Customer support bots
- Knowledge retrieval applications
- Classification tasks
- Structured output generation

---

### ❌ Medium temperature (around 0.5)

Incorrect.

A medium temperature introduces more variation.

While acceptable for general conversational systems, it is not ideal when maximum consistency is required.

---

### ❌ High temperature (near 1.0)

Incorrect.

High temperatures encourage exploration of lower-probability tokens.

This is useful for:

- Brainstorming
- Creative writing
- Storytelling
- Marketing copy
- Idea generation

However, it reduces predictability.

---

# Example Comparison

## Temperature = 0.0

Prompt:

```text
Explain AWS Lambda in one sentence.
```

Response 1:

```text
AWS Lambda is a serverless compute service that runs code in response to events.
```

Response 2:

```text
AWS Lambda is a serverless compute service that runs code in response to events.
```

Outputs are extremely similar.

---

## Temperature = 0.5

Prompt:

```text
Explain AWS Lambda in one sentence.
```

Response 1:

```text
AWS Lambda is a serverless service that executes code when triggered by events.
```

Response 2:

```text
AWS Lambda allows developers to run code without managing servers.
```

Both are correct, but wording varies.

---

## Temperature = 1.0

Prompt:

```text
Explain AWS Lambda in one sentence.
```

Response 1:

```text
AWS Lambda automatically runs code in the cloud whenever configured events occur.
```

Response 2:

```text
Lambda is AWS's event-driven serverless platform for executing applications without infrastructure management.
```

Even more variation appears.

---

# Common Temperature Guidelines

| Use Case | Recommended Temperature |
|-----------|-----------|
| Factual Q&A | 0.0 - 0.2 |
| Customer Support | 0.1 - 0.3 |
| Structured JSON Generation | 0.0 - 0.2 |
| General Chat | 0.5 - 0.7 |
| Brainstorming | 0.7 - 0.9 |
| Creative Writing | 0.8 - 1.0 |

---

# Example API Request

```json
{
  "model": "claude-sonnet-4",
  "temperature": 0.0,
  "max_tokens": 300,
  "messages": [
    {
      "role": "user",
      "content": "What is AWS Lambda?"
    }
  ]
}
```

This configuration prioritizes consistency and predictability.

---

# Real-World Scenarios

Use low temperature when building:

- FAQ systems
- Enterprise knowledge bases
- Technical support assistants
- Documentation chatbots
- Compliance-focused applications
- Data extraction systems

In these environments, users expect stable and repeatable answers rather than creativity.

---

# Key Takeaway

Temperature controls randomness in generated text.

For a factual Q&A application where answers should be highly predictable and consistent, use a **low temperature near 0.0**. This produces the most deterministic behavior and minimizes unnecessary variation between responses.

**Correct Answer: Option 2 — Low temperature (near 0.0)**

