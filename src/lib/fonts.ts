import localFont from "next/font/local";

// SF Pro Display: Light (300) and Semibold (600) were not supplied, so the
// browser falls back to the nearest available weight for those.
export const sfPro = localFont({
  src: [
    {
      path: "../../public/fonts/sf-pro-display-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf-pro-display-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/sf-pro-display-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
});

export const seagram = localFont({
  src: "../../public/fonts/seagram-tfb.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-seagram",
  display: "swap",
});
