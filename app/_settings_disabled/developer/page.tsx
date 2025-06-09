import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function DeveloperTab() {
  const supabase = createClient(cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('api_keys')
    .select('service_key')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Developer</h1>

      <div className="relative">
        <input
          value={data?.service_key ?? ''}
          readOnly
          className="w-full rounded border px-3 py-2 bg-muted/50 pr-20"
        />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(data?.service_key ?? '')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-3 py-1 rounded bg-muted hover:bg-muted/70"
        >
          Copy
        </button>
      </div>
    </div>
  )
} 