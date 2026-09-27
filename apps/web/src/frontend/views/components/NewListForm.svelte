<script lang="ts">
  import { listColors, listIcons as iconNames, type ListColor, type ListIcon } from "@todos/domain/list"
  import { buttonVariants } from "@todos/ui/button"
  import { Input } from "@todos/ui/input"
  import * as ToggleGroup from "@todos/ui/toggle-group"
  import { listColor, listIcons } from "#lib/list-style.ts"
  import { m } from "#shared/paraglide/messages.js"
  import { localizeHref } from "#shared/paraglide/runtime.js"

  // Reminders' "New List", inside the Sheet island: a name, a colour, a symbol. A plain form the server answers:
  // it creates the list and takes the app there, or sends this form back (422) with what it could not accept.
  let {
    name = "",
    color = "blue",
    icon = "list",
    invalid = false
  }: { name?: string; color?: ListColor; icon?: ListIcon; invalid?: boolean } = $props()

  // The preview (the chosen symbol in the chosen colour) follows the radios by CSS alone.
  const previewRules = [
    ...listColors.map((option) => `#new-list:has([name=color][value=${option}]:checked){--swatch:${listColor(option)}}`),
    ...iconNames.map((option) => `#new-list:has([name=icon][value=${option}]:checked) [data-preview=${option}]{display:block}`)
  ].join("")
</script>

{@html `<style>${previewRules}</style>`}

<!-- data-sheet-close: the sheet closes once the server accepts the list. -->
<form id="new-list" data-sheet-close hx-post={localizeHref("/lists")} hx-target="this" hx-swap="outerHTML" style="--swatch: {listColor(color)}">
  <div class="grid grid-cols-[5.5rem_1fr_5.5rem] items-center px-4 pt-3 pb-2">
    <button type="button" data-sheet-close class={[buttonVariants({ variant: "plain", size: "sm" }), "justify-self-start px-0 text-[17px] font-normal"]}>
      {m.cancel()}
    </button>
    <h2 class="text-center text-[17px] font-semibold tracking-tight">{m.new_list()}</h2>
    <button type="submit" class={[buttonVariants({ variant: "plain", size: "sm" }), "justify-self-end px-0 text-[17px]"]}>
      {m.create()}
    </button>
  </div>

  <div class="flex flex-col gap-6 px-4 pt-3 pb-4">
    <div class="grid place-items-center pt-1" aria-hidden="true">
      {#each iconNames as option (option)}
        {@const Icon = listIcons[option]}
        <Icon data-preview={option} class="hidden size-14 text-(--swatch)" strokeWidth={1.8} />
      {/each}
    </div>

    <div class="flex flex-col gap-2">
      <Input
        name="name"
        value={name}
        required
        maxlength={60}
        pattern=".*\S.*"
        placeholder={m.list_name()}
        aria-label={m.list_name()}
        aria-invalid={invalid || undefined}
        autocomplete="off"
        enterkeyhint="done"
        class="text-center text-headline"
      />
      {#if invalid}<p class="ios-section-footer text-center text-destructive">{m.list_name_invalid()}</p>{/if}
    </div>

    <section class="flex flex-col">
      <h3 class="ios-section-header">{m.list_color()}</h3>
      <ToggleGroup.Radios variant="swatch" spacing={3} class="grid w-full grid-cols-6 justify-items-center">
        {#each listColors as option (option)}
          <ToggleGroup.Radio name="color" value={option} checked={option === color} aria-label={option} style="--swatch: {listColor(option)}" />
        {/each}
      </ToggleGroup.Radios>
    </section>

    <section class="flex flex-col">
      <h3 class="ios-section-header">{m.list_icon()}</h3>
      <ToggleGroup.Radios variant="symbol" spacing={1} class="grid w-full grid-cols-6 justify-items-center">
        {#each iconNames as option (option)}
          {@const Icon = listIcons[option]}
          <ToggleGroup.Radio name="icon" value={option} checked={option === icon} aria-label={option}><Icon strokeWidth={2} /></ToggleGroup.Radio>
        {/each}
      </ToggleGroup.Radios>
    </section>
  </div>
</form>
