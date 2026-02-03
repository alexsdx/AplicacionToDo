import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

export default function Stats({ todos }) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    // Streak calculation
    const [streak, setStreak] = useState(() => {
        const saved = localStorage.getItem('todo-streak');
        return saved ? JSON.parse(saved) : { current: 0, lastDate: null, best: 0 };
    });

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // Check if user completed at least one task today
        const completedToday = todos.some(t => {
            if (!t.completed || !t.createdAt) return false;
            const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
            return taskDate === today && t.completed;
        });

        if (completedToday && streak.lastDate !== today) {
            let newCurrent = 1;
            
            // Continue streak if yesterday was completed
            if (streak.lastDate === yesterday) {
                newCurrent = streak.current + 1;
            }
            
            const newBest = Math.max(newCurrent, streak.best);
            const newStreak = { current: newCurrent, lastDate: today, best: newBest };
            
            setStreak(newStreak);
            localStorage.setItem('todo-streak', JSON.stringify(newStreak));
        } else if (streak.lastDate && streak.lastDate !== today && streak.lastDate !== yesterday) {
            // Reset streak if more than 1 day passed
            const resetStreak = { current: 0, lastDate: null, best: streak.best };
            setStreak(resetStreak);
            localStorage.setItem('todo-streak', JSON.stringify(resetStreak));
        }
    }, [todos, streak.lastDate, streak.current, streak.best]);

    const getMessage = () => {
        if (total === 0) return "¡Todo limpio! Agrega una tarea para empezar.";
        if (percentage === 0) return "¡Vamos! Empieza con una tarea pequeña. 💪";
        if (percentage < 30) return "Buen comienzo, ¡sigue así! 🚀";
        if (percentage < 70) return "¡Estás en racha! Sigue empujando. 🔥";
        if (percentage < 100) return "¡Casi terminas! El éxito está cerca. 🏁";
        return "¡Increíble! Has terminado todo por hoy. 🎉";
    };

    return (
        <div className="stats-container glass-card">
            <div className="stats-header">
                <span className="stats-title">Progreso: <span className="stats-count">{completed} / {total}</span></span>
                {streak.current > 0 && (
                    <div className="streak-badge">
                        <Flame size={16} className="streak-icon" />
                        <span>{streak.current} {streak.current === 1 ? 'día' : 'días'}</span>
                    </div>
                )}
            </div>
            
            <div className="progress-bar-bg">
                <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            
            <p className="stats-message">{getMessage()}</p>
            
            {streak.best > 0 && (
                <div className="stats-footer">
                    <span>🏆 Mejor racha: {streak.best} {streak.best === 1 ? 'día' : 'días'}</span>
                </div>
            )}
        </div>
    );
}
