import { RocketLaunchIcon } from '@heroicons/react/24/solid';

export default function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-yellow-400/20 px-2 py-0.5 text-xs font-semibold text-yellow-700">
      <RocketLaunchIcon className="h-3 w-3" />
      PRO
    </span>
  );
} 