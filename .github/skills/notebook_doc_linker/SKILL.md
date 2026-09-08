---
name: notebook_doc_linker
displayName: Notebook Doc Linker
description: >-
  Adds or fixes Jupyter notebook rendering for MkDocs lesson pages by applying
  the SS05 pattern: a notes-page button link, mkdocs-jupyter include entry, and
  paired Notes/Notebook navigation entries.
user-invocable: true
---

# Notebook Doc Linker Skill

Use this skill to make a lesson's notebook render the same way as the working
reference pattern in SS05 Chat Exercise.

## Reference Pattern (SS05)

A correctly rendered setup uses all of these:
1. A notebook button in the lesson notes page:
   `[:material-notebook-outline: Open Jupyter Notebook](../../notebooks/<file>.ipynb){ .md-button .md-button--primary }`
2. The notebook filename listed in `mkdocs-jupyter` plugin `include` in `mkdocs.yml`.
3. A `Notes` + `Notebook` pair in MkDocs `nav` for that lesson.

If any one of these is missing, notebook pages may not be generated in `site/.../notebooks/`.

## When to Invoke

Invoke when a user asks to:
- Add a notebook link to a docs lesson page
- Fix a notebook button that does not open/render correctly
- Make one section render similarly to another known-good section
- Ensure notebook pages are generated in the built site

## Procedure

1. Identify the lesson notes page and target notebook path.
2. Compare with a working lesson (default: SS05 Chat Exercise).
3. Confirm notebook file exists under the module's `notebooks/` directory.
4. Add or fix the button line in the notes page (keep relative path format).
5. Update `mkdocs.yml` plugin include:
   - Add the exact notebook filename under `plugins -> mkdocs-jupyter -> include`.
6. Update `mkdocs.yml` nav for the lesson:
   - Prefer:
     - `SSxx ...:`
     - `Notes: <lesson>/index.md`
     - `Notebook: <module>/notebooks/<file>.ipynb`
7. Validate by building docs and checking output:
   - Run `mkdocs build`
   - Confirm generated folder exists in `site/.../notebooks/<file-without-ipynb>/`

## Validation Checklist

- Notebook file exists in `docs/.../notebooks/`.
- Notes page has the material notebook button.
- `mkdocs.yml` includes notebook filename in `mkdocs-jupyter.include`.
- `mkdocs.yml` nav contains both Notes and Notebook entries.
- `site/.../notebooks/...` contains generated notebook page after build.

## Guardrails

- Do not rename existing notebook files unless explicitly asked.
- Preserve current naming conventions, even if typos exist in historical names.
- Keep link paths relative to the lesson file.
- Avoid touching unrelated nav sections.
