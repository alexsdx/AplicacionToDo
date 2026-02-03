import { useState, useEffect } from 'react';
import { LayoutList, ArrowUpDown, Trash2, CheckCircle2, Moon, Sun, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import Stats from './components/Stats';
import PomodoroOverlay from './components/PomodoroOverlay';
import UserProfile from './components/UserProfile';
import SearchBar from './components/SearchBar';
import ThemeStore from './components/ThemeStore';
import CalendarView from './components/CalendarView';
import ZenModeOverlay from './components/ZenModeOverlay';
import { Palette, Calendar as CalendarIcon, List, Eye } from 'lucide-react';
import { useRef } from 'react';

function App() {
  // Theme State
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  const [unlockedThemes, setUnlockedThemes] = useState(() => {
    const saved = localStorage.getItem('unlocked-themes');
    return saved ? JSON.parse(saved) : ['light', 'dark'];
  });

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  // Apply theme to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e) => {
          // Ctrl/Cmd + K -> Focus Search
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              searchInputRef.current?.focus();
          }
          // Escape -> Close things
          if (e.key === 'Escape') {
              setIsStoreOpen(false);
              setSearchQuery('');
              setActivePomodoroTask(null);
              // setViewMode('list'); // Optional
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
      localStorage.setItem('unlocked-themes', JSON.stringify(unlockedThemes));
  }, [unlockedThemes]);

  const toggleTheme = () => {
    // Simple toggle between light/dark, or cycle if basic
    // But now we have a store, so maybe this button just opens the store?
    // Let's keep it as a quick toggle for light/dark for convenience
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleBuyTheme = (themeId, price) => {
      if (userProfile.xp >= price) {
          addXp(-price); // Dedcut XP
          setUnlockedThemes([...unlockedThemes, themeId]);
      }
  };

  const handleEquipTheme = (themeId) => {
      setTheme(themeId);
      setIsStoreOpen(false);
  };
  
  // Load initial state from LocalStorage or empty array
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('premium-todos');
    let parsedTodos = saved ? JSON.parse(saved) : [];
    
    // Check for habits reset
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('last-login-date');
    
    if (lastLogin !== today) {
        // Reset habits for new day
        parsedTodos = parsedTodos.map(t => {
            if (t.isHabit) {
                return { ...t, completed: false };
            }
            return t;
        });
        localStorage.setItem('last-login-date', today);
    }
    
    return parsedTodos;
  });

  const [sortBy, setSortBy] = useState('manual'); // 'manual' | 'urgency' | 'time'
  const [activePomodoroTask, setActivePomodoroTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  
  // Gamification State
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('todo-profile');
    return saved ? JSON.parse(saved) : { level: 1, xp: 0, nextLevelXp: 100 };
  });

  useEffect(() => {
    localStorage.setItem('todo-profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const addXp = (amount) => {
    setUserProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      if (newXp >= newNextXp) {
        newLevel += 1;
        newXp = newXp - newNextXp;
        newNextXp = Math.floor(newNextXp * 1.5); // Increase difficulty
        // Could trigger a "Level Up" modal here
      }

      return { level: newLevel, xp: newXp, nextLevelXp: newNextXp };
    });
  };

  // Sensors for Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Save to LocalStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('premium-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text, urgency, dueDate, category, isHabit = false) => {
    const newTodo = {
      id: crypto.randomUUID(),
      text,
      urgency, // 'high', 'medium', 'low'
      dueDate, // YYYY-MM-DD string or null
      category: category || 'personal', // 'work', 'personal', 'home', 'study'
      isHabit, // Boolean
      subtasks: [], // Array of { id, text, completed }
      completed: false,
      createdAt: Date.now()
    };
    setTodos([newTodo, ...todos]);
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        const isCompleting = !todo.completed;
        if (isCompleting) addXp(50); // +50 XP for task completion
        else addXp(-10); // Penalty for unchecking? Or just 0. Let's do small penalty to prevent spam.
        return { ...todo, completed: isCompleting };
      }
      return todo;
    }));
  };

  const handleCompleteFromPomodoro = (id) => {
    setTodos(todos.map(todo => {
      if (todo.id === id) {
        if (!todo.completed) addXp(100); // Bonus +100 XP for Pomodoro finish!
        return { ...todo, completed: true };
      }
      return todo;
    }));
  };

  // Subtask Handlers
  const addSubtask = (todoId, text) => {
    setTodos(todos.map(todo => {
      if (todo.id !== todoId) return todo;
      const newSubtask = {
        id: crypto.randomUUID(),
        text,
        completed: false
      };
      return { ...todo, subtasks: [...(todo.subtasks || []), newSubtask] };
    }));
  };

  const toggleSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id !== todoId) return todo;
      const updatedSubtasks = todo.subtasks.map(st => {
        if (st.id === subtaskId) {
            const isCompleting = !st.completed;
            if (isCompleting) addXp(10); // +10 XP per subtask
            return { ...st, completed: isCompleting };
        }
        return st;
      });
      // Optional: Auto-complete parent task if all subtasks are done? 
      // Let's keep it manual for now.
      return { ...todo, subtasks: updatedSubtasks };
    }));
  };

  const deleteSubtask = (todoId, subtaskId) => {
    setTodos(todos.map(todo => {
      if (todo.id !== todoId) return todo;
      return { ...todo, subtasks: todo.subtasks.filter(st => st.id !== subtaskId) };
    }));
  };

  const editTodo = (id, newText, newUrgency, newDueDate, newCategory, newIsHabit) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText, urgency: newUrgency, dueDate: newDueDate, category: newCategory, isHabit: newIsHabit } : todo
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
    // Filter first by search query
    let filtered = todos;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = todos.filter(t => t.text.toLowerCase().includes(query));
    }

    // If manual sort is active, return raw list (drag & drop order)
    if (sortBy === 'manual') return filtered;

    const urgencyWeight = { high: 3, medium: 2, low: 1 };

    return [...filtered].sort((a, b) => {
      // First, move completed items to bottom
      if (a.completed !== b.completed) return a.completed ? 1 : -1;

      // Then sort by selected criteria
      if (sortBy === 'urgency') {
        const diff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
        if (diff !== 0) return diff;
      } else if (sortBy === 'time') {
        // Sort by Due Date (Earliest first)
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        if (a.dueDate) return -1; // Items with due date come first
        if (b.dueDate) return 1;
      }

      // Fallback to creation date (newest first)
      return b.createdAt - a.createdAt;
    });
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="header-top">
          <h1 className="app-title">Mi Agenda</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setIsZenMode(true)} className="btn-theme-toggle" style={{ position: 'relative', transform: 'none', top: 'auto', right: 'auto' }} title="Modo Zen (Enfoque)">
                <Eye size={20} />
            </button>
            <button onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')} className="btn-theme-toggle" style={{ position: 'relative', transform: 'none', top: 'auto', right: 'auto' }} title={viewMode === 'list' ? "Ver Calendario" : "Ver Lista"}>
                {viewMode === 'list' ? <CalendarIcon size={20} /> : <List size={20} />}
            </button>
            <button onClick={() => setIsStoreOpen(true)} className="btn-theme-toggle" style={{ position: 'relative', transform: 'none', top: 'auto', right: 'auto' }} title="Tienda de Temas">
                <Palette size={20} />
            </button>
            <button onClick={toggleTheme} className="btn-theme-toggle" style={{ position: 'relative', transform: 'none', top: 'auto', right: 'auto' }} title="Cambiar modo (Rápido)">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>Organiza tu día con estilo</p>
      </header>

      <ThemeStore 
        isOpen={isStoreOpen} 
        onClose={() => setIsStoreOpen(false)}
        userProfile={userProfile}
        onBuyTheme={handleBuyTheme}
        onEquipTheme={handleEquipTheme}
        unlockedThemes={unlockedThemes}
      />

      {isZenMode && (
          <ZenModeOverlay 
            todos={todos} 
            onComplete={(id) => {
                toggleTodo(id);
                // Maybe stay in Zen mode for next task?
            }}
            onExit={() => setIsZenMode(false)}
          />
      )}

      <UserProfile profile={userProfile} />

      <Stats todos={todos} />

      <SearchBar ref={searchInputRef} value={searchQuery} onChange={setSearchQuery} />

      {viewMode === 'list' ? (
        <>
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
                className={`btn-sort ${sortBy === 'manual' ? 'active' : ''}`}
                onClick={() => setSortBy('manual')}
                title="Arrastrar y soltar activado"
                >
                <GripVertical size={16} />
                Manual
                </button>
                <button
                className={`btn-sort ${sortBy === 'urgency' ? 'active' : ''}`}
                onClick={() => setSortBy('urgency')}
                >
                <LayoutList size={16} />
                Urgencia
                </button>
                <button
                className={`btn-sort ${sortBy === 'time' ? 'active' : ''}`}
                onClick={() => setSortBy('time')}
                >
                <ArrowUpDown size={16} />
                Por Fecha
                </button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <TodoList
                todos={getSortedTodos()}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onFocus={setActivePomodoroTask}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onDeleteSubtask={deleteSubtask}
                isDragEnabled={sortBy === 'manual'}
                />
            </DndContext>
        </>
      ) : (
        <CalendarView todos={todos} />
      )}

      {activePomodoroTask && (
        <PomodoroOverlay
          task={activePomodoroTask}
          onClose={() => setActivePomodoroTask(null)}
          onComplete={handleCompleteFromPomodoro}
        />
      )}
    </div >
  );
}

export default App;
