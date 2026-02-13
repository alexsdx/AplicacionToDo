import { useState } from 'react';
import { Trash2, Check, GripVertical } from 'lucide-react';

export default function TodoItem({ todo, onToggle, onDelete, onUpdate, dragHandleProps }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const urgencyLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
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
        // STOP PROPAGATION of Space to prevent dnd-kit from triggering
        if (e.key === ' ') {
            e.stopPropagation();
        }
    };

    // 2. Handle Priority Cycle (Low -> Medium -> High -> Low)
    const cyclePriority = (e) => {
        e.stopPropagation();
        const priorities = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(todo.urgency);
        const nextPriority = priorities[(currentIndex + 1) % 3];
        onUpdate(todo.id, { urgency: nextPriority });
    };

    // 3. Handle Delete with Native Confirm
    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            onDelete(todo.id);
        }
    };

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            {/* Drag Handle - Only this part initiates drag */}
            <div
                {...dragHandleProps}
                className="drag-handle"
                style={{ cursor: 'grab', touchAction: 'none', color: '#cbd5e1', display: 'flex', alignItems: 'center' }}
            >
                <GripVertical size={20} />
            </div>

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
                    // Stop pointer down propagation to prevent dragging while editing (extra safety)
                    onPointerDown={(e) => e.stopPropagation()}
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

            {/* Delete Button */}
            <button
                className="btn-delete"
                onClick={handleDelete}
                title="Eliminar tarea"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
