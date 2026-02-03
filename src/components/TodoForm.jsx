import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';

export default function TodoForm({ onAdd }) {
    const [text, setText] = useState('');
    const [urgency, setUrgency] = useState('medium');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onAdd(text, urgency);
        setText('');
        setUrgency('medium');
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card">
            <div className="input-group">
                <input
                    type="text"
                    className="todo-input"
                    placeholder="¿Qué necesitas hacer hoy?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    autoFocus
                />

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
