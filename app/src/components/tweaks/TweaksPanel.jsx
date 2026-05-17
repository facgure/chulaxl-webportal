import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Individual controls ──────────────────────────────────────────────────────

export function TweakSection({ label, hint }) {
  return (
    <div className="twk-section">
      <span className="twk-section-label">{label}</span>
      {hint && <span className="twk-section-hint">{hint}</span>}
    </div>
  );
}

export function TweakRadio({ label, value, options, onChange }) {
  return (
    <div className="twk-row">
      <label className="twk-label">{label}</label>
      <div className="twk-seg">
        {options.map(opt => (
          <button
            key={opt}
            className={`twk-seg-btn${value === opt ? ' active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TweakColor({ label, value, options, onChange }) {
  const isArrayPalette = Array.isArray(value) && Array.isArray(value[0]);

  return (
    <div className="twk-row">
      <label className="twk-label">{label}</label>
      <div className="twk-swatches">
        {options.map((opt, i) => {
          const color = Array.isArray(opt) ? opt[0] : opt;
          const isActive = Array.isArray(value)
            ? JSON.stringify(value) === JSON.stringify(opt)
            : value === opt;
          return (
            <button
              key={i}
              className={`twk-swatch${isActive ? ' active' : ''}`}
              style={{ background: color }}
              title={Array.isArray(opt) ? opt.join(', ') : opt}
              onClick={() => onChange(opt)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TweakToggle({ label, value, onChange }) {
  return (
    <div className="twk-row">
      <label className="twk-label">{label}</label>
      <button
        className={`twk-toggle${value ? ' active' : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
      />
    </div>
  );
}

export function TweakSlider({ label, value, min, max, unit, onChange }) {
  return (
    <div className="twk-row">
      <label className="twk-label">{label} <span className="twk-val">{value}{unit}</span></label>
      <input
        type="range"
        className="twk-slider"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ─── Panel shell ──────────────────────────────────────────────────────────────

export function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = useState(true);
  const [pos, setPos] = useState({ x: null, y: null });
  const panelRef = useRef(null);
  const dragRef = useRef(null);

  function onDragStart(e) {
    const rect = panelRef.current.getBoundingClientRect();
    dragRef.current = { startX: e.clientX - rect.right, startY: e.clientY - rect.bottom };
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onDragEnd);
  }

  function onDrag(e) {
    if (!dragRef.current) return;
    setPos({
      x: window.innerWidth - (e.clientX - dragRef.current.startX),
      y: window.innerHeight - (e.clientY - dragRef.current.startY),
    });
  }

  function onDragEnd() {
    dragRef.current = null;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', onDragEnd);
  }

  const panelStyle = {
    position: 'fixed',
    right: pos.x !== null ? pos.x : 16,
    bottom: pos.y !== null ? pos.y : 16,
    zIndex: 2147483646,
    width: 280,
    maxHeight: 'calc(100vh - 32px)',
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(250,249,247,.92)',
    color: '#29261b',
    backdropFilter: 'blur(24px) saturate(160%)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    border: '.5px solid rgba(255,255,255,.6)',
    borderRadius: 14,
    boxShadow: '0 1px 0 rgba(255,255,255,.5) inset, 0 12px 40px rgba(0,0,0,.18)',
    font: '11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif',
    overflow: 'hidden',
  };

  return (
    <div ref={panelRef} style={panelStyle}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px 10px 14px', cursor: 'move', userSelect: 'none', borderBottom: open ? '0.5px solid rgba(0,0,0,.08)' : 'none' }}
        onMouseDown={onDragStart}
      >
        <b style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.01em' }}>{title}</b>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14, padding: '2px 6px' }}
        >
          {open ? '▾' : '▸'}
        </button>
      </div>
      {open && (
        <div style={{ overflowY: 'auto', padding: '8px 14px 14px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Inline styles for controls ──────────────────────────────────────────────

const inlineStyles = `
.twk-section { margin: 12px 0 6px; }
.twk-section-label { font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #666; }
.twk-section-hint { display: block; font-size: 10px; color: #999; margin-top: 2px; }
.twk-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: 6px 0; }
.twk-label { font-size: 11.5px; color: #444; flex: 1; }
.twk-val { color: #888; }
.twk-seg { display: flex; gap: 3px; }
.twk-seg-btn { font-size: 10.5px; padding: 3px 8px; border-radius: 5px; border: 1px solid #ddd; background: #fff; cursor: pointer; color: #555; }
.twk-seg-btn.active { background: #29261b; color: #fff; border-color: #29261b; }
.twk-swatches { display: flex; gap: 6px; }
.twk-swatch { width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; outline: none; }
.twk-swatch.active { border-color: #29261b; box-shadow: 0 0 0 2px #fff, 0 0 0 4px #29261b; }
.twk-toggle { width: 32px; height: 18px; border-radius: 9px; border: none; background: #ccc; cursor: pointer; position: relative; transition: background .15s; }
.twk-toggle.active { background: #29261b; }
.twk-toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: #fff; transition: transform .15s; }
.twk-toggle.active::after { transform: translateX(14px); }
.twk-slider { width: 100%; accent-color: #29261b; }
`;

export function TweakStyles() {
  return <style>{inlineStyles}</style>;
}
