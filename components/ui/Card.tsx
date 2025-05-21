import { PropsWithChildren } from 'react';
import clsx from 'clsx';

export default function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <article
      className={clsx(
        'rounded-lg bg-white shadow-card hover:shadow-md transition-shadow',
        className,
      )}
    >
      {children}
    </article>
  );
} 