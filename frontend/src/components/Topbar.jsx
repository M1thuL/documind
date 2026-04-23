import { FileText, LogOut } from 'lucide-react'

export default function Topbar({ user, onLogout }) {
  return (
    <header style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      height:'48px', padding:'0 20px',
      background:'var(--bg2)', borderBottom:'1px solid var(--border)',
      flexShrink:0, zIndex:10,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--accent)', fontSize:'14px', fontWeight:'600', letterSpacing:'-0.01em' }}>
        <FileText size={17} strokeWidth={1.5} />
        DocuMind AI
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <span style={{ fontSize:'12px', color:'var(--text3)', fontFamily:'var(--mono)' }}>{user.email}</span>
        <button onClick={onLogout} title="Sign out"
          style={{ background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text3)', cursor:'pointer', padding:'5px 8px', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontFamily:'var(--font)', transition:'color var(--t), border-color var(--t)' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='rgba(248,113,113,.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text3)'; e.currentTarget.style.borderColor='var(--border)' }}>
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </header>
  )
}
