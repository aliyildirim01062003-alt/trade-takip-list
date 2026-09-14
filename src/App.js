import React, { useState, useEffect } from 'react';
import './App.css';
import TradeForm from './components/TradeForm';
import TradeList from './components/TradeList';
import Statistics from './components/Statistics';
import Charts from './components/Charts';

function App() {
  const [trades, setTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('trades');

  // Local storage'dan işlemleri yükle
  useEffect(() => {
    const savedTrades = localStorage.getItem('trades');
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }
  }, []);

  // Local storage'a işlemleri kaydet
  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
  }, [trades]);

  const addTrade = (newTrade) => {
    setTrades(prevTrades => [...prevTrades, { ...newTrade, id: Date.now() }]);
  };

  const deleteTrade = (id) => {
    setTrades(prevTrades => prevTrades.filter(trade => trade.id !== id));
  };

  const updateTrade = (id, updatedTrade) => {
    setTrades(prevTrades => prevTrades.map(trade => trade.id === id ? { ...updatedTrade, id } : trade));
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>📈 Ticaret Takip Listesi</h1>
          <p>Ücretsiz Ticaret Günlüğü ve Analiz Uygulaması</p>
        </div>
      </header>

      <nav className="tabs">
        <div className="container">
          <button
            className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => setActiveTab('trades')}
          >
            📋 İşlemler
          </button>
          <button
            className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 İstatistikler
          </button>
          <button
            className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            📈 Grafikler
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="container">
          {activeTab === 'trades' && (
            <div className="trades-section">
              <TradeForm onAddTrade={addTrade} />
              <TradeList trades={trades} onDelete={deleteTrade} onUpdate={updateTrade} />
            </div>
          )}
          {activeTab === 'stats' && <Statistics trades={trades} />}
          {activeTab === 'charts' && <Charts trades={trades} />}
        </div>
      </main>
    </div>
  );
}

export default App;
