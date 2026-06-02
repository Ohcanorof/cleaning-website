"use client";

//simplified this file, guided from linting errors
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function CustomerPageTransition({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}