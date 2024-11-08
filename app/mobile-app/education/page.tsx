"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    // Redirect to the URL automatically when the component loads
    window.location.href = "https://development.d39k3qcd6esorh.amplifyapp.com/mobile-app/education?id=37";
  }, []);

  return (
    <p>Redirecting...</p>
  );
}