import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Users, Activity, AlertTriangle,
  Bed, RefreshCw, ClipboardList, User, Layout,
  ShieldAlert, Star, History, Siren, Brain, 
  Pause, PhoneCall, LogOut, FileBarChart, Clock, 
  UserPlus, Banknote, Skull, CheckCircle,
  Trophy, Medal, Crown, UserCircle, BarChart3,
  Play, Stethoscope, Scissors, Sparkles, Zap, Shield, Coffee, Angry, Flame
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';

// ==========================================
// 🔴 ส่วนที่ต้องแก้ไข: ใส่ Firebase Config ของคุณที่นี่ 🔴
// ==========================================
const YOUR_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBfndyTiPoprkpx4oGXbEkBnn-dA66muQA",
  authDomain: "nurse-game-89904.firebaseapp.com",
  projectId: "nurse-game-89904",
  storageBucket: "nurse-game-89904.firebasestorage.app",
  messagingSenderId: "825469923726",
  appId: "1:825469923726:web:0953dfc2e81719a1f7f4df",
  measurementId: "G-17WC9T21SD"
};

// ==========================================
// CUSTOM SVG CHART (NO LIBRARY NEEDED) 🚀
// ==========================================
const SimpleLineChart = ({ data }) => {
  if (!data || data.length < 2) return <div className="h-full flex items-center justify-center text-slate-500 text-xs">Collecting data...</div>;

  const width = 100;
  const height = 50;
  const maxVal = 100;

  // Normalize Data
  const pointsSat = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.satisfaction / maxVal) * height;
    return `${x},${y}`;
  }).join(' ');

  // Occupancy (Scaled x10 for visibility)
  const pointsOcc = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.occupancy / 10) * height; // Assume max 10 beds
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid Lines */}
        <line x1="0" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="0.5" strokeDasharray="2"/>
        <line x1="0" y1="25" x2="100" y2="25" stroke="#334155" strokeWidth="0.5" strokeDasharray="2"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2"/>
        
        {/* Satisfaction Line (Green) */}
        <polyline fill="none" stroke="#4ade80" strokeWidth="1.5" points={pointsSat} />
        
        {/* Occupancy Line (Pink) */}
        <polyline fill="none" stroke="#f472b6" strokeWidth="1.5" points={pointsOcc} strokeDasharray="2" />
      </svg>
      {/* Legend */}
      <div className="absolute top-0 right-0 flex gap-2">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div><span className="text-[8px] text-slate-300">Sat</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-pink-400 rounded-full"></div><span className="text-[8px] text-slate-300">Occ</span></div>
      </div>
    </div>
  );
};

// ==========================================
// ERROR BOUNDARY COMPONENT (กันจอขาว)
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center text-center">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">System Malfunction</h1>
          <p className="text-slate-400 mb-4">An unexpected error occurred.</p>
          <div className="bg-red-900/50 p-4 rounded border border-red-500 text-xs font-mono max-w-lg overflow-auto text-left mb-6">
            {this.state.error?.toString()}
          </div>
          <button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-full font-bold transition-all">
            Reboot System
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// ==========================================
// STYLES & CONFIGS
// ==========================================
const cssStyles = `
  @keyframes ecg-move { 0% { background-position: 0 0; } 100% { background-position: -50px 0; } }
  .ecg-line {
    background-image: linear-gradient(to right, transparent 50%, #00ff00 50%, transparent 55%),
                      linear-gradient(to right, transparent 0%, #00ff00 0%, transparent 5%);
    background-size: 50px 100%;
    animation: ecg-move 1s linear infinite;
  }
  .shake-element { animation: shake 0.3s ease-in-out; }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
`;

const SoundSystem = {
  ctx: null,
  enabled: true,
  init: () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext && !SoundSystem.ctx) SoundSystem.ctx = new AudioContext();
    } catch (e) {}
  },
  play: (type) => {
    if (!SoundSystem.enabled || !SoundSystem.ctx) return;
    try {
      if (SoundSystem.ctx.state === 'suspended') SoundSystem.ctx.resume();
      const osc = SoundSystem.ctx.createOscillator();
      const gain = SoundSystem.ctx.createGain();
      osc.connect(gain);
      gain.connect(SoundSystem.ctx.destination);
      const now = SoundSystem.ctx.currentTime;

      if (type === 'SUCCESS') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3); osc.start(now); osc.stop(now + 0.3);
      } else if (type === 'ALARM') {
        osc.type = 'square'; osc.frequency.setValueAtTime(880, now); gain.gain.setValueAtTime(0.1, now); gain.gain.linearRampToValueAtTime(0, now + 0.5); osc.start(now); osc.stop(now + 0.5);
      } else if (type === 'CLICK') {
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); gain.gain.setValueAtTime(0.05, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05); osc.start(now); osc.stop(now + 0.05);
      }
    } catch (e) {}
  }
};

const RANK_TITLES = [
  { minXp: 0, title: 'เด็กฝึกงาน (Intern)' },
  { minXp: 500, title: 'น้องใหม่ (Newbie)' },
  { minXp: 1500, title: 'พยาบาลวิชาชีพ (Pro RN)' },
  { minXp: 3000, title: 'หัวหน้าเวรระดับโปร (Duty Chief)' },
  { minXp: 6000, title: 'ผู้เชี่ยวชาญระดับสูง (Specialist)' },
  { minXp: 10000, title: 'เทพเจ้าแห่งวอร์ด (God of Ward)' },
];

const STAFF_TRAITS = {
  'ANGEL': { name: 'Angelic', icon: Sparkles },
  'SPEED': { name: 'Speedster', icon: Zap },
  'STAMINA': { name: 'Marathon', icon: Activity },
  'CLUTCH': { name: 'Clutch', icon: Shield },
  'MENTOR': { name: 'Mentor', icon: Users },
  'GRUMPY': { name: 'Grumpy', icon: Angry },
  'LAZY': { name: 'Lazy', icon: Coffee },
  'RUDE': { name: 'Toxic', icon: Flame },
};

const WARDS_CONFIG = {
  MED: { name: 'Medicine', Icon: Stethoscope },
  SURG: { name: 'Surgery', Icon: Scissors },
  ER: { name: 'Emergency', Icon: Siren },
  ICU: { name: 'ICU', Icon: Activity }
};

const TASKS_DB = [
  { id: 'VS', label: 'V/S & Neuro', type: 'BASIC', cost: 5, price: 50, duration: 15, role: ['RN','HEAD','JR','PN'], xp: 5 },
  { id: 'IV', label: 'IV Meds', type: 'SKILLED', cost: 50, price: 250, duration: 30, role: ['RN','HEAD','JR'], xp: 20 },
  { id: 'CPR', label: 'CPR (Code)', type: 'CRITICAL', cost: 2000, price: 15000, duration: 120, role: ['RN','HEAD','JR','PN'], xp: 100 },
  { id: 'ADMIT', label: 'Admit', type: 'ADMIN', cost: 10, price: 0, duration: 40, role: ['RN','HEAD'], xp: 10 },
  { id: 'DC', label: 'Discharge', type: 'ADMIN', cost: 5, price: 0, duration: 45, role: ['RN','HEAD'], xp: 10 },
];

const PATIENT_TEMPLATES = [
  { dx: 'Septic Shock', triage: 'RED', vitals: { hr: 120, bp_sys: 85, spo2: 90 } },
  { dx: 'Acute MI', triage: 'RED', vitals: { hr: 110, bp_sys: 150, spo2: 94 } },
  { dx: 'CHF Exac.', triage: 'YELLOW', vitals: { hr: 100, bp_sys: 160, spo2: 92 } },
  { dx: 'Gastroenteritis', triage: 'GREEN', vitals: { hr: 90, bp_sys: 110, spo2: 98 } }
];

const CRITICAL_EVENTS = [
  { title: 'Cardiac Arrest', symptoms: 'Pulseless, VF', reqStaff: 4, correctAction: 'Defibrillate', options: ['Defibrillate', 'Adrenaline Only', 'Intubate'] },
  { title: 'Hypoglycemia', symptoms: 'DTX 20', reqStaff: 2, correctAction: 'Glucose', options: ['Glucose', 'Insulin', 'CPR'] },
];

// ==========================================
// MAIN APP
// ==========================================
function NurseCommanderPro() {
  // Firebase State
  const [fbUser, setFbUser] = useState(null);
  const [db, setDb] = useState(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Initialize Firebase Safely
  useEffect(() => {
    if (YOUR_FIREBASE_CONFIG?.apiKey) {
      try {
        const app = initializeApp(YOUR_FIREBASE_CONFIG);
        const auth = getAuth(app);
        const dbInstance = getFirestore(app);
        setDb(dbInstance);
        
        signInAnonymously(auth).catch(e => console.warn("Auth:", e));
        onAuthStateChanged(auth, (u) => {
            setFbUser(u);
            setIsFirebaseReady(true);
        });
      } catch (e) {
        console.error("Firebase Config Error");
      }
    }
  }, []);

  // Game State
  const [phase, setPhase] = useState('LOGIN');
  const [user, setUser] = useState({ nickname: '', xp: 0, matches: 0, wins: 0 });
  const [config, setConfig] = useState({ ward: 'MED', staffCount: 4, bedCount: 6, targetShifts: 3 });
  const [beds, setBeds] = useState([]);
  const [staff, setStaff] = useState([]);
  const [simTime, setSimTime] = useState(28800);
  const [score, setScore] = useState(100);
  const [gameMode, setGameMode] = useState('NORMAL');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [notification, setNotification] = useState(null);
  const [endGameReport, setEndGameReport] = useState(null);
  const [mobileTab, setMobileTab] = useState('DASHBOARD');
  
  const loopRef = useRef(null);
  const SHIFT_DURATION = 8 * 3600;

  // Load Local User
  useEffect(() => {
    const saved = localStorage.getItem('nc_save_v2');
    if(saved) {
        const parsed = JSON.parse(saved);
        if(parsed.nickname) { setUser(parsed); setPhase('MENU'); }
    }
  }, []);

  // --- ACTIONS ---
  const handleLogin = (e) => {
    e.preventDefault();
    const nickname = e.target.nickname.value;
    if(nickname) {
        const newUser = { ...user, nickname, isLoggedIn: true };
        setUser(newUser);
        localStorage.setItem('nc_save_v2', JSON.stringify(newUser));
        setPhase('MENU');
    }
  };

  const fetchLeaderboard = async () => {
      if(!db) return;
      try {
          const q = collection(db, 'scores');
          const snap = await getDocs(q);
          const scores = [];
          snap.forEach(d => scores.push(d.data()));
          scores.sort((a,b) => b.xp - a.xp);
          setLeaderboardData(scores.slice(0, 50));
          setPhase('LEADERBOARD');
      } catch(e) { console.error(e); }
  };

  const initGame = () => {
    SoundSystem.init();
    SoundSystem.play('CLICK');
    
    const newStaff = Array.from({ length: config.staffCount }, (_, i) => {
        const traits = Object.keys(STAFF_TRAITS);
        const trait = traits[Math.floor(Math.random() * traits.length)];
        return { 
            id: `s${i}`, name: `Staff ${i+1}`, role: i===0?'HEAD':'RN', 
            stamina: 100, status: 'IDLE', traits: [trait], icon: i===0?'👑':'⭐' 
        };
    });

    const newBeds = Array.from({ length: config.bedCount }, (_, i) => ({
        id: i+1, status: 'EMPTY', name: 'Vacant', tasks: [], nurseId: [], satisfaction: 100, actionProgress: 0
    }));

    setStaff(newStaff);
    setBeds(newBeds);
    setSimTime(28800);
    setScore(100);
    setChartData([]);
    setPhase('GAME');
  };

  // --- LOOP ---
  useEffect(() => {
    if(phase !== 'GAME') return;
    loopRef.current = setInterval(() => {
        if(activeAlert) return;
        setSimTime(t => t + 10);

        // Random Admit
        if(Math.random() < 0.02 && beds.some(b => b.status === 'EMPTY')) {
            const empty = beds.find(b => b.status === 'EMPTY');
            if(empty) {
                const tmpl = PATIENT_TEMPLATES[Math.floor(Math.random() * PATIENT_TEMPLATES.length)];
                const tasks = [
                    { ...TASKS_DB[0], uid: Math.random(), status: 'PENDING' }, // Always VS
                    Math.random()>0.5 ? { ...TASKS_DB[2], uid: Math.random(), status: 'PENDING' } : null
                ].filter(Boolean);
                
                setBeds(p => p.map(b => b.id === empty.id ? {
                    ...b, status: 'OCCUPIED', name: `Pt.${Math.floor(Math.random()*1000)}`,
                    ...tmpl, currentVitals: tmpl.vitals, tasks, satisfaction: 60
                } : b));
            }
        }

        // Random Critical
        if(Math.random() < 0.001 && !activeAlert) {
            const occ = beds.filter(b => b.status === 'OCCUPIED');
            if(occ.length > 0) {
                const target = occ[Math.floor(Math.random() * occ.length)];
                const evt = CRITICAL_EVENTS[Math.floor(Math.random() * CRITICAL_EVENTS.length)];
                setActiveAlert({ ...evt, bedId: target.id, bedName: target.name, options: shuffle(evt.options) });
                SoundSystem.play('ALARM');
            }
        }

        // Add Tasks
        if(Math.random() < 0.01) {
             setBeds(p => {
                 const occ = p.filter(b => b.status === 'OCCUPIED');
                 if(occ.length === 0) return p;
                 const target = occ[Math.floor(Math.random() * occ.length)];
                 if(target.tasks.length < 3) {
                     return p.map(b => b.id === target.id ? { ...b, tasks: [...b.tasks, { ...TASKS_DB[0], uid: Math.random(), status: 'PENDING' }] } : b);
                 }
                 return p;
             });
        }

        // Process Beds
        let occupied = 0;
        let totalSat = 0;
        setBeds(p => p.map(b => {
            if(b.status === 'EMPTY') return b;
            occupied++;
            totalSat += b.satisfaction;
            
            let prog = b.actionProgress;
            let sat = b.satisfaction;
            let complete = null;

            if(b.nurseId.length > 0) {
                prog += 2;
                if(prog >= 100) {
                    complete = b.tasks.find(t => t.status === 'PROCESSING');
                    prog = 0;
                }
            } else if(b.tasks.some(t => t.status === 'PENDING')) {
                sat -= 0.05;
            }

            // Handle Complete
            let newTasks = b.tasks;
            let newNid = b.nurseId;
            if(complete) {
                newTasks = b.tasks.filter(t => t.uid !== complete.uid);
                newNid = [];
                sat = Math.min(100, sat + 15);
                setScore(s => s + complete.price);
                // Free Staff
                setStaff(st => st.map(s => b.nurseId.includes(s.id) ? { ...s, status: 'IDLE' } : s));
                SoundSystem.play('SUCCESS');
            }

            return { ...b, satisfaction: Math.max(0, sat), actionProgress: prog, tasks: newTasks, nurseId: newNid };
        }));

        // Chart
        if(Math.random() < 0.1) {
            setChartData(p => {
                const avg = occupied > 0 ? totalSat/occupied : 100;
                return [...p, { time: simTime, satisfaction: avg, occupancy: occupied }].slice(-20);
            });
        }

        // End Check
        if(simTime > 28800 + (config.targetShifts * 8 * 3600)) endGame(true);

    }, 50);
    return () => clearInterval(loopRef.current);
  }, [phase, simTime, beds, activeAlert]);

  // Helper
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const assignTask = (sId, bId, t) => {
      setStaff(p => p.map(s => s.id === sId ? { ...s, status: 'WORKING' } : s));
      setBeds(p => p.map(b => b.id === bId ? { ...b, nurseId: [sId], tasks: b.tasks.map(tk => tk.uid === t.uid ? { ...tk, status: 'PROCESSING' } : tk) } : b));
      setSelectedBed(null);
      SoundSystem.play('CLICK');
  };

  const resolveCritical = (opt) => {
      if(opt === activeAlert.correctAction) {
          setScore(s => s + 500);
          setNotification({ msg: "Saved!", type: 'success' });
      } else {
          setScore(s => s - 200);
          setNotification({ msg: "Failed!", type: 'error' });
      }
      setActiveAlert(null);
      setTimeout(() => setNotification(null), 2000);
  };

  const endGame = (victory) => {
      setGameSpeed(0);
      let xp = 10;
      if(victory) xp = Math.floor(score / 10);
      
      const newUser = { ...user, xp: user.xp + xp, matches: user.matches + 1, wins: victory ? user.wins + 1 : user.wins };
      setUser(newUser);
      localStorage.setItem('nc_save_v2', JSON.stringify(newUser));

      if(db && fbUser) {
          setDoc(doc(db, 'scores', fbUser.uid), {
              name: newUser.nickname, xp: newUser.xp, title: getRankData(newUser.xp).title
          }, { merge: true });
      }
      setEndGameReport({ victory, score, xp });
      setPhase('END');
  };

  // --- UI RENDERERS ---
  if(phase === 'LOGIN') return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 p-8 rounded-2xl text-center w-full max-w-sm">
              <Activity size={48} className="text-blue-500 mx-auto mb-4" />
              <h1 className="text-2xl text-white font-bold mb-6">NURSE COMMANDER</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                  <input name="nickname" className="w-full p-3 rounded bg-slate-700 text-white" placeholder="Enter Nickname" required />
                  <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">START GAME</button>
              </form>
              <div className="mt-4 text-xs text-slate-500">{isFirebaseReady ? 'Online Connected' : 'Offline Mode'}</div>
          </div>
      </div>
  );

  if(phase === 'MENU') return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center space-y-6 w-full max-w-sm">
              <div className="flex justify-center gap-4 text-white mb-8">
                  <div className="text-center">
                      <div className="text-3xl font-bold">{user.xp}</div>
                      <div className="text-xs text-slate-400">XP</div>
                  </div>
                  <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">{getRankData(user.xp).icon && <Crown size={32}/>}</div>
                      <div className="text-xs text-slate-400">{getRankData(user.xp).title}</div>
                  </div>
              </div>
              <button onClick={() => { setGameMode('NORMAL'); setPhase('SETUP'); }} className="w-full bg-blue-600 p-4 rounded-xl text-white font-bold block">NORMAL MODE</button>
              <button onClick={() => { setGameMode('RANKING'); setConfig({...config, staffCount: 4, bedCount: 6, targetShifts: 1}); setPhase('SETUP'); }} className="w-full bg-yellow-600 p-4 rounded-xl text-white font-bold block">RANKING MODE</button>
              <button onClick={fetchLeaderboard} className="w-full bg-slate-700 p-4 rounded-xl text-white font-bold block flex justify-center gap-2"><BarChart3/> LEADERBOARD</button>
              <button onClick={() => { setUser({...user, isLoggedIn:false}); setPhase('LOGIN'); }} className="text-red-400 text-sm">Logout</button>
          </div>
      </div>
  );

  if(phase === 'LEADERBOARD') return (
      <div className="min-h-screen bg-slate-900 p-4 overflow-y-auto">
          <div className="max-w-md mx-auto bg-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                  <h2 className="text-white font-bold flex items-center gap-2"><Trophy className="text-yellow-400"/> TOP NURSES</h2>
                  <button onClick={() => setPhase('MENU')} className="text-slate-400"><X/></button>
              </div>
              <div className="divide-y divide-slate-700">
                  {leaderboardData.map((p, i) => (
                      <div key={i} className={`p-4 flex justify-between items-center ${p.name === user.nickname ? 'bg-blue-900/30' : ''}`}>
                          <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-mono w-6">#{i+1}</span>
                              <div className="text-white font-bold">{p.name}</div>
                          </div>
                          <div className="text-blue-400 font-mono">{p.xp} XP</div>
                      </div>
                  ))}
                  {leaderboardData.length === 0 && <div className="p-8 text-center text-slate-500">Loading...</div>}
              </div>
          </div>
      </div>
  );

  if(phase === 'SETUP') return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
           <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md text-center">
              <h2 className="text-2xl font-bold text-white mb-4">SETUP: {gameMode}</h2>
              <div className="text-slate-400 mb-8 text-sm text-left bg-slate-900 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between"><span>Staff:</span> <span className="text-white">{config.staffCount}</span></div>
                  <div className="flex justify-between"><span>Beds:</span> <span className="text-white">{config.bedCount}</span></div>
                  <div className="flex justify-between"><span>Shifts:</span> <span className="text-white">{config.targetShifts}</span></div>
              </div>
              <button onClick={initGame} className="w-full bg-emerald-600 py-4 rounded-xl text-white font-bold text-xl shadow-lg shadow-emerald-900/20">INITIALIZE</button>
              <button onClick={() => setPhase('MENU')} className="mt-4 text-slate-500 text-sm">Cancel</button>
           </div>
      </div>
  );

  if(phase === 'END') return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
           <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md text-center animate-in zoom-in">
              {endGameReport.victory ? <Trophy size={64} className="text-yellow-400 mx-auto mb-4"/> : <Skull size={64} className="text-slate-600 mx-auto mb-4"/>}
              <h1 className="text-3xl font-black text-white mb-2">{endGameReport.victory ? 'VICTORY' : 'GAME OVER'}</h1>
              <div className="text-5xl font-black text-blue-400 mb-2">{endGameReport.score}</div>
              <div className="text-sm text-slate-400 mb-6">POINTS</div>
              
              {gameMode === 'RANKING' && (
                  <div className="bg-slate-700/50 p-4 rounded-lg mb-6">
                      <div className="text-xs text-slate-400">XP GAINED</div>
                      <div className="text-2xl font-bold text-white">+{endGameReport.xp}</div>
                  </div>
              )}
              
              <button onClick={() => setPhase('MENU')} className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold">CONTINUE</button>
           </div>
      </div>
  );

  // GAME UI
  const WardIcon = WARDS_CONFIG[config.ward].Icon;
  return (
      <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
          <style>{cssStyles}</style>
          
          {/* HEADER */}
          <header className="bg-slate-800 text-white h-14 px-4 flex items-center justify-between shrink-0 z-20 shadow-md">
              <div className="flex items-center gap-2 font-bold"><WardIcon size={18} className="text-blue-400"/> <span className="hidden md:inline">{config.ward} WARD</span></div>
              <div className="flex items-center gap-4">
                  <div className="text-yellow-400 font-mono font-bold text-lg">{score}</div>
                  <div className="bg-slate-700 px-2 py-1 rounded text-xs font-mono">{new Date(simTime*1000).toISOString().substr(11,5)}</div>
              </div>
          </header>

          {/* ALERT OVERLAY */}
          {activeAlert && (
              <div className="absolute inset-0 z-50 bg-red-900/90 flex items-center justify-center p-6 animate-in zoom-in">
                  <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl">
                      <div className="flex items-center gap-3 text-red-600 font-black text-xl mb-4">
                          <AlertTriangle className="animate-pulse"/> CRITICAL EVENT
                      </div>
                      <div className="mb-4">
                          <div className="text-sm text-slate-500">Patient</div>
                          <div className="font-bold text-lg">{activeAlert.bedName}</div>
                      </div>
                      <div className="mb-6 bg-red-50 p-3 rounded border border-red-100 text-red-800 text-sm">
                          {activeAlert.symptoms}
                      </div>
                      <div className="space-y-2">
                          {activeAlert.options.map((opt, i) => (
                              <button key={i} onClick={() => resolveCritical(opt)} className="w-full p-3 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-lg font-bold text-left text-sm transition-all">
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          <div className="flex-1 flex overflow-hidden">
              {/* BED GRID */}
              <div className="flex-1 p-4 overflow-y-auto bg-slate-200 pb-24 md:pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {beds.map(bed => (
                          <div key={bed.id} className={`bg-white rounded-xl p-3 shadow-sm border-2 transition-all h-56 flex flex-col ${bed.status==='EMPTY'?'border-dashed border-slate-300 opacity-60':'border-white'}`}>
                              <div className="flex justify-between mb-2">
                                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">BED {bed.id}</span>
                                  {bed.triage === 'RED' && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"/>}
                              </div>
                              
                              {bed.status === 'EMPTY' ? (
                                  <div className="m-auto text-slate-400 text-sm font-bold flex flex-col items-center"><UserPlus/> Empty</div>
                              ) : (
                                  <>
                                      <div className="font-bold text-slate-800 truncate">{bed.name}</div>
                                      <div className="text-[10px] text-slate-500 mb-2 truncate">{bed.dx}</div>
                                      
                                      {/* Vitals */}
                                      <div className="bg-black rounded p-1.5 mb-2 flex justify-between font-mono text-[10px] text-green-400 relative overflow-hidden">
                                          <div className="absolute inset-0 opacity-20 ecg-line"/>
                                          <span>HR {bed.currentVitals.hr}</span>
                                          <span>O2 {bed.currentVitals.spo2}%</span>
                                      </div>

                                      {/* Sat Bar */}
                                      <div className="w-full h-1 bg-slate-100 rounded-full mb-auto">
                                          <div className={`h-full rounded-full transition-all ${bed.satisfaction<40?'bg-red-500':'bg-green-500'}`} style={{width:`${bed.satisfaction}%`}}/>
                                      </div>

                                      {/* Action Area */}
                                      <div className="mt-2 flex flex-wrap gap-1">
                                          {bed.nurseId.length > 0 ? (
                                              <div className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded flex items-center gap-1 w-full">
                                                  <RefreshCw size={10} className="animate-spin"/> Treating...
                                                  <span className="ml-auto">{Math.round(bed.actionProgress)}%</span>
                                              </div>
                                          ) : (
                                              bed.tasks.filter(t=>t.status==='PENDING').map(t => (
                                                  <div key={t.uid} className="group relative">
                                                      <button className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-200">{t.label}</button>
                                                      {/* Assign Menu */}
                                                      <div className="hidden group-hover:block absolute bottom-full left-0 bg-slate-800 text-white p-1 rounded z-10 w-24 mb-1 shadow-xl">
                                                          {staff.filter(s=>s.status==='IDLE').map(s => (
                                                              <div key={s.id} onClick={()=>assignTask(s.id, bed.id, t)} className="text-[9px] p-1 hover:bg-slate-700 cursor-pointer truncate">{s.name}</div>
                                                          ))}
                                                          {staff.filter(s=>s.status==='IDLE').length === 0 && <div className="text-[9px] p-1 text-red-300">Busy</div>}
                                                      </div>
                                                  </div>
                                              ))
                                          )}
                                          {bed.tasks.length===0 && <div className="text-[10px] text-green-600 flex items-center gap-1"><CheckCircle size={10}/> Stable</div>}
                                      </div>
                                  </>
                              )}
                          </div>
                      ))}
                  </div>
              </div>

              {/* RIGHT: STAFF & ANALYTICS */}
              <div className={`w-full md:w-80 bg-white border-l shadow-xl flex flex-col ${mobileTab==='STAFF'?'block':'hidden md:flex'}`}>
                  <div className="p-3 border-b text-xs font-bold text-slate-500 flex justify-between">
                      <span>STAFF ({staff.filter(s=>s.status==='IDLE').length} Avail)</span>
                      <span>{config.ward}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                      {staff.map(s => (
                          <div key={s.id} className={`p-2 rounded border bg-white text-xs flex justify-between items-center ${s.status!=='IDLE'?'border-blue-200 bg-blue-50':''}`}>
                              <div className="flex items-center gap-2">
                                  <span className="text-base">{s.icon}</span>
                                  <div>
                                      <div className="font-bold">{s.name}</div>
                                      <div className="scale-75 origin-left flex gap-1">
                                          {s.traits.map(t => <span key={t} className="bg-slate-200 px-1 rounded">{STAFF_TRAITS[t].name}</span>)}
                                      </div>
                                  </div>
                              </div>
                              <span className={`font-bold px-2 py-0.5 rounded ${s.status==='IDLE'?'bg-green-100 text-green-700':'bg-blue-200 text-blue-700'}`}>{s.status}</span>
                          </div>
                      ))}
                  </div>
                  <div className="p-3 border-t bg-white h-40 shrink-0">
                      <div className="text-[10px] font-bold text-slate-400 mb-2">LIVE PERFORMANCE</div>
                      <div className="h-full pb-4">
                          <SimpleLineChart data={chartData} />
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Mobile Nav */}
          <div className="md:hidden bg-white border-t flex text-xs font-bold text-slate-500">
              <button onClick={()=>setMobileTab('DASHBOARD')} className={`flex-1 py-3 flex justify-center items-center gap-2 ${mobileTab==='DASHBOARD'?'text-blue-600 bg-blue-50':''}`}><Layout size={16}/> BEDS</button>
              <button onClick={()=>setMobileTab('STAFF')} className={`flex-1 py-3 flex justify-center items-center gap-2 ${mobileTab==='STAFF'?'text-blue-600 bg-blue-50':''}`}><Users size={16}/> STAFF</button>
          </div>
      </div>
  );
}

// App Wrapper
function App() {
  return (
    <ErrorBoundary>
      <NurseCommanderPro />
    </ErrorBoundary>
  );
}

export default App;
