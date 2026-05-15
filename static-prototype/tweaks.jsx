// Tweaks for ChulaXL — three expressive controls that reshape feel.
// Loaded via <script type="text/babel" src="tweaks.jsx"></script> after tweaks-panel.jsx.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "vibe": "modern",
  "palette": ["#E5007A", "#7A0040", "#FFF1F7"],
  "rhythm": "default"
}/*EDITMODE-END*/;

const PALETTES = [
  // [primary-500, primary-700, primary-50]
  ["#E5007A", "#7A0040", "#FFF1F7"],  // Chula pink (default brand)
  ["#5B21B6", "#312E81", "#F5F3FF"],  // Royal purple (Chula emblem deep)
  ["#0F766E", "#134E4A", "#F0FDFA"],  // Forest teal
  ["#1F2937", "#0F172A", "#F8FAFC"],  // Charcoal mono
];

function applyPalette(palette) {
  const [p500, p700, p50] = palette;
  const root = document.documentElement.style;
  root.setProperty("--pink-500", p500);
  root.setProperty("--pink-700", p700);
  root.setProperty("--pink-50", p50);
  // Derive intermediate shades using color-mix
  root.setProperty("--pink-100", `color-mix(in oklab, ${p500} 14%, white)`);
  root.setProperty("--pink-200", `color-mix(in oklab, ${p500} 30%, white)`);
  root.setProperty("--pink-300", `color-mix(in oklab, ${p500} 50%, white)`);
  root.setProperty("--pink-600", `color-mix(in oklab, ${p500} 88%, black)`);
  root.setProperty("--pink-900", `color-mix(in oklab, ${p700} 70%, black)`);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    applyPalette(t.palette);
  }, [t.palette]);

  React.useEffect(() => {
    document.body.dataset.vibe = t.vibe;
  }, [t.vibe]);

  React.useEffect(() => {
    document.body.dataset.rhythm = t.rhythm;
  }, [t.rhythm]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Vibe" hint="Reshape the typographic mood across the page" />
      <TweakRadio
        label="Visual mood"
        value={t.vibe}
        options={["editorial", "modern", "minimal"]}
        onChange={(v) => setTweak("vibe", v)}
      />

      <TweakSection label="Brand palette" hint="Re-tint everything that uses brand color" />
      <TweakColor
        label="Palette"
        value={t.palette}
        options={PALETTES}
        onChange={(v) => setTweak("palette", v)}
      />

      <TweakSection label="Layout rhythm" hint="How much air the page breathes" />
      <TweakRadio
        label="Rhythm"
        value={t.rhythm}
        options={["cozy", "default", "airy"]}
        onChange={(v) => setTweak("rhythm", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
