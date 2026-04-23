import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

function SourceCard({ source, index }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ border:'1px solid var(--border)', borderRadius:'var(--r)', overflow:'hidden', background:'var(--bg3)', marginBottom:'5px' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', gap:'8px', padding:'6px 10px', background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer', color:'var(--text2)', fontFamily:'var(--font)', transition:'background var(--t)' }}
        onMouseEnter={e => e.currentTarget.style.background='var(--bg4)'}
        onMouseLeave={e => e.currentTarget.style.background='none'}>
        <span style={{ width:'18px', height:'18px', borderRadius:'4px', background:'var(--bg4)', border:'1px solid var(--border2)', fontSize:'10px', fontFamily:'var(--mono)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, color:'var(--text3)' }}>{index + 1}</span>
        <span style={{ flex:1, fontSize:'12px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {source.filename || source.document_id}{source.page != null ? ` · p.${source.page}` : ''}
        </span>
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
      </button>
      {open && <p style={{ padding:'8px 10px 10px', fontSize:'12px', lineHeight:'1.6', color:'var(--text2)', borderTop:'1px solid var(--border)', fontFamily:'var(--mono)', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{source.text}</p>}
    </div>
  )
}

function UserBubble({ content }) {
  return (
    <div className="fade-up" style={{ display:'flex', justifyContent:'flex-end', maxWidth:'820px', marginLeft:'auto', width:'100%' }}>
      <div style={{ background:'var(--accent)', color:'#fff', borderRadius:'16px 16px 4px 16px', padding:'10px 16px', fontSize:'14px', lineHeight:'1.6', maxWidth:'520px', wordBreak:'break-word' }}>
        {content}
      </div>
    </div>
  )
}

function AssistantBubble({ msg }) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  return (
    <div className="fade-up" style={{ display:'flex', alignItems:'flex-start', gap:'12px', maxWidth:'820px', width:'100%' }}>
      <div style={{ width:'28px', height:'28px', minWidth:'28px', background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', marginTop:'2px' }}>
        <Sparkles size={12} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', lineHeight:'1.75', color:'var(--text)' }} className="ai-answer">
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        </div>
        {msg.sources?.length > 0 && (
          <div style={{ marginTop:'12px' }}>
            <button onClick={() => setSourcesOpen(o => !o)}
              style={{ display:'inline-flex', alignItems:'center', gap:'5px', background:'none', border:'1px solid var(--border)', borderRadius:'20px', color:'var(--text3)', fontSize:'11px', fontFamily:'var(--font)', padding:'4px 10px', cursor:'pointer', marginBottom: sourcesOpen ? '8px' : '0', transition:'border-color var(--t), color var(--t)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text3)' }}>
              {sourcesOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              {msg.sources.length} source{msg.sources.length !== 1 ? 's' : ''}
            </button>
            {sourcesOpen && msg.sources.map((s, i) => <SourceCard key={i} source={s} index={i} />)}
          </div>
        )}
        <span style={{ fontSize:'10px', color:'var(--text3)', fontFamily:'var(--mono)', marginTop:'6px', display:'inline-block' }}>{msg.model}</span>
      </div>
    </div>
  )
}

function ErrorBubble({ content }) {
  return (
    <div className="fade-up" style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:'var(--r)', padding:'10px 14px', color:'var(--red)', fontSize:'13px', maxWidth:'820px' }}>
      <AlertCircle size={14} />{content}
    </div>
  )
}

function TypingDots() {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'12px', maxWidth:'820px' }}>
      <div style={{ width:'28px', height:'28px', minWidth:'28px', background:'var(--bg4)', border:'1px solid var(--border)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
        <Sparkles size={12} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'5px', paddingTop:'8px' }}>
        {[0,1,2].map(i => <span key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'var(--text3)', display:'block', animation:`pulse 1.2s ease ${i * .2}s infinite` }} />)}
      </div>
    </div>
  )
}

const SUGGESTIONS = ['Summarize the key points', 'What are the main obligations?', 'List all important dates and deadlines']

export default function ChatPanel({ messages, loading, onSend, onClear, selectedDocIds, docCount }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  function submit(e) {
    e?.preventDefault()
    const q = input.trim()
    if (!q || loading || docCount === 0) return
    setInput('')
    onSend(q, selectedDocIds)
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const scopeLabel = !selectedDocIds.length || selectedDocIds.length === docCount
    ? 'all documents' : `${selectedDocIds.length} selected doc${selectedDocIds.length > 1 ? 's' : ''}`

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:'44px', borderBottom:'1px solid var(--border)', background:'var(--bg2)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'7px', fontSize:'12px', color:'var(--text2)' }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', display:'inline-block' }} />
          Searching <strong style={{ color:'var(--text)', fontWeight:'500', marginLeft:'3px' }}>{scopeLabel}</strong>
        </div>
        {messages.length > 0 && (
          <button onClick={onClear}
            style={{ display:'flex', alignItems:'center', gap:'5px', background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text3)', fontSize:'12px', fontFamily:'var(--font)', padding:'4px 10px', cursor:'pointer', transition:'color var(--t), border-color var(--t)' }}
            onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='rgba(248,113,113,.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.borderColor='var(--border)' }}>
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 24px 8px', display:'flex', flexDirection:'column', gap:'20px' }}>
        {!messages.length && !loading && (
          <div style={{ margin:'auto', display:'flex', flexDirection:'column', alignItems:'center', gap:'14px', color:'var(--text3)', textAlign:'center', padding:'40px 20px' }}>
            <Sparkles size={32} strokeWidth={1} style={{ opacity:.3 }} />
            <div>
              <h2 style={{ fontSize:'18px', fontWeight:'500', color:'var(--text2)', letterSpacing:'-0.02em', marginBottom:'6px' }}>Ask your documents anything</h2>
              <p style={{ fontSize:'13px', lineHeight:'1.7', maxWidth:'340px' }}>Upload a PDF or text file, then ask questions.<br />Answers come only from your documents.</p>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', justifyContent:'center', marginTop:'4px' }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus() }}
                  style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'20px', color:'var(--text2)', fontSize:'12px', fontFamily:'var(--font)', padding:'6px 14px', cursor:'pointer', transition:'border-color var(--t), color var(--t), background var(--t)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accentdim)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text2)'; e.currentTarget.style.background='var(--bg3)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg =>
          msg.role === 'user'      ? <UserBubble key={msg.id} content={msg.content} /> :
          msg.role === 'assistant' ? <AssistantBubble key={msg.id} msg={msg} /> :
                                     <ErrorBubble key={msg.id} content={msg.content} />
        )}
        {loading && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', background:'var(--bg2)', display:'flex', alignItems:'flex-end', gap:'10px', flexShrink:0 }}>
        <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
          placeholder={docCount === 0 ? 'Upload a document to start asking questions…' : 'Ask a question… (Enter to send)'}
          disabled={docCount === 0} rows={1}
          style={{ flex:1, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'10px 14px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'14px', lineHeight:'1.6', resize:'none', outline:'none', minHeight:'42px', maxHeight:'160px', overflowY:'auto', transition:'border-color var(--t), box-shadow var(--t)', opacity: docCount === 0 ? .5 : 1 }}
          onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accentdim)' }}
          onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }}
        />
        <button onClick={submit} disabled={!input.trim() || loading || docCount === 0}
          style={{ width:'42px', height:'42px', minWidth:'42px', background:'var(--accent)', border:'none', borderRadius:'var(--r)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor: (!input.trim() || loading || docCount === 0) ? 'not-allowed' : 'pointer', opacity: (!input.trim() || loading || docCount === 0) ? .4 : 1, transition:'background var(--t), opacity var(--t)' }}
          onMouseEnter={e => { if(input.trim() && !loading && docCount > 0) e.currentTarget.style.background='var(--accent2)' }}
          onMouseLeave={e => e.currentTarget.style.background='var(--accent)'}>
          {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
        </button>
      </div>

      <style>{`
        .ai-answer p { margin-bottom: 10px; }
        .ai-answer p:last-child { margin-bottom: 0; }
        .ai-answer ul, .ai-answer ol { padding-left: 20px; margin-bottom: 10px; }
        .ai-answer li { margin-bottom: 4px; }
        .ai-answer strong { font-weight: 600; }
        .ai-answer code { font-family: var(--mono); font-size: 12px; background: var(--bg4); padding: 1px 5px; border-radius: 4px; color: var(--accent); }
      `}</style>
    </div>
  )
}
