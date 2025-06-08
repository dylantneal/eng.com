/* Server component – gate the uploader behind authentication */
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import NewProjectForm from '@/app/components/new-project-form'

export const metadata = { title: 'New Project — eng.com' }

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  async function action(formData: FormData) {
    'use server'
    const supabase = await createClient()
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
        .from(isPublic ? 'projects' : 'projects-private')
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

    if (project) {
      await supabase.from('versions').insert({
        project_id: project.id,
        files: filesDescriptor,
        readme_md: readme,
      })
    }

    revalidatePath('/gallery')
    redirect(`/projects/${user.user?.user_metadata.username}/${slug}`)
  }

  return <NewProjectForm action={action} />
} 