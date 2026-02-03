import { useState, useEffect } from 'react';
import { X, Play, Pause, Square, CheckCircle2 } from 'lucide-react';

export default function PomodoroOverlay({ task, onClose, onComplete }) {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            // Play sound ideally
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleTimer = () => setIsActive(!isActive);
    
    return (
        <div className="pomodoro-overlay">
            <div className="pomodoro-card glass-card">
                <button className="btn-close-pomodoro" onClick={onClose}>
                    <X size={24} />
                </button>
                
                <h3 className="pomodoro-label">ENFOQUE PROFUNDO</h3>
                <h2 className="pomodoro-task-text">{task.text}</h2>
                
                <div className="timer-display">
                    {formatTime(timeLeft)}
                </div>
                
                <div className="pomodoro-controls">
                    <button className="btn-control-main" onClick={toggleTimer}>
                        {isActive ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
                    </button>
                </div>
                
                <p className="pomodoro-status">
                    {isActive ? '¡Mantén el enfoque! 🧠' : 'Listo para empezar'}
                </p>

                <button 
                    className="btn-finish-task"
                    onClick={() => {
                        onComplete(task.id);
                        onClose();
                    }}
                >
                    <CheckCircle2 size={18} />
                    Terminar Tarea Ahora
                </button>
            </div>
        </div>
    );
}
