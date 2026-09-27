<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from "bits-ui";
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();
</script>

<!-- As Reminders draws it: a grey ring while open; when done, the ring takes the colour and a dot fills it.
     The colour is --checkbox-color, or the system blue. The touch area is 44pt even though the circle is 22. -->
<CheckboxPrimitive.Root
	bind:ref
	data-slot="checkbox"
	class={cn(
		"peer relative flex size-[22px] shrink-0 items-center justify-center rounded-full text-[var(--checkbox-color,var(--primary))] shadow-[inset_0_0_0_1.5px_var(--tertiary-foreground)] outline-none transition-shadow duration-200 data-checked:shadow-[inset_0_0_0_1.5px_var(--checkbox-color,var(--primary))] aria-invalid:shadow-[inset_0_0_0_1.5px_var(--destructive)] focus-visible:ring-3 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-40 after:absolute after:-inset-[11px]",
		className
	)}
	bind:checked
	bind:indeterminate
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<div
			data-slot="checkbox-indicator"
			class="[&>svg]:size-3.5 [&>svg]:stroke-[3] grid place-content-center text-current transition-none"
		>
			{#if checked}
				<span class="block size-3.5 rounded-full bg-current"></span>
			{:else if indeterminate}
				<MinusIcon  />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
