# Deployment and Versioning

## Teaching
# Choosing where a Claude workload runs and versioning what ships

A packaged asset and a contributed one are both merely code until something runs them. The asset now faces a different question: where it runs and how to lock its version, so an upstream change does not become an untracked change in production. That platform decision is rarely about technical merit alone. In practice, it is usually shaped by where the customer already has cloud infrastructure, identity management, and compliance agreements in place. The first question is usually about which platform the customer already trusts and operates on.

## The customer's cloud usually determines the platform

The deployment platform is the environment where the Claude workload runs. The same model can run in several deployment environments, and the customer's existing cloud usually determines which one.

The first-party Claude API is Anthropic's own environment and typically receives new features first.

Claude Platform on AWS is accessed through the customer's AWS account using Anthropic's own model IDs and lifecycle; inference is Anthropic-operated, outside the AWS boundary.

Amazon Bedrock offers two integrations:

- **Claude in Amazon Bedrock** uses the Messages API at `/anthropic/v1/messages` with broad feature parity; confirm any feature-specific requirements against the Bedrock documentation, as a features-not-supported list exists.
- **Claude on Amazon Bedrock (legacy)** uses the InvokeModel/Converse APIs with ARN-versioned identifiers.

Google Vertex AI does the same inside Google Cloud.

Third-party platforms, such as Microsoft Foundry, embed Claude inside a product the customer already uses.

Microsoft Foundry offers Claude in two hosting forms:

- **Hosted on Azure** (currently Claude Opus 4.8, Claude Sonnet 5, and Claude Haiku 4.5, with inference running end-to-end on Azure infrastructure, generally available)
- **Hosted on Anthropic** (all other Foundry Claude models, with inference on Anthropic-operated infrastructure)

Residency assumptions for regulated customers depend on the hosting form of the specific model. Confirm the hosting form and the current model split with Microsoft at build time.

## Identity and data residency are important for security

Identity and data location are answered by the platform, not your code.

Bedrock uses AWS identity and keeps data inside the customer's AWS boundary; Vertex uses Google Cloud identity and boundary. Both offer regional routing when residency is a constraint.

Matching the platform to the customer's existing compliance agreement avoids a data-residency review from scratch.

## Pin the version so an upstream model change is not a silent production change

Versioning is what keeps a model or prompt change from becoming a silent change in production.

Every Claude model ID points to a specific model snapshot. Aliases such as Opus and Sonnet are convenient, but they evolve over time and may resolve to different versions across deployment platforms. A pinned full model ID resolves to a fixed snapshot.

Pin the specific model version rather than the alias, so an upstream model update is a deliberate choice rather than a silent production change.

Then:

- Version the prompt and the asset alongside the code.
- Keep the prior version available so the regression can be rolled back.

An unpinned deployment makes every upstream model update an untracked change to your output.

The first line follows a moving alias. The second pins the snapshot.

```python
# Pre-4.6 example: a convenience alias can resolve to a new
# version without you knowing
model = "claude-haiku-4-5"

# Pre-4.6 pinned snapshot: the version is fixed until you change this line
model = "claude-haiku-4-5-20251001"
```

For Claude 4.6 and later, the model ID alone pins to a specific snapshot; for earlier models, the ID plus a date suffix is required. Verify the current convention at `platform.claude.com` at build time.

## Promote a version through the eval

Gate promotion on the eval suite.

Send a new version to a portion of traffic, compare against the pinned baseline, and promote or roll back on the result.

This is where the eval stops being a one-time test and becomes the deployment gate.

## The deployment-platform decision table

| Platform | Identity and data model | When to choose it | How versioning is pinned |
|----------|-------------------------|-------------------|--------------------------|
| **First-party Claude API** | Anthropic identity and terms. | The customer has no binding cloud or residency constraint and wants the newest capabilities. | Pin the full model ID and keep the prior snapshot. |
| **Claude Platform on AWS** | Anthropic identity and terms, accessed through the customer's AWS account; inference is Anthropic-operated outside the AWS boundary. Model lifecycle follows Anthropic's deprecation schedule. | The customer is on AWS but wants Anthropic model IDs, lifecycle, and feature parity with the first-party API. | Pin using the same model ID format as the Claude API (for example, `claude-opus-4-8`). Lifecycle follows Anthropic's schedule. Confirm at publish time. |
| **Claude in Amazon Bedrock** | Messages API at `/anthropic/v1/messages`, broad feature parity with the first-party API; confirm feature-specific requirements against the Bedrock documentation. Data stays inside the customer's configured AWS boundary. | The customer is on AWS, wants broad feature parity with the first-party API (confirm feature-specific requirements), and holds a compliance posture there. | Pin the full model ID using the `anthropic.` prefix format. Partner retirement dates differ from Anthropic's schedule. Confirm at publish time. |
| **Claude on Amazon Bedrock (legacy)** | AWS identity and billing, InvokeModel/Converse APIs with ARN-versioned model identifiers. | The customer is on an existing Bedrock integration using InvokeModel or Converse and has not migrated to the Messages API. | Pin via ARN-versioned model identifiers per Bedrock's versioning controls. |
| **Google Vertex AI** | Google Cloud identity, Identity and Access Management (IAM), and billing, with regional or global endpoints for residency. | The customer is on Google Cloud and holds a compliance posture there. | Pin the full model ID before rollout using Vertex's model ID format. Partner retirement dates differ from Anthropic's schedule. |
| **Third-party platform** | The wrapping product's identity and billing model. Note: Claude in Microsoft Foundry offers two hosting forms: Hosted on Azure (currently Opus 4.8, Sonnet 5, and Haiku 4.5; inference end-to-end on Azure) and Hosted on Anthropic (all other Foundry Claude models). Confirm residency and compliance terms with Microsoft before selecting this path for a regulated customer. | The customer already runs the platform that embeds Claude. | Pin per the platform's versioning controls. |

## Handles well

Matching the platform to the customer cloud and pinning the version keeps a migration reviewable and a rollback possible.

## Adds cost or complexity

Pinning, retaining prior

## Watch Out
# The deployment that broke when the model alias moved

## Setup

You shipped against the alias that pointed at the recommended version, because that was the convenient default and it gave you the latest model for free. It worked.

Then the alias advanced, and what was free turned out to have a price.

This is a trace excerpt from a production log, the kind you would scroll back through after an incident. It shows the day the output shape changed and why there was nothing to roll back to.

## The log

```text
--: deploy: model="opus" status=ok
--: alias advanced -> new opus version (no app change)
--: parser: KeyError "summary" in response payload
--: Error: output shape changed; downstream parse failed
--: rollback attempted -> no pinned prior version retained
--: incident: hotfix parser; root cause = unpinned deployment
```

## Why it broke

The application never changed, but the alias did.

No pinned prior version had been retained, so there was nothing to roll back to. The hotfix repaired the parser but left the unpinned deployment in place.

## What to Watch Out for

An alias resolves to a moving target; a pinned full model ID is a fixed snapshot.

- Pin the full model ID so an upstream update is something you adopt on purpose.
- Keep the prior pinned version available so a regression is a rollback rather than a hotfix.
- Gate the new version through your eval before you promote it, so the output-shape change shows up in a test run instead of in production.

## Checkpoint
# Checkpoint 5: Match the deployment platform and version pin to each scenario

## Image Transcription

### Title

# Checkpoint 5: Match the deployment platform and version pin to each scenario

### Instructions

Try it now. A customer runs AWS with a data-residency requirement and needs to be able to roll back a model update.

Select the one correct piece in each group below to assemble the minimal deployment configuration that satisfies both.

Leave out what does not belong.

---

## Platform Group

- [ ] First-party API
- [ ] Amazon Bedrock
- [ ] Google Vertex AI

---

## Identity Group

- [ ] AWS identity reference
- [ ] Anthropic API key

---

## Model Reference Group

- [ ] A pinned full model ID
- [ ] A moving alias

---

## Rollback Group

- [ ] Retain the prior pinned version
- [ ] No retention

---

# Correct Answer

## Platform Group

✅ **Amazon Bedrock**

### Technical reasoning

The scenario explicitly states:

- The customer runs on **AWS**.
- The customer has a **data-residency requirement**.

Amazon Bedrock keeps requests, identity, access control, and governance within the customer's AWS environment and compliance boundary. This aligns with AWS-native security, auditing, IAM integration, and regional deployment controls.

Why the others are incorrect:

- **First-party API** does not satisfy the requirement to keep the solution within the customer's AWS-managed deployment boundary.
- **Google Vertex AI** operates within Google Cloud and therefore does not match a customer whose infrastructure and compliance posture are already centered on AWS.

---

## Identity Group

✅ **AWS identity reference**

### Technical reasoning

Because the solution is deployed through Amazon Bedrock, authentication and authorization should use AWS-native identity controls.

This provides:

- IAM-based authentication
- AWS role-based access control
- Centralized auditing through AWS services
- Consistent compliance governance

Why the other option is incorrect:

- **Anthropic API key** is associated with direct usage of Anthropic's first-party platform rather than AWS-native identity management.
- The scenario specifically asks for the AWS-based deployment path.

---

## Model Reference Group

✅ **A pinned full model ID**

### Technical reasoning

The customer requires the ability to roll back model updates safely.

A pinned model ID:

- Resolves to a specific model snapshot.
- Produces predictable behavior.
- Prevents alias drift.
- Makes changes deliberate and reviewable.

Example:

```text
claude-haiku-4-5-20251001
```

instead of:

```text
claude-haiku-4-5
```

Why the other option is incorrect:

- **A moving alias** can automatically resolve to a newer model version.
- A model update could change behavior, output structure, latency, costs, or quality without any application change.
- This creates untracked production changes and makes incident analysis much harder.

---

## Rollback Group

✅ **Retain the prior pinned version**

### Technical reasoning

Rollback requires a known-good version that can be restored immediately.

Retaining the prior pinned version provides:

- Fast recovery from regressions.
- Controlled deployment promotion.
- Reproducible evaluation results.
- Auditable change history.

A typical deployment sequence is:

1. Current production runs Version A.
2. Version B is tested through the evaluation suite.
3. Production traffic is shifted to Version B.
4. If a regression occurs, traffic returns to Version A.

Why the other option is incorrect:

- **No retention** means there is no known-good version available.
- Recovery requires emergency fixes or re-testing.
- This increases operational risk and incident duration.

---

# Final Configuration

| Group | Correct Selection |
|---------|-------------------|
| Platform Group | ✅ Amazon Bedrock |
| Identity Group | ✅ AWS identity reference |
| Model Reference Group | ✅ A pinned full model ID |
| Rollback Group | ✅ Retain the prior pinned version |

---

# Why This Configuration Satisfies All Requirements

The scenario has two explicit requirements:

1. **AWS-based deployment with data residency**
   - Satisfied by **Amazon Bedrock** and **AWS identity reference**.

2. **Safe rollback capability**
   - Satisfied by **a pinned full model ID** and **retaining the prior pinned version**.

The resulting deployment is:

```text
Amazon Bedrock
    +
AWS identity reference
    +
Pinned full model ID
    +
Retain prior pinned version
```

This configuration ensures:

- AWS-native security and compliance controls.
- Predictable model behavior.
- Protection from alias-related production changes.
- Immediate rollback capability when regressions occur.
- Auditable and reproducible deployments.