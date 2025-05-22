import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import React from 'react'

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient(cookies())
  const {
    data: { user },
  } = await supabase.auth.getUser()

  /* ⛔  Redirect unauthenticated visitors */
  if (!user) redirect('/')

  const tabs = [
    { slug: 'account', label: 'Account' },
    { slug: 'billing', label: 'Billing' },
    { slug: 'notifications', label: 'Notifications' },
    { slug: 'developer', label: 'Developer' },
  ]

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 flex gap-10">
      {/* figure out which tab is active safely */}
      {/*
         Only React elements have `.props.segment`; strings, numbers etc. do not.
      */}
      {(() => {
        const activeSeg =
          React.isValidElement(children) ? (children as any).props.segment : ''
        return (
          <nav className="w-48 shrink-0 space-y-2">
            {tabs.map((t) => (
              <Link
                key={t.slug}
                href={`/settings/${t.slug}`}
                className="block px-3 py-2 rounded hover:bg-muted data-[active=true]:bg-muted font-medium"
                data-active={activeSeg === t.slug}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        )
      })()}

      {/* Tab body */}
      <section className="flex-1">{children}</section>
    </div>
  )
} 