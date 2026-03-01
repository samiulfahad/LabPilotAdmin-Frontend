import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import InputField from "../../components/html/InputField";
import SelectField from "../../components/html/SelectField";
import TextAreaField from "../../components/html/TextAreaField";
import schemaService from "../../services/schemaService";
import LoadingScreen from "../../components/loadingPage";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  :root {
    --ink: #0A0B0F;
    --ink-muted: #6B7280;
    --ink-faint: #9CA3AF;
    --surface: #FFFFFF;
    --surface-raised: #F8F9FB;
    --surface-hover: #F3F4F6;
    --border: #E5E7EB;
    --border-focus: #111827;
    --accent: #1D4ED8;
    --accent-light: #EFF6FF;
    --accent-muted: #93C5FD;
    --success: #059669;
    --success-light: #ECFDF5;
    --danger: #DC2626;
    --danger-light: #FEF2F2;
    --warning: #D97706;
    --warning-light: #FFFBEB;
    --radius-sm: 6px;
    --radius: 10px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
    --shadow: 0 4px 16px rgba(0,0,0,.06), 0 1px 4px rgba(0,0,0,.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,.08), 0 2px 8px rgba(0,0,0,.04);
  }

  .fr-root * { box-sizing: border-box; }

  .fr-root {
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background: var(--surface-raised);
    background-image:
      radial-gradient(ellipse 80% 40% at 60% -10%, rgba(29,78,216,.05) 0%, transparent 70%),
      radial-gradient(ellipse 60% 30% at 10% 100%, rgba(5,150,105,.04) 0%, transparent 70%);
    padding: 32px 16px 80px;
    color: var(--ink);
  }

  /* ── Layout ── */
  .fr-shell { max-width: 780px; margin: 0 auto; }

  /* ── Header ── */
  .fr-header { margin-bottom: 36px; }
  .fr-breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; letter-spacing: .04em;
    text-transform: uppercase; color: var(--ink-muted);
    margin-bottom: 20px;
  }
  .fr-breadcrumb-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border); }
  .fr-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(24px, 4vw, 36px); font-weight: 700;
    letter-spacing: -.02em; color: var(--ink); line-height: 1.15;
    margin: 0 0 8px;
  }
  .fr-subtitle { font-size: 15px; color: var(--ink-muted); margin: 0; font-weight: 300; }
  .fr-header-meta {
    display: flex; align-items: center; gap: 10px; margin-top: 16px;
  }
  .fr-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 100px;
    border: 1px solid var(--border); background: var(--surface);
    color: var(--ink-muted);
  }
  .fr-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--success); }

  /* ── Card ── */
  .fr-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .fr-card-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 14px;
  }
  .fr-card-icon {
    width: 38px; height: 38px; border-radius: var(--radius-sm);
    background: var(--ink); display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fr-card-icon svg { color: white; }
  .fr-card-title {
    font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: -.01em; margin: 0 0 2px;
  }
  .fr-card-desc { font-size: 13px; color: var(--ink-muted); margin: 0; }
  .fr-card-body { padding: 28px; }

  /* ── Section navigation ── */
  .fr-tabs { display: flex; border-bottom: 1px solid var(--border); }
  .fr-tab {
    flex: 1; padding: 14px 20px; font-size: 13px; font-weight: 600;
    background: none; border: none; cursor: pointer;
    color: var(--ink-muted); position: relative;
    transition: color .15s; letter-spacing: -.01em;
  }
  .fr-tab:hover { color: var(--ink); background: var(--surface-hover); }
  .fr-tab.active { color: var(--ink); }
  .fr-tab.active::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: var(--ink); border-radius: 2px 2px 0 0;
  }
  .fr-tab-num {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%;
    font-size: 10px; font-weight: 700; margin-right: 7px;
    background: var(--surface-raised); border: 1px solid var(--border);
    color: var(--ink-muted);
  }
  .fr-tab.active .fr-tab-num {
    background: var(--ink); color: white; border-color: var(--ink);
  }

  /* ── Patient info grid ── */
  .fr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 560px) { .fr-grid-2 { grid-template-columns: 1fr; } }

  /* ── Fields ── */
  .fr-field { margin-bottom: 24px; }
  .fr-field:last-child { margin-bottom: 0; }
  .fr-label {
    display: block; font-size: 12px; font-weight: 600; letter-spacing: .04em;
    text-transform: uppercase; color: var(--ink-muted); margin-bottom: 8px;
  }
  .fr-label-req { color: var(--danger); margin-left: 2px; }

  .fr-input, .fr-select, .fr-textarea {
    width: 100%; padding: 11px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
    color: var(--ink); background: var(--surface);
    border: 1.5px solid var(--border); border-radius: var(--radius-sm);
    outline: none; transition: border-color .15s, box-shadow .15s;
    -webkit-appearance: none; appearance: none;
  }
  .fr-input::placeholder, .fr-textarea::placeholder { color: var(--ink-faint); }
  .fr-input:focus, .fr-select:focus, .fr-textarea:focus {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(10,11,15,.06);
  }
  .fr-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
  .fr-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 38px; cursor: pointer;
  }

  /* ── Range info ── */
  .fr-range-info {
    display: flex; align-items: center; gap: 6px;
    margin-top: 8px; font-size: 12px; color: var(--ink-muted);
  }
  .fr-range-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 100px;
    font-size: 11px; font-weight: 600; letter-spacing: .02em;
  }

  .fr-status-within { background: var(--success-light); color: var(--success); }
  .fr-status-above, .fr-status-below { background: var(--danger-light); color: var(--danger); }

  /* ── Radio & Checkbox ── */
  .fr-options-label {
    font-size: 12px; font-weight: 600; letter-spacing: .04em;
    text-transform: uppercase; color: var(--ink-muted); margin-bottom: 12px; display: block;
  }
  .fr-options { display: flex; flex-direction: column; gap: 8px; }
  .fr-option {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: var(--radius-sm);
    border: 1.5px solid var(--border); cursor: pointer;
    transition: border-color .12s, background .12s; font-size: 14px; font-weight: 400;
    color: var(--ink);
  }
  .fr-option:hover { border-color: #D1D5DB; background: var(--surface-raised); }
  .fr-option.selected { border-color: var(--ink); background: var(--surface-raised); }
  .fr-option-ctrl {
    width: 16px; height: 16px; flex-shrink: 0;
    border: 2px solid var(--border); display: flex; align-items: center; justify-content: center;
    transition: all .12s;
  }
  .fr-option-ctrl.radio { border-radius: 50%; }
  .fr-option-ctrl.checkbox { border-radius: 3px; }
  .fr-option.selected .fr-option-ctrl {
    border-color: var(--ink); background: var(--ink);
  }
  .fr-option-ctrl-dot {
    width: 5px; height: 5px; border-radius: 50%; background: white;
    opacity: 0; transform: scale(0); transition: all .12s;
  }
  .fr-option.selected .fr-option-ctrl-dot { opacity: 1; transform: scale(1); }
  .fr-option-ctrl-check {
    opacity: 0; transform: scale(0); transition: all .12s;
  }
  .fr-option.selected .fr-option-ctrl-check { opacity: 1; transform: scale(1); }

  /* ── Section body ── */
  .fr-section-body { padding: 28px; }
  .fr-section-inactive { opacity: .45; pointer-events: none; }

  /* ── Static range box ── */
  .fr-static-range {
    padding: 18px 20px; border-radius: var(--radius);
    background: var(--accent-light); border: 1px solid #BFDBFE;
    margin-bottom: 24px; font-size: 13px; color: #1E40AF;
    white-space: pre-line; line-height: 1.7;
  }
  .fr-static-range-title {
    font-size: 11px; font-weight: 700; letter-spacing: .06em;
    text-transform: uppercase; margin-bottom: 8px; opacity: .7;
  }

  /* ── Info notice ── */
  .fr-notice {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 14px; border-radius: var(--radius-sm);
    background: var(--surface-raised); border: 1px solid var(--border);
    font-size: 12px; color: var(--ink-muted); margin-top: 20px; line-height: 1.5;
  }
  .fr-notice svg { flex-shrink: 0; margin-top: 1px; }

  /* ── Footer ── */
  .fr-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 28px; border-top: 1px solid var(--border);
    flex-wrap: wrap; gap: 14px;
  }
  .fr-progress-text { font-size: 13px; color: var(--ink-muted); }
  .fr-progress-text strong { color: var(--ink); font-weight: 600; }
  .fr-footer-actions { display: flex; gap: 10px; }

  .fr-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    letter-spacing: .01em; cursor: pointer; transition: all .15s;
    border: 1.5px solid transparent;
  }
  .fr-btn-ghost {
    background: none; border-color: var(--border); color: var(--ink-muted);
  }
  .fr-btn-ghost:hover { border-color: #D1D5DB; color: var(--ink); background: var(--surface-raised); }
  .fr-btn-primary {
    background: var(--ink); color: white; border-color: var(--ink);
  }
  .fr-btn-primary:hover { background: #1F2937; border-color: #1F2937; }
  .fr-btn-primary:active { transform: scale(.98); }

  /* ── Error / not found ── */
  .fr-empty {
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
    font-family: 'DM Sans', sans-serif;
  }
  .fr-empty-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius-xl); padding: 48px 40px; text-align: center; max-width: 400px;
    box-shadow: var(--shadow-lg);
  }
  .fr-empty-icon {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--surface-raised); display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px; border: 1px solid var(--border);
  }
  .fr-empty-title {
    font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 8px;
  }
  .fr-empty-text { font-size: 14px; color: var(--ink-muted); margin: 0; }

  .fr-stack { display: flex; flex-direction: column; gap: 0; }
  .fr-space-y > * + * { margin-top: 20px; }
`;

// ─── Injected styles ─────────────────────────────────────────────────────────
const StyleInjector = () => {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconUser = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconDoc = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconInfo = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const IconArrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── FormRenderer ─────────────────────────────────────────────────────────────
const FormRenderer = () => {
  const [schema, setSchema] = useState(null);
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [formData, setFormData] = useState({});
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);

  const { schemaId } = useParams();

  if (!schemaId) {
    return (
      <div className="fr-root">
        <StyleInjector />
        <div className="fr-empty">
          <div className="fr-empty-card">
            <div className="fr-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <path
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="fr-empty-title">No Form Found</p>
            <p className="fr-empty-text">Please check the form URL and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const fetchSchema = async () => {
    try {
      setLoading(true);
      const { data } = await schemaService.getById(schemaId);
      setSchema(data);
    } catch (error) {
      console.error("Error fetching schema:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schemaId) fetchSchema();
  }, [schemaId]);

  const hasMultipleSections = schema?.sections?.length > 1;

  const computeStatus = (field, value, gender, age) => {
    if (field.type === "number" && field.standardRange) {
      const range = getApplicableRange(field.standardRange, gender, age);
      if (range) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (numValue < range.min) return "below";
          if (numValue > range.max) return "above";
          return "within";
        }
      }
    }
    return "";
  };

  const updateAllStatuses = () => {
    const newStatuses = {};
    schema?.sections?.forEach((section) => {
      section.fields.forEach((field) => {
        const value = formData[field.name];
        if (value !== undefined) {
          newStatuses[field.name] = computeStatus(field, value, gender, age);
        }
      });
    });
    setStatuses(newStatuses);
  };

  useEffect(() => {
    updateAllStatuses();
  }, [age, gender, formData, schema]);

  const handleChange = (fieldName, value, isCheckbox = false) => {
    setFormData((prev) => {
      if (isCheckbox) {
        const current = prev[fieldName] || [];
        return {
          ...prev,
          [fieldName]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
        };
      }
      return { ...prev, [fieldName]: value };
    });
  };

  const getApplicableRange = (sr, g, a) => {
    const { type, data } = sr;
    let min,
      max,
      info = "";
    const ageNum = parseFloat(a);

    if (type === "simple") {
      min = parseFloat(data.min);
      max = parseFloat(data.max);
    } else if (type === "gender") {
      if (!g) return null;
      const gd = data[g.toLowerCase()];
      if (gd) {
        min = parseFloat(gd.min);
        max = parseFloat(gd.max);
        info = `for ${g.charAt(0).toUpperCase() + g.slice(1)}`;
      }
    } else if (type === "age") {
      if (!a || isNaN(ageNum)) return null;
      for (let entry of data) {
        const minA = parseFloat(entry.minAge),
          maxA = entry.maxAge !== 999 ? parseFloat(entry.maxAge) : Infinity;
        if (ageNum >= minA && ageNum <= maxA) {
          min = parseFloat(entry.minValue);
          max = parseFloat(entry.maxValue);
          info = `for age ${entry.minAge}${entry.maxAge === 999 ? "+" : "-" + entry.maxAge}`;
          break;
        }
      }
    } else if (type === "combined") {
      if (!g || !a || isNaN(ageNum)) return null;
      for (let entry of data) {
        if (entry.gender.toLowerCase() === g.toLowerCase()) {
          const minA = parseFloat(entry.minAge),
            maxA = entry.maxAge !== 999 ? parseFloat(entry.maxAge) : Infinity;
          if (ageNum >= minA && ageNum <= maxA) {
            min = parseFloat(entry.minValue);
            max = parseFloat(entry.maxValue);
            info = `for ${entry.gender.charAt(0).toUpperCase() + entry.gender.slice(1)}, age ${entry.minAge}${entry.maxAge === 999 ? "+" : "-" + entry.maxAge}`;
            break;
          }
        }
      }
    }
    return !isNaN(min) && !isNaN(max) ? { min, max, info } : null;
  };

  const getStatusTag = (status) => {
    if (!status) return null;
    const map = {
      within: { cls: "fr-status-within", label: "Within range" },
      above: { cls: "fr-status-above", label: "Above range" },
      below: { cls: "fr-status-below", label: "Below range" },
    };
    const s = map[status];
    return s ? <span className={`fr-range-tag ${s.cls}`}>{s.label}</span> : null;
  };

  // ── Field renderer ──────────────────────────────────────────────────────────
  const renderField = (field) => {
    const { name, type, required, options = [], maxLength, unit = "", standardRange } = field;
    const value = formData[name] || (type === "checkbox" ? [] : "");
    const range = standardRange ? getApplicableRange(standardRange, gender, age) : null;
    const status = statuses[name] || "";
    const unitLabel = unit ? ` (${unit})` : "";

    let input;
    switch (type) {
      case "input":
        input = (
          <>
            <label className="fr-label">
              {name}
              {unitLabel}
              {required && <span className="fr-label-req">*</span>}
            </label>
            <input
              className="fr-input"
              type="text"
              value={value}
              maxLength={maxLength}
              required={required}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </>
        );
        break;
      case "textarea":
        input = (
          <>
            <label className="fr-label">
              {name}
              {unitLabel}
              {required && <span className="fr-label-req">*</span>}
            </label>
            <textarea
              className="fr-textarea"
              value={value}
              maxLength={maxLength}
              required={required}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </>
        );
        break;
      case "select":
        input = (
          <>
            <label className="fr-label">
              {name}
              {unitLabel}
              {required && <span className="fr-label-req">*</span>}
            </label>
            <select
              className="fr-select"
              value={value}
              required={required}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              <option value="">Select an option</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </>
        );
        break;
      case "radio":
        input = (
          <>
            <span className="fr-options-label">
              {name}
              {required && <span className="fr-label-req">*</span>}
            </span>
            <div className="fr-options">
              {options.map((opt) => (
                <label
                  key={opt}
                  className={`fr-option${value === opt ? " selected" : ""}`}
                  onClick={() => handleChange(name, opt)}
                >
                  <div className="fr-option-ctrl radio">
                    <div className="fr-option-ctrl-dot" />
                  </div>
                  {opt}
                </label>
              ))}
            </div>
          </>
        );
        break;
      case "checkbox":
        input = (
          <>
            <span className="fr-options-label">
              {name}
              {required && <span className="fr-label-req">*</span>}
            </span>
            <div className="fr-options">
              {options.map((opt) => (
                <label
                  key={opt}
                  className={`fr-option${value.includes(opt) ? " selected" : ""}`}
                  onClick={() => handleChange(name, opt, true)}
                >
                  <div className="fr-option-ctrl checkbox">
                    <span className="fr-option-ctrl-check">
                      <IconCheck />
                    </span>
                  </div>
                  {opt}
                </label>
              ))}
            </div>
          </>
        );
        break;
      case "number":
        input = (
          <>
            <label className="fr-label">
              {name}
              {unitLabel}
              {required && <span className="fr-label-req">*</span>}
            </label>
            <input
              className="fr-input"
              type="number"
              value={value}
              required={required}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </>
        );
        break;
      default:
        return null;
    }

    return (
      <div key={name} className="fr-field">
        {input}
        {range && (
          <div className="fr-range-info">
            <IconInfo />
            <span>
              Normal{range.info ? ` ${range.info}` : ""}:{" "}
              <strong>
                {range.min}–{range.max}
              </strong>
              {unit ? ` ${unit}` : ""}
            </span>
            {status && getStatusTag(status)}
          </div>
        )}
        {status && !range && <div style={{ marginTop: 8 }}>{getStatusTag(status)}</div>}
      </div>
    );
  };

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (!schema) {
    return (
      <div className="fr-root">
        <StyleInjector />
        <div className="fr-empty">
          <div className="fr-empty-card">
            <div className="fr-empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5">
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="fr-empty-title">Form Not Found</p>
            <p className="fr-empty-text">Unable to load the form schema. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = Object.keys(formData).length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fr-root">
      <StyleInjector />
      <div className="fr-shell">
        {/* Header */}
        <div className="fr-header">
          <div className="fr-breadcrumb">
            <span>Forms</span>
            <div className="fr-breadcrumb-dot" />
            <span>{schema.name || "Medical Form"}</span>
          </div>
          <h1 className="fr-title">{schema.name || "Medical Form"}</h1>
          {schema.description && <p className="fr-subtitle">{schema.description}</p>}
          <div className="fr-header-meta">
            <span className="fr-badge">
              <div className="fr-badge-dot" /> Active
            </span>
            <span className="fr-badge">
              {schema.sections?.length || 1} {schema.sections?.length === 1 ? "Section" : "Sections"}
            </span>
          </div>
        </div>

        {/* Static reference range */}
        {schema.hasStaticStandardRange && schema.staticStandardRange && (
          <div className="fr-static-range" style={{ marginBottom: 20 }}>
            <div className="fr-static-range-title">Reference Values</div>
            {schema.staticStandardRange}
          </div>
        )}

        {/* Patient card */}
        <div className="fr-card" style={{ marginBottom: 16 }}>
          <div className="fr-card-header">
            <div className="fr-card-icon">
              <IconUser />
            </div>
            <div>
              <p className="fr-card-title">Patient Information</p>
              <p className="fr-card-desc">Required for accurate range calculations</p>
            </div>
          </div>
          <div className="fr-card-body">
            <div className="fr-grid-2">
              <div className="fr-field" style={{ marginBottom: 0 }}>
                <label className="fr-label">
                  Gender <span className="fr-label-req">*</span>
                </label>
                <select className="fr-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="fr-field" style={{ marginBottom: 0 }}>
                <label className="fr-label">
                  Age <span className="fr-label-req">*</span>
                </label>
                <input
                  className="fr-input"
                  type="number"
                  placeholder="Enter age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>
            <div className="fr-notice">
              <IconInfo />
              <span>Gender and age determine which reference ranges are shown alongside each measurement.</span>
            </div>
          </div>
        </div>

        {/* Form sections card */}
        <div className="fr-card">
          {/* Section tabs */}
          {hasMultipleSections && (
            <div className="fr-tabs">
              {schema.sections.map((section, idx) => (
                <button
                  key={section.name}
                  className={`fr-tab${activeSection === idx ? " active" : ""}`}
                  onClick={() => setActiveSection(idx)}
                >
                  <span className="fr-tab-num">{idx + 1}</span>
                  {section.name}
                </button>
              ))}
            </div>
          )}

          {/* Section bodies */}
          {schema.sections.map((section, sectionIdx) => (
            <div
              key={section.name}
              className={`fr-section-body${hasMultipleSections && activeSection !== sectionIdx ? " fr-section-inactive" : ""}`}
              style={hasMultipleSections && activeSection !== sectionIdx ? { display: "none" } : {}}
            >
              {(section.fields || []).map(renderField)}
            </div>
          ))}

          {/* Footer */}
          <div className="fr-footer">
            <p className="fr-progress-text">
              <strong>{completedCount}</strong> {completedCount === 1 ? "field" : "fields"} completed
            </p>
            <div className="fr-footer-actions">
              <button className="fr-btn fr-btn-ghost" onClick={() => setFormData({})}>
                Clear all
              </button>
              {hasMultipleSections && activeSection < schema.sections.length - 1 ? (
                <button className="fr-btn fr-btn-primary" onClick={() => setActiveSection(activeSection + 1)}>
                  Continue <IconArrow />
                </button>
              ) : (
                <button className="fr-btn fr-btn-primary" onClick={() => console.log("Submit:", formData)}>
                  Submit form <IconArrow />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRenderer;
