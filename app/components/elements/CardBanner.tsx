import Image from "next/image";

export default function CardBanner({url}:{url: string}) {
  return (
    <Image
      src={url || "/images/exercise-banner.jpg"}
      alt="Banner"
      width={351}
      height={200}
      className="rounded-lg rounded-b-none object-cover w-[351px] h-[200px]"
      quality={100}
      placeholder="blur"
      blurDataURL="/images/placeholder.jpg"
    />
  );
}
