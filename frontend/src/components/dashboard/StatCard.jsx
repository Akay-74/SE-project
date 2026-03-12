import './StatCard.css';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-card-header">
                <div className="stat-card-title">{title}</div>
                {Icon && (
                    <div className="stat-card-icon">
                        <Icon />
                    </div>
                )}
            </div>
            <div className="stat-card-value">{value}</div>
            {trend && (
                <div className={`stat-card-trend trend-${trend}`}>
                    <span className="trend-indicator">{trend === 'up' ? '↑' : '↓'}</span>
                    <span className="trend-value">{trendValue}</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
