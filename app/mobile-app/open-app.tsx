"use client";

import Button from "@/app/components/elements/Button";
import { useDetectOS } from "@/app/hooks/useDetectOS";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface Props {
  path: String;
}

export default function OpenApp({ path }: Props) {
  const os = useDetectOS();
  const [attempted, setAttempted] = useState(false);

  const openApp = useCallback(() => {
    const appLink = `app://pelvicfloorpro/${path}`;

    // Attempt to open the app
    window.location.href = appLink;
    setAttempted(true); // Set state to show "Download App" button if app doesn't open
  }, []);

  useEffect(() => {
    openApp();
  }, [openApp]);

  return (
    <div className="flex flex-col w-auto sm:w-[300px] pt-[50px] space-x-4 items-center">
      <Button label="Open app" onClick={openApp} />

      {/* Show the fallback only if app open was attempted */}
      {attempted && (
        <div className="flex flex-col items-center mt-8 space-y-3">
          <p>If the app didn’t open, please download it:</p>
          {os === "Android" ? (
            <a
              href="https://play.google.com/store/apps/details?id=com.example.pelvicfloorpro"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/google-play-btn.png"
                alt="Google Play Button"
                width={200}
                height={60}
                quality={100}
                className="mx-auto w-[200px] h-[60px]"
                priority
              />
            </a>
          ) : os === "iOS" ? (
            <a
              href="https://apps.apple.com/app/id1234567890"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/app-store-btn.png"
                alt="Google Play Button"
                width={200}
                height={60}
                quality={100}
                className="mx-auto w-[200px] h-[60px]"
                priority
              />
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
