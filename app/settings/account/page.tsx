import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function AccountTab() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Account</h1>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          defaultValue={user?.email || ''}
          readOnly
          className="w-full rounded border px-3 py-2 bg-muted/50"
        />
      </div>
      {/* TODO: display-name + delete-account actions */}
    </div>
  )
} 