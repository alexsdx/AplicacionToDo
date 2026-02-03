import { Search } from 'lucide-react';
import { forwardRef } from 'react';

const SearchBar = forwardRef(({ value, onChange }, ref) => {
    return (
        <div className="search-bar-container glass-card" style={{ padding: '0.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Search size={20} style={{ color: 'var(--text-muted)' }} />
            <input
                ref={ref}
                type="text"
                className="search-input"
                placeholder="Buscar tareas... (Ctrl+K)"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--text-main)', outline: 'none' }}
            />
        </div>
    );
});

export default SearchBar;
