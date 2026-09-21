# Graph Report - ToDoListReact  (2026-09-21)

## Corpus Check
- Corpus is ~45,589 words - fits in a single context window. You may not need a graph.

## Summary
- 677 nodes · 1204 edges · 34 communities (31 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 55 edges (avg confidence: 0.86)
- Token cost: 521,139 input · 0 output

## Community Hubs (Navigation)
- shadcn UI Primitives
- Menu & Overlay Components
- Caveman Prose Compression Skills
- Caveman Cloud Spend Observability
- Compression Validator & Benchmark
- Workflow Skills & Feature Design Specs
- App Shell, Routing & Pages
- Package Manifest & Tooling Deps
- Runtime Dependencies
- shadcn Component Registry Config
- App TypeScript Compiler Config
- Compress CLI & File-Type Detection
- Auth Context & Mock Auth Backend
- Claude Compression Orchestrator
- Node TypeScript Compiler Config
- Caveman Core Rules & Agent Interfaces
- Cross-Session File Locking & Backups
- Prompt Building & Code-Block Masking
- Dev Dependencies
- Skill-File Test Harness
- Social Icon Sprite Sheet
- caveman-explore Package Manifest
- caveman-learn Package Manifest
- Favicon Task-List Identity
- Background Wallpaper Asset
- Chatgpt.svg Logo Asset
- Atomic File Writes
- NPM Scripts
- Vite Build Config
- Root TypeScript Project Refs
- Tailwind Class Merge Util
- Lock Timeout Error
- Compress Scripts Package Init
- Vercel SPA Rewrites

## God Nodes (most connected - your core abstractions)
1. `cn()` - 80 edges
2. `react` - 24 edges
3. `compilerOptions` - 19 edges
4. `_compress_file_locked()` - 18 edges
5. `@base-ui/react` - 17 edges
6. `compilerOptions` - 15 edges
7. `validate()` - 14 edges
8. `useAuth()` - 13 edges
9. `Button()` - 12 edges
10. `AuthProvider()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Full Migration to dnd-kit (single drag engine)` --semantically_similar_to--> `migration skill`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-09-09-multi-select-drag-design.md → .agents/skills/migration/SKILL.md
- `Full Migration to dnd-kit (single drag engine)` --semantically_similar_to--> `Behavior-Preservation Boundary`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-09-09-multi-select-drag-design.md → .agents/skills/safe-refactor/SKILL.md
- `Manual Verification Pass (auth)` --semantically_similar_to--> `Smallest Sufficient Proof Set`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-08-24-auth-flow-design.md → .agents/skills/verify-and-stop/SKILL.md
- `Search/Filter Lock During Selection Mode` --semantically_similar_to--> `canReorder Constraint (no reorder while filtered/searched)`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-09-09-multi-select-drag-design.md → README.md
- `index.html App Shell` --conceptually_related_to--> `To-Do List React (project README)`  [INFERRED]
  index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Caveman Cloud spend observability pipeline** — _agents_skills_caveman_setup_skill_caveman_setup, _agents_skills_caveman_discover_skill_caveman_discover, _agents_skills_caveman_evidence_review_skill_caveman_evidence_review, _agents_skills_caveman_optimize_skill_caveman_optimize, _agents_skills_caveman_manage_skill_caveman_manage [EXTRACTED 1.00]
- **Evidence-honesty discipline across Caveman skills** — _agents_skills_caveman_evidence_review_skill_separate_cost_buckets, _agents_skills_caveman_manage_skill_verified_savings, _agents_skills_caveman_optimize_skill_no_tokens_to_dollars, _agents_skills_caveman_setup_skill_record_mode, _agents_skills_caveman_stats_readme_rule_overhead_net, _agents_skills_caveman_learn_skill_evidence_rungs [INFERRED 0.85]
- **Terse-output caveman skill family** — _agents_skills_caveman_commit_skill_caveman_commit, _agents_skills_caveman_review_skill_caveman_review, _agents_skills_caveman_compress_skill_caveman_compress, _agents_skills_caveman_help_skill_caveman_modes, _agents_skills_cavecrew_skill_cavecrew_skill [EXTRACTED 1.00]
- **Disciplined Agent Workflow Skill Suite** — _agents_skills_investigate_first_skill_investigate_first, _agents_skills_lean_build_skill_lean_build, _agents_skills_migration_skill_migration, _agents_skills_safe_refactor_skill_safe_refactor, _agents_skills_surgical_patch_skill_surgical_patch, _agents_skills_verify_and_stop_skill_verify_and_stop [INFERRED 0.85]
- **Backend-Free Auth Flow Design** — docs_superpowers_specs_2026_08_24_auth_flow_design_mock_backend_module, docs_superpowers_specs_2026_08_24_auth_flow_design_auth_context_adapter, docs_superpowers_specs_2026_08_24_auth_flow_design_password_hashing, readme_protected_route_guarding, readme_per_user_task_scoping, readme_guest_mode [INFERRED 0.85]
- **Multi-Select Group Drag Flow** — docs_superpowers_specs_2026_09_09_multi_select_drag_design_selection_mode, docs_superpowers_specs_2026_09_09_multi_select_drag_design_context_menu_select, docs_superpowers_specs_2026_09_09_multi_select_drag_design_floating_action_bar, docs_superpowers_specs_2026_09_09_multi_select_drag_design_group_reinsert_block, readme_drag_overlay_clone [EXTRACTED 1.00]

## Communities (34 total, 3 thin omitted)

### Community 0 - "shadcn UI Primitives"
Cohesion: 0.05
Nodes (85): @base-ui/react, class-variance-authority, lucide-react, react, @remixicon/react, src_assets_chatgpt, AnalyticsDashboard(), AnalyticsDashboardProps (+77 more)

### Community 1 - "Menu & Overlay Components"
Cohesion: 0.05
Nodes (18): cn, ContextMenu(), ContextMenuContent(), ContextMenuItem(), ContextMenuTrigger(), DropdownMenu(), DropdownMenuContent(), DropdownMenuGroup() (+10 more)

### Community 2 - "Caveman Prose Compression Skills"
Cohesion: 0.06
Nodes (40): cavecrew (delegation decision guide), cavecrew-builder subagent, cavecrew-investigator subagent, cavecrew-reviewer subagent, Per-agent model override env vars, Auto-clarity escape hatch, cavecrew SKILL decision matrix, Main-context budget preservation via compressed subagent results (+32 more)

### Community 3 - "Caveman Cloud Spend Observability"
Cohesion: 0.07
Nodes (40): caveman-discover skill, Label at callers, never the shared helper, Propose table, apply after consent, Workflow slug grammar, Workflow label (x-cave-workflow), caveman-evidence-review skill, Metadata-only reads, no payload retrieval, Separate cost buckets (measured/inferred/verified/evidence) (+32 more)

### Community 4 - "Compression Validator & Benchmark"
Cohesion: 0.09
Nodes (32): benchmark_pair(), count_tokens(), main(), print_table(), Path, count_bullets(), extract_code_blocks(), extract_fenced_spans() (+24 more)

### Community 5 - "Workflow Skills & Feature Design Specs"
Cohesion: 0.07
Nodes (37): Migration OpenAI Agent Interface, Expand-Migrate-Verify-Contract Sequence, migration skill, Safe Refactor OpenAI Agent Interface, Behavior-Preservation Boundary, safe-refactor skill, Verify and Stop OpenAI Agent Interface, Smallest Sufficient Proof Set (+29 more)

### Community 6 - "App Shell, Routing & Pages"
Cohesion: 0.12
Nodes (20): motion, react-dom, react-router-dom, App(), AnimatedHeight(), AppShell(), NAV_ITEMS, NavMenubar() (+12 more)

### Community 7 - "Package Manifest & Tooling Deps"
Cohesion: 0.09
Nodes (25): name, private, type, version, bootstrap, date-fns, @dnd-kit/core, @dnd-kit/sortable (+17 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.08
Nodes (24): dependencies, @base-ui/react, bootstrap, class-variance-authority, clsx, cn, date-fns, @dnd-kit/core (+16 more)

### Community 9 - "shadcn Component Registry Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "App TypeScript Compiler Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+12 more)

### Community 11 - "Compress CLI & File-Type Detection"
Cohesion: 0.16
Nodes (17): main(), print_usage(), Caveman Compress CLI Usage: caveman <filepath>, detect_file_type(), _is_code_line(), _is_json_content(), _is_yaml_content(), Path (+9 more)

### Community 12 - "Auth Context & Mock Auth Backend"
Cohesion: 0.29
Nodes (18): AuthContext, AuthContextValue, AuthProvider(), changePassword(), continueAsGuest(), deleteAccount(), getGuestSession(), getSession() (+10 more)

### Community 13 - "Claude Compression Orchestrator"
Cohesion: 0.12
Nodes (17): call_claude(), Caveman Memory Compression Orchestrator Usage: python scripts/compress.py…, r"""Strip an outer ```markdown ... ``` fence when it wraps the ENTIRE output.…, Send a prompt to Claude. Prefers the Anthropic SDK when ANTHROPIC_API_KEY is…, strip_llm_wrapper(), contextlib, errno, fcntl (+9 more)

### Community 14 - "Node TypeScript Compiler Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 15 - "Caveman Core Rules & Agent Interfaces"
Cohesion: 0.15
Nodes (16): Caveman README Overview, Auto-Clarity Rule, caveman skill, Caveman Intensity Levels (lite/full/ultra/wenyan), No Invented Abbreviations or Arrows, Caveman Prose Boundaries (commits, docs, issues stay normal), ASD-STE100 Clarity Register, caveman-stats skill (+8 more)

### Community 16 - "Cross-Session File Locking & Backups"
Cohesion: 0.17
Nodes (16): backup_dir_for(), compress_file(), file_lock(), is_sensitive_path(), lock_path_for(), Path, Out-of-tree backup dir for filepath, keyed by its parent dir name — kept…, Cross-session lock path keyed on the same (parent-dir-name, stem) identity… (+8 more)

### Community 17 - "Prompt Building & Code-Block Masking"
Cohesion: 0.12
Nodes (16): build_compress_prompt(), build_fix_prompt(), _compress_file_locked(), first_nonblank_line(), _is_smaller_than_body(), mask_code_blocks(), Read a source file as UTF-8, returning (text, line_terminator, raw_bytes).…, Return the first non-blank line, stripped — used to detect a prose preamble… (+8 more)

### Community 18 - "Dev Dependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/node, @types/react (+5 more)

### Community 19 - "Skill-File Test Harness"
Cohesion: 0.23
Nodes (8): md, skillFile, skill, ref_node_assert, ref_node_fs, ref_node_path, ref_node_test, ref_node_url

### Community 20 - "Social Icon Sprite Sheet"
Cohesion: 0.31
Nodes (11): Purple Accent Stroke Style (#aa3bff), Bluesky Icon (butterfly glyph), Brand Social Link Set, Discord Icon (game controller face), Documentation Icon (code brackets on page), GitHub Icon (Octocat mark), Social Icon (user with star badge), Icons SVG Sprite Sheet (+3 more)

### Community 21 - "caveman-explore Package Manifest"
Cohesion: 0.20
Nodes (9): description, files, license, name, private, scripts, test, type (+1 more)

### Community 22 - "caveman-learn Package Manifest"
Cohesion: 0.20
Nodes (9): description, files, license, name, private, scripts, test, type (+1 more)

### Community 23 - "Favicon Task-List Identity"
Cohesion: 0.36
Nodes (9): Browser Tab Brand Identity, Checkmark Glyph (completed task), Jam Icons / SVG Repo Provenance, Monochrome Black Fill (#000000), Rounded Square Badge Shape, App Favicon (task-list SVG), Task List Icon Concept, Three Rounded Text-Line Bars (+1 more)

### Community 24 - "Background Wallpaper Asset"
Cohesion: 0.43
Nodes (8): Background.svg Wallpaper Asset, Abstract Rounded Geometric Composition, App Backdrop / Page Background Role, Grayscale Gradient Palette (#F5F5F5 to #A0A0A0 on #EDEEEE), Adobe Illustrator 27.5.0 SVG Export, Twelve Clip-Path Linear Gradient Shapes, Neutral Minimal Visual Identity, Wide 7000x4000 ViewBox Canvas

### Community 25 - "Chatgpt.svg Logo Asset"
Cohesion: 0.33
Nodes (7): Todo App Branding / Logo Usage, Checkmark Completion Motif, Chatgpt.svg Asset, Jam Icons Icon Set, Claimed ChatGPT/OpenAI Branding, SVG Repo Provenance, Filled Task List Glyph

### Community 26 - "Atomic File Writes"
Cohesion: 0.40
Nodes (6): Write ``text`` to ``path`` atomically as UTF-8. Path.write_text() truncates the…, Write ``data`` to ``path`` atomically, preserving permission bits., Write to the target file, surfacing the backup location if the write itself…, write_bytes_atomic(), _write_target(), write_text_atomic()

### Community 27 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 28 - "Vite Build Config"
Cohesion: 0.40
Nodes (4): @tailwindcss/vite, vite, @vitejs/plugin-react, dirname

### Community 29 - "Root TypeScript Project Refs"
Cohesion: 0.40
Nodes (4): compilerOptions, paths, files, references

### Community 31 - "Lock Timeout Error"
Cohesion: 0.67
Nodes (3): LockTimeoutError, Raised when another process holds the compress lock past LOCK_WAIT_SECONDS., TimeoutError

## Ambiguous Edges - Review These
- `Fixture compression benchmarks (~46%)` → `Snyk High Risk rating explanation`  [AMBIGUOUS]
  .agents/skills/caveman-compress/README.md · relation: conceptually_related_to
- `Monochrome Black Fill (#000000)` → `Browser Tab Brand Identity`  [AMBIGUOUS]
  public/favicon.svg · relation: conceptually_related_to
- `Icons SVG Sprite Sheet` → `Unused Starter-Template Asset`  [AMBIGUOUS]
  public/icons.svg · relation: conceptually_related_to
- `Social Icon (user with star badge)` → `Brand Social Link Set`  [AMBIGUOUS]
  public/icons.svg · relation: conceptually_related_to
- `Abstract Rounded Geometric Composition` → `Neutral Minimal Visual Identity`  [AMBIGUOUS]
  src/assets/Background.svg · relation: semantically_similar_to
- `Chatgpt.svg Asset` → `Claimed ChatGPT/OpenAI Branding`  [AMBIGUOUS]
  src/assets/Chatgpt.svg · relation: references

## Knowledge Gaps
- **163 isolated node(s):** `name`, `version`, `license`, `private`, `type` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 283 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Fixture compression benchmarks (~46%)` and `Snyk High Risk rating explanation`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Monochrome Black Fill (#000000)` and `Browser Tab Brand Identity`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Icons SVG Sprite Sheet` and `Unused Starter-Template Asset`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Social Icon (user with star badge)` and `Brand Social Link Set`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Abstract Rounded Geometric Composition` and `Neutral Minimal Visual Identity`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Chatgpt.svg Asset` and `Claimed ChatGPT/OpenAI Branding`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `react` connect `shadcn UI Primitives` to `Menu & Overlay Components`, `Auth Context & Mock Auth Backend`, `App Shell, Routing & Pages`, `Package Manifest & Tooling Deps`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._