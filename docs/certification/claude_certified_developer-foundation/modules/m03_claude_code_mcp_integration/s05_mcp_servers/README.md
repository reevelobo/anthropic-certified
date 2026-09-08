# Building and configuring an MCP server: transport, scope, and the GitHub server

Prior sections introduced plugins as the packaging layer that bundles skills, hooks, subagents, and MCP servers into a single installable unit.

This section further explains what MCP server bundles are and how to build them. An MCP server is the layer that exposes tools to Claude from outside your codebase. When building an MCP server, one of the first decisions is determining the appropriate transport mechanism and defining the server’s scope.

## What is an MCP server and why is it different from wiring a tool directly?

When wiring a tool directly into an application, you are responsible for defining the tool’s schema and its functionality. Both live in that application’s code. If three different applications need access to the same external service, each one maintains its own integration.

Model Context Protocol, or MCP, separates tool definitions from individual applications and turns them into a process called a server.

An MCP server is a process that exposes tools, resources, and prompts that MCP clients can use. Claude Code has a built-in MCP client. When you connect to an MCP server, Claude Code discovers the tools it provides and can invoke them during a session.

With an MCP server, you build the capability once, and every MCP client that connects to it gets access without re-implementing the integration.

## MCP servers also expose resources and prompts

An MCP server exposes tools, resources, and prompts. We’ve already learned about tools: actions the model can call. The other two cover cases where a tool call won’t give you what you need.

A **resource** is read-only data the server exposes for the client to fetch and place into context directly, rather than the model calling a tool to get it. The client requests a resource by its address, and the server returns the data.

Resources come in two forms:

- A direct resource has a fixed address for data that takes no parameters, such as a list of available documents.
- A templated resource puts a parameter in the address, such as a document address that takes a document identifier.

Reach for a resource when you want known data to be in context from the start of a turn. You want this when pulling a resource in directly is cheaper and more predictable than using a tool call to go get it.

Resource support varies across MCP clients; verify that your client has a mechanism to inject resources into context before relying on this pattern.

A **prompt** is a pre-written instruction template the server exposes so a client can invoke a vetted prompt by name instead of asking each user to write their own.

A user can already ask the model to do most tasks in their own words, so a prompt is useful when specific wording is needed:

- A task where a carefully built instruction produces materially better results than whatever a user would type.
- A scenario where you want every client to get the same quality.

Packaging the instruction on the server means the prompt is maintained in one place and reused everywhere the server is connected.

## Transport: how Claude Code talks to the server

Transport is the communication channel between the MCP client and the MCP server. The right transport depends on where the server runs.

Select each tab for what it is and when to use it.

### stdio

**stdio** runs the server as a local process on the same machine as the client.

The client launches the server as a subprocess and communicates through standard input and output.

This is the correct choice for:

- A local tool
- A personal script
- A development server you run on your own machine

It does not work for a server you want to share across your team or host remotely.

### http

**HTTP** is the recommended form of transport for any server that does not run locally.

It connects over a standard HTTP connection and supports servers hosted on a different machine.

When you register an HTTP server, you provide the URL and the client connects over the network.

Shared team servers and hosted integrations use HTTP.

### SSE

**SSE (Server-Sent Events)** is an older means of transport that predates the current HTTP transport.

It has been superseded by HTTP transport and is no longer recommended for new servers.

If you encounter SSE in existing configuration or documentation, treat it as a legacy option rather than a current recommendation.

## Context cost

Each connected MCP server contributes tool definitions that would occupy the context window if loaded upfront.

By default, Claude Code defers these definitions rather than loading them upfront, and it uses a search step to discover and load the relevant tools only when a task calls for them. Only the tools called for enter context.

An opt-in mode loads tool definitions upfront when they fit within roughly 10 percent of the context window, deferring only when that limit is exceeded.

Either way, connecting only the servers you need keeps each request lean, because every connected server adds to the pool of definitions the model has to account for.

## Prompt caching: paying once for reusable requests

The context-cost problem you just saw with MCP servers has both a cost and window dimension.

Every request reprocesses its input from scratch, including the parts that were identical on the last request, meaning that you pay for reprocessing each time.

Prompt caching can stop you from paying twice for the same stable content.

Caching stores the processing work done on a stable prefix of your request so a follow-up request can reuse it instead of reprocessing the same tokens.

The first request writes the prefix to the cache, and follow-up requests send identical content up to the same point in the cache at a fraction of the cost.

The content must match exactly. A single changed character before the cache point invalidates that cache and forces a fresh write.

That is why the strongest candidates for caches are the parts of a request that rarely change, such as:

- A long system prompt
- A large set of tool definitions
- A reference document you ask several questions about

You turn on caching by marking a cache breakpoint. There is no global setting that turns caching on.

In the Messages API you add a `cache_control` field of type `ephemeral` to the last block you want cached. This caches everything up to and including that block.

You can place up to four breakpoints.

The request is processed in a fixed order of tools, system prompt, and messages, so a breakpoint after the tools caches the tool definitions while keeping the messages dynamic.

The cache has a time limit:

- Default cache lifetime: 5 minutes from the last read
- Optional cache lifetime: 1 hour using `ttl: "1h"`

The five-minute default suits conversational workflows where requests arrive every few minutes.

The one-hour option suits workloads with longer delays between requests, such as multi-step agents.

If the cache expires before the next request, you pay the write cost again.

> Caching only applies above a minimum token threshold (1,024 tokens for most current models), so short prompts will not be cached even if a breakpoint is set.

## Retrieval-augmented generation (RAG): how Claude pulls in only the knowledge a request needs

The context-cost problem you just saw with MCP servers is the same problem a large collection of reference documents creates.

A model reads everything in its context window for every request. The more documents you load, the more context is consumed and the less space remains for reasoning.

Retrieval-augmented generation (RAG) solves this problem.

Instead of loading every document into context, the system:

1. Stores the material outside the context window.
2. Finds the pieces most relevant to the request.
3. Supplies only those pieces to the model.

The model then generates an answer from the retrieved material instead of the entire library.

### Classical RAG

**Classical RAG** does the hard work upfront.

Before anyone asks a question:

1. Documents are split into chunks.
2. Each chunk is converted into an embedding.
3. Embeddings are stored in a database.

When a user asks a question:

1. The question is converted into an embedding.
2. Similar chunks are found.
3. Relevant chunks are returned.

Think of it as a librarian who has already created index cards for every chapter before the library opens.

### Agentic search

**Agentic search** skips upfront indexing.

Instead:

1. The model determines what information it needs.
2. It searches sources on demand.
3. It reads documents as needed.
4. It retrieves results while solving the task.

Think of it as a researcher who investigates each question in real time.

Claude Code uses this pattern when connected to many MCP servers.

Rather than loading every tool definition, Claude discovers and loads only the tools needed for the current task.

Claude.ai Projects behaves similarly when project knowledge exceeds the available context window.

### Key properties of retrieval

1. **It scales.**

   As source material grows, request cost stays relatively stable because the model only sees the relevant slice.

2. **It's only as good as what it finds.**

   If retrieval misses the needed document, the model never sees it.

   Better file naming and organization improve retrieval quality.

   Example:

   - Poor: `notes_final_v3.pdf`
   - Better: `Q3 refund policy updated August 2024.pdf`

## Configuration scope: who loads the server

The scope determines which users and projects load the server.

### 1. Local scope

**Location:** `~/.claude.json`

- Applies only to the current project
- Not shared with teammates
- Good for project-specific tooling

### 2. User scope

Stored in personal Claude settings.

- Available across all projects
- Personal to one user
- Not committed to repositories

### 3. Project scope

**Location:** `.mcp.json`

- Stored at repository root
- Shared through version control
- Available to all team members who clone the repository

Important note:

For a stdio server, every team member runs their own local instance and must have required runtimes (such as Node.js) installed.

### 4. Enterprise scope

Administrator-managed deployment.

- Centrally controlled
- Distributed organization-wide
- Suitable for internal tools and security services

## Permission rules that target a single MCP tool

Connecting a server exposes all of its tools.

Permissions allow finer control.

An MCP tool is identified as:

```text
mcp__server__tool
```

Example:

```text
mcp__github__create_issue
```

An allow rule for this tool permits issue creation without prompting while other GitHub tools can still require approval.

A deny rule on a write-capable tool blocks that specific tool while keeping read-only tools available.

A deny rule overrides an allow.

### API MCP connector controls

The API MCP connector supports an `mcp_toolset` object.

Each tool can be individually enabled or disabled.

The difference:

- **enabled flag** ⇒ determines whether the model can see the tool
- **permission rule** ⇒ determines whether an exposed tool can execute

One controls visibility.

The other controls execution.

## The GitHub MCP server: transport, scope, and authentication

The GitHub MCP server is a remotely hosted MCP server maintained by GitHub.

It exposes tools for:

- Reviewing pull requests
- Opening issues
- Searching code
- Other repository operations

### Transport

GitHub MCP uses **HTTP transport**.

You register the server URL and connect over the network.

### Scope

- **Project scope** when the entire team needs repository access.
- **Local scope** when only one person needs it.

### Authentication

GitHub MCP uses a **Personal Access Token (PAT)**.

The token must:

- Be stored in an environment variable
- Be referenced from configuration
- Never be committed inside `.mcp.json`

A committed token becomes part of repository history and creates a security exposure.

### OAuth-based servers

Some MCP servers use OAuth instead.

Example:

- Linear MCP

Workflow:

1. User signs in through the browser.
2. Access is approved.
3. Token is issued automatically.
4. The client stores credentials.

No manual secret handling is needed.

GitHub MCP uses a manually generated credential.

Linear MCP uses browser-based OAuth.

The transport remains HTTP in both cases.

## The MCP setup reference

| Context | Transport | Scope | Config Location | Secrets Handling |
|----------|----------|----------|----------|----------|
| Personal local tool | stdio | Local | `~/.claude.json` | Environment variables only |
| Shared team server | HTTP | Project (`.mcp.json`) | `.mcp.json` in repository root | OAuth or environment variables |
| Personal experiment | stdio or HTTP | Local | Personal Claude settings | Environment variables only |
| Organization-wide deployment | HTTP | Enterprise | Managed administrator settings | Administrator-managed secrets |

## Cost · Complexity · Risk

### Cost

Each connected MCP server adds tool definitions to the context window.

Connect only the servers required for the task.

### Complexity

Transport and scope are separate decisions but influence each other.

A stdio server cannot realistically support team-wide sharing because it runs locally.

### Risk

The most common error is committing API keys into `.mcp.json`.

Secrets belong in environment variables.

Configuration files should contain server addresses, not credentials.

## Handles well

A reusable integration shared across multiple Claude Code sessions and across teams.

The GitHub MCP server is a strong example.

## Adds cost or complexity

Organizations that do not manage secrets carefully.

More MCP servers mean more places where credentials can be exposed.

Special attention should be paid to `.mcp.json`.

## Use a different approach

For a one-off integration used by only one project and one user, directly wiring the tool into the application may be simpler than maintaining an MCP server.

# The API key that traveled with the configuration file into the repository

## Setup

The server was working, the team needed a shared setup, and cleaning up the authentication method felt like something you could do after the handoff.

That shortcut turned a temporary hardcoded API key into a shared credential exposure the moment the configuration file was committed.

## What happened

A developer connected to a data warehouse MCP server using a service account API key.

To get the server working quickly during setup, the key was placed directly in the `.mcp.json` configuration file.

The plan was to move it to an environment variable before sharing the setup with the team.

The developer committed the `.mcp.json` to the project repository so teammates could connect to the same server by cloning the repository, and the key was committed along with it.

Within 48 hours:

- Three teammates had cloned the repository.
- A CI pipeline had triggered a fresh clone.

The key was now present in:

1. The developer’s local machine
2. Repository history
3. Three teammate machines
4. The CI runner file system

After realizing the mistake, the developer moved the key to an environment variable, updated `.mcp.json`, and committed the corrected file.

However, the key remained in Git history.

The service account key had to be rotated.

The rotation also broke two external services that were using the same key, resulting in approximately three hours of remediation work.

## The corrected `.mcp.json`

### Before (do not use)

```json
{
  "type": "http",
  "url": "https://warehouse.internal/mcp",
  "headers": {
    "Authorization": "Bearer sk-abc123..."
  }
}
```

> Inline credential committed directly into source control.

### After (correct)

```json
{
  "type": "http",
  "url": "https://warehouse.internal/mcp",
  "headers": {
    "Authorization": "Bearer ${WAREHOUSE_MCP_TOKEN}"
  }
}
```

> Environment-variable reference only. The actual credential remains outside the repository.

## What to Watch Out For

API keys committed to configuration files become part of repository history.

Updating or overwriting the file in a later commit does **not** remove the credential from historical commits. It only removes the credential from the latest version.

Any credential that has been committed to source control should be treated as compromised and rotated.

The correct pattern is:

1. Store credential values in environment variables.
2. Reference the environment variables from configuration files.
3. Never commit secret values directly to `.mcp.json`.

## Preventing the Agent from Writing Secrets

To reduce the chance of an agent writing credentials into committed files, use two layers of protection.

### Layer 1: Document the rule in `CLAUDE.md`

Add a project convention such as:

```text
Credential values must never be written inline to .mcp.json.
All secrets must be referenced through environment variables.
```

This provides guidance to the model during every session.

### Layer 2: Enforce the rule with a PreToolUse hook

Create a `PreToolUse` hook that:

- Monitors write operations
- Monitors edit operations
- Inspects changes to `.mcp.json`
- Detects patterns that resemble hardcoded credentials
- Exits with a non-zero status code when a violation is found

Example logic:

```text
IF file == ".mcp.json"
AND added content matches:
  - Bearer tokens
  - API keys
  - Secret values
THEN
  block the write operation
```

This creates deterministic enforcement regardless of model behavior.

## Why Both Layers Matter

The two controls serve different purposes:

| Control | Purpose |
|----------|---------|
| `CLAUDE.md` instruction | Communicates intent to the model |
| `PreToolUse` hook | Enforces the rule automatically |

An instruction can be missed when context changes, conversations become long, or the model makes an incorrect decision.

A hook executes on every relevant tool call and consistently enforces the policy.

This reflects the broader distinction between **instructions** and **hooks**:

- Instructions influence behavior.
- Hooks guarantee behavior.

For secret management, guarantees are preferable to relying solely on prompts.

## Key Takeaway

A secret committed to `.mcp.json` is not removed by editing the file later because the secret remains in repository history.

Always:

- Store secrets in environment variables.
- Reference secrets from configuration files.
- Rotate any credential that was accidentally committed.
- Use both `CLAUDE.md` guidance and enforcement hooks to prevent future exposure.

The safest `.mcp.json` contains only configuration and secret references, never secret values.

# Checkpoint 5: Match Transport and Scope to Each Deployment Scenario

*Try it now. For each deployment scenario below, select the correct transport and scope.*

Labelled configuration snippets are provided.

---

## Scenario 1

### A local SQLite query tool you use only on your development machine.

**Options:**

- HTTP + Project (`.mcp.json`)
- HTTP + Enterprise (managed settings)
- stdio + Local
- stdio or HTTP + Local

### ✅ Correct Answer

**stdio + Local**

### Technical Reasoning

The SQLite database and MCP server are running on the same machine as Claude Code.

`stdio` is specifically designed for local processes. Claude launches the MCP server as a subprocess and communicates through standard input and output.

Local scope is appropriate because:

- The tool is only used by one developer.
- No repository sharing is required.
- No team-wide deployment is required.
- The configuration remains private to the current environment.

### Why Other Options Are Wrong

#### HTTP + Project (`.mcp.json`)

Incorrect because:

- The server is not remote.
- There is no need to expose the service over the network.
- Project scope would unnecessarily distribute the configuration.

#### HTTP + Enterprise (managed settings)

Incorrect because:

- Enterprise scope is for organization-wide deployment.
- This tool is only used by one developer.

#### stdio or HTTP + Local

Not the best answer because:

- While technically possible, HTTP introduces unnecessary networking overhead.
- The lesson explicitly recommends `stdio` for local-only tools.

---

## Scenario 2

### A code search service hosted on your company's infrastructure that the whole engineering team should access.

**Options:**

- HTTP + Project (`.mcp.json`)
- HTTP + Enterprise (managed settings)
- stdio + Local
- stdio or HTTP + Local

### ✅ Correct Answer

**HTTP + Project (`.mcp.json`)**

### Technical Reasoning

The service is:

- Hosted remotely.
- Shared among team members.
- Intended for repository-level collaboration.

HTTP is required because the server runs outside the developer's machine.

Project scope is appropriate because:

- The configuration can be stored in `.mcp.json`.
- Team members obtain the same MCP configuration when they clone the repository.
- Repository-specific tooling naturally belongs with the repository.

### Why Other Options Are Wrong

#### stdio + Local

Incorrect because:

- A local subprocess cannot represent a shared remote service.

#### stdio or HTTP + Local

Incorrect because:

- Local scope prevents automatic sharing with teammates.

#### HTTP + Enterprise (managed settings)

Possible in some organizations, but not the best answer.

Enterprise scope is intended when IT or administrators want organization-wide deployment. The scenario only requires access for the engineering team associated with the repository.

---

## Scenario 3

### An experimental web-scraping server you are testing this week against one specific repository, not ready to share.

**Options:**

- HTTP + Project (`.mcp.json`)
- HTTP + Enterprise (managed settings)
- stdio + Local
- stdio or HTTP + Local

### ✅ Correct Answer

**stdio or HTTP + Local**

### Technical Reasoning

The key phrase is:

> "not ready to share"

This indicates:

- Personal experimentation.
- Temporary testing.
- No team distribution.
- No repository-level commitment.

The MCP reference explicitly maps personal experiments to:

```text
Transport: stdio or HTTP
Scope: Local
```

The transport depends on where the experimental server runs:

- Local machine → stdio
- Personal remote server → HTTP

Both transports are valid.

### Why Other Options Are Wrong

#### HTTP + Project (`.mcp.json`)

Incorrect because:

- Project scope shares the configuration with others.
- The scenario explicitly states that the server is not ready to share.

#### HTTP + Enterprise (managed settings)

Incorrect because:

- Enterprise deployment is the opposite of experimentation.

#### stdio + Local

Too restrictive.

The scenario does not specify where the experimental server runs. The lesson intentionally allows either stdio or HTTP transport.

---

## Scenario 4

### A security-scanning server your organization's IT team needs deployed to every developer's Claude Code installation.

**Options:**

- HTTP + Project (`.mcp.json`)
- HTTP + Enterprise (managed settings)
- stdio + Local
- stdio or HTTP + Local

### ✅ Correct Answer

**HTTP + Enterprise (managed settings)**

### Technical Reasoning

The key phrase is:

> "deployed to every developer's Claude Code installation"

This maps directly to Enterprise scope.

Enterprise scope provides:

- Centralized administration.
- Consistent deployment.
- Organizational governance.
- Security policy enforcement.

HTTP transport is appropriate because:

- The service is centrally hosted.
- Multiple developers must access the same service.
- Enterprise deployments are generally managed remotely.

### Why Other Options Are Wrong

#### HTTP + Project (`.mcp.json`)

Incorrect because:

- Project scope only applies to repositories containing the configuration file.
- It does not guarantee deployment to all developers.

#### stdio + Local

Incorrect because:

- Local processes are not centrally managed.
- Impossible to enforce organization-wide deployment.

#### stdio or HTTP + Local

Incorrect because:

- Local scope is personal.
- The scenario requires organization-wide deployment.

---

# Answer Summary

| Scenario | Correct Answer |
|-----------|---------------|
| Local SQLite tool on your machine | **stdio + Local** |
| Company-hosted code search service for the engineering team | **HTTP + Project (`.mcp.json`)** |
| Experimental web-scraping server not ready to share | **stdio or HTTP + Local** |
| Security-scanning service deployed to all developers | **HTTP + Enterprise (managed settings)** |

---

# Decision Framework

Use the following decision process when selecting MCP transport and scope.

## Step 1: Where does the server run?

### Runs on the same machine as Claude Code

```text
Use stdio
```

Examples:

- SQLite tools
- Local scripts
- Development-only MCP servers

### Runs on another machine

```text
Use HTTP
```

Examples:

- GitHub MCP
- Company search services
- Shared organizational platforms

---

## Step 2: Who should receive the configuration?

### Only me

```text
Local scope
```

Examples:

- Personal utilities
- Experiments
- Temporary testing

### Everyone working on the repository

```text
Project scope (.mcp.json)
```

Examples:

- Shared repository tools
- Team code-search services
- Repository-specific integrations

### Everyone in the organization

```text
Enterprise scope
```

Examples:

- Security scanning
- Compliance tooling
- Internal organizational services

---

# Core MCP Rule

```text
Local process
    → stdio

Remote service
    → HTTP

Personal use
    → Local scope

Repository-wide sharing
    → Project scope

Organization-wide deployment
    → Enterprise scope
```

This rule correctly solves all four checkpoint scenarios and matches the MCP transport and scope guidance presented in the lesson.