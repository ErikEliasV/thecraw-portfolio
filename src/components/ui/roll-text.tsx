import { cn } from "@/utils/cn";

type RollTextProps = {
  children: string;
  className?: string;
};

/** Text that rolls up on hover/focus of the closest `group` ancestor. */
export function RollText({ children, className }: RollTextProps) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <span className="block transition-transform duration-300 ease-power3 group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-300 ease-power3 group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none"
      >
        {children}
      </span>
    </span>
  );
}
