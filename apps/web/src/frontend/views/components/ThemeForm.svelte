<script lang="ts">
  import * as ToggleGroup from "@todos/ui/toggle-group"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"
  import { themes, type Theme } from "#shared/theme.ts"

  // Appearance, in the settings sheet: a segmented control that posts every change. The server keeps the choice
  // (a cookie), answers with this form as it now stands, and tells the page to apply the theme.
  let { theme }: { theme: Theme } = $props()

  const labels: Record<Theme, () => string> = { system: m.theme_system, light: m.theme_light, dark: m.theme_dark }
</script>

<form hx-post={localizeHref("/settings/theme")} hx-trigger="change" hx-target="this" hx-swap="outerHTML">
  <ToggleGroup.Radios variant="segmented" aria-labelledby="appearance-label">
    {#each themes as option (option)}
      <ToggleGroup.Radio name="theme" value={option} checked={option === theme}>{labels[option]()}</ToggleGroup.Radio>
    {/each}
  </ToggleGroup.Radios>
</form>
