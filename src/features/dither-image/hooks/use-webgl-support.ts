"use client";

import { useSyncExternalStore } from "react";

let supported: boolean | null = null;

function detectWebGL2() {
  if (supported === null) {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      supported = Boolean(gl);
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      supported = false;
    }
  }
  return supported;
}

const subscribe = () => () => {};

/** `null` while rendering on the server, then whether WebGL2 is available. */
export function useWebGLSupport() {
  return useSyncExternalStore(subscribe, detectWebGL2, () => null);
}
