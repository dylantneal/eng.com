'use client';

import { useState } from 'react';
import { CurrencyDollarIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function TipJar({
  projectId,
  payeeId,
}: {
  projectId: string;
  payeeId: string;
}) {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const amounts = [1, 5, 10, 25, 50];

  const handleTip = () => {
    // Real implementation would call Stripe, etc.
    alert(`Thank you for tipping $${selectedAmount} to project ${projectId}! 🎉\n\nIn a real implementation, this would process payment via Stripe.`);
  };

  return (
    <div className="space-y-4">
      {/* Amount Selection */}
      <div className="grid grid-cols-3 gap-2">
        {amounts.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedAmount === amount
                ? 'bg-yellow-500 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            ${amount}
          </button>
        ))}
      </div>

      {/* Tip Button */}
      <button
        onClick={handleTip}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl font-semibold text-black transition-all duration-300 transform hover:scale-105"
      >
        <HeartIcon className="w-5 h-5" />
        Tip ${selectedAmount}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Support engineering innovation • Secure payments via Stripe
      </p>
    </div>
  );
} 