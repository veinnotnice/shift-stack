// The composition root: the one place that decides which implementation backs each layer.
import { Layer } from "effect"
import { serve } from "@shift-stack/core/server"
import type { Assets, Views } from "@shift-stack/core/server"
import { app } from "#backend/http/app.ts"
import { MemoryStorage } from "@todos/storage-memory"
import { ListService } from "@todos/services/ListService"
import { TaskService } from "@todos/services/TaskService"

/** The business logic on its storage. Swap MemoryStorage for a database layer here, and nowhere else. */
export const AppServices = Layer.mergeAll(TaskService.Default, ListService.Default).pipe(Layer.provide(MemoryStorage))

/** Starts the app with the given views and assets. */
export const start = <E>(frontend: Layer.Layer<Views | Assets, E>) => serve(app, Layer.merge(frontend, AppServices))
