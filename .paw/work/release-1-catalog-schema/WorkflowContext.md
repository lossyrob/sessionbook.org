# WorkflowContext

Work Title: Release 1 Catalog Schema
Work ID: release-1-catalog-schema
Base Branch: main
Target Branch: feature/release-1-catalog-schema
Execution Mode: worktree
Repository Identity: github.com/lossyrob/sessionbook.org@6ce98832ea6115c1e41fc97781af5cdea9d8bc50
Execution Binding: worktree:release-1-catalog-schema:feature/release-1-catalog-schema
Workflow Mode: custom
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
Custom Workflow Instructions: Validate issue #3 against the merged bootstrap app, use work shaping because the issue is advisory, continue through planning, implementation, review, and PR without pausing unless a serious blocker appears.
Initial Prompt: work on issue #3 via paw-lite in a worktree, with shaping if needed, planning review and final review using non-interactive pre/post mortem Opus 4.6 1M reviewers, then create a PR.
Issue URL: https://github.com/lossyrob/sessionbook.org/issues/3
Remote: origin
Artifact Lifecycle: commit-and-clean
Artifact Paths: auto-derived
Additional Inputs: issue #3 is advisory and must be validated against the current repo state before implementation
