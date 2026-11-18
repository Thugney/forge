# forge

A Claude Code plugin that builds security, privacy and quality requirements into every piece of work, instead of leaving them to memory.

> **Status: early preview (3.0.0-preview.1).** "Preview" means a version that is not ready for daily use yet. What works today, only in projects you enroll with `/forge:enroll`: a start-of-session summary, and routing of every prompt to the right skills, controls and model. What does not exist yet: the guards that block (secrets, missing row-level security, code before an approved plan, direct pushes to `main`) and the guided phase loop. They arrive in the next phases. See the [build plan](specs/000-design/spec.md) (Norwegian).

## What it will do

- **Route every request.** A hook reads each prompt and tells the agent which skills and controls apply: UI work loads the design skills, new features and data changes load the compliance gate, and every task follows the model router.
- **Guard the work.** Hooks block secrets and new database tables without row-level access control, stop direct pushes to `main`, and refuse code changes before the plan is approved.
- **Run a guided loop.** Plan → Requirements → Design → Build → Verify → Roll out → Feedback, in small steps, with two owner approvals: scope after planning, and rollout after verification.
- **Keep evidence.** Each feature leaves an evidence record an auditor can read.

It only acts in projects you enroll with `/forge:enroll`. Everywhere else it stays silent.

## Honesty rule

forge helps you build software that is designed to meet the technical and process requirements of GDPR, ISO 27001, SOC 2 and (when relevant) HIPAA, and keeps audit evidence. It does not make anything "certified" or "compliant". Certification and attestation require an external auditor. The framework mappings in the control catalog are drafts until reviewed against the source texts.

## Install (local, preview)

```sh
claude plugin validate .
claude plugin marketplace add <path to this repo>
claude plugin install forge@thugney
```

## Design

The full design is in [specs/000-design/spec.md](specs/000-design/spec.md) (Norwegian).

## Looking for project-init v2?

forge replaces [Thugney/project-init](https://github.com/Thugney/project-init). v2 stays available at the `v2-final` tag in that repository.

## Author

Built and maintained by Eriteach. [LinkedIn](https://www.linkedin.com/in/eriteach)

## License

Apache-2.0. See [LICENSE](LICENSE).
