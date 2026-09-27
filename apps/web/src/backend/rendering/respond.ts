// Pages and fragments, typed by this app's views (frontend/views/index.ts).
import { responders } from "@shift-stack/core/server"
import type { Fragments, Pages } from "#frontend/views/index.ts"

export const { page, fragment } = responders<Pages, Fragments>()
