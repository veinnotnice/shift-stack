<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	// Drawn the iOS way. `segmented`: a segment of a segmented control (the group draws the track).
	// `swatch`: a colour dot, its colour from --swatch. `symbol`: a bare symbol, ringed in --swatch when chosen.
	// Chosen is data-[state=on] for the Bits UI toggle, and has-checked for a label around a native radio
	// (toggle-group's RadioGroup, which works in server-rendered forms without JavaScript).
	export const toggleVariants = tv({
		base: "group/toggle inline-flex items-center justify-center gap-1.5 whitespace-nowrap outline-none select-none transition-[background-color,box-shadow,color] duration-200 focus-visible:ring-3 focus-visible:ring-ring/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
		variants: {
			variant: {
				default: "h-9 rounded-full px-4 text-subheadline font-medium text-foreground data-[state=on]:bg-muted has-checked:bg-muted data-[state=on]:font-semibold has-checked:font-semibold",
				segmented: "h-8 min-w-0 flex-1 rounded-[7px] text-footnote font-medium data-[state=on]:bg-[light-dark(#ffffff,#636366)] has-checked:bg-[light-dark(#ffffff,#636366)] data-[state=on]:font-semibold has-checked:font-semibold data-[state=on]:shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)] has-checked:shadow-[0_3px_8px_rgb(0_0_0/0.12),0_3px_1px_rgb(0_0_0/0.04)]",
				swatch: "size-10 rounded-full bg-(--swatch) data-[state=on]:shadow-[0_0_0_2.5px_var(--elevated-background,var(--background)),0_0_0_5px_var(--swatch)] has-checked:shadow-[0_0_0_2.5px_var(--elevated-background,var(--background)),0_0_0_5px_var(--swatch)]",
				symbol: "size-11 rounded-full text-muted-foreground data-[state=on]:text-(--swatch) has-checked:text-(--swatch) data-[state=on]:shadow-[inset_0_0_0_2px_var(--swatch)] has-checked:shadow-[inset_0_0_0_2px_var(--swatch)]",
				outline: "h-9 rounded-full px-4 text-subheadline font-medium shadow-[inset_0_0_0_1px_var(--border)] data-[state=on]:bg-muted has-checked:bg-muted",
			},
			size: {
				default: "",
				sm: "",
				lg: "",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
	export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
	export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		class: className,
		size = "default",
		variant = "default",
		...restProps
	}: TogglePrimitive.RootProps & {
		variant?: ToggleVariant;
		size?: ToggleSize;
	} = $props();
</script>

<TogglePrimitive.Root
	bind:ref
	bind:pressed
	data-slot="toggle"
	class={cn(toggleVariants({ variant, size }), className)}
	{...restProps}
/>
