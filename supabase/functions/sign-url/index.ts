import { createClient } from '@supabase/supabase-js';

const ALLOWED = [
  'image/png',
  'image/jpeg',
  'application/zip',
  'application/pdf',
  'video/mp4',
];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export const handler = async (event: any) => {
  const { mime, size, isPublic } = JSON.parse(event.body);

  if (!ALLOWED.includes(mime)) {
    return { statusCode: 400, body: 'Unsupported MIME type' };
  }
  if (size > MAX_FILE_SIZE) {
    return { statusCode: 400, body: 'File is larger than 100 MB' };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const bucket = isPublic ? 'projects' : 'projects-private';

  const { data, error } = await supabase
    .storage
    .from(bucket)
    .createSignedUploadUrl(`${crypto.randomUUID()}.${mime.split('/')[1]}`);

  if (error) {
    return { statusCode: 500, body: error.message };
  }
  return { statusCode: 200, body: JSON.stringify(data) };
}; 