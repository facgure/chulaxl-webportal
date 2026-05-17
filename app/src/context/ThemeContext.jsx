import { createContext, useContext, useState, useEffect } from 'react';

const PALETTES = [
  ['#E5007A', '#7A0040', '#FFF1F7'],
  ['#5B21B6', '#312E81', '#F5F3FF'],
  ['#0F766E', '#134E4A', '#F0FDFA'],
  ['#1F2937', '#0F172A', '#F8FAFC'],
];

const DEFAULTS = { vibe: 'modern', palette: PALETTES[0], rhythm: 'default' };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [vibe, setVibe] = useState(DEFAULTS.vibe);
  const [palette, setPalette] = useState(DEFAULTS.palette);
  const [rhythm, setRhythm] = useState(DEFAULTS.rhythm);

  useEffect(() => {
    const [p500, p700, p50] = palette;
    const root = document.documentElement.style;
    root.setProperty('--pink-500', p500);
    root.setProperty('--pink-700', p700);
    root.setProperty('--pink-50', p50);
    root.setProperty('--pink-100', `color-mix(in oklab, ${p500} 14%, white)`);
    root.setProperty('--pink-200', `color-mix(in oklab, ${p500} 30%, white)`);
    root.setProperty('--pink-300', `color-mix(in oklab, ${p500} 50%, white)`);
    root.setProperty('--pink-600', `color-mix(in oklab, ${p500} 88%, black)`);
    root.setProperty('--pink-900', `color-mix(in oklab, ${p700} 70%, black)`);
  }, [palette]);

  useEffect(() => { document.body.dataset.vibe = vibe; }, [vibe]);
  useEffect(() => { document.body.dataset.rhythm = rhythm; }, [rhythm]);

  return (
    <ThemeContext.Provider value={{ vibe, setVibe, palette, setPalette, rhythm, setRhythm, PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
