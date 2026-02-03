import { useState, useEffect } from 'react';
import { Plus, Calendar, Briefcase, User, Home, Book, Repeat, Mic, MicOff, Keyboard } from 'lucide-react';

export default function TodoForm({ onAdd }) {
    const [text, setText] = useState('');
    const [urgency, setUrgency] = useState('medium');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('personal');
    const [isHabit, setIsHabit] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Smart text parser for keyboard shortcuts
    const parseSmartText = (inputText) => {
        const lowerText = inputText.toLowerCase();
        let parsedUrgency = urgency;
        let parsedCategory = category;

        if (lowerText.includes('!!!') || lowerText.includes('urgente') || lowerText.includes('importante')) {
            parsedUrgency = 'high';
        } else if (lowerText.includes('!!') || lowerText.includes('pronto')) {
            parsedUrgency = 'medium';
        } else if (lowerText.includes('!') || lowerText.includes('tranquilo') || lowerText.includes('después')) {
            parsedUrgency = 'low';
        }

        if (lowerText.includes('#trabajo') || lowerText.includes('#work')) {
            parsedCategory = 'work';
        } else if (lowerText.includes('#personal') || lowerText.includes('#yo')) {
            parsedCategory = 'personal';
        } else if (lowerText.includes('#casa') || lowerText.includes('#home')) {
            parsedCategory = 'home';
        } else if (lowerText.includes('#estudio') || lowerText.includes('#study')) {
            parsedCategory = 'study';
        }

        const cleanedText = inputText
            .replace(/!!!|!!|!/g, '')
            .replace(/#trabajo|#work|#personal|#yo|#casa|#home|#estudio|#study/gi, '')
            .trim();

        return { text: cleanedText, urgency: parsedUrgency, category: parsedCategory };
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const parsed = parseSmartText(text);
        
        onAdd(parsed.text, parsed.urgency, dueDate, parsed.category, isHabit);
        setText('');
        setUrgency('medium');
        setDueDate('');
        setCategory('personal');
        setIsHabit(false);
    };

    const startListening = () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                setShowShortcuts(true);
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = 'es-ES';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            setIsListening(true);

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setText(transcript);
                
                const lower = transcript.toLowerCase();
                if (lower.includes('urgente') || lower.includes('importante')) {
                    setUrgency('high');
                }
                if (lower.includes('trabajo')) setCategory('work');
                else if (lower.includes('casa')) setCategory('home');
                else if (lower.includes('estudio')) setCategory('study');
                
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                setIsListening(false);
                // Silently show shortcuts instead of alerts
                if (event.error !== 'no-speech' && event.error !== 'aborted') {
                    setShowShortcuts(true);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
            
        } catch (error) {
            setIsListening(false);
            setShowShortcuts(true);
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
            {showShortcuts && (
                <div className="shortcuts-panel">
                    <div className="shortcuts-header">
                        <strong>⌨️ Atajos de Teclado</strong>
                        <button 
                            type="button" 
                            onClick={() => setShowShortcuts(false)}
                            className="btn-close-shortcuts"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="shortcuts-content">
                        <div><strong>Urgencia:</strong></div>
                        <div>• <code>!!!</code> = Alta → "!!! reunión importante"</div>
                        <div>• <code>!!</code> = Media → "!! revisar email"</div>
                        <div>• <code>!</code> = Baja → "! comprar pan"</div>
                        <div style={{ marginTop: '0.5rem' }}><strong>Categoría:</strong></div>
                        <div>• <code>#trabajo</code> o <code>#work</code></div>
                        <div>• <code>#personal</code> o <code>#yo</code></div>
                        <div>• <code>#casa</code> o <code>#home</code></div>
                        <div>• <code>#estudio</code> o <code>#study</code></div>
                        <div className="shortcuts-example">
                            <strong>Ejemplo:</strong> <code>!!! terminar proyecto #trabajo</code>
                        </div>
                    </div>
                </div>
            )}

            <div className="input-group">
                <button
                    type="button"
                    className={`btn-mic ${isListening ? 'listening' : ''}`}
                    onClick={startListening}
                    title="Dictar por voz"
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button
                    type="button"
                    className="btn-mic"
                    onClick={() => setShowShortcuts(!showShortcuts)}
                    title="Atajos de teclado"
                    style={{ background: showShortcuts ? 'var(--cat-personal-bg)' : 'transparent' }}
                >
                    <Keyboard size={18} />
                </button>

                <input
                    type="text"
                    className="todo-input"
                    placeholder="Tarea... (Prueba: !!! urgente #trabajo)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                />

                <div className="date-input-wrapper" title="Fecha">
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
                    title="Hábito diario"
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
