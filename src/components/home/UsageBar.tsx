"use client";

interface UsageBarProps {
  used: number;
  limit: number;
}

export function UsageBar({ used, limit }: UsageBarProps) {
  const percent = Math.min(Math.round((used / limit) * 100), 100);
  const remaining = Math.max(0, limit - used);
  const isLow = remaining <= 5;

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#6B7280]">Free Papers Used</span>
        <span className={`text-sm font-semibold ${isLow ? "text-red-500" : "text-[#111827]"}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: isLow ? "#EF4444" : "#1E88E5",
          }}
        />
      </div>
      {isLow && (
        <p className="text-xs text-red-500 font-medium mt-2">
          Only {remaining} paper{remaining !== 1 ? "s" : ""} remaining this month
        </p>
      )}
    </div>
  );
}
