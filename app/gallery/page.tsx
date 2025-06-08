import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import clsx from 'clsx';

export const revalidate = 30;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string }>
}) {
  const params = await searchParams;
  const sortIsTop = params?.sort === 'top';
  const orderColumn = sortIsTop ? 'tips_cents' : 'created_at';

  const supabase = await createClient();

  const { data: rawProjects, error } = await supabase
    .from('project_feed')
    .select(
      `
        id,
        title,
        slug,
        handle,
        thumb,
        tips_cents,
        created_at
      `
    )
    .order(orderColumn, { ascending: false });

  if (error) {
    console.error("Gallery error:", JSON.stringify(error, null, 2));
    throw error;
  }

  let projects = rawProjects?.map(p => ({
    ...p,
    // If thumb is already a full URL, use it; if it's a path, construct the URL
    thumb_url: p.thumb?.startsWith('http') 
      ? p.thumb 
      : p.thumb
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/${p.thumb}`
        : `https://picsum.photos/seed/${p.id}/480/360`,
    username: p.handle,
  })) || [];

  // Add sample data if no projects exist
  if (projects.length === 0) {
    projects = [
      {
        id: 'sample-1',
        title: 'Arduino Weather Station',
        slug: 'arduino-weather-station',
        handle: 'engineerdemo',
        username: 'engineerdemo',
        thumb: null,
        thumb_url: 'https://picsum.photos/seed/weather-station/480/360',
        tips_cents: 2500,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'sample-2',
        title: '3D Printed Robot Arm',
        slug: '3d-printed-robot-arm',
        handle: 'roboticsexpert',
        username: 'roboticsexpert',
        thumb: null,
        thumb_url: 'https://picsum.photos/seed/robot-arm/480/360',
        tips_cents: 4200,
        created_at: '2024-01-10T14:30:00Z'
      },
      {
        id: 'sample-3',
        title: 'IoT Smart Home Controller',
        slug: 'iot-smart-home-controller',
        handle: 'iotmaker',
        username: 'iotmaker',
        thumb: null,
        thumb_url: 'https://picsum.photos/seed/smart-home/480/360',
        tips_cents: 1800,
        created_at: '2024-01-08T09:15:00Z'
      },
      {
        id: 'sample-4',
        title: 'Custom PCB Design Tool',
        slug: 'custom-pcb-design-tool',
        handle: 'pcbwizard',
        username: 'pcbwizard',
        thumb: null,
        thumb_url: 'https://picsum.photos/seed/pcb-tool/480/360',
        tips_cents: 3600,
        created_at: '2024-01-05T16:45:00Z'
      },
      {
        id: 'sample-5',
        title: 'Drone Flight Controller',
        slug: 'drone-flight-controller',
        handle: 'dronetech',
        username: 'dronetech',
        thumb: null,
        thumb_url: 'https://picsum.photos/seed/drone-controller/480/360',
        tips_cents: 5100,
        created_at: '2024-01-02T11:20:00Z'
      },
      {
        id: 'sample-6',
        title: 'Solar Panel Optimizer',
        slug: 'solar-panel-optimizer',
        handle: 'greenengineer',
        username: 'greenengineer',
        thumb: null,
        thumb_url: 'https://picsum.photos/seed/solar-optimizer/480/360',
        tips_cents: 2900,
        created_at: '2023-12-28T08:30:00Z'
      }
    ];
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4">
      <nav className="mb-6 flex gap-4 text-sm font-medium">
        {[
          { label: 'Latest',   href: '/gallery',            active: !sortIsTop },
          { label: 'Most Tipped', href: '/gallery?sort=top', active:  sortIsTop },
        ].map(tab => (
          <Link
            key={tab.label}
            href={tab.href}
            className={clsx(
              'rounded px-2 py-1 transition',
              tab.active
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.username}/${project.slug}`}
            className="break-inside-avoid mb-4 block border rounded overflow-hidden shadow-sm
                       transition-shadow hover:shadow-lg bg-white/50 backdrop-blur"
          >
            {project.thumb_url ? (
              <Image
                src={project.thumb_url}
                alt={project.title || ''}
                width={400}
                height={300}
                className="w-full object-cover"
              />
            ) : (
              <div className="bg-gray-100 h-48 flex items-center justify-center">
                <span>No preview</span>
              </div>
            )}
            <div className="p-3">
              <h3 className="font-semibold">{project.title}</h3>
              <p className="text-xs text-gray-500">@{project.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 