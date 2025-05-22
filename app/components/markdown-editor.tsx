'use client'

import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github.css'

type Props = {
  value: string
  onChange(v: string): void
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <button
          className="btn"
          onClick={() => setPreview(false)}
          data-active={!preview}
        >
          Edit
        </button>
        <button
          className="btn"
          onClick={() => setPreview(true)}
          data-active={preview}
        >
          Preview
        </button>
      </div>

      {!preview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          className="textarea w-full font-mono"
        />
      ) : (
        <article className="prose max-w-none">
          <Markdown remarkPlugins={[remarkGfm as any]}>{value}</Markdown>
        </article>
      )}
    </div>
  )
} 