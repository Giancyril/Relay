/**
 * SoundEffectsContext — provides playSound() and mute controls globally.
 *
 * Usage:
 *   const { playSound, isMuted, toggleMute } = useSoundContext();
 *   playSound("send");   // send | receive | error | toast | click
 */
import { createContext, useContext } from "react";
import { useSoundEffects } from "../hooks/useSoundEffects";

const SoundContext = createContext(null);

export function SoundEffectsProvider({ children }) {
  const { isMuted, toggleMute, playSound } = useSoundEffects();

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundContext() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSoundContext must be used inside <SoundEffectsProvider>");
  return ctx;
}
