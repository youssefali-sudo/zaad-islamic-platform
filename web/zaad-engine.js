// Optional adapter for the C++ WebAssembly core.
// The static app remains usable when the WASM build has not been generated.
let wasm = null;
export async function loadZaadEngine() {
  try {
    const module = await import('./zaad-core.js');
    wasm = await (module.default || module)();
    return true;
  } catch {
    return false;
  }
}
export function clampCounter(value) {
  if (wasm?.cwrap) return wasm.cwrap('zaad_clamp_counter', 'number', ['number'])(value);
  return Math.max(0, Number(value) || 0);
}
export function completedTotal(pages, habits) {
  if (wasm?.cwrap) return wasm.cwrap('zaad_completed_total', 'number', ['number','number'])(pages, habits);
  return Math.max(0, pages) + Math.max(0, habits);
}
