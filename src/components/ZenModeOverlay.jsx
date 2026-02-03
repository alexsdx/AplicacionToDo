import { Check, X, ArrowRight } from 'lucide-react';

export default function ZenModeOverlay({ todos, onComplete, onExit }) {
    // Logic to find the "Next Action": 
    // 1. High Urgency
    // 2. Oldest
    // 3. Not completed
    const getNextTask = () => {
        const pending = todos.filter(t => !t.completed);
        if (pending.length === 0) return null;

        // Sort by urgency then creation
        const urgencyWeight = { high: 3, medium: 2, low: 1 };
        return pending.sort((a, b) => {
            const diff = urgencyWeight[b.urgency] - urgencyWeight[a.urgency];
            if (diff !== 0) return diff;
            return a.createdAt - b.createdAt; // Oldest first
        })[0];
    };

    const task = getNextTask();

    return (
        <div className="zen-overlay">
            <button className="btn-exit-zen" onClick={onExit} title="Salir del Modo Zen">
                <X size={32} />
            </button>

            {task ? (
                <div className="zen-content">
                    <span className="zen-subtitle">TU ÚNICO OBJETIVO AHORA</span>
                    <h1 className="zen-task-title">{task.text}</h1>
                    
                    <div className="zen-actions">
                        <button 
                            className="btn-zen-complete" 
                            onClick={() => onComplete(task.id)}
                        >
                            <Check size={48} />
                            <span>TERMINADO</span>
                        </button>
                        
                        {/* Optional Skip button if implemented */}
                    </div>
                </div>
            ) : (
                <div className="zen-content">
                    <h1 className="zen-task-title">¡Eres libre!</h1>
                    <p className="zen-subtitle">No hay tareas pendientes. Disfruta tu tiempo.</p>
                </div>
            )}
        </div>
    );
}
