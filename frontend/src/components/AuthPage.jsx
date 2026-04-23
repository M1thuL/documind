import { useState } from 'react'
import { FileText, Loader2, Eye, EyeOff } from 'lucide-react'

const s = {
  root:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'var(--bg)' },
  card:    { width:'100%', maxWidth:'380px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--rlg)', padding:'36px 32px', animation:'fadeUp .3s ease both' },
  logo:    { display:'flex', alignItems:'center', gap:'8px', color:'var(--accent)', fontSize:'15px', fontWeight:'600', marginBottom:'28px', letterSpacing:'-0.01em' },
  title:   { fontSize:'22px', fontWeight:'600', letterSpacing:'-0.02em', marginBottom:'6px' },
  sub:     { fontSize:'13px', color:'var(--text2)', marginBottom:'28px' },
  form:    { display:'flex', flexDirection:'column', gap:'16px' },
  label:   { fontSize:'11px', fontWeight:'500', color:'var(--text2)', letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'6px', display:'block' },
  inputWrap: { position:'relative' },
  input:   { width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'10px 12px', color:'var(--text)', fontFamily:'var(--font)', fontSize:'14px', outline:'none', transition:'border-color var(--t), box-shadow var(--t)' },
  eyeBtn:  { position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', display:'flex', padding:'2px' },
  error:   { fontSize:'13px', color:'var(--red)', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.2)', borderRadius:'var(--r)', padding:'8px 12px' },
  btn:     { display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'var(--r)', padding:'11px', fontFamily:'var(--font)', fontSize:'14px', fontWeight:'500', cursor:'pointer', marginTop:'4px', transition:'background var(--t), opacity var(--t)' },
  toggle:  { marginTop:'20px', fontSize:'13px', color:'var(--text2)', textAlign:'center' },
  toggleBtn: { background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:'13px', fontFamily:'var(--font)', padding:'0' },
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode]       = useState('login')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null); setLoading(true)
    try { await onAuth(mode, email, password) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.logo}><FileText size={20} strokeWidth={1.5} /><span>DocuMind AI</span></div>
        <h1 style={s.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
        <p style={s.sub}>{mode === 'login' ? 'Sign in to your workspace' : 'Start querying your documents with AI'}</p>

        <form style={s.form} onSubmit={handleSubmit}>
          <div>
            <label style={s.label} htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" required autoFocus
              style={s.input}
              onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accentdim)' }}
              onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }} />
          </div>

          <div>
            <label style={s.label} htmlFor="password">Password</label>
            <div style={s.inputWrap}>
              <input id="password" type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPass(e.target.value)}
                placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
                minLength={mode === 'signup' ? 8 : undefined} required
                style={{ ...s.input, paddingRight:'36px' }}
                onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accentdim)' }}
                onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none' }} />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <button type="submit" style={{ ...s.btn, opacity: loading ? .6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            disabled={loading}
            onMouseEnter={e => { if(!loading) e.target.style.background='var(--accent2)' }}
            onMouseLeave={e => e.target.style.background='var(--accent)'}>
            {loading ? <Loader2 size={16} className="spin" /> : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={s.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button style={s.toggleBtn} onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null) }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
