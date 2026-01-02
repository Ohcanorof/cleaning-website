"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function CustomerPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOwnerRoute = pathname.startsWith("/owner");

  // Avoid a flash on the very first page load
  const firstRender = useRef(true);
  useEffect(() => {
    firstRender.current = false;
  }, []);

  if (isOwnerRoute) return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={firstRender.current ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}
