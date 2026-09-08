# Cumulative Task

## Diagnosis
# Cumulative task: Find all three, explain each, write the correction

## Image Transcription

### Title

# Cumulative task: Find all three, explain each, write the correction

### Instructions

Below is a runnable packaged accelerator deployed across platforms. There are three planted defects: one in the packaging layer, one in the deployment-and-versioning layer, and one in the multi-component boundary layer. Your task is to find all three.

---

## The Deployment as Shipped

```python
# Packaged code-review accelerator, deployed for a regulated AWS customer

def build_agent():
    return Agent(
        model="opus",
        system_prompt=SYSTEM_PROMPT,
        repo_path="/home/acme/checkout",
        tools=[read_file, run_linter],
    )

deploy(platform="amazon_bedrock", identity=aws_role_arn)

# multi-component step: Claude Code task fetches a customer page
fetched = code_task.run(fetch_url=customer_page)
next_call(input=fetched)
```

---

### Prompt from the Exercise

Carry your three corrected lines into the next screen, where you assemble and verify the fixed deployment.

In your own words, identify all three defects.

```text
Defect 1 (packaging): ...
Defect 2 (deployment/versioning): ...
Defect 3 (multi-component boundary): ...
```

---

# Correct Answers

## Defect 1 (Packaging)

### Problem

```python
repo_path="/home/acme/checkout"
```

The packaged accelerator contains a hard-coded local repository path.

### Why This Is a Defect

Earlier lessons established that packaged accelerators must not contain environment-specific assumptions.

A local path such as:

```text
/ home / acme / checkout
```

only works in the original developer environment.

Problems include:

- Not portable across customers.
- Breaks in another environment.
- Encodes deployment-specific assumptions.
- Prevents repeatable installation.

A packaged accelerator should parameterize customer-specific resources.

### Corrected Line

```python
repo_path=config.repo_path
```

or

```python
repo_path=customer_repo_path
```

depending on the implementation pattern.

### Technical Reasoning

Packaging should separate:

```text
Reusable code
        from
Customer-specific configuration
```

The repository location is customer configuration, not accelerator logic.

---

## Defect 2 (Deployment and Versioning)

### Problem

```python
model="opus"
```

### Why This Is a Defect

The lessons on deployment and versioning repeatedly emphasize:

```text
Aliases move.
Pinned versions do not.
```

The value:

```python
model="opus"
```

is a moving alias.

The alias can later resolve to a different model version without any application change.

Potential consequences:

- Output shape changes.
- Behavior changes.
- Evaluation drift.
- Silent production changes.
- No reliable rollback target.

For a regulated AWS deployment, production workloads must use a pinned model version.

### Corrected Line

Example:

```python
model="claude-opus-4-8"
```

or whatever the approved pinned model ID is for the deployment platform.

### Technical Reasoning

A pinned model identifier guarantees:

```text
Same model
Same behavior
Same evaluation baseline
Reproducible deployment
```

This makes upgrades deliberate rather than accidental.

---

## Defect 3 (Multi-Component Boundary)

### Problem

```python
next_call(input=fetched)
```

### Why This Is a Defect

The fetched content came from:

```python
code_task.run(fetch_url=customer_page)
```

Anything fetched from an external source is untrusted.

The lesson on trust boundaries explicitly states that content fetched by a Claude Code task becomes untrusted at the seam where it is passed to the next component.

Currently the workflow is:

```text
Customer Page
      ↓
Claude Code Task
      ↓
Next Component
```

with no boundary control applied.

That means:

- Prompt-injection content may pass through.
- Instructions may be interpreted as commands.
- Untrusted content is treated as trusted input.

### Corrected Line

```python
next_call(input=treat_as_data(fetched))
```

### Technical Reasoning

The trust-boundary rule is:

```text
Fetched content
        =
Data
```

not:

```text
Fetched content
        =
Instructions
```

Treating fetched content as data prevents downstream components from executing instructions embedded in untrusted content.

---

# Fully Corrected Example

```python
# Packaged code-review accelerator, deployed for a regulated AWS customer

def build_agent():
    return Agent(
        model="claude-opus-4-8",
        system_prompt=SYSTEM_PROMPT,
        repo_path=config.repo_path,
        tools=[read_file, run_linter],
    )

deploy(platform="amazon_bedrock", identity=aws_role_arn)

# multi-component step: Claude Code task fetches a customer page
fetched = code_task.run(fetch_url=customer_page)

next_call(input=treat_as_data(fetched))
```

---

# Summary of the Three Defects

| Layer | Defect | Why It Is Wrong | Correction |
|---------|---------|---------|---------|
| Packaging | `repo_path="/home/acme/checkout"` | Hard-coded environment-specific path inside reusable accelerator | Use a configurable repository path |
| Deployment / Versioning | `model="opus"` | Moving alias can silently change model behavior | Use a pinned model ID |
| Multi-component Boundary | `next_call(input=fetched)` | Untrusted fetched content crosses a seam without a boundary control | Treat fetched content as data |

---

# Final Answers

```text
Defect 1 (packaging):
Hard-coded repository path embedded in the packaged accelerator.
Correction: Parameterize the repository path.

Defect 2 (deployment/versioning):
Model uses the moving alias "opus".
Correction: Replace it with a pinned model ID.

Defect 3 (multi-component boundary):
Fetched content is passed directly to the next component.
Correction: Treat fetched content as data at the trust boundary.
```


## Assemble
# Cumulative task: assemble and verify the corrected deployment

## Image Transcription Update

### The corrected deployment

```python
def build_agent(repo_path):                   # parameterized for reuse
    return Agent(
        model="us.anthropic.claude-opus-4-8",              # pinned full Bedrock model ID
        system_prompt=SYSTEM_PROMPT,
        repo_path=repo_path,                  # set per engagement
        tools=[read_file, run_linter],
    )

deploy(
    platform="amazon_bedrock",
    identity=aws_role_arn,
    retain_previous_pinned_version=True
)   # rollback target kept

fetched = code_task.run(fetch_url=customer_page)

next_call(input=treat_as_data(fetched))       # untrusted -> data, not instructions

# verify before promoting: gate the version through the bundled eval
assert eval_suite.run(
    model="us.anthropic.claude-opus-4-8"
) >= baseline_score
```

---

## Model Answer

The first defect was a hardcoded repository path. Parameterizing it restores reuse: a new engagement sets the value rather than editing the code.

The second defect was a moving model alias. Pinning the full Bedrock model ID with a retained previous version restores controlled rollout and provides a rollback target if a new version regresses.

The third defect was fetched content passed directly as instructions. Wrapping it in `treat_as_data()` closes the trust boundary: content from an untrusted source is treated as data rather than something the agent should act on.

The eval assertion gates promotion on a proven baseline score before the version ships.

---

# Updated Technical Explanation

## Defect 1: Packaging Layer

### Original Defect

```python
repo_path="/home/acme/checkout"
```

The accelerator embedded a hardcoded repository path. This tied the package to a specific environment and reduced portability.

### Correction

```python
def build_agent(repo_path):
```

```python
repo_path=repo_path
```

### Why This Is Correct

A packaged accelerator should contain reusable logic, not customer-specific configuration.

By parameterizing the repository path:

- The accelerator becomes reusable across engagements.
- Different customers can provide different repository locations.
- No code modification is required to deploy the accelerator elsewhere.
- Configuration remains separate from implementation.

This restores the packaging principle that reusable assets should externalize environment-specific settings.

---

## Defect 2: Deployment and Versioning Layer

### Original Defect

```python
model="opus"
```

The deployment relied on a moving alias.

Aliases can resolve to newer model versions over time without any application change, creating untracked production changes.

### Correction

```python
model="us.anthropic.claude-opus-4-8"
```

and

```python
retain_previous_pinned_version=True
```

### Why This Is Correct

The full Bedrock model ID pins the deployment to a specific model snapshot.

Benefits include:

- Predictable production behavior.
- Stable evaluation results.
- Controlled model upgrades.
- Reproducible deployments.
- Easier incident investigation.

Retaining the previous pinned version adds rollback capability.

If the new model version fails evaluation or introduces regressions:

```text
Version B fails
      ↓
Rollback
      ↓
Version A restored
```

without requiring emergency hotfixes.

This follows the deployment principle:

```text
Pin the version.
Retain the previous version.
Promote only after evaluation.
```

---

## Defect 3: Multi-Component Boundary Layer

### Original Defect

```python
next_call(input=fetched)
```

Fetched content crossed a trust boundary without any control.

The content originated outside the application and was forwarded downstream as-is.

### Correction

```python
next_call(input=treat_as_data(fetched))
```

### Why This Is Correct

The content retrieved by the Claude Code task is untrusted.

Potential risks include:

- Prompt-injection attempts.
- Embedded instructions.
- Malicious content.
- Attempts to steer downstream behavior.

The trust-boundary rule is:

```text
Untrusted content
        ↓
Treat as data
        ↓
Do not treat as instructions
```

Using:

```python
treat_as_data(fetched)
```

ensures the next component processes the content as information rather than executable guidance.

This explicitly secures the seam between components.

---

## Additional Deployment Control: Eval-Gated Promotion

### Added Verification

```python
assert eval_suite.run(
    model="us.anthropic.claude-opus-4-8"
) >= baseline_score
```

### Why It Matters

A pinned version should not be promoted solely because it exists.

The deployment should demonstrate performance equal to or better than the approved baseline.

The eval gate provides:

- Regression detection.
- Objective promotion criteria.
- Safer releases.
- Repeatable deployment decisions.

Deployment flow:

```text
Pinned Version
      ↓
Run Eval Suite
      ↓
Compare To Baseline
      ↓
Pass → Promote
Fail → Roll Back
```

This turns evaluation from a one-time test into an operational deployment control.

---

# Verification of the Corrected Deployment

## Packaging

✅ Repository path is parameterized.

```python
repo_path=repo_path
```

Result:

```text
Reusable
Portable
Customer-configurable
```

---

## Deployment and Versioning

✅ Full Bedrock model ID is pinned.

```python
model="us.anthropic.claude-opus-4-8"
```

✅ Previous version is retained.

```python
retain_previous_pinned_version=True
```

Result:

```text
Controlled rollout
Stable behavior
Rollback capability
```

---

## Trust Boundary

✅ Fetched content is treated as data.

```python
treat_as_data(fetched)
```

Result:

```text
Reduced prompt-injection risk
Explicit boundary control
Safer component integration
```

---

## Promotion Control

✅ Deployment is gated by evaluation.

```python
assert eval_suite.run(...) >= baseline_score
```

Result:

```text
Validated quality
Regression protection
Evidence-based promotion
```

---

# Final Summary

| Layer | Original Defect | Correction |
|---------|---------|---------|
| Packaging | Hardcoded repository path | Parameterized `repo_path` |
| Deployment & Versioning | Moving alias (`opus`) | Pinned Bedrock model ID |
| Rollback Control | No retained prior version | `retain_previous_pinned_version=True` |
| Multi-Component Boundary | Untrusted content forwarded directly | `treat_as_data(fetched)` |
| Promotion Process | No release gate | Eval-based promotion check |

## Final Conclusion

The corrected deployment is deployable because it:

1. Separates reusable code from environment-specific configuration.
2. Uses a pinned Bedrock model ID rather than a moving alias.
3. Retains the prior pinned version for rollback.
4. Treats externally fetched content as untrusted data at the trust boundary.
5. Gates promotion through an evaluation suite before release.

Together, these controls make the deployment portable, reviewable, compliant with versioning best practices, and resilient against trust-boundary failures.
