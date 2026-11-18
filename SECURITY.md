# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Use GitHub's private vulnerability reporting: the **Security** tab → **Report a vulnerability**.

You can expect an acknowledgement within 7 days. Fixes are released as a new plugin version and noted in the changelog.

## Scope

forge runs hook scripts locally inside Claude Code sessions. Reports about hooks that can be bypassed, leak secret values in their output, or block a session when they should fail open are in scope.

## Design principles

- Hooks never print secret values, only file, line and rule.
- Hooks have no runtime dependencies and make no network calls.
- A crashing hook fails open with a warning, except the explicit block checks.
