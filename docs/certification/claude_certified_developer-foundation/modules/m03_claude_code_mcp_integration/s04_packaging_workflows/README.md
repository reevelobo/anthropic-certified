# Packaging a workflow as a plugin: skills, custom commands, and marketplace install

Previously, we covered the mechanisms that give Claude Code durable context and enforce behavior:

- `CLAUDE.md` for always-on project memory
- Rules files for scoped guidance
- Hooks for deterministic guardrails
- Subagents for isolated task delegation

These mechanisms live in your `.claude` directory and are version-controlled with the project.

Now we turn to the next question:

> How can you package that setup so a teammate can install it simply in one step instead of repeating your manual configuration by hand?

## Skills are reusable workflows the agent loads on demand

A skill is a portable Markdown file (`SKILL.md`) placed in `.claude/skills`.

The front matter identifies the skill and describes when it applies, and the body holds the steps.

The same skill can:

- Run in Claude Code
- Be invoked through the Messages API
- Be loaded by the Agent SDK

What changes across the three isn't the file itself; it's:

- Where the skill runs
- How it gets loaded
- What it's allowed to touch

A developer who has only ever seen skills in Claude Code may assume things that don't hold true on the API, so this section outlines the differences.

## How the skill loads and runs in each environment

### Claude Code

**How the skill loads:**

Discovered from `.claude/skills` on the filesystem.

Loads on:

- A description match
- Explicit invocation by name

**Where the steps run:**

In your terminal session, against your local files, under:

- The active permission mode
- Existing deny rules

**What you need to know:**

It is filesystem-based and governed by the settings layer.

---

### Messages API

**How the skill loads:**

Sent along with the request and run inside the code execution container, not your application's environment.

Requires:

- Code execution beta header
- Skills beta header

**Where the steps run:**

Inside Anthropic's code execution container, not on your machine.

The skill's:

- Filesystem access
- Tool access

are whatever the container provides.

**What you need to know:**

A skill that assumes local files or local tools will not behave the same way here because it is not running where those files exist.

---

### Agent SDK

**How the skill loads:**

Loaded by the agent that the SDK runs.

Whether filesystem settings such as:

- `CLAUDE.md`
- Skills

are loaded is controlled by the `settingSources` (TypeScript) / `setting_sources` (Python) configuration.

Do not rely on defaults.

Always:

- Configure the setting explicitly
- Verify current behavior against SDK documentation

**Where the steps run:**

Inside the process the SDK runs in, which is your environment, once filesystem sources are enabled.

**What you need to know:**

A common surprise is that:

> A skill that worked perfectly in Claude Code appears to do nothing in Agent SDK because `settingSources` was never configured, so the skill never loaded.

---

### Claude Managed Agents

**How the skill loads:**

Defined once as part of an API resource that specifies:

- Model
- System prompt
- Tools
- MCP servers
- Skills

Anthropic loads the skill server-side when the managed agent runs.

There is no filesystem discovery step on your side.

**Where the steps run:**

Inside a sandbox provisioned and operated by Anthropic, not in your own environment.

Your application:

- Sends user events
- Receives streamed results

The skill has access only to what that managed sandbox provides.

**What you need to know:**

Currently:

- Public beta
- Requires the `managed-agents-2026-04-01` beta header

Sessions are stored server-side.

Because of that:

- Managed Agents are currently not eligible for Zero Data Retention (ZDR)
- Managed Agents are currently not eligible for HIPAA BAA coverage

Skills are attached when defining the agent resource, not at session time.

To change available skills:

1. Update the agent definition.
2. Redeploy or update the managed agent configuration.

Skills are not dynamically attached after the session starts.

---

# Three portability rules

1. Write the description as the matching criterion. The model loads a skill by comparing your request to its description, so a description that identifies when the skill applies works in every runtime, but a vague one fails to load in all of them.

2. Don’t assume a local filesystem or local tools exist inside the skill body. A skill that shells out to a local command works in Claude Code but breaks on the Messages API, where it runs in a container without a command. Keep the skill’s steps confined to what the runtime is guaranteed to provide, or document the dependency.

3. Remember that subagents don’t inherit skills. This was true in Module 2, and is still true here: a subagent starts clean, so a skill the parent relied on has to be listed for the subagent explicitly, in every runtime that supports subagents.

The practical takeaway is that you can author a skill once and reuse it, but you must specifically design for the ability to use it across terminals. A skill that’s scoped to a clear description and free of local-environment assumptions ports cleanly across runtimes, but one that assumes a specific local environment does not.

## Handles well

A task-specific procedure authored once and reused across:

- The interactive terminal
- An API integration
- A headless SDK job

## Adds complexity

Each runtime loads and sandboxes the skill differently, so you must account for:

- Beta headers on the API
- `settingSources` on the SDK

## Use a different approach

For instructions that must apply to every session in a project, `CLAUDE.md` is still the right tool.

Skills are for on-demand, portable procedures.

---

# Giving a workflow an explicit entry point

A custom command is a shortcut for a defined procedure.

In current Claude Code, **skills are the recommended format** for both explicit and automatic invocation:

- Invoke a skill directly with `/skill-name`
- Allow Claude to load it automatically when relevant

The older `.claude/commands/` directory format still works but is considered a legacy process.

Use skills with:

```yaml
disable-model-invocation: true
```

in the frontmatter when you want a workflow that only runs when you explicitly call it.

## Plugin command namespacing

Plugin commands are namespaced automatically.

The plugin's name becomes the prefix.

For example:

```text
Plugin: payments
Command: run-tests
```

Invocation:

```text
/payments:run-tests
```

This allows multiple plugins to provide the same command name without collisions.

Example:

```text
/payments:run-tests
/orders:run-tests
/platform:run-tests
```

Authors should treat the plugin name as part of the interface because renaming the plugin renames every command that plugin exposes.

---

# The packaging layer that makes a setup installable

A plugin bundles:

- Skills
- Hooks
- Subagents
- MCP servers

into a single installable unit.

Plugins can be packaged and distributed through a marketplace, which is a catalog of plugins created and shared by others.

## Marketplace installation

The official Anthropic marketplace is available automatically when Claude Code starts.

You can also add third-party marketplaces hosted in a GitHub repository:

```bash
/plugin marketplace add <owner/repo>
```

Teammates can then install the same setup with a simple install command.

The result is:

> A versioned, auditable installation instead of a page of manual setup steps.

## Plugin component placement

A plugin places components into their standard locations:

1. Skills go into a skills directory.
2. Hooks go into their hook locations.
3. Subagents go into their agent locations.
4. Settings go into their settings locations.

The plugin manifest describes the bundle, and the install command wires everything into the target environment.

Plugins can be installed:

- Individually
- Organization-wide

---

# Enterprise deployment

Enterprise administrators can deploy plugins throughout an organization using managed settings.

A managed marketplace allowlist controls which marketplace sources users are allowed to add.

The allowlist:

- Restricts marketplace sources
- Does not automatically register marketplaces

If administrators want all users to automatically receive a marketplace, they can combine:

```text
Marketplace allowlist
```

with:

```text
extraKnownMarketplaces
```

in managed settings.

## Configuration precedence

Managed settings sit above:

- User settings
- Project settings

Because of that hierarchy:

> A plugin deployed through managed settings takes priority and cannot be overridden by user or project configuration.

Refer to the product reference documentation for exact setting names.

---

# The packaging decision table

## Skill

### What it is

A Markdown file in:

```text
.claude/skills
```

that loads when its description matches the task or when invoked by name.

### Who it is for

An individual developer or team using Claude Code interactively.

### When to reach for it

Use a skill when a task-specific procedure should stay out of context until needed.

Examples:

- PR review workflows
- Deployment checklists
- Incident triage procedures
- Release validation steps

The skill loads only when the work requires it.

---

## Custom Command

### What it is

A named shortcut that runs a defined procedure when explicitly invoked.

### Who it is for

Developers who want a predictable, explicit entry point for frequently used procedures.

### When to reach for it

Use a custom command when:

- The procedure has a clear name.
- You want deterministic invocation.
- You don't want to rely on description matching.

Examples:

```text
/payments:run-tests
/payments:deploy-staging
/orders:review-pr
```

---

## Plugin

### What it is

A versioned bundle of:

- Skills
- Hooks
- Subagents
- MCP servers

distributed through a marketplace.

### Who it is for

Teams that want:

- One-step installation
- Shared configuration
- Versioned workflows
- Consistent environments

### When to reach for it

Use a plugin when a working setup currently exists on one machine and must be:

- Shared
- Versioned
- Audited
- Kept consistent across a team

---

# Cost · Complexity · Risk

## Cost

Skills add context cost only when activated.

Plugins introduce installation and maintenance overhead.

The real decision is whether to:

- Pay setup cost once through a plugin install
- Pay setup cost repeatedly through manual configuration

---

## Complexity

A plugin that hard-codes absolute paths may install correctly for the author but fail everywhere else.

Common failure sources include:

- Absolute filesystem paths
- Machine-specific tool locations
- Environment assumptions
- Local-only dependencies

Any environment assumption embedded in:

- Skills
- Hooks
- Commands

is likely to break portability.

---

## Risk

A plugin only delivers the components it explicitly bundles.

A common mistake is assuming security controls automatically travel with the workflow.

Example:

```text
Skill references a guardrail
↓
Guardrail implemented via hook
↓
Hook omitted from plugin bundle
↓
Teammate installs plugin
↓
Guardrail never gets installed
```

The workflow appears to work, but the protection is gone.

Therefore:

> If a skill or workflow depends on a deny rule, hook, or other guardrail, that guardrail must be explicitly included in the plugin bundle.

Otherwise the behavior transfers, but the safety controls do not.

---

# Image Table 1 (Converted to Markdown)

| Handles well | Adds complexity | Use a different approach |
|-------------|----------------|-------------------------|
| A task-specific procedure authored once and reused across the interactive terminal, an API integration, and a headless SDK job. | Each runtime loads and sandboxes the skill differently, so you must account for beta headers on the API and `settingSources` on the SDK. | For instructions that must apply to every session in a project, `CLAUDE.md` is still the right tool. Skills are for on-demand, portable procedures. |

---

# Image Table 2 (Converted to Markdown)

| Layer | What it is | Who it is for | When to reach for it |
|---------|------------|----------------|---------------------|
| **Skill** | A Markdown file in `.claude/skills` that loads when its description matches the task or when invoked by name. | An individual developer or team using Claude Code interactively. | Reach for a skill when a task-specific procedure should stay out of context until it is needed, such as a PR review or deployment checklist that only loads when the work calls for it. |
| **Custom command** | A named shortcut that runs a defined procedure when you invoke it explicitly. | Developers who want a predictable, explicit entry point for high-frequency procedures. | Reach for a custom command when the procedure has a clear name and you want to trigger it directly rather than relying on the description to match the task. |
| **Plugin** | A versioned bundle of skills, hooks, subagents, and MCP servers distributed through a marketplace. | A team that wants one-step installation of a shared, versioned setup. | Reach for a plugin when a working setup currently lives on one machine and needs to be shared, versioned, and kept consistent across a team. |


---
# Checkpoint 3: place the skill in the right runtime

*Try it now. Three teams want to reuse the same review-checklist skill in different places.*

For each, match what must be configured for the skill to load and run. Note: the source presents four runtime situations. All four are included here so the match stays complete.

---

## Scenario 1

**A developer wants the skill to load when they ask for a review in the Claude Code terminal.**

### Options

1. Enable filesystem sources by setting `settingSources` explicitly so the agent loads skills from the project. Do not rely on a default, and confirm current default behavior against the Agent SDK reference at build time.

2. Place `SKILL.md` in `.claude/skills` with a description that matches review requests.

3. Define the agent as an API resource that lists the skill and set the `managed-agents-2026-04-01` beta header on the calls. Write the skill so its steps do not depend on local files, because it will run in Anthropic’s sandbox.

4. Send the code-execution and skills beta headers and write the skill so its steps do not depend on local files or local tools.

---

## Scenario 2

**A service calls the Messages API and wants the skill to run as part of the request.**

### Options

1. Enable filesystem sources by setting `settingSources` explicitly so the agent loads skills from the project. Do not rely on a default, and confirm current default behavior against the Agent SDK reference at build time.

2. Place `SKILL.md` in `.claude/skills` with a description that matches review requests.

3. Define the agent as an API resource that lists the skill and set the `managed-agents-2026-04-01` beta header on the calls. Write the skill so its steps do not depend on local files, because it will run in Anthropic’s sandbox.

4. Send the code-execution and skills beta headers and write the skill so its steps do not depend on local files or local tools.

---

## Scenario 3

**A scheduled headless job uses Agent SDK and expects the skill from the repo to load.**

### Options

1. Enable filesystem sources by setting `settingSources` explicitly so the agent loads skills from the project. Do not rely on a default, and confirm current default behavior against the Agent SDK reference at build time.

2. Place `SKILL.md` in `.claude/skills` with a description that matches review requests.

3. Define the agent as an API resource that lists the skill and set the `managed-agents-2026-04-01` beta header on the calls. Write the skill so its steps do not depend on local files, because it will run in Anthropic’s sandbox.

4. Send the code-execution and skills beta headers and write the skill so its steps do not depend on local files or local tools.

---

## Scenario 4

**A product team wants the same review-checklist skill to run inside a long-running agent that Anthropic hosts, reachable by an agent ID across sessions.**

### Options

1. Enable filesystem sources by setting `settingSources` explicitly so the agent loads skills from the project. Do not rely on a default, and confirm current default behavior against the Agent SDK reference at build time.

2. Place `SKILL.md` in `.claude/skills` with a description that matches review requests.

3. Define the agent as an API resource that lists the skill and set the `managed-agents-2026-04-01` beta header on the calls. Write the skill so its steps do not depend on local files, because it will run in Anthropic’s sandbox.

4. Send the code-execution and skills beta headers and write the skill so its steps do not depend on local files or local tools.

---

# Correct Answers

## Scenario 1 → Claude Code

✅ **Place `SKILL.md` in `.claude/skills` with a description that matches review requests.**

### Technical Reasoning

From the module:

> Claude Code discovers skills from `.claude/skills` on the filesystem.

Skills are loaded when:

- The description matches the current task.
- The skill is explicitly invoked by name.

The skill runs:

- In the local terminal session.
- Against local files.
- Under existing permission modes and deny rules.

Therefore Claude Code only requires:

```text
.claude/skills/SKILL.md
```

with a well-written description that matches review requests.

---

## Scenario 2 → Messages API

✅ **Send the code-execution and skills beta headers and write the skill so its steps do not depend on local files or local tools.**

### Technical Reasoning

The module explicitly states:

> Messages API skills run inside Anthropic’s code execution container.

Therefore:

- The skill is not running on the caller's machine.
- Local files are unavailable.
- Local command-line tools may not exist.

The Messages API additionally requires:

- Code execution beta header
- Skills beta header

A skill that assumes:

```bash
git
npm
local scripts
```

may fail because those resources are not guaranteed inside the container.

---

## Scenario 3 → Agent SDK

✅ **Enable filesystem sources by setting `settingSources` explicitly so the agent loads skills from the project. Do not rely on a default and confirm behavior at build time.**

### Technical Reasoning

The module identifies the most common Agent SDK failure:

> The skill worked in Claude Code but never loaded in Agent SDK.

Why?

Because Agent SDK only loads filesystem configuration when:

```text
settingSources
```

(TypeScript)

or

```text
setting_sources
```

(Python)

is configured appropriately.

Without that configuration:

- `.claude/skills`
- `CLAUDE.md`

may never be loaded.

The skill is present but invisible to the agent.

---

## Scenario 4 → Claude Managed Agents

✅ **Define the agent as an API resource that lists the skill and set the `managed-agents-2026-04-01` beta header on the calls. Write the skill so its steps do not depend on local files because it will run in Anthropic’s sandbox.**

### Technical Reasoning

The module states:

> Managed Agents load skills server-side.

Skills are attached to the Agent Definition:

```text
Model
System Prompt
Tools
MCP Servers
Skills
```

and are not discovered from `.claude/skills`.

Managed Agents:

- Run inside Anthropic-managed infrastructure.
- Store sessions server-side.
- Operate in a sandbox.
- Require the beta header:

```text
managed-agents-2026-04-01
```

Therefore local filesystem assumptions are invalid here as well.

---

# Runtime Mapping Summary

| Scenario | Runtime | Correct Match |
|----------|----------|---------------|
| Developer using Claude Code terminal | Claude Code | Place `SKILL.md` in `.claude/skills` with a matching description |
| Service using Messages API | Messages API | Send code-execution and skills beta headers; avoid local filesystem assumptions |
| Scheduled job using Agent SDK | Agent SDK | Configure `settingSources` / `setting_sources` explicitly |
| Long-running Anthropic-hosted agent | Claude Managed Agents | Define agent resource with skill and use `managed-agents-2026-04-01` beta header |

---

# Key Concept Being Tested

This checkpoint tests whether you understand that:

> The same skill file can be reused across runtimes, but each runtime has a different loading mechanism.

### Claude Code

```text
Filesystem discovery
```

### Messages API

```text
Request + beta headers
```

### Agent SDK

```text
Filesystem loading controlled via settingSources
```

### Managed Agents

```text
Agent definition resource
```

The skill itself may be identical, but how it is discovered and executed changes depending on the runtime.

---

# Final Answers

### Scenario 1

✅ Place `SKILL.md` in `.claude/skills` with a description that matches review requests.

### Scenario 2

✅ Send the code-execution and skills beta headers and write the skill so its steps do not depend on local files or local tools.

### Scenario 3

✅ Enable filesystem sources by setting `settingSources` explicitly so the agent loads skills from the project.

### Scenario 4

✅ Define the agent as an API resource that lists the skill and set the `managed-agents-2026-04-01` beta header on the calls.

# The Plugin That Installed on Your Machine and Failed on Everyone Else's

## Setup

A plugin installed cleanly tells you the package was assembled correctly; however, it does not tell you the plugin will run effectively, because installation and execution are different things.

The install copies files into place. Execution resolves the paths and variables those files point at, against the machine where they are running. When a plugin author bakes their own machine's layout into a skill, the install still succeeds everywhere, but the execution fails everywhere except the author's own setup. This gap occurs because it's something the author can't see.

<br>

## What happened

A developer built a deployment workflow skill, packaged it as a plugin, and tested it locally. Local testing passed, the plugin went out to the team through the internal marketplace, and every teammate’s install succeeded, but the moment any teammate ran the skill, it failed.

The root cause sat in the skill’s SKILL.md, in a command that pointed at `/Users/alexmorgan/projects/deploy-utils/validate.sh`.

That directory existed on the author’s machine and nowhere else. The skill carried an absolute path to the author’s home directory, so every teammate’s run looked for a file that was on their system or included in the skill.

A second skill in the same plugin leaned on an environment variable, `DEPLOY_TOKEN`, that the author had set in their own shell profile, and the plugin’s README never mentioned it. Three teammates spent two hours debugging before they traced the second failure to the missing variable.

The plugin incorrectly treated the author’s machine as the team’s machine, which caused the break. Both failures in the example above have the same root cause and the same absolute path. It sits in the SKILL.md as plain text, and a reviewer reading the file can catch it. The environment variable can be dangerous because nothing in the package announces the associated dependency, meaning the skill runs fine right up until the step that needs the variable, and only then does it fail. This is why it can cost three people two hours to fix.

## What to Watch Out for

Any path reference in a skill, hook command, or plugin component must be relative to the project root or use an environment variable for the base path. Use `$CLAUDE_PROJECT_DIR` to reference scripts stored in the project, and `${CLAUDE_PLUGIN_ROOT}` for scripts bundled inside the plugin itself, so the path resolves correctly no matter whose machine runs it or what directory the session started in.

Make sure any scripts, config files, or other assets the plugin depends on are either bundled inside the plugin or included in a shared project location, so every teammate can access the same files after install.

Document every environment variable the plugin requires and validate it at install time so a missing one surfaces immediately instead of mid-run.

Then test the install on a clean machine before distribution; this will catch any issues that the build machine may be hiding.

# Checkpoint 4: fix the broken plugin definition

*Try it now. The following SKILL.md works on the author's machine but will fail when a teammate clones the project and installs the plugin.*

Select the single defect, then select the correct fix.

```yaml
---
name: deploy-validate
description: Validates a deployment configuration before release.
---

## Steps

1. Run the validation script: /Users/alexmorgan/projects/deploy-utils/validate.sh
2. If the script exits with a non-zero code, report the error to the developer.
3. If validation passes, confirm the deployment configuration is safe to proceed.
```

## Part 1 · Which is the defect?

A. The skill name does not match the plugin name.

B. The description is too short for the model to match.

C. The absolute path `/Users/alexmorgan/projects/deploy-utils/validate.sh` in step 1.

D. Step 2 should report to the user, not the developer.

### Correct Answer

✅ **C. The absolute path `/Users/alexmorgan/projects/deploy-utils/validate.sh` in step 1.**

#### Technical Reasoning

The path is hardcoded to the author's local machine:

```text
/Users/alexmorgan/projects/deploy-utils/validate.sh
```

This path only exists on the author's system. While the plugin can install successfully on other machines, execution fails because the referenced script cannot be found.

Installation and execution are separate processes:

- Installation copies plugin files into place.
- Execution resolves paths and dependencies on the target machine.

Because the skill references a machine-specific absolute path, it is not portable and breaks when another user runs it.

#### Why the Other Options Are Incorrect

**A. The skill name does not match the plugin name**

There is no requirement that a skill name must match the plugin name.

**B. The description is too short for the model to match**

Description length does not affect whether the script can be located and executed.

**D. Step 2 should report to the user, not the developer**

This may be a workflow preference, but it is not the cause of the plugin failure.

---

## Part 2 · Which is the correct fix?

A. Reference the script from the project root using `CLAUDE_PROJECT_DIR`, so it resolves no matter where the project is cloned.

B. Replace the path with another absolute path that points to a shared network drive.

C. Replace the path with a home-directory shortcut: `~/projects/deploy-utils/validate.sh`.

D. Remove step 1 so the skill no longer calls an external script.

### Correct Answer

✅ **A. Reference the script from the project root using `CLAUDE_PROJECT_DIR`, so it resolves no matter where the project is cloned.**

#### Technical Reasoning

The correct approach is to use a project-relative reference:

```bash
${CLAUDE_PROJECT_DIR}/scripts/validate.sh
```

or

```bash
$CLAUDE_PROJECT_DIR/scripts/validate.sh
```

This ensures:

- The script location is resolved dynamically.
- The plugin works regardless of where the repository is cloned.
- No dependency exists on a specific user's home directory structure.
- All teammates can run the skill successfully.

For example:

Developer A:

```text
/Users/alex/projects/myapp
```

Developer B:

```text
/home/sam/work/myapp
```

Both users can resolve:

```bash
${CLAUDE_PROJECT_DIR}/scripts/validate.sh
```

correctly because the variable points to the root of the current project.

#### Why the Other Options Are Incorrect

**B. Replace the path with another absolute path**

```text
/shared/tools/validate.sh
```

This is still an absolute path and still creates a dependency on a specific environment.

**C. Replace the path with a home-directory shortcut**

```bash
~/projects/deploy-utils/validate.sh
```

This remains user-specific and assumes all users have identical directory structures.

**D. Remove step 1**

Removing the validation step eliminates required functionality instead of fixing the root cause.

---

## Corrected SKILL.md

```yaml
---
name: deploy-validate
description: Validates a deployment configuration before release.
---

## Steps

1. Run the validation script: ${CLAUDE_PROJECT_DIR}/scripts/validate.sh
2. If the script exits with a non-zero code, report the error to the developer.
3. If validation passes, confirm the deployment configuration is safe to proceed.
```

## Key Takeaway

The defect is a **hardcoded absolute filesystem path**. Absolute paths make plugins dependent on the author's machine and break portability.

The correct fix is to use **`${CLAUDE_PROJECT_DIR}`** (or another supported project-relative/plugin-relative variable) so the skill resolves resources dynamically and works on every teammate's machine.