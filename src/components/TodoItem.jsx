import { Trash2, Check } from 'lucide-react';

export default function TodoItem({ todo, onToggle, onDelete }) {
    const urgencyLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
    };

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div
                className="checkbox"
                onClick={() => onToggle(todo.id)}
            >
                {todo.completed && <Check size={16} strokeWidth={3} />}
            </div>

            <span className="todo-text">{todo.text}</span>

            <span className={`urgency-badge urgency-${todo.urgency}`}>
                {urgencyLabels[todo.urgency]}
            </span>

            <button
                className="btn-delete"
                onClick={() => onDelete(todo.id)}
                title="Eliminar tarea"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
