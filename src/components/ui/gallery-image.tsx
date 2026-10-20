import { ParallaxImage } from "@/components/ui/parallax-image";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/utils/cn";

type GalleryImageProps = {
  src: string;
  /** Tailwind aspect ratio of the image box, e.g. `aspect-[1346/747]`. */
  aspectClassName: string;
  imageClassName?: string;
  className?: string;
};

/** Project gallery image: Figma 10px frame padding around a parallax cover. */
export function GalleryImage({
  src,
  aspectClassName,
  imageClassName = "object-[50%_39.5%]",
  className,
}: GalleryImageProps) {
  return (
    <Reveal className={cn("p-10", className)}>
      <div className={cn("relative w-full bg-placeholder", aspectClassName)}>
        <ParallaxImage
          src={src}
          alt=""
          sizes="(min-width: 1024px) 95vw, 100vw"
          imageClassName={imageClassName}
        />
      </div>
    </Reveal>
  );
}
