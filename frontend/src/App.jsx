import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useDocuments } from './hooks/useDocuments'
import { useChat } from './hooks/useChat'
import AuthPage from './components/AuthPage'
import Topbar from './components/Topbar'
import DocumentPanel from './components/DocumentPanel'
import ChatPanel from './components/ChatPanel'

export default function App() {
  const { user, login, signup, logout } = useAuth()
  const { documents, loading: docsLoading, uploading, uploadProgress, error: docsError, uploadDocument, deleteDocument } = useDocuments()
  const { messages, loading: chatLoading, sendMessage, clearChat } = useChat()
  const [selectedIds, setSelectedIds] = useState([])

  async function handleAuth(mode, email, password) {
    if (mode === 'login') await login(email, password)
    else await signup(email, password)
  }

  if (!user) return <AuthPage onAuth={handleAuth} />

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <Topbar user={user} onLogout={logout} />
      <div style={{ flex:1, display:'flex', overflow:'hidden', minHeight:0 }}>
        <DocumentPanel
          documents={documents}
          loading={docsLoading}
          uploading={uploading}
          uploadProgress={uploadProgress}
          error={docsError}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onUpload={uploadDocument}
          onDelete={deleteDocument}
        />
        <ChatPanel
          messages={messages}
          loading={chatLoading}
          onSend={sendMessage}
          onClear={clearChat}
          selectedDocIds={selectedIds}
          docCount={documents.length}
        />
      </div>
    </div>
  )
}
