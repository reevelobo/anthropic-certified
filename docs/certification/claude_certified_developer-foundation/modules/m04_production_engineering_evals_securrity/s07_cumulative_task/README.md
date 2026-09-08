# Transcription of the Image

# Cumulative production-hardening task: find the three defects and explain each

*Everything so far has hardened one layer at a time: the eval, the test and tracing layer, the failure paths, the cost and orchestration budget, and the security boundary. Real production failures rarely arrive one layer at a time.*

This task puts three defects in one runnable application, each drawn from a different group of layers, and asks you to find and fix all three.

Try it now. The application below runs, but it contains three planted defects, one per layer. First, localize each defect to its layer. Then write the fix for each. Your goal is to find, fix, and integrate all three.

```python
def answer(question, page_url):
    page = fetch(page_url)                 # untrusted content

    notes = read_file('/workspace/input/notes')
    write_file(page.suggested_path, summarize(page))

    resp = None
    for i in range(5):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                messages=msg(question)
            )
            break
        except Exception:
            time.sleep(0)

    return resp.content[0].text
```

## Identify each defect

The application above has three defects, one per layer. For each defect: name the layer it belongs to and write one sentence describing what it causes at runtime.

# Correct Answer

## Defect 1: Eval/Test Layer Defect

### Problem

There is no evaluation framework for the application. Success was determined only through a few manual demonstrations.

### Layer

**Eval/Test Layer**

### Runtime Impact

Prompt changes, model upgrades, or code modifications can introduce regressions that go completely undetected because there is no objective mechanism to measure performance against known expectations.

### Technical Reasoning

The application lacks:

- A holdout evaluation dataset
- Graded test cases
- Automated regression checks
- Defined success criteria

Without these controls, the team cannot determine whether a change improved or degraded behavior. Manual demo runs only validate a small number of hand-picked scenarios and provide no protection against future regressions.

### Fix

Create an evaluation suite with representative test cases and automated grading.

Example:

```python
eval_cases = load_eval_dataset()

for case in eval_cases:
    result = answer(case.question, case.url)
    score(result, case.expected)
```

The application should fail deployment when evaluation scores fall below an established threshold.

---

## Defect 2: Error-Handling / Cost Layer Defect

### Problematic Code

```python
for i in range(5):
    try:
        ...
        break
    except Exception:
        time.sleep(0)
```

### Layer

**Error-Handling / Cost Layer**

### Runtime Impact

The application instantly retries every failure, including terminal errors, increasing API costs, amplifying rate limits, and creating unnecessary load on dependencies.

### Technical Reasoning

The retry loop contains two major flaws:

1. **No backoff**
   - `time.sleep(0)` causes immediate retries.
   - During rate limiting (429 responses), retries arrive before the limit window clears.

2. **No error classification**
   - Permanent failures such as invalid requests (400-series client errors) are treated the same as transient failures.
   - Retrying a malformed request cannot succeed and only wastes tokens, requests, and budget.

As a result, the retry logic can make incidents worse rather than improving resilience.

### Fix

Retry only transient failures and apply exponential backoff.

```python
for attempt in range(5):
    try:
        resp = client.messages.create(...)
        break

    except RateLimitError:
        time.sleep(2 ** attempt)

    except BadRequestError:
        raise
```

This approach reduces unnecessary cost and gives dependent services time to recover.

---

## Defect 3: Security / Guardrail Layer Defect

### Problematic Code

```python
write_file(page.suggested_path, summarize(page))
```

### Layer

**Security / Guardrail Layer**

### Runtime Impact

Untrusted web content controls the write destination, allowing the agent to write outside intended locations and potentially overwrite sensitive files.

### Technical Reasoning

The value:

```python
page.suggested_path
```

originates from fetched external content and therefore crosses a trust boundary.

The code has:

- No path validation
- No write-scope restriction
- No PreToolUse authorization hook
- No enforcement of an approved output directory

A malicious page could supply paths such as:

```text
/etc/passwd
../secrets/token.txt
~/.aws/credentials
```

Because the agent performs the write directly, external content can influence a privileged filesystem action.

### Fix

Enforce a write boundary using a policy hook and restrict writes to an approved location.

```python
on: PreToolUse

if tool == "write_file" and \
   not path.startswith("/workspace/output"):
    deny("write outside permitted path")
```

In addition, apply explicit filesystem-deny rules:

```yaml
deny_paths:
  - /etc
  - /secrets
  - ~/.aws
```

This ensures the agent can write only within its intended scope.

---

# Integrated Corrected Version

```python
def answer(question, page_url):
    page = fetch(page_url)

    safe_path = validate_output_path(
        page.suggested_path,
        allowed_root="/workspace/output"
    )

    write_file(
        safe_path,
        summarize(page)
    )

    resp = None

    for attempt in range(5):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                messages=msg(question)
            )
            break

        except RateLimitError:
            time.sleep(2 ** attempt)

        except BadRequestError:
            raise

    if resp is None:
        raise RuntimeError(
            "Request failed after all retries"
        )

    return resp.content[0].text
```

Additional deployment requirement:

```python
run_eval_suite()
assert eval_score >= REQUIRED_THRESHOLD
```

---

# Final Answer

| Defect | Layer | Runtime Consequence |
|----------|----------|----------|
| No evaluation suite, holdout dataset, or regression testing | Eval/Test Layer | Regressions caused by prompt, model, or code changes cannot be detected before deployment |
| Immediate retries with `time.sleep(0)` and no distinction between terminal and retriable failures | Error-Handling / Cost Layer | Increased cost, rate-limit amplification, wasted requests, and poor failure recovery |
| `write_file(page.suggested_path, ...)` uses an untrusted path with no write boundary enforcement | Security / Guardrail Layer | Unauthorized file writes and possible access to sensitive filesystem locations |

The three planted defects therefore belong to the **Eval/Test**, **Error-Handling/Cost**, and **Security/Guardrail** layers respectively.

# Transcription of the Image

# Cumulative production-hardening task: write the corrected version

Write the corrected version of the application. For each defect you identified, show the fixed code and name what it changes.

## Application from the previous screen (for reference)

```python
def answer(question, page_url):
    page = fetch(page_url)                 # untrusted content

    notes = read_file('/workspace/input/notes')
    write_file(page.suggested_path, summarize(page))

    resp = None
    for i in range(5):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                messages=msg(question)
            )
            break
        except Exception:
            time.sleep(0)

    return resp.content[0].text
```

# Correct Answer

## Corrected Application

```python
def answer(question, page_url):
    page = fetch(page_url)                   # still untrusted

    # security: fixed write path + PreToolUse hook enforces it
    notes = read_file("/workspace/input/notes")  # scoped read, unchanged
    write_file("/workspace/output/summary.txt", summarize(page))
    # (hook denies any write outside /workspace/output and audits it)

    # error handling: backoff, honor retry-after, fail fast on terminal
    resp = call_with_retry(
        lambda: client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            messages=msg(question)
        )
    )

    # eval: answer() is covered by a graded holdout set run on every change
    return resp.content[0].text
```

---

# Fix 1: Security / Guardrail Layer

## Original Defect

```python
write_file(page.suggested_path, summarize(page))
```

The write destination was taken directly from untrusted fetched content.

## Fixed Code

```python
write_file("/workspace/output/summary.txt", summarize(page))
```

Policy enforcement:

```python
on: PreToolUse

if tool == "write_file" and \
   not path.startswith("/workspace/output"):
    deny("write outside permitted path")
```

Audit requirement:

```python
log_audit(action, path, result)
```

## What It Changes

The write destination is no longer controlled by untrusted content, and a PreToolUse policy hook enforces that all writes remain within the approved output boundary.

## Technical Reasoning

`page_url` content is untrusted and should never influence privileged filesystem operations. By writing only to a fixed approved location and enforcing the boundary before tool execution, the agent follows least-privilege principles and prevents unauthorized file writes. Audit logging provides accountability for every privileged action.

---

# Fix 2: Error-Handling / Cost Layer

## Original Defect

```python
for i in range(5):
    try:
        ...
    except Exception:
        time.sleep(0)
```

The application immediately retried every failure and did not distinguish retriable failures from terminal failures.

## Fixed Code

```python
resp = call_with_retry(
    lambda: client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=msg(question)
    )
)
```

## What It Changes

Retry behavior now uses exponential backoff, respects server retry guidance such as `Retry-After`, and fails immediately for terminal errors.

## Technical Reasoning

Rate limits and transient service failures often resolve with time. Immediate retries deepen rate limiting and increase cost without improving success rates. A centralized retry helper can:

- Retry only transient failures.
- Honor `Retry-After` headers when provided.
- Apply exponential backoff.
- Stop immediately on terminal failures such as malformed requests or invalid parameters.

This improves reliability while controlling operational cost.

---

# Fix 3: Eval/Test Layer

## Original Defect

There was no evaluation framework. Success was based only on manual demonstrations.

## Fixed Process

```python
run_holdout_eval_suite(answer)
assert score >= REQUIRED_THRESHOLD
```

## What It Changes

Every change to prompts, model versions, policies, or application code is validated against a graded holdout dataset before release.

## Technical Reasoning

Manual testing cannot reliably detect regressions. A graded holdout set establishes a baseline score and provides an objective mechanism to detect behavior changes. Future modifications can therefore be measured against known expectations, and regressions can block deployment automatically.

---

# Summary

| Layer | Defect | Fix |
|---------|---------|---------|
| Security / Guardrail | Untrusted content controlled the write destination | Fixed output path plus PreToolUse boundary enforcement and audit logging |
| Error-Handling / Cost | Immediate retries for all errors (`time.sleep(0)`) | `call_with_retry()` with exponential backoff, Retry-After support, and terminal-error detection |
| Eval/Test | No holdout set or regression testing | Graded holdout evaluation suite executed on every change |

## Final Explanation

Each fix is implemented at the layer it is intended to defend:

- **Security Layer:** The fixed write path and PreToolUse hook prevent unauthorized writes before the filesystem tool executes.
- **Error-Handling / Cost Layer:** `call_with_retry()` applies exponential backoff, honors retry guidance, and avoids retrying terminal failures.
- **Eval/Test Layer:** A graded holdout evaluation suite provides a repeatable baseline score and detects regressions whenever prompts, models, or code change.

Together, these changes harden the application across evaluation, reliability, cost control, and security boundaries.