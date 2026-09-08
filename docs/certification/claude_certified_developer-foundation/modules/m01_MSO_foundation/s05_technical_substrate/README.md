# The Technical Substrate: SDKs, REST, Streaming, Async

## How a Developer Reaches Claude: SDK vs. Raw REST

At its core, Claude is accessed through an **HTTP REST API**.

Your application:

1. Sends an HTTP request to an API endpoint.
2. Includes an API key for authentication.
3. Sends a JSON request body.
4. Receives a JSON response.

You can interact with the API directly using any HTTP client.

More commonly, developers use an official **SDK** (Software Development Kit), such as those available for:

- Python
- TypeScript
- Other supported languages

An SDK is essentially a thin convenience layer over the same REST API.

### Benefits of Using an SDK

The SDK handles many common tasks automatically:

- Authentication
- Request construction
- Response parsing
- Retry logic
- Error handling boilerplate

As a result, developers write less code and can focus on application logic rather than API details.

### Key Point

Both SDKs and raw REST:

- Reach the same API
- Access the same models
- Produce the same capabilities

The difference is convenience and developer experience.

Module 2 uses the SDK and the Messages API, both of which are built on this same underlying REST foundation.

---

## Synchronous, Streaming, and Real-Time Responses

### Synchronous Requests

A **synchronous** request is the simplest interaction pattern.

The flow is:

1. Send a request.
2. Wait for the entire response.
3. Receive the completed response.
4. Process the result.

This approach works well for:

- Short responses
- Backend automation
- Batch scripts
- Situations where nobody is actively waiting for output

### Streaming Requests

When responses are lengthy or users are waiting for output, **streaming** provides a better experience.

Instead of waiting for the entire response to finish, the model sends output incrementally as it generates text.

Benefits include:

- Faster perceived performance
- Immediate feedback to users
- Reduced "blank screen" waiting time
- More interactive experiences

Your application receives multiple chunks and assembles them into the final response.

Claude exposes streaming through:

- The same HTTP connection
- Server-Sent Events (SSE)

### Comparison

| Pattern | Behavior | Best For |
|----------|----------|----------|
| Synchronous | Returns complete output at the end | Backend jobs, short responses |
| Streaming | Returns output incrementally | Chat applications, long responses, user-facing experiences |

Module 2 covers how to safely consume and recover from streaming interruptions.

---

## Asynchronous Patterns for High-Volume Work

Two different patterns are commonly used for high-volume workloads.

Although both are "asynchronous" in a broad sense, they solve different problems.

---

## Async SDK Clients

### Python

The Python SDK provides an asynchronous client called:

```python
AsyncAnthropic
```

It uses:

```python
async / await
```

and non-blocking I/O.

This allows your application to:

- Start API requests
- Continue doing other work
- Handle many concurrent requests efficiently

without blocking a thread while waiting for responses.

### TypeScript

In the TypeScript SDK, API calls are already Promise-based.

You simply:

```typescript
await client.messages.create(...)
```

There is no separate async client class.

### Key Characteristic

Even though the implementation is asynchronous, the request itself still completes in real time.

The application simply does not block while waiting.

### Best Use Cases

Async SDK patterns are ideal when you need:

- High concurrency
- Responsive applications
- Multiple simultaneous requests
- Efficient server resource usage

---

## Message Batches API

The **Message Batches API** is a completely different pattern.

Instead of processing requests immediately, it is designed for large-scale offline workloads.

### Workflow

1. Submit many requests in a single batch.
2. Receive a batch identifier.
3. Poll for status updates.
4. Retrieve results when processing is complete.

### Characteristics

- Designed for bulk processing
- Lower per-token cost
- Higher latency
- No real-time interaction

Batch jobs may take up to:

```text
24 hours
```

to complete.

### Best Use Cases

The Message Batches API is well suited for:

- Evaluation runs
- Dataset generation
- Offline processing pipelines
- Large-scale classification tasks
- Cost-sensitive bulk workloads

---

## Async SDK vs. Message Batches API

| Feature | Async SDK Client | Message Batches API |
|----------|------------------|---------------------|
| Response Time | Real-time | Up to 24 hours |
| Purpose | Concurrent application requests | Bulk offline processing |
| User Waiting | Usually yes | No |
| Cost Optimization | No | Yes |
| Uses Async/Await | Yes | Not required |
| Supports Huge Bulk Jobs | Limited by application design | Designed for it |

---

## Key Definitions

### AsyncAnthropic

The asynchronous client provided by the Python SDK.

**Purpose:** Use non-blocking `async/await` API calls while still receiving results in real time.

### Message Batches API

A separate API for large-scale offline processing.

**Purpose:** Submit many requests at once, receive a batch ID, and retrieve results later, typically at lower cost but with significantly higher latency.

---

## Key Takeaway

Claude applications are built on a REST API foundation, but developers typically use SDKs for convenience.

There are four common interaction patterns:

1. **REST API** → Direct HTTP requests.
2. **SDKs** → Simplified access to the same API.
3. **Streaming** → Receive output as it is generated.
4. **Async and Batch Processing** → Handle concurrency or large-scale workloads efficiently.

Choose the simplest pattern that meets your requirements:

- **Synchronous** for straightforward requests.
- **Streaming** for responsive user experiences.
- **Async SDK clients** for concurrency.
- **Message Batches API** for large, cost-sensitive offline workloads.