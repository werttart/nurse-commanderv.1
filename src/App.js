import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Users,
  Activity,
  AlertTriangle,
  Bed,
  Play,
  Thermometer,
  Pill,
  Syringe,
  CheckCircle,
  Stethoscope,
  Scissors,
  AlertOctagon,
  RefreshCw,
  ClipboardList,
  User,
  X,
  Layout,
  MessageCircle,
  ShieldAlert,
  Star,
  History,
  Siren,
  Brain,
  Microscope,
  Pause,
  Coins,
  PhoneCall,
  LogOut,
  FileBarChart,
  Clock,
  Briefcase,
  UserMinus,
  UserPlus,
  Banknote,
  Skull,
  CheckSquare,
  ArrowRight,
  Flag,
  Calendar,
  Infinity,
  Smile,
  Frown,
  Meh,
  Zap,
  Coffee,
  Shield,
  Ghost,
  ThumbsDown,
  ThumbsUp,
  Sparkles,
  Angry,
  Flame,
  Volume2,
  VolumeX,
} from "lucide-react";

// ==========================================
// 0. STYLES
// ==========================================
const cssStyles = `
  @keyframes ecg-move { 0% { background-position: 0 0; } 100% { background-position: -50px 0; } }
  .ecg-line {
    background-image: linear-gradient(to right, transparent 50%, #00ff00 50%, transparent 55%),
                      linear-gradient(to right, transparent 0%, #00ff00 0%, transparent 5%);
    background-size: 50px 100%;
    animation: ecg-move 1s linear infinite;
  }
  .ecg-dead {
    background: linear-gradient(to right, transparent 50%, #ff0000 50%, transparent 55%);
    background-size: 100% 2px;
    background-repeat: no-repeat;
    background-position: center;
  }
  .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
  @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .triage-red { border-left: 6px solid #ef4444; background: #fef2f2; }
  .triage-yellow { border-left: 6px solid #eab308; background: #fefce8; }
  .triage-green { border-left: 6px solid #22c55e; background: #f0fdf4; }
  .animate-phone { animation: ring 0.5s infinite; }
  @keyframes ring { 0% { transform: rotate(0); } 10% { transform: rotate(10deg); } 20% { transform: rotate(-10deg); } 30% { transform: rotate(10deg); } 40% { transform: rotate(-10deg); } 100% { transform: rotate(0); } }
  
  /* Scrollbar Hide */
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 3px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

  /* Satisfaction Animations */
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  .shake-element { animation: shake 0.3s ease-in-out; }

  @keyframes level-up {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); color: #fbbf24; }
    100% { transform: scale(1); }
  }
  .anim-level { animation: level-up 0.5s ease-out; }
`;

// ==========================================
// 1. SOUND SYSTEM (WEB AUDIO API)
// ==========================================
const SoundSystem = {
  ctx: null,
  enabled: true,
  init: () => {
    try {
      if (!SoundSystem.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) SoundSystem.ctx = new AudioContext();
      }
    } catch (e) {
      console.error("Sound init failed", e);
    }
  },
  play: (type) => {
    if (!SoundSystem.enabled || !SoundSystem.ctx) return;
    try {
      if (SoundSystem.ctx.state === "suspended") SoundSystem.ctx.resume();

      const osc = SoundSystem.ctx.createOscillator();
      const gain = SoundSystem.ctx.createGain();
      osc.connect(gain);
      gain.connect(SoundSystem.ctx.destination);

      const now = SoundSystem.ctx.currentTime;

      if (type === "SUCCESS") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "ERROR") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "ALARM") {
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(600, now + 0.2);
        osc.frequency.setValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "LEVELUP") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.1);
        osc.frequency.setValueAtTime(659, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "CLICK") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      // Ignore sound errors
    }
  },
};

// ==========================================
// 2. KNOWLEDGE BASE (Moved outside to ensure definition)
// ==========================================

const STAFF_TRAITS = {
  // POSITIVE TRAITS (PERKS)
  ANGEL: {
    id: "ANGEL",
    name: "Angelic Touch",
    type: "POS",
    icon: Sparkles,
    desc: "คนไข้พึงพอใจเพิ่มขึ้น 2 เท่าเมื่อทำหัตถการ",
    effect: "SAT_BOOST",
  },
  SPEED: {
    id: "SPEED",
    name: "Speedster",
    type: "POS",
    icon: Zap,
    desc: "ทำงานเร็วขึ้น 20% เดินไว",
    effect: "SPEED_UP",
  },
  // FIX: Use direct Component instead of arrow function to prevent rendering issues
  STAMINA: {
    id: "STAMINA",
    name: "Marathoner",
    type: "POS",
    icon: Activity,
    desc: "เหนื่อยยาก Stamina ลดช้าลง 30%",
    effect: "STAMINA_SAVE",
  },
  CLUTCH: {
    id: "CLUTCH",
    name: "Clutch God",
    type: "POS",
    icon: Shield,
    desc: "เพิ่มโอกาสรอดชีวิต 20% ในเคสวิกฤต (Code Blue)",
    effect: "CRIT_BONUS",
  },
  MENTOR: {
    id: "MENTOR",
    name: "Mentor",
    type: "POS",
    icon: Users,
    desc: "Staff คนอื่นในเคสเดียวกันทำงานดีขึ้น",
    effect: "AOE_BUFF",
  },

  // NEGATIVE TRAITS (FLAWS)
  GRUMPY: {
    id: "GRUMPY",
    name: "Grumpy",
    type: "NEG",
    icon: Angry,
    desc: "คนไข้ลดความพึงพอใจเล็กน้อยทุกครั้งที่แตะตัว",
    effect: "SAT_DRAIN",
  },
  CLUMSY: {
    id: "CLUMSY",
    name: "Butterfingers",
    type: "NEG",
    icon: AlertTriangle,
    desc: "มีโอกาส 5% ที่จะทำหัตถการพลาด (ต้องเริ่มใหม่)",
    effect: "FAIL_CHANCE",
  },
  LAZY: {
    id: "LAZY",
    name: "Lazy",
    type: "NEG",
    icon: Coffee,
    desc: "Stamina ลดเร็วขึ้น 20% และเดินช้า",
    effect: "STAMINA_DRAIN",
  },
  RUDE: {
    id: "RUDE",
    name: "Toxic",
    type: "NEG",
    icon: Flame,
    desc: "สร้าง Complaint ทันทีหากคนไข้รอนาน",
    effect: "COMPLAINT_GEN",
  },
};

const COMPLAINT_TYPES = [
  { id: "SLOW", text: "รอนานมาก", severity: "LOW", penalty: 5 },
  { id: "RUDE", text: "พยาบาลพูดจาไม่ดี", severity: "MED", penalty: 15 },
  { id: "PAIN", text: "มือหนัก/เจ็บ", severity: "MED", penalty: 10 },
  { id: "DIRTY", text: "เตียงสกปรก/ไม่เช็ดตัว", severity: "HIGH", penalty: 20 },
  { id: "IGNORE", text: "ไม่มีใครสนใจเลย", severity: "CRITICAL", penalty: 30 },
];

const WARDS_CONFIG = {
  MED: {
    name: "Medicine",
    color: "bg-blue-800",
    accent: "text-blue-600",
    Icon: Stethoscope,
    desc: "อายุรกรรม: โรคเรื้อรัง, สูงอายุ, ติดเชื้อ",
  },
  SURG: {
    name: "Surgery",
    color: "bg-emerald-800",
    accent: "text-emerald-600",
    Icon: Scissors,
    desc: "ศัลยกรรม: แผลผ่าตัด, Pre/Post Op, Trauma",
  },
  ER: {
    name: "Emergency",
    color: "bg-red-800",
    accent: "text-red-600",
    Icon: Siren,
    desc: "ฉุกเฉิน: Resuscitation, Acute Trauma",
  },
  ICU: {
    name: "ICU",
    color: "bg-purple-800",
    accent: "text-purple-600",
    Icon: Activity,
    desc: "วิกฤต: Ventilator, Hemodynamic Monitor",
  },
  PED: {
    name: "Pediatric",
    color: "bg-pink-600",
    accent: "text-pink-600",
    Icon: User,
    desc: "กุมารเวช: RSV, Hand-Foot-Mouth, Asthma",
  },
  ORTHO: {
    name: "Orthopedic",
    color: "bg-orange-800",
    accent: "text-orange-600",
    Icon: User,
    desc: "กระดูกและข้อ: Fracture, Traction, Back Pain",
  },
  NEURO: {
    name: "Neuro",
    color: "bg-indigo-800",
    accent: "text-indigo-600",
    Icon: Brain,
    desc: "ระบบประสาท: Stroke, Epilepsy, Brain Tumor",
  },
  PSYCH: {
    name: "Psychiatry",
    color: "bg-teal-800",
    accent: "text-teal-600",
    Icon: Brain,
    desc: "จิตเวช: Mood Disorder, Substance Abuse",
  },
};

const STAFF_ROLES = {
  HEAD: {
    label: "In-Charge",
    skill: 10,
    scope: "ALL",
    maxLoad: 20,
    wage: 1500,
    icon: "👑",
    traitCount: 3,
  },
  RN: {
    label: "RN (Senior)",
    skill: 8,
    scope: "ALL",
    maxLoad: 15,
    wage: 1000,
    icon: "⭐",
    traitCount: 2,
  },
  JR: {
    label: "RN (Junior)",
    skill: 6,
    scope: "LIMITED",
    maxLoad: 10,
    wage: 800,
    icon: "🎓",
    traitCount: 1,
  },
  PN: {
    label: "PN/NA",
    skill: 4,
    scope: "BASIC",
    maxLoad: 12,
    wage: 500,
    icon: "🤝",
    traitCount: 1,
  },
};

const TASKS_DB = [
  // Basic Care
  {
    id: "VS",
    label: "V/S & Neuro Signs",
    type: "BASIC",
    cost: 5,
    price: 50,
    duration: 15,
    role: ["PN", "JR", "RN", "HEAD"],
    xp: 5,
  },
  {
    id: "CARE",
    label: "Bed Bath / Turning",
    type: "BASIC",
    cost: 20,
    price: 100,
    duration: 30,
    role: ["PN", "JR", "RN", "HEAD"],
    xp: 15,
  },
  {
    id: "FEED",
    label: "NG Feeding",
    type: "BASIC",
    cost: 15,
    price: 80,
    duration: 20,
    role: ["PN", "JR", "RN", "HEAD"],
    xp: 10,
  },

  // Skilled Nursing
  {
    id: "IV",
    label: "IV Meds / Drip",
    type: "SKILLED",
    cost: 50,
    price: 250,
    duration: 30,
    role: ["JR", "RN", "HEAD"],
    xp: 20,
  },
  {
    id: "BLOOD",
    label: "Blood Draw (Lab)",
    type: "SKILLED",
    cost: 30,
    price: 200,
    duration: 25,
    role: ["JR", "RN", "HEAD"],
    xp: 15,
  },
  {
    id: "WOUND",
    label: "Wound Dressing",
    type: "SKILLED",
    cost: 40,
    price: 220,
    duration: 35,
    role: ["JR", "RN", "HEAD"],
    xp: 25,
  },
  {
    id: "SUCTION",
    label: "Suction Airway",
    type: "SKILLED",
    cost: 25,
    price: 150,
    duration: 20,
    role: ["JR", "RN", "HEAD"],
    xp: 15,
  },

  // Advanced / Invasive
  {
    id: "NG",
    label: "Insert NG Tube",
    type: "ADVANCED",
    cost: 80,
    price: 500,
    duration: 45,
    role: ["RN", "HEAD"],
    xp: 40,
  },
  {
    id: "FOLEY",
    label: "Insert Foley Cath",
    type: "ADVANCED",
    cost: 100,
    price: 600,
    duration: 45,
    role: ["RN", "HEAD"],
    xp: 45,
  },
  {
    id: "TRANSL",
    label: "Blood Transfusion",
    type: "ADVANCED",
    cost: 500,
    price: 1500,
    duration: 60,
    role: ["RN", "HEAD"],
    xp: 60,
  },

  // Critical
  {
    id: "CPR",
    label: "CPR (Code Blue)",
    type: "CRITICAL",
    cost: 2000,
    price: 15000,
    duration: 120,
    role: ["RN", "HEAD", "JR", "PN"],
    xp: 100,
  },
  {
    id: "INTUBATE",
    label: "Assist Intubation",
    type: "CRITICAL",
    cost: 500,
    price: 3000,
    duration: 50,
    role: ["RN", "HEAD"],
    xp: 80,
  },

  // Admin
  {
    id: "ADMIT",
    label: "Admission Process",
    type: "ADMIN",
    cost: 10,
    price: 0,
    duration: 40,
    role: ["RN", "HEAD"],
    xp: 10,
  },
  {
    id: "DC",
    label: "Discharge Process",
    type: "ADMIN",
    cost: 5,
    price: 0,
    duration: 45,
    role: ["RN", "HEAD"],
    xp: 10,
  },
];

const PATIENT_TEMPLATES = [
  // RED (Critical)
  {
    dx: "Septic Shock",
    triage: "RED",
    vitals: { hr: 120, bp_sys: 85, spo2: 90, temp: 38.8 },
    orders: ["IV", "BLOOD", "VS", "FOLEY"],
  },
  {
    dx: "Acute MI (STEMI)",
    triage: "RED",
    vitals: { hr: 110, bp_sys: 150, spo2: 94, temp: 36.5 },
    orders: ["IV", "BLOOD", "VS"],
  },
  {
    dx: "Status Epilepticus",
    triage: "RED",
    vitals: { hr: 130, bp_sys: 140, spo2: 88, temp: 37.5 },
    orders: ["IV", "SUCTION", "VS"],
  },

  // YELLOW (Urgent)
  {
    dx: "CHF Exacerbation",
    triage: "YELLOW",
    vitals: { hr: 100, bp_sys: 160, spo2: 92, temp: 36.8 },
    orders: ["IV", "VS", "FOLEY"],
  },
  {
    dx: "DKA (Mild)",
    triage: "YELLOW",
    vitals: { hr: 110, bp_sys: 110, spo2: 96, temp: 37.0 },
    orders: ["IV", "BLOOD", "VS"],
  },
  {
    dx: "Ischemic Stroke",
    triage: "YELLOW",
    vitals: { hr: 80, bp_sys: 170, spo2: 96, temp: 37.0 },
    orders: ["NG", "CARE", "VS"],
  },

  // GREEN (Stable)
  {
    dx: "Post-Op Appeny",
    triage: "GREEN",
    vitals: { hr: 80, bp_sys: 120, spo2: 99, temp: 37.0 },
    orders: ["WOUND", "IV"],
  },
  {
    dx: "Gastroenteritis",
    triage: "GREEN",
    vitals: { hr: 90, bp_sys: 110, spo2: 98, temp: 37.5 },
    orders: ["IV", "VS"],
  },
  {
    dx: "Cellulitis Leg",
    triage: "GREEN",
    vitals: { hr: 85, bp_sys: 125, spo2: 98, temp: 37.2 },
    orders: ["IV", "WOUND"],
  },
];

const CRITICAL_EVENTS = [
  {
    title: "Cardiac Arrest (VF)",
    symptoms: "Unresponsive, Pulseless, Monitor shows VF",
    reqStaff: 4,
    correctAction: "Defibrillate 200J + CPR",
    options: [
      "Defibrillate 200J + CPR",
      "Give Adrenaline only",
      "Intubate first",
      "Check BP",
    ],
    successRate: 0.7,
  },
  {
    title: "Severe Hypoglycemia",
    symptoms: "Unconscious, DTX 20 mg/dL, Sweating",
    reqStaff: 2,
    correctAction: "Push 50% Glucose 50ml",
    options: [
      "Push 50% Glucose 50ml",
      "Give Insulin",
      "CPR",
      "Give NSS 1000ml",
    ],
    successRate: 1.0,
  },
  {
    title: "Desaturation / Airway Obs.",
    symptoms: "SpO2 drop to 75%, Gaspling, Cyanosis",
    reqStaff: 2,
    correctAction: "Suction + Ambu Bag + O2",
    options: [
      "Suction + Ambu Bag + O2",
      "Increase O2 Cannula",
      "Give Lasix",
      "Nebulize Bronchodilator",
    ],
    successRate: 0.9,
  },
  {
    title: "Hypovolemic Shock",
    symptoms: "BP 70/40, HR 135, Pale, Cold",
    reqStaff: 3,
    correctAction: "Load NSS/RL 1000ml FREE FLOW",
    options: [
      "Load NSS/RL 1000ml FREE FLOW",
      "Start Levophed immediately",
      "Give Lasix",
      "Sedate patient",
    ],
    successRate: 0.85,
  },
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function App() {
  // FIX: Define Helper Functions INSIDE Component to guarantee scope availability
  const formatTime = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 5);
  };

  const formatMoney = (amount) => {
    return amount.toLocaleString("th-TH", {
      style: "currency",
      currency: "THB",
    });
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // --- CORE STATE ---
  const [phase, setPhase] = useState("SETUP");
  const [simTime, setSimTime] = useState(28800); // Start 08:00 (28800s)
  const [gameSpeed, setGameSpeed] = useState(1);
  const [shiftCount, setShiftCount] = useState(1);
  const [score, setScore] = useState(100);
  const [financials, setFinancials] = useState({
    revenue: 0,
    cost: 0,
    profit: 0,
  });
  const [config, setConfig] = useState({
    ward: "MED",
    bedCount: 6,
    staffCount: 4,
    targetShifts: 3,
    endlessMode: false,
  });
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- ENTITIES ---
  const [beds, setBeds] = useState([]);
  const [staff, setStaff] = useState([]);
  const [timeline, setTimeline] = useState([]);

  // --- INTERACTION STATE ---
  const [selectedBed, setSelectedBed] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [endGameReport, setEndGameReport] = useState(null);
  const [mobileTab, setMobileTab] = useState("DASHBOARD");

  const loopRef = useRef(null);
  const SHIFT_DURATION = 8 * 3600;

  // --- SOUND TOGGLE ---
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    SoundSystem.enabled = !soundEnabled;
    SoundSystem.init(); // Try init audio context on user interaction
  };

  // --- INITIALIZATION ---
  const initGame = () => {
    SoundSystem.init(); // Initialize audio context
    SoundSystem.play("CLICK");

    // Generate Staff with TRAITS & XP
    const newStaff = Array.from({ length: config.staffCount }, (_, i) => {
      let roleKey =
        i === 0
          ? "HEAD"
          : i === 1
          ? "RN"
          : i === config.staffCount - 1
          ? "PN"
          : "JR";
      const role = STAFF_ROLES[roleKey];

      // Randomly Assign Traits
      const traitKeys = Object.keys(STAFF_TRAITS);
      const assignedTraits = [];
      const numTraits = role.traitCount;

      for (let k = 0; k < numTraits; k++) {
        if (Math.random() > 0.3) {
          const randomTrait =
            traitKeys[Math.floor(Math.random() * traitKeys.length)];
          if (!assignedTraits.includes(randomTrait))
            assignedTraits.push(randomTrait);
        }
      }

      return {
        id: `s${i}`,
        name: `Staff ${i + 1}`,
        ...role,
        roleKey,
        stamina: 100,
        currentLoad: 0,
        status: "IDLE",
        action: null,
        targetBedId: null,
        shiftWage: role.wage,
        traits: assignedTraits,
        // XP System
        xp: 0,
        level: 1,
        maxXp: 100,
      };
    });

    // Generate Beds
    const newBeds = Array.from({ length: config.bedCount }, (_, i) => {
      const isOccupied = Math.random() > 0.4;
      if (!isOccupied)
        return { id: i + 1, status: "EMPTY", name: "ว่าง", tasks: [] };
      return generatePatient(i + 1);
    });

    setStaff(newStaff);
    setBeds(newBeds);
    setScore(100);
    setFinancials({ revenue: 0, cost: 0, profit: 0 });
    setShiftCount(1);
    setSimTime(28800);
    setTimeline([
      {
        time: "08:00",
        text: "Shift 1 Started. Welcome to Nurse Commander Pro!",
        type: "INFO",
      },
    ]);
    setPhase("GAME");
  };

  const generatePatient = (bedId) => {
    const template =
      PATIENT_TEMPLATES[Math.floor(Math.random() * PATIENT_TEMPLATES.length)];
    const tasks = template.orders.map((tid) => {
      const t = TASKS_DB.find((x) => x.id === tid);
      return { ...t, uid: Math.random(), status: "PENDING" };
    });

    return {
      id: bedId,
      status: "OCCUPIED",
      name: `Pt. ${String.fromCharCode(65 + bedId)}${Math.floor(
        Math.random() * 100
      )}`,
      hn: `${Math.floor(Math.random() * 100000)}`,
      age: 20 + Math.floor(Math.random() * 70),
      ...template,
      currentVitals: { ...template.vitals },
      tasks: tasks,
      nurseId: [],
      actionProgress: 0,
      condition: 100,
      satisfaction: 50 + Math.floor(Math.random() * 30),
      complaints: [],
      satTrend: 0,
    };
  };

  // --- MAIN GAME LOOP ---
  useEffect(() => {
    if (phase !== "GAME") return;

    loopRef.current = setInterval(() => {
      if (gameSpeed === 0 || activeAlert || activeCall) return;

      // 1. Time Advance
      setSimTime((prevTime) => {
        const nextTime = prevTime + 60 * gameSpeed;

        // Check Shift Boundary
        const startTime = 28800; // 08:00
        const elapsed = nextTime - startTime;
        const calculatedShift = Math.floor(elapsed / SHIFT_DURATION) + 1;

        if (calculatedShift > shiftCount) {
          handleAutoShiftChange(calculatedShift);
        }

        return nextTime;
      });

      // 2. Random Events Generator
      const rand = Math.random();
      if (
        rand < 0.0005 * gameSpeed &&
        beds.some((b) => b.status === "EMPTY") &&
        !activeCall
      ) {
        const template =
          PATIENT_TEMPLATES[
            Math.floor(Math.random() * PATIENT_TEMPLATES.length)
          ];
        setActiveCall({ type: "ADMIT", data: template });
      }
      if (rand < 0.0003 * gameSpeed && !activeAlert) {
        triggerCriticalEvent();
      }
      if (rand < 0.002 * gameSpeed) {
        addRandomTask();
      }
      if (rand < 0.0005 * gameSpeed) {
        addDischargeOrder();
      }

      // 3. Entity Updates
      updateBeds();
      updateStaff();
    }, 50); // Tick rate

    return () => clearInterval(loopRef.current);
  }, [phase, gameSpeed, activeAlert, activeCall, beds, staff, shiftCount]);

  // --- LOGIC: AUTO SHIFT CHANGE ---
  const handleAutoShiftChange = (newShiftVal) => {
    const shiftWages = staff.reduce((sum, s) => sum + s.shiftWage, 0);

    setFinancials((prev) => {
      const newCost = prev.cost + shiftWages;
      return { ...prev, cost: newCost, profit: prev.revenue - newCost };
    });

    if (!config.endlessMode && shiftCount >= config.targetShifts) {
      setGameSpeed(0);
      setShiftCount(config.targetShifts);
      showToast(
        `Congratulations! You survived ${config.targetShifts} shifts!`,
        "success"
      );
      endGame(true);
    } else {
      setShiftCount(newShiftVal);
      const msg = `Shift ${newShiftVal} Started! Wages deducted: ${formatMoney(
        shiftWages
      )}`;
      showToast(msg, "info");
      logTimeline(
        `Shift ${
          newShiftVal - 1
        } ended. Wages paid. Shift ${newShiftVal} started.`,
        "info"
      );

      // Heal staff slightly on shift change + Trait effects
      setStaff((prev) =>
        prev.map((s) => {
          // Trait: STAMINA (Marathoner) recovers more
          const recovery = s.traits.includes("STAMINA") ? 50 : 30;
          return { ...s, stamina: Math.min(100, s.stamina + recovery) };
        })
      );
    }
  };

  // --- LOGIC UPDATERS ---
  const updateBeds = () => {
    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.status !== "OCCUPIED" && bed.status !== "CRITICAL") return bed;

        // Vitals fluctuation
        const newVitals = {
          hr: bed.currentVitals.hr + (Math.random() * 2 - 1),
          bp_sys: bed.currentVitals.bp_sys + (Math.random() * 2 - 1),
          spo2: bed.currentVitals.spo2,
          temp: bed.currentVitals.temp,
        };

        // Condition Decay & Satisfaction Logic
        let conditionDrop = 0;
        let satChange = 0;

        const criticalTasks = bed.tasks.filter(
          (t) => t.type === "CRITICAL" || t.type === "ADVANCED"
        );
        const pendingTasks = bed.tasks.filter(
          (t) => t.status === "PENDING"
        ).length;

        if (criticalTasks.length > 0) conditionDrop += 0.05 * gameSpeed;
        if (bed.status === "CRITICAL") conditionDrop += 0.2;

        // Satisfaction Decay based on Pending Tasks & Condition
        if (pendingTasks > 2) satChange -= 0.02 * gameSpeed; // Annoyed by waiting
        if (bed.condition < 50) satChange -= 0.01 * gameSpeed; // Uncomfortable

        // Complaint Generation
        let newComplaints = [...bed.complaints];
        if (
          bed.satisfaction < 30 &&
          bed.complaints.length === 0 &&
          Math.random() < 0.01
        ) {
          // Trigger Complaint
          const complaint =
            COMPLAINT_TYPES[Math.floor(Math.random() * COMPLAINT_TYPES.length)];
          newComplaints.push(complaint);
          showToast(`Complaint at Bed ${bed.id}: ${complaint.text}`, "error");
          SoundSystem.play("ERROR");
          setScore((s) => Math.max(0, s - complaint.penalty));
          logTimeline(
            `Patient Bed ${bed.id} filed a complaint: ${complaint.text}`,
            "bad"
          );
        }

        // Task Progress & Staff Trait Interactions
        let newProgress = bed.actionProgress;
        let justCompleted = false;

        if (bed.nurseId && bed.nurseId.length > 0) {
          const nurses = staff.filter((s) => bed.nurseId.includes(s.id));

          // Calculate Total Power including Traits & Level
          let totalPower = 0;

          nurses.forEach((n) => {
            let power = n.skill * (n.stamina / 100);

            // XP/Level Bonus to work speed
            power *= 1 + n.level * 0.05;

            // Trait: SPEED (Speedster)
            if (n.traits.includes("SPEED")) power *= 1.2;
            // Trait: LAZY
            if (n.traits.includes("LAZY")) power *= 0.8;
            // Trait: GRUMPY (Negatively impacts Satisfaction while working)
            if (n.traits.includes("GRUMPY")) satChange -= 0.05 * gameSpeed;
            // Trait: ANGEL (Boosts Satisfaction while working)
            if (n.traits.includes("ANGEL")) satChange += 0.05 * gameSpeed;

            totalPower += power;
          });

          // Mentor Trait Logic
          if (nurses.some((n) => n.traits.includes("MENTOR"))) {
            totalPower *= 1.15; // 15% team buff
          }

          const step = (totalPower / 20) * 3 * gameSpeed;
          newProgress += step;

          if (newProgress >= 100) justCompleted = true;
        }

        const updatedBed = {
          ...bed,
          currentVitals: newVitals,
          condition: Math.max(0, bed.condition - conditionDrop),
          actionProgress: newProgress,
          satisfaction: Math.max(
            0,
            Math.min(100, bed.satisfaction + satChange)
          ),
          complaints: newComplaints,
          satTrend: satChange > 0 ? 1 : satChange < 0 ? -1 : 0,
        };

        if (justCompleted) handleTaskCompletion(updatedBed);

        return justCompleted
          ? { ...updatedBed, actionProgress: 0, nurseId: [] }
          : updatedBed;
      })
    );
  };

  const handleTaskCompletion = (bed) => {
    const task = bed.tasks.find((t) => t.status === "PROCESSING");
    if (task) {
      completeTaskLogic(task, bed);
    }
  };

  const updateStaff = () => {
    setStaff((prev) =>
      prev.map((s) => {
        let staminaChange = 0;
        if (s.status === "WORKING" || s.status === "CPR") {
          let drainRate = 0.05;
          // Traits affecting Stamina
          if (s.traits.includes("STAMINA")) drainRate *= 0.7; // 30% less drain
          if (s.traits.includes("LAZY")) drainRate *= 1.2; // 20% more drain

          staminaChange = -(drainRate * gameSpeed);
        } else {
          staminaChange = 0.1 * gameSpeed; // Recovery
        }
        return {
          ...s,
          stamina: Math.max(0, Math.min(100, s.stamina + staminaChange)),
        };
      })
    );
  };

  // --- ACTIONS ---

  const assignTask = (nurseId, bedId, task) => {
    SoundSystem.play("CLICK");
    const nurse = staff.find((n) => n.id === nurseId);
    if (nurse.status !== "IDLE")
      return showToast("Staff not available", "error");
    if (!task.role.includes(nurse.roleKey)) {
      setScore((s) => s - 50);
      showToast(
        `Wrong Role! ${nurse.roleKey} cannot do ${task.label}`,
        "error"
      );
      SoundSystem.play("ERROR");
      return;
    }
    if (nurse.stamina < 10) return showToast("Staff exhausted!", "error");

    // Update Staff
    setStaff((prev) =>
      prev.map((n) =>
        n.id === nurseId
          ? {
              ...n,
              status: "WORKING",
              action: task.label,
              targetBedId: bedId,
            }
          : n
      )
    );

    // Update Bed
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bedId) {
          return {
            ...b,
            nurseId: [...b.nurseId, nurseId],
            tasks: b.tasks.map((t) =>
              t.uid === task.uid ? { ...t, status: "PROCESSING" } : t
            ),
          };
        }
        return b;
      })
    );
    setSelectedBed(null);
  };

  const completeTaskLogic = (task, bed) => {
    // Determine Who Worked on it
    const workerIds = bed.nurseId;
    const nurses = staff.filter((s) => workerIds.includes(s.id));

    // 1. Calculate Success/Failure (Clumsy Trait)
    let isSuccess = true;
    nurses.forEach((n) => {
      if (n.traits.includes("CLUMSY") && Math.random() < 0.05) {
        isSuccess = false;
        showToast(`${n.name} was clumsy! Task failed.`, "error");
        logTimeline(`${n.name} failed ${task.label} due to clumsiness.`, "bad");
        SoundSystem.play("ERROR");
      }
    });

    if (!isSuccess) {
      // Reset Logic for Failure
      setStaff((prev) =>
        prev.map((s) =>
          workerIds.includes(s.id)
            ? { ...s, status: "IDLE", action: null, targetBedId: null }
            : s
        )
      );
      setBeds((prev) =>
        prev.map((b) =>
          b.id === bed.id
            ? {
                ...b,
                nurseId: [],
                tasks: b.tasks.map((t) =>
                  t.uid === task.uid ? { ...t, status: "PENDING" } : t
                ), // Revert to Pending
                satisfaction: Math.max(0, b.satisfaction - 10), // Penalty
              }
            : b
        )
      );
      return;
    }

    // 2. Success Logic
    setFinancials((prev) => ({
      ...prev,
      revenue: prev.revenue + task.price,
      cost: prev.cost + task.cost,
      profit: prev.revenue + task.price - (prev.cost + task.cost),
    }));

    SoundSystem.play("SUCCESS");

    // Satisfaction Calculation
    let satBonus = 5; // Base
    nurses.forEach((n) => {
      if (n.traits.includes("ANGEL")) satBonus += 10;
      if (n.traits.includes("GRUMPY")) satBonus -= 3;
    });

    // Clear Complaints if Satisfaction is high enough
    let updatedComplaints = [...bed.complaints];
    const projectedSat = Math.min(100, bed.satisfaction + satBonus);
    if (projectedSat > 60 && updatedComplaints.length > 0) {
      updatedComplaints.pop(); // Remove one complaint
      showToast("A complaint was resolved!", "success");
      SoundSystem.play("SUCCESS");
    }

    setScore((s) => s + 10);

    // Free Staff & GIVE XP
    const xpBase = task.xp || 10;
    const xpGain = xpBase;

    setStaff((prev) =>
      prev.map((s) => {
        if (workerIds.includes(s.id)) {
          // XP Calculation
          let newXp = s.xp + xpGain;
          let newLevel = s.level;
          let newMaxXp = s.maxXp;
          let newSkill = s.skill;

          if (newXp >= newMaxXp) {
            newLevel += 1;
            newXp = newXp - newMaxXp;
            newMaxXp = Math.floor(newMaxXp * 1.5);
            newSkill += 1;
            showToast(`${s.name} Leveled Up to ${newLevel}!`, "success");
            SoundSystem.play("LEVELUP");
          }

          return {
            ...s,
            status: "IDLE",
            action: null,
            targetBedId: null,
            xp: newXp,
            level: newLevel,
            maxXp: newMaxXp,
            skill: newSkill,
          };
        }
        return s;
      })
    );

    // Remove Task & Update Bed
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id === bed.id) {
          if (task.id === "DC")
            return { id: b.id, status: "EMPTY", name: "ว่าง", tasks: [] };
          return {
            ...b,
            nurseId: [],
            tasks: b.tasks.filter((t) => t.uid !== task.uid),
            satisfaction: projectedSat,
            complaints: updatedComplaints,
          };
        }
        return b;
      })
    );

    logTimeline(`${task.label} on ${bed.name} completed.`, "good");
  };

  const triggerCriticalEvent = () => {
    const validBeds = beds.filter((b) => b.status === "OCCUPIED");
    if (validBeds.length === 0) return;
    const target = validBeds[Math.floor(Math.random() * validBeds.length)];
    const event =
      CRITICAL_EVENTS[Math.floor(Math.random() * CRITICAL_EVENTS.length)];

    setActiveAlert({
      ...event,
      bedId: target.id,
      bedName: target.name,
      shuffledOptions: shuffleArray(event.options),
    });

    setBeds((prev) =>
      prev.map((b) =>
        b.id === target.id
          ? { ...b, status: "CRITICAL", satisfaction: b.satisfaction - 20 }
          : b
      )
    );
    SoundSystem.play("ALARM");
  };

  const resolveCritical = (choice) => {
    SoundSystem.play("CLICK");
    const isCorrect = choice === activeAlert.correctAction;

    if (isCorrect) {
      const idleStaff = staff.filter((s) => s.status === "IDLE");
      let staffIds = [];

      // Check for CLUTCH GOD trait
      const hasClutch = idleStaff.some((s) => s.traits.includes("CLUTCH"));

      let req = activeAlert.reqStaff;
      if (hasClutch && req > 1) req -= 1;

      if (idleStaff.length < req) {
        showToast(`Emergency Draft! Need ${req} staff`, "warning");
        staffIds = idleStaff.map((s) => s.id);
      } else {
        staffIds = idleStaff.slice(0, req).map((s) => s.id);
      }

      setStaff((prev) =>
        prev.map((s) =>
          staffIds.includes(s.id)
            ? {
                ...s,
                status: "CPR",
                action: "CODE BLUE",
                targetBedId: activeAlert.bedId,
              }
            : s
        )
      );

      const cprTask = TASKS_DB.find((t) => t.id === "CPR");
      setBeds((prev) =>
        prev.map((b) =>
          b.id === activeAlert.bedId
            ? {
                ...b,
                status: "OCCUPIED",
                nurseId: staffIds,
                tasks: [
                  { ...cprTask, uid: Math.random(), status: "PROCESSING" },
                  ...b.tasks,
                ],
                condition: 50,
                satisfaction: 50, // Reset sat to neutral after saving life
              }
            : b
        )
      );

      showToast(
        `Correct! Team mobilized. ${
          hasClutch ? "(Clutch Bonus Applied!)" : ""
        }`,
        "success"
      );
      logTimeline(`Code Blue managed on Bed ${activeAlert.bedId}`, "good");
    } else {
      setScore((s) => s - 200);
      setBeds((prev) =>
        prev.map((b) =>
          b.id === activeAlert.bedId
            ? { ...b, condition: 0, status: "DEAD", nurseId: [] }
            : b
        )
      );
      showToast("Wrong Decision! Patient Expired.", "error");
      logTimeline(
        `Patient died due to error on Bed ${activeAlert.bedId}`,
        "bad"
      );
      SoundSystem.play("ERROR");
    }
    setActiveAlert(null);
  };

  const addRandomTask = () => {
    setBeds((prev) => {
      const occupied = prev.filter((b) => b.status === "OCCUPIED");
      if (occupied.length === 0) return prev;
      const target = occupied[Math.floor(Math.random() * occupied.length)];
      const task = TASKS_DB[Math.floor(Math.random() * (TASKS_DB.length - 2))];

      if (target.tasks.some((t) => t.id === task.id)) return prev;

      return prev.map((b) =>
        b.id === target.id
          ? {
              ...b,
              tasks: [
                ...b.tasks,
                { ...task, uid: Math.random(), status: "PENDING" },
              ],
            }
          : b
      );
    });
  };

  const addDischargeOrder = () => {
    setBeds((prev) => {
      const occupied = prev.filter(
        (b) => b.status === "OCCUPIED" && !b.tasks.some((t) => t.id === "DC")
      );
      if (occupied.length === 0) return prev;
      const target = occupied[Math.floor(Math.random() * occupied.length)];
      const task = TASKS_DB.find((t) => t.id === "DC");

      return prev.map((b) =>
        b.id === target.id
          ? {
              ...b,
              tasks: [
                ...b.tasks,
                { ...task, uid: Math.random(), status: "PENDING" },
              ],
            }
          : b
      );
    });
    logTimeline("Doctor ordered discharge.", "info");
  };

  const admitPatient = (decision) => {
    SoundSystem.play("CLICK");
    if (decision === "ACCEPT") {
      const emptyBed = beds.find((b) => b.status === "EMPTY");
      if (emptyBed) {
        const newPatient = {
          ...activeCall.data,
          id: emptyBed.id,
          status: "OCCUPIED",
          name: `Pt. ${Math.floor(Math.random() * 1000)}`,
          hn: `${Math.floor(Math.random() * 50000)}`,
          age: 40 + Math.floor(Math.random() * 40),
          currentVitals: activeCall.data.vitals,
          tasks: activeCall.data.orders.map((tid) => ({
            ...TASKS_DB.find((t) => t.id === tid),
            uid: Math.random(),
            status: "PENDING",
          })),
          nurseId: [],
          actionProgress: 0,
          condition: 100,
          satisfaction: 60, // Default Admission Sat
          complaints: [],
          satTrend: 0,
        };
        setBeds((prev) =>
          prev.map((b) => (b.id === emptyBed.id ? newPatient : b))
        );
        setScore((s) => s + 50);
        showToast("Admitted successfully", "success");
        SoundSystem.play("SUCCESS");
      } else {
        showToast("No beds available!", "error");
        SoundSystem.play("ERROR");
        setScore((s) => s - 10);
      }
    } else {
      logTimeline("Refused Admission", "neutral");
    }
    setActiveCall(null);
  };

  const endGame = (isVictory = false) => {
    setGameSpeed(0);
    setEndGameReport({
      score,
      shifts: shiftCount,
      targetShifts: config.endlessMode ? "Endless" : config.targetShifts,
      profit: financials.profit,
      timeline,
      isVictory,
      endlessMode: config.endlessMode,
    });
    if (isVictory) SoundSystem.play("LEVELUP");
  };

  // --- UTILS ---
  const logTimeline = (text, type) => {
    const time = formatTime(simTime);
    setTimeline((prev) => [{ time, text, type }, ...prev]);
  };

  const showToast = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getStaffName = (id) => {
    const s = staff.find((x) => x.id === id);
    return s ? s.name : "Unknown";
  };

  const getStaffIcon = (id) => {
    const s = staff.find((x) => x.id === id);
    return s ? s.icon : "?";
  };

  // ==========================================
  // 4. UI RENDERERS
  // ==========================================

  const renderKardex = () => {
    if (!selectedBed) return null;
    const triageColor =
      selectedBed.triage === "RED"
        ? "bg-red-100 text-red-800"
        : selectedBed.triage === "YELLOW"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-green-100 text-green-800";

    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div
                className={`p-2 rounded-lg font-bold ${triageColor} border-2 border-white`}
              >
                {selectedBed.triage} ZONE
              </div>
              <div>
                <h2 className="text-2xl font-bold">{selectedBed.name}</h2>
                <div className="text-sm opacity-70">
                  HN: {selectedBed.hn} | Age: {selectedBed.age}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedBed(null)}
              className="p-2 hover:bg-white/20 rounded-full"
            >
              <X />
            </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {/* Left Column */}
            <div className="w-1/3 bg-slate-50 border-r p-4 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Diagnosis
                </h3>
                <div className="text-xl font-bold text-slate-800">
                  {selectedBed.dx}
                </div>
              </div>

              {/* SATISFACTION PANEL */}
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Patient Satisfaction
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  {selectedBed.satisfaction >= 80 ? (
                    <Smile className="text-green-500" size={32} />
                  ) : selectedBed.satisfaction >= 40 ? (
                    <Meh className="text-yellow-500" size={32} />
                  ) : (
                    <Frown className="text-red-500" size={32} />
                  )}
                  <div className="text-3xl font-black text-slate-700">
                    {Math.round(selectedBed.satisfaction)}%
                  </div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full ${
                      selectedBed.satisfaction > 70
                        ? "bg-green-500"
                        : selectedBed.satisfaction > 30
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${selectedBed.satisfaction}%` }}
                  ></div>
                </div>

                {/* Complaints List */}
                {selectedBed.complaints.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-red-500 uppercase flex items-center gap-1">
                      <ShieldAlert size={12} /> Active Complaints
                    </div>
                    {selectedBed.complaints.map((c, i) => (
                      <div
                        key={i}
                        className="bg-red-50 text-red-700 p-2 rounded text-xs border border-red-200 flex items-center gap-2"
                      >
                        <ThumbsDown size={14} /> {c.text} (-{c.penalty} pts)
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <ThumbsUp size={12} /> No active complaints
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">
                  Live Vitals
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-2 rounded shadow-sm border text-center">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Heart Rate
                    </span>
                    <div
                      className={`text-2xl font-mono font-bold ${
                        selectedBed.currentVitals.hr > 100 ||
                        selectedBed.currentVitals.hr < 60
                          ? "text-red-500"
                          : "text-slate-800"
                      }`}
                    >
                      {Math.round(selectedBed.currentVitals.hr)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm border text-center">
                    <span className="text-[10px] text-slate-500 uppercase">
                      BP (Sys)
                    </span>
                    <div
                      className={`text-2xl font-mono font-bold ${
                        selectedBed.currentVitals.bp_sys < 90
                          ? "text-red-500"
                          : "text-slate-800"
                      }`}
                    >
                      {Math.round(selectedBed.currentVitals.bp_sys)}
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm border text-center">
                    <span className="text-[10px] text-slate-500 uppercase">
                      SpO2
                    </span>
                    <div
                      className={`text-2xl font-mono font-bold ${
                        selectedBed.currentVitals.spo2 < 95
                          ? "text-red-500"
                          : "text-slate-800"
                      }`}
                    >
                      {Math.round(selectedBed.currentVitals.spo2)}%
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm border text-center">
                    <span className="text-[10px] text-slate-500 uppercase">
                      Temp
                    </span>
                    <div
                      className={`text-2xl font-mono font-bold ${
                        selectedBed.currentVitals.temp > 37.5
                          ? "text-red-500"
                          : "text-slate-800"
                      }`}
                    >
                      {selectedBed.currentVitals.temp.toFixed(1)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 bg-white p-4 overflow-y-auto">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <ClipboardList /> Doctor Orders
              </h3>

              <div className="space-y-3">
                {selectedBed.tasks.map((task) => (
                  <div
                    key={task.uid}
                    className={`border rounded-xl p-4 transition-all ${
                      task.status === "PROCESSING"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded text-white mr-2 ${
                            task.type === "CRITICAL"
                              ? "bg-red-600"
                              : task.type === "SKILLED"
                              ? "bg-purple-600"
                              : "bg-blue-600"
                          }`}
                        >
                          {task.type}
                        </span>
                        <span className="font-bold">{task.label}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-green-600 font-bold">
                          +{formatMoney(task.price)}
                        </div>
                        <div className="text-[10px] text-red-400">
                          Cost: -{formatMoney(task.cost)}
                        </div>
                      </div>
                    </div>

                    {task.status === "PENDING" && (
                      <div className="mt-3">
                        <div className="text-xs text-slate-400 mb-1">
                          ASSIGN TO:
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {staff.map((s) => {
                            const canDo = task.role.includes(s.roleKey);
                            const isFree = s.status === "IDLE";
                            // const hasTrait = s.traits.length > 0;
                            return (
                              <button
                                key={s.id}
                                disabled={!isFree}
                                onClick={() =>
                                  assignTask(s.id, selectedBed.id, task)
                                }
                                className={`px-3 py-2 rounded border flex items-center gap-2 ${
                                  !canDo
                                    ? "opacity-30 cursor-not-allowed bg-slate-100"
                                    : isFree
                                    ? "hover:bg-blue-100 border-slate-300 hover:border-blue-500"
                                    : "opacity-50 bg-slate-100"
                                }`}
                              >
                                <span className="text-lg">{s.icon}</span>
                                <div className="text-left">
                                  <div className="text-xs font-bold">
                                    {s.name}
                                  </div>
                                  <div
                                    className={`text-[9px] ${
                                      s.stamina < 30
                                        ? "text-red-500"
                                        : "text-green-500"
                                    }`}
                                  >
                                    {Math.round(s.stamina)}% En
                                  </div>
                                </div>
                                {/* Trait Indicators Mini */}
                                <div className="flex gap-0.5 ml-1">
                                  {s.traits.map((tKey) => {
                                    const T = STAFF_TRAITS[tKey];
                                    return (
                                      <div
                                        key={tKey}
                                        title={T.name}
                                        className={`w-2 h-2 rounded-full ${
                                          T.type === "POS"
                                            ? "bg-green-400"
                                            : "bg-red-400"
                                        }`}
                                      ></div>
                                    );
                                  })}
                                </div>
                                {/* Level Indicator Mini */}
                                <div className="bg-yellow-100 text-yellow-700 text-[8px] px-1 rounded font-bold ml-1">
                                  Lv.{s.level}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {task.status === "PROCESSING" && (
                      <div className="text-blue-600 text-sm font-bold flex items-center gap-2 animate-pulse">
                        <RefreshCw size={14} className="animate-spin" /> In
                        Progress by{" "}
                        {selectedBed.nurseId
                          .map((nid) => getStaffName(nid))
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ))}
                {selectedBed.tasks.length === 0 && (
                  <div className="text-center text-slate-400 py-10">
                    No active orders
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlert = () => {
    if (!activeAlert) return null;
    return (
      <div className="fixed inset-0 z-[60] bg-red-900/90 flex items-center justify-center p-4 animate-in zoom-in duration-300">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-l-8 border-red-600 overflow-hidden">
          <div className="bg-red-50 p-6 border-b border-red-100">
            <div className="flex items-center gap-3 mb-2">
              <AlertOctagon className="text-red-600 animate-pulse" size={32} />
              <h2 className="text-2xl font-black text-red-700">
                CRITICAL EVENT
              </h2>
            </div>
            <p className="font-bold text-slate-800 text-lg">
              Bed: {activeAlert.bedName} - {activeAlert.title}
            </p>
          </div>
          <div className="p-6">
            <div className="bg-slate-100 p-4 rounded-lg mb-6">
              <div className="text-xs font-bold text-slate-500 uppercase">
                Assessment
              </div>
              <div className="text-slate-800 font-medium">
                {activeAlert.symptoms}
              </div>
              <div className="text-xs text-red-500 mt-2 font-bold">
                Requires {activeAlert.reqStaff} Staff Members
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {activeAlert.shuffledOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => resolveCritical(opt)}
                  className="p-4 text-left border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-blue-500 font-bold text-slate-700 transition-all"
                >
                  {i + 1}. {opt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPhoneCall = () => {
    if (!activeCall) return null;
    const { data } = activeCall;
    return (
      <div className="fixed bottom-4 right-4 z-[70] w-96 bg-slate-800 text-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-600">
        <div className="p-4 bg-blue-600 flex items-center gap-3">
          <PhoneCall className="animate-phone" />
          <div className="font-bold">Incoming Admission</div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-lg font-bold">{data.dx}</div>
              <div
                className={`inline-block px-2 rounded text-xs font-bold text-slate-900 ${
                  data.triage === "RED"
                    ? "bg-red-400"
                    : data.triage === "YELLOW"
                    ? "bg-yellow-400"
                    : "bg-green-400"
                }`}
              >
                {data.triage} TRIAGE
              </div>
            </div>
            <div className="text-right text-sm opacity-70">
              <div>HR: {data.vitals.hr}</div>
              <div>BP: {data.vitals.bp_sys}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => admitPatient("ACCEPT")}
              className="bg-green-600 hover:bg-green-500 py-2 rounded-lg font-bold"
            >
              Accept
            </button>
            <button
              onClick={() => admitPatient("DENY")}
              className="bg-red-600 hover:bg-red-500 py-2 rounded-lg font-bold"
            >
              Refuse (Full)
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEndGame = () => {
    if (!endGameReport) return null;
    const isWin = endGameReport.isVictory;
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in">
          {isWin ? (
            <Star
              size={80}
              className="mx-auto text-yellow-400 mb-4 fill-current animate-spin-slow"
            />
          ) : (
            <Flag size={80} className="mx-auto text-slate-400 mb-4" />
          )}

          <h1 className="text-4xl font-black text-slate-800 mb-2">
            {isWin ? "MISSION ACCOMPLISHED" : "GAME FINISHED"}
          </h1>
          <p className="text-slate-500 mb-8">
            {isWin
              ? "You successfully managed the ward through all shifts."
              : "You chose to end the simulation."}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500">Total Score</div>
              <div className="text-3xl font-black text-blue-600">
                {endGameReport.score}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500">Net Profit</div>
              <div className="text-3xl font-black text-green-600">
                {formatMoney(endGameReport.profit)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="text-sm text-slate-500">Shifts</div>
              <div className="text-3xl font-black text-purple-600">
                {endGameReport.shifts} /{" "}
                {endGameReport.endlessMode ? "∞" : endGameReport.targetShifts}
              </div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-xl mb-8 text-left border">
            <h3 className="font-bold text-slate-500 mb-2">Shift History</h3>
            {endGameReport.timeline.map((log, i) => (
              <div
                key={i}
                className="text-xs font-mono mb-1 border-b border-slate-200 pb-1"
              >
                {log.time} - {log.text}
              </div>
            ))}
          </div>

          <button
            onClick={() => window.location.reload()}
            className="bg-slate-800 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-slate-700 transition-all shadow-xl"
          >
            New Game
          </button>
        </div>
      </div>
    );
  };

  // --- START SCREEN ---
  if (phase === "SETUP")
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10">
            <Heart size={100} />
          </div>
          <div className="absolute bottom-20 right-20">
            <Activity size={150} />
          </div>
        </div>

        <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-700 z-10">
          <div className="text-center mb-10">
            <div className="inline-block bg-blue-600 p-3 rounded-2xl mb-4 shadow-lg shadow-blue-500/50">
              <Activity size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-2">
              NURSE <span className="text-blue-500">COMMANDER</span>{" "}
              <span className="text-yellow-400 text-2xl font-mono border px-2 rounded">
                ULTIMATE
              </span>
            </h1>
            <p className="text-slate-400">
              Advanced Hospital Management Simulation (Traits, Leveling & Sound)
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                Select Department
              </h3>
              <div className="grid grid-cols-2 gap-3 h-80 overflow-y-auto pr-2 custom-scrollbar">
                {Object.keys(WARDS_CONFIG).map((key) => {
                  const W = WARDS_CONFIG[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setConfig({ ...config, ward: key })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        config.ward === key
                          ? "bg-slate-700 border-blue-500 ring-2 ring-blue-500/50"
                          : "border-slate-600 hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${W.color} text-white`}>
                          <W.Icon size={18} />
                        </div>
                        <span className="font-bold">{W.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{W.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-300">Staff Count</span>{" "}
                  <span className="text-blue-400 font-mono">
                    {config.staffCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={config.staffCount}
                  onChange={(e) =>
                    setConfig({ ...config, staffCount: Number(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-300">Total Beds</span>{" "}
                  <span className="text-green-400 font-mono">
                    {config.bedCount}
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="12"
                  value={config.bedCount}
                  onChange={(e) =>
                    setConfig({ ...config, bedCount: Number(e.target.value) })
                  }
                  className="w-full accent-green-500"
                />
              </div>

              {/* DURATION SETTING */}
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-600">
                <div className="flex justify-between mb-2 items-center">
                  <span className="font-bold text-yellow-400">
                    Target Duration
                  </span>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="endlessMode"
                      className="w-4 h-4 mr-2 accent-yellow-500"
                      checked={config.endlessMode}
                      onChange={(e) =>
                        setConfig({ ...config, endlessMode: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="endlessMode"
                      className="text-xs text-white cursor-pointer select-none"
                    >
                      Endless Mode
                    </label>
                  </div>
                </div>

                {config.endlessMode ? (
                  <div className="text-center py-4 bg-slate-700 rounded-lg border border-slate-600 animate-pulse">
                    <span className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-2">
                      <Infinity /> UNLIMITED SHIFTS
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      Game continues until you stop
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs">Shifts</span>{" "}
                      <span className="text-yellow-400 font-mono text-xl font-bold">
                        {config.targetShifts}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={config.targetShifts}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          targetShifts: Number(e.target.value),
                        })
                      }
                      className="w-full accent-yellow-500"
                    />
                    <div className="text-xs text-slate-400 mt-2 text-right">
                      Auto-ends after {config.targetShifts} shifts (8h each)
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={initGame}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-black text-xl shadow-lg transform transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                START GAME <Play fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  const WardConfig = WARDS_CONFIG[config.ward];
  const WardIcon = WardConfig.Icon;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col h-screen overflow-hidden font-sans text-slate-900">
      <style>{cssStyles}</style>
      {notification && (
        <div
          className={`absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl z-[80] text-white font-bold flex items-center gap-3 animate-bounce ${
            notification.type === "error"
              ? "bg-red-600"
              : notification.type === "info"
              ? "bg-slate-800"
              : "bg-green-600"
          }`}
        >
          {notification.type === "error" ? (
            <AlertOctagon />
          ) : notification.type === "info" ? (
            <Briefcase />
          ) : (
            <CheckCircle />
          )}{" "}
          {notification.msg}
        </div>
      )}

      {renderKardex()}
      {renderAlert()}
      {renderPhoneCall()}
      {renderEndGame()}

      {/* TOP HEADER */}
      <div
        className={`h-16 ${WardConfig.color} text-white flex items-center justify-between px-4 shadow-lg z-40`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <WardIcon />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">
              {WardConfig.name} Ward
            </h1>
            <div className="text-[10px] opacity-80 flex gap-2">
              <span>
                Target:{" "}
                {config.endlessMode ? (
                  <span className="font-bold">∞</span>
                ) : (
                  config.targetShifts
                )}{" "}
                Shifts
              </span>
              <span>|</span>
              <span>{config.staffCount} Staff</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="hidden md:flex gap-6 items-center bg-black/20 px-4 py-2 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-yellow-400">
            <Star fill="currentColor" size={16} />
            <span className="font-mono font-bold text-lg">{score}</span>
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-2 text-green-400">
            <Banknote size={16} />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-green-200">PROFIT</span>
              <span className="font-mono font-bold">
                {formatMoney(financials.profit)}
              </span>
            </div>
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-2 text-white">
            <Calendar size={16} />
            <div className="flex flex-col leading-none text-right">
              <span className="text-[10px] text-white/70">SHIFT</span>
              <span className="font-mono font-bold">
                {shiftCount} / {config.endlessMode ? "∞" : config.targetShifts}
              </span>
            </div>
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div className="flex items-center gap-2 text-white">
            <Clock size={16} />
            <span className="font-mono font-bold text-lg">
              {formatTime(simTime)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-full transition-all ${
              soundEnabled
                ? "bg-white/20 text-white"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => setGameSpeed((s) => (s === 0 ? 1 : 0))}
            className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all"
          >
            {gameSpeed === 0 ? (
              <Play fill="currentColor" />
            ) : (
              <Pause fill="currentColor" />
            )}
          </button>
          <button
            onClick={() => endGame(false)}
            className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg transition-all flex flex-col items-center leading-none"
          >
            <Flag size={14} className="mb-0.5" />{" "}
            {config.endlessMode ? "FINISH" : "FINISH EARLY"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: WARD VIEW */}
        <div
          className={`flex-1 bg-slate-200 p-4 overflow-y-auto ${
            mobileTab === "STAFF" ? "hidden md:block" : "block"
          }`}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
            {beds.map((bed) => {
              const isEmpty = bed.status === "EMPTY";
              const isCrit = bed.status === "CRITICAL";
              const isDead = bed.status === "DEAD";

              // Triage Style
              let borderClass = "border-slate-300";
              if (!isEmpty && !isDead) {
                if (bed.triage === "RED") borderClass = "triage-red";
                if (bed.triage === "YELLOW") borderClass = "triage-yellow";
                if (bed.triage === "GREEN") borderClass = "triage-green";
              }

              return (
                <div
                  key={bed.id}
                  onClick={() => !isEmpty && !isDead && setSelectedBed(bed)}
                  className={`
                           relative h-64 rounded-xl p-3 flex flex-col shadow-sm transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 bg-white
                           ${borderClass}
                           ${isCrit ? "ring-4 ring-red-500 animate-pulse" : ""}
                           ${isDead ? "opacity-50 grayscale" : ""}
                           ${
                             isEmpty
                               ? "opacity-60 border-dashed border-4 border-slate-300"
                               : ""
                           }
                           ${
                             bed.complaints && bed.complaints.length > 0
                               ? "shake-element"
                               : ""
                           }
                        `}
                >
                  {isEmpty ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <UserPlus size={40} />
                      <span className="font-bold mt-2">VACANT</span>
                    </div>
                  ) : isDead ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-600">
                      <Skull size={40} />
                      <span className="font-bold mt-2">DECEASED</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                          BED {bed.id}
                        </span>
                        <div className="flex gap-1">
                          {isCrit && (
                            <AlertTriangle size={16} className="text-red-600" />
                          )}
                          {bed.complaints.length > 0 && (
                            <ShieldAlert
                              size={16}
                              className="text-red-500 animate-bounce"
                            />
                          )}
                        </div>
                      </div>

                      <div className="bg-black rounded h-12 mb-2 relative overflow-hidden border border-slate-700 flex items-center px-2">
                        <div className="absolute inset-0 opacity-20 ecg-line"></div>
                        <div className="relative z-10 w-full flex justify-between font-mono text-green-400 text-xs">
                          <div className="flex flex-col">
                            <span>HR {Math.round(bed.currentVitals.hr)}</span>
                            <span>
                              BP {Math.round(bed.currentVitals.bp_sys)}
                            </span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span>
                              O2 {Math.round(bed.currentVitals.spo2)}%
                            </span>
                            <span>T {bed.currentVitals.temp.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-sm truncate text-slate-800">
                        {bed.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mb-1">
                        {bed.dx}
                      </div>

                      {/* Satisfaction Bar Mini */}
                      <div className="mb-2">
                        <div className="flex justify-between items-center text-[9px] mb-0.5 font-bold">
                          <span
                            className={
                              bed.satisfaction < 30
                                ? "text-red-500"
                                : "text-slate-400"
                            }
                          >
                            SATISFACTION
                          </span>
                          <span
                            className={
                              bed.satisfaction < 30
                                ? "text-red-500"
                                : "text-slate-400"
                            }
                          >
                            {Math.round(bed.satisfaction)}%
                          </span>
                        </div>
                        <div className="h-1 bg-slate-100 w-full rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              bed.satisfaction < 30
                                ? "bg-red-500"
                                : bed.satisfaction < 70
                                ? "bg-yellow-400"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${bed.satisfaction}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Task / Staff Indicator (Visual Tracking) */}
                      <div className="mt-auto">
                        {bed.nurseId.length > 0 ? (
                          <div className="w-full">
                            <div className="flex justify-between text-[10px] text-blue-600 font-bold mb-1 items-center">
                              <div className="flex items-center gap-1 overflow-hidden">
                                <RefreshCw
                                  size={10}
                                  className="animate-spin shrink-0"
                                />
                                <span className="truncate">
                                  {bed.nurseId
                                    .map((id) => getStaffIcon(id))
                                    .join("")}
                                </span>
                              </div>
                              <span>{Math.round(bed.actionProgress)}%</span>
                            </div>
                            <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300"
                                style={{ width: `${bed.actionProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-1 flex-wrap">
                            {bed.tasks
                              .filter((t) => t.status === "PENDING")
                              .slice(0, 3)
                              .map((t, i) => (
                                <span
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    t.type === "CRITICAL"
                                      ? "bg-red-500"
                                      : t.type === "SKILLED"
                                      ? "bg-purple-500"
                                      : "bg-blue-400"
                                  }`}
                                ></span>
                              ))}
                            {bed.tasks.length > 3 && (
                              <span className="text-[9px] text-slate-400">
                                +{bed.tasks.length - 3}
                              </span>
                            )}
                            {bed.tasks.length === 0 && (
                              <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                                <CheckCircle size={10} /> Stable
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: STAFF & INFO */}
        <div
          className={`w-full md:w-96 bg-white border-l shadow-xl z-20 flex flex-col ${
            mobileTab === "STAFF" ? "block" : "hidden md:flex"
          }`}
        >
          <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Users size={16} /> ON DUTY
            </h3>
            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600 font-mono">
              Cost: -{formatMoney(staff.reduce((a, b) => a + b.shiftWage, 0))}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {staff.map((s) => (
              <div
                key={s.id}
                className={`border rounded-xl p-3 shadow-sm transition-all ${
                  s.status === "IDLE"
                    ? "bg-white border-slate-200"
                    : s.status === "CPR"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="text-xl bg-slate-100 p-1 rounded relative">
                      {s.icon}
                      <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-900 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white">
                        {s.level}
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {s.label}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      s.status === "IDLE"
                        ? "bg-green-100 text-green-700"
                        : s.status === "CPR"
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {s.status}
                  </div>
                </div>

                {/* XP Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                    <span>EXP</span>
                    <span>
                      {Math.floor(s.xp)}/{s.maxXp}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full w-full">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${(s.xp / s.maxXp) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Traits Section */}
                <div className="mb-2 flex gap-1 flex-wrap">
                  {s.traits.map((tKey) => {
                    const T = STAFF_TRAITS[tKey];
                    const Icon = T.icon;
                    return (
                      <div
                        key={tKey}
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                          T.type === "POS"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                        title={T.desc}
                      >
                        <Icon size={10} /> {T.name}
                      </div>
                    );
                  })}
                </div>

                {/* Stamina */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        s.stamina < 30 ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${s.stamina}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {Math.round(s.stamina)}%
                  </span>
                </div>

                {/* Location Visual */}
                {s.targetBedId && (
                  <div className="mt-2 text-xs flex items-center justify-between bg-white/50 p-1 rounded">
                    <span className="text-slate-500 flex items-center gap-1">
                      <ArrowRight size={10} /> Bed {s.targetBedId}
                    </span>
                    <span className="font-bold text-blue-600 truncate max-w-[100px]">
                      {s.action}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Log */}
          <div className="h-1/3 border-t bg-slate-900 text-slate-300 p-3 overflow-y-auto">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
              <History size={10} /> Event Log
            </h4>
            <div className="space-y-1.5 font-mono text-[10px]">
              {timeline.map((log, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    log.type === "bad"
                      ? "text-red-400"
                      : log.type === "good"
                      ? "text-green-400"
                      : "text-slate-400"
                  }`}
                >
                  <span className="opacity-50">[{log.time}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="md:hidden bg-white border-t flex justify-between p-2">
        <button
          onClick={() => setMobileTab("DASHBOARD")}
          className={`flex-1 p-2 rounded flex flex-col items-center ${
            mobileTab === "DASHBOARD" ? "text-blue-600 bg-blue-50" : ""
          }`}
        >
          <Layout size={20} />
          <span className="text-[10px]">Ward</span>
        </button>
        <button
          onClick={() => setMobileTab("STAFF")}
          className={`flex-1 p-2 rounded flex flex-col items-center ${
            mobileTab === "STAFF" ? "text-blue-600 bg-blue-50" : ""
          }`}
        >
          <Users size={20} />
          <span className="text-[10px]">Staff</span>
        </button>
      </div>
    </div>
  );
}
