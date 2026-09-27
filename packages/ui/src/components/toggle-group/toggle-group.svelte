<script lang="ts" module>
	import { getContext, setContext } from "svelte";
	import { toggleVariants } from "#ui/toggle/index.js";
	import type { VariantProps } from "tailwind-variants";

	type ToggleVariants = VariantProps<typeof toggleVariants>;

	interface ToggleGroupContext extends ToggleVariants {
		spacing?: number;
		orientation?: "horizontal" | "vertical";
	}

	export function setToggleGroupCtx(props: ToggleGroupContext) {
		setContext("toggleGroup", props);
	}

	/** The group's look (the segmented control's track), shared with the RadioGroup. */
	export const toggleGroupClass =
		"group/toggle-group flex w-fit flex-row flex-wrap items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch data-[variant=segmented]:w-full data-[variant=segmented]:flex-nowrap data-[variant=segmented]:gap-0.5 data-[variant=segmented]:rounded-[9px] data-[variant=segmented]:bg-muted data-[variant=segmented]:p-0.5";

	export function getToggleGroupCtx() {
		return getContext<Required<ToggleGroupContext>>("toggleGroup");
	}
</script>

<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size = "default",
		spacing = 0,
		orientation = "horizontal",
		variant = "default",
		...restProps
	}: ToggleGroupPrimitive.RootProps &
		ToggleVariants & {
			spacing?: number;
			orientation?: "horizontal" | "vertical";
		} = $props();

	setToggleGroupCtx({
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
		get spacing() {
			return spacing;
		},
		get orientation() {
			return orientation;
		},
	});
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<ToggleGroupPrimitive.Root
	bind:value={value as never}
	bind:ref
	{orientation}
	data-slot="toggle-group"
	data-variant={variant}
	data-size={size}
	data-spacing={spacing}
	style={`--gap: ${spacing}`}
	class={cn(
		toggleGroupClass,
		className
	)}
	{...restProps}
/>
