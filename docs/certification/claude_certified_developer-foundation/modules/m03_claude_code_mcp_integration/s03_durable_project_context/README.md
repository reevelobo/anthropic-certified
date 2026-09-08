# Durable project context with CLAUDE.md, rules files, hooks, and subagents

Previously we saw how Claude Code gates actions through permission modes and settings files. That configuration layer controls what the agent is allowed to do.

This cluster builds on top of it: now you’ll learn how to configure what the agent knows and how it behaves, so the rules and project context you define in a session are still in effect at the start of the next one.

## CLAUDE.md: the project file that loads into every session

Every time Claude Code starts in a project directory, it looks for a file named **CLAUDE.md** at the root and reads it.

The contents are appended to your prompt before any message from you arrives.

This means every convention, constraint, and command you put in `CLAUDE.md` is present from the first prompt of every session, without you having to re-state it.

The `/init` command scans your codebase and generates a starter `CLAUDE.md`.

The generated file is a great baseline but should be validated before using. Refine it to hold the rules that control the outcome of your prompts:

- Your testing commands
- Your framework conventions
- The paths the agent should not touch
- The style decisions that differ from defaults

### The primary failure mode: size

Size is the main failure mode.

A `CLAUDE.md` that keeps growing with every new instruction can dilute the rules that matter most.

A larger file consumes more of the context window, which makes any single instruction a smaller fraction of what loads, and that reduces the chance that the agent follows the one rule that catches a real mistake.

Hold `CLAUDE.md` to the constraints that change behavior and move everything else into Skills that load on demand.

---

## Rules instruction files: scoping guidance to where it applies

In the previous section, we established that `CLAUDE.md` loads into every session and should hold the instructions that apply across the whole project.

The next question is what to do with guidance that matters only in one part of the codebase.

That is where rules instruction files come in: they let you apply instructions only where they are relevant, instead of loading them into every session.

`CLAUDE.md` is always on, and rules files add a narrower layer on top of that baseline.

They live in the project's `.claude/rules/` directory and can be scoped to specific paths using a `paths` glob in their YAML frontmatter.

A rule scoped this way loads into context only when Claude Code works with files matching the pattern.

This allows a rule to be applied to one part of the codebase without cluttering the rest of the context.

### Important note about scoping

The scoping comes from the frontmatter, **not** from file placement.

Rules files can be organized into subdirectories of `.claude/rules/`, for example:

```text
.claude/rules/database/
```

However, that structure is organizational only.

A rules file without a `paths` field loads unconditionally at launch, with the same priority as `CLAUDE.md`, no matter where it sits inside `.claude/rules/`.

### Practical guidance

Put broad project memory and universal constraints in `CLAUDE.md`.

Put narrow, path-specific guidance in rules files scoped with `paths`.

A constraint such as:

> Never modify the database schema.

belongs in `CLAUDE.md` because it applies everywhere.

A constraint such as:

> All SQL in the database module must include an explicit transaction boundary.

belongs in `.claude/rules/database.md` with frontmatter such as:

```yaml
---
paths:
  - "src/db/**/*.sql"
---
```

This ensures it enters context only when Claude is working with those files.

---

## Hooks: running your own scripts at fixed points in the lifecycle

A Hook allows you to intercept and control tool calls before or after they execute.

When you write a specific rule in `CLAUDE.md` telling the agent to run Prettier after every file edited, the agent will follow it most of the time.

Alternatively, a hook makes it happen every single time without exceptions because the hook fires independently of what the model decides to do.

Hooks are defined in settings files and configured using the `/hooks` command.

Each hook is bound to:

- A lifecycle event
- An optional matcher that scopes it to specific tool types
- A command that runs when the event fires

### Core lifecycle events

#### 1. PreToolUse

Runs before a tool call executes.

Because it runs first, a `PreToolUse` hook can examine the tool call and exit with code `2` to block it, writing the reason to stderr as feedback the agent sees.

This is how you enforce access controls at the configuration layer rather than hoping the agent respects a `CLAUDE.md` instruction.

#### 2. PostToolUse

Runs after a tool call completes.

Since the call has already happened, this event cannot block it.

This makes it the right place for automated side effects such as:

- Running a formatter after edits
- Triggering tests after file changes
- Logging operations for audit trails

#### 3. UserPromptSubmit

Runs when you submit a prompt, before the model processes it.

Use it when you need to:

- Inject context
- Validate requests
- Perform checks before work begins

#### 4. Stop

Runs when the model finishes responding.

Use it for actions that belong at the end of a turn, such as:

- Notifications
- Cleanup tasks
- Committing audit logs

#### 5. Notification

Runs when Claude Code sends a notification.

This occurs when:

- Claude needs permission to use a tool
- Claude Code has been idle for 60 seconds

Use it to route signals to:

- External channels
- Logging systems
- Monitoring tools

#### 6. SessionStart

Runs when a session starts or resumes.

Use it to:

- Initialize state
- Validate environment variables
- Confirm required services are reachable

before work begins.

#### 7. SessionEnd

Runs when a session ends.

Use it for:

- Teardown tasks
- Final audit writes
- Session-closure notifications

### Guardrails vs conventions

A hook that blocks edits to a production configuration path using a `PreToolUse` event enforces that constraint at every tool call during every session, regardless of permission mode.

That is the difference between a **guardrail** and a **convention**.

---

## Subagents: delegating work to an isolated context

A subagent is a specialized assistant that Claude Code can delegate tasks to.

Each assistant runs a task in its own separate context and returns only its output.

It does **not** inherit:

- Your main conversation history
- Files accumulated in context
- Current session state

When you send a task to a subagent:

1. It starts from a clean slate.
2. It performs the work.
3. It returns the result.

### Built-in subagents and project rules

Built-in subagents differ in what they load at startup.

Always check the current Claude Code documentation because the available subagents may change.

The important distinction is how project rules are loaded.

#### Explore and Plan subagents

The built-in **Explore** and **Plan** subagents:

- Skip `CLAUDE.md`
- Skip git status

This keeps research and planning fast and inexpensive.

Because of this optimization:

- Project-level rules in `CLAUDE.md` are not loaded.
- Repository state is not loaded.

If a delegated task appears to ignore a `CLAUDE.md` rule, this may be the reason.

#### General-purpose subagent

The general-purpose subagent loads:

- `CLAUDE.md`
- Git status

For tasks where project constraints must be respected, use:

- The general-purpose subagent
- A custom subagent explicitly configured with required rules

### Custom subagents and skills

Custom subagents do not automatically see your skills.

If you define a custom subagent in:

```text
.claude/agents/
```

and the subagent needs a specific skill, you must explicitly list that skill in the agent's frontmatter.

Built-in agents do not have preloaded skills.

If a built-in agent requires skill-backed behavior, create a custom subagent with those skills listed in its configuration.

---

# Mechanism comparison map

Use this guide to determine where a piece of project knowledge should live.

Each mechanism makes a different tradeoff between context cost and reliability.

---

## CLAUDE.md

**What it loads:**

- Full file contents prepended to context at session start

**When it runs:**

- Every session
- Unconditionally

**Context cost:**

- Persistent per session
- Dilutes as the file grows

**Belongs here:**

- Universal project constraints
- Standard commands
- Framework decisions
- Global conventions

---

## Rules File

### What it loads

File contents.

Scoped through a `paths` glob in YAML frontmatter.

Without `paths`, it loads like `CLAUDE.md`.

### When it runs

- When Claude reads a file matching the rule's path patterns
- Unscoped rules load at session start

### Context cost

- Path-scoped: added only when triggered
- Unscoped: same persistent cost as `CLAUDE.md`

### Belongs here

- Path-specific guidance
- Specialized module rules
- Instructions that would be noise elsewhere

---

## Hook

### What it loads

Runs your script at a lifecycle event.

No content is added to context.

### When it runs

At configured events such as:

- `PreToolUse`
- `PostToolUse`
- `SessionStart`
- `SessionEnd`

### Context cost

Minimal.

Only script output returned to Claude contributes to context.

### Belongs here

- Enforced guardrails
- Automated side effects
- Audit logging
- Validation

---

## Subagent

### What it loads

Task context only.

Runs independently from the main session.

### When it runs

When dispatched by the main agent to perform a delegated task.

### Context cost

Returns a summary rather than the complete task history.

### Belongs here

- Exploration
- Investigation
- Research
- Parallelizable work
- Tasks that would otherwise bloat the main context

---

## Handles well

Projects you'll return to across many sessions, where:

- A stable set of rules exists
- Different areas need different guidance
- Unconditional guardrails justify setup effort

---

## Use a different approach

One-off tasks you won't revisit.

For a quick exploration of an unfamiliar codebase, the setup overhead usually isn't worth it.

# The CLAUDE.md that kept growing until the rules stopped landing

## Setup

Your `CLAUDE.md` kept growing because every new rule felt worth adding.

Each addition was individually reasonable, and the file seemed to be the right place for each rule.

But over a few weeks, the file grew to over 800 lines.

## The trace

The following is a session log excerpt from a project with a `CLAUDE.md` that accumulated over two months of team additions.

```text
Session context window loaded:
  CLAUDE.md: 847 lines
  Contents include:
    framework preferences (lines 1–40),
    testing conventions (lines 41–90),
    style guide (lines 91–210),
    dependency rules (lines 211–320),
    path restrictions (lines 321–360),
    historical decisions log (lines 361–700),
    archived notes (lines 701–847)

User prompt:
  "Refactor the auth module to use the new token service.
   Do not modify the /legacy/tokens/ directory."

Claude Code action:
  [Reading auth module ...]

Claude Code action:
  [Editing auth/service.ts ...]

Claude Code action:
  [Reading /legacy/tokens/store.ts for reference ...]

Claude Code action:
  [Editing /legacy/tokens/store.ts to update token interface ...]

Path restriction from CLAUDE.md (line 347):
  "Do not modify files in /legacy/tokens/."

User:
  "You just edited /legacy/tokens/store.ts.
   I said not to touch that directory."

Claude Code:
  "I apologize. The /legacy/tokens/ restriction is in the
   project instructions. The edit was made in the course
   of updating the token interface. I did not flag the
   conflict before proceeding."
```

The rule was in the file; the agent had access to it.

However, the failure was **dilution**: 846 other lines reduced the effective weight of the one instruction that mattered.

The historical decisions log and archived notes should have been stored somewhere, but they did not belong in `CLAUDE.md`.

## What to Watch Out for

`CLAUDE.md` is a working set of rules that change behavior for the current session, not a growing append-only log.

Every line you add reduces the weight of every other line.

If a rule is path-specific, it belongs in a rules file.

If a rule is historical context, it belongs in a separate reference document the agent reads on demand.

When your `CLAUDE.md` grows past a few hundred lines, audit it:

- Identify which rules are truly session-critical.
- Move path-specific rules into scoped rules files.
- Move historical context into reference documents.
- Move repeatable enforcement into hooks where possible.

The one rule you cannot afford to dilute should be the shortest path to a hook.

---

# Technical Analysis

## Why the failure happened

The problem was **not** that the rule was missing.

The problem was that the rule competed for attention inside an extremely large context payload.

The session loaded:

```text
847 lines of CLAUDE.md
```

Only a small portion of those lines contained active behavioral constraints.

A large amount of context was occupied by:

- Historical decisions
- Archived notes
- Long-form documentation
- Legacy guidance

As context grows, critical instructions become a smaller percentage of the total loaded information.

The module refers to this as **instruction dilution**.

## What should have been stored elsewhere

### Keep in CLAUDE.md

Examples:

```text
Never modify production configuration files.
Run npm test before proposing completion.
Use React Query for external API calls.
Follow the project's TypeScript conventions.
```

These are:

- Global
- Session-relevant
- Behavioral

### Move to rules files

The restriction:

```text
Do not modify files in /legacy/tokens/
```

is path-specific.

A better solution would be:

```yaml
---
paths:
  - "legacy/tokens/**"
---
Files under legacy/tokens a** read-only.
Do not modify them.
`**

This loads only when work touch** that directory.

### Move to ref**ence documents

Examples:

```tex**Why the 2024 authentication migration happened.
Lessons learned from the token redesign.
Meeting notes from architecture discussions.
```

These are historical records, not behavioral constraints.

They should be stored in:

```text
docs/
adr/
architecture/
reference/
```

and loaded only when needed.

## The strongest solution: enforce with a hook

The module ends with an important statement:

> The one rule you cannot afford to dilute should be the shortest path to a hook.

Instead of relying on model instruction-following:

```text
Do not modify legacy/tokens
```

enforce it through a `PreToolUse` hook.

Example logic:

```text
If Edit target matches legacy/tokens/**
    Block the tool call
```

Benefits:

- Works every session
- Independent of model behavior
- Independent of context size
- Independent of instruction dilution
- Independent of permission mode

This converts a convention into a guardrail.

## Correct architecture for this example

### CLAUDE.md

```text
Project-wide constraints
Coding conventions
Required test commands
Framework decisions
```

### Rules file

```yaml
---
paths:
  - "legacy/tokens/**"
---
Files in this directory are read-only.
```

### Hook

```text
PreToolUse:
  Block writes to legacy/tokens/**
```

### Reference document

```text
Historical token migration discussions
Archived design decisions
Old implementation notes
```

Stored outside `CLAUDE.md`.

## Key lesson

The failure was not that Claude lacked the instruction.

The failure was that a critical rule was buried inside hundreds of lines of unrelated context.

As a `CLAUDE.md` grows:

1. Important rules become diluted.
2. Context consumption increases.
3. Instruction reliability decreases.
4. Path-specific constraints become harder to enforce.

Use:

- **CLAUDE.md** for project-wide behavior.
- **Rules files** for path-specific guidance.
- **Reference documents** for historical context.
- **Hooks** for rules that must never be violated.

The more expensive the mistake, the less you should rely on a long instruction file and the more you should enforce the constraint through scoped rules or hooks.

# Checkpoint 2: drag the correct value

*Try it now. You are setting up a hook that enforces a path restriction, and the configuration below has two blanks.*

Select the correct one: the lifecycle event that runs before a tool call executes, and the command the hook runs to block reads of `.env.production`.

```json
{
  "hooks": {
    "__________": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "__________"
          }
        ]
      }
    ]
  }
}
```

## Blank 1: the lifecycle event

- PreToolUse
- PostToolUse
- UserPromptSubmit
- SessionStart

## Blank 2: the command

- A script that reads the tool call from stdin, checks the file path, and exits with code 2 when the path is `env.production` (writing the reason to stderr).
- A script that logs the tool call to an audit file and exits 0.
- A script that prints a warning and exits 0 unconditionally.

---

# Correct Answers

## Blank 1

✅ **PreToolUse**

## Blank 2

✅ **A script that reads the tool call from stdin, checks the file path, and exits with code 2 when the path is `.env.production` (writing the reason to stderr).**

---

# Complete Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read",
        "hooks": [
          {
            "type": "command",
            "command": "path-check-script"
          }
        ]
      }
    ]
  }
}
```

Where the hook script:

1. Receives the tool call metadata.
2. Checks the requested file path.
3. Detects attempts to read `.env.production`.
4. Writes an explanation to stderr.
5. Exits with status code `2` to block the tool call.

---

# Technical Reasoning

## Why Blank 1 = `PreToolUse`

The lesson states:

> **PreToolUse runs before a tool call executes.**

A path restriction must be enforced **before** the read occurs.

If the goal is:

```text
Never allow reads of .env.production
```

the enforcement mechanism must execute before Claude accesses the file.

`PreToolUse` is specifically designed for:

- Inspecting tool calls
- Validating requested actions
- Blocking operations
- Enforcing guardrails

Most importantly:

> A PreToolUse hook can examine the tool call and exit with code 2 to block it.

Therefore `PreToolUse` is the only lifecycle event that can stop the read before it happens.

---

## Why the Script with Exit Code 2 is Correct

The lesson explicitly explains that:

> A PreToolUse hook can exit with code 2 to block the tool call, writing the reason to stderr.

A correct enforcement script therefore:

```text
Read tool request
↓
Check requested path
↓
Is path .env.production?
    Yes → stderr + exit 2
    No  → allow tool call
```

This creates an actual guardrail.

Example logic:

```bash
if target == ".env.production"
then
    echo "Reading .env.production is prohibited" >&2
    exit 2
fi
```

The agent receives the reason and the operation is prevented.

---

# Why the Other Lifecycle Events Are Wrong

## PostToolUse

❌ Incorrect

`PostToolUse` runs **after** the tool call has already completed.

Sequence:

```text
Read file
↓
Sensitive data exposed
↓
PostToolUse executes
```

At that point the restriction has failed.

The file has already been read.

---

## UserPromptSubmit

❌ Incorrect

`UserPromptSubmit` runs when the prompt is submitted.

It can:

- Add context
- Validate prompts

It cannot reliably evaluate individual future tool calls because the tool request has not yet been generated.

---

## SessionStart

❌ Incorrect

`SessionStart` runs once when the session begins.

It can:

- Validate environment
- Initialize state

It cannot intercept individual file-read operations throughout the session.

---

# Why the Other Commands Are Wrong

## "A script that logs the tool call to an audit file and exits 0"

❌ Incorrect

`exit 0` means:

```text
Success
Continue execution
```

The read still occurs.

Logging is useful for auditing but does not enforce a restriction.

---

## "A script that prints a warning and exits 0 unconditionally"

❌ Incorrect

Again:

```text
exit 0 = allow operation
```

The sensitive file would still be read.

A warning is only a convention.

The module emphasizes the difference between:

- Convention
- Guardrail

A guardrail must actually stop the operation.

---

# Security Principle Being Tested

This checkpoint tests the distinction between:

## Convention

```text
CLAUDE.md:
"Do not read .env.production"
```

The model is expected to comply.

However:

- Context can be diluted.
- Instructions can be overlooked.
- The model can make mistakes.

---

## Guardrail

```text
PreToolUse Hook
```

The system itself enforces the restriction.

Advantages:

- Runs every session.
- Independent of context size.
- Independent of model reasoning.
- Independent of permission mode.
- Deterministically blocks access.

This is why the lesson says:

> A hook that blocks edits or reads at PreToolUse enforces the constraint at every tool call during every session, regardless of permission mode.

---

# Final Answers

## Blank 1

✅ `PreToolUse`

## Blank 2

✅ **A script that reads the tool call from stdin, checks the file path, and exits with code 2 when the path is `.env.production` (writing the reason to stderr).**