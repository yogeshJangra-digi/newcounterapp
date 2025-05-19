import React from 'react';
import './App.css';
import Counter from './components/Counter';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Counter App</h1>
        <Counter />
      </header>
    </div>
  );
}

export default App;