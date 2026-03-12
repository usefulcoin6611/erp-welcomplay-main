import React from "react"
import { FormDetailClient } from "./form-detail-client"

type FormField = {
  id: string
  name: string
  type: string
  required: boolean
}

type FormDetail = {
  id: string
  name: string
  code: string
  isActive: boolean
  isLeadActive: boolean
  responses: number
  fields: FormField[]
}

interface FormDetailPageProps {
  params: Promise<{ id: string }>
}

async function fetchFormDetail(id: string): Promise<FormDetail | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const baseUrl =
    appUrl && (appUrl.startsWith('http://') || appUrl.startsWith('https://'))
      ? appUrl
      : appUrl
        ? `https://${appUrl}`
        : 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/form-builder/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return null
  }

  const json = await res.json()

  if (!json?.success || !json.data) {
    return null
  }

  const data = json.data as any

  return {
    id: data.id as string,
    name: data.name as string,
    code: data.code as string,
    isActive: Boolean(data.isActive),
    isLeadActive: Boolean(data.isLeadActive),
    responses: Number(data.responses) || 0,
    fields: Array.isArray(data.fields)
      ? data.fields.map((f: any) => ({
          id: f.id as string,
          name: f.name as string,
          type: f.type as string,
          required: Boolean(f.required),
        }))
      : [],
  }
}

export default async function FormDetailPage({ params }: FormDetailPageProps) {
  const { id } = await params
  const form = (await fetchFormDetail(id)) ?? {
    id,
    name: id,
    code: '',
    isActive: false,
    isLeadActive: false,
    responses: 0,
    fields: [],
  }

  return <FormDetailClient initialForm={form} />
}
