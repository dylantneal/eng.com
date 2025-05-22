'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (accepted: File[]) => setFiles((prev) => [...prev, ...accepted].slice(0, 5)),
    [],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: 5,
    maxSize: 100 * 1024 * 1024,
  })

  return (
    <section
      {...getRootProps()}
      className={`border-dashed border-2 rounded p-6 cursor-pointer ${
        isDragActive ? 'border-primary' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps({ name: 'files', multiple: true })} />
      <p className="text-center text-gray-500">
        {isDragActive
          ? 'Drop the files here …'
          : 'Drag & drop up to 5 files here, or click to browse'}
      </p>
    </section>
  )
} 