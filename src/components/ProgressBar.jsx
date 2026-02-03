export default function ProgressBar({ todos }) {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (total === 0) return null;

    return (
        <div className="progress-container glass-card">
            <div className="progress-info">
                <span>Tu Progreso</span>
                <span>{percentage}%</span>
            </div>
            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="progress-stats">
                {completed} de {total} tareas completadas
            </div>
        </div>
    );
}
