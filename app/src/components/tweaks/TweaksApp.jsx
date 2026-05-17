import { useTheme } from '../../context/ThemeContext';
import { TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakStyles } from './TweaksPanel';

export default function TweaksApp() {
  const { vibe, setVibe, palette, setPalette, rhythm, setRhythm, PALETTES } = useTheme();

  return (
    <>
      <TweakStyles />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Vibe" hint="Reshape the typographic mood across the page" />
        <TweakRadio
          label="Visual mood"
          value={vibe}
          options={['editorial', 'modern', 'minimal']}
          onChange={setVibe}
        />
        <TweakSection label="Brand palette" hint="Re-tint everything that uses brand color" />
        <TweakColor
          label="Palette"
          value={palette}
          options={PALETTES}
          onChange={setPalette}
        />
        <TweakSection label="Layout rhythm" hint="How much air the page breathes" />
        <TweakRadio
          label="Rhythm"
          value={rhythm}
          options={['cozy', 'default', 'airy']}
          onChange={setRhythm}
        />
      </TweaksPanel>
    </>
  );
}
