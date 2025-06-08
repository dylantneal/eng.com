'use client';

export default function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-500">
      <svg className="w-14 h-14 mb-4 stroke-current" fill="none" strokeWidth={1.2} viewBox="0 0 24 24">
        <path d="M3 3h18M3 8h18M3 13h18M3 18h18"/>
      </svg>
      <p className="text-lg">{label}</p>
    </div>
  );
} 