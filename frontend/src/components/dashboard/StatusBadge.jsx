import './StatusBadge.css';

const StatusBadge = ({ status, type = 'booking' }) => {
    const getStatusConfig = () => {
        if (type === 'booking') {
            const configs = {
                pending: { label: 'Pending', className: 'status-warning' },
                confirmed: { label: 'Confirmed', className: 'status-success' },
                cancelled: { label: 'Cancelled', className: 'status-danger' },
                completed: { label: 'Completed', className: 'status-info' },
            };
            return configs[status] || { label: status, className: 'status-default' };
        }

        if (type === 'payment') {
            const configs = {
                pending: { label: 'Pending', className: 'status-warning' },
                paid: { label: 'Paid', className: 'status-success' },
                failed: { label: 'Failed', className: 'status-danger' },
                refunded: { label: 'Refunded', className: 'status-info' },
            };
            return configs[status] || { label: status, className: 'status-default' };
        }

        return { label: status, className: 'status-default' };
    };

    const config = getStatusConfig();

    return (
        <span className={`status-badge ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
