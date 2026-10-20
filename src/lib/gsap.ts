import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

export const EASE = {
  out: "power3.out",
  expo: "expo.out",
  inOut: "power2.inOut",
} as const;

export const DURATION = {
  enter: 1,
  enterSlow: 1.2,
  hover: 0.3,
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
