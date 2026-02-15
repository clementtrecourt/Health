import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, BarChart3, TrendingUp, Zap, Sparkles, Trash2, Edit2, X, ChevronRight, Target, Flame } from 'lucide-react';
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

  // --- DONNÉES PROGRAMME (Version Ultra-Détaillée) ---
  const workoutDays = {
    lundi: {
      name: "UPPER A", subtitle: "Largeur & Épaisseur", color: "from-red-500 to-red-700", day: "LUNDI", emoji: "🔴",
      goal: "On ajoute du volume Dos sans charger les lombaires",
      totalSeries: { Pectoraux: 7, Dorsaux: 8, Deltoïdes: 4 },
      exercises: [
        { name: "Développé Incliné Haltères", sets: "4 x 8-10", rpe: 9, muscles: ["Pectoraux"] },
        { name: "Tirage Vertical Large (Lat Pulldown)", sets: "4 x 10-12", rpe: 9, tech: "Étirement max en haut.", muscles: ["Dorsaux"] },
        { name: "Chest Press Machine (Lourd)", sets: "3 x 8-10", rpe: 10, muscles: ["Pectoraux"] },
        { name: "Tirage Horizontal Unilatéral", sets: "4 x 12", rpe: 9, ajout: "+4 séries pour le dos. L'unilatéral permet d'aller chercher plus loin derrière.", muscles: ["Dorsaux"] },
        { name: "Lu Raises (Élévations Latérales)", sets: "4 x 15-20", rpe: 9, muscles: ["Deltoïdes"] }
      ]
    },
    mercredi: {
      name: "LEGS A + ARMS", subtitle: "Quads & Bras", color: "from-purple-500 to-purple-700", day: "MERCREDI", emoji: "🟣",
      goal: "On transforme ce jour en vraie séance BRAS",
      totalSeries: { Quadriceps: 14, Biceps: 7, Triceps: 7 },
      exercises: [
        { name: "Presse à Cuisses (Pieds bas)", sets: "4 x 10-12", rpe: 9, muscles: ["Quadriceps"] },
        { name: "Leg Extension", sets: "4 x 15-20", rpe: 10, tech: "Dropset final sur la dernière série.", muscles: ["Quadriceps"] },
        { name: "SUPERSET: Bayesian Curl + Katana", sets: "4 x 12-15", rpe: 9, ajout: "Étirement max pour les deux muscles.", muscles: ["Biceps", "Triceps"] },
        { name: "SUPERSET: Preacher Curl + Pushdown", sets: "3 x 12-15", rpe: 9, muscles: ["Biceps", "Triceps"] }
      ]
    },
    vendredi: {
      name: "PUSH AESTHETIC", subtitle: "Pecs/Épaules/Triceps", color: "from-orange-500 to-orange-700", day: "VENDREDI", emoji: "🟠",
      goal: "Focus sur le \"Shelf\" et les triceps",
      totalSeries: { Pectoraux: 8, Deltoïdes: 13, Triceps: 8 },
      exercises: [
        { name: "Dev. Incliné Machine (Smith)", sets: "4 x 10-12", rpe: 9, muscles: ["Pectoraux"] },
        { name: "Élévations Latérales Câble", sets: "5 x 15-20", rpe: 10, tech: "Tension continue, passage derrière le dos.", muscles: ["Deltoïdes"] },
        { name: "Pec Deck (Fly)", sets: "4 x 15", rpe: 9, tech: "Partiels en position étirée sur la fin.", muscles: ["Pectoraux"] },
        { name: "Skullcrusher (Barre au front)", sets: "4 x 10-12", rpe: 9, ajout: "4 séries lourdes pour la masse.", muscles: ["Triceps"] }
      ]
    },
    samedi: {
      name: "LEGS B + PULL", subtitle: "Ischios & Dos", color: "from-amber-500 to-amber-700", day: "SAMEDI", emoji: "🟡",
      goal: "On corrige le manque de volume Ischios et Dos",
      totalSeries: { "Ischios": 12, Dorsaux: 8, Biceps: 7 },
      exercises: [
        { name: "Leg Curl Assis", sets: "5 x 10-15", rpe: 10, tech: "Penche le buste en avant pour étirer.", muscles: ["Ischio-jambiers"] },
        { name: "Tirage Vertical Prise Neutre", sets: "4 x 12", rpe: 9, ajout: "Cible le bas des dorsaux.", muscles: ["Dorsaux"] },
        { name: "Hyperextension (Focus Ischios)", sets: "3 x 15-20", rpe: 9, tech: "Dos rond, contracte les fessiers.", muscles: ["Ischios"] },
        { name: "Curl Marteau (Corde)", sets: "4 x 12-15", rpe: 9, muscles: ["Biceps"] }
      ]
    }
  };

  // --- LOGIQUE (Restaurée) ---
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { alert("Erreur de sauvegarde"); }
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setNewMeasurement({
      date: m.date.split('T')[0],
      cou: m.cou || '', epaules: m.epaules || '', pectoraux: m.pectoraux || '',
      taille: m.taille || '', cuisses: m.cuisses || '', bras: m.bras || '', poids: m.poids || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteMeasurement = async (id) => {
    if (!window.confirm("Supprimer ?")) return;
    await fetch('/.netlify/functions/measurements', { method: 'DELETE', body: JSON.stringify({ id }) });
    fetchMeasurements();
  };

  const getFilteredData = (metric) => {
    const sorted = [...measurements]
      .filter(m => m[metric] !== null && m[metric] !== "")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return sorted.map((m, index) => {
        const windowSize = 7;
        const start = Math.max(0, index - windowSize + 1);
        const subset = sorted.slice(start, index + 1);
        const avg = subset.reduce((acc, curr) => acc + parseFloat(curr[metric]), 0) / subset.length;
        return {
            date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
            value: parseFloat(m[metric]),
            moyenne: parseFloat(avg.toFixed(2)),
            fullDate: new Date(m.date)
        }
    }).filter(d => {
        const diffDays = Math.ceil(Math.abs(new Date() - d.fullDate) / (1000 * 60 * 60 * 24));
        if (timeRange === '7d') return diffDays <= 7;
        if (timeRange === '1m') return diffDays <= 30;
        if (timeRange === '1y') return diffDays <= 365;
        return true;
    });
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

  const getWeightTrends = () => {
    if (measurements.length < 2) return { sevenDays: null, oneMonth: null };
    const m = [...measurements].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = parseFloat(m[0].poids);
    const getDiff = (days) => {
      const target = new Date();
      target.setDate(target.getDate() - days);
      const past = m.find(entry => new Date(entry.date) <= target);
      if (!past) return null;
      const d = (latest - parseFloat(past.poids)).toFixed(1);
      return { val: d > 0 ? `+${d}` : d, isLoss: d <= 0 };
    };
    return { sevenDays: getDiff(7), oneMonth: getDiff(30) };
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
    <div className="min-h-screen bg-black text-white pb-28">
      {/* Header Badass */}
      <div className="relative overflow-hidden bg-zinc-950 border-b border-zinc-900 px-6 py-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-3xl rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">Hypertrophy</h1>
            <p className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Protocol • 4 Days / Week</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        
        {/* VUE PROGRAMME (Restaurée avec InfoBlocks) */}
        {activeView === 'program' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(workoutDays).map(([key, data]) => (
                <button key={key} onClick={() => setActiveDay(key)} className={`p-4 rounded-3xl border-2 transition-all text-left relative overflow-hidden ${activeDay === key ? 'border-white bg-zinc-900 scale-[1.02]' : 'border-zinc-800 bg-zinc-900/40'}`}>
                  <div className="text-3xl mb-2">{data.emoji}</div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{data.day}</div>
                  <div className="font-black text-lg leading-tight uppercase italic">{data.name}</div>
                </button>
              ))}
            </div>

            {activeDay && (
              <div className="space-y-4 animate-fadeIn">
                <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br ${workoutDays[activeDay].color} shadow-2xl shadow-red-900/10`}>
                  <h2 className="text-3xl font-black uppercase italic leading-none mb-2">{workoutDays[activeDay].name}</h2>
                  <p className="text-white/80 font-bold text-sm italic">{workoutDays[activeDay].goal}</p>
                </div>

                <div className="space-y-3">
                  {workoutDays[activeDay].exercises.map((ex, i) => (
                    <div key={i} className="p-6 bg-zinc-900 rounded-[2rem] border-2 border-zinc-800">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-black italic uppercase leading-tight max-w-[70%]">{ex.name}</h3>
                        <div className="flex flex-col items-end">
                          <span className="text-red-500 font-black text-lg leading-none">{ex.sets}</span>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">RPE {ex.rpe}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {ex.tech && <InfoBlock icon={Zap} label="TECHNIQUE" text={ex.tech} color="yellow" />}
                        {ex.ajout && <InfoBlock icon={TrendingUp} label="PROGRESSION" text={ex.ajout} color="green" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VUE STATS / VOLUME */}
        {activeView === 'stats' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-black uppercase italic px-2">Volume Hebdomadaire</h2>
            <div className="grid gap-3">
                {Object.entries(weeklyVolume()).map(([muscle, sets]) => (
                <div key={muscle} className="p-5 bg-zinc-900 rounded-3xl border border-zinc-800 flex justify-between items-center group hover:border-purple-500/50 transition-all">
                    <span className="font-black uppercase italic tracking-wider">{muscle}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-purple-500">{sets}</span>
                        <span className="text-[10px] font-bold text-zinc-600 uppercase italic tracking-widest">Séries</span>
                    </div>
                </div>
                ))}
            </div>
          </div>
        )}

        {/* VUE MENSURATIONS (Optimisée) */}
        {activeView === 'measurements' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Formulaire stylé */}
            <div className="p-6 bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                    {editingId ? <Edit2 className="text-purple-500"/> : <Sparkles className="text-green-500"/>}
                    {editingId ? 'Modifier la mesure' : 'Nouveau log'}
                </h3>
                {editingId && <button onClick={() => {setEditingId(null); setNewMeasurement({date: new Date().toISOString().split('T')[0], poids:'', cou:'', epaules:'', pectoraux:'', taille:'', cuisses:'', bras:''})}} className="text-zinc-500"><X/></button>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="date" value={newMeasurement.date} onChange={e => setNewMeasurement({...newMeasurement, date: e.target.value})} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 text-sm font-bold focus:border-green-500 outline-none" />
                <input type="number" step="0.1" placeholder="POIDS (KG)" value={newMeasurement.poids} onChange={e => setNewMeasurement({...newMeasurement, poids: e.target.value})} className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 text-lg font-black text-green-500 outline-none" />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {['bras', 'taille', 'cuisses', 'epaules', 'pectoraux', 'cou'].map(f => (
                  <input key={f} type="number" step="0.1" placeholder={f.toUpperCase()} value={newMeasurement[f]} onChange={e => setNewMeasurement({...newMeasurement, [f]: e.target.value})} className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-center text-xs font-bold uppercase outline-none" />
                ))}
              </div>
              <button onClick={saveMeasurement} className={`w-full py-5 rounded-[1.5rem] font-black uppercase italic tracking-widest transition-all ${editingId ? 'bg-purple-600 shadow-lg shadow-purple-600/20' : 'bg-green-600 shadow-lg shadow-green-600/20'}`}>
                {editingId ? '🆙 Mettre à jour' : '💾 Enregistrer la session'}
              </button>
            </div>

            {/* État Actuel en CM */}
            {measurements[0] && (
              <div className="grid grid-cols-2 gap-3">
                {['poids', 'bras', 'taille', 'cuisses', 'epaules', 'pectoraux'].map(m => {
                  const prog = getProgressCM(m);
                  const isPoids = m === 'poids';
                  return (
                    <div key={m} className={`p-5 rounded-3xl border transition-all ${isPoids ? 'bg-green-500/5 border-green-500/30' : 'bg-zinc-900/50 border-zinc-800'}`}>
                      <div className="text-[10px] font-black text-zinc-500 uppercase italic tracking-widest mb-1">{m}</div>
                      <div className="text-2xl font-black italic">{measurements[0][m]} <small className="text-[10px] text-zinc-500 uppercase">{isPoids ? 'kg' : 'cm'}</small></div>
                      {prog && (
                          <div className={`text-[11px] font-black mt-1 ${prog.isPos ? 'text-red-500' : 'text-green-500'}`}>
                            {prog.val} {isPoids ? 'kg' : 'cm'}
                          </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Graphique de Poids avec MA */}
            <div className="p-6 bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black uppercase italic text-green-500 tracking-widest">Évolution Poids</h3>
                    <div className="flex bg-zinc-800 p-1 rounded-xl">
                        {['7d', '1m', 'all'].map(r => (
                            <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 text-[9px] font-black rounded-lg ${timeRange === r ? 'bg-green-600 text-white' : 'text-zinc-500'}`}>{r.toUpperCase()}</button>
                        ))}
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getFilteredData('poids')}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                            <Tooltip contentStyle={{background:'#18181b', border:'1px solid #27272a', borderRadius:'15px'}} />
                            <Line type="monotone" dataKey="moyenne" stroke="#ffffff" strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.3} />
                            <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={4} dot={timeRange === '7d'} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Petits Graphs Mensurations */}
            <div className="grid grid-cols-2 gap-4">
                {['bras', 'taille', 'cuisses', 'epaules'].map(m => {
                    const d = getFilteredData(m);
                    if (d.length < 2) return null;
                    return (
                        <div key={m} className="p-4 bg-zinc-900/40 rounded-3xl border border-zinc-800">
                             <div className="text-[10px] font-black text-zinc-500 uppercase italic mb-2">{m}</div>
                             <div className="h-20">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={d}>
                                        <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                    )
                })}
            </div>

            {/* Historique paginé */}
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase italic px-2">Dernières entrées</h3>
              {measurements.slice(0, showAllHistory ? measurements.length : 8).map(m => (
                <div key={m.id} className="p-5 bg-zinc-900/30 rounded-3xl border border-zinc-800 flex justify-between items-center group transition-all hover:bg-zinc-900">
                  <div>
                    <div className="text-xs font-black italic">{new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{m.poids}kg • {m.bras || '--'}cm bras</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(m)} className="p-3 bg-zinc-800 rounded-2xl text-purple-400 hover:bg-purple-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => deleteMeasurement(m.id)} className="p-3 bg-zinc-800 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {measurements.length > 8 && (
                  <button onClick={() => setShowAllHistory(!showAllHistory)} className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 bg-zinc-900/20 rounded-2xl">
                      {showAllHistory ? '▲ RÉDUIRE' : `▼ VOIR LES ${measurements.length - 8} SUIVANTS`}
                  </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* NAVBAR STYLE APP MOBILE (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2">
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-[2.5rem] flex justify-between items-center px-8 py-4 shadow-2xl">
          {[
            { id: 'program', icon: Calendar, label: 'Train' },
            { id: 'measurements', icon: TrendingUp, label: 'Mensu' },
            { id: 'stats', icon: BarChart3, label: 'Vol.' }
          ].map(item => (
            <button key={item.id} onClick={() => setActiveView(item.id)} className={`flex flex-col items-center gap-1 transition-all ${activeView === item.id ? 'text-red-500 scale-110' : 'text-zinc-600'}`}>
              <item.icon className={`w-6 h-6 ${activeView === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-[9px] font-black uppercase tracking-[0.1em]">{item.label}</span>
              {activeView === item.id && <div className="w-1 h-1 bg-red-500 rounded-full mt-0.5 animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>
    </div>
  );
};

const InfoBlock = ({ icon: Icon, label, text, color }) => {
    const colors = {
        yellow: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
        green: "bg-green-500/10 border-green-500/20 text-green-400",
        blue: "bg-blue-500/10 border-blue-500/20 text-blue-400"
    }[color];
    return (
        <div className={`p-3 border rounded-2xl flex gap-3 items-start ${colors}`}>
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
                <span className="text-[9px] font-black uppercase italic tracking-widest block mb-0.5 opacity-60">{label}</span>
                <p className="text-xs font-bold leading-relaxed">{text}</p>
            </div>
        </div>
    );
};

export default WorkoutApp;