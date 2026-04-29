import Link from "next/link";

function HexIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 4L72 22V58L40 76L8 58V22L40 4Z" fill="#1a0f05" stroke="#f97316" strokeWidth="2.5"/>
      <text x="40" y="48" textAnchor="middle" fill="#f97316" fontFamily="Oswald, sans-serif" fontWeight="700" fontSize="32">R</text>
    </svg>
  );
}

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizes = {
    small: { icon: 26, text: "text-lg", tag: "text-[7px]" },
    default: { icon: 32, text: "text-2xl", tag: "text-[8px]" },
    large: { icon: 48, text: "text-4xl", tag: "text-[10px]" },
  };
  const s = sizes[size];

  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <HexIcon size={s.icon} />
      <div className="flex flex-col">
        <div className={`${s.text} leading-none tracking-wider`} style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, textTransform: "uppercase" as const }}>
          <span className="text-gray-900">REFER</span>
          <span className="text-orange-500">AUS</span>
        </div>
      </div>
    </Link>
  );
}

export function LogoMark({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <div className={className}>
      <HexIcon size={48} />
    </div>
  );
}