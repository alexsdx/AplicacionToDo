import { useState } from 'react';
import { Plus, Calendar, Briefcase, User, Home, Book, Repeat, Mic, MicOff } from 'lucide-react';

export default function TodoForm({ onAdd }) {
    const [text, setText] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('personal');
    const [isHabit, setIsHabit] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onAdd(text, urgency, dueDate, category, isHabit);
        setText('');
        setUrgency('medium');
        setDueDate('');
        setCategory('personal');
        setIsHabit(false);
    };

    const startListening = () => {
        // Check for HTTPS requirement (except localhost)
        const isSecureContext = window.isSecureContext;
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';

        if (!isSecureContext && !isLocalhost) {
            alert('⚠️ El reconocimiento de voz requiere HTTPS. Por favor usa una conexión segura.');
            console.error('Voice recognition requires HTTPS in production');
            return;
        }

        // Support for standard SpeechRecognition or webkitSpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('❌ Tu navegador no soporta reconocimiento de voz.\n\n✅ Navegadores compatibles:\n• Google Chrome\n• Microsoft Edge\n• Safari (iOS 14.5+)');
            console.error('SpeechRecognition API not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES'; // Spanish
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setIsListening(true);
        console.log('🎤 Iniciando reconocimiento de voz...');

        recognition.onstart = () => {
            console.log('🎤 Reconocimiento de voz activado. Habla ahora...');
        };

        recognition.onresult = (event) => {
            console.log('✅ Resultado recibido:', event);
            
            // Check if results exist
            if (event.results && event.results[0]) {
                const transcript = event.results[0][0].transcript;
                const confidence = event.results[0][0].confidence;
                
                console.log(`📝 Transcripción: "${transcript}" (confianza: ${(confidence * 100).toFixed(1)}%)`);
                setText(transcript);
                
                // Smart detection of urgency and category
                const lowerText = transcript.toLowerCase();
                if (lowerText.includes('urgente') || lowerText.includes('importante') || lowerText.includes('ahora')) {
                    setUrgency('high');
                    console.log('⚡ Detectada urgencia ALTA');
                } else if (lowerText.includes('tranquilo') || lowerText.includes('después')) {
                    setUrgency('low');
                    console.log('🌊 Detectada urgencia BAJA');
                }
                
                if (lowerText.includes('trabajo') || lowerText.includes('oficina')) {
                    setCategory('work');
                    console.log('💼 Categoría: Trabajo');
                } else if (lowerText.includes('casa') || lowerText.includes('hogar')) {
                    setCategory('home');
                    console.log('🏠 Categoría: Casa');
                } else if (lowerText.includes('estudio') || lowerText.includes('tarea')) {
                    setCategory('study');
                    console.log('📚 Categoría: Estudio');
                }
            }
            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error('❌ Error de reconocimiento de voz:', event.error, event);
            setIsListening(false);
            
            let errorMessage = '❌ Error de reconocimiento de voz: ';
            
            switch(event.error) {
                case 'not-allowed':
                    errorMessage += 'Permiso de micrófono denegado.\n\n🔧 Solución:\n1. Haz clic en el ícono del candado en la barra de direcciones\n2. Permite el acceso al micrófono\n3. Recarga la página';
                    break;
                case 'no-speech':
                    console.log('⚠️ No se detectó voz. Intentando nuevamente...');
                    return; // Don't show alert for this
                case 'audio-capture':
                    errorMessage += 'No se pudo capturar audio.\n\n🔧 Verifica:\n• Tu micrófono está conectado\n• Otra aplicación no está usando el micrófono';
                    break;
                case 'network':
                    errorMessage += 'Error de red.\n\n🔧 Verifica tu conexión a internet';
                    break;
                case 'aborted':
                    console.log('ℹ️ Reconocimiento de voz cancelado');
                    return; // Don't show alert
                case 'service-not-allowed':
                    errorMessage += 'Servicio no disponible.\n\n🔧 Asegúrate de estar usando HTTPS (o localhost)';
                    break;
                default:
                    errorMessage += `${event.error}\n\nIntenta nuevamente o usa Chrome/Edge.`;
            }
            
            alert(errorMessage);
        };

        recognition.onend = () => {
            console.log('🎤 Reconocimiento de voz finalizado');
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (e) {
            console.error('❌ Error al iniciar el reconocimiento:', e);
            setIsListening(false);
            alert('❌ No se pudo iniciar el reconocimiento de voz.\n\n' + e.message);
        }
    };

    const categories = [
        { id: 'personal', icon: User, label: 'Personal' },
        { id: 'work', icon: Briefcase, label: 'Trabajo' },
        { id: 'home', icon: Home, label: 'Casa' },
        { id: 'study', icon: Book, label: 'Estudio' }
    ];

    return (
        <form onSubmit={handleSubmit} className="glass-card">
            <div className="input-group">
                <button
                    type="button"
                    className={`btn-mic ${isListening ? 'listening' : ''}`}
                    onClick={startListening}
                    title="Dictar tarea por voz (requiere HTTPS en producción)"
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                    type="text"
                    className="todo-input"
                    placeholder="¿Qué necesitas hacer hoy?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                />

                <div className="date-input-wrapper" title="Fecha de vencimiento">
                    <Calendar size={18} className="calendar-icon" />
                    <input
                        type="date"
                        className="date-input"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <div className="select-wrapper">
                    <select
                        className="select-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    type="button"
                    className={`btn-habit ${isHabit ? 'active' : ''}`}
                    onClick={() => setIsHabit(!isHabit)}
                    title="Hábito diario (se repite)"
                >
                    <Repeat size={18} />
                </button>

                <select
                    className="select-urgency"
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                </select>

                <button type="submit" className="btn-add">
                    <Plus size={20} />
                    <span>Agregar</span>
                </button>
            </div>
        </form>
    );
}
