import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TodoItem from './TodoItem';

export default function TodoList({ 
    todos, onToggle, onDelete, onEdit, onFocus, 
    onAddSubtask, onToggleSubtask, onDeleteSubtask,
    isDragEnabled 
}) {
    if (todos.length === 0) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No hay tareas pendientes. ¡Disfruta tu día!</p>
            </div>
        );
    }

    return (
        <div className="todo-list">
            <SortableContext
                items={todos}
                strategy={verticalListSortingStrategy}
                disabled={!isDragEnabled}
            >
                {todos.map(todo => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onFocus={onFocus}
                        onAddSubtask={onAddSubtask}
                        onToggleSubtask={onToggleSubtask}
                        onDeleteSubtask={onDeleteSubtask}
                        isDragEnabled={isDragEnabled}
                    />
                ))}
            </SortableContext>
        </div>
    );
}
