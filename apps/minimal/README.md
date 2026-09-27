# minimal

The smallest useful app on [SHiFT](../../shift/core): Tailwind and nothing else. Copy it to start your own.

```
pnpm dev:minimal     # from the repo root: http://localhost:3001 (Vite on 5174)
```

| File                          | What it is                                                                |
| ----------------------------- | ------------------------------------------------------------------------- |
| `src/config.ts`               | where SHiFT finds the views, the browser entry and the stylesheet         |
| `src/server/app.ts`           | the routes: two pages, two forms, a 404                                   |
| `src/server/dev.ts`, `prod.ts`| the server in development (Vite) and production (built bundle)            |
| `src/views/`                  | server-rendered Svelte: the layout, the pages, the fragments forms answer with |
| `src/islands/`                | what the browser hydrates: `Dialog`, and `entry.ts`, which starts SHiFT    |

It shows the two halves of the idea:

- **State lives on the server.** The click counter is a form. Each click is a request, and the server answers with
  the form showing the new count. Reload, and the count is still there.
- **An island only owns the interaction.** `Dialog` opens and closes. What is inside it is server HTML, passed in as a
  slot: the greeting form, which the server answers in place, with a 422 and the error when the name is missing.

`pnpm --filter @shift-stack/minimal build`, then `start`, runs it as in production.
