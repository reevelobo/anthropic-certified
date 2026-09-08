# Connecting Claude to Enterprise Systems and Authenticating It Securely

Earlier the module covered how to build an MCP server and configure its transport and scope. For a server used only by your team on an internal project, the GitHub personal-access-token example covers the authentication pattern.

This section covers what changes when the integration must work in a regulated environment: the identity, secret-handling, and data-residency questions that a prototype usually ignores become requirements that must be answered in the production deployment.

---

# Why Enterprise Integration Is Different From a Working Prototype

A prototype that connects Claude to an internal service answers one question:

> Does the connection work?

A production enterprise integration must answer several additional questions:

- Who is the model acting as, and is that identity auditable?
- What data can it access, and where does that data leave the organization?
- Can an administrator lock the configuration so no individual developer can change the authentication setup?
- Can the access be logged in a way that satisfies a compliance audit?

These questions are not new to enterprise software. They have the same identity, access, and compliance requirements that apply to any external system touching regulated data.

Treating them as part of the integration design is what separates a demo from something deployment-ready.

---

# Authentication Patterns by Service Type

The right authentication mechanism depends on where the service runs and what identity model it supports.

## Remote Services With User Identity

Use **OAuth**.

The MCP server returns a `401 Unauthorized` response to signal that authentication is required.

The client then:

1. Initiates a browser-based sign-in flow.
2. Requests user approval.
3. Receives an access token.
4. Stores the token for future use.

Advantages:

- No manual secret handling.
- User identity is preserved.
- Permissions align with the user's existing account.

Typical use cases:

- SaaS platforms
- Cloud services
- User-centric integrations

Example:

- Linear MCP Server

Comparison:

- Linear → OAuth
- GitHub MCP → Personal Access Token (PAT)

---

## Remote Services With Service Identity

Use an **API key** supplied through an environment variable.

The key represents a service account rather than a human user.

Requirements:

- Store the key in environment variables.
- Never commit the key to configuration files.
- Inject the key at runtime.

Example:

A CI pipeline using the Agent SDK.

```text
CI Platform Secret Store
        ↓
Environment Variable
        ↓
MCP Configuration Reference
```

The key is injected by the pipeline runner and never written to source control.

---

## Local Services With File-System Access

Use:

```text
stdio transport
```

No network authentication is required.

Security comes from:

- File-system permissions
- Operating-system access controls
- Deny rules in Claude settings

In this model, the file system itself is the security boundary.

---

# Secret Management: Storage, Rotation, and Separation From Configuration

Authentication establishes the connection.

Secret management keeps the connection secure over time.

The earlier MCP key leak was not caused by choosing the wrong authentication method.

The problem was that the credential lived in the wrong location.

Three practices prevent this failure.

---

## 1. Separation

A credential should never travel with the configuration file that references it.

### Wrong

```json
{
  "Authorization": "Bearer sk-123..."
}
```

### Correct

```json
{
  "Authorization": "Bearer ${MCP_TOKEN}"
}
```

Why this matters:

Configuration files are:

- Committed
- Cloned
- Shared
- Archived

A credential written directly into a configuration file becomes part of every copy.

Once committed:

- It enters repository history.
- It remains accessible even after being removed later.

Keeping secrets out of configuration files makes the configuration safe to share.

---

## 2. Where the Secret Lives

Once removed from configuration files, the secret needs a secure home.

### Environment Variables

Best when:

- Used on a single machine.
- Used in a single execution.
- Short-lived.

Example:

```bash
export MCP_TOKEN=abc123
```

Advantages:

- Easy to deploy
- Prevents repository leaks
- Works well with CI/CD systems

---

### Secret Managers

Best when:

- Multiple systems need the credential.
- Auditing is required.
- Central management is desired.

Examples:

- Azure Key Vault
- AWS Secrets Manager
- HashiCorp Vault
- Google Secret Manager

Advantages:

- Centralized storage
- Access auditing
- Easier rotation
- Fewer duplicated secrets

A single secret rotation updates all consumers.

---

## 3. Rotation

Rotation means replacing a credential with a new one.

Perform rotation:

- On a schedule
- Immediately after a suspected exposure

Why?

A leaked key cannot become secret again.

The only valid response is issuing a replacement key.

### Bad Pattern

```text
Credential hardcoded into source code
```

Problems:

- Rotation becomes difficult.
- Historical commits still contain old keys.
- Every dependent service may break.

### Better Pattern

```text
Code
 ↓
Environment Variable
 ↓
Secret Store
 ↓
Credential
```

Benefits:

- Credential value changes.
- Application code remains unchanged.

---

## Making Rotation Easier

Two practices reduce rotation risk.

### Narrow Credential Scope

Give each credential only the permissions it truly needs.

Example:

Instead of:

```text
Read + Write + Admin
```

Use:

```text
Read Only
```

or

```text
Limited Repository Access
```

A leaked credential then has a smaller blast radius.

---

### Track Credential Consumers

Maintain documentation showing:

- Which systems use the credential
- Which applications depend on it

Then:

```text
Rotate Key
      ↓
Update Secret Store
      ↓
All Consumers Receive New Value
```

without searching for hidden dependencies.

---

# What Regulated Industries Add

Organizations in healthcare, finance, government, and regulated sectors need more than functional authentication.

They ask:

- Where is data processed?
- How is access audited?
- Who controls the configuration?
- Can developers override security settings?

---

## Enterprise Managed Configuration

Enterprise-managed configuration answers:

> Who controls authentication?

An administrator pushes the configuration centrally.

Benefits:

- Consistent settings
- No individual overrides
- Easier governance
- Simpler audits

---

## Audit Hooks

Audit requirements are answered using:

```text
PostToolUse hooks
```

A PostToolUse hook can log:

- Tool name
- Parameters
- Timestamp
- User identity
- Result metadata

Example:

```text
Agent Calls Tool
        ↓
PostToolUse Hook Fires
        ↓
Audit Log Receives Entry
```

Because hooks execute automatically, the model cannot skip them.

---

## Data Residency

Data residency answers:

> Where does data go?

Example:

```text
Claude
   ↓
EU HTTP Endpoint
   ↓
EU Infrastructure
```

Benefits:

- Regional compliance
- Regulatory traceability
- Auditable deployment architecture

A compliance reviewer can verify exactly where data is processed.

---

# Code Modernization: Applying the Full Module

Code modernization is an excellent use case because it combines:

- High risk
- Large scope
- Limited reversibility

The framework taught throughout the module reduces that risk.

---

## Plan Mode

Plan Mode keeps the agent in:

```text
Read-only exploration
```

before modifications occur.

Benefits:

- Understand dependencies first.
- Review impact.
- Identify unexpected file touches.
- Approve changes before execution.

---

## Hooks

Hooks provide guardrails.

Examples:

- Block changes to production configs.
- Prevent editing protected directories.
- Require approval for sensitive paths.

Hooks enforce policy automatically.

---

## CLAUDE.md

CLAUDE.md documents:

- Coding standards
- Architectural conventions
- Migration patterns

Benefits:

- Consistent modernization
- Reduced drift
- Better alignment across large changes

---

# Three Questions Before High-Risk Work

Before starting modernization work, answer:

## 1. What Is the Blast Radius?

Consider:

- Which systems depend on the code?
- What breaks if changes fail?
- What downstream services are impacted?

---

## 2. How Are Changes Audited?

Determine:

- Is a PostToolUse hook logging actions?
- Is the audit trail sufficient?
- Can reviewers reconstruct what happened?

---

## 3. Who Approves Each Phase?

Plan Mode creates the boundary between:

```text
Exploration
      ↓
Execution
```

But humans still define approval requirements.

Examples:

- Developer approval
- Team lead approval
- Change review board approval

---

# The Authentication and Integration Checklist

The table below names the key decisions for each service type.

| Service Type | Auth Method | Where Secrets Live | What Gets Logged | Who Can Lock the Config |
|-------------|-------------|-------------------|------------------|------------------------|
| Remote with user identity (SaaS, cloud) | OAuth | Token issued by OAuth provider and stored by client | PostToolUse hook to audit log | Administrator via enterprise managed settings |
| Remote with service identity (internal API) | API key in environment variable | Environment only. Never in committed config | PostToolUse hook to audit log | Administrator via enterprise managed settings |
| Local (file system, local DB) | File-system permissions | No credential needed. Deny rules enforce path access | PostToolUse hook to audit log | Deny rules in enterprise managed settings |

---

# Technical Reasoning Behind the Checklist

## Remote With User Identity

### Correct Authentication

```text
OAuth
```

Reason:

The service needs to know *which user* is acting.

Benefits:

- User-specific authorization
- Revocable access
- Auditability
- MFA support

Typical services:

- Google Workspace
- Microsoft 365
- Salesforce
- Linear

---

## Remote With Service Identity

### Correct Authentication

```text
API Key via Environment Variable
```

Reason:

The service cares about the application identity rather than a human identity.

Benefits:

- Simpler automation
- Works in CI/CD
- Headless execution

Security requirement:

```text
Never commit the API key
```

---

## Local Resources

### Correct Authentication

```text
File-system permissions
```

Reason:

The operating system already controls access.

Examples:

- SQLite database
- Local source code
- Local files

Adding network authentication would add complexity without improving security.

---

# Cost · Complexity · Risk

## Cost

Additional operational effort:

- OAuth onboarding
- Secret rotation
- Audit logging

All introduce small overhead.

---

## Complexity

Enterprise environments require:

- Identity management
- Auditing
- Governance
- Compliance

These concerns do not usually exist in prototypes.

---

## Risk

A production integration that has:

- Hardcoded credentials
- No audit logs
- No centralized control

will likely fail a security review.

The fixes are usually straightforward:

- Move secrets to managed storage
- Add audit hooks
- Use enterprise-managed settings

---

# Handles Well

The enterprise model works especially well for:

- Healthcare systems
- Financial systems
- Government systems
- Compliance-sensitive environments

Requirements are addressed upfront instead of stalling deployment later.

---

# Adds Cost or Complexity

Organizations unfamiliar with:

- OAuth
- Secret managers
- Enterprise governance

often need assistance from:

- Security teams
- Platform teams
- IT administrators

This coordination should be included in project timelines.

---

# Use a Different Approach

For:

- Demos
- Proofs of concept
- Sandbox experiments

the full enterprise checklist may be unnecessary.

However, one practice should always be followed:

```text
Never place secrets in source control.
Use environment variables from day one.
```

It costs nothing and prevents one of the most common security failures in MCP deployments.

# The OAuth Connection That Worked in Staging and Failed in Production

## Setup

The OAuth connection worked end to end in staging, so moving it to production felt like a routine cutover.

What the team missed was that OAuth redirect URIs are registered per host and often governed per environment. Success in staging does not automatically mean the production host is authorized to complete the sign-in flow.

---

# The Conversation That Surfaced the Missing Step

The following exchange occurred during a post-deployment review after an MCP integration failed in production.

The integration had passed all staging tests successfully.

---

### Security Reviewer

> Every production sign-in attempt through the MCP connection is failing. The error is a redirect URI mismatch. Where was the OAuth app registered?

### Developer

> I registered it for `staging.mycompany.com` during development. We moved to production last week. The connection worked all through staging.

### Security Reviewer

> That's the issue. The OAuth provider only accepts redirect URIs you've explicitly registered, and `production.mycompany.com` is not on the allowed list. Every sign-in attempt hits the check, fails the URI match, and loops back to the sign-in screen.

### Developer

> So I just need to add the production URI to the app registration?

### Security Reviewer

> Yes, and before you do, check whether your staging app registration should be a separate app from production. Most enterprise customers require separate OAuth app registrations for each environment as part of their security policy, so using the same app registration across environments is the second issue I'd flag.

---

# What Actually Happened

The developer had already verified:

- OAuth authorization flow
- Token issuance
- Callback handling
- Authentication success

All testing passed in staging.

The production failure was **not a code defect**.

The root cause was a configuration mismatch.

The OAuth provider validates the redirect URI supplied during the OAuth flow against a list of pre-approved redirect URIs configured in the OAuth application registration.

The registered configuration contained:

```text
https://staging.mycompany.com/oauth/callback
```

but did not contain:

```text
https://production.mycompany.com/oauth/callback
```

When users attempted to authenticate in production:

1. User clicked sign-in.
2. OAuth provider received the authorization request.
3. OAuth provider examined the redirect URI.
4. Redirect URI was compared against the registered allow-list.
5. No exact match was found.
6. Authentication request was rejected.
7. User was returned to the login screen.

The application code behaved correctly.

The registration configuration was incomplete.

---

# Technical Reasoning

## Why OAuth Providers Validate Redirect URIs

OAuth providers enforce redirect URI validation to prevent authorization code theft.

Without validation, an attacker could attempt to redirect users to a malicious callback endpoint.

Example:

```text
Expected Redirect URI

https://production.mycompany.com/oauth/callback
```

Attacker attempts:

```text
https://evil-site.com/oauth/callback
```

If OAuth providers accepted arbitrary redirect destinations:

- Authorization codes could be intercepted.
- Access tokens could be stolen.
- User accounts could be compromised.

Therefore OAuth providers require:

```text
Exact redirect URI registration
```

before authentication succeeds.

---

## Why Staging Success Does Not Guarantee Production Success

A common misconception is:

> "If OAuth works in staging, it should work in production."

OAuth registrations are usually environment-specific.

Each environment often has different:

- Hostnames
- Domains
- Redirect endpoints
- Security policies

Example:

### Staging

```text
https://staging.mycompany.com/oauth/callback
```

### Production

```text
https://production.mycompany.com/oauth/callback
```

Although the application code may be identical, OAuth sees these as two completely different redirect locations.

The production URI must be explicitly registered.

---

## Why Enterprise Organizations Often Require Separate OAuth Applications

Many regulated organizations prohibit sharing OAuth app registrations across environments.

Instead they maintain:

```text
Staging OAuth App
```

and

```text
Production OAuth App
```

separately.

### Benefits

#### Security Isolation

Compromising staging does not affect production.

#### Independent Secrets

Different client IDs and client secrets can be used.

#### Separate Auditing

Security teams can distinguish:

- Testing activity
- Production activity

#### Different Security Policies

Production may require:

- MFA
- Conditional access
- Stricter token lifetimes

while staging may not.

---

# Example Architecture

## Incorrect Setup

```text
               OAuth App
                    │
      ┌─────────────┼─────────────┐
      │                           │
  Staging                    Production
      │                           │
 staging.mycompany.com     production.mycompany.com
```

Problems:

- Shared registration
- Shared secrets
- Potential policy conflicts

---

## Recommended Setup

```text
        Staging OAuth App
                │
                │
      staging.mycompany.com


        Production OAuth App
                │
                │
     production.mycompany.com
```

Benefits:

- Environment isolation
- Independent controls
- Easier compliance review
- Reduced blast radius

---

# What to Watch Out For

OAuth redirect URIs are registered per host.

A successful staging authentication flow does **not** prove the production environment is configured correctly.

Before moving an OAuth-authenticated MCP integration into a new environment:

## Verify Redirect URI Registration

Ensure the production callback URL exists in the OAuth application registration.

Example:

```text
https://production.mycompany.com/oauth/callback
```

must appear in the registered redirect URI list.

---

## Verify Environment Separation Requirements

Determine whether security policy requires:

```text
Separate OAuth Application
```

for:

- Development
- Testing
- Staging
- Production

Many enterprise and regulated environments require this separation.

---

## Verify Client Credentials

Ensure the correct:

- Client ID
- Client Secret
- Tenant configuration
- Redirect URI list

are deployed to production.

---

## Include OAuth Registration in Deployment Checklists

Do not treat OAuth registration as an implementation detail.

It should be a formal deployment step.

Example checklist:

```text
□ Production application deployed

□ Production redirect URI registered

□ Production client secret configured

□ Production OAuth app approved

□ Authentication smoke test completed

□ Audit logging verified

□ Rollback plan documented
```

---

# Lessons Learned

The failure was not caused by:

- MCP transport
- OAuth implementation code
- Token handling logic

The failure was caused by:

```text
Missing OAuth redirect URI registration
```

The staging environment was correctly configured.

The production environment was not.

This is a common enterprise deployment issue because OAuth registrations often exist outside the application code and therefore are not automatically carried from one environment to another.

---

# Key Takeaway

A working OAuth flow in staging only proves that the **staging redirect URI** is registered and authorized.

Before production deployment:

1. Register the production redirect URI.
2. Verify the correct OAuth application is being used.
3. Confirm whether separate app registrations are required per environment.
4. Include OAuth registration verification in deployment checklists.

The safest enterprise pattern is:

```text
Environment-Specific OAuth Apps
          +
Registered Redirect URIs
          +
Deployment Validation Checklist
```

This prevents authentication failures from being discovered during the first production sign-in attempt.

# Checkpoint 6: Diagnose the Authentication Failure From a Trace

*Try it now: read the connection trace below.*

Name the authentication failure mechanism, then select the correct targeted fix from three options.

---

## Connection Trace

```text
[MCP Client] Connecting to https://data-api.internal/mcp ...

[MCP Client] GET /auth/token, 401 Unauthorized

[MCP Client] Reading credential from:
/home/jenkins/.config/mcp-credentials.json

[MCP Client] Credential value:
WAREHOUSE_TOKEN=sk-****[redacted]

[MCP Client] Retrying with credential,
401 Unauthorized

[MCP Client] Connection failed after 3 attempts
```

### Options

**A**

Fix A: Rotate the API key and update

```text
/home/jenkins/.config/mcp-credentials.json
```

with the new value.

---

**B**

Fix B: Rotate the rejected key, then move the credential out of the file and inject it as an environment variable in the CI pipeline runner configuration. Update the MCP configuration to reference the variable.

---

**C**

Fix C: Switch from API key authentication to OAuth for this service.

---

# Correct Answer

## ✅ Option B

```text
Fix B: Rotate the rejected key, then move the credential out of the file and inject it as an environment variable in the CI pipeline runner configuration. Update the MCP configuration to reference the variable.
```

---

# Authentication Failure Mechanism

## Compromised or Rejected API Key Stored Improperly in a File

The trace shows that the MCP client is using:

```text
WAREHOUSE_TOKEN=sk-****[redacted]
```

and repeatedly receives:

```text
401 Unauthorized
```

This tells us:

1. Authentication is occurring.
2. A credential is being supplied.
3. The server rejects that credential.
4. The key is stored in a file.
5. The key likely needs replacement (rotation).

More importantly, the trace reveals a second architectural problem:

```text
/home/jenkins/.config/mcp-credentials.json
```

contains the credential directly.

This violates the recommended enterprise secret-management pattern.

---

# Evidence in the Trace

## Step 1: Connection Starts

```text
[MCP Client] Connecting to https://data-api.internal/mcp
```

The client successfully reaches the service.

Therefore:

✅ Network connectivity exists.

The failure is not:

- DNS
- Firewall
- HTTP transport configuration

---

## Step 2: Authentication Endpoint Returns 401

```text
[MCP Client] GET /auth/token, 401 Unauthorized
```

A `401 Unauthorized` means:

```text
Authentication failed.
```

The request reached the server.

The server rejected the provided identity.

This indicates:

- Invalid key
- Expired key
- Revoked key
- Misconfigured credential

---

## Step 3: Credential Source Is Revealed

```text
Reading credential from:
/home/jenkins/.config/mcp-credentials.json
```

This is the most important clue.

The credential is being read from a file.

According to the module:

> Service-account credentials should not be stored in committed or managed configuration files. Secrets should be injected through environment variables or a managed secret store.

---

## Step 4: Retry Also Fails

```text
Retrying with credential,
401 Unauthorized
```

The same credential fails repeatedly.

Therefore:

✅ OAuth redirect mismatch is NOT the issue.

✅ Missing credential is NOT the issue.

✅ Authentication method itself is probably correct.

The actual credential is being rejected.

---

# Why Option A Is Wrong

## Option A

```text
Rotate the API key and update
/home/jenkins/.config/mcp-credentials.json
```

### What It Gets Right

Rotating the key is correct because:

```text
401 Unauthorized
```

suggests the existing key is no longer valid.

---

### What It Gets Wrong

The credential remains stored in:

```text
mcp-credentials.json
```

This preserves the original security flaw.

The lesson repeatedly emphasizes:

```text
Secrets should not live inside configuration files.
```

Updating the file merely replaces one secret with another.

The bad practice continues.

Therefore Option A only addresses the symptom, not the root cause.

---

# Why Option C Is Wrong

## Option C

```text
Switch from API key authentication to OAuth
```

### Why This Is Incorrect

Nothing in the trace suggests that OAuth is required.

The service is already using a service-account pattern.

The lesson's guidance states:

| Service Type | Correct Auth Method |
|-------------|---------------------|
| Remote service with user identity | OAuth |
| Remote service with service identity | API key |

This trace appears to be:

```text
CI Pipeline
        ↓
Internal API
```

which is a service-to-service integration.

Service-to-service authentication generally uses:

```text
API Keys
```

or

```text
Service Principals
```

not interactive OAuth login flows.

Changing authentication methods would not address the observed failure.

---

# Why Option B Is Correct

## Option B

```text
Rotate the rejected key.
Move the secret into an environment variable.
Inject it through the CI runner.
Reference the variable from MCP configuration.
```

This option fixes both problems:

### Problem 1

The credential appears invalid.

Solution:

```text
Rotate the key.
```

---

### Problem 2

The credential is stored incorrectly.

Current state:

```text
mcp-credentials.json
    ↓
contains secret
```

Recommended state:

```text
Secret Store / CI Secret
            ↓
Environment Variable
            ↓
MCP Configuration Reference
```

---

# Recommended Implementation

## Bad Pattern

```json
{
  "headers": {
    "Authorization": "Bearer sk-abc123"
  }
}
```

Problems:

- Secret stored in file
- Easy to leak
- Difficult rotation
- May enter repository history

---

## Better Pattern

```json
{
  "headers": {
    "Authorization": "Bearer ${WAREHOUSE_TOKEN}"
  }
}
```

---

## CI Configuration

```text
WAREHOUSE_TOKEN
    ↓
Stored as CI Secret
    ↓
Injected into Environment
    ↓
Referenced by MCP Configuration
```

This aligns exactly with the enterprise authentication guidance described in the lesson.

---

# Root Cause Analysis

## Root Cause

```text
Rejected API key
+
Credential stored in a file
```

---

## Not the Root Cause

### ❌ Network Issue

The server responds.

### ❌ Transport Issue

HTTP communication succeeds.

### ❌ OAuth Redirect Failure

No OAuth flow appears in the trace.

### ❌ MCP Server Misconfiguration

Authentication reaches the server correctly.

---

# Final Answer

## Authentication Failure Mechanism

```text
A rejected or invalid service-account API key being loaded from a credential file.
```

## Correct Fix

```text
✅ Option B
```

Rotate the rejected key, remove the credential from the file, store it as a CI-managed secret or environment variable, and update the MCP configuration to reference the variable instead of storing the secret directly.