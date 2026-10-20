import Image from "next/image";
import Link from "next/link";
import { RollText } from "@/components/ui/roll-text";
import { FOOTER_DITHER } from "@/constants/dither";
import { FOOTER_LINKS } from "@/constants/navigation";
import { STUDIO_INFO } from "@/constants/studio";
import { DitherImage } from "@/features/dither-image";

const LINK_POSITION = ["lg:left-886", "lg:left-1522"] as const;

/** Figma "Footer" (937px): dithered figure behind the studio details. */
export function Footer() {
  const [emailUser, emailDomain] = STUDIO_INFO.email.split("@");

  return (
    <footer
      data-header-theme="light"
      className="relative overflow-hidden bg-red-graw text-white-graw lg:h-937"
    >
      <DitherImage {...FOOTER_DITHER} animation="scroll" />
      <div className="relative flex flex-col gap-48 px-16 pt-96 pb-64 lg:static lg:block lg:p-0">
        <Image
          src="/icons/logo-the-craw-wordmark.svg"
          alt="The Craw"
          width={174}
          height={31}
          className="h-auto w-140 lg:absolute lg:top-24 lg:left-134 lg:w-174"
        />

        <nav aria-label="Rodapé" className="flex gap-48 lg:contents">
          {FOOTER_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group text-nav lg:absolute lg:top-10 ${LINK_POSITION[index]}`}
            >
              <RollText>{link.label}</RollText>
            </Link>
          ))}
        </nav>

        <p className="max-w-552 text-nav leading-[1.03] lg:absolute lg:top-157 lg:left-886 lg:w-552">
          {STUDIO_INFO.tagline[0]}
          <br />
          {STUDIO_INFO.tagline[1]}
        </p>

        <div className="grid grid-cols-2 gap-x-24 gap-y-32 text-small lg:contents">
          <p className="leading-[1.2] lg:absolute lg:top-413 lg:left-886">
            by {STUDIO_INFO.founder}
          </p>
          <p className="leading-[1.2] lg:absolute lg:top-413 lg:left-1522">
            {STUDIO_INFO.code}
          </p>
          <p className="lg:absolute lg:top-500 lg:left-138 lg:w-130">
            {STUDIO_INFO.since}
          </p>
          <p className="lg:absolute lg:top-500 lg:left-591 lg:w-146">
            {STUDIO_INFO.instagram}
          </p>
          <p className="lg:absolute lg:top-500 lg:left-886 lg:w-173">
            {STUDIO_INFO.pitch}
          </p>
          <a
            href={`mailto:${STUDIO_INFO.email}`}
            className="underline-offset-4 hover:underline lg:absolute lg:top-500 lg:left-1522 lg:w-130"
          >
            {emailUser}
            <br />@{emailDomain}
          </a>
          <p className="lg:absolute lg:top-446 lg:left-1762 lg:w-57">
            {STUDIO_INFO.phone.map((part, index) => (
              <span key={index} className="block">
                {part}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
