import { createClient } from '@/utils/supabase-server'
import { notFound } from 'next/navigation'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import TipJar from '@/app/components/tip-jar'
import type { Database } from '@/types/database'

export const revalidate = 30 // ISR

type Props = {
  params: { username: string; slug: string }
}

export default async function ProjectPage({ params }: Props) {
  const supabase = createClient()

  const { data: owner } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!owner) notFound()

  type ProjectWithVersions =
    Database['public']['Tables']['projects']['Row'] & {
      project_versions: Database['public']['Tables']['project_versions']['Row'][]
    }

  const { data: project } = await supabase
    .from('projects')
    .select('*, project_versions(*)')
    .eq('owner', owner.id)
    .eq('slug', params.slug)
    .maybeSingle<ProjectWithVersions>()

  if (!project) notFound()

  const version = project.project_versions[0]

  return (
    <main className="prose mx-auto py-10">
      <h1>{project.title}</h1>
      <p className="text-gray-500">
        by <strong>{params.username}</strong>
      </p>

      <article>
        <Markdown remarkPlugins={[remarkGfm as any]}>{version.readme_md}</Markdown>
      </article>

      {owner.tip_jar_on && (
        <TipJar projectId={project.id} payeeId={owner.id} />
      )}
    </main>
  )
} 