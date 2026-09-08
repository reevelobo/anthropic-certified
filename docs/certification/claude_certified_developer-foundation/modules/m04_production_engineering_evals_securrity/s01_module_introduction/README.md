## What You Will Be Able to Do by the End

You have built agents that work. This module is about proving they keep working under production traffic.

In the last two modules, you wired tool-use loops, built agents with planning and memory, and packaged Claude Code workflows with hooks and MCP servers. Those agents run. The open question production asks is different: when an edge case you never tested arrives, when a rate limit hits peak, when a fetched web page carries a hidden instruction, does the system hold or does it fail quietly?

This module turns "it works on my machine" into a system you can defend in a review. The work splits into five things you will be able to do.

### By the End of This Module, You Will Be Able To

1. **Write an eval suite** that defines what "done" means for a Claude feature before you deploy it, pick the grading method that fits the task, and calibrate an LLM-as-judge scoring system against human-labeled cases so the result is one you can defend.

2. **Build a test and tracing layer** that catches regressions at the unit, functional, integration, and end-to-end levels.

3. **Create an application resilient to production failures** by distinguishing retriable errors from terminal ones.

4. **Keep a system inside its cost, latency, and reliability budget**, including when work is spread across several coordinating agents, by instrumenting each call and reaching for parallel agents only when the task needs them.

5. **Defend an integration against prompt injection, jailbreaks, untrusted input, scoped identity, exposed secrets, and data boundaries** so the deployment survives a security or compliance review.

> *This module is for the Developer who has built things that work and now must prove they keep working once additional people depend on them. You are practical, code-forward, and pattern-oriented. This module assumes that your wired tool-use loops, built agents with planning and memory, and packaged Claude Code workflows from the prior two modules work and does not revisit them. It is about the engineering decisions that determine whether a feature that ran in development holds up under production traffic: how you measure that it is correct, how you test and trace it, how you handle the failures production throws that development never showed you, how you keep it inside a cost and latency budget, and how you defend it against untrusted input and a security review.*

## "The Build" in This Module

Everything in this module is built around one recurring gap: development hides the failures that production reveals.

In development:

- The feature returned the right answer the handful of times you tried it.
- Every call succeeded because traffic never hit a limit.
- The corpus fit in the context window.
- The only content the agent read was content you wrote.

In production, the same system meets:

- An input shape no one tested.
- A rate limit at peak traffic.
- A corpus too large to load.
- A fetched page carrying an instruction aimed at the agent.

The failure is almost never a bug in the code that ran. It is a decision that was never made:

- Success was never written down as a graded set.
- The retriable case was never given a path.
- The budget was never instrumented.
- The action boundary was never enforced.

The work in this module is making each of those decisions on paper before the failure shows up live and capturing them in a design document that the rest of the build reads from.

Each layer you add:

- The eval
- The test and trace
- The failure path
- The cost budget
- The security boundary

...closes one way the development-to-production gap turns into a quiet production failure.

## Disclaimer / Notice for Educational Content

We built this **Developer Course Module 4: Production Engineering, Evals, and Security** to help you get real work done with Claude. Treat it as educational content.

It does not constitute legal, financial, or other professional advice, so adapt what you learn to your own situation.

Our products and services evolve quickly, so certain content may contain errors or be outdated. Remember to verify information on Anthropic's website and documentation.

Examples and scenarios used in the course are illustrative and often fictitious. If the course material mentions a company or product, it does not mean Anthropic endorses them, they endorse Anthropic, or that there is any affiliation between them.

Your use of Anthropic products and services is covered by Anthropic's terms, policies, and documentation. If anything in this course conflicts with those materials, the official terms, policies, and documentation take precedence.