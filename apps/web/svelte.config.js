/** @type {import("@sveltejs/vite-plugin-svelte").SvelteConfig} */
export default {
  // Runes mode for our own files only, not for components pulled in from node_modules.
  compilerOptions: { runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true) }
}
