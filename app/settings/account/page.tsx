import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function AccountTab() {
  const supabase = createClient(cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Account</h1>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          defaultValue={user?.email}
          readOnly
          className="w-full rounded border px-3 py-2 bg-muted/50"
        />
      </div>
      {/* TODO: display-name + delete-account actions */}
    </div>
  )
} 