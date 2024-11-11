"use client";

import Button from "@/app/components/elements/Button";
import { useDetectOS } from "@/app/hooks/useDetectOS";
import { useCallback, useState } from "react";

export default function Page() {
  const os = useDetectOS();
  const [attempted, setAttempted] = useState(false);

  const openApp = useCallback(() => {
    const appLink = "app://pelvicfloorpro/education?id=37"; // Custom scheme for the app

    // Attempt to open the app
    window.location.href = appLink;
    setAttempted(true); // Set state to show "Download App" button if app doesn't open
  }, []);

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
              <Button label="Download on google play" />
            </a>
          ) : os === "iOS" ? (
            <a
              href="https://apps.apple.com/app/id1234567890"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button label="Download on app store" />
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}
