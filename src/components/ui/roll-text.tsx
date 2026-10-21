import { cn } from "@/utils/cn";

type RollTextProps = {
  children: string;
  className?: string;
};

/**
 * Text that rolls up on hover/focus of the closest `group` ancestor. The clip
 * leaves room on the sides for letters that negative tracking pushes out.
 */
export function RollText({ children, className }: RollTextProps) {
  return (
    <span
      className={cn(
        "relative -mx-[0.15em] inline-flex overflow-hidden px-[0.15em]",
        className,
      )}
    >
      <span className="block transition-transform duration-300 ease-power3 group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full px-[0.15em] transition-transform duration-300 ease-power3 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}
