// What apps may use from SHiFT's shared contract: the constants all its halves agree on, and the types that describe
// an app to it. It has no side effects, so islands can import it. The rest of protocol.ts is SHiFT's own.
export { contentTarget, layoutHeader, refreshEvent } from "#protocol"
export type { Components, DocumentContext, FrontendConfig, IslandModules, Named, ViewContext, ViewModule } from "#protocol"
