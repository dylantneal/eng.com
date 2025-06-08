'use client'

import { useState } from 'react'
import FileUpload from '@/app/components/file-upload'
import MarkdownEditor from '@/app/components/markdown-editor'

type Props = {
  action: (formData: FormData) => Promise<void>
}

export default function NewProjectForm({ action }: Props) {
  const [readme, setReadme] = useState('')

  const handleSubmit = async (formData: FormData) => {
    // Add the readme content to the form data
    formData.set('readme', readme)
    await action(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input
        name="title"
        required
        placeholder="Project title"
        className="input input-lg w-full"
      />

      <FileUpload />

      <MarkdownEditor
        value={readme}
        onChange={setReadme}
      />

      <label className="flex items-center gap-2">
        <input type="checkbox" name="public" defaultChecked /> Public
      </label>

      <button className="btn btn-primary w-full">Publish</button>
    </form>
  )
} 