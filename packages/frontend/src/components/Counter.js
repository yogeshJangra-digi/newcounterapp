import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Counter.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Counter() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCounter();
  }, []);

  const fetchCounter = async () => {
    try {
      const response = await axios.get(`${API_URL}/counter`);
      setCount(response.data.value);
      setError(null);
    } catch (err) {
      console.error('Error fetching counter:', err);
      setError('Failed to connect to the server. Is the backend running?');
    }
  };

  const handleIncrement = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/counter/increment`);
      setCount(response.data.value);
      setError(null);
    } catch (err) {
      console.error('Error incrementing counter:', err);
      setError('Failed to increment counter. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/counter/decrement`);
      setCount(response.data.value);
      setError(null);
    } catch (err) {
      console.error('Error decrementing counter:', err);
      setError('Failed to decrement counter. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/counter/reset`);
      setCount(response.data.value);
      setError(null);
    } catch (err) {
      console.error('Error resetting counter:', err);
      setError('Failed to reset counter. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="counter-container">
      <h2>Count: {count}</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="button-group">
        <button 
          className="counter-button decrement" 
          onClick={handleDecrement} 
          disabled={loading}
        >
          -
        </button>
        <button 
          className="counter-button reset" 
          onClick={handleReset} 
          disabled={loading}
        >
          Reset
        </button>
        <button 
          className="counter-button increment" 
          onClick={handleIncrement} 
          disabled={loading}
        >
          +
        </button>
      </div>
      <p className="info-text">
        The counter state is managed by the backend server
      </p>
    </div>
  );
}

export default Counter;