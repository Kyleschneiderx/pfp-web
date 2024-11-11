"use client";

import { useEffect, useState } from "react";

export const useDetectOS = () => {
  const [os, setOS] = useState<string | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes("android")) {
      setOS("Android");
    } else if (
      userAgent.includes("iphone") ||
      userAgent.includes("ipad") ||
      userAgent.includes("ipod")
    ) {
      setOS('iOS');
    } else {
      setOS('Unknown');
    }
  }, []);

  return os;
};
