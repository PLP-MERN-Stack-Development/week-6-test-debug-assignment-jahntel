
import React, { useState, useEffect } from 'react';
import BugForm from '../components/BugForm';
import BugList from '../components/BugList';
import bugService from '../services/bugService';

function Home() {
  const [bugs, setBugs] = useState([]);
  const [editingBug, setEditingBug] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      setLoading(true);
      const data = await bugService.getBugs();
      setBugs(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bugs:', err);
      setError('Failed to load bugs. Please try again later.');
      setBugs([]); // Clear bugs if there's an error
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBug = async (bugData, bugId = null) => {
    try {
      if (bugId) {
        await bugService.updateBug(bugId, bugData);
        setEditingBug(null); // Exit edit mode
      } else {
        await bugService.createBug(bugData);
      }
      fetchBugs(); // Refresh the list
    } catch (err) {
      console.error('Failed to save bug:', err);
      setError(`Failed to save bug: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteBug = async (id) => {
    try {
      await bugService.deleteBug(id);
      fetchBugs(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete bug:', err);
      setError(`Failed to delete bug: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleEditBug = (bug) => {
    setEditingBug(bug);
  };

  const handleCancelEdit = () => {
    setEditingBug(null);
  };

  return (
    <div className="home-container">
      <h1>Bug Tracker Application</h1>

      <BugForm
        onSave={handleSaveBug}
        currentBug={editingBug}
        onCancel={handleCancelEdit}
      />

      {loading && <p>Loading bugs...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <BugList
          bugs={bugs}
          onDelete={handleDeleteBug}
          onEdit={handleEditBug}
        />
      )}
    </div>
  );
}

export default Home;
