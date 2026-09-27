# Contributing

Thanks for looking. Issues and pull requests are welcome, small ones especially.

## Setup

Node 24 and pnpm 10.

```
pnpm install
pnpm check      # types, in every package
pnpm test       # unit tests, in every package
pnpm e2e        # SHiFT in a real browser (Playwright, Chromium)
```

The first `pnpm e2e` may ask you to run `pnpm --filter @shift-stack/e2e exec playwright install chromium`.

## Where things go

- **`shift/`** is the library. It knows nothing of the apps: nothing in it imports an app, a design system or
  Paraglide (except `shift/paraglide`, which exists for that). When an app needs something SHiFT lacks, add a general
  hook to SHiFT and document it in its README, instead of a special case.
- **`shift/e2e`** tests what only a browser shows: hydration, navigation and back, swaps, slots, overlapping requests.
  A change to the client (`shift/core/src/client`) or to how islands render wants a test there.
- **`apps/`** are users of SHiFT. `apps/minimal` stays minimal: SHiFT and Tailwind only.

## The ideas to keep

- The server owns the state; an island owns only what happens in the browser while it happens. An island gets server
  HTML as slots and never builds requests of its own: a form in its slot does.
- Everything a view renders must work without JavaScript first. Islands render on the server too.
- Errors are values (Effect) until the HTTP edge maps them to responses.

## Pull requests

- One change per pull request, with a test where it can have one.
- `pnpm check` and `pnpm test` pass; `pnpm e2e` too when the client or the views changed.
- Commit messages in English, imperative mood, saying what changes and why.
- The public API of a package is its `exports`. Changing it is a breaking change, even in `0.x`: say so in the PR.
