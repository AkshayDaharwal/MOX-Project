import React, { useEffect, useState } from "react";

/**
 * ScrollToTopButton
 * - Shows after you scroll down a bit
 * - Smoothly scrolls to top on click
 * - Accessible with aria-label and keyboard focus styles
 */
export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.pageYOffset || document.documentElement.scrollTop;
      setVisible(scrolled > 250); // show after 250px
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={[
        "fixed right-4 bottom-4 z-50",
        "rounded-full p-3 shadow-lg",
        "bg-black/80 text-white backdrop-blur",
        "hover:bg-black focus:outline-none focus:ring-2 focus:ring-white/60",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      {/* Up Arrow Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M5.47 12.53a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 1 1-1.06 1.06L12.75 8.81v9.44a.75.75 0 0 1-1.5 0V8.81l-3.72 3.72a.75.75 0 0 1-1.06 0Z" />
      </svg>
    </button>
  );
}