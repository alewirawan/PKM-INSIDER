import Image from "next/image";


export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Image
      className={`brand-logo ${className}`.trim()}
      src="/images/logo.png"
      alt=""
      width={37}
      height={46}
      priority
    />
  );
}
