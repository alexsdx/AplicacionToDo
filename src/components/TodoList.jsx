import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTodoItem from './SortableTodoItem';
import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onDelete, onUpdate, onDragEnd }) {
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Require 8px movement before drag starts (prevents accidental clicks)
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }) // Mobile: Long press 250ms to drag
    );

    if (todos.length === 0) {
        return (
            <div className="glass-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No hay tareas pendientes. ¡Disfruta tu día!</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            <SortableContext
                items={todos.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="todo-list">
                    {todos.map(todo => (
                        <SortableTodoItem
                            key={todo.id}
                            id={todo.id}
                            todo={todo}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
