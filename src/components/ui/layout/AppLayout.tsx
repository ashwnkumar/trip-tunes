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
        <div className="flex w-full flex-col">
            <Navbar />
            <main className="flex min-h-screen flex-grow p-5">
                <GlobalProvider>
                    {children}
                    <Toaster position="top-right" />
                </GlobalProvider>
            </main>
            <Footer />
        </div>
    );
}
