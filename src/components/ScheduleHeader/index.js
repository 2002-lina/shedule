import React from 'react';

const ScheduleHeader = ({ entityName, formattedDate, selectedDate }) => {
    return (
        <div className="schedule-header">
            <div className="entity-name">{entityName}</div>
            <div className="schedule-date">{formattedDate}</div>
        </div>
    );
};

export default ScheduleHeader;