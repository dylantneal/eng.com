import Link from 'next/link';
import {
  CloudArrowUpIcon,
  RocketLaunchIcon,
  BanknotesIcon,
  ArchiveBoxIcon,
  BoltIcon,
  LockClosedIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getServerSession } from 'next-auth';
import { authOptions }        from '@/lib/auth';
import { redirect }           from 'next/navigation';

/* ----------  Decorative helper  ---------- */
function Blob(props: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-30 ${props.className}`}
    />
  );
}

export default async function Landing() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/home');

  return (
    <main>
      {/* ----------  HERO  ---------- */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen pb-10">
        {/* brand mark */}
        <span className="mb-6 font-semibold text-brand/80 tracking-widest sm:text-lg">
          eng.com
        </span>

        <h1 className="max-w-4xl text-4xl sm:text-6xl font-extrabold leading-tight drop-shadow">
          Publish,&nbsp;learn&nbsp;&&nbsp;earn as an&nbsp;
          <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
            engineer
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-gray-600">
          Drag-and-drop a project, get instant feedback and receive tips from a global
          community of builders.
        </p>

        <div className="mt-10 flex gap-4">
          <Link
            href="/gallery"
            className="rounded bg-brand px-7 py-4 text-white font-medium shadow-md hover:shadow-xl transition"
          >
            Browse projects
          </Link>
          <Link
            href="/projects/new"
            className="rounded border border-brand px-6 py-3 text-brand font-medium hover:bg-brand/5 transition"
          >
            Publish your first project
          </Link>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-brand/70">
          ↓
        </div>
      </section>

      {/* ----------  HOW IT WORKS  ---------- */}
      <section className="relative z-10 py-24">
        {/* translucent "glass" card */}
        <div className="mx-auto max-w-6xl rounded-3xl bg-white/25 backdrop-blur-lg ring-1 ring-white/30 shadow-lg px-6 py-16">
          <h2 className="text-center text-2xl font-semibold mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { title: 'Upload', Icon: CloudArrowUpIcon, desc: 'Drag up to 5 files (100 MB) & write a README.' },
              { title: 'Share',  Icon: RocketLaunchIcon, desc: 'Get a public link or keep it private for Pro users.' },
              { title: 'Earn',   Icon: BanknotesIcon,    desc: 'Fans tip you through Stripe – you keep 90 %.' },
            ].map(({ title, Icon, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
                  <Icon className="h-7 w-7 text-brand" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------  FEATURES  ---------- */}
      <section className="relative z-10 py-24">
        {/* translucent "glass" card */}
        <div className="mx-auto max-w-6xl rounded-3xl bg-white/25 backdrop-blur-lg ring-1 ring-white/30 shadow-lg px-6 py-16">
          <h2 className="text-center text-2xl font-semibold mb-12">Built for makers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              {
                Icon: ArchiveBoxIcon,
                title: '100 MB free storage',
                desc: 'Enough for CAD, PCB or ML notebooks.',
              },
              {
                Icon: BoltIcon,
                title: 'Realtime comments',
                desc: 'Feedback appears live as you iterate.',
              },
              {
                Icon: LockClosedIcon,
                title: 'Private projects',
                desc: 'Upgrade to Pro & keep work-in-progress secret.',
              },
              {
                Icon: ChartBarIcon,
                title: 'Analytics included',
                desc: 'See views, tips and clone stats in one glance.',
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <Icon className="h-8 w-8 text-brand/80" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------  FINAL CTA  ---------- */}
      <section className="relative z-10 py-24 text-center">
        <h2 className="text-3xl font-extrabold mb-6">
          Ready to share what you're building?
        </h2>
        <Link
          href="/projects/new"
          className="inline-block rounded bg-brand px-8 py-4 text-white font-medium shadow-lg hover:shadow-xl transition"
        >
          Publish a project now
        </Link>
      </section>
    </main>
  );
} 