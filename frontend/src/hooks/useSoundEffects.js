import { useState, useCallback, useEffect } from "react";

/**
 * useSoundEffects — Web Audio API synthesized sound effects engine.
 * No external MP3 files required!
 *
 * Supported sounds: 'send', 'receive', 'error', 'toast', 'click'
 */
export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem("relay_sound_muted") === "true";
  });

  useEffect(() => {
    localStorage.setItem("relay_sound_muted", isMuted ? "true" : "false");
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const playSound = useCallback(
    (type) => {
      if (isMuted) return;

      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === "send") {
          // Subtle upward sweep (whoosh)
          osc.type = "sine";
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(640, now + 0.12);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.start(now);
          osc.stop(now + 0.12);
        } else if (type === "receive") {
          // Double chime (pleasing agent arrival tone)
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, now); // C5
          osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.25);
        } else if (type === "error") {
          // Low warning boop
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(140, now + 0.2);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        } else if (type === "toast" || type === "click") {
          // Soft pop
          osc.type = "sine";
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.start(now);
          osc.stop(now + 0.05);
        }
      } catch {
        // Ignore audio context errors if browser blocks autoplay
      }
    },
    [isMuted]
  );

  return { isMuted, toggleMute, playSound };
}
