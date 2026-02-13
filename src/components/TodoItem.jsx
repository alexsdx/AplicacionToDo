import { useState } from 'react';
import { Trash2, Check, X, AlertTriangle } from 'lucide-react';

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const [showConfirm, setShowConfirm] = useState(false);

    const urgencyLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
    };

    const urgencyColors = {
        high: 'var(--urgency-high)',
        medium: 'var(--urgency-medium)',
        low: 'var(--urgency-low)'
    };

    // 1. Handle Text Edit
    const handleEdit = () => {
        if (!editText.trim()) return; // Don't save empty
        onUpdate(todo.id, { text: editText });
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleEdit();
        if (e.key === 'Escape') {
            setEditText(todo.text);
            setIsEditing(false);
        }
    };

    // 2. Handle Priority Cycle (Low -> Medium -> High -> Low)
    const cyclePriority = (e) => {
        e.stopPropagation(); // Prevent opening edit mode if badges overlap (unlikely but safe)
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(todo.urgency);
        const nextPriority = priorities[(currentIndex + 1) % 3];
        onUpdate(todo.id, { urgency: nextPriority });
    };

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>

            {/* Checkbox */}
            <div
                className="checkbox"
                onClick={() => onToggle(todo.id)}
            >
                {todo.completed && <Check size={16} strokeWidth={3} />}
            </div>

            {/* Text / Input */}
            {isEditing ? (
                <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleEdit}
                    onKeyDown={handleKeyDown}
                    className="todo-input"
                    autoFocus
                    style={{ flex: 1, marginRight: '8px' }}
                />
            ) : (
                <span
                    className="todo-text"
                    onClick={() => setIsEditing(true)}
                    title="Haz click para editar"
                >
                    {todo.text}
                </span>
            )}

            {/* Priority Badge */}
            <span
                className={`urgency-badge urgency-${todo.urgency}`}
                onClick={cyclePriority}
                title="Click para cambiar prioridad"
                style={{ cursor: 'pointer', userSelect: 'none' }}
            >
                {urgencyLabels[todo.urgency]}
            </span>

            {/* Delete / Confirm Button */}
            {showConfirm ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        className="btn-delete"
                        onClick={() => onDelete(todo.id)}
                        style={{ color: '#ef4444', opacity: 1, background: '#fee2e2' }}
                        title="Confirmar eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        className="btn-delete"
                        onClick={() => setShowConfirm(false)}
                        style={{ color: 'var(--text-muted)', opacity: 1 }}
                        title="Cancelar"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <button
                    className="btn-delete"
                    onClick={() => setShowConfirm(true)}
                    title="Eliminar tarea"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
    );
}
