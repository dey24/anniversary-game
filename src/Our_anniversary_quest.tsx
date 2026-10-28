import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Heart, Sparkles, Key, Lock, Unlock, Volume2, VolumeX,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw,
  Award, Compass, Music, ShieldAlert, CheckCircle2, ChevronRight,
  Crown, Zap, AlertTriangle, Star, Trophy
} from 'lucide-react';

// --- Web Audio API Procedural Sound Engine ---
// Zero external asset dependencies: all suspense, clicks, chimes & romantic music are synthesized!
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.suspenseOsc = null;
    this.suspenseGain = null;
    this.pulseInterval = null;
    this.musicInterval = null;
    this.isSuspenseRunning = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.suspenseGain) this.suspenseGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.stopRomanticMusic();
    } else {
      if (this.suspenseGain && this.isSuspenseRunning) {
        this.suspenseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      }
    }
    return this.isMuted;
  }

  // Suspense ambient bass drone & heart-pulse beat
  startSuspense() {
    this.init();
    if (this.isSuspenseRunning) return;
    this.isSuspenseRunning = true;

    try {
      // Warm low drone oscillator
      const droneOsc = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

      // Lowpass filter for dark mystery warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, this.ctx.currentTime);

      droneGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx.currentTime);
      droneOsc.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.ctx.destination);

      droneOsc.start();
      this.suspenseOsc = droneOsc;
      this.suspenseGain = droneGain;

      // Heartbeat pulse interval
      this.pulseInterval = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();

        kickOsc.frequency.setValueAtTime(75, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

        kickGain.gain.setValueAtTime(0.12, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        kickOsc.connect(kickGain);
        kickGain.connect(this.ctx.destination);

        kickOsc.start(now);
        kickOsc.stop(now + 0.2);
      }, 1400);
    } catch (e) {
      console.warn("Audio Context init pending user gesture", e);
    }
  }

  stopSuspense() {
    this.isSuspenseRunning = false;
    if (this.pulseInterval) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    if (this.suspenseGain && this.ctx) {
      try {
        this.suspenseGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
        setTimeout(() => {
          if (this.suspenseOsc) {
            this.suspenseOsc.stop();
            this.suspenseOsc.disconnect();
          }
        }, 700);
      } catch (e) { }
    }
  }

  // Tactile click for card flip & tumblers
  playClick() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) { }
  }

  // Cheerful chime on card match
  playMatchChime() {
    if (this.isMuted || !this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + idx * 0.07;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.4);
      });
    } catch (e) { }
  }

  // Soft low buzz on mismatch
  playMismatch() {
    if (this.isMuted || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) { }
  }

  // Grand stage clear chime
  playUnlockSuccess() {
    if (this.isMuted || !this.ctx) return;
    try {
      const chord = [440, 554.37, 659.25, 880]; // A Major chime
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + idx * 0.09;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.9);
      });
    } catch (e) { }
  }

  // Triumphant fanfare when Supergirl saves the King
  playSupergirlFanfare() {
    if (this.isMuted || !this.ctx) return;
    try {
      const fanfare = [
        { freq: 523.25, delay: 0, dur: 0.18 },
        { freq: 659.25, delay: 0.16, dur: 0.18 },
        { freq: 783.99, delay: 0.32, dur: 0.22 },
        { freq: 1046.5, delay: 0.52, dur: 0.5 },
        { freq: 1318.51, delay: 0.72, dur: 0.8 },
      ];
      fanfare.forEach(({ freq, delay, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + delay;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur + 0.05);
      });
    } catch (e) { }
  }

  // Romantic music box arpeggio for Grand Finale
  startRomanticMusic() {
    this.init();
    if (this.isMuted) return;
    this.stopRomanticMusic();

    // Sweet romantic lullaby arpeggio loop (Key of D Major / B minor warmth)
    const melody = [
      587.33, 739.99, 880.00, 1174.66, 880.00, 739.99,
      659.25, 783.99, 987.77, 1318.51, 987.77, 783.99,
      554.37, 739.99, 880.00, 1108.73, 880.00, 739.99,
      493.88, 587.33, 739.99, 987.77, 739.99, 587.33
    ];
    let noteIdx = 0;

    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      try {
        const freq = melody[noteIdx % melody.length];
        noteIdx++;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.7);
      } catch (e) { }
    }, 240);
  }

  stopRomanticMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

const audio = new SoundEngine();

// --- Interactive Starfield Canvas ---
const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
      pulsing: Math.random() > 0.5,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep cosmic gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#090915');
      bgGrad.addColorStop(0.5, '#120d1c');
      bgGrad.addColorStop(1, '#08050e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 220, 240, ${star.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f472b6';
        ctx.fill();
        ctx.restore();

        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        if (star.pulsing) {
          star.alpha += 0.005;
          if (star.alpha > 0.95) star.pulsing = false;
        } else {
          star.alpha -= 0.005;
          if (star.alpha < 0.2) star.pulsing = true;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

// --- Confetti Engine for Grand Finale ---
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f43f5e', '#ec4899', '#f472b6', '#fb7185', '#fbbf24', '#fef08a', '#ffffff'];
    const particles = Array.from({ length: 140 }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -18 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 8,
      isHeart: Math.random() > 0.45,
      gravity: 0.38,
      drag: 0.975,
      opacity: 1,
    }));

    const drawHeart = (ctx, x, y, size, color, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurveHeight);
      ctx.bezierCurveTo(-size / 2, (size + topCurveHeight) / 2, 0, size, 0, size * 1.3);
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurveHeight) / 2, size / 2, topCurveHeight);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.vy > 0) {
          p.opacity = Math.max(0, p.opacity - 0.0035);
        }

        if (p.isHeart) {
          drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity);
        } else {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.opacity;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
};

// --- Ancient Wooden Scroll Roller Component ---
const ScrollRoller = ({ isTop = true }) => (
  <div className={`relative flex items-center justify-center w-full z-20 ${isTop ? '-mb-2 sm:-mb-3' : '-mt-2 sm:-mt-3'}`}>
    {/* Left Turned Wooden Knob / Finial */}
    <div className="flex items-center shrink-0">
      <div
        className="w-4 h-6 sm:w-6 sm:h-9 rounded-full wood-finial relative"
        style={{
          boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,220,180,0.6)',
        }}
      />
      {/* Turned neck ring */}
      <div className="w-1.5 h-3 sm:w-2.5 sm:h-5 bg-gradient-to-r from-[#d99d63] via-[#ffdfb5] to-[#733a15] rounded-xs border-y border-[#3b1d08] shadow-sm -ml-0.5" />
    </div>

    {/* Center Cylindrical Wooden Roller Rod */}
    <div
      className="flex-1 h-5 sm:h-7 wood-roller rounded-xs relative overflow-hidden border-y border-[#2d1205]"
      style={{
        boxShadow: isTop
          ? '0 6px 14px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,220,170,0.4)'
          : '0 -6px 14px rgba(0,0,0,0.6), inset 0 -2px 3px rgba(255,220,170,0.4)',
      }}
    >
      {/* Cylinder light reflection */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-[#ffdca8]/35 to-transparent" />
    </div>

    {/* Right Turned Wooden Knob / Finial */}
    <div className="flex items-center shrink-0">
      {/* Turned neck ring */}
      <div className="w-1.5 h-3 sm:w-2.5 sm:h-5 bg-gradient-to-r from-[#733a15] via-[#ffdfb5] to-[#d99d63] rounded-xs border-y border-[#3b1d08] shadow-sm -mr-0.5" />
      <div
        className="w-4 h-6 sm:w-6 sm:h-9 rounded-full wood-finial relative"
        style={{
          boxShadow: '0 4px 10px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,220,180,0.6)',
        }}
      />
    </div>
  </div>
);

// ==========================================
// LEVEL 3 CELESTIAL MAZE PATTERNS
// 0: Path, 1: Void barrier, 2: Celestial Star, 3: The King (Goal)
// ==========================================
const MAZE_PATTERNS = [
  {
    id: 'constellation',
    name: 'Pattern I: Constellation of Devotion',
    grid: [
      [0, 0, 0, 1, 2, 0, 0, 0],
      [1, 1, 0, 1, 0, 1, 1, 0],
      [0, 0, 2, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 0, 1, 0],
      [0, 2, 0, 0, 1, 0, 0, 2],
      [1, 1, 1, 0, 1, 1, 1, 0],
      [0, 0, 0, 2, 0, 0, 1, 3],
    ],
    start: { r: 0, c: 0 },
    kingPos: { r: 6, c: 7 },
    totalStars: 5,
    minOptimalSteps: 35,
    maxSteps: 40,
    difficulty: 'Pattern I (7×8)',
  },
  {
    id: 'nebula',
    name: 'Pattern II: The Nebula Spiral',
    grid: [
      [0, 0, 1, 0, 0, 2, 0],
      [1, 0, 1, 0, 1, 1, 0],
      [2, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 0, 1, 0],
      [0, 2, 0, 1, 0, 0, 2],
      [0, 1, 0, 1, 1, 0, 1],
      [0, 0, 2, 0, 0, 0, 3],
    ],
    start: { r: 0, c: 0 },
    kingPos: { r: 6, c: 6 },
    totalStars: 5,
    minOptimalSteps: 32,
    maxSteps: 37,
    difficulty: 'Pattern II (7×7)',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function App() {
  // Game Navigation States: 'intro' | 'level1' | 'level2' | 'level3' | 'transition' | 'finale'
  const [stage, setStage] = useState('intro');
  const [isMuted, setIsMuted] = useState(false);

  // Level 1 Memory Cards
  const memoryIcons = [
    { id: '1', emoji: '☕', label: 'First Coffee' },
    { id: '2', emoji: '🎬', label: 'Movie Night' },
    { id: '3', emoji: '✈️', label: 'Our Trips' },
    { id: '4', emoji: '🌹', label: 'Red Roses' },
    { id: '5', emoji: '✨', label: 'Stargazing' },
    { id: '6', emoji: '🍕', label: 'Late Midnight Snacks' },
  ];

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [isCheckingMatch, setIsCheckingMatch] = useState(false);

  // Level 2 Cipher Tumblers: 31st October in DDMM format -> ['3', '1', '1', '0']
  const TARGET_CIPHER = ['3', '1', '1', '0'];
  const [tumblerDigits, setTumblerDigits] = useState(['0', '0', '0', '0']);
  const [cipherError, setCipherError] = useState(false);

  // Level 3 Maze Patterns & Steps State
  const [selectedPatternIndex, setSelectedPatternIndex] = useState(0);
  const currentPattern = MAZE_PATTERNS[selectedPatternIndex];
  const [mazeGrid, setMazeGrid] = useState(() => currentPattern.grid.map(row => [...row]));
  const [playerPos, setPlayerPos] = useState({ ...currentPattern.start });
  const [collectedHearts, setCollectedHearts] = useState(0);
  const [stepsTaken, setStepsTaken] = useState(0);
  const [level3Status, setLevel3Status] = useState('playing'); // 'playing' | 'gameover' | 'supergirl'
  const [mazeWarning, setMazeWarning] = useState(null);

  // Toggle Mute
  const handleToggleMute = () => {
    const state = audio.toggleMute();
    setIsMuted(state);
  };

  // Start Adventure Handler
  const handleStartGame = () => {
    audio.init();
    audio.startSuspense();
    initMemoryCards();
    setStage('level1');
  };

  // ----------------------------------------
  // LEVEL 1: Memory Match Logic
  // ----------------------------------------
  const initMemoryCards = () => {
    const deck = [...memoryIcons, ...memoryIcons]
      .map((item, index) => ({
        ...item,
        uniqueKey: `${item.id}-${index}`,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndices([]);
    setMatchedIds([]);
  };

  const handleCardClick = (index) => {
    if (isCheckingMatch) return;
    if (flippedIndices.includes(index)) return;
    if (matchedIds.includes(cards[index].id)) return;

    audio.playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsCheckingMatch(true);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.id === secondCard.id) {
        // Matched
        setTimeout(() => {
          audio.playMatchChime();
          const newMatched = [...matchedIds, firstCard.id];
          setMatchedIds(newMatched);
          setFlippedIndices([]);
          setIsCheckingMatch(false);

          // All 6 pairs matched!
          if (newMatched.length === memoryIcons.length) {
            audio.playUnlockSuccess();
            setTimeout(() => {
              setStage('level2');
            }, 1200);
          }
        }, 500);
      } else {
        // Mismatch
        setTimeout(() => {
          audio.playMismatch();
          setFlippedIndices([]);
          setIsCheckingMatch(false);
        }, 850);
      }
    }
  };

  // ----------------------------------------
  // LEVEL 2: Milestone Cipher Logic
  // ----------------------------------------
  const rotateTumbler = (digitIdx, direction) => {
    audio.playClick();
    setCipherError(false);
    setTumblerDigits((prev) => {
      const updated = [...prev];
      let val = parseInt(updated[digitIdx], 10);
      val = direction === 'up' ? (val + 1) % 10 : (val - 1 + 10) % 10;
      updated[digitIdx] = val.toString();
      return updated;
    });
  };

  const resetLevel3 = (patternIdx = selectedPatternIndex) => {
    setSelectedPatternIndex(patternIdx);
    const pattern = MAZE_PATTERNS[patternIdx];
    setMazeGrid(pattern.grid.map(row => [...row]));
    setPlayerPos({ ...pattern.start });
    setCollectedHearts(0);
    setStepsTaken(0);
    setLevel3Status('playing');
    setMazeWarning(null);
  };

  const verifyCipher = () => {
    const isCorrect = tumblerDigits.every((d, i) => d === TARGET_CIPHER[i]);
    if (isCorrect) {
      audio.playUnlockSuccess();
      setTimeout(() => {
        resetLevel3(0);
        setStage('level3');
      }, 1000);
    } else {
      audio.playMismatch();
      setCipherError(true);
    }
  };

  // ----------------------------------------
  // LEVEL 3: Celestial Maze Movement
  // ----------------------------------------
  const movePlayer = useCallback(
    (dr, dc) => {
      if (stage !== 'level3' || level3Status !== 'playing') return;

      const pattern = MAZE_PATTERNS[selectedPatternIndex];
      const nr = playerPos.r + dr;
      const nc = playerPos.c + dc;

      // Boundaries check
      if (nr < 0 || nr >= mazeGrid.length || nc < 0 || nc >= mazeGrid[0].length) {
        return;
      }

      const cell = mazeGrid[nr][nc];
      if (cell === 1) {
        // Void barrier
        audio.playMismatch();
        return;
      }

      const nextSteps = stepsTaken + 1;
      setStepsTaken(nextSteps);
      audio.playClick();

      let nextCollected = collectedHearts;
      if (cell === 2) {
        audio.playMatchChime();
        nextCollected = collectedHearts + 1;
        setCollectedHearts(nextCollected);
        setMazeGrid((prev) => {
          const updated = prev.map((row) => [...row]);
          updated[nr][nc] = 0; // consumed
          return updated;
        });
        setMazeWarning(null);
      }

      // Reached the King at cell === 3
      if (cell === 3) {
        if (nextCollected >= pattern.totalStars) {
          // Success! Trigger Supergirl popup!
          audio.playSupergirlFanfare();
          setPlayerPos({ r: nr, c: nc });
          setLevel3Status('supergirl');
          return;
        } else {
          // Premature: King is trapped in stasis!
          audio.playMismatch();
          setPlayerPos({ r: nr, c: nc });
          setMazeWarning(`🔒 The King is sealed in an astral stasis! You gathered only ${nextCollected} of ${pattern.totalStars} stars. You must collect all stars to break the seal!`);
          if (nextSteps >= pattern.maxSteps) {
            audio.playMismatch();
            setLevel3Status('gameover');
          }
          return;
        }
      }

      setPlayerPos({ r: nr, c: nc });

      // Step limit check
      if (nextSteps >= pattern.maxSteps) {
        audio.playMismatch();
        setLevel3Status('gameover');
      }
    },
    [stage, level3Status, selectedPatternIndex, playerPos, mazeGrid, stepsTaken, collectedHearts]
  );

  // Keyboard navigation for Level 3
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (stage !== 'level3') return;
      if (e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        movePlayer(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        movePlayer(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        movePlayer(0, -1);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        movePlayer(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, movePlayer]);

  // ----------------------------------------
  // GRAND FINALE SEQUENCE
  // ----------------------------------------
  const triggerGrandFinale = () => {
    setStage('transition');
    audio.stopSuspense();

    // 1-second suspenseful dramatic hush
    setTimeout(() => {
      setStage('finale');
      audio.startRomanticMusic();
    }, 1100);
  };

  const handleRestart = () => {
    audio.stopRomanticMusic();
    audio.startSuspense();
    setStage('intro');
    resetLevel3(0);
    setTumblerDigits(['0', '0', '0', '0']);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between text-white font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Dynamic Starfield canvas */}
      <Starfield />

      {/* Confetti explosion upon reaching finale or supergirl celebration */}
      {(stage === 'finale' || level3Status === 'supergirl') && <ConfettiCanvas />}

      {/* Header Bar */}
      <header className="relative z-20 w-full max-w-4xl px-4 py-5 flex items-center justify-between border-b border-pink-500/20 backdrop-blur-md bg-black/20">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
          <span className="font-serif tracking-widest text-lg md:text-xl font-bold bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">
            OUR JOURNEY
          </span>
        </div>

        {/* Level Tracker & Audio toggle */}
        <div className="flex items-center space-x-3">
          {stage !== 'intro' && stage !== 'finale' && (
            <div className="flex items-center space-x-1.5 text-xs tracking-wider uppercase bg-pink-950/60 border border-pink-500/30 px-3 py-1.5 rounded-full">
              <span className={stage === 'level1' ? 'text-pink-400 font-bold' : 'text-gray-400'}>I. Memories</span>
              <span className="text-pink-600">→</span>
              <span className={stage === 'level2' ? 'text-pink-400 font-bold' : 'text-gray-400'}>II. Cipher</span>
              <span className="text-pink-600">→</span>
              <span className={stage === 'level3' ? 'text-pink-400 font-bold' : 'text-gray-400'}>III. Reunion</span>
            </div>
          )}

          <button
            onClick={handleToggleMute}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors border border-white/15"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-gray-400" /> : <Volume2 className="w-4 h-4 text-pink-300" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`relative z-10 flex-1 w-full ${stage === 'finale' ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl'} flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-300`}>
        {/* ================= STAGE 0: INTRO SCREEN ================= */}
        {stage === 'intro' && (
          <div className="w-full max-w-xl text-center space-y-8 p-8 md:p-12 rounded-3xl bg-neutral-900/60 border border-pink-500/30 backdrop-blur-xl shadow-2xl shadow-pink-950/50 animate-fade-in">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-b from-pink-500/20 to-purple-500/10 border border-pink-500/40">
              <Sparkles className="w-10 h-10 text-pink-400 animate-spin-slow" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl font-serif font-extrabold tracking-tight bg-gradient-to-r from-pink-200 via-rose-100 to-amber-100 bg-clip-text text-transparent">
                A Mystery of Us
              </h1>
              <p className="text-sm md:text-base text-pink-200/80 leading-relaxed font-light">
                Today marks another year together. But our happiest memories have been sealed behind three ancient
                enchanted locks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs md:text-sm text-pink-200/90 flex items-center justify-center space-x-2">
              <Music className="w-4 h-4 text-pink-400 shrink-0" />
              <span>For the best atmospheric experience, put on your headphones.</span>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold tracking-wider text-white shadow-lg shadow-pink-600/40 transform active:scale-95 transition-all flex items-center justify-center space-x-3 group"
            >
              <span>Unlock Level 1</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* ================= LEVEL 1: MEMORY MATCH ================= */}
        {stage === 'level1' && (
          <div className="w-full max-w-2xl space-y-6 text-center animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs tracking-widest text-pink-400 uppercase font-semibold">Level 1 of 3</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-rose-100">The Vault of Firsts</h2>
              <p className="text-xs md:text-sm text-pink-200/70">
                Match all our milestones to open the lock. (Pairs matched: {matchedIds.length} / {memoryIcons.length})
              </p>
            </div>

            {/* 3x4 Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4 p-4 md:p-6 rounded-2xl bg-neutral-900/60 border border-pink-500/25 backdrop-blur-xl shadow-xl">
              {cards.map((card, idx) => {
                const isFlipped = flippedIndices.includes(idx) || matchedIds.includes(card.id);
                const isMatched = matchedIds.includes(card.id);

                return (
                  <button
                    key={card.uniqueKey}
                    onClick={() => handleCardClick(idx)}
                    disabled={isFlipped || isCheckingMatch}
                    className={`relative aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all duration-300 transform select-none ${isFlipped
                      ? isMatched
                        ? 'bg-gradient-to-br from-pink-900/80 to-purple-900/80 border-pink-400 shadow-lg shadow-pink-500/20 scale-95'
                        : 'bg-neutral-800/90 border-pink-500'
                      : 'bg-neutral-950/80 hover:bg-neutral-900 border-white/10 hover:border-pink-500/50 hover:scale-[1.02]'
                      } border`}
                  >
                    {isFlipped ? (
                      <div className="flex flex-col items-center justify-center space-y-1 animate-scale-up">
                        <span className="text-3xl md:text-4xl">{card.emoji}</span>
                        <span className="text-[10px] md:text-xs text-pink-200/90 font-medium tracking-tight">
                          {card.label}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <Lock className="w-5 h-5 text-pink-400/50" />
                        <span className="text-[10px] text-pink-400/40 font-mono">UNLOCK</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= LEVEL 2: MILESTONE CIPHER ================= */}
        {stage === 'level2' && (
          <div className="w-full max-w-lg space-y-8 text-center animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs tracking-widest text-pink-400 uppercase font-semibold">Level 2 of 3</span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-rose-100">The Secret Date Cipher</h2>
              <p className="text-xs md:text-sm text-pink-200/70">
                Turn the tumblers to align the 4 digits that hold the key to our story.
              </p>
            </div>

            {/* Tactile Combination Pad */}
            <div className="p-8 rounded-3xl bg-neutral-900/70 border border-pink-500/30 backdrop-blur-xl shadow-2xl space-y-8">
              <div className="flex justify-center items-center space-x-3 md:space-x-5">
                {tumblerDigits.map((digit, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-2">
                    <button
                      onClick={() => rotateTumbler(idx, 'up')}
                      className="p-2 rounded-lg bg-pink-950/50 hover:bg-pink-900/70 text-pink-300 border border-pink-500/30 active:scale-90 transition-all"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>

                    <div className="w-14 h-20 md:w-16 md:h-24 rounded-2xl bg-gradient-to-b from-neutral-950 to-neutral-900 border-2 border-pink-500/40 flex items-center justify-center shadow-inner">
                      <span className="font-mono text-3xl md:text-4xl font-extrabold text-pink-100 tracking-wider">
                        {digit}
                      </span>
                    </div>

                    <button
                      onClick={() => rotateTumbler(idx, 'down')}
                      className="p-2 rounded-lg bg-pink-950/50 hover:bg-pink-900/70 text-pink-300 border border-pink-500/30 active:scale-90 transition-all"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Clue Prompt */}
              <div className="p-3.5 rounded-xl bg-pink-950/30 border border-pink-500/20 text-xs text-pink-200/80">
                💡 <span className="font-semibold text-pink-300">Riddle:</span> "Two answers hide in these lines: a number and a name.

                The number: start with 1 and double it five times, then give one back. It is also the eleventh among the numbers that refuse to be divided.

                The name: my neighbours’ names mean seven and nine, yet neither stands where its name claims. I sit between them.

                Put them side by side, and you’ll have what I’m hiding."
              </div>

              {cipherError && (
                <p className="text-xs text-rose-400 font-mono tracking-wider animate-bounce">
                  ⚠️ The tumbler didn't budge. Re-read the riddle closely!
                </p>
              )}

              <button
                onClick={verifyCipher}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold tracking-wider text-white shadow-lg shadow-pink-600/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <Unlock className="w-5 h-5" />
                <span>Pull Vault Handle</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= LEVEL 3: CELESTIAL MAZE ================= */}
        {stage === 'level3' && (
          <div className="w-full max-w-xl space-y-5 text-center animate-fade-in relative">
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-xs tracking-widest text-pink-400 uppercase font-semibold">
                Level 3 of 3 • {currentPattern.difficulty}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-rose-100">Crossing The Cosmos</h2>
              <p className="text-xs text-pink-200/70">
                Collect all {currentPattern.totalStars} sacred star shards and reach your King before his vital spark expires.
              </p>
            </div>

            {/* Gravity Crisis Alert Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-950/70 via-purple-950/50 to-pink-950/70 border border-rose-500/30 text-xs md:text-sm text-pink-200/90 flex items-center justify-between shadow-lg shadow-rose-950/40">
              <div className="flex items-center space-x-2.5 text-left">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 animate-pulse" />
                <span className="leading-snug">
                  <strong className="text-rose-300">Gravity Alert:</strong> Take each step carefully to save your King! With every wrong step, he slips closer to death in the astral void.
                </span>
              </div>
            </div>

            {/* Pattern Switcher & Quick Reset */}
            <div className="flex items-center justify-between w-full flex-wrap gap-2 pt-1">
              <div className="flex items-center space-x-2">
                {MAZE_PATTERNS.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => resetLevel3(idx)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedPatternIndex === idx
                      ? 'bg-pink-600/80 border-pink-400 text-white font-semibold shadow-md shadow-pink-500/30 scale-105'
                      : 'bg-neutral-900/60 border-white/10 text-pink-200/60 hover:text-white hover:border-pink-500/30'
                      }`}
                  >
                    {p.name.split(':')[0]} ({p.maxSteps} max steps)
                  </button>
                ))}
              </div>

              <button
                onClick={() => resetLevel3(selectedPatternIndex)}
                className="inline-flex items-center space-x-1.5 text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-pink-200 transition-all active:scale-95"
                title="Restart Pattern"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>

            {/* HUD Status Dashboard */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-neutral-900/70 border border-pink-500/25 backdrop-blur-xl">
              {/* Stars Score */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-pink-500/15">
                <div className="flex items-center space-x-1 text-amber-300">
                  <Star className="w-4 h-4 fill-amber-300 animate-pulse" />
                  <span className="font-mono font-bold text-sm md:text-base text-amber-200">
                    {collectedHearts} / {currentPattern.totalStars}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-pink-300/70 font-semibold mt-0.5">
                  Stars Collected
                </span>
                {/* Visual mini stars */}
                <div className="flex space-x-1 mt-1">
                  {Array.from({ length: currentPattern.totalStars }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-[10px] transition-all ${i < collectedHearts ? 'text-amber-300 scale-110 drop-shadow-[0_0_4px_rgba(251,191,36,0.8)]' : 'text-neutral-600'
                        }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {/* Step Counter */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-pink-500/15">
                <span className="font-mono font-bold text-sm md:text-base text-pink-100">
                  {stepsTaken} <span className="text-xs text-pink-400/60 font-normal">/ {currentPattern.maxSteps}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-pink-300/70 font-semibold mt-0.5">
                  Steps Taken
                </span>
                <span className="text-[10px] font-mono text-pink-300/90 mt-1">
                  {Math.max(0, currentPattern.maxSteps - stepsTaken)} left
                </span>
              </div>

              {/* King's Vitality Pulse */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-black/40 border border-pink-500/15">
                {(() => {
                  const maxSteps = currentPattern.maxSteps;
                  const remaining = Math.max(0, maxSteps - stepsTaken);
                  const vitalityPercent = Math.max(0, Math.round((remaining / maxSteps) * 100));
                  return (
                    <>
                      <div className="flex items-center space-x-1">
                        <Heart
                          className={`w-4 h-4 ${vitalityPercent <= 25
                            ? 'text-red-500 fill-red-500 animate-ping'
                            : 'text-pink-400 fill-pink-400 animate-pulse'
                            }`}
                        />
                        <span
                          className={`font-mono font-bold text-sm md:text-base ${vitalityPercent > 50
                            ? 'text-emerald-300'
                            : vitalityPercent > 25
                              ? 'text-amber-300'
                              : 'text-rose-400 animate-pulse'
                            }`}
                        >
                          {vitalityPercent}%
                        </span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-pink-300/70 font-semibold mt-0.5">
                        King's Vitality
                      </span>
                      <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden mt-1.5 border border-white/10">
                        <div
                          className={`h-full transition-all duration-300 ${vitalityPercent > 50
                            ? 'bg-gradient-to-r from-emerald-400 to-pink-500'
                            : vitalityPercent > 25
                              ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                              : 'bg-gradient-to-r from-rose-600 to-red-600'
                            }`}
                          style={{ width: `${vitalityPercent}%` }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Warning notification when reaching King prematurely */}
            {mazeWarning && (
              <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/40 text-xs md:text-sm text-amber-200 animate-bounce flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/50">
                <span>{mazeWarning}</span>
              </div>
            )}

            {/* Maze Grid Display */}
            <div className="p-4 md:p-6 rounded-3xl bg-neutral-900/80 border border-pink-500/30 backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-4">
              <div
                className="inline-grid gap-1.5 md:gap-2 p-2 bg-black/60 rounded-2xl border border-pink-900/40"
                style={{
                  gridTemplateColumns: `repeat(${mazeGrid[0]?.length || 8}, minmax(0, 1fr))`,
                }}
              >
                {mazeGrid.map((row, rIdx) =>
                  row.map((cell, cIdx) => {
                    const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
                    const isWall = cell === 1;
                    const isHeart = cell === 2;
                    const isGoal = cell === 3;

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`w-8 h-8 md:w-11 md:h-11 rounded-lg flex items-center justify-center transition-colors text-sm md:text-lg select-none relative ${isWall
                          ? 'bg-neutral-950/90 border border-white/5 text-transparent shadow-inner'
                          : isPlayer
                            ? 'bg-pink-600/90 border-2 border-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.8)] z-10'
                            : isGoal
                              ? collectedHearts >= currentPattern.totalStars
                                ? 'bg-amber-950/70 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                                : 'bg-neutral-950/70 border border-pink-900/30'
                              : 'bg-neutral-950/60 border border-pink-900/20'
                          }`}
                      >
                        {isPlayer ? (
                          <span className="animate-bounce">💖</span>
                        ) : isGoal ? (
                          <div className="flex flex-col items-center">
                            <span className={collectedHearts >= currentPattern.totalStars ? 'animate-bounce' : 'opacity-80'}>
                              👑
                            </span>
                            {collectedHearts < currentPattern.totalStars && (
                              <Lock className="w-2.5 h-2.5 text-pink-400/80 absolute bottom-0.5" />
                            )}
                          </div>
                        ) : isHeart ? (
                          <span className="text-sm md:text-base animate-pulse">✨</span>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Directional Controls */}
              <div className="flex flex-col items-center space-y-2 pt-1">
                <button
                  onClick={() => movePlayer(-1, 0)}
                  className="w-12 h-12 rounded-xl bg-pink-950/60 hover:bg-pink-900 border border-pink-500/30 flex items-center justify-center text-pink-200 active:scale-90 transition-all shadow-md hover:border-pink-400"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => movePlayer(0, -1)}
                    className="w-12 h-12 rounded-xl bg-pink-950/60 hover:bg-pink-900 border border-pink-500/30 flex items-center justify-center text-pink-200 active:scale-90 transition-all shadow-md hover:border-pink-400"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => movePlayer(1, 0)}
                    className="w-12 h-12 rounded-xl bg-pink-950/60 hover:bg-pink-900 border border-pink-500/30 flex items-center justify-center text-pink-200 active:scale-90 transition-all shadow-md hover:border-pink-400"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => movePlayer(0, 1)}
                    className="w-12 h-12 rounded-xl bg-pink-950/60 hover:bg-pink-900 border border-pink-500/30 flex items-center justify-center text-pink-200 active:scale-90 transition-all shadow-md hover:border-pink-400"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ================= YOU ARE A SUPERGIRL POPUP MODAL ================= */}
            {level3Status === 'supergirl' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
                <div className="w-full max-w-lg p-6 md:p-10 rounded-3xl bg-gradient-to-b from-neutral-900/95 via-purple-950/90 to-neutral-900/95 border-2 border-pink-400/60 shadow-[0_0_60px_rgba(244,63,94,0.4)] text-center space-y-6 animate-scale-up relative">
                  {/* Superhero Crown Badge */}
                  <div className="relative inline-block">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-300 flex items-center justify-center shadow-xl shadow-pink-500/50 text-4xl">
                      👑
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-2xl animate-bounce">🦸‍♀️</span>
                    <Sparkles className="absolute -top-2 -left-2 w-8 h-8 text-amber-300 animate-spin-slow" />
                  </div>

                  {/* Title & Headline */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/30 to-amber-500/30 border border-pink-400/40 text-xs font-mono tracking-widest text-pink-200 font-bold uppercase shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Cosmic Heroine of My Heart</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </div>

                    <h2 className="text-3xl md:text-5xl font-serif font-extrabold bg-gradient-to-r from-pink-200 via-rose-100 to-amber-200 bg-clip-text text-transparent drop-shadow-md">
                      YOU ARE A SUPERGIRL!
                    </h2>
                    <p className="text-sm md:text-base text-pink-200/90 font-medium">
                      You gathered all {currentPattern.totalStars}/{currentPattern.totalStars} stars and saved your King in {stepsTaken} steps!
                    </p>
                  </div>

                  {/* Emotional Narrative Card */}
                  {/* <div className="p-4 md:p-5 rounded-2xl bg-pink-950/40 border border-pink-500/30 text-xs md:text-sm text-pink-100/90 leading-relaxed font-serif text-left space-y-2 shadow-inner">
                    <p>
                      When the void threatened to extinguish my spark, you didn't hesitate. With unwavering resolve and brilliant precision, you conquered the maze, broke the ancient seal, and saved me just in time.
                    </p>
                    <p className="text-amber-200 font-sans text-xs font-semibold">
                      ✨ You truly are the superhero of my life, now and forever.
                    </p>
                  </div> */}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 text-left">
                    <div className="p-3 rounded-xl bg-black/50 border border-pink-500/20">
                      <span className="text-[10px] text-pink-300/70 uppercase block font-mono">Stars</span>
                      <span className="text-sm font-bold text-amber-300 font-mono">
                        {collectedHearts} / {currentPattern.totalStars} ⭐
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-pink-500/20">
                      <span className="text-[10px] text-pink-300/70 uppercase block font-mono">Steps Taken</span>
                      <span className="text-sm font-bold text-pink-200 font-mono">
                        {stepsTaken} <span className="text-[10px] text-pink-400 font-normal">(Opt: {currentPattern.minOptimalSteps})</span>
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/50 border border-pink-500/20">
                      <span className="text-[10px] text-pink-300/70 uppercase block font-mono">King Saved</span>
                      <span className="text-sm font-bold text-emerald-300 font-mono">
                        {Math.max(0, Math.round(((currentPattern.maxSteps - stepsTaken) / currentPattern.maxSteps) * 100))}% ❤️
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <button
                      onClick={() => {
                        setLevel3Status('playing');
                        triggerGrandFinale();
                      }}
                      className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-semibold tracking-wider text-white shadow-lg shadow-pink-600/40 transform active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm md:text-base"
                    >
                      <span>Read Your King's Secret Letter 💌</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => resetLevel3(selectedPatternIndex)}
                      className="inline-flex items-center space-x-2 py-2 px-4 rounded-full text-xs text-pink-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Replay To Master Route</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= GAME OVER: THE KING HAS FALLEN ================= */}
            {level3Status === 'gameover' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
                <div className="w-full max-w-md p-6 md:p-8 rounded-3xl bg-neutral-950 border-2 border-rose-600/50 shadow-[0_0_50px_rgba(225,29,72,0.4)] text-center space-y-5 animate-scale-up">
                  <div className="w-16 h-16 mx-auto rounded-full bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-3xl animate-pulse">
                    🥀
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-rose-200">
                      The King Has Fallen Into The Void
                    </h3>
                    <p className="text-xs md:text-sm text-pink-200/80 leading-relaxed">
                      You exceeded the step limit ({currentPattern.maxSteps}/{currentPattern.maxSteps} steps). His astral life force reached 0% and the celestial portal collapsed.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-rose-500/20 text-xs text-rose-300 font-mono">
                    Stars Gathered: {collectedHearts}/{currentPattern.totalStars} • Steps Taken: {stepsTaken}/{currentPattern.maxSteps}
                  </div>

                  <p className="text-xs text-pink-300/70 italic">
                    "Take each step carefully and save your King — true love never gives up!"
                  </p>

                  <button
                    onClick={() => resetLevel3(selectedPatternIndex)}
                    className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 font-semibold tracking-wider text-white shadow-lg shadow-rose-600/40 active:scale-95 transition-all flex items-center justify-center space-x-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Rewind Time & Save Him</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= 1-SECOND SUSPENSE DRAMATIC HUSH ================= */}
        {stage === 'transition' && (
          <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
            <Heart className="w-16 h-16 text-pink-500 fill-pink-500" />
            <span className="font-serif tracking-widest text-lg text-pink-200/80">
              The stars are realigning...
            </span>
          </div>
        )}

        {/* ================= GRAND FINALE: HAPPILY EVER AFTER ================= */}
        {stage === 'finale' && (
          <div className="w-full max-w-4xl lg:max-w-5xl xl:max-w-6xl text-center space-y-2.5 sm:space-y-3 p-1 sm:p-2 my-auto animate-scale-up">
            {/* Header banner */}
            <div className="flex items-center justify-center space-x-2.5 pt-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-md shadow-pink-500/50 shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white animate-pulse" />
              </div>
              <div>
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-widest text-pink-300/80 font-semibold text-left">
                  You Made It To Me
                </span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold bg-gradient-to-r from-pink-200 via-rose-100 to-amber-200 bg-clip-text text-transparent">
                  Happy Anniversary, My Love!
                </h2>
              </div>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow shrink-0 hidden sm:block" />
            </div>

            {/* ================= ANCIENT PARCHMENT SCROLL LETTER ================= */}
            <div className="relative w-full px-1 sm:px-3 pt-0">
              {/* Top Wooden Scroll Roller */}
              <ScrollRoller isTop={true} />

              {/* The Parchment Scroll Sheet */}
              <div
                className="parchment-paper relative z-10 mx-2 sm:mx-6 px-5 sm:px-10 md:px-14 py-3.5 sm:py-5 text-left rounded-sm transition-all shadow-2xl"
                style={{
                  borderLeft: '3px solid rgba(115, 65, 25, 0.45)',
                  borderRight: '3px solid rgba(115, 65, 25, 0.45)',
                }}
              >
                {/* Vintage vignette overlays on left and right borders for deckled feel */}
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-[#7a411a]/25 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-[#7a411a]/25 to-transparent pointer-events-none" />

                {/* Royal Wax Seal watermark at top center */}
                <div className="flex justify-center mb-2 sm:mb-2.5">
                  <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#7a1c29]/95 via-[#9e2235]/95 to-[#7a1c29]/95 border border-[#c4495e]/60 shadow-md text-[#fdebd0]">
                    <Crown className="w-3 h-3 text-amber-300" />
                    <span className="font-serif text-[10px] sm:text-[11px] uppercase tracking-widest font-semibold">
                      Royal Decree • Year VI
                    </span>
                    <Sparkles className="w-3 h-3 text-amber-300" />
                  </div>
                </div>

                {/* Letter Content in Ancient Cursive Scribble Typography */}
                <div className="space-y-2 sm:space-y-2.5 font-scribble text-[#2b1406] text-lg sm:text-xl md:text-[21px] leading-relaxed sm:leading-[1.65] selection:bg-amber-300/60 selection:text-[#2b1406]">
                  <p className="font-bold text-xl sm:text-2xl text-[#1f0d04] tracking-wide">
                    Hi, my Queen,
                  </p>

                  <p>
                    I always knew I could count on you. The effort you put into clearing every challenge to rescue me tells me you would go through heaven and hell to find me and love me. Six years, huh? Six years of you putting up with my nonsense, my whims, and my made-up stories, and still accepting me exactly as I am. You love me with all my flaws, you care for me, and you keep reassuring me that the love that is meant to stay will stay, no matter what. I am still amazed that you have stayed this long. Hundreds of fights, dozens of blocks, and countless breakups later, here we are celebrating our sixth anniversary, and we will go all the way to our sixtieth.
                  </p>

                  <p>
                    You taught me that a relationship doesn’t have to be perfect or flawless. It can have all its imperfections and flaws, as long as two people keep choosing each other. Then no challenge is too big, no riddle too hard to solve, and no path too hard to take. Be with me now, tomorrow, and always. I love you so, so, sooo much.💕
                  </p>

                  {/* Sign-off & Seal */}
                  <div className="pt-2 sm:pt-2.5 flex items-center justify-between border-t border-[#8f5223]/25 mt-2.5 sm:mt-3">
                    <div className="flex items-center space-x-2 opacity-85">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#6e1522] to-[#a82438] border border-[#d48995] shadow-md flex items-center justify-center text-xs text-[#fae4ba] font-serif">
                        ❤️
                      </div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#6e3c1b] font-sans font-semibold">
                        Sealed Forever
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] sm:text-[11px] uppercase tracking-widest text-[#7a401c] font-sans font-semibold mb-0.5">
                        Forever & Always,
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-[#691823] font-scribble">
                        Cutu King ❤️
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Wooden Scroll Roller */}
              <ScrollRoller isTop={false} />
            </div>

            {/* Replay Button */}
            <div className="pt-1">
              <button
                onClick={handleRestart}
                className="inline-flex items-center space-x-2 py-2 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs tracking-wider uppercase text-pink-200 font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Our Adventure</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-4xl py-4 text-center text-[11px] text-pink-300/40 tracking-wider">
        Crafted with love for our special day ✨
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
      `}</style>
    </div>
  );
}