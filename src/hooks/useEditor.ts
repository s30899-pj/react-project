import { useContext } from 'react'
import { EditorContext } from '@/context/EditorContext'

export function useEditor() {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error('useEditor musi być użyty wewnątrz <EditorProvider>')
  return ctx
}
