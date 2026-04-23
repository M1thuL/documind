import { useState, useCallback, useEffect } from 'react'
import { api } from '../lib/api'

export function useDocuments() {
  const [documents, setDocuments]         = useState([])
  const [loading, setLoading]             = useState(false)
  const [uploading, setUploading]         = useState(false)
  const [uploadProgress, setProgress]     = useState(0)
  const [error, setError]                 = useState(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const docs = await api.getDocuments()
      setDocuments(docs.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  const uploadDocument = useCallback(async (file) => {
    setUploading(true); setProgress(0); setError(null)
    try {
      await api.uploadDocument(file, setProgress)
      await fetchDocuments()
    } catch (e) { setError(e.message); throw e }
    finally { setUploading(false); setProgress(0) }
  }, [fetchDocuments])

  const deleteDocument = useCallback(async (id) => {
    setError(null)
    try {
      await api.deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.document_id !== id))
    } catch (e) { setError(e.message); throw e }
  }, [])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  return { documents, loading, uploading, uploadProgress, error, uploadDocument, deleteDocument }
}
