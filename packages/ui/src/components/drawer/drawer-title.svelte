<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: DrawerPrimitive.TitleProps = $props();
</script>

<DrawerPrimitive.Title
	bind:ref
	data-slot="drawer-title"
	class={cn("font-heading text-foreground text-[17px] font-semibold tracking-tight", className)}
	{...restProps}
/>
