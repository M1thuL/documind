import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileText, Trash2, Upload, Loader2, AlertCircle, CheckSquare, Square } from 'lucide-react'

function fmt(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DocumentPanel({ documents, loading, uploading, uploadProgress, error, selectedIds, onSelectionChange, onUpload, onDelete }) {
  const [deletingId, setDeletingId] = useState(null)

  const onDrop = useCallback(async (files) => {
    for (const f of files) { try { await onUpload(f) } catch {} }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    disabled: uploading, multiple: true,
  })

  async function handleDelete(e, id) {
    e.stopPropagation()
    setDeletingId(id)
    try { await onDelete(id); onSelectionChange(selectedIds.filter(x => x !== id)) }
    catch {} finally { setDeletingId(null) }
  }

  function toggle(id) {
    onSelectionChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  function toggleAll() {
    onSelectionChange(selectedIds.length === documents.length ? [] : documents.map(d => d.document_id))
  }

  return (
    <aside style={{ width:'256px', minWidth:'256px', height:'100%', background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
      <div style={{ padding:'14px 16px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'.06em', color:'var(--text2)' }}>Documents</span>
        <span style={{ fontSize:'11px', color:'var(--text3)', fontFamily:'var(--mono)', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'4px', padding:'1px 6px' }}>{documents.length}</span>
      </div>

      {/* Upload dropzone */}
      <div {...getRootProps()} style={{
        margin:'10px', border:`1px dashed ${isDragActive ? 'var(--accent)' : 'var(--border2)'}`,
        borderRadius:'var(--r)', padding:'13px 12px', cursor: uploading ? 'not-allowed' : 'pointer',
        background: isDragActive ? 'var(--accentdim)' : 'transparent',
        opacity: uploading ? .7 : 1, transition:'border-color var(--t), background var(--t)',
      }}>
        <input {...getInputProps()} />
        {uploading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'7px', color:'var(--accent)', fontSize:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <Loader2 size={14} className="spin" />
              <span>Uploading{uploadProgress > 0 ? ` ${uploadProgress}%` : '…'}</span>
            </div>
            {uploadProgress > 0 && (
              <div style={{ height:'3px', background:'var(--bg4)', borderRadius:'2px', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${uploadProgress}%`, background:'var(--accent)', borderRadius:'2px', transition:'width .15s ease' }} />
              </div>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', alignItems:'center', gap:'8px', color: isDragActive ? 'var(--accent)' : 'var(--text3)', fontSize:'12px' }}>
            <Upload size={13} />
            <span>{isDragActive ? 'Drop to upload' : 'Drop PDF / TXT — or click'}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin:'0 10px 8px', padding:'8px 10px', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:'var(--r)', display:'flex', gap:'6px', alignItems:'flex-start', color:'var(--red)', fontSize:'12px' }}>
          <AlertCircle size={13} style={{ marginTop:'1px', flexShrink:0 }} />{error}
        </div>
      )}

      {/* List */}
      {loading && !documents.length ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><Loader2 size={16} className="spin" style={{ color:'var(--text3)' }} /></div>
      ) : !documents.length ? (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'6px', color:'var(--text3)', fontSize:'12px', textAlign:'center', padding:'20px' }}>
          <FileText size={28} strokeWidth={1} style={{ opacity:.3 }} />
          <p>No documents yet</p>
          <p style={{ opacity:.7 }}>Upload a PDF or .txt file</p>
        </div>
      ) : (
        <>
          {/* Select all */}
          <div onClick={toggleAll} style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 16px', fontSize:'11px', color:'var(--text3)', cursor:'pointer', borderBottom:'1px solid var(--border)', userSelect:'none' }}
            onMouseEnter={e => e.currentTarget.style.color='var(--text2)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}>
            {selectedIds.length === documents.length && documents.length > 0
              ? <CheckSquare size={12} style={{ color:'var(--accent)' }} />
              : <Square size={12} />}
            <span>
              {selectedIds.length === 0 ? 'Select to filter search'
                : selectedIds.length === documents.length ? 'All docs selected'
                : `${selectedIds.length} / ${documents.length} selected`}
            </span>
          </div>

          <ul style={{ listStyle:'none', flex:1, overflowY:'auto', padding:'4px 0' }}>
            {documents.map(doc => {
              const sel = selectedIds.includes(doc.document_id)
              return (
                <li key={doc.document_id}
                  onClick={() => toggle(doc.document_id)}
                  className="fade-in"
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px 8px 16px', cursor:'pointer', background: sel ? 'var(--accentdim)' : 'transparent', transition:'background var(--t)' }}
                  onMouseEnter={e => { if(!sel) e.currentTarget.style.background='var(--bg3)' }}
                  onMouseLeave={e => { if(!sel) e.currentTarget.style.background='transparent' }}>
                  {sel ? <CheckSquare size={12} style={{ color:'var(--accent)', flexShrink:0 }} /> : <Square size={12} style={{ color:'var(--text3)', flexShrink:0 }} />}
                  <FileText size={13} style={{ color: sel ? 'var(--accent)' : 'var(--text3)', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'13px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color:'var(--text)' }} title={doc.filename}>{doc.filename}</div>
                    <div style={{ fontSize:'11px', color:'var(--text3)', fontFamily:'var(--mono)' }}>{doc.chunks_stored}c · {fmt(doc.uploaded_at)}</div>
                  </div>
                  <button onClick={e => handleDelete(e, doc.document_id)} disabled={deletingId === doc.document_id}
                    title="Delete"
                    style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', padding:'3px', borderRadius:'4px', display:'flex', flexShrink:0, opacity:0, transition:'opacity var(--t), color var(--t)' }}
                    className="doc-delete-btn"
                    onMouseEnter={e => e.currentTarget.style.color='var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}>
                    {deletingId === doc.document_id ? <Loader2 size={12} className="spin" /> : <Trash2 size={12} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}

      <style>{`.doc-delete-btn { opacity: 0 !important; } li:hover .doc-delete-btn { opacity: 1 !important; }`}</style>
    </aside>
  )
}
