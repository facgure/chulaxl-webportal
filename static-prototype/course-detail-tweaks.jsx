// Tweaks for course-detail.html — toggle academic vs marketplace
// Plus palette + rhythm carry-overs from main site for consistency.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "style": "academic",
  "palette": ["#E5007A", "#7A0040", "#FFF1F7"]
}/*EDITMODE-END*/;

const PALETTES = [
  ["#E5007A", "#7A0040", "#FFF1F7"],  // Chula pink
  ["#5B21B6", "#312E81", "#F5F3FF"],  // Royal purple
  ["#0F766E", "#134E4A", "#F0FDFA"],  // Forest teal
  ["#1F2937", "#0F172A", "#F8FAFC"],  // Charcoal mono
];

function applyPalette(palette) {
  const [p500, p700, p50] = palette;
  const r = document.documentElement.style;
  r.setProperty("--pink-500", p500);
  r.setProperty("--pink-700", p700);
  r.setProperty("--pink-50", p50);
  r.setProperty("--pink-100", `color-mix(in oklab, ${p500} 14%, white)`);
  r.setProperty("--pink-200", `color-mix(in oklab, ${p500} 30%, white)`);
  r.setProperty("--pink-300", `color-mix(in oklab, ${p500} 50%, white)`);
  r.setProperty("--pink-600", `color-mix(in oklab, ${p500} 88%, black)`);
  r.setProperty("--pink-900", `color-mix(in oklab, ${p700} 70%, black)`);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.body.dataset.style = t.style;
  }, [t.style]);

  React.useEffect(() => {
    applyPalette(t.palette);
  }, [t.palette]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection
        label="การนำเสนอ"
        hint="โครงสร้างเหมือนกัน แต่บุคลิกต่างกัน — สลับเพื่อเทียบ"
      />
      <TweakRadio
        label="Style"
        value={t.style}
        options={["academic", "marketplace"]}
        onChange={(v) => setTweak("style", v)}
      />

      <TweakSection label="Brand palette" hint="Re-tint everything" />
      <TweakColor
        label="Palette"
        value={t.palette}
        options={PALETTES}
        onChange={(v) => setTweak("palette", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
