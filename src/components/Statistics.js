import React from 'react';
import './Statistics.css';
import { calculateTradePnL } from '../utils/tradeUtils';

const Statistics = ({ trades }) => {
  const calculateStats = () => {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winTrades: 0,
        lossTrades: 0,
        totalProfit: 0,
        totalLoss: 0,
        netPnL: 0,
        winRate: 0,
        avgProfit: 0,
        avgLoss: 0,
        profitFactor: 0
      };
    }

    const completedTrades = trades.filter(t => t.exitPrice !== '' && t.exitPrice !== null && t.exitPrice !== undefined);
    let wins = [];
    let losses = [];
    let totalProfit = 0;
    let totalLoss = 0;

    completedTrades.forEach(trade => {
      const pnl = calculateTradePnL(trade);
      if (pnl === null) {
        return;
      }

      if (pnl > 0) {
        wins.push(pnl);
        totalProfit += pnl;
      } else if (pnl < 0) {
        losses.push(pnl);
        totalLoss += pnl;
      }
    });

    const netPnL = totalProfit + totalLoss;
    const avgProfit = wins.length > 0 ? totalProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLoss / losses.length : 0;
    const profitFactor = totalLoss !== 0 ? Math.abs(totalProfit / totalLoss) : (totalProfit > 0 ? Infinity : 0);

    return {
      totalTrades: trades.length,
      completedTrades: completedTrades.length,
      winTrades: wins.length,
      lossTrades: losses.length,
      totalProfit,
      totalLoss,
      netPnL,
      winRate: completedTrades.length > 0 ? ((wins.length / completedTrades.length) * 100).toFixed(1) : 0,
      avgProfit: avgProfit.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2)
    };
  };

  const stats = calculateStats();

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="statistics-section">
      <div className="section">
        <h2>📊 İstatistikler</h2>

        <div className="stats-grid">
          <StatCard
            title="Toplam İşlem"
            value={stats.totalTrades}
            icon="📈"
            color="primary"
          />
          <StatCard
            title="Tamamlanan İşlem"
            value={stats.completedTrades}
            icon="✅"
            color="success"
          />
          <StatCard
            title="Kazanan İşlem"
            value={stats.winTrades}
            icon="🟢"
            color="win"
          />
          <StatCard
            title="Kaybeden İşlem"
            value={stats.lossTrades}
            icon="🔴"
            color="loss"
          />
          <StatCard
            title="Kazanç Oranı (%)"
            value={`${stats.winRate}%`}
            icon="📊"
            color="primary"
          />
          <StatCard
            title="Kar Faktörü"
            value={stats.profitFactor}
            icon="💰"
            color="primary"
          />
          <StatCard
            title="Toplam Kar"
            value={`₺${parseFloat(stats.totalProfit).toFixed(2)}`}
            icon="💹"
            color="profit"
          />
          <StatCard
            title="Toplam Zarar"
            value={`₺${parseFloat(stats.totalLoss).toFixed(2)}`}
            icon="📉"
            color="loss-stat"
          />
          <StatCard
            title="Net Kar/Zarar"
            value={`₺${parseFloat(stats.netPnL).toFixed(2)}`}
            icon={stats.netPnL >= 0 ? '📈' : '📉'}
            color={stats.netPnL >= 0 ? 'profit' : 'loss-stat'}
          />
          <StatCard
            title="Ortalama Kar"
            value={`₺${parseFloat(stats.avgProfit).toFixed(2)}`}
            icon="✅"
            color="profit"
          />
          <StatCard
            title="Ortalama Zarar"
            value={`₺${parseFloat(stats.avgLoss).toFixed(2)}`}
            icon="❌"
            color="loss-stat"
          />
        </div>

        {trades.length === 0 && (
          <div className="empty-state">
            <p>Henüz işlem bulunmadığı için istatistik gösterilemiyor.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
