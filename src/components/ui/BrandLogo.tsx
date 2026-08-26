import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  imageClassName?: string;
  linkClassName?: string;
  onClick?: () => void;
  priority?: boolean;
};

export function BrandLogo({ imageClassName = "size-16", linkClassName = "", onClick, priority = false }: BrandLogoProps) {
  return (
    <Link aria-label="ComEat home" className={`inline-flex shrink-0 ${linkClassName}`} href="/" onClick={onClick}>
      <Image
        alt=""
        className={`object-contain ${imageClassName}`}
        height={640}
        priority={priority}
        src="/images/comeat-logo.png"
        width={640}
      />
    </Link>
  );
}
