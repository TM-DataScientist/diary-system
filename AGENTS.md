# Repository Guidelines

## Project Structure & Module Organization
This repository is currently design-first (no application code yet). Core documents are:
- `doc/requirements.md`: functional requirements and ER diagram.
- `doc/screen-definition.md`: screen list, transitions, UI fields, and validation rules.
- `doc/api-spec.md`: REST API endpoints, request/response examples, and error definitions.
- `doc/test-spec.md`: test scenarios, coverage scope, and acceptance criteria.
- `CLAUDE.md`: architecture constraints and key domain rules.

Keep terminology consistent across files, especially roles (`sales`, `manager`), report status (`draft`, `submitted`), and table names (`USERS`, `DAILY_REPORTS`, etc.).

## 使用技術
- 言語: TypeScript
- フレームワーク: Next.js (App Router)
- UI コンポーネント: shadcn/ui + Tailwind CSS
- API スキーマ定義: OpenAPI (Zod による検証)
- DB スキーマ定義: Prisma.js
- テスト: Vitest
- デプロイ: Google Cloud Run

## Build, Test, and Development Commands
There is no build/runtime pipeline in the current phase. Use lightweight document checks:
- `Get-ChildItem doc\\*.md` : list editable spec files.
- `Select-String -Path doc\\*.md -Pattern "sales|manager|draft|submitted"` : quick consistency scan.
- `npx markdownlint-cli2 "**/*.md"` : optional Markdown linting (if Node tooling is available).

If executable code is added later, define canonical scripts (`test`, `lint`, `build`) and update this section immediately.

## Coding Style & Naming Conventions
- Use UTF-8 Markdown with one top-level `#` heading per file.
- Use ATX headings (`##`, `###`) and fenced code blocks with language tags (for example `json`, `mermaid`).
- Preserve API and enum identifiers exactly as specified (for example `VALIDATION_ERROR`, `/reports/:id/comments`).
- Database entities use uppercase snake_case (`VISIT_RECORDS`); API payload fields use lower_snake_case (`report_date`, `visit_order`).

## Testing Guidelines
No automated test framework is present yet. Before opening a PR, run a spec consistency review:
1. Verify validation rules in `doc/screen-definition.md` match payload constraints in `doc/api-spec.md`.
2. Verify ER relationships in `doc/requirements.md` align with endpoint behavior.
3. Verify role/permission rules are consistent in all modified files.

When implementation starts, add automated tests under `tests/` with names like `<module>.test.*`.

## Commit & Pull Request Guidelines
Git history is not available in this workspace snapshot, so use Conventional Commits:
- `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

PR requirements:
- Clear purpose and scope.
- List of changed files and impacted business rules.
- Linked issue/task.
- For UI/flow changes, include screenshots or an updated Mermaid flow.
- Explicit note for any breaking API/schema changes.
