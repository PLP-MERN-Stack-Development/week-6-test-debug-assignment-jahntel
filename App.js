
import React from 'react';
import './App.css'; // For basic styling
import Home from './pages/Home';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    </div>
  );
}

export default App;
