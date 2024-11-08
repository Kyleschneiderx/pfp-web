"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Page() {
  const linkRef = useRef<HTMLAnchorElement>(null); // Specify the anchor element type

  useEffect(() => {
    // Simulate a click on the link when the component mounts
    if (linkRef.current) {
      linkRef.current.click();
    }
  }, []);

  return (
    <Link
      href="https://development.d39k3qcd6esorh.amplifyapp.com/mobile-app/education?id=37"
      legacyBehavior // legacyBehavior is used to make Link render an anchor tag
    >
      <a ref={linkRef}>https://development.d39k3qcd6esorh.amplifyapp.com/mobile-app/education?id=37</a>
    </Link>
  );
}
