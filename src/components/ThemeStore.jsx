import { Palette, Lock, Check, X } from 'lucide-react';

export default function ThemeStore({ isOpen, onClose, userProfile, onBuyTheme, onEquipTheme, unlockedThemes }) {
    if (!isOpen) return null;

    const themes = [
        { id: 'light', name: 'Clásico', price: 0, color: '#3b82f6', desc: 'Limpio y profesional.' },
        { id: 'dark', name: 'Modo Noche', price: 0, color: '#1e293b', desc: 'Oscuro y relajante.' },
        { id: 'forest', name: 'Bosque Zen', price: 500, color: '#059669', desc: 'Naturaleza y calma.' },
        { id: 'cyberpunk', name: 'Cyberpunk', price: 1000, color: '#f472b6', desc: 'Neón futurista.' }
    ];

    return (
        <div className="store-overlay">
            <div className="store-card glass-card">
                <div className="store-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Palette size={24} color="var(--color-primary)" />
                        <h2>Tienda de Temas</h2>
                    </div>
                    <button onClick={onClose} className="btn-close-store"><X size={24} /></button>
                </div>

                <div className="user-balance">
                    <span>Tu Saldo:</span>
                    <span className="xp-amount">{userProfile.xp} XP</span>
                </div>

                <div className="themes-grid">
                    {themes.map(theme => {
                        const isUnlocked = unlockedThemes.includes(theme.id);
                        const canAfford = userProfile.xp >= theme.price;

                        return (
                            <div key={theme.id} className="theme-item" style={{ borderColor: theme.color }}>
                                <div className="theme-preview" style={{ background: theme.color }}></div>
                                <div className="theme-info">
                                    <h3>{theme.name}</h3>
                                    <p>{theme.desc}</p>
                                </div>
                                
                                {isUnlocked ? (
                                    <button 
                                        className="btn-equip"
                                        onClick={() => onEquipTheme(theme.id)}
                                    >
                                        Equipar
                                    </button>
                                ) : (
                                    <button 
                                        className={`btn-buy ${!canAfford ? 'disabled' : ''}`}
                                        disabled={!canAfford}
                                        onClick={() => onBuyTheme(theme.id, theme.price)}
                                    >
                                        {canAfford ? 'Comprar' : 'Bloqueado'} 
                                        <span className="price-tag">{theme.price} XP</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
