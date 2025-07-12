
import React from 'react';
import BugItem from './BugItem';

function BugList({ bugs, onDelete, onEdit }) {
  if (!bugs || bugs.length === 0) {
    return <p>No bugs reported yet.</p>;
  }

  return (
    <div className="bug-list-container">
      <h2>Reported Bugs</h2>
      <div className="bug-items">
        {bugs.map((bug) => (
          <BugItem key={bug._id} bug={bug} onDelete={onDelete} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

export default BugList;
