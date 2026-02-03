import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onDelete }) {
    if (todos.length === 0) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No hay tareas pendientes. ¡Disfruta tu día!</p>
            </div>
        );
    }

    return (
        <div className="todo-list">
            {todos.map(todo => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
