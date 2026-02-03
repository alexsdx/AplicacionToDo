import { useState, useEffect } from 'react';
import { LayoutList, ArrowUpDown, Trash2, CheckCircle2 } from 'lucide-react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import ProgressBar from './components/ProgressBar';

function App() {
  // Load initial state from LocalStorage or empty array
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('premium-todos');
    return saved ? JSON.parse(saved) : [];
  });

  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'time'

  // Save to LocalStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('premium-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text, urgency) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      urgency, // 'high', 'medium', 'low'
      completed: false,
      createdAt: Date.now()
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const deleteCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const deleteAll = () => {
    setTodos([]);
  };

  // Sorting Logic
  const getSortedTodos = () => {
    const urgencyWeight = { high: 3, medium: 2, low: 1 };

    return [...todos].sort((a, b) => {
      // First, move completed items to bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Then sort by selected criteria
      if (sortBy === 'urgency') {
        const diff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        if (diff !== 0) return diff;
      }

      // Fallback to creation date (newest first)
      return b.createdAt - a.createdAt;
    });
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">Mi Agenda</h1>
        <p style={{ color: 'var(--text-muted)' }}>Organiza tu día con estilo</p>
      </header>

      <ProgressBar todos={todos} />

      <TodoForm onAdd={addTodo} />

      <div className="controls">
        {todos.length > 0 && (
          <>
            <button
              className="btn-sort"
              onClick={deleteCompleted}
              title="Eliminar tareas terminadas"
            >
              <CheckCircle2 size={16} />
              Borrar Completadas
            </button>

            <button
              className="btn-sort"
              onClick={deleteAll}
              style={{ color: 'var(--urgency-high)', borderColor: 'var(--urgency-high)', marginRight: 'auto' }}
              title="Eliminar absolutamente todo"
            >
              <Trash2 size={16} />
              Borrar Todo
            </button>
          </>
        )}

        <button
          className={`btn-sort ${sortBy === 'urgency' ? 'active' : ''}`}
          onClick={() => setSortBy('urgency')}
        >
          <LayoutList size={16} />
          Por Urgencia
        </button>
        <button
          className={`btn-sort ${sortBy === 'time' ? 'active' : ''}`}
          onClick={() => setSortBy('time')}
        >
          <ArrowUpDown size={16} />
          Por Fecha
        </button>
      </div>

      <TodoList
        todos={getSortedTodos()}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />
    </div >
  );
}

export default App;
