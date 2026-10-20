import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
  // Same curve as `--ease-menu-visual`, for the menu thumbnails on touch.
  CustomEase.create("menuVisual", "0.819,0.077,0,1");
}

export const EASE = {
  out: "power3.out",
  expo: "expo.out",
  inOut: "power2.inOut",
  menu: "power4.inOut",
  menuLinks: "power4.out",
  menuVisual: "menuVisual",
} as const;

export const DURATION = {
  enter: 1,
  enterSlow: 1.2,
  hover: 0.3,
  menu: 2,
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
