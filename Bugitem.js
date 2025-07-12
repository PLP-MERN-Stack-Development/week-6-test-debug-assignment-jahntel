
import React from 'react';

function BugItem({ bug, onDelete, onEdit }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'in-progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'low': return 'priority-low';
      case 'medium': return 'priority-medium';
      case 'high': return 'priority-high';
      default: return '';
    }
  };

  return (
    <div className="bug-item">
      <h3>{bug.title}</h3>
      <p>{bug.description}</p>
      <p>Status: <span className={getStatusClass(bug.status)}>{bug.status}</span></p>
      <p>Priority: <span className={getPriorityClass(bug.priority)}>{bug.priority}</span></p>
      {bug.assignedTo && <p>Assigned To: {bug.assignedTo}</p>}
      <p>Reported On: {new Date(bug.createdAt).toLocaleDateString()}</p>
      <button onClick={() => onEdit(bug)}>Edit</button>
      <button onClick={() => onDelete(bug._id)}>Delete</button>
    </div>
  );
}

export default BugItem;
