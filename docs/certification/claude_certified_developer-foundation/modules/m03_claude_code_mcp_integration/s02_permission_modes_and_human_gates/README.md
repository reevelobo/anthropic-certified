# Claude Code agent loop, permission modes, settings, and where a human gate goes

Module 2 established how the agent loop works at the API level: the model calls tools, gets results back, and continues until the task is done.

Claude Code runs that same loop in your terminal but adds an additional layer: a permission system that gates every action the agent wants to take. Before you can configure anything, you need to understand how the loop runs and what the permission modes control.

## How Claude Code works through a task: explore, plan, and code

When you hand Claude Code a task, it does not start writing immediately. It reads files, traces the relevant logic, and builds a picture of the codebase first; this is the exploration phase.

Then, once it understands enough to propose a change, it creates a plan. A plan is a structured description of the edits it intends to make.

Only after you review and approve the plan does it move into the code phase, where it writes and executes the changes.

This sequence matters for two reasons.

First, it produces better output: Claude Code understands the codebase before touching anything, so it makes fewer assumptions and catches more downstream effects.

Second, it is where the permission modes plug in: plan mode holds Claude Code in the explore phase, blocking all file edits and shell commands until you release it, making it a useful default for unfamiliar codebases or high-stakes work.

## Permission modes: approvals, gates, and constraints

Permission modes control how often Claude Code stops to ask for confirmation. Each mode makes a different tradeoff between speed and oversight. The right choice depends on how well you know the codebase and how reversible the changes are.

### `default`

**What it auto-approves:**

- Reads only.
- Prompts before nearly every edit or command.

**What it still gates:**

- All file edits and shell commands require confirmation.

**Limitations:**

- Safe but slow on trusted work.
- The baseline for any new project or unfamiliar codebase.

### `acceptEdits`

**What it auto-approves:**

- Reads.
- File edits.
- Common filesystem commands inside the working directory:
  - `mkdir`
  - `touch`
  - `rm`
  - `rmdir`
  - `mv`
  - `cp`
  - `sed`

Auto-approval is scoped to paths inside the working directory, and protected paths still prompt.

**What it still gates:**

- All other shell commands.
- Writes outside the working directory.
- Writes to protected paths.

**Limitations:**

- Trusted local work where shell execution still needs a human eye.
- Not appropriate if the agent must run scripts.

### `plan`

**What it auto-approves:**

- Reads only.
- Researches and proposes.
- Makes no edits.

**What it still gates:**

- All file edits and shell commands until you approve a plan.

**Limitations:**

- Exploration and planning on sensitive or unfamiliar codebases.
- Not appropriate for tasks that must write output.

### `auto`

**What it auto-approves:**

Everything, but a separate classifier reviews each action first and blocks anything that:

- Escalates beyond your request.
- Targets unrecognized infrastructure.
- Appears driven by hostile or inappropriate content.

**What it still gates:**

- Production deploys and migrations.
- Mass deletes.
- Credential exfiltration.
- Force-push to main.

These are blocked by default.

**Limitations:**

- Reduces prompts but does not guarantee safety.
- Research preview, not a substitute for reviewing sensitive operations.
- Availability depends on plan, model version, and admin settings.
- Always verify current requirements before build.

### `dontAsk`

**What it auto-approves:**

- Only tools you pre-approved in an allow rule.
- Read-only commands.

Everything else is automatically denied.

**What it still gates:**

- Every tool call not on the allow list is denied.
- There is no queue for confirmation.

**Limitations:**

- Built for locked-down CI and scripts.
- Restricts well, but is not a way to reduce friction on local interactive work.

### `bypassPermissions`

**What it auto-approves:**

- All tool calls.
- No confirmation prompts.
- No safety checks.

**What it still gates:**

Nothing in normal operation.

Only catastrophic delete commands such as:

```bash
rm -rf /
rm -rf ~
```

still trigger a last-resort prompt.

**Limitations:**

- Only inside an isolated container or VM where the environment is disposable.
- Never on a developer workstation against a live codebase.

## Where does the configuration live and who it applies to

Settings can be placed at several levels, and each level determines the scope of the rules it contains.

### 1. User level (`~/.claude/settings.json`)

Applies to every project on the machine.

This is the right place for preferences that should follow you everywhere, such as a preferred default mode for exploration work.

### 2. Project level (`.claude/settings.json`, committed to the repo)

Applies to everyone who clones the repository.

This is the right place for:

- Team-wide conventions
- Allow rules for project tools
- Deny rules for paths that should not be touched

### 3. Local project level (`.claude/settings.local.json`)

Personal overrides for one project, automatically git-ignored.

This is the right place for:

- Your own preferences
- Settings that should not be committed for the whole team

### 4. Enterprise level (`managed-settings.json`)

Set by administrators.

Cannot be overridden by users or project files.

This is the right place for organization-wide security controls such as:

- Denying edits to environment files
- Blocking specific shell commands
- Global governance controls

### Allow and deny rule precedence

Allow and deny rules layer on top of the selected mode.

> A deny rule always wins over an allow rule, regardless of the active mode.

The most durable governance control is an enterprise-level deny rule because:

- It cannot be removed by individual developers.
- It applies across all projects.
- It remains effective even when a permissive mode is selected.

## Where a human still has to look: placing the review gate by worst-case cost

Permission modes and deny rules decide what the agent can do without asking.

They do not decide where a human still needs to look before an action lands.

That decision rests on one question:

> What is the worst outcome if this action runs without a person checking it?

The lower the cost of being wrong, the more you can let through.

The higher the cost, and the harder it is to undo, the more a step needs a human gate before it executes.

That same worst-case question places the gate whether the agent is writing code or running unattended in an automated step such as a bot that comments on or blocks a pull request.

### 1. Low-stakes, reversible actions

Let low-stakes, reversible actions through without a gate.

Examples:

- Formatting fixes
- Small refactors
- Edits confined to the working directory

The cost of being wrong is low, and mistakes are easy to undo.

This is the scenario `acceptEdits` was built for.

### 2. High-cost or sensitive actions

Gate any action that is hard to undo or reaches a sensitive path.

Examples:

- Writes outside the working directory
- Destructive shell commands
- Security-relevant files
- Protected files

The cost of a wrong action is high, so the agent should pause and surface the action for human review.

Typical controls include:

- Deny rules
- `default` mode
- `plan` mode

### 3. Sensitive code designated by the team

Never let the agent be the only gate on a change to code your team has marked sensitive.

Examples:

- Authentication systems
- Authorization logic
- Security controls
- Payments infrastructure
- Compliance-related code

In these situations:

- The agent's work is an input to a human decision.
- Human review remains mandatory before merge.

## Permission modes and review gates are the same decision

The placement of the gate and the choice of permission mode are the same decision viewed from two sides.

- The permission mode sets the default behavior for a session.
- The review gate overrides that default where consequences are too costly.

Both derive from the same question:

> What breaks if this runs unchecked?

## Cost · Complexity · Risk

### Cost

Running in `default` mode on trusted work adds prompt latency to every tool call.

This accumulates during long debugging sessions, migrations, or refactors.

### Complexity

Multiple layers of settings create an override hierarchy that requires ongoing care.

Example:

- Enterprise deny rule
- Project allow rule
- User preference

Teams must clearly understand which configuration ultimately wins.

### Risk

The primary risk is selecting the wrong permission mode for the environment.

For example:

- Enabling `bypassPermissions` out of impatience.
- Running it on a workstation connected to live repositories.
- Removing all meaningful safety prompts between the agent and production files.

Unlike other modes, bypass mode also removes the protected-path guard, making mistakes significantly more expensive and harder to recover from.


# The bypass mode that removed the one prompt that mattered

## Setup

You switched to `bypassPermissions` to stop the constant prompts because the work felt routine. The agent had been well-behaved for days, the cleanup task was simple, and the prompt-before-every-tool-call behavior felt like unnecessary friction.

## The transcript

The following pairing session happened on a codebase cleanup that had been running without incident for three days.

**Dev:**  
"All right, I’m switching to `bypassPermissions` for this one. It’s just renaming old API endpoint references. Nothing risky."

**Claude Code:**  
`[Scanning files matching pattern /v1/legacy/ ... 47 files found]`

**Claude Code:**  
`[Updating endpoint references ...]`

**Claude Code:**  
`[Running post-rename cleanup.sh script ...]`

**Claude Code:**  
`[Deleted 3 files matching /v1/legacy/ in /deploy/config/prod/ ...]`

**Dev:**  
"Wait. What was in `/deploy/config/prod/`?"

**Claude Code:**  
`[Files contained environment-specific endpoint overrides for the production deployment. They have been removed.]`

**Dev:**  
"That directory wasn’t supposed to be in scope. I was working on `/src/`."

**Claude Code:**  
`[The pattern /v1/legacy/ matched files in both /src/ and /deploy/config/prod/. In bypassPermissions mode, no confirmation was requested before the deletions.]`

The prompt that would have caught this mistake was turned off when `bypassPermissions` was turned on.

In `default` or `acceptEdits` mode, the cleanup script would not have run without a confirmation, and the user could have stopped the deletion before it reached the production configuration files.

In `bypassPermissions`, the pattern match was broader than intended, and no prompt stood between the script and the files it deleted.

### Important nuance

Note the precise location of the gate:

> It was the **script invocation** that would have prompted, not the `rm` deletion commands by themselves.

`acceptEdits` auto-approves common filesystem commands, including `rm` on paths inside the working directory.

Had Claude issued the deletions directly as `rm` commands, `acceptEdits` would have let them through silently.

Only `default` mode prompts for those commands.

## What to Watch Out for

A bypass mode silences **all confirmation prompts**, including the ones you might not have anticipated.

The failure pattern here is:

1. The agent matches a broader set of files than intended.
2. The agent runs in a mode without checkpoints.
3. A destructive action executes without review.

`bypassPermissions` also skips the protected-path guard that the other modes keep.

As a result, even:

- Repository state
- Configuration files
- Claude's own configuration

lose their automatic prompt protection.

To cover this gap, you must set a **deny rule** on sensitive directories before switching modes.

For example, protect locations such as:

- `/deploy/config/prod/`
- Environment configuration directories
- Secrets locations
- Infrastructure definitions
- Production deployment scripts

If you want fewer prompts without losing the safety net, use a **classifier-gated mode** such as `auto` instead of a full bypass.

## Key lesson

The mistake was not the delete command itself.

The mistake was removing the **one review gate** that would have surfaced the cleanup script before it ran.

When using Claude Code:

- Use `bypassPermissions` only in isolated and disposable environments.
- Protect sensitive paths with deny rules.
- Review scripts that operate on file patterns.
- Place human approval gates wherever the worst-case cost of being wrong is high.

A single prompt can be the difference between a harmless cleanup and a production outage.

# Checkpoint 1: assemble the settings file and place the human gate

*Try it now. You are configuring Claude Code for a trusted local refactor of the payments module.*

The refactor should auto-approve file edits but must never run destructive shell commands, and the file `.env.production` must never be readable by the agent. Below are `settings.json` pieces.

## Part 1: Select the settings.json pieces that assemble the correct configuration

Select two pieces.

### Piece A

```json
{ "permissions": { "defaultMode": "default" } }
```

### Piece B

```json
{ "permissions": { "defaultMode": "bypassPermissions" } }
```

### Piece C

```json
{
  "permissions": {
    "allow": ["Bash(npm run:*)"],
    "deny": ["Bash(rm:*)", "Bash(git push:*)"]
  }
}
```

### Piece D

```json
{
  "permissions": {
    "deny": ["Read(.env.production)"]
  }
}
```

### Piece E

```json
{
  "permissions": {
    "allow": ["Bash(*)", "Edit(*)"]
  }
}
```

---

## Part 2

Your settings allow the agent to edit files automatically. During the refactor the agent proposes a change to a deployment configuration file that several production services read.

Where should a human gate sit for that one action?

Choose the single best answer.

### A

Nowhere: the settings already auto-approve edits, so let it run.

### B

A human reviews and approves the change to the deployment configuration file before the write executes, because a wrong value there is hard to undo and reaches systems outside the file.

### C

Add `bypassPermissions` so the agent never pauses.

### D

Review the change only after the write, during the next pull request.

---

# Correct Answers

## Part 1 Answer

✅ **Piece C** and **Piece D**

### Why Piece C is correct

```json
{
  "permissions": {
    "allow": ["Bash(npm run:*)"],
    "deny": ["Bash(rm:*)", "Bash(git push:*)"]
  }
}
```

#### Technical reasoning

- The scenario says the refactor should **auto-approve file edits** but **must never run destructive shell commands**.
- `Bash(rm:*)` is explicitly denied, preventing destructive deletes.
- `Bash(git push:*)` is also denied, preventing potentially high-impact repository operations.
- The configuration allows specific shell activity (`npm run`) while restricting dangerous commands.
- This follows the principle from the lesson that **deny rules override allows** and should be used for high-risk actions.

### Why Piece D is correct

```json
{
  "permissions": {
    "deny": ["Read(.env.production)"]
  }
}
```

#### Technical reasoning

- The requirement explicitly states that `.env.production` **must never be readable by the agent**.
- A deny rule provides deterministic enforcement.
- Preventing reads of production environment files protects:
  - Secrets
  - API keys
  - Database connection strings
  - Production configuration values

Because deny rules take precedence, the agent cannot read the file even if other settings are more permissive.

---

## Why the Other Options Are Wrong

### Piece A

```json
{ "permissions": { "defaultMode": "default" } }
```

❌ Incorrect

#### Reason

- `default` mode does **not auto-approve edits**.
- The question requires a trusted refactor where edits can proceed automatically.
- `default` mode prompts before nearly every change.

---

### Piece B

```json
{ "permissions": { "defaultMode": "bypassPermissions" } }
```

❌ Incorrect

#### Reason

- The module explicitly warns against bypass mode for normal development.
- It removes confirmation prompts and safety checks.
- It would allow the exact type of broad, unintended action described in the preceding example.
- The requirement is controlled automation, not unrestricted automation.

---

### Piece E

```json
{
  "permissions": {
    "allow": ["Bash(*)", "Edit(*)"]
  }
}
```

❌ Incorrect

#### Reason

- `Bash(*)` effectively grants access to ev*ry shell command.
- That includes *estructive commands such as:
  - `*m`
  - `find ... -delete`
  - clea*up scripts
  - deployment scripts
* The exercise explicitly says dest*uctive shell commands must never b* run.

---

# Part 2 Answer

✅ **B**

> A human reviews and approves *he change to the deployment config*ration file before the write execu*es, because a wrong value there is*hard to undo and reaches systems o*tside the file.

---

## Technical Reasoning

This question directly tests the lesson:

> Place the human gate according to the **worst-case cost** of being wrong.

A deployment configuration file is:

- Security-sensitive
- Operationally sensitive
- Consumed by production systems
- Potentially capable of causing outages

A bad change could:

- Break service discovery
- Break connectivity
- Misconfigure endpoints
- Cause downtime
- Affect multiple dependent services

The module explicitly states:

> Gate any action that is hard to undo or reaches a sensitive path.

A deployment configuration change satisfies both conditions.

Therefore the gate belongs **before execution**, not after.

---

### Why A is Wrong

> "Nowhere: the settings already auto-approve edits..."

❌ Wrong because:

Auto-approval is a default behavior, not a substitute for a human review gate on high-risk changes.

The lesson states that sensitive actions override the default workflow.

---

### Why C is Wrong

> "Add bypassPermissions..."

❌ Wrong because:

This removes safety controls exactly when risk is highest.

The previous case study demonstrated how bypass mode can allow unintended changes to reach production-related files.

---

### Why D is Wrong

> "Review only after the write..."

❌ Wrong because:

The damage may already be done.

The module teaches:

> For high-cost, difficult-to-reverse actions, review should occur **before execution**, not afterward.

---

# Final Answers

## Part 1

✅ **Piece C**

✅ **Piece D**

## Part 2

✅ **B. A human reviews and approves the deployment configuration change before the write executes.**