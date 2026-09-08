# Requirements and Lifecycle

## Teaching
# From business requirements to functional and infrastructure requirements

The deployment-platform decisions that follow all assume the requirements already exist: the residency rule, the latency target, the identity model. This screen is where those requirements come from: turning a business problem into the functional and infrastructure requirements a deployment decision can be defended against.

## Capturing functional requirements from a business problem

A functional requirement names what the system must do, stated with enough detail to check. A business problem (for example, "help support agents answer faster") is not yet a requirement; the functional requirements derive from it (for example, "classify each ticket into one of four queues; draft a reply citing the relevant policy; never auto-send without human approval").

The discipline is to write each requirement as a checkable statement of behavior. A vague goal cannot be designed against or verified, while a specific requirement becomes a line in an evaluation and a criterion during review.

## Deriving infrastructure requirements

Infrastructure requirements are the non-functional constraints the deployment must satisfy. Most of them are not stated directly in the business problem. Instead, they are derived by asking the questions the business problem implies.

Key areas include:

- **Latency:** How quickly must a response be delivered, measured from the user's location?
- **Scale:** How many requests must be supported, and what peak demand is expected?
- **Residency:** Where must data be processed and stored, and under which regulations?
- **Identity:** Who is performing actions, what credentials are used, and what activities must be auditable?

Latency, scale, residency, and identity are often the factors that determine the appropriate deployment platform. They are also easiest to capture early, before platform preferences influence decision-making.

## Documenting requirements so a decision can be defended

Requirements should be documented because deployment decisions are often reviewed by stakeholders who were not involved in gathering them.

A concise requirements record should include:

- Functional behaviors
- Infrastructure constraints
- The regulatory or business source for each constraint

This documentation allows a platform decision to be justified as a direct consequence of requirements rather than familiarity or preference. The record becomes the input for the deployment decision process described in the next stage.

## Handles well

Turning a business problem into checkable functional and infrastructure requirements before any platform is selected.

## Adds cost or complexity

Eliciting infrastructure constraints early requires a scoping conversation that teams are often tempted to skip.

## Use a different approach

For a throwaway prototype with no formal review process and no regulated data, lightweight notes are usually sufficient.

# Checkpoint 3: Extract the Requirements

## Scenario

**Try it now.** A regulated EU bank wants an agent that summarizes customer call transcripts for its support team, with summaries reviewed before they are stored in the EU.

---

## Question 1

### A regulated EU bank wants an agent that summarizes customer call transcripts for its support team. Which of the following is a valid functional requirement?

**A.** The agent should be fast and accurate.

**B.** The agent produces a summary that a human approves before it is stored.

**C.** The system must be built using an approved cloud provider.

**D.** Transcript data must not leave the EU.

### Correct Answer: **B**

#### Technical Reasoning

A **functional requirement** describes **what the system must do**. It defines a behavior, capability, feature, workflow, or business function that the solution must perform.

- **Option B** specifies a concrete business process:
  - The agent generates a summary.
  - A human reviews and approves the summary.
  - The approved summary is then stored.

This describes explicit system functionality and workflow behavior, making it a valid functional requirement.

#### Why the Other Options Are Incorrect

##### A. The agent should be fast and accurate.
- "Fast" and "accurate" are quality attributes.
- They describe **how well** the system performs rather than **what** it does.
- This is a **non-functional requirement**.

##### C. The system must be built using an approved cloud provider.
- This constrains implementation and architecture choices.
- It specifies a technology/governance requirement rather than system behavior.
- This is an **infrastructure/technical requirement**.

##### D. Transcript data must not leave the EU.
- This is a regulatory and data residency constraint.
- It describes where data may be processed or stored.
- This is an **infrastructure/compliance requirement**, not a functional requirement.

---

## Question 2

### From the same scenario, which of the following is a valid infrastructure requirement?

**A.** The agent must produce summaries quickly enough for support staff to act on them.

**B.** The agent summarizes transcripts using a pre-approved prompt template.

**C.** Transcript data is processed in the EU.

**D.** A human reviews each summary before it is stored.

### Correct Answer: **C**

#### Technical Reasoning

An **infrastructure requirement** specifies constraints related to:
- Hosting
- Networking
- Security
- Data residency
- Compliance
- Platform architecture
- Operational environment

**Option C** states that:

> Transcript data is processed in the EU.

This is a classic **data residency and compliance requirement**. Because the organization is a regulated EU bank, data processing location is an infrastructure and regulatory concern. The requirement affects:
- Cloud region selection
- Data storage location
- Processing services
- Compliance architecture
- Regulatory controls (such as GDPR and banking regulations)

Therefore, it is the correct infrastructure requirement.

#### Why the Other Options Are Incorrect

##### A. The agent must produce summaries quickly enough for support staff to act on them.
- Focuses on performance and responsiveness.
- Describes a quality attribute of the solution.
- This is a **non-functional requirement**, not an infrastructure requirement.

##### B. The agent summarizes transcripts using a pre-approved prompt template.
- Describes how the application performs a business function.
- Relates to application logic and operational behavior.
- This is closer to a **functional/application requirement**.

##### D. A human reviews each summary before it is stored.
- Defines a workflow step in the business process.
- Specifies system behavior and approval flow.
- This is a **functional requirement**.

---

# Requirement Classification Summary

| Requirement | Type | Reason |
|------------|------|--------|
| The agent produces a summary that a human approves before it is stored. | Functional | Defines system behavior and workflow. |
| Transcript data is processed in the EU. | Infrastructure | Defines data residency and compliance architecture. |
| The agent should be fast and accurate. | Non-Functional | Defines quality and performance attributes. |
| The system must be built using an approved cloud provider. | Infrastructure/Technical Constraint | Defines implementation and platform restrictions. |
| A human reviews each summary before it is stored. | Functional | Defines a business process and approval step. |
| The agent must produce summaries quickly enough for support staff to act on them. | Non-Functional | Defines performance expectations. |
| The agent summarizes transcripts using a pre-approved prompt template. | Functional/Application Requirement | Specifies how the application performs its task. |

# Final Answers

## Question 1
✅ **B. The agent produces a summary that a human approves before it is stored.**

**Reason:** It specifies a concrete system function and workflow.

## Question 2
✅ **C. Transcript data is processed in the EU.**

**Reason:** It specifies a data residency and compliance constraint, which is an infrastructure requirement.


# Systems Lifecycle for Claude Applications

## Overview

The requirements captured earlier are only the first stage of a broader engineering process called the **systems lifecycle**. A Claude-powered application follows the same lifecycle as any traditional software system, with AI-specific activities integrated into each phase.

Understanding the lifecycle helps teams place tasks such as deployment, version management, evaluation, security reviews, and trust-boundary design into the correct stage rather than treating them as isolated activities.

---

# The Lifecycle Phases Applied to a Claude Application

A Claude application progresses through seven lifecycle phases:

## 1. Requirements

### Purpose
Define what the system must accomplish and the constraints under which it must operate.

### Activities
- Capture business objectives
- Define user needs
- Document functional requirements
- Document infrastructure requirements
- Identify compliance and regulatory constraints

### Example
For a regulated EU bank:

**Functional Requirement**
- The agent generates call summaries that are reviewed by a human before storage.

**Infrastructure Requirement**
- Customer transcript data must remain and be processed within the EU.

### Deliverables
- Requirements specification
- Compliance requirements
- Acceptance criteria

### Gate to Next Phase
Requirements must be approved and traceable before design begins.

---

## 2. Design

### Purpose
Define how the requirements will be implemented.

### Activities
- Select Claude model
- Choose deployment platform
- Define trust boundaries
- Design security architecture
- Design data flows
- Determine residency strategy

### Key Decisions
- Which Claude model is appropriate?
- Where will inference occur?
- Which systems can access customer data?
- How is human approval integrated?

### Example
For the EU bank:
- Processing occurs in EU-hosted infrastructure.
- Human reviewers operate within the approved environment.
- Storage locations satisfy residency requirements.

### Deliverables
- Architecture diagrams
- Data flow diagrams
- Security design
- Trust boundary documentation

### Gate to Next Phase
The design must satisfy all compliance, security, and infrastructure requirements.

**Example Gate**
The team cannot proceed to implementation until the chosen platform supports EU data residency.

---

## 3. Build

### Purpose
Implement the designed solution.

### Activities
- Write agent logic
- Develop tool integrations
- Create prompts
- Configure workflows
- Implement approval mechanisms
- Integrate external systems

### Components Built
#### Agent Logic
Determines how requests are processed.

#### Tools
External actions the agent can perform.

#### Prompts
Instructions that govern agent behavior.

#### Review Workflow
Human approval before persistence.

### Deliverables
- Source code
- Prompt templates
- Configuration files
- Integration components

### Gate to Next Phase
All planned functionality must be implemented and ready for validation.

---

## 4. Test

### Purpose
Verify the system behaves correctly, safely, and reliably.

### Activities
- Run evaluations (evals)
- Execute unit tests
- Perform integration tests
- Conduct end-to-end validation
- Verify compliance controls

### Testing Layers

#### Evals
Measure model behavior and output quality.

Examples:
- Summary quality
- Hallucination rate
- Instruction adherence
- Safety performance

#### Unit Testing
Tests individual components.

Example:
- Verify transcript parser behavior.

#### Integration Testing
Tests interactions between systems.

Example:
- Agent → Review Workflow → Database

#### End-to-End Testing
Validates complete business scenarios.

Example:
- Upload transcript
- Generate summary
- Human approval
- Store approved summary

### Deliverables
- Test reports
- Evaluation results
- Quality metrics

### Gate to Next Phase
The candidate version must satisfy predefined quality thresholds.

---

## 5. Deploy

### Purpose
Release an approved version into an operational environment.

### Activities
- Package release artifacts
- Pin model versions
- Configure environments
- Perform staged rollout
- Promote through environments

### Important Concept: Version Pinning

Version pinning ensures the deployed system consistently uses a known and tested model version.

Benefits:
- Reproducibility
- Stability
- Auditable behavior
- Easier incident investigation

### Example

Instead of:

```text
Use latest Claude model
```

Use:

```text
Use tested model version X
```

### Deployment Gate

A new version should not be promoted to production until it successfully passes evaluations against the approved baseline.

### Deliverables
- Release package
- Deployment configuration
- Version records

---

## 6. Operate

### Purpose
Monitor and manage the production system.

### Activities
- Monitor latency
- Monitor cost
- Monitor failures
- Track quality metrics
- Enforce guardrails
- Handle incidents

### Operational Metrics

#### Cost
Track:
- Token consumption
- API spending
- Resource utilization

#### Latency
Track:
- Response times
- Throughput
- User experience

#### Reliability
Track:
- Error rates
- Failed requests
- Availability

#### Quality
Track:
- Evaluation drift
- Summary accuracy
- Human approval rates

### Guardrails

Guardrails help ensure safe operation.

Examples:
- Content filtering
- Access controls
- Data-loss prevention
- Prompt protections
- Audit logging

### Deliverables
- Dashboards
- Monitoring alerts
- Operational reports
- Incident records

### Gate to Next Phase
Operational findings are collected and analyzed for improvement opportunities.

---

## 7. Iterate

### Purpose
Use production insights to improve the system.

### Activities
- Analyze failures
- Review user feedback
- Examine evaluation results
- Improve prompts
- Update requirements
- Enhance architecture

### Feedback Loop

```text
Requirements
      ↓
Design
      ↓
Build
      ↓
Test
      ↓
Deploy
      ↓
Operate
      ↓
Iterate
      ↓
Requirements (Updated)
```

### Example

Production finding:

```text
Support agents report summaries omit customer account context.
```

Result:

```text
New Requirement:
The summary must include customer account context when present.
```

The lifecycle begins again with updated requirements.

### Deliverables
- Improvement backlog
- Updated requirements
- New architectural decisions

---

# Gating Between Phases

## What Is a Gate?

A **gate** is a formal decision point that determines whether a project may proceed to the next lifecycle phase.

A gate exists to ensure quality, compliance, security, and business objectives are met before further investment occurs.

### Why Gates Matter

Without gates:

```text
Design → Build → Deploy
```

Problems may not be discovered until production.

With gates:

```text
Requirements
    ↓ Approval Gate
Design
    ↓ Architecture Gate
Build
    ↓ Build Completion Gate
Test
    ↓ Evaluation Gate
Deploy
    ↓ Production Approval Gate
Operate
    ↓ Improvement Review
Iterate
```

Each transition is reviewed and validated.

---

## Example: Residency Requirement Gate

### Requirement

```text
Transcript data must remain within the EU.
```

### Design Review

Questions:
- Does the cloud provider support EU regions?
- Is storage located in the EU?
- Are processing services located in the EU?

### Result

If the answer is no:

```text
Gate Failed
```

The project cannot proceed.

If the answer is yes:

```text
Gate Passed
```

The project progresses to implementation.

---

## Example: Evaluation Gate

### Requirement

The new version must outperform or match the approved baseline.

### Test Results

Metrics evaluated:
- Accuracy
- Safety
- Hallucination rate
- Compliance adherence

### Decision

If evaluation passes:

```text
Promote to Production
```

If evaluation fails:

```text
Return to Build or Design
```

---

# What the Lifecycle Handles Well

The lifecycle provides:

- Clear ownership
- Regulatory traceability
- Auditability
- Change control
- Repeatable deployment processes
- Defined approval points

Most importantly, it ensures that each engineering activity belongs to the correct phase and has a corresponding artifact and approval gate.

---

# Cost and Complexity Trade-Off

## Benefit

```text
Higher control
Higher compliance
Higher reliability
```

## Cost

```text
More reviews
More documentation
More approvals
Longer delivery timelines
```

Teams under deadline pressure are often tempted to bypass gates.

In regulated environments, skipping gates increases risk and undermines auditability, making compliance failures more likely.

---

# When a Different Approach May Be Acceptable

For exploratory work:

```text
Prototype
Experiment
Proof of Concept
Hackathon Project
```

Teams may combine or shorten lifecycle phases because the objective is learning rather than production deployment.

Example:

```text
Requirements + Design + Build
```

may occur in a single session.

However, for regulated systems:

```text
Financial Services
Healthcare
Government
Insurance
Critical Infrastructure
```

the full lifecycle with formal gates is necessary to ensure security, compliance, governance, and operational safety.

---

# Key Exam Takeaways

## Lifecycle Order

```text
Requirements
→ Design
→ Build
→ Test
→ Deploy
→ Operate
→ Iterate
```

## Functional Requirement Example

```text
The agent generates a summary that a human approves before storage.
```

## Infrastructure Requirement Example

```text
Transcript data is processed in the EU.
```

## Design Phase Focus

```text
Platform
Model
Architecture
Trust Boundaries
```

## Build Phase Focus

```text
Agents
Tools
Prompts
Workflows
```

## Test Phase Focus

```text
Evals
Unit Tests
Integration Tests
End-to-End Tests
```

## Deploy Phase Focus

```text
Version Pinning
Promotion Gates
Release Management
```

## Operate Phase Focus

```text
Cost
Latency
Errors
Guardrails
Monitoring
```

## Iterate Phase Focus

```text
Production Feedback
Continuous Improvement
Updated Requirements
```

## Most Important Governance Principle

```text
Never skip lifecycle gates in a regulated deployment.
```

Gates are the mechanism that keeps a Claude application reviewable, auditable, compliant, and safe throughout its lifecycle.

# Checkpoint 4: Place the Work in the Right Phase

## Original Content (Converted from Image)

### Instructions
Try it now. Place each activity in the lifecycle phase it belongs to: requirements, design, test, deploy, operate.

### Activities

**(a)** pinning the full model ID and keeping the prior version

Options:
- requirements
- design
- test
- deploy
- operate

---

**(b)** gating promotion on the eval result before a version goes to production

Options:
- requirements
- design
- test
- deploy
- operate

---

**(c)** deciding data must be processed in a specific region

Options:
- requirements
- design
- test
- deploy
- operate

---

**(d)** instrumenting token cost and latency per call in production

Options:
- requirements
- design
- test
- deploy
- operate

---

**(e)** choosing Amazon Bedrock because the customer holds its compliance posture there

Options:
- requirements
- design
- test
- deploy
- operate

---

# Correct Answers with Technical Reasoning

## (a) Pinning the full model ID and keeping the prior version

**Correct Phase:** ✅ **Deploy**

### Technical Reasoning

Pinning a model ID is a release-management and deployment practice. During deployment, the goal is to ensure that the exact tested model version is promoted into production rather than automatically consuming vendor updates.

Keeping the previous version available is part of deployment rollback strategy. If the newly deployed model introduces regressions, unexpected outputs, higher latency, or increased costs, the deployment process should allow rapid reversion to the prior known-good version.

Key deployment characteristics:

- Ensures reproducibility between testing and production.
- Prevents unintended behavior caused by automatic model upgrades.
- Supports blue/green, canary, or rollback deployments.
- Maintains operational stability during releases.

Why not other phases?

- **Requirements:** Does not define business needs.
- **Design:** Architecture may define versioning strategy, but actual model pinning occurs during deployment.
- **Test:** Validation happens before release.
- **Operate:** Monitoring occurs after deployment.

---

## (b) Gating promotion on the eval result before a version goes to production

**Correct Phase:** ✅ **Test**

### Technical Reasoning

Evaluation gating means a candidate model must pass predefined quality thresholds before it can move into production.

This is fundamentally a testing and validation activity because it assesses whether the model satisfies performance requirements such as:

- Accuracy
- Groundedness
- Toxicity thresholds
- Hallucination rates
- Response quality
- Safety metrics

In mature MLOps/LLMOps pipelines, automated evaluation results act as quality gates. Only versions meeting acceptance criteria are eligible for deployment.

Why not deployment?

The actual deployment happens **after** the model passes evaluation. The decision point belongs to the testing phase.

---

## (c) Deciding data must be processed in a specific region

**Correct Phase:** ✅ **Requirements**

### Technical Reasoning

Data residency requirements are business, legal, compliance, or regulatory requirements specified before system design begins.

Examples:

- Data must remain within the EU.
- Data must remain in India.
- Data must not leave a sovereign cloud boundary.
- GDPR or local privacy regulations must be met.

These constraints drive future architecture decisions but are themselves requirements.

Lifecycle flow:

1. Requirement: "Data must stay in a specific region."
2. Design: Select services and architecture that satisfy that requirement.
3. Implementation and deployment follow later.

Therefore, the regional processing constraint originates as a requirement.

---

## (d) Instrumenting token cost and latency per call in production

**Correct Phase:** ✅ **Operate**

### Technical Reasoning

Instrumentation, monitoring, observability, and production telemetry are operational responsibilities.

Measuring:

- Token consumption
- Cost per request
- Response latency
- Throughput
- Error rates
- Availability

is part of ongoing production operations.

These metrics are collected after deployment to ensure:

- Service health
- Cost optimization
- SLA/SLO adherence
- Capacity planning
- Incident detection

Why not test?

Performance testing can simulate latency before release, but continuous measurement of actual production behavior is an operations function.

---

## (e) Choosing Amazon Bedrock because the customer holds its compliance posture there

**Correct Phase:** ✅ **Design**

### Technical Reasoning

Selecting a platform, service, or technology stack is an architectural design decision.

In this case:

- The compliance requirement already exists.
- Architects evaluate available options.
- Amazon Bedrock is selected because it satisfies compliance, governance, security, and organizational constraints.

Typical design activities include:

- Selecting cloud providers.
- Selecting AI platforms.
- Choosing model hosting approaches.
- Defining security architecture.
- Determining integration patterns.

The requirement is "meet compliance obligations." The design decision is "use Amazon Bedrock to fulfill those obligations."

---

# Final Answer Summary

| Activity | Correct Phase |
|-----------|--------------|
| (a) Pinning the full model ID and keeping the prior version | **Deploy** |
| (b) Gating promotion on the eval result before a version goes to production | **Test** |
| (c) Deciding data must be processed in a specific region | **Requirements** |
| (d) Instrumenting token cost and latency per call in production | **Operate** |
| (e) Choosing Amazon Bedrock because the customer holds its compliance posture there | **Design** |

## Mapping Logic

- **Requirements** → Business, legal, compliance, and regulatory constraints.
- **Design** → Architectural and technology choices.
- **Test** → Evaluation, validation, and quality gates.
- **Deploy** → Versioning, release, rollout, and rollback mechanisms.
- **Operate** → Monitoring, observability, telemetry, cost tracking, and production support.

# Checkpoint 4: Place the Work in the Right Phase

## Updated Correct Answers (Based on the Solution Shown)

| Activity | Correct Phase |
|-----------|--------------|
| (a) Pinning the full model ID and keeping the prior version | **Deploy** |
| (b) Gating promotion on the eval result before a version goes to production | **Deploy** |
| (c) Deciding data must be processed in a specific region | **Requirements** |
| (d) Instrumenting token cost and latency per call in production | **Operate** |
| (e) Choosing Amazon Bedrock because the customer holds its compliance posture there | **Design** |

---

# Technical Reasoning

## (a) Pinning the Full Model ID and Keeping the Prior Version

**Correct Phase:** ✅ **Deploy**

### Why?

Pinning a model version ensures that the exact model validated during testing is the same model deployed into production. Maintaining the previous model version enables rollback if issues are discovered after release.

Deployment concerns include:

- Version management
- Release control
- Rollback capability
- Production stability
- Reproducibility

### Why Not Design?

Design may define a versioning strategy, but the actual act of selecting and deploying a specific model version is part of the deployment process.

---

## (b) Gating Promotion on the Eval Result Before a Version Goes to Production

**Correct Phase:** ✅ **Deploy**

### Why?

This is the most commonly misunderstood question.

The **evaluation itself** belongs to the **Test** phase. However, the activity described is **gating promotion** based on those results.

The key phrase is:

> "before a version goes to production"

This describes a deployment control mechanism within a CI/CD or LLMOps pipeline.

The deployment pipeline checks:

- Did the model pass evaluation?
- Did it meet quality thresholds?
- Can this release proceed?

If the criteria are met, promotion occurs. Otherwise, deployment is blocked.

### Important Distinction

| Activity | Phase |
|-----------|--------|
| Creating an evaluation suite | Test |
| Running evaluations | Test |
| Defining scoring rubrics | Test |
| Blocking promotion until evaluations pass | Deploy |

As the solution note states:

> "Writing the eval suite and rubric is test; gating promotion on its result is deploy."

---

## (c) Deciding Data Must Be Processed in a Specific Region

**Correct Phase:** ✅ **Requirements**

### Why?

This is a business, regulatory, privacy, or compliance requirement that exists before architecture decisions are made.

Examples:

- Data must stay within the EU.
- Data must remain in India.
- Sovereign cloud requirements.
- GDPR data residency obligations.

These constraints define what the system must do, not how it will be implemented.

### Lifecycle Flow

1. Requirement established.
2. Architecture designed to satisfy it.
3. Infrastructure deployed accordingly.
4. Compliance continuously monitored.

Therefore it belongs squarely in the **Requirements** phase.

---

## (d) Instrumenting Token Cost and Latency per Call in Production

**Correct Phase:** ✅ **Operate**

### Why?

Instrumentation and observability are operational activities performed on running production systems.

Typical production telemetry includes:

- Token usage
- Cost per request
- Response latency
- Throughput
- Error rates
- Availability metrics

The purpose is ongoing monitoring and optimization after deployment.

### Operational Outcomes

- Detect cost anomalies
- Track SLA/SLO compliance
- Identify performance degradation
- Support capacity planning
- Drive optimization decisions

Since the activity explicitly states **"in production"**, it belongs to **Operate**.

---

## (e) Choosing Amazon Bedrock Because the Customer Holds Its Compliance Posture There

**Correct Phase:** ✅ **Design**

### Why?

The compliance need is the requirement.

Choosing Amazon Bedrock is the architectural response to that requirement.

This decision involves:

- Platform selection
- Cloud architecture
- Security architecture
- Compliance alignment
- Service integration strategy

### Requirement vs Design

| Statement | Phase |
|-----------|--------|
| Customer data must satisfy compliance controls | Requirements |
| Use Amazon Bedrock to satisfy those controls | Design |

The platform choice is therefore a **Design** decision.

---

# Summary of the Core Principle

The distinction between phases is:

- **Requirements** → What constraints or business needs exist?
- **Design** → What architecture or technology will satisfy them?
- **Test** → How do we verify quality and correctness?
- **Deploy** → How do we safely release to production?
- **Operate** → How do we monitor and manage production systems?

Applying that framework:

```text
(a) Pin model version and retain rollback version        → Deploy
(b) Gate promotion using eval results                    → Deploy
(c) Data must remain in a specific region                → Requirements
(d) Measure token cost and latency in production         → Operate
(e) Choose Amazon Bedrock for compliance reasons         → Design
```

**Key correction from the previous answer:**  
Question **(b)** is **Deploy**, not **Test**, because the question concerns **promotion gating in the release pipeline**, not the creation or execution of evaluations themselves.