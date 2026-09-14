import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Charts.css';
import { calculateTradePnL } from '../utils/tradeUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Charts = ({ trades }) => {
  const getTradesByType = () => {
    const counts = {};
    trades.forEach(trade => {
      counts[trade.assetType] = (counts[trade.assetType] || 0) + 1;
    });
    return counts;
  };

  const getPnLCumulative = () => {
    const sortedTrades = [...trades]
      .filter(t => t.exitPrice !== '' && t.exitPrice !== null && t.exitPrice !== undefined)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    let cumulative = 0;
    const labels = [];
    const data = [];

    sortedTrades.forEach((trade, index) => {
      const pnl = calculateTradePnL(trade);
      if (pnl === null) {
        return;
      }

      cumulative += pnl;
      labels.push(`İşlem ${index + 1}`);
      data.push(cumulative);
    });

    return { labels, data };
  };

  const getWinLossRatio = () => {
    const completedTrades = trades.filter(t => t.exitPrice !== '' && t.exitPrice !== null && t.exitPrice !== undefined);
    let wins = 0;
    let losses = 0;

    completedTrades.forEach(trade => {
      const pnl = calculateTradePnL(trade);
      if (pnl === null) {
        return;
      }

      if (pnl > 0) wins++;
      else if (pnl < 0) losses++;
    });

    return { wins, losses };
  };

  const tradesByType = getTradesByType();
  const pnlData = getPnLCumulative();
  const winLossRatio = getWinLossRatio();

  const tradeTypeChart = {
    labels: Object.keys(tradesByType),
    datasets: [{
      label: 'İşlem Sayısı',
      data: Object.values(tradesByType),
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#00f2fe',
        '#43e97b'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const cumulativePnL = {
    labels: pnlData.labels,
    datasets: [{
      label: 'Kümülatif Kar/Zarar (₺)',
      data: pnlData.data,
      borderColor: '#667eea',
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#667eea',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  const winLossChart = {
    labels: ['Kazanan', 'Kaybeden'],
    datasets: [{
      data: [winLossRatio.wins, winLossRatio.losses],
      backgroundColor: [
        '#28a745',
        '#dc3545'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        borderColor: '#667eea',
        borderWidth: 1
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return '₺' + Number(value).toFixed(2);
          }
        }
      }
    }
  };

  return (
    <div className="charts-section">
      <div className="section">
        <h2>📈 Grafikler</h2>

        {trades.length === 0 ? (
          <div className="empty-state">
            <p>Grafikleri görmek için işlem eklemeniz gerekir.</p>
          </div>
        ) : (
          <div className="charts-grid">
            <div className="chart-container">
              <h3>Varlık Türüne Göre İşlem Sayısı</h3>
              {Object.keys(tradesByType).length > 0 ? (
                <Pie data={tradeTypeChart} options={chartOptions} />
              ) : (
                <p className="no-data">Veri yok</p>
              )}
            </div>

            <div className="chart-container">
              <h3>Kazanan vs Kaybeden</h3>
              {trades.filter(t => t.exitPrice !== '' && t.exitPrice !== null && t.exitPrice !== undefined).length > 0 ? (
                <Pie data={winLossChart} options={chartOptions} />
              ) : (
                <p className="no-data">Kapalı işlem bulunmuyor</p>
              )}
            </div>

            <div className="chart-container full-width">
              <h3>Kümülatif Kar/Zarar Trendi</h3>
              {pnlData.labels.length > 0 ? (
                <Line data={cumulativePnL} options={lineChartOptions} />
              ) : (
                <p className="no-data">Kapalı işlem bulunmuyor</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charts;
