import React, { useState } from 'react';
import './App.css';
import CreateBarber from './components/CreateBarber';
import BarberList from './components/BarberList';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBarberCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Barber Shop Scheduler</h1>
      </header>
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <CreateBarber onSuccess={handleBarberCreated} />
        <BarberList key={refreshKey} />
      </main>
    </div>
  );
}

export default App;
