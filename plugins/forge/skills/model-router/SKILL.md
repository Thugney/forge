---
name: model-router
description: Choose the right Claude model (Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5) following Anthropic's official model guide, for the session and every subagent. Use when starting or planning any coding, app, website or research task, when spawning subagents, or when asked which model to use.
---

# Model router — Anthropic's official guide

Source: Anthropic's "Which Claude model should you use?" and "Your team's guide to the Claude models".

In this file `<plugin>` is the plugin name from the plugin's `plugin.json`. The three agents ship with the plugin, so their full names are `<plugin>:architect`, `<plugin>:builder` and `<plugin>:explorer`. The hook text writes the full names for you.

## The rule

1. **Start with Opus 5.5.** It's a good place to start for everyday work and coding.
2. **Move up to Fable 5.2** if the work is ambitious and open-ended.
3. **Move down to Sonnet 5.5** if Opus is breezing through the work.
4. **Use Haiku 5.5** for high-volume work and subagents.

## Official guide

| Model | Alias | Anthropic: use it for |
|---|---|---|
| Fable 5.2 | `fable` | The hardest, most open-ended projects, and the most capable model for long-horizon work: large migrations, architecture planning, exhaustive market analysis |
| Opus 5.5 | `opus` | Everyday coding and knowledge work: release debugging, financial research, contract redlining, full reports |
| Sonnet 5.5 | `sonnet` | Well-scoped work when speed and usage matter: scoped analysis, one-pagers, SQL, simple bug fixes |
| Haiku 5.5 | `haiku` | High-volume work and subagents (the fastest model): routing, classification, support chat |

Mythos 5.2 appears in the guide (for cybersecurity and advanced biology work) but isn't publicly available. Never route to it.

## Applied to app and website development

These examples apply the guide to app and website work. They aren't part of Anthropic's text.

- **Fable**: designing a new app's architecture from scratch, framework or stack migrations, a full multi-day build, redesigning the data model across the whole stack, and the hard reasoning on top of research (turning findings into an architecture or strategy decision). Never use Fable to run web searches or collect facts.
- **Opus**: building features in an existing app, debugging a release, refactors, integrations (auth, payments, APIs), code review, full docs and reports.
- **Sonnet**: a single component or page, CSS/layout fixes, simple bug fixes, SQL queries, tests for a known function, a landing-page one-pager, scoped analysis.
- **Haiku**: codebase search, reading and summarizing many files, classifying issues or logs, routing, and subagent fan-out.

## Research and web search

Collecting information is not architecture work, even when the topic is big.

- Web search, fetching docs, price lists and competitor pages → **Sonnet** subagent (`general-purpose` with `model: sonnet`). Bulk fetching or summarizing many pages → **Haiku**.
- Weighing the findings and writing the recommendation → **Opus** in the main session.
- Only when the findings must become an architecture plan, a migration or a long-horizon build → hand the gathered facts to **Fable** (`<plugin>:architect`). Fable gets the facts; it doesn't go searching for them.
- Never send web research to the architect agent.

## Deciding

- Is it mechanical and high-volume? → Haiku
- Is it well-scoped, clear spec, easy to verify? → Sonnet
- Is it ambitious, open-ended, long-horizon? → Fable
- Otherwise → Opus

If a subagent fails twice or its output is shallow, re-run it one tier up.

## What you can and can't control

- **You cannot switch the model of the current session.** Only the user can: `/model fable|opus|sonnet|haiku` in Claude Code, or the model picker in the Claude app.
- **In Claude Code**, always set the model explicitly when spawning subagents:
  - `<plugin>:explorer` (haiku): search, map, read, classify
  - `<plugin>:builder` (sonnet): well-scoped implementation
  - `<plugin>:architect` (fable): architecture plans, migrations, exhaustive analysis
  - Everyday Opus work stays in the main session.
- **In the Claude app**, there are no subagents here: only recommend.

## Recommending a switch

At the start of a substantial task, if the current model clearly doesn't match the guide, say so in one line, for example:
"This is a well-scoped fix, so Anthropic's guide points to Sonnet: `/model sonnet`."

Recommend once per task, never every turn. If the user keeps their model, respect it.

## Session defaults (context cap and starting model)

- Starting model: `opus` (set in `~/.claude/settings.json`).
- Context cap: `autoCompactWindow` = 400000 for every model (never run on the 1M window). It is set per model in `settings.json` under `modelSettings`: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-fable-5-2`, `claude-haiku-5-5`.
- A skill cannot change these itself. Only `settings.json` does, and it applies at session start.
- At the start of a task, if the user asks you to verify, read `~/.claude/settings.json` and report whether `model` is `opus` and each model has `autoCompactWindow` 400000. If a value is missing or wrong, say so once and offer to fix the file.
