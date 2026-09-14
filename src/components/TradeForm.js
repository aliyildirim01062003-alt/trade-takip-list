import React, { useState } from 'react';
import './TradeForm.css';
import { validateTradeInput } from '../utils/tradeUtils';

const TradeForm = ({ onAddTrade }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    assetType: 'Hisse',
    symbol: '',
    type: 'buy',
    entryPrice: '',
    quantity: '',
    exitPrice: '',
    commission: '0',
    notes: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationMessage = validateTradeInput(formData);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    onAddTrade({
      ...formData,
      symbol: formData.symbol.trim(),
      commission: formData.commission || '0'
    });

    setErrorMessage('');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      assetType: 'Hisse',
      symbol: '',
      type: 'buy',
      entryPrice: '',
      quantity: '',
      exitPrice: '',
      commission: '0',
      notes: ''
    });
  };

  return (
    <div className="trade-form-section">
      <div className="section">
        <h2>🆕 Yeni İşlem Ekle</h2>
        {errorMessage && (
          <div className="form-error" role="alert">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="trade-form">
          <div className="form-group">
            <label>Tarih</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Varlık Türü</label>
            <select name="assetType" value={formData.assetType} onChange={handleChange}>
              <option>Hisse</option>
              <option>Kripto</option>
              <option>Forex</option>
              <option>Emtia</option>
              <option>Futures</option>
              <option>Opsiyon</option>
            </select>
          </div>

          <div className="form-group">
            <label>Sembol/Kod</label>
            <input
              type="text"
              name="symbol"
              placeholder="örn: AAPL, BTC, EURUSD"
              value={formData.symbol}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>İşlem Türü</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="buy">Alış (Buy)</option>
              <option value="sell">Satış (Sell)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giriş Fiyatı</label>
            <input
              type="number"
              name="entryPrice"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.entryPrice}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Miktar</label>
            <input
              type="number"
              name="quantity"
              placeholder="0"
              step="0.01"
              min="0"
              value={formData.quantity}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Çıkış Fiyatı (Opsiyonel)</label>
            <input
              type="number"
              name="exitPrice"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.exitPrice}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Komisyon</label>
            <input
              type="number"
              name="commission"
              placeholder="0.00"
              step="0.01"
              min="0"
              value={formData.commission}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Notlar</label>
            <textarea
              name="notes"
              placeholder="İşlem hakkında notlar..."
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit">➕ İşlem Ekle</button>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
