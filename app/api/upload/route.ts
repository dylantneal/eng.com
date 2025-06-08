import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { filename, type } = await req.json();             // { png, pdf… }

  if (!filename) return new Response('filename required', { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,                // server-side key
  );

  /* store files under   projects/<uuid>/<filename>  */
  const projectFolder = crypto.randomUUID();
  const path          = `${projectFolder}/${filename}`;

  const { data, error } = await supabase
    .storage
    .from('projects')
    .createSignedUploadUrl(path, { upsert: false });       // options object

  if (error || !data) return new Response(error?.message, { status: 500 });

  return Response.json({ url: data.signedUrl, path });     // client PUTs here
} 