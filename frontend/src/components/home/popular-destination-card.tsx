"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function PopularDestinationCard({
  name,
  image,
  href,
}: {
  name: string;
  image: string;
  href: string;
}) {
  return (
    <motion.div whileHover={{ y: -4 }} className="shrink-0 w-[220px] sm:w-[260px]">
      <Link href={href} className="group block relative aspect-[3/4] overflow-hidden rounded-[1.75rem]">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="260px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <p className="absolute bottom-5 left-5 right-5 font-display text-lg font-bold text-white">
          Travel to {name}
        </p>
      </Link>
    </motion.div>
  );
}
