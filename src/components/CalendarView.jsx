import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ todos }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        return { days, firstDay };
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getTasksForDay = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return todos.filter(t => t.dueDate === dateStr);
    };

    return (
        <div className="calendar-container glass-card">
            <div className="calendar-header">
                <button onClick={prevMonth} className="btn-icon"><ChevronLeft /></button>
                <h2 className="month-title">{monthName}</h2>
                <button onClick={nextMonth} className="btn-icon"><ChevronRight /></button>
            </div>

            <div className="calendar-grid">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                    <div key={d} className="calendar-day-header">{d}</div>
                ))}

                {Array(firstDay).fill(null).map((_, i) => (
                    <div key={`empty-${i}`} className="calendar-day empty"></div>
                ))}

                {Array(days).fill(null).map((_, i) => {
                    const day = i + 1;
                    const tasks = getTasksForDay(day);
                    const isToday = 
                        new Date().getDate() === day && 
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear();

                    return (
                        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                            <span className="day-number">{day}</span>
                            <div className="day-dots">
                                {tasks.map(t => (
                                    <div 
                                        key={t.id} 
                                        className="task-dot" 
                                        style={{ background: t.completed ? '#cbd5e1' : 'var(--color-primary)' }}
                                        title={t.text}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
