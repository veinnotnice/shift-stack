# shift-stack

SHiFT, an open-source stack (`shift/`, published as `@shift-stack/*`), and apps built on it:
Todos (`apps/web`), the demo app SHiFT grew out of, and a minimal starter (`apps/minimal`).

Todos is a mobile-only web app on SHiFT (Svelte + Hypermedia + islands + eFfect + TypeScript, `shift/core`): a Node
server on Effect renders Svelte 5 views to HTML, HTMX swaps them, and Svelte islands add the interactive parts.
It is designed to look and feel like an iOS app.

## Structure

A pnpm workspace: `shift/` is the open-source stack (published to npm), `packages/` are this app's libraries,
`apps/` are what gets run and deployed.

```
shift/
├── core/                @shift-stack/core: the stack itself, publishable, knows nothing of this app. See its README.
├── paraglide/           @shift-stack/paraglide: the i18n plugin for SHiFT (locale prefix, locale in views).
└── e2e/                 private: a fixture app on SHiFT and Playwright tests against it (`pnpm e2e`, port 4310).
packages/
├── domain/              @testin/domain: business rules, Schema types and pure functions. No I/O, depends on nothing.
├── data/                @testin/data: what is stored, as interfaces (Context.Tag). No implementation here.
├── services/            @testin/services: use cases as Effect services. Depend on data interfaces only.
├── storage-memory/      @testin/storage-memory: the data interfaces in memory (Ref). A database later is a sibling.
└── ui/                  @testin/ui: the design system.
    ├── src/components/  shadcn-svelte primitives, restyled to Apple level (see below).
    ├── src/lib/         utils (cn) and hooks the primitives use.
    └── src/styles/      globals.css: tokens, text styles, iOS building blocks.
apps/
├── minimal/             @shift-stack/minimal: the starter. SHiFT and Tailwind only, no design system (`pnpm dev:minimal`).
└── web/                 @testin/web: Todos, the demo app. the server and its pages. messages/ and project.inlang/ (i18n) live here.
    └── src/
        ├── backend/
        │   ├── http/      transport: app.ts wraps the routes in SHiFT, plugins (i18n.ts, theme.ts), routes/.
        │   ├── rendering/ respond.ts: `page` and `fragment`, typed by the views.
        │   └── main/      composition root: the only place layers are wired together. dev.ts, prod.ts, serve.ts.
        ├── frontend/
        │   ├── config.ts  where the views, client entry and stylesheet are, for SHiFT (Vite and the server).
        │   ├── views/     server-rendered Svelte: pages/, components, shell. index.ts is `createViews(…)`.
        │   ├── islands/   Svelte components the browser hydrates. entry.ts calls SHiFT's `start`.
        │   ├── lib/       app helpers (dates, list styles, nav icons).
        │   └── styles/    app.css: imports @testin/ui/globals.css.
        └── shared/        used by both sides: paraglide/ (generated i18n), theme.ts.
```

### Imports

- **Another package:** by name and module, without extension: `@testin/domain/task`, `@testin/services/TaskService`,
  `@testin/storage-memory`, `@testin/ui/button`, `@testin/ui/utils`, `@shift-stack/core/server`. What a package offers is its `exports` in
  `package.json`. A package's tests import it the same way.
- **Inside a package:** no relative imports out of a folder. Other folders go through the package's subpath imports
  (`imports` in its `package.json`): `#backend/…`, `#frontend/…`, `#shared/…`, `#lib/…` in `apps/web`; `#ui/…` and
  `#lib/…` in `packages/ui`. Only files in the same folder use `./file.ts`.
- `#` imports are read by Node, Vite and TypeScript alike, so there are no aliases to keep in sync. The one copy is
  the `paths` in `packages/ui/tsconfig.json`, which the shadcn-svelte CLI needs.
- **Dependencies:** each package lists what it imports. In `apps/web`, `dependencies` are what the server loads at
  runtime; everything else (workspace packages included) is bundled into `dist/server`.

### Backend rules

- **Dependencies point inward:** `http` → `services` → `data` (interfaces) ← `storage-memory`. `domain` is used by
  all of them and uses none of them. The package dependencies say the same: a package can only import what its `package.json` lists
  (`services` has `storage-memory` as a dev dependency, for its tests only).
- **No reaching through:** routes never touch a repository, services never know how data is stored. Swapping the
  storage means a new package next to `packages/storage-memory` and one line in `apps/web/src/backend/main/`.
- **Errors are values:** services fail with tagged errors from `@testin/domain/errors`; `http/` maps them to responses.
- **Time is injected:** anything about "today" or "overdue" reads Effect's `Clock`, so tests can fix the date.
- **Tests per layer**, in each package's `tests/`: domain as pure functions, services against the in-memory
  layer with a fixed clock, http through the web handler (`apps/web/tests`).
- **No database yet.** All data lives in memory behind the `@testin/data` interfaces.

## Design: Apple level, from the primitive up

**Rule 1: if shadcn-svelte has it, use it.** Checkbox, input, toggle, sheet, dialog, … come from the CLI, also in
server-rendered views (they render to plain markup; HTMX attributes pass through). Hand-build only what shadcn
does not have, and check the registry before writing a control yourself. In a server-rendered form, a control must
work without JavaScript: Bits UI controls that keep their state in Svelte (toggle group, …) are only for islands;
the form uses the native-input form of the same primitive (`ToggleGroup.Radios` / `Radio`), which looks the same.

**Rule 2: a shadcn-svelte component is never used as it comes out of the CLI.**

Every time a component is pulled in with `pnpm dlx shadcn-svelte@1.7.0 add <name>` (run in `packages/ui`):

1. **Restyle the primitive first**, in `packages/ui/src/components/<name>/`, until it looks and behaves like the
   iOS / iPadOS counterpart (Apple Human Interface Guidelines, current iOS). Change the variant and class strings
   in the component itself, for every variant and size, in light and dark.
2. **Only then use it.** Screens use the primitive with its variants and sizes. They do not patch its look with
   extra classes at the call site (layout classes such as `w-full` are fine).
3. **Check it** on screenshots at iPhone size (393×852), light and dark, before building on it.

The CLI can overwrite files: back up `packages/ui/src/components` first and restore any existing file it changed.
A component that has not been through step 1 is not used anywhere, not even temporarily.

### What Apple level means here

- **Colours:** the iOS system palette in `packages/ui/src/styles/globals.css` (`systemGroupedBackground`, `systemBlue`,
  label and separator greys, …) as `light-dark()` tokens under shadcn's names. No other colours.
- **Type:** the system font (SF Pro on Apple devices) and Apple's text styles as utilities: `text-large-title`,
  `text-title2`, `text-headline`, `text-body`, `text-callout`, `text-subheadline`, `text-footnote`,
  `text-caption2`. No ad-hoc font sizes.
- **Building blocks:** inset grouped lists (`ios-list`, `ios-row`, `ios-section-header`, `ios-section-footer`,
  and `apps/web/src/frontend/views/List.svelte`), bar material (`glass`), squircle corners where the browser supports them.
- **One shape per kind of thing.** Every button comes from `@testin/ui/button` and is a capsule; variants only change the
  fill (`default`, `secondary`, `tinted`, `neutral`, `glass`, `plain`, `destructive`). Two buttons never disagree
  on their rounding. Lists, sheets and alerts use Apple's continuous corners.
- **Quiet chrome.** Top bar items are plain grey glyphs (`neutral`), no circles or fills behind them. The top bar
  is transparent until content scrolls under it. Blue is for actions and selection, not decoration.
- **Motion like iOS:** sheets slide and close with their own animation, also when navigating. No page transitions
  (the View Transitions API is not used).

## How the pieces talk

- **SHiFT stays generic.** Nothing in `shift/` may import the app, its packages, Paraglide or the design
  system. What only this app wants (theme, toasts, time zone, chrome) lives in `apps/web`; if SHiFT lacks a hook
  for it, add a general one to SHiFT (and its README), not an app special case.
- **Views** are rendered only on the server: `views/index.ts` default-exports `createViews(…)`, which also renders
  every island into its placeholder, so islands are on the page before any JavaScript.
- **Islands are not small apps.** An island owns only what happens in the browser while it happens (a sheet opening,
  a filter while typing, a drag). What it shows and sends is server HTML passed in as slots (`<Island>`'s children
  and named snippets, see SHiFT's README); HTMX owns inside a slot. Props say how the island behaves, never the
  application's data. An island doesn't build requests: its slot holds a form, which it fills in and submits
  (`requestSubmit`). The server answers with HTML, a 422 form with its errors included. The app defines its islands in
  `frontend/islands/`; the generic `Sheet` wraps every sheet. The one exception is `MonthCalendar`, which gets its
  day marks as props because they are drawn inside the shadcn Calendar's cells.
- **Islands** must render on the server too: no `document` or HTMX at import time, props must be JSON-safe. For
  SHiFT's constants they import `@shift-stack/core` (never `/client`, which loads HTMX).
- **HTMX** owns the content target (`contentTarget`, `#htmx-content`). The top bar and tab bar come along with each
  page swap out of band (`outOfBand` in the layout); the sidebar and toaster live once in the shell.
- **Layouts:** pages render in the `app` layout (`Shell.svelte`, with the bars) unless `pageLayouts` in
  `views/index.ts` says otherwise. The error pages use `bare` (`Bare.svelte`): no bars, one way back. Crossing
  layouts swaps the whole body; SHiFT handles that.
- **Plugins** come in halves: a `ServerPlugin` middleware in the pipe in `http/app.ts` puts data into the view
  context, and a `ViewPlugin` in `views/index.ts` reads it. i18n is `@shift-stack/paraglide`; theme is the
  app's own pair (`http/theme.ts`, `views/theme.ts`).
- **i18n:** Paraglide, in `apps/web` (`messages/en.json`, `messages/de.json`, options in `paraglide.config.ts`).
  Every string goes through a message; dates and numbers through message formatters. Both locales get every key.
  Routes get the locale from `#backend/http/i18n.ts` and links from SHiFT's `href`.
- **Theme:** automatic / light / dark in a cookie that the server sets (`POST /settings/theme`), rendered as
  `<html data-theme>`. The page previews a pick at once and applies it again on the server's `theme` event.

## Commands

`pnpm dev` · `pnpm dev:minimal` · `pnpm check` · `pnpm test` · `pnpm build` · `pnpm start` · `pnpm e2e`, from the root. `check` and `test` run in
every package (`pnpm -r`); `e2e` runs SHiFT's browser tests; the others run `apps/web`. One package alone: `pnpm --filter @testin/services test`.

Commit on `main`.
