// Every island here writes down when it mounts and unmounts, so the tests can see which islands are alive: one too
// many is a leak, one missing did not come to life.
import { onMount } from "svelte"

declare global {
  interface Window {
    probe?: { mounts: string[]; unmounts: string[] }
  }
}

export const track = (id: () => string) =>
  onMount(() => {
    const probe = (window.probe ??= { mounts: [], unmounts: [] })
    const name = id()
    probe.mounts.push(name)
    return () => void probe.unmounts.push(name)
  })
