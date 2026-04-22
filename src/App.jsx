import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings, X, Clock } from 'lucide-react';

// Web Audio API를 이용한 귀여운 알람 소리 생성기
const playAlarmSound = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const playBeep = (freq, startTime, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + duration / 2);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const now = ctx.currentTime;
  // 띠-딩! 하는 귀여운 2단 알람음
  playBeep(600, now, 0.15);
  playBeep(900, now + 0.2, 0.3);
};

const DEFAULT_PRESETS = [
  { focus: 10, break: 2 },
  { focus: 15, break: 3 },
  { focus: 25, break: 5 }
];

function App() {
  const [focusDuration, setFocusDuration] = useState(10 * 60);
  const [breakDuration, setBreakDuration] = useState(2 * 60);
  
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // 'focus' | 'break'
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsFocus, setSettingsFocus] = useState(10);
  const [settingsBreak, setSettingsBreak] = useState(2);

  const [recentPresets, setRecentPresets] = useState(DEFAULT_PRESETS);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Time is up!
      playAlarmSound();
      
      if (mode === 'focus') {
        setMode('break');
        setTimeLeft(breakDuration);
      } else {
        setMode('focus');
        setTimeLeft(focusDuration);
      }
      setIsActive(false); // auto-pause when switching modes
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, focusDuration, breakDuration]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'focus' ? focusDuration : breakDuration);
  };

  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'focus' ? focusDuration : breakDuration);
  };

  const handleApplyPreset = (p) => {
    setSettingsFocus(p.focus);
    setSettingsBreak(p.break);
  };

  const saveSettings = () => {
    const newFocus = settingsFocus * 60;
    const newBreak = settingsBreak * 60;
    setFocusDuration(newFocus);
    setBreakDuration(newBreak);
    
    // 프리셋 배열 업데이트 (최근 설정값을 맨 앞으로, 중복 제거, 최대 3개 유지)
    setRecentPresets(prev => {
      const newPreset = { focus: settingsFocus, break: settingsBreak };
      const filtered = prev.filter(p => !(p.focus === settingsFocus && p.break === settingsBreak));
      return [newPreset, ...filtered].slice(0, 3);
    });

    // Update current timer if it's not active
    setIsActive(false);
    if (mode === 'focus') {
      setTimeLeft(newFocus);
    } else {
      setTimeLeft(newBreak);
    }
    setIsSettingsOpen(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isFocus = mode === 'focus';
  const bgColor = isFocus ? 'bg-rose-500/20' : 'bg-emerald-500/20';
  const textColor = isFocus ? 'text-rose-400' : 'text-emerald-400';
  const buttonColor = isFocus ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600';
  const ringColor = isFocus ? 'ring-rose-500' : 'ring-emerald-500';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-rose-500/30 transition-colors duration-500 relative">
      
      {/* 귀여운 코다리 부장 타이틀 영역 */}
      <div className="mb-12 text-center animate-bounce-soft">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
          {isFocus ? <Brain className={textColor} size={32} /> : <Coffee className={textColor} size={32} />}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
            코다리 뽀모도로
          </span>
        </h1>
        <p className="text-slate-400 text-sm font-medium">
          {isFocus ? '집중할 시간입니다 대표님! 🚀' : '휴식도 실력입니다! 커피 한잔 하십시오 ☕'}
        </p>
      </div>

      {/* 메인 타이머 카드 */}
      <div className={`relative p-8 sm:p-12 rounded-[3rem] ${bgColor} border border-white/5 shadow-2xl backdrop-blur-xl transition-all duration-500 w-full max-w-md`}>
        
        {/* 설정 버튼 */}
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors duration-300 focus:outline-none"
          title="시간 설정"
        >
          <Settings size={24} className="hover:rotate-90 transition-transform duration-500" />
        </button>

        {/* 모드 전환 탭 */}
        <div className="flex bg-slate-900/50 rounded-full p-1.5 mb-8 w-full max-w-[240px] mx-auto border border-white/5 mt-4 sm:mt-0">
          <button
            onClick={() => switchMode('focus')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              isFocus ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            집중 ({focusDuration / 60}분)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              !isFocus ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            휴식 ({breakDuration / 60}분)
          </button>
        </div>

        {/* 타이머 디스플레이 */}
        <div className="flex justify-center items-center mb-10">
          <div className={`text-8xl sm:text-9xl font-black tracking-tighter ${textColor} drop-shadow-lg font-mono tabular-nums transition-colors duration-500`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleTimer}
            className={`flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] text-white shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-900 ${buttonColor} ${ringColor}`}
          >
            {isActive ? (
              <Pause size={36} fill="currentColor" className="opacity-90" />
            ) : (
              <Play size={36} fill="currentColor" className="ml-2 opacity-90" />
            )}
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[1.5rem] bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-offset-slate-900 focus:ring-slate-700"
            title="초기화"
          >
            <RotateCcw size={24} className="opacity-80" />
          </button>
        </div>
      </div>

      {/* 설정 모달창 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings size={20} className="text-slate-400" />
                시간 맞춤 설정
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 최근 설정값 (프리셋) 영역 */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1 uppercase tracking-wider">
                <Clock size={14} /> 추천 및 최근 설정
              </label>
              <div className="grid grid-cols-3 gap-2">
                {recentPresets.map((preset, idx) => {
                  const isSelected = preset.focus === settingsFocus && preset.break === settingsBreak;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleApplyPreset(preset)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                        isSelected 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-inner' 
                          : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      {preset.focus}분 / {preset.break}분
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-rose-300 mb-2">직접 입력 : 집중 시간 (분)</label>
                <input 
                  type="number" 
                  min="1"
                  value={settingsFocus}
                  onChange={(e) => setSettingsFocus(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-300 mb-2">직접 입력 : 휴식 시간 (분)</label>
                <input 
                  type="number" 
                  min="1"
                  value={settingsBreak}
                  onChange={(e) => setSettingsBreak(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow font-mono"
                />
              </div>
            </div>

            <button 
              onClick={saveSettings}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-black/20"
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
