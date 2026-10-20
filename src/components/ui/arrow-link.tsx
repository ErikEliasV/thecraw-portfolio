import Image from "next/image";
import { RollText } from "@/components/ui/roll-text";
import { cn } from "@/utils/cn";

type ArrowLinkProps = {
  href: string;
  children: string;
  tone?: "light" | "dark" | "red";
  className?: string;
};

const TONES = {
  light: { text: "text-white", icon: "/icons/arrow-up-right-light.svg" },
  dark: { text: "text-black-graw", icon: "/icons/arrow-up-right-dark.svg" },
  red: { text: "text-red-graw", icon: "/icons/arrow-up-right-red.svg" },
} as const;

/** Uppercase CTA with the Figma "arrow-up-right" icon. */
export function ArrowLink({
  href,
  children,
  tone = "light",
  className,
}: ArrowLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center gap-8 text-caption uppercase",
        TONES[tone].text,
        className,
      )}
    >
      <RollText>{children}</RollText>
      <Image
        src={TONES[tone].icon}
        alt=""
        width={20}
        height={20}
        className="size-20 transition-transform duration-300 ease-power3 group-hover:translate-x-3 group-hover:-translate-y-3 motion-reduce:transition-none"
      />
    </a>
  );
}
