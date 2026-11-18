# Contributing

## Workflow

1. Open an issue describing the change and why.
2. Branch from `main`: `feat/<short-name>`, `fix/<short-name>` or `docs/<short-name>`.
3. Keep commits small and use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `test:`, `chore:`).
4. Open a pull request that links the issue (`Closes #n`) and shows evidence: the commands you ran and their output.
5. CI must be green. Changes are squash-merged.

## Rules

- Spec first: changes to behaviour start with an approved spec under `specs/`.
- No runtime dependencies in hook scripts. Node built-ins only.
- Every hook fails open on its own errors.
- Tests use synthetic data only. Build fake secrets at runtime in the test; never commit a key-like string.
- User-facing hook messages are plain language.

## Tests

```sh
npm test
claude plugin validate .
```
