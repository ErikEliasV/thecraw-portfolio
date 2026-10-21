import Image from "next/image";
import { asset } from "@/utils/asset";

/**
 * Header logo (HOTBAR): wordmark plus the "DESIGN" tag. Both color variants
 * are stacked and cross-faded by the header's `data-theme`.
 */
export function HeaderLogo() {
  return (
    <span className="relative block h-40.5 w-67 lg:h-54 lg:w-89.5">
      <Image
        src={asset("/icons/logo-the-graw-light.svg")}
        alt=""
        width={88}
        height={55}
        priority
        className="absolute top-[-0.52%] left-[-0.31%] h-[101.04%] w-[98.29%] max-w-none transition-opacity duration-300 group-data-[theme=dark]/header:opacity-0"
      />
      <Image
        src={asset("/icons/logo-the-graw-dark.svg")}
        alt=""
        width={88}
        height={55}
        priority
        className="absolute top-[-0.52%] left-[-0.31%] h-[101.04%] w-[98.29%] max-w-none opacity-0 transition-opacity duration-300 group-data-[theme=dark]/header:opacity-100"
      />
      <span className="absolute top-[12.46%] left-[67.59%] flex h-[20.37%] w-[32.41%] items-center justify-center text-micro whitespace-nowrap">
        DESIGN
      </span>
    </span>
  );
}
