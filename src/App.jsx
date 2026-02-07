import { useState, useEffect } from 'react';
import { LayoutList, ArrowUpDown, Trash2, CheckCircle2, LogOut } from 'lucide-react';
import { supabase } from './supabaseClient';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null)
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('urgency'); // 'urgency' | 'time'

  // 1. Manage Session State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Fetch Todos when user login
  useEffect(() => {
    if (session) {
      fetchTodos()
    }
  }, [session])

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) setTodos(data)
  }

  const addTodo = async (text, urgency) => {
    const { data, error } = await supabase
      .from('todos')
      .insert([{ text, urgency, completed: false, user_id: session.user.id }])
      .select()

    if (!error && data) {
      setTodos([data[0], ...todos])
    }
  };

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id)
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id)

    if (!error) {
      setTodos(todos.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    }
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (!error) {
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  const deleteCompleted = async () => {
    const { error } = await supabase.from('todos').delete().eq('completed', true)
    if (!error) {
      setTodos(todos.filter(t => !t.completed));
    }
  };

  const deleteAll = async () => {
    const { error } = await supabase.from('todos').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Create complex filter to delete all
    if (!error) {
      setTodos([]);
    }
  };

  // Sorting Logic (Client side sorting is fine for small lists)
  const getSortedTodos = () => {
    const urgencyWeight = { high: 3, medium: 2, low: 1 };

    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      if (sortBy === 'urgency') {
        const diff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        if (diff !== 0) return diff;
      }

      // Use string comparison for timestamps if needed, or Date
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  if (!session) {
    return <Auth />
  }

  return (
    <div className="dashboard-layout">
      {/* LEFT SIDEBAR: Fixed Controls */}
      <aside className="sidebar">
        <header className="app-header">
          <h1 className="app-title">Mi Agenda</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {session.user.email}
            <button
              onClick={() => supabase.auth.signOut()}
              style={{ marginLeft: '8px', verticalAlign: 'middle', color: 'var(--urgency-high)' }}
              title="Cerrar Sessión"
            >
              <LogOut size={14} />
            </button>
          </p>
        </header>

        <TodoForm onAdd={addTodo} />

        <div className="controls">
          <button
            className={`btn-sort ${sortBy === 'urgency' ? 'active' : ''}`}
            onClick={() => setSortBy('urgency')}
          >
            <LayoutList size={18} />
            Por Urgencia
          </button>
          <button
            className={`btn-sort ${sortBy === 'time' ? 'active' : ''}`}
            onClick={() => setSortBy('time')}
          >
            <ArrowUpDown size={18} />
            Por Fecha
          </button>

          {todos.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }}></div>
              <button
                className="btn-sort"
                onClick={deleteCompleted}
                title="Eliminar tareas terminadas"
              >
                <CheckCircle2 size={18} />
                Limpiar Completadas
              </button>

              <button
                className="btn-sort"
                onClick={deleteAll}
                style={{ color: 'var(--urgency-high)' }}
                title="Eliminar absolutamente todo"
              >
                <Trash2 size={18} />
                Borrar Todo
              </button>
            </>
          )}
        </div>
      </aside>

      {/* RIGHT MAIN: Scrollable List */}
      <main className="main-content">
        <TodoList
          todos={getSortedTodos()}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      </main>
    </div >
  );
}

export default App;
