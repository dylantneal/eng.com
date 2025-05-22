/* Server component – gate the uploader behind authentication */
import { createClient } from '@/utils/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import FileUpload from '@/app/components/file-upload'
import MarkdownEditor from '@/app/components/markdown-editor'
import { useState } from 'react'

export const metadata = { title: 'New Project — eng.com' }

export default async function NewProjectPage() {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  async function action(formData: FormData) {
    'use server'
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) redirect('/login')

    const title = formData.get('title') as string
    const readme = formData.get('readme') as string
    const isPublic = !!formData.get('public')

    // 1. slugify
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // 2. bucket upload (one per file input named "files")
    const filesDescriptor: any[] = []
    for (const file of formData.getAll('files') as File[]) {
      const path = `${session.user.id}/${slug}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from(isPublic ? 'public' : 'private')
        .upload(path, file, { contentType: file.type })
      if (error) throw error
      filesDescriptor.push({
        name: file.name,
        path,
        size: file.size,
        mime: file.type,
      })
    }

    // 3. insert project + version
    const { data: project } = await supabase
      .from('projects')
      .insert({
        owner: session.user.id,
        slug,
        title,
        is_public: isPublic,
      })
      .select()
      .single()

    const { data: version } = await supabase
      .from('project_versions')
      .insert({
        project_id: project.id,
        version_no: 1,
        readme_md: readme,
        files: filesDescriptor,
      })
      .select()
      .single()

    await supabase
      .from('projects')
      .update({ current_version: version.id })
      .eq('id', project.id)

    revalidatePath('/gallery')
    redirect(`/projects/${user.user?.user_metadata.username}/${slug}`)
  }

  return (
    <form action={action} className="space-y-6">
      <input
        name="title"
        required
        placeholder="Project title"
        className="input input-lg w-full"
      />

      <FileUpload />

      <MarkdownEditor
        value=""
        onChange={() => {
          /* handled in client component, submitted through hidden textarea */
        }}
      />
      <textarea name="readme" className="hidden" />

      <label className="flex items-center gap-2">
        <input type="checkbox" name="public" defaultChecked /> Public
      </label>

      <button className="btn btn-primary w-full">Publish</button>
    </form>
  )
} 