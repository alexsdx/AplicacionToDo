export default function Stats({ todos }) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    const getMessage = () => {
        if (total === 0) return "¡Todo limpio! Agrega una tarea para empezar.";
        if (percentage === 0) return "¡Vamos! Empieza con una tarea pequeña. 💪";
        if (percentage < 30) return "Buen comienzo, ¡sigue así! 🚀";
        if (percentage < 70) return "¡Estás en racha! Sigue empujando. 🔥";
        if (percentage < 100) return "¡Casi terminas! El éxito está cerca. 🏁";
        return "¡Increíble! Has terminado todo por hoy. 🎉";
    };

    return (
        <div className="stats-container glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div className="stats-header">
                <span className="stats-title">Tu Progreso</span>
                <span className="stats-count">{completed} / {total}</span>
            </div>
            
            <div className="progress-bar-bg">
                <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            
            <p className="stats-message">{getMessage()}</p>
        </div>
    );
}
