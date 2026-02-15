import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, BarChart3, TrendingUp, Zap, Sparkles, Trash2, Edit2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WorkoutApp = () => {
  const [activeView, setActiveView] = useState('program');
  const [activeDay, setActiveDay] = useState('lundi');
  const [timeRange, setTimeRange] = useState('7d');
  const [measurements, setMeasurements] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newMeasurement, setNewMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    cou: '', epaules: '', pectoraux: '', taille: '', cuisses: '', bras: '', poids: ''
  });

  useEffect(() => { fetchMeasurements(); }, []);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch('/.netlify/functions/measurements');
      const data = await res.json();
      setMeasurements(data);
    } catch (err) { console.error('Erreur:', err); }
  };

  const saveMeasurement = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...newMeasurement, id: editingId } : newMeasurement;

      const res = await fetch('/.netlify/functions/measurements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erreur');

      // Reset total
      setEditingId(null);
      setNewMeasurement({
        date: new Date().toISOString().split('T')[0],
        cou: '', epaules: '', pectoraux: '', taille: '', cuisses: '', bras: '', poids: ''
      });
      fetchMeasurements();
    } catch (err) { alert("Erreur lors de l'enregistrement"); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setNewMeasurement({
      date: m.date.split('T')[0],
      cou: m.cou || '',
      epaules: m.epaules || '',
      pectoraux: m.pectoraux || '',
      taille: m.taille || '',
      cuisses: m.cuisses || '',
      bras: m.bras || '',
      poids: m.poids || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMeasurement = async (id) => {
    if (!window.confirm('Supprimer cette mesure ?')) return;
    await fetch('/.netlify/functions/measurements', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
    fetchMeasurements();
  };

  // Logique de progression en CM / KG
  const getMeasurementProgress = (metric) => {
    if (measurements.length < 2) return null;
    const sorted = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = parseFloat(sorted[0][metric]);
    const previous = parseFloat(sorted[1][metric]);
    if (!latest || !previous) return null;
    const diff = (latest - previous).toFixed(1);
    return {
      val: diff > 0 ? `+${diff}` : diff,
      isPositive: diff > 0
    };
  };

  // Filtrage robuste pour les graphiques
  const getFilteredData = (metric) => {
    const sorted = [...measurements]
      .filter(m => m[metric] !== null && m[metric] !== "")
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const dataWithMA = sorted.map((m, index) => {
      const windowSize = 7;
      const start = Math.max(0, index - windowSize + 1);
      const subset = sorted.slice(start, index + 1);
      const avg = subset.reduce((acc, curr) => acc + parseFloat(curr[metric]), 0) / subset.length;

      return {
        date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        fullDate: new Date(m.date),
        value: parseFloat(m[metric]),
        moyenne: parseFloat(avg.toFixed(2))
      };
    });

    const now = new Date();
    return dataWithMA.filter(d => {
      const diffDays = Math.ceil(Math.abs(now - d.fullDate) / (1000 * 60 * 60 * 24));
      if (timeRange === '7d') return diffDays <= 7;
      if (timeRange === '1m') return diffDays <= 30;
      if (timeRange === '1y') return diffDays <= 365;
      return true;
    });
  };

  const getWeightTrends = () => {
    if (measurements.length < 2) return { sevenDays: null, oneMonth: null };
    const sorted = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = parseFloat(sorted[0].poids);

    const getDiff = (days) => {
      const target = new Date();
      target.setDate(target.getDate() - days);
      const past = sorted.find(m => new Date(m.date) <= target);
      if (!past) return null;
      const d = (latest - parseFloat(past.poids)).toFixed(1);
      return { val: d > 0 ? `+${d}` : d, isLoss: d <= 0 };
    };
    return { sevenDays: getDiff(7), oneMonth: getDiff(30) };
  };

  const weightTrends = getWeightTrends();

  // --- RENDU ---
  return (
    <div className="min-h-screen bg-black text-white font-sans pb-10">
      {/* Header compact mobile */}
      <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-600/20">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Hypertrophy</h1>
        </div>
      </div>

      {/* Nav Sticky Mobile */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-lg border-b border-zinc-900">
        <div className="flex justify-around p-2 max-w-2xl mx-auto">
          {[
            { id: 'program', icon: Calendar, label: 'Séances' },
            { id: 'measurements', icon: TrendingUp, label: 'Mensus' },
            { id: 'stats', icon: BarChart3, label: 'Volume' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                activeView === tab.id ? 'text-red-500 bg-red-500/5' : 'text-zinc-500'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        {activeView === 'measurements' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Formulaire stylisé */}
            <div className="bg-zinc-900 rounded-3xl p-6 border-2 border-zinc-800 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase flex items-center gap-2">
                  {editingId ? <Edit2 className="text-purple-500" /> : <Sparkles className="text-green-500" />}
                  {editingId ? 'Modifier la mesure' : 'Nouvelle entrée'}
                </h3>
                {editingId && (
                  <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-800 rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Date</label>
                  <input type="date" value={newMeasurement.date} onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 focus:border-green-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Poids (kg)</label>
                  <input type="number" step="0.1" placeholder="75.0" value={newMeasurement.poids} onChange={(e) => setNewMeasurement({...newMeasurement, poids: e.target.value})} className="w-full bg-zinc-800 p-4 rounded-2xl border border-zinc-700 focus:border-green-500 outline-none text-xl font-black" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {['bras', 'taille', 'cuisses', 'epaules', 'pectoraux', 'cou'].map(field => (
                  <div key={field} className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">{field}</label>
                    <input type="number" step="0.1" placeholder="cm" value={newMeasurement[field]} onChange={(e) => setNewMeasurement({...newMeasurement, [field]: e.target.value})} className="w-full bg-zinc-800 p-3 rounded-xl border border-zinc-700 outline-none text-center font-bold" />
                  </div>
                ))}
              </div>

              <button 
                onClick={saveMeasurement} 
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg ${
                  editingId ? 'bg-purple-600 shadow-purple-900/20' : 'bg-green-600 shadow-green-900/20'
                }`}
              >
                {editingId ? '💾 Mettre à jour' : '⚡ Enregistrer les données'}
              </button>
            </div>

            {/* État Actuel en CM */}
            {measurements.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['poids', 'bras', 'taille', 'cuisses', 'epaules', 'pectoraux'].map(metric => {
                  const val = measurements[0][metric];
                  const progress = getMeasurementProgress(metric);
                  if (!val) return null;
                  return (
                    <div key={metric} className={`p-4 rounded-2xl border ${metric === 'poids' ? 'bg-zinc-900 border-green-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase mb-1">{metric}</div>
                      <div className="text-xl font-black tracking-tight">
                        {val} <small className="text-[10px] text-zinc-500">{metric === 'poids' ? 'kg' : 'cm'}</small>
                      </div>
                      {progress && (
                        <div className={`text-[10px] font-black mt-1 ${progress.isPositive ? 'text-red-400' : 'text-green-400'}`}>
                          {progress.val} {metric === 'poids' ? 'kg' : 'cm'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Graphiques d'évolution - Fixé */}
            {measurements.length >= 2 && (
              <div className="bg-zinc-900 rounded-3xl p-6 border-2 border-zinc-800">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic">📈 Graphiques</h3>
                  <div className="flex bg-zinc-800 p-1 rounded-lg">
                    {['7d', '1m', 'all'].map(r => (
                      <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 text-[10px] font-black rounded ${timeRange === r ? 'bg-green-600 text-white' : 'text-zinc-500'}`}>{r.toUpperCase()}</button>
                    ))}
                  </div>
                </div>

                {/* Graph Poids */}
                <div className="h-[250px] w-full mb-10">
                  <h4 className="text-xs font-bold text-green-500 uppercase mb-4 ml-2">Poids Évolution</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getFilteredData('poids')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickMargin={10} />
                      <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="moyenne" stroke="#3f3f46" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={4} dot={timeRange === '7d'} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Grid petits graphs - Fixé pour Taille et autres */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['bras', 'taille', 'cuisses', 'epaules'].map(m => {
                    const data = getFilteredData(m);
                    if (data.length < 2) return null;
                    return (
                      <div key={m} className="bg-black/20 p-4 rounded-2xl border border-zinc-800">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">{m}</h4>
                        <ResponsiveContainer width="100%" height={100}>
                          <LineChart data={data}>
                            <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                            <Tooltip contentStyle={{ display: 'none' }} />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Historique avec Edition */}
            <div className="bg-zinc-900 rounded-3xl p-6 border-2 border-zinc-800">
              <h3 className="text-xl font-black uppercase mb-6 italic">📜 Historique</h3>
              <div className="space-y-3">
                {measurements.slice(0, showAllHistory ? measurements.length : 10).map((m) => (
                  <div key={m.id} className="bg-zinc-800/50 p-4 rounded-2xl flex justify-between items-center group">
                    <div>
                      <div className="text-sm font-black text-zinc-200">
                        {new Date(m.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        {m.poids}kg • {m.bras || '--'}cm bras • {m.taille || '--'}cm taille
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(m)} className="p-3 bg-zinc-800 text-purple-400 rounded-xl hover:bg-purple-500 hover:text-white transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMeasurement(m.id)} className="p-3 bg-zinc-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {measurements.length > 10 && (
                <button onClick={() => setShowAllHistory(!showAllHistory)} className="w-full mt-6 py-4 bg-zinc-800 text-zinc-500 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                  {showAllHistory ? 'Réduire' : `Voir les ${measurements.length - 10} restants`}
                </button>
              )}
            </div>

          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>
    </div>
  );
};

export default WorkoutApp;