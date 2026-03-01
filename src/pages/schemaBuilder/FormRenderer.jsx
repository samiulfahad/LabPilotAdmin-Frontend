import { useState, useMemo, useCallback } from "react";
import useStore from "./store";
import InputField from "../../components/html/InputField";
import SelectField from "../../components/html/SelectField";
import TextAreaField from "../../components/html/TextAreaField";

// ─── pure helpers ─────────────────────────────────────────────────────────────

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

function getRange(sr, gender, age) {
  if (!sr) return null;
  const { type, data } = sr;
  const ageNum = parseFloat(age);

  if (type === "simple") {
    const min = parseFloat(data.min),
      max = parseFloat(data.max);
    return isNaN(min) || isNaN(max) ? null : { min, max, info: "" };
  }
  if (type === "gender") {
    if (!gender) return null;
    const g = data[gender.toLowerCase()];
    if (!g) return null;
    return { min: parseFloat(g.min), max: parseFloat(g.max), info: `for ${cap(gender)}` };
  }
  if (type === "age") {
    if (!age || isNaN(ageNum)) return null;
    for (const e of data) {
      const hi = e.maxAge !== 999 ? parseFloat(e.maxAge) : Infinity;
      if (ageNum >= parseFloat(e.minAge) && ageNum <= hi) {
        const str = `${e.minAge}${e.maxAge === 999 ? "+" : "–" + e.maxAge}`;
        return { min: parseFloat(e.minValue), max: parseFloat(e.maxValue), info: `age ${str}` };
      }
    }
    return null;
  }
  if (type === "combined") {
    if (!gender || !age || isNaN(ageNum)) return null;
    for (const e of data) {
      if (e.gender.toLowerCase() !== gender.toLowerCase()) continue;
      const hi = e.maxAge !== 999 ? parseFloat(e.maxAge) : Infinity;
      if (ageNum >= parseFloat(e.minAge) && ageNum <= hi) {
        const str = `${e.minAge}${e.maxAge === 999 ? "+" : "–" + e.maxAge}`;
        return { min: parseFloat(e.minValue), max: parseFloat(e.maxValue), info: `${cap(gender)}, age ${str}` };
      }
    }
    return null;
  }
  return null;
}

function computeStatus(field, value, gender, age) {
  if (field.type !== "number" || !field.standardRange) return "";
  const range = getRange(field.standardRange, gender, age);
  if (!range) return "";
  const n = parseFloat(value);
  if (isNaN(n)) return "";
  if (n < range.min) return "below";
  if (n > range.max) return "above";
  return "within";
}

// ─── styles ───────────────────────────────────────────────────────────────────

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  .ef {
    --white:       #ffffff;
    --surface:     #f8f9fb;
    --surface-2:   #f1f3f7;
    --border:      #e4e7ed;
    --border-focus:#6366f1;
    --ink-1:       #111827;
    --ink-2:       #4b5563;
    --ink-3:       #9ca3af;
    --ink-4:       #d1d5db;
    --accent:      #6366f1;
    --accent-light:#eef2ff;
    --accent-mid:  #c7d2fe;
    --green:       #059669;
    --green-bg:    #ecfdf5;
    --green-border:#a7f3d0;
    --red:         #dc2626;
    --red-bg:      #fef2f2;
    --red-border:  #fecaca;
    --amber:       #d97706;
    --amber-bg:    #fffbeb;
    --amber-border:#fde68a;
    --shadow-sm:   0 1px 2px rgba(0,0,0,0.05);
    --shadow-md:   0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
    --shadow-lg:   0 8px 28px rgba(99,102,241,0.08), 0 2px 8px rgba(0,0,0,0.05);
    --radius:      14px;
    --radius-sm:   9px;
    --radius-xs:   6px;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    color: var(--ink-1);
  }
  .ef * { box-sizing: border-box; }

  /* ── toggle ── */
  .ef-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 16px 13px 14px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
    box-shadow: var(--shadow-sm);
    position: relative;
    overflow: hidden;
  }
  .ef-toggle::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.03) 100%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .ef-toggle:hover {
    border-color: var(--accent-mid);
    box-shadow: var(--shadow-md);
  }
  .ef-toggle:hover::before { opacity: 1; }
  .ef-toggle-left { display: flex; align-items: center; gap: 11px; }
  .ef-toggle-icon {
    width: 34px; height: 34px;
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    border-radius: var(--radius-sm);
    border: 1px solid var(--accent-mid);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(99,102,241,0.15);
  }
  .ef-toggle-text { font-size: 13.5px; font-weight: 600; color: var(--ink-1); }
  .ef-toggle-badge {
    font-size: 11px; font-weight: 500;
    color: var(--ink-3);
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 2px 8px;
    border-radius: 20px;
  }
  .ef-toggle-right { display: flex; align-items: center; gap: 10px; }
  .ef-chevron {
    color: var(--ink-3);
    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
  }
  .ef-chevron.open { transform: rotate(180deg); color: var(--accent); }

  /* ── panel ── */
  .ef-panel {
    margin-top: 6px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    animation: ef-appear 0.22s cubic-bezier(0.34,1.1,0.64,1);
  }
  @keyframes ef-appear {
    from { opacity: 0; transform: translateY(-10px) scale(0.993); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── panel header ── */
  .ef-head {
    padding: 28px 32px 24px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, #fff 50%, #f3f4ff 100%);
    position: relative;
    overflow: hidden;
  }
  .ef-head::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%);
  }
  .ef-head-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
  .ef-form-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 22px;
    font-weight: 400;
    color: var(--ink-1);
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .ef-form-desc {
    font-size: 13px;
    color: var(--ink-3);
    margin-top: 5px;
    line-height: 1.55;
    font-weight: 400;
  }
  .ef-required-note {
    font-size: 11.5px;
    color: var(--ink-3);
    white-space: nowrap;
    margin-top: 2px;
    flex-shrink: 0;
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 3px 10px;
    border-radius: 20px;
  }
  .ef-ref {
    margin-top: 16px;
    padding: 13px 16px;
    background: var(--amber-bg);
    border: 1px solid var(--amber-border);
    border-left: 3px solid var(--amber);
    border-radius: var(--radius-sm);
    display: flex;
    gap: 10px;
  }
  .ef-ref-icon { flex-shrink: 0; color: var(--amber); margin-top: 1px; }
  .ef-ref-label {
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--amber); margin-bottom: 4px;
  }
  .ef-ref-body {
    font-size: 12.5px; color: #92400e;
    line-height: 1.6; white-space: pre-wrap;
    font-weight: 400;
  }

  /* ── patient row ── */
  .ef-patient {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .ef-patient-cell {
    padding: 20px 32px;
    border-right: 1px solid var(--border);
  }
  .ef-patient-cell:last-child { border-right: none; }
  .ef-patient-hint {
    grid-column: 1 / -1;
    padding: 9px 32px;
    border-top: 1px solid #e0e7ff;
    background: linear-gradient(90deg, #eef2ff 0%, #f5f3ff 100%);
    display: flex; align-items: center; gap: 8px;
    font-size: 11.5px; color: #4338ca; font-weight: 500;
  }

  /* ── field label ── */
  .ef-lbl {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    font-weight: 600;
    color: var(--ink-2);
    letter-spacing: 0.03em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .ef-lbl .req {
    color: var(--red);
    font-size: 13px;
    line-height: 1;
  }

  /* ── inputs ── */
  .ef-input, .ef-select, .ef-textarea {
    width: 100%;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 10px 13px;
    font-size: 13.5px;
    font-weight: 400;
    color: var(--ink-1);
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), inset 0 1px 2px rgba(0,0,0,0.02);
  }
  .ef-input:hover, .ef-select:hover, .ef-textarea:hover {
    border-color: #a5b4fc;
    background: #fafbff;
  }
  .ef-input:focus, .ef-select:focus, .ef-textarea:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3.5px rgba(99,102,241,0.12), 0 1px 2px rgba(0,0,0,0.04);
    background: #fefeff;
  }
  .ef-input::placeholder, .ef-textarea::placeholder { color: var(--ink-4); font-weight: 400; }
  .ef-input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  .ef-input[type=number] { -moz-appearance: textfield; }
  .ef-textarea { resize: vertical; min-height: 88px; line-height: 1.6; }
  .ef-select option { background: #fff; color: var(--ink-1); }

  /* select wrapper */
  .ef-sel-wrap { position: relative; }
  .ef-sel-wrap svg {
    position: absolute; right: 11px; top: 50%;
    transform: translateY(-50%); pointer-events: none;
    color: var(--ink-3); transition: color 0.15s;
  }
  .ef-sel-wrap:hover svg { color: var(--accent); }
  .ef-sel-wrap .ef-select { padding-right: 34px; cursor: pointer; }

  /* number with unit */
  .ef-num-wrap { position: relative; }
  .ef-unit {
    position: absolute;
    top: 1.5px; right: 1.5px; bottom: 1.5px;
    display: flex; align-items: center;
    padding: 0 10px;
    font-size: 11px; font-weight: 600;
    color: var(--ink-3);
    pointer-events: none;
    letter-spacing: 0.04em;
    background: linear-gradient(to right, transparent, var(--surface-2) 20%);
    border-left: 1px solid var(--border);
    border-radius: 0 7px 7px 0;
  }

  /* ── section ── */
  .ef-section { border-bottom: 1px solid var(--border); }
  .ef-section:last-of-type { border-bottom: none; }
  .ef-sec-head {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 32px;
    background: linear-gradient(90deg, #f5f6ff 0%, var(--surface) 60%);
    border-bottom: 1px solid var(--border);
    border-left: 3px solid var(--accent);
  }
  .ef-sec-num {
    width: 26px; height: 26px;
    border-radius: var(--radius-xs);
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    border: 1px solid var(--accent-mid);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800;
    color: var(--accent);
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(99,102,241,0.15);
  }
  .ef-sec-name {
    font-size: 12px; font-weight: 700;
    color: var(--ink-1); letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .ef-sec-count {
    margin-left: auto;
    font-size: 11px; font-weight: 500;
    color: var(--ink-3);
    background: var(--white);
    border: 1px solid var(--border);
    padding: 2px 9px;
    border-radius: 20px;
    box-shadow: var(--shadow-sm);
  }

  /* ── fields grid ── */
  .ef-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  .ef-field {
    padding: 22px 32px;
    border-right: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
    position: relative;
  }
  .ef-field::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.15s;
  }
  .ef-field:hover { background: #fafbff; }
  .ef-field:hover::before { opacity: 0.4; }
  .ef-field:focus-within { background: #fafbff; }
  .ef-field:focus-within::before { opacity: 1; }
  .ef-field:nth-child(even) { border-right: none; }
  .ef-field.wide {
    grid-column: 1 / -1;
    border-right: none;
  }
  .ef-section:last-of-type .ef-fields > .ef-field:last-child,
  .ef-section:last-of-type .ef-fields > .ef-field:nth-last-child(2):nth-child(odd) {
    border-bottom: none;
  }

  /* ── option pills (radio/checkbox) ── */
  .ef-opts { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 2px; }
  .ef-opt {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 13px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border);
    background: var(--white);
    cursor: pointer;
    font-size: 12.5px; font-weight: 500;
    color: var(--ink-2);
    transition: all 0.14s cubic-bezier(0.4,0,0.2,1);
    user-select: none;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  }
  .ef-opt:hover {
    border-color: var(--accent-mid);
    color: var(--ink-1);
    background: #f5f3ff;
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(99,102,241,0.1);
  }
  .ef-opt.sel {
    border-color: var(--accent);
    background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
    color: #4338ca;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1), 0 1px 3px rgba(99,102,241,0.15);
    transform: translateY(-1px);
  }
  .ef-radio-dot {
    width: 14px; height: 14px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .ef-radio-fill {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent);
    transform: scale(0);
    transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .ef-opt.sel .ef-radio-fill { transform: scale(1); }
  .ef-chk-box {
    width: 14px; height: 14px;
    border-radius: 4px;
    border: 1.5px solid currentColor;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.13s, border-color 0.13s;
  }
  .ef-opt.sel .ef-chk-box {
    background: linear-gradient(135deg, #6366f1, #818cf8);
    border-color: #6366f1;
  }
  .ef-chk-mark { opacity: 0; transition: opacity 0.13s; }
  .ef-opt.sel .ef-chk-mark { opacity: 1; }

  /* ── range hint + status ── */
  .ef-range {
    margin-top: 7px;
    font-size: 11px;
    color: var(--ink-3);
    display: flex; align-items: center; gap: 5px;
    font-weight: 400;
    padding: 4px 8px;
    background: var(--surface);
    border-radius: 5px;
    border: 1px solid var(--border);
    width: fit-content;
  }
  .ef-range-dot {
    width: 4px; height: 4px; border-radius: 50%;
    background: var(--ink-4); flex-shrink: 0;
  }

  .ef-status {
    display: inline-flex; align-items: center; gap: 5px;
    margin-top: 6px; padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.02em;
  }
  .ef-status.within {
    background: linear-gradient(135deg, #ecfdf5, #d1fae5);
    color: var(--green);
    border: 1px solid var(--green-border);
    box-shadow: 0 1px 3px rgba(5,150,105,0.1);
  }
  .ef-status.above, .ef-status.below {
    background: linear-gradient(135deg, #fef2f2, #fee2e2);
    color: var(--red);
    border: 1px solid var(--red-border);
    box-shadow: 0 1px 3px rgba(220,38,38,0.1);
  }
  .ef-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%; background: currentColor; flex-shrink: 0;
    box-shadow: 0 0 4px currentColor;
  }

  /* ── footer ── */
  .ef-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
    background: linear-gradient(90deg, var(--surface) 0%, #f3f4ff 100%);
    border-top: 1px solid var(--border);
    gap: 12px;
  }
  .ef-progress-wrap {
    display: flex; align-items: center; gap: 12px; flex: 1;
  }
  .ef-progress-bar {
    flex: 1; height: 5px;
    background: var(--border);
    border-radius: 99px;
    overflow: hidden;
    max-width: 160px;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
  }
  .ef-progress-fill {
    height: 100%; border-radius: 99px;
    background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
    transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
    box-shadow: 0 0 6px rgba(99,102,241,0.4);
  }
  .ef-progress-text {
    font-size: 12px; font-weight: 500; color: var(--ink-3);
    white-space: nowrap;
  }
  .ef-actions { display: flex; gap: 8px; }

  /* buttons */
  .ef-btn-ghost {
    padding: 8px 18px;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12.5px; font-weight: 600;
    color: var(--ink-2);
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.15s;
    box-shadow: var(--shadow-sm);
  }
  .ef-btn-ghost:hover {
    border-color: #a5b4fc; color: var(--accent);
    background: var(--accent-light);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(99,102,241,0.1);
  }
  .ef-btn-ghost:active { transform: translateY(0); }
  .ef-btn-primary {
    padding: 8px 22px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    border-radius: var(--radius-sm);
    font-size: 12.5px; font-weight: 600;
    color: #fff;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.15s;
    box-shadow: 0 2px 8px rgba(99,102,241,0.3), 0 1px 2px rgba(99,102,241,0.2);
    display: flex; align-items: center; gap: 6px;
  }
  .ef-btn-primary:hover {
    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
    box-shadow: 0 5px 16px rgba(99,102,241,0.4), 0 2px 4px rgba(99,102,241,0.2);
    transform: translateY(-1px);
  }
  .ef-btn-primary:active { transform: translateY(0); box-shadow: 0 2px 6px rgba(99,102,241,0.3); }

  @media (max-width: 640px) {
    .ef-patient { grid-template-columns: 1fr; }
    .ef-patient-cell { border-right: none; border-bottom: 1px solid var(--border); }
    .ef-patient-cell:last-child { border-bottom: none; }
    .ef-fields { grid-template-columns: 1fr; }
    .ef-field { border-right: none; }
    .ef-field.wide { grid-column: 1; }
    .ef-head, .ef-patient-cell, .ef-patient-hint,
    .ef-sec-head, .ef-field, .ef-footer { padding-left: 18px; padding-right: 18px; }
  }
`;

// ─── sub-components ───────────────────────────────────────────────────────────

function Label({ text, unit, required }) {
  const display = `${text}${unit ? ` (${unit})` : ""}`;
  return (
    <div className="ef-lbl">
      {display}
      {required && <span className="req">*</span>}
    </div>
  );
}

function RangeHint({ range, unit }) {
  if (!range) return null;
  return (
    <div className="ef-range">
      <span className="ef-range-dot" />
      Ref range{range.info ? ` · ${range.info}` : ""}:
      <strong style={{ color: "var(--ink-2)", fontWeight: 600 }}>
        {range.min}–{range.max}
        {unit ? ` ${unit}` : ""}
      </strong>
    </div>
  );
}

function StatusChip({ status }) {
  if (!status) return null;
  const map = {
    within: { label: "Within range", icon: "✓" },
    above: { label: "Above range", icon: "↑" },
    below: { label: "Below range", icon: "↓" },
  };
  const { label, icon } = map[status];
  return (
    <div className={`ef-status ${status}`}>
      <span className="ef-status-dot" />
      {icon} {label}
    </div>
  );
}

function RadioGroup({ field, value, onChange }) {
  return (
    <div className="ef-opts">
      {(field.options || []).map((opt) => {
        const sel = value === opt;
        return (
          <label key={opt} className={`ef-opt${sel ? " sel" : ""}`} onClick={() => onChange(opt)}>
            <span className="ef-radio-dot">
              <span className="ef-radio-fill" />
            </span>
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function CheckboxGroup({ field, value, onChange }) {
  const vals = Array.isArray(value) ? value : [];
  const toggle = (opt) => onChange(vals.includes(opt) ? vals.filter((v) => v !== opt) : [...vals, opt]);
  return (
    <div className="ef-opts">
      {(field.options || []).map((opt) => {
        const sel = vals.includes(opt);
        return (
          <label key={opt} className={`ef-opt${sel ? " sel" : ""}`} onClick={() => toggle(opt)}>
            <span className="ef-chk-box">
              <svg className="ef-chk-mark" width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path
                  d="M1.5 4.5L3.5 6.5L7.5 2.5"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {opt}
          </label>
        );
      })}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

const FormRenderer = () => {
  const { schema } = useStore();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [formData, setFormData] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const sections = schema?.sections || [];
  const hasMultipleSections = sections.length > 1;

  const statuses = useMemo(() => {
    const s = {};
    sections.forEach((sec) =>
      (sec.fields || []).forEach((field) => {
        const v = formData[field.name];
        if (v !== undefined && v !== "") s[field.name] = computeStatus(field, v, gender, age);
      }),
    );
    return s;
  }, [formData, gender, age, sections]);

  const handleChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const renderField = (field) => {
    const { name, type, required, options = [], maxLength, unit = "", standardRange } = field;
    const value = formData[name] ?? (type === "checkbox" ? [] : "");
    const range = standardRange ? getRange(standardRange, gender, age) : null;
    const status = statuses[name] || "";
    const isWide = ["textarea", "checkbox", "radio"].includes(type);

    let input;
    switch (type) {
      case "input":
        input = (
          <input
            className="ef-input"
            type="text"
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            maxLength={maxLength}
            placeholder="Enter value"
          />
        );
        break;

      case "number":
        input = (
          <div className="ef-num-wrap">
            <input
              className="ef-input"
              type="number"
              value={value}
              onChange={(e) => handleChange(name, e.target.value)}
              placeholder="0"
              style={unit ? { paddingRight: `${Math.max(unit.length * 8 + 24, 52)}px` } : {}}
            />
            {unit && <span className="ef-unit">{unit}</span>}
          </div>
        );
        break;

      case "textarea":
        input = (
          <textarea
            className="ef-textarea"
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            maxLength={maxLength}
            placeholder="Enter text"
            rows={3}
          />
        );
        break;

      case "select":
        input = (
          <div className="ef-sel-wrap">
            <select className="ef-select" value={value} onChange={(e) => handleChange(name, e.target.value)}>
              <option value="">Select an option</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        );
        break;

      case "radio":
        input = <RadioGroup field={field} value={value} onChange={(v) => handleChange(name, v)} />;
        break;

      case "checkbox":
        input = <CheckboxGroup field={field} value={value} onChange={(newVals) => handleChange(name, newVals)} />;
        break;

      default:
        return null;
    }

    return (
      <div key={name} className={`ef-field${isWide ? " wide" : ""}`}>
        <Label text={name} unit={unit} required={required} />
        {input}
        <RangeHint range={range} unit={unit} />
        <StatusChip status={status} />
      </div>
    );
  };

  const filledCount = Object.values(formData).filter((v) =>
    Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined,
  ).length;
  const totalFields = sections.reduce((acc, s) => acc + (s.fields?.length || 0), 0);
  const progressPct = totalFields > 0 ? Math.round((filledCount / totalFields) * 100) : 0;

  return (
    <div className="ef">
      <style>{STYLES}</style>

      {/* ── toggle ── */}
      <button className="ef-toggle" onClick={() => setIsOpen((o) => !o)}>
        <span className="ef-toggle-left">
          <span className="ef-toggle-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#6366f1" strokeWidth="1.7">
              <rect x="2" y="3" width="12" height="10" rx="2" />
              <path d="M5 7h6M5 10h4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="ef-toggle-text">Form Preview</span>
          {totalFields > 0 && (
            <span className="ef-toggle-badge">
              {totalFields} field{totalFields !== 1 ? "s" : ""}
            </span>
          )}
        </span>
        <span className="ef-toggle-right">
          {isOpen && filledCount > 0 && (
            <span
              className="ef-toggle-badge"
              style={{ background: "#eef2ff", border: "1px solid #c7d2fe", color: "#4f46e5" }}
            >
              {progressPct}% complete
            </span>
          )}
          <svg
            className={`ef-chevron${isOpen ? " open" : ""}`}
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M3.5 6l4.5 4.5L12.5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {/* ── panel ── */}
      {isOpen && (
        <div className="ef-panel">
          {/* header */}
          <div className="ef-head">
            <div className="ef-head-top">
              <div>
                <h2 className="ef-form-title">{schema.name || "Untitled Form"}</h2>
                {schema.description && <p className="ef-form-desc">{schema.description}</p>}
              </div>
              <span className="ef-required-note">Fields marked * are required</span>
            </div>

            {schema.hasStaticStandardRange && schema.staticStandardRange && (
              <div className="ef-ref">
                <span className="ef-ref-icon">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="7.5" cy="7.5" r="6" />
                    <path d="M7.5 5v4M7.5 10.5v.5" strokeLinecap="round" />
                  </svg>
                </span>
                <div>
                  <div className="ef-ref-label">Reference Values</div>
                  <div className="ef-ref-body">{schema.staticStandardRange}</div>
                </div>
              </div>
            )}
          </div>

          {/* patient context */}
          <div className="ef-patient">
            <div className="ef-patient-cell">
              <div className="ef-lbl">Gender</div>
              <div className="ef-sel-wrap">
                <select className="ef-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="ef-patient-cell">
              <div className="ef-lbl">Age (years)</div>
              <input
                className="ef-input"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                min={0}
                max={150}
              />
            </div>
            <div className="ef-patient-hint">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="5.5" />
                <path d="M6.5 4.5v3M6.5 9v.5" strokeLinecap="round" />
              </svg>
              Gender and age are used to calculate personalized reference ranges
            </div>
          </div>

          {/* sections */}
          {sections.map((section, si) => (
            <div key={section.name} className="ef-section">
              {hasMultipleSections && (
                <div className="ef-sec-head">
                  <span className="ef-sec-num">{si + 1}</span>
                  <span className="ef-sec-name">{section.name}</span>
                  <span className="ef-sec-count">
                    {section.fields?.length || 0} field{section.fields?.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
              <div className="ef-fields">{(section.fields || []).map(renderField)}</div>
            </div>
          ))}

          {/* footer */}
          <div className="ef-footer">
            <div className="ef-progress-wrap">
              <div className="ef-progress-bar">
                <div className="ef-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="ef-progress-text">
                {filledCount} of {totalFields} completed
              </span>
            </div>
            <div className="ef-actions">
              <button className="ef-btn-ghost" onClick={() => setFormData({})}>
                Clear all
              </button>
              <button className="ef-btn-primary" onClick={() => console.log("Submit", formData, { gender, age })}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormRenderer;
