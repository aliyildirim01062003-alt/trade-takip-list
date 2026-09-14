import React, { useState } from 'react';
import './TradeList.css';
import { calculateTradePnL, validateTradeInput } from '../utils/tradeUtils';

const TradeList = ({ trades, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');

  const startEdit = (trade) => {
    setEditingId(trade.id);
    setEditForm(trade);
  };

  const saveEdit = () => {
    const validationMessage = validateTradeInput(editForm);
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    onUpdate(editingId, editForm);
    setEditingId(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  let filteredTrades = trades;
  if (filterType !== 'all') {
    filteredTrades = trades.filter(t => t.assetType === filterType);
  }

  let sortedTrades = [...filteredTrades].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'pnl') {
      const pnlA = calculateTradePnL(a) || 0;
      const pnlB = calculateTradePnL(b) || 0;
      return pnlB - pnlA;
    }
    return 0;
  });

  const assetTypes = ['all', ...new Set(trades.map(t => t.assetType))];

  return (
    <div className="trade-list-section">
      <div className="section">
        <h2>📋 İşlem Listesi</h2>

        <div className="filters">
          <div className="filter-group">
            <label>Varlık Türü:</label>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              {assetTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'Tümü' : type}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Sıralama:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Tarihe Göre (Yeni)</option>
              <option value="pnl">Kar/Zarar</option>
            </select>
          </div>
        </div>

        {sortedTrades.length === 0 ? (
          <div className="empty-state">
            <p>Henüz işlem eklenmemiş. Yukarıdan bir işlem ekleyin!</p>
          </div>
        ) : (
          <div className="trades-table">
            {sortedTrades.map(trade => {
              const pnl = calculateTradePnL(trade);
              const isEditing = editingId === trade.id;

              return (
                <div key={trade.id} className="trade-card">
                  <div className="trade-header">
                    <div className="trade-info">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={editForm.symbol}
                            onChange={(e) => handleEditChange('symbol', e.target.value)}
                            className="edit-input"
                          />
                        </>
                      ) : (
                        <>
                          <span className="symbol">{trade.symbol}</span>
                          <span className="asset-type">{trade.assetType}</span>
                          <span className={`trade-type ${trade.type}`}>
                            {trade.type === 'buy' ? '🟢 Alış' : '🔴 Satış'}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="trade-actions">
                      {isEditing ? (
                        <>
                          <button className="btn-save" onClick={saveEdit}>💾 Kaydet</button>
                          <button className="btn-cancel" onClick={() => setEditingId(null)}>❌ İptal</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-edit" onClick={() => startEdit(trade)}>✏️ Düzenle</button>
                          <button className="btn-delete" onClick={() => onDelete(trade.id)}>🗑️ Sil</button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="trade-details">
                    <div className="detail">
                      <span className="label">Tarih:</span>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => handleEditChange('date', e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        <span>{new Date(trade.date).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                    <div className="detail">
                      <span className="label">Giriş Fiyatı:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.entryPrice}
                          onChange={(e) => handleEditChange('entryPrice', e.target.value)}
                          className="edit-input"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <span>₺{parseFloat(trade.entryPrice).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="detail">
                      <span className="label">Miktar:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => handleEditChange('quantity', e.target.value)}
                          className="edit-input"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <span>{parseFloat(trade.quantity).toFixed(2)}</span>
                      )}
                    </div>
                    {trade.exitPrice && (
                      <div className="detail">
                        <span className="label">Çıkış Fiyatı:</span>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.exitPrice}
                            onChange={(e) => handleEditChange('exitPrice', e.target.value)}
                            className="edit-input"
                            step="0.01"
                            min="0"
                          />
                        ) : (
                          <span>₺{parseFloat(trade.exitPrice).toFixed(2)}</span>
                        )}
                      </div>
                    )}
                    <div className="detail">
                      <span className="label">Komisyon:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.commission}
                          onChange={(e) => handleEditChange('commission', e.target.value)}
                          className="edit-input"
                          step="0.01"
                          min="0"
                        />
                      ) : (
                        <span>₺{parseFloat(trade.commission || 0).toFixed(2)}</span>
                      )}
                    </div>
                    {pnl !== null && (
                      <div className="detail pnl">
                        <span className="label">Kar/Zarar:</span>
                        <span className={pnl >= 0 ? 'profit' : 'loss'}>
                          {pnl >= 0 ? '📈' : '📉'} ₺{Math.abs(pnl).toFixed(2)} {pnl >= 0 ? '✅' : '❌'}
                        </span>
                      </div>
                    )}
                    {trade.notes && (
                      <div className="detail notes">
                        <span className="label">Notlar:</span>
                        {isEditing ? (
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => handleEditChange('notes', e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          <span>{trade.notes}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeList;
