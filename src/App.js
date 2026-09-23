import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

const STORAGE_KEY = 'daily-task-tracker.tasks';

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key) => {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);

function App() {
  const todayKey = getDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [tasksByDate, setTasksByDate] = useState({});
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEY);
      if (savedTasks) setTasksByDate(JSON.parse(savedTasks));
    } catch {
      setError('Kayıtlı görevler yüklenemedi. Yeni görevler bu oturumda tutulacak.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksByDate));
      } catch {
        setError('Görevler kaydedilemedi. Tarayıcı depolama alanınızı kontrol edin.');
      }
    }
  }, [tasksByDate, isLoading]);

  const tasks = tasksByDate[selectedDate] || [];
  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const visibleTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  const selectedDateObject = parseDateKey(selectedDate);
  const isToday = selectedDate === todayKey;
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(selectedDateObject);
      date.setDate(date.getDate() - (6 - index));
      const key = getDateKey(date);
      const dayTasks = tasksByDate[key] || [];
      return {
        key,
        label: new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(date).replace('.', ''),
        dateLabel: `${date.getDate()} ${new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date)}`,
        total: dayTasks.length,
        completed: dayTasks.filter((task) => task.completed).length,
      };
    });
    return { days, max: Math.max(...days.map((day) => day.total), 1) };
  }, [selectedDateObject, tasksByDate]);

  const updateTasks = (nextTasks) => {
    setTasksByDate((current) => ({ ...current, [selectedDate]: nextTasks }));
  };

  const addTask = (event) => {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    updateTasks([
      ...tasks,
      { id: `${Date.now()}-${Math.random()}`, title, completed: false },
    ]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    updateTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id) => {
    updateTasks(tasks.filter((task) => task.id !== id));
    if (editingId === id) cancelEditing();
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditingText(task.title);
  };

  const saveEdit = (event, id) => {
    event.preventDefault();
    const title = editingText.trim();
    if (!title) return;
    updateTasks(tasks.map((task) => (task.id === id ? { ...task, title } : task)));
    cancelEditing();
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const moveDate = (amount) => {
    const nextDate = parseDateKey(selectedDate);
    nextDate.setDate(nextDate.getDate() + amount);
    setSelectedDate(getDateKey(nextDate));
    cancelEditing();
  };

  const dateLabel = useMemo(
    () => (isToday ? 'Bugün' : formatDate(selectedDateObject)),
    [isToday, selectedDateObject]
  );

  return (
    <div className="app">
      <header className="hero">
        <div className="container hero-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">✓</span>
            <div>
              <p className="eyebrow">GÜNLÜK ODAK</p>
              <h1>Bugün ne yapacaksın?</h1>
            </div>
          </div>
          <p className="hero-note">Küçük adımlar, büyük ilerleme.</p>
        </div>
      </header>

      <main className="container main-content">
        {error && (
          <div className="alert" role="alert">
            <span aria-hidden="true">!</span>{error}
            <button type="button" onClick={() => setError('')} aria-label="Uyarıyı kapat">×</button>
          </div>
        )}

        <section className="date-toolbar" aria-label="Gün seçimi">
          <button className="icon-button" type="button" onClick={() => moveDate(-1)} aria-label="Önceki gün">←</button>
          <div className="date-heading">
            <span className="date-kicker">{isToday ? 'ŞİMDİ' : 'SEÇİLİ GÜN'}</span>
            <h2>{dateLabel}</h2>
            {!isToday && (
              <button className="today-link" type="button" onClick={() => setSelectedDate(todayKey)}>
                Bugüne dön
              </button>
            )}
          </div>
          <button className="icon-button" type="button" onClick={() => moveDate(1)} aria-label="Sonraki gün">→</button>
        </section>

        <section className="progress-card" aria-label="Günlük ilerleme">
          <div className="progress-copy">
            <div>
              <span className="section-label">GÜNLÜK İLERLEME</span>
              <strong>{completedCount} <span>/ {tasks.length} görev</span></strong>
            </div>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-message">
            {tasks.length === 0 ? 'Bugün için bir plan oluşturmaya ne dersin?' : progress === 100 ? 'Harika! Bugünün tüm görevleri tamamlandı.' : 'Devam et, hedeflerine biraz daha yaklaştın.'}
          </p>
        </section>

        <section className="chart-card" aria-labelledby="weekly-progress-title">
          <div className="card-heading">
            <div>
              <span className="section-label">GRAFİK</span>
              <h2 id="weekly-progress-title">Son 7 günlük ilerleme</h2>
            </div>
            <div className="chart-legend"><span className="legend-dot" /> Tamamlanan</div>
          </div>
          <div className="progress-chart">
            {chartData.days.map((day) => (
              <div className="chart-column" key={day.key} title={`${day.dateLabel}: ${day.completed}/${day.total} görev`}>
                <div className="chart-value">{day.total ? `${day.completed}/${day.total}` : '—'}</div>
                <div className="chart-bar-area">
                  <div className="chart-bar total-bar" style={{ height: `${Math.max((day.total / chartData.max) * 100, day.total ? 12 : 3)}%` }}>
                    <div className="chart-bar completed-bar" style={{ height: `${day.total ? (day.completed / day.total) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className="chart-label">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="task-card">
          <div className="card-heading">
            <div>
              <span className="section-label">GÖREVLER</span>
              <h2>{isToday ? 'Bugünkü planın' : `${formatDate(selectedDateObject)} planı`}</h2>
            </div>
            <span className="task-count">{tasks.length} görev</span>
          </div>
          <div className="task-filters" aria-label="Görev filtresi">
            {[
              ['all', 'Tümü'],
              ['active', 'Bekleyen'],
              ['completed', 'Tamamlanan'],
            ].map(([value, label]) => (
              <button
                className={filter === value ? 'active' : ''}
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
              >
                {label}
                {value === 'completed' && completedCount > 0 && <span>{completedCount}</span>}
              </button>
            ))}
          </div>

          <form className="add-form" onSubmit={addTask}>
            <label className="sr-only" htmlFor="new-task">Yeni görev</label>
            <input
              id="new-task"
              type="text"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="Yeni bir görev yaz..."
              maxLength="120"
            />
            <button type="submit">Görev ekle <span aria-hidden="true">+</span></button>
          </form>

          {isLoading ? (
            <div className="state-message"><span className="spinner" />Görevlerin yükleniyor...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" aria-hidden="true">✦</div>
              <h3>Henüz görev yok</h3>
              <p>Günün ilk görevini ekleyerek başlayabilirsin.</p>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty-state compact-empty">
              <h3>{filter === 'completed' ? 'Tamamlanan görev yok' : 'Bekleyen görev yok'}</h3>
              <p>Bu filtrede gösterilecek görev bulunmuyor.</p>
            </div>
          ) : (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li className={`task-item ${task.completed ? 'completed' : ''}`} key={task.id}>
                  {editingId === task.id ? (
                    <form className="edit-form" onSubmit={(event) => saveEdit(event, task.id)}>
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        aria-label="Görevi düzenle"
                        maxLength="120"
                      />
                      <button type="submit" className="save-button">Kaydet</button>
                      <button type="button" className="cancel-button" onClick={cancelEditing}>İptal</button>
                    </form>
                  ) : (
                    <>
                      <button className="check-button" type="button" onClick={() => toggleTask(task.id)} aria-label={task.completed ? 'Görevi tamamlanmadı olarak işaretle' : 'Görevi tamamlandı olarak işaretle'}>
                        {task.completed && '✓'}
                      </button>
                      <span className="task-title">{task.title}</span>
                      <div className="task-actions">
                        <button type="button" onClick={() => startEditing(task)} aria-label="Görevi düzenle">Düzenle</button>
                        <button type="button" onClick={() => deleteTask(task.id)} aria-label="Görevi sil">Sil</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <p className="storage-note"><span aria-hidden="true">▣</span> Görevlerin bu cihazda güvenle saklanır.</p>
      </main>
    </div>
  );
}

export default App;
