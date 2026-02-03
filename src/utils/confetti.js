// Confetti utility function
export const triggerConfetti = (element) => {
    const colors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe', '#fbbf24', '#f59e0b', '#10b981'];
    const confettiCount = 30;
    
    const rect = element ? element.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2 };
    const centerX = rect.left + (rect.width || 0) / 2;
    const centerY = rect.top + (rect.height || 0) / 2;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = `${centerX}px`;
        confetti.style.top = `${centerY}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.setProperty('--tx', `${(Math.random() - 0.5) * 200}px`);
        confetti.style.setProperty('--ty', `${-Math.random() * 300 - 100}px`);
        confetti.style.animationDuration = `${Math.random() * 2 + 1}s`;
        confetti.style.animationDelay = `${Math.random() * 0.3}s`;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
};
