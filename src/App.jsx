import React, { useState, useEffect } from 'react';
import { Dumbbell, Calendar, BarChart3, TrendingUp, Flame, Target, Zap, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const WorkoutApp = () => {
  const [activeView, setActiveView] = useState('program');
  const [activeDay, setActiveDay] = useState('lundi');
  const [expandedDay, setExpandedDay] = useState(null);
//   useEffect(() => {
//   fetch('/.netlify/functions/db')
//     .then(res => res.json())
//     .then(data => console.log('DB OK:', data))
//     .catch(err => console.error(err));
// }, []);
const [timeRange, setTimeRange] = useState('7d'); // '7d', '1m', '1y', 'all'
  useEffect(() => {
  const loadMeasurements = async () => {
    try {
      const res = await fetch('/.netlify/functions/measurements');
      if (!res.ok) throw new Error('Erreur serveur');
      const data = await res.json();
      setMeasurements(data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    }
  };

  loadMeasurements();
}, []);
  // Mensurations
  const [measurements, setMeasurements] = useState([]);
  
  const [newMeasurement, setNewMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    cou: '',
    epaules: '',
    pectoraux: '',
    taille: '',
    cuisses: '',
    bras: '',
    poids: ''
  });

  // Fonctions mensurations
  const saveMeasurement = async () => {
  try {
    // Convertir les strings vides en null ou number
    const payload = {
      ...newMeasurement,
      cou: newMeasurement.cou ? parseFloat(newMeasurement.cou) : null,
      epaules: newMeasurement.epaules ? parseFloat(newMeasurement.epaules) : null,
      pectoraux: newMeasurement.pectoraux ? parseFloat(newMeasurement.pectoraux) : null,
      taille: newMeasurement.taille ? parseFloat(newMeasurement.taille) : null,
      cuisses: newMeasurement.cuisses ? parseFloat(newMeasurement.cuisses) : null,
      bras: newMeasurement.bras ? parseFloat(newMeasurement.bras) : null,
      poids: newMeasurement.poids ? parseFloat(newMeasurement.poids) : null,
    };

    const res = await fetch('/.netlify/functions/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Erreur ajout');

    const saved = await res.json();
    setMeasurements(prev => [saved, ...prev]);
  } catch (err) {
    console.error(err);
  }
};

  const deleteMeasurement = async (id) => {
  await fetch('/.netlify/functions/measurements', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  setMeasurements(prev => prev.filter(m => m.id !== id));

};

  const getLatestMeasurement = () => {
    return measurements.length > 0 ? measurements[0] : null;
  };

  const getMeasurementProgress = (metric) => {
    if (measurements.length < 2) return null;
    const latest = parseFloat(measurements[0][metric]) || 0;
    const previous = parseFloat(measurements[1][metric]) || 0;
    if (latest === 0 || previous === 0) return null;
    return ((latest - previous) / previous * 100).toFixed(1);
  };
  const getChartData = (metric) => {
  return measurements
    .filter(m => m[metric])
    .sort((a, b) => new Date(a.date) - new Date(b.date)) // tri croissant par date
    .map(m => ({
      date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      value: parseFloat(m[metric])
    }));
};
  const getFilteredData = (metric) => {
  // 1. On trie par date croissante pour le graphique et le calcul
  const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));

  // 2. On calcule la moyenne mobile (sur 7 points)
  const dataWithMA = sorted.map((m, index) => {
    const windowSize = 7;
    const start = Math.max(0, index - windowSize + 1);
    const subset = sorted.slice(start, index + 1);
    const sum = subset.reduce((acc, curr) => acc + (parseFloat(curr[metric]) || 0), 0);
    const avg = sum / subset.length;

    return {
      date: new Date(m.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      fullDate: new Date(m.date),
      value: parseFloat(m[metric]),
      moyenne: parseFloat(avg.toFixed(2))
    };
  });

  // 3. On filtre selon la période
  const now = new Date();
  return dataWithMA.filter(d => {
    const diffTime = Math.abs(now - d.fullDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (timeRange === '7d') return diffDays <= 7;
    if (timeRange === '1m') return diffDays <= 30;
    if (timeRange === '1y') return diffDays <= 365;
    return true; // 'all'
  });
};
  const workoutDays = {
    lundi: {
      name: "UPPER A",
      subtitle: "Largeur & Épaisseur",
      color: "from-red-500 to-red-700",
      accent: "bg-red-500",
      textAccent: "text-red-400",
      emoji: "🔴",
      day: "LUNDI",
      goal: "On ajoute du volume Dos sans charger les lombaires",
      totalSeries: { Pectoraux: 7, Dorsaux: 8, Deltoïdes: 4 },
      exercises: [
        {
          name: "Développé Incliné Haltères",
          sets: "4 x 8-10",
          rpe: 9,
          muscles: ["Pectoraux"]
        },
        {
          name: "Tirage Vertical Large (Lat Pulldown)",
          sets: "4 x 10-12",
          rpe: 9,
          tech: "Étirement max en haut.",
          muscles: ["Dorsaux"]
        },
        {
          name: "Chest Press Machine (Lourd)",
          sets: "3 x 8-10",
          rpe: 10,
          muscles: ["Pectoraux"]
        },
        {
          name: "Tirage Horizontal Unilatéral",
          sets: "4 x 12",
          rpe: 9,
          ajout: "+4 séries pour le dos. L'unilatéral permet d'aller chercher plus loin derrière.",
          muscles: ["Dorsaux"]
        },
        {
          name: "Lu Raises (Élévations Latérales Amplitude Max)",
          sets: "4 x 15-20",
          rpe: 9,
          muscles: ["Deltoïdes"]
        }
      ]
    },
    mercredi: {
      name: "LEGS A + ARMS DAY",
      subtitle: "Quads & Bras",
      color: "from-purple-500 to-purple-700",
      accent: "bg-purple-500",
      textAccent: "text-purple-400",
      emoji: "🟣",
      day: "MERCREDI",
      goal: "On transforme ce jour en vraie séance BRAS",
      totalSeries: { Quadriceps: 14, Biceps: 7, Triceps: 7 },
      exercises: [
        {
          name: "Presse à Cuisses (Pieds bas)",
          sets: "4 x 10-12",
          rpe: 9,
          muscles: ["Quadriceps"]
        },
        {
          name: "Leg Extension",
          sets: "4 x 15-20",
          rpe: 10,
          note: "Dropset final",
          muscles: ["Quadriceps"]
        },
        {
          name: "Sissy Squat (ou Fentes)",
          sets: "3 x Échec",
          rpe: 10,
          note: "Total Quads : 11 séries (suffisant ici)",
          muscles: ["Quadriceps"]
        },
        {
          name: "SUPERSET A - Bayesian Curl + Triceps Katana",
          sets: "4 tours",
          rpe: 9,
          details: "A1. Bayesian Curl (Câble, dos à poulie) : 4x12-15 (Étirement Biceps) • A2. Triceps Katana (Extension Overhead) : 4x12-15 (Étirement Triceps)",
          gain: "Tu ajoutes 7 séries de Triceps et 7 séries de Biceps d'un coup",
          muscles: ["Biceps", "Triceps"]
        },
        {
          name: "SUPERSET B - Preacher Curl + Pushdown",
          sets: "3 tours",
          rpe: 9,
          details: "B1. Preacher Curl Machine : 3x12 (Contraction courte) • B2. Triceps Pushdown Barre : 3x15 (Vaste externe)",
          muscles: ["Biceps", "Triceps"]
        }
      ]
    },
    vendredi: {
      name: "PUSH AESTHETIC",
      subtitle: "Pecs/Épaules/Triceps",
      color: "from-red-500 to-orange-600",
      accent: "bg-orange-500",
      textAccent: "text-orange-400",
      emoji: "🔴",
      day: "VENDREDI",
      goal: "Focus sur le \"Shelf\" et les triceps",
      totalSeries: { Pectoraux: 8, Deltoïdes: 13, Triceps: 8 },
      exercises: [
        {
          name: "Dev. Incliné Machine (Smith)",
          sets: "4 x 10-12",
          rpe: 9,
          muscles: ["Pectoraux"]
        },
        {
          name: "Élévations Latérales Câble (Derrière le dos)",
          sets: "5 x 15-20",
          rpe: 10,
          volumeMax: "Tension continue pour les deltoïdes",
          muscles: ["Deltoïdes"]
        },
        {
          name: "Pec Deck (Fly)",
          sets: "4 x 15",
          rpe: 9,
          note: "Partiels en position étirée sur la fin",
          muscles: ["Pectoraux"]
        },
        {
          name: "Skullcrusher (Barre au front)",
          sets: "4 x 10-12",
          rpe: 9,
          ajout: "4 séries lourdes pour la masse du triceps",
          muscles: ["Triceps"]
        },
        {
          name: "Facepull (Corde)",
          sets: "4 x 15-20",
          rpe: 8,
          muscles: ["Deltoïdes"]
        }
      ]
    },
    samedi: {
      name: "LEGS B + RAPPEL DOS/BICEPS",
      subtitle: "Ischios & Pull",
      color: "from-orange-500 to-amber-600",
      accent: "bg-amber-500",
      textAccent: "text-amber-400",
      emoji: "🟠",
      day: "SAMEDI",
      goal: "On corrige le manque de volume Ischios et Dos",
      totalSeries: { "Ischios/Fessiers": 12, Dorsaux: 8, Biceps: 7 },
      exercises: [
        {
          name: "Leg Curl Assis",
          sets: "5 x 10-15",
          rpe: 10,
          ajout: "5 séries lourdes. Penche le buste en avant pour étirer l'ischio.",
          muscles: ["Ischio-jambiers"]
        },
        {
          name: "Presse à Cuisses (Pieds Hauts & Larges)",
          sets: "4 x 12",
          rpe: 9,
          focus: "Fessiers/Ischios",
          muscles: ["Fessiers", "Ischio-jambiers"]
        },
        {
          name: "Hyperextension (Focus Ischios/Fessiers)",
          sets: "3 x 15-20",
          rpe: 9,
          technique: "Dos rond, menton rentré, contracte les fessiers. (Remplace le Deadlift)",
          note: "Total Ischios/Fessiers : 12 séries",
          muscles: ["Fessiers", "Ischio-jambiers"]
        },
        {
          name: "Tirage Vertical Prise Neutre Serrée",
          sets: "4 x 12",
          rpe: 9,
          ajout: "Cible le bas des dorsaux",
          muscles: ["Dorsaux"]
        },
        {
          name: "Curl Marteau (Corde poulie basse)",
          sets: "4 x 12-15",
          rpe: 9,
          ajout: "Brachial et Avant-bras",
          muscles: ["Biceps", "Avant-bras"]
        }
      ]
    }
  };

  const getAllMuscleVolume = () => {
    const volume = {};
    Object.values(workoutDays).forEach(day => {
      Object.entries(day.totalSeries).forEach(([muscle, count]) => {
        if (!volume[muscle]) volume[muscle] = 0;
        volume[muscle] += count;
      });
    });
    return volume;
  };

  const weeklyVolume = getAllMuscleVolume();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Super Header avec stats */}
      <div className="relative overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-purple-500/5 to-orange-500/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-500/10 via-transparent to-transparent" />
        </div>
        
        <div className="relative px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                <Dumbbell className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-5xl font-black tracking-tighter uppercase bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent"
                    style={{ fontFamily: '"Bebas Neue", Impact, sans-serif' }}>
                  HYPERTROPHY PROTOCOL
                </h1>
                <p className="text-zinc-500 text-sm font-bold tracking-widest mt-1">
                  SCIENCE-BASED • 4 JOURS/SEMAINE
                </p>
              </div>
            </div>
          </div>

          {/* Mini stats hebdo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(weeklyVolume).slice(0, 4).map(([muscle, sets]) => (
              <div key={muscle} className="bg-zinc-900/50 backdrop-blur-sm rounded-xl p-3 border border-zinc-800/50">
                <div className="text-2xl font-black text-red-400">{sets}</div>
                <div className="text-xs text-zinc-500 uppercase font-bold">{muscle} / semaine</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-4">
            <button
              onClick={() => setActiveView('program')}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-sm tracking-wider transition-all ${
                activeView === 'program'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              <Calendar className="inline w-4 h-4 mr-2" />
              Séances
            </button>
          
            <button
              onClick={() => setActiveView('stats')}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-sm tracking-wider transition-all ${
                activeView === 'stats'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              <BarChart3 className="inline w-4 h-4 mr-2" />
              Volume
            </button>
            <button
              onClick={() => setActiveView('measurements')}
              className={`px-5 py-2.5 rounded-xl font-black uppercase text-sm tracking-wider transition-all ${
                activeView === 'measurements'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
              }`}
            >
              <TrendingUp className="inline w-4 h-4 mr-2" />
              Mensu
            </button>
          </div>
        </div>
      </div>

{/* Contenu */}
      <div className="max-w-7xl mx-auto p-6">
        {activeView === 'program' ? (
          <div className="space-y-6">
            {/* Sélecteur de jour */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(workoutDays).map(([key, data]) => (
                <button
                  key={key}
                  onClick={() => setActiveDay(key)}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    activeDay === key ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${data.color} transition-opacity ${
                    activeDay === key ? 'opacity-100' : 'opacity-0'
                  }`} />
                  <div className={`absolute inset-0 bg-zinc-900 transition-opacity ${
                    activeDay === key ? 'opacity-0' : 'opacity-100'
                  }`} />
                  <div className={`absolute inset-0 border-2 rounded-2xl transition-colors ${
                    activeDay === key ? 'border-white/20' : 'border-zinc-800 group-hover:border-zinc-700'
                  }`} />
                  <div className="relative p-6">
                    <div className="text-4xl mb-3">{data.emoji}</div>
                    <div className={`text-xs uppercase font-black tracking-widest mb-2 ${activeDay === key ? 'text-white/80' : 'text-zinc-600'}`}>{data.day}</div>
                    <div className={`text-lg font-black mb-1 ${activeDay === key ? 'text-white' : 'text-zinc-400'}`}>{data.name}</div>
                  </div>
                </button>
              ))}
            </div>

            {activeDay && (
              <div className="space-y-4 animate-fadeIn">
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${workoutDays[activeDay].color} p-8 shadow-2xl`}>
                  <h2 className="text-4xl font-black uppercase mb-1">{workoutDays[activeDay].name}</h2>
                  <p className="text-white/80 font-medium mb-4">{workoutDays[activeDay].goal}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(workoutDays[activeDay].totalSeries).map(([muscle, sets]) => (
                      <div key={muscle} className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <span className="text-sm font-bold">{muscle}: {sets}s</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {workoutDays[activeDay].exercises.map((ex, idx) => (
                    <div key={idx} className="bg-zinc-900 rounded-xl border-2 border-zinc-800 p-6">
                      <h3 className="text-2xl font-black mb-3">{ex.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-black uppercase">{ex.sets}</span>
                        <span className="px-3 py-1.5 rounded-lg bg-zinc-800 text-sm font-black text-zinc-300">RPE {ex.rpe}</span>
                      </div>
                      <div className="space-y-2">
                        {ex.tech && <InfoBlock icon={Zap} label="Technique" text={ex.tech} color="yellow" />}
                        {ex.ajout && <InfoBlock icon={TrendingUp} label="Ajout" text={ex.ajout} color="green" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        
        ) : activeView === 'stats' ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(weeklyVolume).map(([muscle, sets]) => (
                <div key={muscle} className="bg-zinc-900 p-6 rounded-xl border border-purple-500/20">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-black text-lg uppercase">{muscle}</h3>
                    <div className="text-3xl font-black text-purple-400">{sets}</div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${(sets / 20) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeView === 'measurements' ? (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-zinc-900 rounded-2xl p-6 border-2 border-zinc-800">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" /> Nouvelle Mesure
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input type="date" value={newMeasurement.date} onChange={(e) => setNewMeasurement({...newMeasurement, date: e.target.value})} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 text-white" />
                <input type="number" placeholder="Poids (kg)" value={newMeasurement.poids} onChange={(e) => setNewMeasurement({...newMeasurement, poids: e.target.value})} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 text-white" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {['cou', 'epaules', 'pectoraux', 'taille', 'bras', 'cuisses'].map(field => (
                   <input key={field} type="number" placeholder={`${field} (cm)`} value={newMeasurement[field]} onChange={(e) => setNewMeasurement({...newMeasurement, [field]: e.target.value})} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 text-white" />
                 ))}
              </div>
              <button onClick={saveMeasurement} className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-black uppercase transition-all shadow-lg shadow-green-500/20">
                💾 Enregistrer
              </button>
            </div>

            {getLatestMeasurement() && (
              <div className="bg-zinc-900 rounded-2xl p-6 border border-green-700/30">
                <h3 className="text-xl font-black mb-4 uppercase tracking-wider">📊 État Actuel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['poids', 'cou', 'epaules', 'pectoraux', 'taille', 'bras', 'cuisses'].map(metric => {
                    const latest = getLatestMeasurement();
                    const value = latest[metric];
                    const progress = getMeasurementProgress(metric);
                    if (!value) return null;
                    return (
                      <div key={metric} className="bg-black/40 p-4 rounded-xl border border-zinc-800">
                        <div className="text-xs text-zinc-500 uppercase font-bold mb-1">{metric}</div>
                        <div className="text-2xl font-black text-green-400">{value} {metric === 'poids' ? 'kg' : 'cm'}</div>
                        {progress && (
                          <div className={`text-xs font-bold mt-1 ${parseFloat(progress) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {parseFloat(progress) >= 0 ? '↗' : '↘'} {Math.abs(progress)}%
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Graphiques d'évolution */}
{measurements.length >= 2 && (
  <div className="space-y-6">
    <div className="bg-zinc-900 rounded-2xl p-6 border-2 border-zinc-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h3 className="text-2xl font-black flex items-center gap-2">
          📈 Évolution
        </h3>
        
        {/* Sélecteur de période Style "Badass" */}
        <div className="flex bg-zinc-800 p-1 rounded-xl border border-zinc-700">
          {[
            { id: '7d', label: '7J' },
            { id: '1m', label: '1M' },
            { id: '1y', label: '1A' },
            { id: 'all', label: 'ALL' }
          ].map((range) => (
            <button
              key={range.id}
              onClick={() => setTimeRange(range.id)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                timeRange === range.id 
                ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'text-zinc-500 hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graphique Poids principal */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h4 className="text-lg font-bold text-green-400">Poids (kg)</h4>
          <div className="text-xs text-zinc-500 flex gap-4">
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500"></span> Réel</span>
            <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-white opacity-50 border-t border-dashed"></span> Moyenne (7j)</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getFilteredData('poids')}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#71717a"
              style={{ fontSize: '10px', fontWeight: 'bold' }}
              minTickGap={10}
            />
            <YAxis 
              stroke="#71717a"
              style={{ fontSize: '10px', fontWeight: 'bold' }}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${value}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: '2px solid #10b981',
                borderRadius: '12px',
              }}
            />
            {/* Ligne Moyenne Mobile (Lissée) */}
            <Line 
              type="monotone" 
              dataKey="moyenne" 
              stroke="#ffffff" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.4}
            />
            {/* Ligne Réelle */}
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={4}
              dot={timeRange === '7d' ? { fill: '#10b981', r: 4 } : false} 
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Autres mensurations en petit */}
      <div className="grid md:grid-cols-2 gap-4">
        {['bras', 'taille', 'cuisses', 'pectoraux'].map(metric => {
          const data = getFilteredData(metric);
          if (data.length < 2) return null;
          
          return (
            <div key={metric} className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
              <h4 className="text-sm font-bold text-cyan-400 mb-2 uppercase">{metric}</h4>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={data}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #06b6d4', fontSize: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}

            {/* Message si pas assez de données */}
            {measurements.length > 0 && measurements.length < 2 && (
              <div className="bg-zinc-900 rounded-2xl p-8 border-2 border-zinc-800 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-black mb-2">Ajoute une autre mesure !</h3>
                <p className="text-zinc-400">Les graphiques s'afficheront dès que tu auras au moins 2 mesures enregistrées.</p>
              </div>
            )}
            <div className="bg-zinc-900 rounded-2xl p-6 border-2 border-zinc-800">
              <h3 className="text-xl font-black mb-4 uppercase">📜 Historique</h3>
              <div className="space-y-3">
                {measurements.map((m) => (
                  <div key={m.id} className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{new Date(m.date).toLocaleDateString('fr-FR')}</div>
                      <div className="text-sm text-zinc-500">Poids: {m.poids}kg | Bras: {m.bras}cm | Taille: {m.taille}cm</div>
                    </div>
                    <button onClick={() => deleteMeasurement(m.id)} className="text-red-500 font-bold text-xs uppercase hover:bg-red-500/10 p-2 rounded-lg">Supprimer</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
};

const InfoBlock = ({ icon: Icon, label, text, color }) => {
  const colorMap = {
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: 'text-yellow-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: 'text-green-400' },
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'text-blue-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: 'text-red-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', icon: 'text-cyan-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: 'text-emerald-400' }
  };
  const colors = colorMap[color] || colorMap.blue;
  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 mt-0.5 ${colors.icon} flex-shrink-0`} />
        <div className="flex-1">
          <span className={`font-bold text-xs uppercase ${colors.text} mr-2`}>{label}:</span>
          <span className="text-sm text-zinc-300 leading-relaxed">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default WorkoutApp;