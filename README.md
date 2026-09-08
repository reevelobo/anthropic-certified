# Claude Certifications — Study Guide

> Complete study notes, worked examples, interactive Jupyter notebooks, and quick-reference
> tables for Anthropic certification exams and partner badge tracks.

📖 **[View the Documentation Site](https://github.ibm.com/pages/Reeve-Lobo/claude-certified-developer-foundation/)**

---

## Certifications Covered

| Cert | Full Name | Exam Date |
|------|-----------|-----------|
| **CCDV-F** | Claude Certified Developer – Foundations | Sat 19 Sep 2026, 18:15 IST |
| **CCAR-F** | Claude Certified Architect – Foundations | Sat 31 Oct 2026, 14:00 IST |

---

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Live preview
python3 -m mkdocs serve

# Build static site
python3 -m mkdocs build
```

The site deploys automatically to GitHub Pages on every push to `main` via `.github/workflows/deploy-docs.yml`.

---

## Project Structure

```
docs/
├── index.md                                   # Home page
├── certification/
│   ├── claude_certified_developer-foundation/ # CCDV-F cert path
│   │   └── modules/
│   │       ├── m01_MSO_foundation/            # 6 sections
│   │       ├── m02_production-grade_*/        # 11 sections
│   │       ├── m03_claude_code_mcp_integration/  # 8 sections
│   │       ├── m04_production_engineering_*/  # 8 sections
│   │       └── m05_accelerators_*/            # 9 sections
│   └── claude_certified_architect-foundation/ # CCAR-F cert path
│       └── modules/
│           ├── m01_fluency_framework_*/       # 10 sections
│           ├── m02_building_with_the_claude_api/  # 13 sections + notebooks
│           └── m03 – m07/                     # Cloud, Code, 101, Bedrock, MCP
├── modules/                                   # 18 standalone courses (M01–M18)
│   ├── m01_fluency_framework_founndations/    # 10 sections
│   ├── m08_building_with_the_claude_api/      # Full course with notebooks
│   └── ... (m02 – m18)
├── badges/
│   └── Claud.Patner.Badge_Claude_code/        # 10-section badge track
├── ccdvf/                                     # CCDV-F study tools
│   ├── study-runway.md
│   └── mindmap.md
└── ccarf/                                     # CCAR-F study tools
    ├── study-runway.md
    └── mindmap.md
```

---

## CCDV-F · Claude Certified Developer – Foundations

| Module | Title | Skilljar |
|--------|-------|---------|
| M01 | MSO Foundations | [Open ↗](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/mso-foundations/486742/scorm/1zuxexjatih0p) |
| M02 | Production-Grade Prompting, Agents & Tools | [Open ↗](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-grade-prompting-agents-tool-use/486743/scorm/3k33sihfb1tww) |
| M03 | Claude Code, MCP & Integration | [Open ↗](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/claude-code-mcp-integration/486744/scorm/173ln01ww7hgd) |
| M04 | Production Engineering, Evals & Security | [Open ↗](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/production-engineering-evals-security/486745/scorm/1twknqoor0w46) |
| M05 | Accelerators & IP Contribution | [Open ↗](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations/accelerators-ip-contribution/486746/scorm/1gpfepjydcsjm) |

---

## CCAR-F · Claude Certified Architect – Foundations

| Module | Title |
|--------|-------|
| M01 | AI Fluency: Framework & Foundations |
| M02 | Building with the Claude API *(includes Jupyter notebooks)* |
| M03 | Claude on Google Cloud |
| M04 | Claude Code in Action |
| M05 | Claude 101 |
| M06 | Claude with Amazon Bedrock |
| M07 | Introduction to Model Context Protocol |

---

## Courses (18 Total)

| # | Course | Link |
|---|--------|------|
| 1 | AI Fluency: Framework & Foundations | [Skilljar ↗](https://anthropic-partners.skilljar.com/ai-fluency-framework-foundations) |
| 2 | AI Fluency for Educators | [Skilljar ↗](https://anthropic-partners.skilljar.com/ai-fluency-for-educators) |
| 3 | AI Fluency for Students | [Skilljar ↗](https://anthropic-partners.skilljar.com/ai-fluency-for-students) |
| 4 | AI Fluency for Builders | [Skilljar ↗](https://anthropic-partners.skilljar.com/ai-fluency-for-builders) |
| 5 | Introduction to Agent Skills | [Skilljar ↗](https://anthropic-partners.skilljar.com/introduction-to-agent-skills) |
| 6 | Introduction to Subagents | [Skilljar ↗](https://anthropic-partners.skilljar.com/introduction-to-subagents) |
| 7 | Introduction to Claude Cowork | [Skilljar ↗](https://anthropic-partners.skilljar.com/introduction-to-claude-cowork) |
| 8 | Building with the Claude API | [Skilljar ↗](https://anthropic-partners.skilljar.com/claude-with-the-anthropic-api) |
| 9 | Claude Code in Action | [Skilljar ↗](https://anthropic-partners.skilljar.com/claude-code-in-action) |
| 10 | Introduction to Model Context Protocol | [Skilljar ↗](https://anthropic-partners.skilljar.com/introduction-to-model-context-protocol) |
| 11 | Model Context Protocol: Advanced Topics | [Skilljar ↗](https://anthropic-partners.skilljar.com/model-context-protocol-advanced-topics) |
| 12 | Claude in Amazon Bedrock | [Skilljar ↗](https://anthropic-partners.skilljar.com/claude-in-amazon-bedrock) |
| 13 | Claude with Google Vertex | [Skilljar ↗](https://anthropic-partners.skilljar.com/claude-with-google-vertex) |
| 14 | Teaching AI Fluency | [Skilljar ↗](https://anthropic-partners.skilljar.com/teaching-ai-fluency) |
| 15 | AI Fluency for Nonprofits | [Skilljar ↗](https://anthropic-partners.skilljar.com/ai-fluency-for-nonprofits) |
| 16 | Claude 101 | [Skilljar ↗](https://anthropic-partners.skilljar.com/claude-101) |
| 17 | Partner Basecamp | [Skilljar ↗](https://anthropic-partners.skilljar.com/partner-basecamp) |
| 18 | Claude Code 101 | [Skilljar ↗](https://anthropic-partners.skilljar.com/claude-code-101) |

---

## Badge Track

| Badge | Sections | Link |
|-------|----------|------|
| Claude Partner Badge · Claude Code | 10 (Product Foundation → Capstone → Assessment) | [Skilljar ↗](https://anthropic-partners.skilljar.com/path/partner-badge-claude-code) |

---

## Links

- [Skilljar — All Courses](https://anthropic-partners.skilljar.com/page/all-courses)
- [Anthropic Platform Docs](https://platform.claude.com/docs)
- [CCDV-F Certification Path](https://anthropic-partners.skilljar.com/path/claude-certified-developer-foundations)
- [CCAR-F Certification Path](https://anthropic-partners.skilljar.com/path/claude-certified-architect-foundations)
- [Claude Partner Badge — Claude Code](https://anthropic-partners.skilljar.com/path/partner-badge-claude-code)

---

## Exam Schedule

| Cert | Date | Check-in (IST) | Start (IST) |
|------|------|----------------|-------------|
| CCDV-F | Saturday, 19 September 2026 | 17:45 | 18:15 |
| CCAR-F | Saturday, 31 October 2026 | 13:30 | 14:00 |
