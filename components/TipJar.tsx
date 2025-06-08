'use client';

export default function TipJar({
  projectId,
  payeeId,
}: {
  projectId: string;
  payeeId: string;
}) {
  //  ⓘ real implementation can call Stripe, etc.
  return (
    <a
      href="#"
      onClick={() => alert(`Pretend to tip project ${projectId}`)}
      className="inline-block rounded bg-yellow-400 px-4 py-2 font-medium"
    >
      Tip the author 💸
    </a>
  );
} 