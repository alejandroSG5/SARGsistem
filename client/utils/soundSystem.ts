
// Simple sound synthesizer to avoid external dependencies (404s)
const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
const ctx = new AudioContextClass();

const playTone = (freq: number, type: OscillatorType, duration: number, delay: number = 0, vol: number = 0.1) => {
    if(ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
};

export const SoundEffects = {
    click: () => playTone(800, 'sine', 0.1, 0, 0.05),
    success: () => {
        playTone(600, 'sine', 0.1, 0, 0.1);
        playTone(800, 'sine', 0.2, 0.1, 0.1);
    },
    error: () => {
        playTone(300, 'sawtooth', 0.2, 0, 0.1);
        playTone(200, 'sawtooth', 0.3, 0.1, 0.1);
    },
    notification: () => { // Soft cute notification
        playTone(1200, 'sine', 0.1, 0, 0.05);
        playTone(1600, 'sine', 0.3, 0.1, 0.05);
    },
    alarm: (type: string) => {
        if (type === 'radar') {
            // Urgent beep
            for(let i=0; i<4; i++) playTone(1500, 'square', 0.1, i*0.2, 0.2);
        } else if (type === 'soft') {
            // Gentle chime
            playTone(600, 'sine', 0.5, 0, 0.1);
            playTone(800, 'sine', 0.5, 0.2, 0.1);
            playTone(1000, 'sine', 1.0, 0.4, 0.1);
        } else if (type === 'classic') {
            // Digital watch
            playTone(3000, 'square', 0.1, 0, 0.1);
            playTone(3000, 'square', 0.1, 0.15, 0.1);
        }
    }
};
