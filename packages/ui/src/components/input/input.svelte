<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	// An iOS text field: body text, no border, a grey placeholder, the tint as caret.
	// `field` stands on its own as a rounded cell; `plain` sits inside a list row.
	export const inputVariants = tv({
		base: "w-full min-w-0 text-[17px] leading-[22px] tracking-[-0.025em] text-foreground caret-primary outline-none placeholder:text-tertiary-foreground disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:caret-destructive",
		variants: {
			variant: {
				field: "h-12 rounded-[12px] bg-card px-4 supports-[corner-shape:squircle]:rounded-[20px] supports-[corner-shape:squircle]:[corner-shape:squircle] aria-invalid:shadow-[inset_0_0_0_1.5px_var(--destructive)]",
				plain: "bg-transparent",
			},
		},
		defaultVariants: { variant: "field" },
	});

	export type InputVariant = VariantProps<typeof inputVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })
	> & { variant?: InputVariant };

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		files = $bindable(),
		class: className,
		variant,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			inputVariants({ variant }),
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		class={cn(
			inputVariants({ variant }),
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
