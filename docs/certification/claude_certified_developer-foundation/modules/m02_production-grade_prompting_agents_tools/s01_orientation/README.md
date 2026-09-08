# Orientation

# What You Will Be Able to Do by the End

Writing code that uses Claude is different from using Claude to write code.

You have likely used Claude interactively by entering prompts, reviewing responses, and refining your requests as needed. This module focuses on everything beyond that foundational experience, including:

- Tool schemas
- Context management
- Agent loops
- Streaming
- Memory management
- Production deployment considerations

This module assumes you already know how to shape Claude's outputs. As an engineer, your responsibility is broader:

- Programmatically integrate Claude into systems
- Handle outputs reliably
- Manage model behavior at scale
- Build production-grade applications that remain robust under real-world usage

Each topic addresses a common failure mode that often goes unnoticed during development but becomes expensive and time-consuming to fix in production.

By learning how to recognize and prevent these failure modes, you will be prepared to build Claude-powered systems that are reliable, maintainable, and cost-effective.

---

## By the End of This Module, You Will Be Able To:

### 1. Write Production-Ready Prompts

Learn to build reliable prompts using:

- System prompts
- XML tags
- Few-shot examples
- Output constraints

You will also learn how to diagnose and improve prompts when first-pass results do not meet requirements.

---

### 2. Use Extended Thinking Effectively

Learn how to:

- Decide when extended thinking is appropriate
- Calibrate the effort setting
- Balance cost versus quality
- Handle thinking blocks correctly across tool-use turns

---

### 3. Design and Implement Tool Use

Learn how to:

- Define effective tool schemas
- Encourage correct tool selection
- Build tool-use loops
- Handle multi-turn message blocks
- Choose between single and parallel tool calls

---

### 4. Work Safely with Streaming Responses

Learn how to:

- Consume streamed responses
- Assemble streamed events into complete content blocks
- Detect interrupted streams
- Recover gracefully when streaming stops unexpectedly

---

### 5. Apply Context Engineering Techniques

Learn techniques for managing limited context windows, including:

- Context window management
- Context compaction
- History clearing between tasks
- Subagent handoffs

The goal is to keep long-running sessions within budget while preserving task continuity.

---

### 6. Build Production Agents

Learn how to:

- Choose between workflow and agent patterns
- Connect tools and context into a working agent loop
- Select an implementation approach that fits deployment constraints
- Add Human-in-the-Loop (HITL) checkpoints for irreversible actions

---

### 7. Manage Memory Across Sessions

Learn how to implement persistent memory strategies and choose the correct memory scope so that:

- State survives across sessions
- Context costs remain controlled
- Long-term memory remains useful and maintainable

---

### 8. Work with Files and High-Volume Processing

Learn how to:

- Send images to Claude
- Send PDFs to Claude
- Use the proper message block formats
- Manage reusable assets with the Files API
- Process large workloads using the Message Batches API

You will also learn how to submit jobs asynchronously so they can complete independently of real-time interactions.

---

## Who This Module Is For

*This module is designed for developers who are ready to move beyond prototypes and build Claude-powered systems that can withstand real-world production demands.*

You are expected to be:

- Comfortable writing code
- Focused on implementation
- Interested in engineering patterns and system design

This module does **not** teach programming fundamentals.

It is also **not** focused on casual interaction with Claude through a chat interface.

Instead, it focuses on engineering decisions such as:

- Prompt structure
- Tool design
- Streaming architectures
- Context management
- Memory systems
- Agent loops

The objective is to help you build systems that remain:

- Reliable
- Affordable
- Controllable
- Maintainable

after deployment.

---

# "The Build" in This Module

Everything in this module revolves around a recurring engineering problem:

> A Claude integration that worked perfectly during development must now survive production.

During development:

- Prompts looked effective
- Tool calls worked
- Context windows stayed small
- Test inputs were manageable

In production, however, the same system must handle:

- Long-running conversations
- Large tool outputs
- Interrupted streams
- Cost constraints
- Latency requirements
- Persistent memory
- Irreversible actions

The challenge is no longer simply getting Claude to respond correctly.

The challenge is ensuring the entire system continues to operate safely and reliably as complexity grows.

This module teaches which implementation decisions prevent specific production failures, including:

| Production Concern | Engineering Focus |
|-------------------|------------------|
| Inconsistent outputs | Prompt design |
| Tool misuse | Tool schema design |
| Stream interruptions | Streaming recovery |
| Context overflow | Context engineering |
| Excessive costs | Memory and context management |
| Unsafe actions | Human-in-the-Loop controls |
| Agent failures | Agent architecture and tooling |

By understanding these trade-offs early, you can prevent many common production issues before they occur.

---

# Disclaimer / Notice for Educational Content

We built **Developer Course Module 2: Production-Grade Prompting, Agents & Tool Use** to help you get real work done with Claude.

Treat this module as educational content.

It does **not** constitute:

- Legal advice
- Financial advice
- Professional advice of any kind

You should adapt the material to your own circumstances and requirements.

Because Anthropic products and services evolve quickly:

- Some information may become outdated.
- Documentation may change.
- Features and APIs may be updated.

Always verify implementation details against the latest official documentation.

Examples and scenarios included in the course are:

- Illustrative
- Educational
- Frequently fictionalized

References to companies, products, or services do **not** imply:

- Endorsement by Anthropic
- Endorsement of Anthropic
- Any formal affiliation

Your use of Anthropic products and services is governed by:

- Official terms
- Policies
- Documentation

If any course content conflicts with those materials, the official terms, policies, and documentation take precedence.