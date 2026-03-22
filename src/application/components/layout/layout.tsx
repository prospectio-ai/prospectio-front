import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header title="Prospectio" description="Your prospection assistant" />
      <div className="flex flex-1">
        <Sidebar className="flex-shrink-0" />
        <main className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
