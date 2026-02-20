import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#1565C0] flex flex-col items-center justify-center p-4 text-center">
      {/* 404 Visual */}
      <h1 className="text-[150px] font-black text-white/10 leading-none select-none">
        404
      </h1>
      
      <div className="-mt-12 z-10">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-white/70 max-w-sm mx-auto mb-8">
          Oops! The page you are looking for seems to have gone missing or the link is incorrect.
        </p>

        <Link 
          href="/home" 
          className="inline-flex items-center gap-2 bg-white text-[#1565C0] px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg shadow-blue-900/20"
        >
          <MoveLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}
