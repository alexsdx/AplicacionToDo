import { Trophy, Star, Zap } from 'lucide-react';

export default function UserProfile({ profile }) {
    const progress = Math.min(100, Math.round((profile.xp / profile.nextLevelXp) * 100));

    return (
        <div className="user-profile glass-card">
            <div className="profile-icon-container">
                <div className="level-badge">{profile.level}</div>
                <Trophy size={32} className="trophy-icon" />
            </div>
            
            <div className="profile-info">
                <div className="profile-header">
                    <span className="profile-name">Maestro Productivo</span>
                    <span className="profile-xp-text">{profile.xp} / {profile.nextLevelXp} XP</span>
                </div>
                
                <div className="xp-bar-bg">
                    <div 
                        className="xp-bar-fill" 
                        style={{ width: `${progress}%` }}
                    >
                        <div className="xp-glow"></div>
                    </div>
                </div>
                
                <div className="profile-footer">
                    <span className="level-text">Nivel {profile.level}</span>
                    <span className="next-level-text">
                        {profile.nextLevelXp - profile.xp} XP para Nivel {profile.level + 1}
                    </span>
                </div>
            </div>
        </div>
    );
}
