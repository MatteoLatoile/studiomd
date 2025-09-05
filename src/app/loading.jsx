"use client";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-[#FDF6E3]">
      <div className="flex flex-col items-center gap-4">
        {/* anneau */}
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 rounded-full border-4 border-black/10" />
          <span className="absolute inset-0 rounded-full border-4 border-t-[#FFB700] animate-spin" />
        </div>

        <p className="text-noir font-semibold">Chargement…</p>

        {/* barre shimmer */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-black/10">
          <div className="h-full w-1/3 animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-[#FFB700] to-transparent" />
        </div>
      </div>

      {/* keyframes inline si t'as pas déjà une anim shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
