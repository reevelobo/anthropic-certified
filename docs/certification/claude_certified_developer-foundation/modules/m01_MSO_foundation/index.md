---
icon: material/numeric-1-box
---

# M01 · MSO Foundations

Before you write a line of code against Claude, it helps to know what the words mean. This module introduces the model fundamentals and technical foundations assumed by every subsequent module.

---

## Sections

| # | Section | Core Topic |
|---|---------|-----------|
| [S01](s01_orientation/README.md) | Orientation | Learning objectives & disclaimer |
| [S02](s02_how_LLMs_behave/README.md) | How LLMs Behave | Tokens · Context window · Sampling · Non-determinism |
| [S03](s03_models_reasoning/README.md) | Models & Reasoning | Claude family · Capability tiers · Adaptive thinking |
| [S04](s04_prompting_models/README.md) | Prompting Modes | Zero-shot · One-shot · Multi-shot · Cost trade-offs |
| [S05](s05_technical_substrate/README.md) | Technical Substrate | SDK vs REST · Streaming · Async · Batch API |
| [S06](s06_module_wrap-up/README.md) | Module Wrap-Up | Scenarios · Quiz · Five key takeaways |

---

## Five Key Takeaways

!!! success "1 — Tokens are the unit"
    Budget, pricing, and context window all measure in **tokens** — not words or characters.

!!! success "2 — Context window is a fixed budget"
    Oversized input → validation error before generation. Overflow mid-generation → `model_context_window_exceeded` stop reason. The **application** must trim or summarise history.

!!! success "3 — Sampling = non-determinism"
    Identical inputs ≠ identical outputs. Test on **properties** (field present, value in range, structure parses) — not exact text. Use model-graded evals for semantic correctness.

!!! success "4 — Model choice ≠ reasoning mode"
    Two independent levers. **Model** (Haiku/Sonnet/Opus/Fable) selects capability tier. **Reasoning mode** (effort setting) controls deliberation depth per request.

!!! success "5 — REST API, usually via SDK"
    Synchronous → wait for full response. Streaming → SSE chunks. Async SDK (`AsyncAnthropic`) → concurrent real-time. Message Batches API → offline bulk at lower cost.

---

[:material-open-in-new: Open on Skilljar](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations/486742/scorm/1zuxexjatih0p){ .md-button .md-button--primary }
