export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
        </div>
        <p className="font-mono text-[0.7rem] text-gray-400 tracking-[0.2em] uppercase">
          Loading&hellip;
        </p>
      </div>
    </div>
  );
}
