
import React, { useState, useEffect } from 'react';

function BugForm({ onSave, currentBug, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (currentBug) {
      setTitle(currentBug.title || '');
      setDescription(currentBug.description || '');
      setStatus(currentBug.status || 'open');
      setPriority(currentBug.priority || 'medium');
      setAssignedTo(currentBug.assignedTo || '');
      setErrors({}); // Clear errors when editing
    } else {
      // Clear form for new bug
      setTitle('');
      setDescription('');
      setStatus('open');
      setPriority('medium');
      setAssignedTo('');
      setErrors({});
    }
  }, [currentBug]);

  const validateForm = () => {
    let newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const bugData = { title, description, status, priority, assignedTo };
    onSave(bugData, currentBug ? currentBug._id : null);
    // Clear form after submission for new bug, but keep values for editing
    if (!currentBug) {
      setTitle('');
      setDescription('');
      setStatus('open');
      setPriority('medium');
      setAssignedTo('');
    }
  };

  return (
    <div className="bug-form-container">
      <h2>{currentBug ? 'Edit Bug' : 'Report New Bug'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && <p className="error-message">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          {errors.description && <p className="error-message">{errors.description}</p>}
        </div>
        <div>
          <label htmlFor="status">Status:</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option>
            <option value="in-progress">In-Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        <div>
          <label htmlFor="priority">Priority:</label>
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="assignedTo">Assigned To (optional):</label>
          <input
            type="text"
            id="assignedTo"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          />
        </div>
        <button type="submit">{currentBug ? 'Update Bug' : 'Add Bug'}</button>
        {currentBug && <button type="button" onClick={onCancel}>Cancel</button>}
      </form>
    </div>
  );
}

export default BugForm;
