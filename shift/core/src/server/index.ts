// The server half of SHiFT: Effect's HTTP platform answering with server-rendered Svelte, for HTMX.
export { clientAssets, errorPages, serve, type ErrorPages, type ServerPlugin } from "./app.ts"
export { hxTrigger, navigateTo, refresh, trigger } from "./htmx.ts"
export { href, htmlResponse, isPageSwap, Links, responders, ViewData, withViewData } from "./respond.ts"
export { Assets, assetsFromManifest, assetsNone, headFromManifest, Views, viewsBundled, type ManifestChunk } from "./views.ts"
export { contentTarget, type FrontendConfig, type ViewContext } from "#protocol"
