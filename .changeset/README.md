# Changesets

A change to a published package (`@shift-stack/*`) comes with a changeset: `pnpm changeset`, pick the packages and
the kind of change, and write one line for the changelog. While SHiFT is `0.x`, a breaking change is a `minor`.

On `main`, the release workflow collects the changesets into a "Version packages" pull request. Merging it publishes
the new versions to npm.
