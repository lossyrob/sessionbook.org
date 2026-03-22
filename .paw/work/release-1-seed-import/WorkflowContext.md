# WorkflowContext

Work Title: Release 1 Seed Import
Work ID: release-1-seed-import
Base Branch: main
Target Branch: feature/release-1-seed-import
Execution Mode: worktree
Repository Identity: github.com/lossyrob/sessionbook.org@6ce98832ea6115c1e41fc97781af5cdea9d8bc50
Execution Binding: worktree:release-1-seed-import:feature/release-1-seed-import
Workflow Mode: full
Review Strategy: local
Review Policy: final-pr-only
Session Policy: continuous
Final Agent Review: enabled
Final Review Mode: multi-model
Final Review Interactive: false
Final Review Models: claude-opus-4.6-1m
Final Review Specialists: all
Final Review Interaction Mode: parallel
Final Review Specialist Models: none
Final Review Perspectives: pre-mortem, post-mortem
Final Review Perspective Cap: 2
Implementation Model: none
Plan Generation Mode: single-model
Plan Generation Models: gpt-5.4
Planning Docs Review: enabled
Planning Review Mode: multi-model
Planning Review Interactive: false
Planning Review Models: claude-opus-4.6-1m
Planning Review Specialists: all
Planning Review Interaction Mode: parallel
Planning Review Specialist Models: none
Planning Review Perspectives: pre-mortem, post-mortem
Planning Review Perspective Cap: 2
Custom Workflow Instructions: Use the paw-lite flow with validated work shaping, then plan, non-interactive pre/post-mortem planning review and final review using claude-opus-4.6-1m, continue autonomously through implementation and PR unless a serious blocker appears, and validate the advisory issue text against the current repo before accepting it as spec.
Initial Prompt: Work on issue #4 in a worktree, validate the issue against the repo, copy the canonical source chart data into this repository as needed, and continue autonomously to a final PR unless blocked.
Issue URL: https://github.com/lossyrob/sessionbook.org/issues/4
Remote: origin
Artifact Lifecycle: commit-and-clean
Artifact Paths: auto-derived
Additional Inputs: /Users/rob/proj/music/Sessions
