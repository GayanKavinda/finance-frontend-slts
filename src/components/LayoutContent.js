"use client";

import { ScrollProvider, useScroll } from "@/contexts/ScrollContext";
import Navbar from "@/components/Navbar";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";
import ThemeScrollArea from "@/components/ThemeScrollArea";

function ScrollableContent({ children }) {
  const { handleScroll } = useScroll();

  return (
    <ThemeScrollArea
      className="h-full w-full bg-inherit"
      onScroll={handleScroll}
    >
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <MainContent>{children}</MainContent>
      </div>
    </ThemeScrollArea>
  );
}

export default function LayoutContent({ children }) {
  return (
    <ScrollProvider>
      <ScrollableContent>{children}</ScrollableContent>
    </ScrollProvider>
  );
}
