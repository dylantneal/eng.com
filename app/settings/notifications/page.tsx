import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function NotificationsTab() {
  const supabase = createClient(cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* Load current preference from RLS-protected table */
  const { data } = await supabase
    .from('notification_settings')
    .select('email_digest')
    .eq('user_id', user!.id)
    .single()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Notifications</h1>
      <form action="/api/settings/notifications" method="POST">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="email_digest"
            defaultChecked={data?.email_digest}
          />
          Email me a weekly digest
        </label>
        <button className="mt-6 px-4 py-2 rounded bg-primary text-primary-foreground">
          Save
        </button>
      </form>
    </div>
  )
} 