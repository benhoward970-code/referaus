"use client";
import { useMemo } from "react";

interface TrustScoreProps {
  verified: boolean;
  hasPhone: boolean;
  hasBio: boolean;
  hasWebsite: boolean;
  reviewCount: number;
  avgRating: number;
  hasPhoto: boolean;
}

function calculateTrustScore(props: TrustScoreProps): { score: number; breakdown: { label: string; points: number; earned: boolean }[] } {
  const breakdown = [
    { label: "Verified badge", points: 30, earned: props.verified },
    { label: "Profile photo", points: 15, earned: props.hasPhoto },
    { label: "Average rating ≥ 4", points: 15, earned: props.avgRating >= 4 && props.reviewCount > 0 },
    { label: "Has phone number", points: 10, earned: props.hasPhone },
    { label: "Bio / description", points: 10, earned: props.hasBio },
    { label: "Has website", points: 10, earned: props.hasWebsite },
    { label: "Has reviews", points: 10, earned: props.reviewCount >= 1 },
  ];
  const score = breakdown.reduce((sum, item) => sum + (item.earned ? item.points : 0), 0);
  return { score, breakdown };
}

export function TrustScore(props: TrustScoreProps) {
  const { score, breakdown } = useMemo(() => calculateTrustScore(props), [
    props.verified, props.hasPhone, props.hasBio, props.hasWebsite,
    props.reviewCount, props.avgRating, props.hasPhoto,
  ]);

  // SVG circle progress
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const scoreColor =
    score >= 70 ? "#16a34a" :
    score >= 40 ? "#f97316" :
    "#dc2626";

  const scoreBg =
    score >= 70 ? "bg-green-50 border-green-200" :
    score >= 40 ? "bg-orange-50 border-orange-200" :
    "bg-red-50 border-red-200";

  const scoreLabel =
    score >= 70 ? "High Trust" :
    score >= 40 ? "Building Trust" :
    "Low Trust";

  return (
    <div className={`rounded-2xl border p-5 ${scoreBg}`}>
      <div className="flex items-center gap-4 mb-4">
        {/* Circular progress */}
        <div className="relative w-16 h-16 shrink-0">
          <svg width="64" height="64" viewBox="0 0 72 72" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="6"
            />
            {/* Progress circle */}
            <circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black" style={{ color: scoreColor }}>{score}</span>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Trust Score</div>
          <div className="text-lg font-black text-gray-900">{score}<span className="text-sm font-medium text-gray-400">/100</span></div>
          <div className="text-xs font-semibold mt-0.5" style={{ color: scoreColor }}>{scoreLabel}</div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.earned ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                {item.earned ? (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                ) : (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M6 18L18 6"/></svg>
                )}
              </span>
              <span className={item.earned ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
            </div>
            <span className={`font-semibold ${item.earned ? "text-green-600" : "text-gray-300"}`}>
              {item.earned ? `+${item.points}` : `+${item.points}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
