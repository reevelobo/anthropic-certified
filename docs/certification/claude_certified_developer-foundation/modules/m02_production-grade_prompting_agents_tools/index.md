---
icon: material/numeric-2-box
---

# M02 · Production-Grade Prompting, Agents & Tools

Writing code that *uses* Claude is different from using Claude to write code. This is the largest certification module — it covers everything that separates a working prototype from a reliable production system.

---

## Sections

| # | Section | Core Topic |
|---|---------|-----------|
| [S01](s01_orientation/README.md) | Orientation | Module scope, who it's for, "The Build" |
| [S02](s02_prompting_craft/README.md) | Prompting Craft | System prompts · XML tags · Few-shot · Structured outputs |
| [S03](s03_extended_thinking/README.md) | Extended Thinking | When to enable · Effort setting · Carry-back rule |
| [S04](s04_tool-use_and_schema_design/README.md) | Tool Use & Schema Design | Tool loop · Block types · Schema anatomy · MCP |
| [S05](s05_streaming_responses/README.md) | Streaming Responses | Stream-aware parsing · UX · Error recovery |
| [S06](s06_context_engineering/README.md) | Context Engineering | Trimming · Summarisation · Retrieval patterns |
| [S07](s07_agent_construction/README.md) | Agent Construction | Plan-act-observe loops · Safeguards · HITL |
| [S08](s08_agent_memory/README.md) | Agent Memory | Transient vs durable · Persistence patterns |
| [S09](s09_cumulative_debug_task/README.md) | Cumulative Debug Task | Integrated debugging exercise |
| [S10](s10_multimodal_and_batch_ingestion/README.md) | Multimodal & Batch Ingestion | Images · PDFs · Files API · Batch shapes |
| [S11](s11_module_wrap-up/README.md) | Module Wrap-Up | Core patterns · Anti-patterns · Readiness check |

---

## Production Failure Map

| Concern | Engineering Focus |
|---------|-----------------|
| Inconsistent outputs | Prompt design (S02) |
| Tool misuse | Schema design (S04) |
| Stream interruptions | Streaming recovery (S05) |
| Context overflow | Context engineering (S06) |
| Excessive costs | Memory & context management (S06, S08) |
| Unsafe actions | Human-in-the-Loop (S07) |
| Agent failures | Agent architecture & tooling (S07) |

---

[:material-open-in-new: Open on Skilljar](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-grade-prompting-agents-tool-use/486743/scorm/3k33sihfb1tww){ .md-button .md-button--primary }
