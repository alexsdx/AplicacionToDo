import { useState } from 'react';
import { Trash2, Check, Edit2, Save, X, Calendar, Clock, GripVertical, Briefcase, User, Home, Book, Timer, ListChecks, Plus, Repeat } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TodoItem({ 
    todo, onToggle, onDelete, onEdit, onFocus, 
    onAddSubtask, onToggleSubtask, onDeleteSubtask,
    isDragEnabled 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [showSubtasks, setShowSubtasks] = useState(false);
    
    // Category Icons Map
    const CategoryIcons = {
        work: Briefcase,
        personal: User,
        home: Home,
        study: Book
    };

    const CategoryLabel = {
        work: 'Trabajo',
        personal: 'Personal',
        home: 'Casa',
        study: 'Estudio'
    };
    
    // DnD Hooks
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: todo.id, disabled: !isDragEnabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // Prevent scrolling while dragging
        position: 'relative',
        zIndex: isDragging ? 999 : 'auto',
    };

    const [editText, setEditText] = useState(todo.text);
    const [editUrgency, setEditUrgency] = useState(todo.urgency);
    const [editDueDate, setEditDueDate] = useState(todo.dueDate || '');
    const [editCategory, setEditCategory] = useState(todo.category || 'personal');
    const [editIsHabit, setEditIsHabit] = useState(todo.isHabit || false);
    
    const urgencyLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja'
    };

    const handleSave = () => {
        if (editText.trim()) {
            onEdit(todo.id, editText, editUrgency, editDueDate, editCategory, editIsHabit);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setEditText(todo.text);
        setEditUrgency(todo.urgency);
        setEditDueDate(todo.dueDate || '');
        setEditCategory(todo.category || 'personal');
        setEditIsHabit(todo.isHabit || false);
        setIsEditing(false);
    };

    // Helper to format date friendly (e.g., "Hoy", "Mañana" or "12 Oct")
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString + 'T00:00:00'); // Fix timezone issue
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return <span className="date-overdue">Venció hace {Math.abs(diffDays)}d</span>;
        if (diffDays === 0) return <span className="date-today">Hoy</span>;
        if (diffDays === 1) return <span className="date-soon">Mañana</span>;

        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (newSubtaskText.trim()) {
            onAddSubtask(todo.id, newSubtaskText);
            setNewSubtaskText('');
        }
    };

    const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = todo.subtasks?.length || 0;
    const subtaskProgress = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

    if (isEditing) {
        return (
            <div
                className="todo-item editing"
                ref={setNodeRef}
                style={style}
            >
                <div className="editing-row">
                    <input
                        type="text"
                        className="todo-input-edit"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="editing-controls">
                    <div className="date-input-wrapper-edit">
                        <Calendar size={16} />
                        <input
                            type="date"
                            className="date-input-edit"
                            value={editDueDate}
                            onChange={(e) => setEditDueDate(e.target.value)}
                        />
                    </div>
                    <select
                        className="select-urgency-edit"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                    >
                        <option value="personal">Personal</option>
                        <option value="work">Trabajo</option>
                        <option value="home">Casa</option>
                        <option value="study">Estudio</option>
                    </select>
                    <button 
                        className={`btn-icon ${editIsHabit ? 'active-habit' : ''}`}
                        onClick={() => setEditIsHabit(!editIsHabit)}
                        title="Hábito recurrente"
                        style={{ border: '1px solid #cbd5e1' }}
                    >
                        <Repeat size={16} />
                    </button>
                    <select
                        className="select-urgency-edit"
                        value={editUrgency}
                        onChange={(e) => setEditUrgency(e.target.value)}
                    >
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                    </select>
                    <div className="actions">
                        <button className="btn-icon btn-save" onClick={handleSave} title="Guardar">
                            <Save size={18} />
                        </button>
                        <button className="btn-icon btn-cancel" onClick={handleCancel} title="Cancelar">
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
            ref={setNodeRef}
            style={style}
        >
            {isDragEnabled && (
                <div
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                    title="Arrastrar para reordenar"
                >
                    <GripVertical size={16} className="grip-icon" />
                </div>
            )}

            <div
                className="checkbox"
                onClick={() => onToggle(todo.id)}
            >
                {todo.completed && <Check size={16} strokeWidth={3} />}
            </div>

            <div className="todo-content">
                <div className="todo-main-row">
                    <span className="todo-text">
                        {todo.isHabit && <Repeat size={14} style={{ marginRight: 6, color: 'var(--color-secondary)' }} />}
                        {todo.text}
                    </span>
                    {todo.dueDate && (
                        <div className="todo-meta">
                            <Clock size={12} />
                            {formatDate(todo.dueDate)}
                        </div>
                    )}
                </div>
                
                {/* Subtask Progress Bar (Mini) */}
                {totalSubtasks > 0 && (
                    <div className="subtask-progress-mini">
                        <div className="subtask-bar" style={{ width: `${subtaskProgress}%` }}></div>
                        <span className="subtask-count">{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                )}

                {/* Subtasks Section */}
                {showSubtasks && (
                    <div className="subtasks-container">
                        <div className="subtasks-list">
                            {todo.subtasks?.map(st => (
                                <div key={st.id} className="subtask-item">
                                    <div 
                                        className={`subtask-checkbox ${st.completed ? 'checked' : ''}`}
                                        onClick={() => onToggleSubtask(todo.id, st.id)}
                                    >
                                        {st.completed && <Check size={10} />}
                                    </div>
                                    <span className={`subtask-text ${st.completed ? 'completed' : ''}`}>
                                        {st.text}
                                    </span>
                                    <button 
                                        className="btn-delete-subtask"
                                        onClick={() => onDeleteSubtask(todo.id, st.id)}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddSubtask} className="subtask-form">
                            <input 
                                type="text" 
                                placeholder="Nueva subtarea..." 
                                className="subtask-input"
                                value={newSubtaskText}
                                onChange={(e) => setNewSubtaskText(e.target.value)}
                            />
                            <button type="submit" className="btn-add-subtask">
                                <Plus size={14} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Category Badge */}
            {todo.category && (
                <span className={`category-badge cat-${todo.category}`}>
                    {CategoryIcons[todo.category] && (
                        <span style={{ display: 'flex' }}>
                            {(() => {
                                const Icon = CategoryIcons[todo.category];
                                return <Icon size={12} />;
                            })()}
                        </span>
                    )}
                    {CategoryLabel[todo.category]}
                </span>
            )}

            <span className={`urgency-badge urgency-${todo.urgency}`}>
                {urgencyLabels[todo.urgency]}
            </span>

            <div className="actions">
                {!todo.completed && (
                    <button
                        className={`btn-icon btn-subtasks ${showSubtasks ? 'active' : ''}`}
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        title="Ver subtareas"
                    >
                        <ListChecks size={18} />
                    </button>
                )}
                {!todo.completed && (
                    <button
                        className="btn-icon btn-focus"
                        onClick={() => onFocus(todo)}
                        title="Modo Pomodoro"
                        style={{ color: 'var(--color-primary)' }}
                    >
                        <Timer size={18} />
                    </button>
                )}
                <button
                    className="btn-icon btn-edit"
                    onClick={() => setIsEditing(true)}
                    title="Editar tarea"
                >
                    <Edit2 size={18} />
                </button>
                <button
                    className="btn-icon btn-delete"
                    onClick={() => onDelete(todo.id)}
                    title="Eliminar tarea"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
