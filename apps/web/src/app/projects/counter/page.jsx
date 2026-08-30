import CounterComponent from "@/component/project/counter/CounterComponent";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "SergioHub - Contador",
  description: "Contador interactivo de estado en React.",
};

export default function CounterPage() {
  return (
    <div className="min-h-screen w-full bg-[#07090d] text-white flex flex-col justify-between px-4 sm:px-6 py-6">
      {/* Top Header */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] text-sm text-neutral-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-neutral-400" />
          <span>Volver a proyectos</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center my-6">
        <CounterComponent />
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-lg mx-auto text-center text-xs text-neutral-500">
        SergioHub &bull; Proyectos
      </footer>
    </div>
  );
}