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
        if (!('webkitSpeechRecognition' in window)) {
            alert('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome.');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setText(transcript);
            
            // Smart detection
            const lowerText = transcript.toLowerCase();
            if (lowerText.includes('urgente') || lowerText.includes('importante')) {
                setUrgency('high');
            } else if (lowerText.includes('trabajo')) {
                setCategory('work');
            } else if (lowerText.includes('casa')) {
                setCategory('home');
            }

            setIsListening(false);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
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
                    title="Dictar tarea"
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
