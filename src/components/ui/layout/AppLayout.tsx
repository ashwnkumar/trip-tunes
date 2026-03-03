import { ReactNode } from "react";
import Navbar from "@/app/Navbar";
import Footer from "@/app/Footer";
import { Toaster } from "../sonner";
import { GlobalProvider } from "@/contexts/GlobalContext";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <GlobalProvider>
      <div className="flex w-full flex-col min-h-screen items-center justify-center">
        <Navbar />
        <main className="flex-grow w-full max-w-5xl items-center justify-center">
          {children}
          <Toaster position="top-right" />
        </main>
        <Footer />
      </div>
    </GlobalProvider>
  );
}
