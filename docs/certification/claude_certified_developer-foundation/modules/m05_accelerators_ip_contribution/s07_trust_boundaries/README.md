# Trust Boundaries

## Teaching
# Coordinating several Claude deployments with the trust boundaries holding under review

The accelerators, deployments, and tradeoffs now come together in a single application. Connecting components multiplies the places where identity, secrets, and untrusted input can cross. The discipline is to identify every boundary before connecting anything.

## Map which component does what before you connect them

A multi-component app coordinates more than one Claude capability into a single workflow.

An API request might trigger a Claude Code task, which then reaches a customer system through an MCP server.

Each component contributes a capability the others do not have. The challenge is that every connection between them creates a place where identity, secrets, and untrusted input can cross.

Map which component does what before connecting anything.

## The trust boundary is where data moves

The trust boundary is the point where data or instructions move from one deployment environment to another.

It is exactly where the injection and access controls from the prior module apply.

Content fetched by a Claude Code task is untrusted when it reaches the next component.

The receiving component should treat it as data, rather than as instructions, following the same principle used throughout the security module.

The core discipline here is to identify every seam as a boundary.

Do not assume a component is trusted simply because it worked correctly on its own.

## Least privilege applies to the whole application

Identity and least privilege, which means giving each component only the access its task needs and nothing more, apply to the application as a whole.

Each component operates under an identity.

The application is only as contained as its most privileged seam, which means a single component scoped too broadly becomes the weak point even when every other component is properly scoped.

You scope each component to the least privilege its role in the workflow requires.

This is what keeps a steered component from reaching beyond its intended task.

## Scoping for a regulated review pulls the module together

A regulated review requires justifying audit logging, data-residency decisions, and permission controls across the full application.

For regulated deployments, Bedrock and Vertex AI are typically the platforms that satisfy regional residency constraints.

Confirm ZDR and HIPAA BAA eligibility for each component against the Anthropic Trust Center and `platform.claude.com` before scoping.

## The multi-component integration map

| Component | What it contributes | The trust boundary at its seam | The control that enforces it |
|------------|--------------------|--------------------------------|------------------------------|
| **First-party API** | Orchestrates the workflow and holds the entry point. | The request entering the app from outside. | Input validation and the identity the call runs under. |
| **Claude Code task** | Runs the agentic work and may fetch external content. | Content it fetched, which is untrusted downstream. | Treat fetched content as data at the next seam. |
| **MCP server** | Reaches a customer system to read or act. | The system access it holds on the app's behalf. | Scope the server to least privilege and log the access. |

## Handles well

Naming every seam as a boundary and scoping each component to least privilege makes a multi-component app deployable under review.

## Adds cost or complexity

Mapping seams, enforcing controls at each seam, and logging boundary crossings adds design and audit work to every integration.

## Use a different approach

When a seam cannot be secured, do not ship around it: escalate to a human owner.

## Watch Out
# The seam nobody marked as a boundary

## Setup

You connected the components that each passed their own tests.

The parts were already checked, and connecting verified parts feels safe. Each one was trusted in isolation.

The gap was that a seam between two trusted parts cannot automatically be trusted itself.

This is a short transcript from a pairing session, the kind of back-and-forth that ends at the moment the unmarked seam gets identified.

## The session

**Dev A:** All three components pass their own tests. I just wired them up.

**Dev B:** Where does the Claude Code task send what it fetched?

**Dev A:** Straight into the next call as part of the prompt. It is just the content we pulled from the customer page.

**Dev B:** That content is untrusted. If it carries instructions, the next component runs them, because we never mark that seam as a boundary.

**Dev A:** But each component was trusted on its own.

**Dev B:** Right, and the seam between them was not. That is the one nobody treated as a boundary, so fetched content crosses as instructions.

## Why it broke

Each component having passed its own tests said nothing about the seam between them.

The fetched content was untrusted the moment it left the Claude Code task.

It arrived from a component that worked in isolation, and it was passed into the next call as if it were trusted instructions.

The boundary existed in the data flow. It just was not marked, so no control checked it.

A component that passes its own tests has no seam-level controls.

Every point where data crosses between deployment environments requires an explicit boundary control regardless of how each component behaves independently.

## What to Watch Out for

A component that is trusted in isolation does not automatically make the seam leaving it trustworthy.

Mark every place data or instructions cross from one deployment environment to another as a boundary.

Put a control there that treats fetched content as data rather than instructions, exactly as the security work taught.

The seam nobody identifies is the one a steered action crosses.

## Checkpoint
# Checkpoint 7: Complete the multi-component boundary configuration

## Image Transcription

### Title

# Checkpoint 7: Complete the multi-component boundary configuration

### Instructions

Try it now. The multi-component app below is wired, with two blanks left. Drag the correct control onto the seam that receives untrusted fetched content and drag the correct identity scope onto the most privileged component.

---

## The Partial App

```python
# components wired: API -> Claude Code task -> MCP server

fetched = code_task.run(fetch_url=customer_page)

# BLANK 1: control on the seam receiving untrusted fetched content
next_call(input=__________(fetched))

# MCP server reaches the customer system (most privileged component)
mcp_server = MCPServer(
    system=customer_db,
    scope=__________    # BLANK 2: identity scope
)
```

---

## Drag Tokens (Shared Bank, Two Are Distractors)

```text
treat_as_data
least_privilege_read_only
run_as_instructions
full_access
```

---

# Correct Answers

## Blank 1

✅ **treat_as_data**

```python
next_call(input=treat_as_data(fetched))
```

## Blank 2

✅ **least_privilege_read_only**

```python
mcp_server = MCPServer(
    system=customer_db,
    scope=least_privilege_read_only
)
```

---

# Completed Configuration

```python
# components wired: API -> Claude Code task -> MCP server

fetched = code_task.run(fetch_url=customer_page)

# control on the seam receiving untrusted fetched content
next_call(input=treat_as_data(fetched))

# MCP server reaches the customer system (most privileged component)
mcp_server = MCPServer(
    system=customer_db,
    scope=least_privilege_read_only
)
```

---

# Technical Reasoning

## Blank 1: Why `treat_as_data` is Correct

The lesson explicitly states:

> Content fetched by a Claude Code task is untrusted when it reaches the next component.

The fetched content originated outside the application boundary.

```text
Customer page
        ↓
Claude Code task
        ↓
Next component
```

The seam between the Claude Code task and the next component is a trust boundary.

At that boundary:

- Retrieved content may contain instructions.
- Retrieved content may contain prompt-injection attempts.
- Retrieved content may contain malicious directives.
- Retrieved content may attempt to influence downstream behavior.

Therefore the receiving component must interpret the content as data, not executable instructions.

This is exactly what:

```text
treat_as_data
```

represents.

### Security Principle

```text
Fetched content
        ≠
Trusted instructions
```

Instead:

```text
Fetched content
        =
Untrusted data
```

This follows the core trust-boundary rule taught throughout the module.

---

## Why `run_as_instructions` is Incorrect

❌ **run_as_instructions**

This is the exact anti-pattern described in the lesson.

If fetched content is treated as instructions:

```text
External content
        ↓
Claude Code task
        ↓
Instruction execution
```

an attacker can inject commands or steer downstream behavior.

The previous example ("The seam nobody marked as a boundary") demonstrated precisely this failure mode.

Therefore:

```text
run_as_instructions
```

violates the required boundary control.

---

## Blank 2: Why `least_privilege_read_only` is Correct

The MCP server is described as:

```text
most privileged component
```

because it can reach customer systems.

From the integration map:

| Component | Trust Boundary | Required Control |
|------------|----------------|------------------|
| MCP Server | System access on behalf of the app | Scope server to least privilege |

The lesson repeatedly emphasizes:

```text
Identity + Least Privilege
```

Every component should have only the permissions required to perform its task.

If the MCP server only needs to read customer information, then a read-only scope is the correct minimum permission set.

```python
scope=least_privilege_read_only
```

ensures the MCP server:

- Can access required data.
- Cannot modify customer systems.
- Cannot perform unnecessary actions.
- Limits blast radius if compromised.

---

## Why `full_access` is Incorrect

❌ **full_access**

The lesson explicitly warns:

> The application is only as contained as its most privileged seam.

Granting:

```python
scope=full_access
```

creates excessive permissions.

Problems include:

- Unnecessary write access.
- Increased risk from prompt injection.
- Larger impact if credentials are abused.
- Failure of least-privilege review.

A component should never receive broader permissions than required.

Therefore:

```text
full_access
```

is a distractor.

---

# Trust Boundary Analysis

The workflow looks like this:

```text
External Customer Content
            ↓
      Claude Code Task
            ↓
       Trust Boundary
            ↓
      treat_as_data
            ↓
      Next Component
            ↓
         MCP Server
            ↓
 least_privilege_read_only
            ↓
      Customer System
```

Two controls protect the system:

### Boundary Control

```text
treat_as_data
```

Prevents untrusted fetched content from becoming executable instructions.

### Identity Control

```text
least_privilege_read_only
```

Prevents the most privileged component from exceeding the permissions required by its role.

---

# Why These Two Controls Work Together

The architecture must defend against both:

1. **Untrusted content crossing application seams**
2. **Excessive permissions on downstream systems**

The first control protects the flow of information:

```text
treat_as_data
```

The second control protects system access:

```text
least_privilege_read_only
```

Together they implement the two core principles of the module:

```text
Treat fetched content as data.
Apply least privilege everywhere.
```

---

# Final Answers

| Blank | Correct Token | Reason |
|---------|---------------|---------|
| Blank 1 | ✅ `treat_as_data` | Untrusted fetched content must be treated as data at the trust boundary |
| Blank 2 | ✅ `least_privilege_read_only` | The MCP server should operate with the minimum permissions required |

## ✅ Final Solution

```python
next_call(input=treat_as_data(fetched))

mcp_server = MCPServer(
    system=customer_db,
    scope=least_privilege_read_only
)
```
