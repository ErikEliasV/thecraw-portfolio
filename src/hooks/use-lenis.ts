"use client";

import { useSyncExternalStore } from "react";
import { getLenis, subscribeLenis } from "@/lib/smooth-scroll-provider";

export function useLenis() {
  return useSyncExternalStore(subscribeLenis, getLenis, () => null);
}
