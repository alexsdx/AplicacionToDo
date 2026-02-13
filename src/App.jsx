import { useState, useEffect } from 'react';
import { LayoutList, ArrowUpDown, Trash2, CheckCircle2, LogOut, AlertTriangle } from 'lucide-react';
import { arrayMove } from '@dnd-kit/sortable';
import { supabase } from './supabaseClient';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null)
  const [todos, setTodos] = useState([]);
  const [sortBy, setSortBy] = useState('manual'); // 'manual' | 'urgency' | 'time'

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

  // 0. Self-Healing: Fix legacy items with position 0
  const checkAndFixPositions = async (todos) => {
    const zeroPositionItems = todos.filter(t => t.position === 0 || t.position === null);

    // If we have more than 1 item with position 0, we need to fix them
    if (zeroPositionItems.length > 1) {
      console.log('Detected legacy items. Fixing positions...');

      // Sort by creation time (oldest first) to give them a natural order
      const sortedByTime = [...todos].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const updates = sortedByTime.map((todo, index) => ({
        id: todo.id,
        position: (index + 1) * 1000 // 1000, 2000, 3000...
      }));

      // Update locally immediately
      setTodos(sortedByTime.map((t, i) => ({ ...t, position: (i + 1) * 1000 })));

      // Update in Supabase (Batch update would be better, but loop is okay for now)
      for (const update of updates) {
        await supabase.from('todos').update({ position: update.position }).eq('id', update.id);
      }
    }
  };

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTodos(data);
      checkAndFixPositions(data);
    }
  }

  const addTodo = async (text, urgency) => {
    // Determine new position (Top of list = min position / 2)
    const minPosition = todos.length > 0 ? Math.min(...todos.map(t => t.position || 0)) : 0;
    const newPosition = minPosition > 0 ? minPosition / 2 : 1000;

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        text,
        urgency,
        completed: false,
        user_id: session.user.id,
        position: newPosition
      }])
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

  const updateTodo = async (id, updates) => {
    const { error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id);

    if (!error) {
      setTodos(todos.map(t => (t.id === id ? { ...t, ...updates } : t)));
    }
  };

  // 5. Handle Drag End
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // CRITICAL: Calculate positions based on the VISUAL ORDER (sortedTodos), not the raw state order
      const currentSortedItems = getSortedTodos();

      const oldIndex = currentSortedItems.findIndex((i) => i.id === active.id);
      const newIndex = currentSortedItems.findIndex((i) => i.id === over.id);

      // Create a copy of the raw todos to update state
      const newTodos = [...todos];
      const todoIndexInState = newTodos.findIndex(t => t.id === active.id);

      // Calculate new position
      // We look at the neighbors in the SORTED list
      // Target is newIndex. 
      // Prev item is newIndex - 1 (if moving down) or newIndex (if moving up? No, arrayMove handles index shift)

      // Let's simulate the move in the sorted array first to get neighbors
      const simulatedList = arrayMove(currentSortedItems, oldIndex, newIndex);
      const prevItem = simulatedList[newIndex - 1];
      const nextItem = simulatedList[newIndex + 1];

      let newPosition;
      if (!prevItem && !nextItem) {
        newPosition = 1000;
      } else if (!prevItem) {
        newPosition = (nextItem.position || 0) / 2;
      } else if (!nextItem) {
        newPosition = (prevItem.position || 0) + 1000;
      } else {
        newPosition = ((prevItem.position || 0) + (nextItem.position || 0)) / 2;
      }

      // Update state
      newTodos[todoIndexInState].position = newPosition;
      setTodos(newTodos);

      // Persist
      updateTodo(active.id, { position: newPosition });
    }
  };

  // Sorting Logic (Client side sorting is fine for small lists)
  const getSortedTodos = () => {
    // If we are in 'manual' mode (which is default if we have positions), we sort by position
    // But user can override with buttons

    // For now, let's make 'manual' (position) the default sort
    const urgencyWeight = { high: 3, medium: 2, low: 1 };

    return [...todos].sort((a, b) => {
      // 1. Completed items at bottom always
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // 2. Explicit User Sort overrides Position
      if (sortBy === 'urgency') {
        const diff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        if (diff !== 0) return diff;
      }

      if (sortBy === 'time') {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      // 3. Default: Sort by Position (asc) -> Newest created as fallback
      if (a.position !== b.position) return (a.position || 0) - (b.position || 0);

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
            className={`btn-sort ${sortBy === 'manual' ? 'active' : ''}`}
            onClick={() => setSortBy('manual')}
            title="Orden Manual (Arrastrar y Soltar)"
          >
            <LayoutList size={18} />
            Mi Orden
          </button>

          <button
            className={`btn-sort ${sortBy === 'urgency' ? 'active' : ''}`}
            onClick={() => setSortBy('urgency')}
          >
            <AlertTriangle size={18} />
            Urgencia
          </button>
          <button
            className={`btn-sort ${sortBy === 'time' ? 'active' : ''}`}
            onClick={() => setSortBy('time')}
          >
            <ArrowUpDown size={18} />
            Fecha
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
          onUpdate={updateTodo}
          onDragEnd={handleDragEnd}
        />
      </main>
    </div >
  );
}

export default App;
