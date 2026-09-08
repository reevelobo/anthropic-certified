# Comparing Platforms

## Teaching
# Comparing platforms on latency, compliance, and cost so the choice survives review

In the last two screens you chose a platform and pinned its version. That choice was right for the customer's cloud, but "right for their cloud" is not yet an argument a procurement and security team will sign off on.

## Measure latency from the customer's region

Latency depends on where the platform runs relative to the customer and on how access to new features is routed.

A platform running in the customer's own cloud region can reduce round-trip time compared to a first-party endpoint located farther away. The trade-off is timing of access: the first-party API typically receives new capabilities before they reach other platforms.

The number is only accurate when you measure it from the customer's actual region against their actual payload. A measurement from your laptop hides the round-trip penalty that appears once the workload runs where the customer is.

Within Bedrock specifically, the choice between global and regional endpoints is also the primary residency control and can affect cost. You should measure from the customer's actual region against both options before committing.

## Compliance often determines the platform

Compliance is often the dimension that ends the debate.

A customer who already holds a certification on one cloud is unlikely to re-certify on another. Data residency is a rule that a customer's data must be processed in a specific country or region.

Available compliance certifications and who can audit access differ by platform, and a regulated financial or healthcare customer treats these as pass-or-fail requirements rather than tradeoffs to balance.

The first-party Claude API may not offer EU data residency. Confirm current regional coverage at `platform.claude.com`, since EU-only residency typically requires Bedrock or Vertex AI.

On third-party platforms such as Microsoft Foundry, hosting is per-model:

- Azure-hosted Foundry models run inference end-to-end on Azure infrastructure.
- Anthropic-hosted Foundry models do not satisfy EU regional residency requirements.

Residency must be confirmed per model and deployment with Microsoft.

Raise the compliance constraint during scoping, or it surfaces at contract review after the work is done.

## What drives total cost beyond the per-token rate

Per-token rates are broadly aligned across platforms; total cost moves on egress, platform fees, and integration effort.

A lower token price can cost more in total once data transfer and integration are factored in.

Instrument cost per call for each platform and confirm the current pricing pages during scoping.

## The cross-platform comparison reference

| Dimension | How it differs by platform | How to measure it | Where each platform wins |
|------------|---------------------------|-------------------|--------------------------|
| **Latency** | A platform in the customer's region shortens the round trip, while the first-party API may reach new features first. | From the customer's actual region against their actual payload. | An in-region cloud platform wins on round-trip latency, while the first-party API is advantaged on earliest feature access. |
| **Compliance** | Data residency, certifications, and audit controls are determined by the deployment platform. | Against the customer's existing certification and residency requirements during scoping. | The cloud platform the customer has already certified wins because it needs no re-certification. |
| **Cost** | Token price, data egress, platform fees, and integration effort all vary. | Total cost per call per platform, including egress and integration, rather than token price alone. | The platform with the lowest total cost for the actual workload wins, which is not always the cheapest token. |

## Handles well

Measuring all three dimensions per platform turns a placement decision into one a procurement team will sign off on.

## Adds cost or complexity

Instrumenting latency, compliance, and cost across platforms requires real measurement work before any code ships.

## Use a different approach

When the customer's compliance requirement is already pass-or-fail, skip the full comparison. That constraint determines the placement on its own.

## Watch Out
# The platform picked on familiarity that failed residency

## Setup

You picked the platform your team was already familiar with, because the migration looked easy and the deadline was approaching rapidly.

It built just fine; the trouble was that easy-to-build and allowed-to-ship are different criteria.

The following anecdote is the kind a developer tells a teammate after a review goes sideways. It lets you see the familiar platform trap before anyone calls it a mistake.

## What happened

A developer building for a regulated customer chose the platform the team had shipped on before.

The integration came together quickly because the team knew the tools and resources. The build passed its functional tests.

At the customer's security review, the reviewer asked where data was being processed.

The selected platform did not satisfy the customer's residency requirements.

A different platform, one the team knew less well, would have satisfied the requirement through regional deployment options the customer had already cleared.

The placement was rejected, and the integration had to be rebuilt on the platform that met the residency constraint.

## Why it broke

Familiarity optimized for the wrong test.

The easy migration answered whether the team could build quickly. It never answered whether the deployment would pass the customer's residency review, which was the test that determined whether it could ship.

Because the compliance requirement was not fulfilled during scoping, it arrived at the go-no-go review instead.

This is the most expensive place to discover it, because the build was already complete.

## What to Watch Out for

A platform that is easy for your team to build on is not necessarily a platform the customer is allowed to run.

When the customer is regulated, the residency and compliance constraint is often pass-or-fail rather than a tradeoff.

Identify residency and compliance requirements early during scoping and let them influence the platform placement before familiarity does.

Checking early costs a scoping conversation, while checking late costs an entire rebuild.

## Checkpoint
# Checkpoint 6: Diagnose the platform mismatch from a comparison trace

### Instructions

Try it now. The comparison trace below shows a deployment platform selected on familiarity failing a customer requirement. Identify the mechanism, then pick the targeted fix from the three options.

---

## The Trace

```text
platform_selected="team_default"  # chosen on familiarity

latency_test: measured from laptop -> 180ms (looked fine)

customer_region: eu-west, payload 12 KB

compliance_check: data residency = EU-only required

result: REJECTED reason="data processed outside EU on selected platform"
```

---

## Options

### A

Option 1:

Optimize the parser to cut the 180ms latency measured on the laptop.

### B

Option 2:

Remeasure latency from EU-west and select the platform whose region satisfies EU-only residency.

### C

Option 3:

Add a caching layer to reduce per call cost on the selected platform.

---

# Correct Answer

## ✅ B: Option 2

> Remeasure latency from EU-west and select the platform whose region satisfies EU-only residency.

---

# Technical Analysis

## Step 1: Identify the Actual Failure

The trace clearly states:

```text
compliance_check: data residency = EU-only required
```

and later:

```text
result: REJECTED reason="data processed outside EU on selected platform"
```

This means the deployment did **not fail because of latency**.

This means the deployment did **not fail because of cost**.

The deployment failed because the selected platform violated a **data residency requirement**.

The root cause is a **compliance mismatch**.

---

## Step 2: Why the Team Chose the Wrong Platform

The trace begins with:

```text
platform_selected="team_default"
```

and includes the note:

```text
# chosen on familiarity
```

This is the exact scenario discussed in the previous lesson:

- The team optimized for implementation convenience.
- The team selected the platform they already knew.
- The team did not validate whether the platform satisfied the customer's compliance requirements.

The deployment was therefore optimized for developer familiarity rather than customer residency requirements.

---

## Step 3: Why the Latency Measurement Is Misleading

The trace shows:

```text
latency_test: measured from laptop -> 180ms (looked fine)
```

This measurement is insufficient because:

- The customer workload runs in **EU-West**.
- The test was executed from a developer laptop.
- Developer-laptop measurements do not accurately reflect production routing or regional behavior.

The lesson specifically states that latency should be measured:

- From the customer's actual region.
- Using the customer's actual payload.
- Against the candidate deployment platforms.

Therefore the measurement itself is incomplete.

However, the deployment was rejected **before latency became relevant**, because residency requirements were not met.

---

# Why Option A Is Incorrect

## ❌ Option 1

> Optimize the parser to cut the 180ms latency measured on the laptop.

### Technical reasoning

The rejection reason is:

```text
data processed outside EU
```

The rejection reason is **not**:

```text
latency too high
```

Even if latency were reduced from:

```text
180ms -> 120ms
```

or:

```text
180ms -> 80ms
```

the deployment would still violate EU-only residency.

A faster violation is still a violation.

Therefore parser optimization does nothing to address the root cause.

---

# Why Option C Is Incorrect

## ❌ Option 3

> Add a caching layer to reduce per call cost on the selected platform.

### Technical reasoning

Caching addresses:

- Performance
- Cost reduction
- Request volume

Caching does **not** address:

- Data residency
- Regulatory requirements
- Geographic processing constraints
- Compliance controls

The rejection reason is:

```text
data processed outside EU
```

Reducing the number of calls does not change where the remaining calls are processed.

The compliance failure remains.

Therefore caching is unrelated to the incident.

---

# Why Option B Is Correct

## ✅ Option 2

> Remeasure latency from EU-west and select the platform whose region satisfies EU-only residency.

### Technical reasoning

This option directly addresses both problems revealed in the trace.

### Problem 1: Incorrect Measurement

The lesson teaches that latency should be measured from:

- The customer's region
- The customer's workload
- The customer's payload

Therefore:

```text
Measure from EU-west
```

is the correct measurement methodology.

### Problem 2: Compliance Failure

The lesson also teaches that compliance is frequently a pass-or-fail requirement.

The trace states:

```text
EU-only required
```

Therefore the platform must support:

- EU regional processing
- EU residency controls
- Customer-approved deployment region

Selecting a platform that satisfies EU residency directly resolves the rejection.

---

# Root Cause

The real problem can be summarized as:

```text
Team optimized for familiarity
        ↓
Selected default platform
        ↓
Ignored residency requirement
        ↓
Platform processed data outside EU
        ↓
Compliance review failed
        ↓
Deployment rejected
```

---

# Correct Remediation Path

```text
1. Identify residency requirement during scoping
2. Select a platform that supports EU-only processing
3. Deploy into an approved EU region
4. Measure latency from EU-west
5. Validate compliance
6. Proceed to production
```

---

# Final Answer

| Option | Result | Reason |
|----------|----------|----------|
| A. Optimize the parser | ❌ Incorrect | Addresses latency, not residency compliance |
| B. Remeasure from EU-west and choose a residency-compliant platform | ✅ Correct | Fixes both the measurement methodology and the compliance failure |
| C. Add caching | ❌ Incorrect | Addresses cost/performance, not residency requirements |

## ✅ Correct Selection: Option 2 (B)

The deployment failed because the selected platform violated an **EU-only data residency requirement**. The proper fix is to evaluate platforms from the customer's **EU-West region** and choose one whose deployment model satisfies the customer's **EU residency constraint**.