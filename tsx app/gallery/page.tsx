import { createClient } from '@/utils/supabase-server'   // make it a module & get the client

const supabase = createClient()

const { data: projects } = await supabase
  .from('projects')
  .select('id, title, slug, owner:owner(username), project_versions(files)')
  .eq('is_public', true)
  .order('created_at', { ascending: false })
  .limit(40); 

export {}          // 👈 makes the file a module; top-level await becomes legal 