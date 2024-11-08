"use client";

import Button from "@/app/components/elements/Button";
import { useCallback } from "react";

export default function Page() {
  // Function to open the app or fallback to web link if the app isn't installed
  const openApp = useCallback(() => {
    const appLink = "app://pelvicfloorpro/education?id=37"; // Custom scheme for the app

    // Attempt to open the app
    window.location.href = appLink;

    // Set a timeout to redirect to the web URL if the app isn't installed
    setTimeout(() => {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.example.pelvicfloorpro";
    }, 2000); // Adjust delay as needed
  }, []);

  return (
    <div className="flex flex-col w-auto sm:w-[300px] pt-[50px] space-y-4 items-center">
      <button onClick={openApp}>
        <Button label="Open App or Download on Google Play" />
      </button>
      <button onClick={openApp}>
        <Button label="Open App or Download on App Store" />
      </button>
    </div>
  );
}
