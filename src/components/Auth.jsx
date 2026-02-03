import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Mail, Loader2, Send } from 'lucide-react'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Using Magic Link login for simplicity
        const { error } = await supabase.auth.signInWithOtp({ email })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: '¡Enlace mágico enviado! Revisa tu correo.' })
        }
        setLoading(false)
    }

    return (
        <div className="container" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="glass-card">
                <h1 className="app-title">Bienvenido</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
                    Ingresa tu correo para guardar tus tareas en la nube.
                </p>

                {message && (
                    <div style={{
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        background: message.type === 'error' ? '#fee2e2' : '#d1fae5',
                        color: message.type === 'error' ? '#ef4444' : '#10b981'
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleLogin} className="input-group" style={{ flexDirection: 'column' }}>
                    <input
                        className="todo-input"
                        type="email"
                        placeholder="Tu correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ textAlign: 'center' }}
                    />
                    <button className="btn-add" disabled={loading} style={{ justifyContent: 'center' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Enviar enlace de acceso</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
