import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, BarChart3, TrendingUp, Zap, Sparkles, Trash2, Edit2, X, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WorkoutApp = () => {
  // --- ÉTATS ---
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

  // --- DONNÉES PROGRAMME (Restaurées) ---
  const workoutDays = {
    lundi: {
      name: "UPPER A", emoji: "🔴", color: "from-red-500 to-red-700", day: "LUNDI", goal: "Largeur & Épaisseur",
      totalSeries: { Pectoraux: 7, Dorsaux: 8, Deltoïdes: 4 },
      exercises: [
        { name: "Développé Incliné Haltères", sets: "4 x 8-10", rpe: 9 },
        { name: "Tirage Vertical Large", sets: "4 x 10-12", rpe: 9, tech: "Étirement max en haut." },
        { name: "Chest Press Machine", sets: "3 x 8-10", rpe: 10 },
        { name: "Tirage Horizontal Unilatéral", sets: "4 x 12", rpe: 9, ajout: "Focus contraction arrière." },
        { name: "Lu Raises", sets: "4 x 15-20", rpe: 9 }
      ]
    },
    mercredi: {
      name: "LEGS & ARMS", emoji: "🟣", color: "from-purple-500 to-purple-700", day: "MERCREDI", goal: "Quads & Bras",
      totalSeries: { Quadriceps: 14, Biceps: 7, Triceps: 7 },
      exercises: [
        { name: "Presse à Cuisses (Bas)", sets: "4 x 10-12", rpe: 9 },
        { name: "Leg Extension", sets: "4 x 15-20", rpe: 10 },
        { name: "Superset: Bayesian Curl / Katana", sets: "4 x 12-15", rpe: 9, tech: "Focus étirement." },
        { name: "Superset: Preacher / Pushdown", sets: "3 x 12-15", rpe: 9 }
      ]
    },
    vendredi: {
      name: "PUSH AESTHETIC", emoji: "🟠", color: "from-orange-500 to-orange-700", day: "VENDREDI", goal: "Pecs & Épaules",
      totalSeries: { Pectoraux: 8, Deltoïdes: 13, Triceps: 8 },
      exercises: [
        { name: "Dev. Incliné Smith", sets: "4 x 10-12", rpe: 9 },
        { name: "Élévations Latérales Câble", sets: "5 x 15-20", rpe: 10 },
        { name: "Pec Deck (Fly)", sets: "4 x 15", rpe: 9 },
        { name: "Skullcrusher", sets: "4 x 10-12", rpe: 9 }
      ]
    },
    samedi: {
      name: "LEGS & PULL", emoji: "🟡", color: "from-amber-500 to-amber-700", day: "SAMEDI", goal: "Ischios & Dos",
      totalSeries: { Ischios: 12, Dorsaux: 8, Biceps: 7 },
      exercises: [
        { name: "Leg Curl Assis", sets: "5 x 10-15", rpe: 10 },
        { name: "Presse Pieds Hauts", sets: "4 x 12", rpe: 9 },
        { name: "Tirage Vertical Neutre", sets: "4 x 12", rpe: 9 },
        { name: "Curl Marteau", sets: "4 x 12-15", rpe: 9 }
      ]
    }
  };

  // --- LOGIQUE ---
  useEffect(() => { fetchMeasurements(); }, []);

  const fetchMeasurements = async () => {
    try {
      const res = await fetch('/.netlify/functions/measurements');
      const data = await res.json();
      setMeasurements(data);
    } catch (err) { console.error(err); }
  };

  const saveMeasurement = async () => {
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { ...newMeasurement, id: editingId } : newMeasurement;
      await fetch('/.netlify/functions/measurements', {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setEditingId(null);
      setNewMeasurement({ date: new Date().toISOString().split('T')[0], cou: '', epaules: '', pectoraux: '', taille: '', cuisses: '', bras: '', poids: '' });
      fetchMeasurements();
    } catch (err) { alert("Erreur"); }
  };

  const deleteMeasurement = async (id) => {
    if (window.confirm("Supprimer ?")) {
      await fetch('/.netlify/functions/measurements', { method: 'DELETE', body: JSON.stringify({ id }) });
      fetchMeasurements();
    }
  };

  const getFilteredData = (metric) => {
    const sorted = [...measurements]
      .filter(m => m[metric] !== null && m[metric] !== "")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sorted.map(m => ({
      date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: parseFloat(m[metric])
    }));
  };

  const getProgressCM = (metric) => {
    if (measurements.length < 2) return null;
    const m = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = parseFloat(m[0][metric]);
    const prev = parseFloat(m[1][metric]);
    if (!latest || !prev) return null;
    const diff = (latest - prev).toFixed(1);
    return { val: diff > 0 ? `+${diff}` : diff, isPos: diff > 0 };
  };

  const weeklyVolume = () => {
    const v = {};
    Object.values(workoutDays).forEach(d => {
      Object.entries(d.totalSeries).forEach(([m, s]) => { v[m] = (v[m] || 0) + s; });
    });
    return v;
  };

  // --- RENDU ---
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Header */}
      <div className="p-6 border-b border-zinc-900 bg-zinc-950">
        <h1 className="text-4xl font-black italic tracking-tighter uppercase italic text-red-600">Hypertrophy</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        
        {/* VUE PROGRAMME */}
        {activeView === 'program' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(workoutDays).map(([key, data]) => (
                <button key={key} onClick={() => setActiveDay(key)} className={`p-4 rounded-2xl border-2 transition-all ${activeDay === key ? 'border-white bg-zinc-900' : 'border-zinc-800 bg-zinc-900/40'}`}>
                  <div className="text-2xl mb-1">{data.emoji}</div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase">{data.day}</div>
                  <div className="font-black text-sm">{data.name}</div>
                </button>
              ))}
            </div>

            {activeDay && (
              <div className="space-y-4">
                <div className={`p-6 rounded-3xl bg-gradient-to-br ${workoutDays[activeDay].color}`}>
                  <h2 className="text-2xl font-black uppercase">{workoutDays[activeDay].name}</h2>
                  <p className="text-white/70 text-xs font-bold">{workoutDays[activeDay].goal}</p>
                </div>
                {workoutDays[activeDay].exercises.map((ex, i) => (
                  <div key={i} className="p-5 bg-zinc-900 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-black mb-2">{ex.name}</h3>
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-red-600 rounded text-[10px] font-black">{ex.sets}</span>
                      <span className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-black">RPE {ex.rpe}</span>
                    </div>
                    {ex.tech && <div className="text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded-lg">⚠️ {ex.tech}</div>}
                    {ex.ajout && <div className="text-xs text-green-400 bg-green-400/10 p-2 rounded-lg mt-2">💡 {ex.ajout}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VUE VOLUME (STATS) */}
        {activeView === 'stats' && (
          <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-black uppercase italic px-2">Volume Hebdomadaire</h2>
            {Object.entries(weeklyVolume()).map(([muscle, sets]) => (
              <div key={muscle} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex justify-between items-center">
                <span className="font-black uppercase text-sm">{muscle}</span>
                <span className="text-2xl font-black text-purple-500">{sets} <small className="text-[10px] text-zinc-500">SÉRIES</small></span>
              </div>
            ))}
          </div>
        )}

        {/* VUE MENSURATIONS */}
        {activeView === 'measurements' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Formulaire */}
            <div className="p-6 bg-zinc-900 rounded-3xl border-2 border-zinc-800">
              <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                {editingId ? <Edit2 className="text-purple-500 w-5 h-5"/> : <Sparkles className="text-green-500 w-5 h-5"/>}
                {editingId ? 'Modifier' : 'Nouvelle Mesure'}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input type="date" value={newMeasurement.date} onChange={e => setNewMeasurement({...newMeasurement, date: e.target.value})} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 text-sm" />
                <input type="number" placeholder="Poids" value={newMeasurement.poids} onChange={e => setNewMeasurement({...newMeasurement, poids: e.target.value})} className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 font-black text-green-500" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['bras', 'taille', 'cuisses', 'epaules', 'pectoraux', 'cou'].map(f => (
                  <input key={f} type="number" placeholder={f} value={newMeasurement[f]} onChange={e => setNewMeasurement({...newMeasurement, [f]: e.target.value})} className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-center text-xs" />
                ))}
              </div>
              <button onClick={saveMeasurement} className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest ${editingId ? 'bg-purple-600' : 'bg-green-600'}`}>
                {editingId ? 'Mettre à jour' : 'Enregistrer'}
              </button>
            </div>

            {/* État Actuel */}
            {measurements[0] && (
              <div className="grid grid-cols-2 gap-3">
                {['poids', 'bras', 'taille', 'cuisses', 'epaules', 'pectoraux'].map(m => {
                  const prog = getProgressCM(m);
                  return (
                    <div key={m} className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800">
                      <div className="text-[10px] font-black text-zinc-500 uppercase">{m}</div>
                      <div className="text-xl font-black">{measurements[0][m]} <small className="text-[10px]">{m === 'poids' ? 'kg' : 'cm'}</small></div>
                      {prog && <div className={`text-[10px] font-black ${prog.isPos ? 'text-red-500' : 'text-green-500'}`}>{prog.val} {m === 'poids' ? 'kg' : 'cm'}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Graphiques */}
            <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 h-64">
              <h3 className="text-xs font-black uppercase text-zinc-500 mb-4">Évolution Poids</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFilteredData('poids')}>
                  <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={4} dot={false} />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip contentStyle={{background:'#111', border:'none', borderRadius:'10px'}} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Liste Historique */}
            <div className="space-y-2">
              <h3 className="text-sm font-black uppercase italic px-2">Historique récent</h3>
              {measurements.slice(0, 5).map(m => (
                <div key={m.id} className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <div className="text-xs font-black">{new Date(m.date).toLocaleDateString('fr-FR')}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase">{m.poids}kg • {m.bras}cm bras</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(m)} className="p-2 bg-zinc-800 rounded-lg text-purple-400"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteMeasurement(m.id)} className="p-2 bg-zinc-800 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* NAVBAR FIXE EN BAS */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 px-6 py-4 flex justify-between items-center z-50">
        {[
          { id: 'program', icon: Calendar, label: 'Séances' },
          { id: 'measurements', icon: TrendingUp, label: 'Mensu' },
          { id: 'stats', icon: BarChart3, label: 'Volume' }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex flex-col items-center gap-1 transition-all ${activeView === item.id ? 'text-red-500 scale-110' : 'text-zinc-600'}`}>
            <item.icon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
            {activeView === item.id && <div className="w-1 h-1 bg-red-500 rounded-full" />}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default WorkoutApp;