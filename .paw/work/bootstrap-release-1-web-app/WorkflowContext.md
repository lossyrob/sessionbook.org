# WorkflowContext

Work Title: Bootstrap Release 1 Web App
Work ID: bootstrap-release-1-web-app
Base Branch: main
Target Branch: feature/bootstrap-release-1-web-app
Execution Mode: worktree
Repository Identity: github.com/lossyrob/sessionbook.org@6ce98832ea6115c1e41fc97781af5cdea9d8bc50
Execution Binding: worktree:bootstrap-release-1-web-app:feature/bootstrap-release-1-web-app
Workflow Mode: custom
Review Strategy: local
Review Policy: milestones
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
Plan Generation Models: claude-opus-4.6-1m
Planning Docs Review: enabled
Planning Review Mode: multi-model
Planning Review Interactive: false
Planning Review Models: claude-opus-4.6-1m
Planning Review Specialists: all
Planning Review Interaction Mode: parallel
Planning Review Specialist Models: none
Planning Review Perspectives: pre-mortem, post-mortem
Planning Review Perspective Cap: 2
Custom Workflow Instructions: Validate issue #2 against the repo's existing Firebase hosting and deployment setup before treating it as the working spec. Skip interactive shaping unless a real ambiguity appears. Stop only for serious blockers. If the issue needs substantive scope changes, pause and propose amendments before implementation. Complete the implementation workflow through final PR creation in this worktree so the user only reviews the final PR.
Initial Prompt: Work on GitHub issue #2 using paw-lite in a dedicated worktree, then plan, implement, run non-interactive multi-model planning review and final review with pre-mortem and post-mortem perspectives using claude-opus-4.6-1m, and open a final PR.
Issue URL: https://github.com/lossyrob/sessionbook.org/issues/2
Remote: origin
Artifact Lifecycle: commit-and-clean
Artifact Paths: auto-derived
Additional Inputs: none
