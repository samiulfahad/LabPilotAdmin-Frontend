/**
 * SchemaFormRenderer.jsx
 *
 * A self-contained, production-grade component that renders any schema
 * produced by SchemaBuilder. Pass `schema` as a prop.
 *
 * Props:
 *   schema   – the schema object from SchemaBuilder / store
 *   onSubmit – optional callback(formData, { gender, age }) when form is submitted
 */

import { useState, useEffect, useCallback, useMemo } from "react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getRange(sr, gender, age) {
  if (!sr) return null;
  const { type, data } = sr;
  const ageNum = parseFloat(age);

  if (type === "simple") {
    const min = parseFloat(data.min),
      max = parseFloat(data.max);
    return isNaN(min) || isNaN(max) ? null : { min, max, label: "" };
  }
  if (type === "gender") {
    if (!gender) return null;
    const g = data[gender.toLowerCase()];
    if (!g) return null;
    return { min: parseFloat(g.min), max: parseFloat(g.max), label: `for ${cap(gender)}` };
  }
  if (type === "age") {
    if (!age || isNaN(ageNum)) return null;
    for (const e of data) {
      const hi = e.maxAge !== 999 ? parseFloat(e.maxAge) : Infinity;
      if (ageNum >= parseFloat(e.minAge) && ageNum <= hi)
        return {
          min: parseFloat(e.minValue),
          max: parseFloat(e.maxValue),
          label: `age ${e.minAge}–${e.maxAge === 999 ? "99+" : e.maxAge}`,
        };
    }
    return null;
  }
  if (type === "combined") {
    if (!gender || !age || isNaN(ageNum)) return null;
    for (const e of data) {
      if (e.gender.toLowerCase() !== gender.toLowerCase()) continue;
      const hi = e.maxAge !== 999 ? parseFloat(e.maxAge) : Infinity;
      if (ageNum >= parseFloat(e.minAge) && ageNum <= hi)
        return {
          min: parseFloat(e.minValue),
          max: parseFloat(e.maxValue),
          label: `${cap(gender)}, age ${e.minAge}–${e.maxAge === 999 ? "99+" : e.maxAge}`,
        };
    }
    return null;
  }
  return null;
}

function computeStatus(field, value, gender, age) {
  if (field.type !== "number" || !field.standardRange) return null;
  const range = getRange(field.standardRange, gender, age);
  if (!range) return null;
  const n = parseFloat(value);
  if (isNaN(n)) return null;
  if (n < range.min) return "below";
  if (n > range.max) return "above";
  return "within";
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

// ─── base input styles ────────────────────────────────────────────────────────

const inputCls = `
  w-full bg-white border border-slate-200 rounded-xl px-4 py-3
  text-slate-800 text-sm font-medium placeholder-slate-400
  outline-none transition-all duration-200
  focus:border-teal-400 focus:ring-4 focus:ring-teal-50
  hover:border-slate-300
`
  .trim()
  .replace(/\s+/g, " ");

const labelCls = "block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2";

// ─── sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status, range, unit }) {
  if (!status) return null;
  const isOk = status === "within";
  return (
    <div
      className={`mt-2 flex items-center gap-2 text-xs font-semibold rounded-lg px-3 py-2 
      ${isOk ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOk ? "bg-emerald-500" : "bg-rose-500"}`} />
      {isOk
        ? `Within range ${range ? `(${range.min}–${range.max}${unit ? " " + unit : ""})` : ""}`
        : `${cap(status)} normal range ${range ? `(${range.min}–${range.max}${unit ? " " + unit : ""})` : ""}`}
      {range?.label && <span className="font-normal opacity-70 ml-1">· {range.label}</span>}
    </div>
  );
}

function RangeHint({ range, unit }) {
  if (!range) return null;
  return (
    <p className="mt-1.5 text-xs text-slate-400">
      Ref range{range.label ? ` (${range.label})` : ""}: {range.min}–{range.max}
      {unit ? ` ${unit}` : ""}
    </p>
  );
}

function FieldWrapper({ label, required, children, hint, status, range, unit }) {
  return (
    <div className="group">
      <label className={labelCls}>
        {label}
        {required && <span className="ml-1 text-rose-400">*</span>}
      </label>
      {children}
      {status ? <StatusBadge status={status} range={range} unit={unit} /> : <RangeHint range={range} unit={unit} />}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ─── field renderers ──────────────────────────────────────────────────────────

function TextField({ field, value, onChange }) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={field.maxLength}
      required={field.required}
      placeholder={`Enter ${field.name.toLowerCase()}…`}
    />
  );
}

function NumberField({ field, value, onChange }) {
  return (
    <div className="relative">
      <input
        type="number"
        className={`${inputCls} ${field.unit ? "pr-16" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
        placeholder="0"
      />
      {field.unit && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
          {field.unit}
        </span>
      )}
    </div>
  );
}

function TextareaField({ field, value, onChange }) {
  return (
    <textarea
      className={`${inputCls} min-h-[100px] resize-y`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={field.maxLength}
      required={field.required}
      placeholder={`Enter ${field.name.toLowerCase()}…`}
    />
  );
}

function SelectField({ field, value, onChange }) {
  return (
    <div className="relative">
      <select
        className={`${inputCls} appearance-none cursor-pointer pr-10`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={field.required}
      >
        <option value="">Select an option</option>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function RadioField({ field, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {(field.options || []).map((opt) => {
        const checked = value === opt;
        return (
          <label
            key={opt}
            className={`
            flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer
            text-sm font-medium transition-all duration-150 select-none
            ${
              checked
                ? "border-teal-400 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }
          `}
          >
            <span
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all
              ${checked ? "border-teal-500 bg-teal-500 shadow-[inset_0_0_0_2px_white]" : "border-slate-300 bg-white"}`}
            />
            <input
              type="radio"
              name={field.name}
              value={opt}
              checked={checked}
              onChange={() => onChange(opt)}
              className="sr-only"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function CheckboxField({ field, value, onChange }) {
  const vals = Array.isArray(value) ? value : [];
  const toggle = (opt) => onChange(vals.includes(opt) ? vals.filter((v) => v !== opt) : [...vals, opt]);
  return (
    <div className="flex flex-col gap-2.5">
      {(field.options || []).map((opt) => {
        const checked = vals.includes(opt);
        return (
          <label
            key={opt}
            className={`
            flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer
            text-sm font-medium transition-all duration-150 select-none
            ${
              checked
                ? "border-teal-400 bg-teal-50 text-teal-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }
          `}
          >
            <span
              className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all
              ${checked ? "border-teal-500 bg-teal-500" : "border-slate-300 bg-white"}`}
            >
              {checked && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <input type="checkbox" value={opt} checked={checked} onChange={() => toggle(opt)} className="sr-only" />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

// ─── section tab component ────────────────────────────────────────────────────

function SectionTab({ label, active, onClick, hasErrors }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap
        ${
          active
            ? "bg-teal-600 text-white shadow-md shadow-teal-200"
            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        }`}
    >
      {label}
      {hasErrors && !active && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white" />
      )}
    </button>
  );
}

// ─── patient context panel ────────────────────────────────────────────────────

function PatientContext({ gender, age, onGenderChange, onAgeChange }) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div>
        <label className={labelCls}>Gender</label>
        <div className="relative">
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
            className={`${inputCls} appearance-none pr-10 cursor-pointer`}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div>
        <label className={labelCls}>Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => onAgeChange(e.target.value)}
          min={0}
          max={150}
          placeholder="yrs"
          className={inputCls}
        />
      </div>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function SchemaFormRenderer({ schema, onSubmit }) {
  const sections = schema?.sections || [];
  const isMultiSection = sections.length > 1;

  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Compute statuses for all number fields
  const statuses = useMemo(() => {
    const s = {};
    sections.forEach((section) => {
      (section.fields || []).forEach((field) => {
        const v = formData[field.name];
        if (v !== undefined && v !== "") s[field.name] = computeStatus(field, v, gender, age);
      });
    });
    return s;
  }, [formData, gender, age, sections]);

  const handleChange = useCallback((fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    setErrors((prev) => {
      const e = { ...prev };
      delete e[fieldName];
      return e;
    });
  }, []);

  const validate = () => {
    const errs = {};
    sections.forEach((section) => {
      (section.fields || []).forEach((field) => {
        if (!field.required) return;
        const val = formData[field.name];
        if (field.type === "checkbox") {
          if (!val || val.length === 0) errs[field.name] = "Required";
        } else if (!val && val !== 0) {
          errs[field.name] = "Required";
        }
      });
    });
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Jump to first section with errors
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].fields?.some((f) => errs[f.name])) {
          setActiveSection(i);
          break;
        }
      }
      return;
    }
    setSubmitted(true);
    onSubmit?.(formData, { gender, age });
  };

  const handleReset = () => {
    setFormData({});
    setErrors({});
    setGender("");
    setAge("");
    setSubmitted(false);
    setActiveSection(0);
  };

  const renderField = (field) => {
    const value = formData[field.name] ?? (field.type === "checkbox" ? [] : "");
    const range = getRange(field.standardRange, gender, age);
    const status = statuses[field.name];
    const error = errors[field.name];

    const label = `${field.name}${field.unit ? ` (${field.unit})` : ""}`;

    let input;
    switch (field.type) {
      case "input":
        input = <TextField field={field} value={value} onChange={(v) => handleChange(field.name, v)} />;
        break;
      case "number":
        input = <NumberField field={field} value={value} onChange={(v) => handleChange(field.name, v)} />;
        break;
      case "textarea":
        input = <TextareaField field={field} value={value} onChange={(v) => handleChange(field.name, v)} />;
        break;
      case "select":
        input = <SelectField field={field} value={value} onChange={(v) => handleChange(field.name, v)} />;
        break;
      case "radio":
        input = <RadioField field={field} value={value} onChange={(v) => handleChange(field.name, v)} />;
        break;
      case "checkbox":
        input = <CheckboxField field={field} value={value} onChange={(v) => handleChange(field.name, v)} />;
        break;
      default:
        return null;
    }

    return (
      <div key={field.name} className={`transition-all duration-200 ${error ? "relative" : ""}`}>
        <FieldWrapper label={label} required={field.required} status={status} range={range} unit={field.unit}>
          <div className={error ? "ring-2 ring-rose-300 rounded-xl" : ""}>{input}</div>
        </FieldWrapper>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium pl-1">{error}</p>}
      </div>
    );
  };

  // ── success state ──
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Form Submitted</h3>
        <p className="text-sm text-slate-500 mb-6">All data has been recorded successfully.</p>
        <button
          onClick={handleReset}
          className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
        >
          Fill Again
        </button>
      </div>
    );
  }

  const currentSection = sections[activeSection];

  return (
    <div className="font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .schema-form * { font-family: 'DM Sans', sans-serif; }
        .schema-form input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        .schema-form input[type=number] { -moz-appearance: textfield; }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .section-animate { animation: fadeSlideIn 0.25s ease both; }
      `}</style>

      <form className="schema-form" onSubmit={handleSubmit} noValidate>
        {/* ── Header ── */}
        <div className="mb-8">
          {schema.name && <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{schema.name}</h2>}
          {schema.description && <p className="mt-1 text-sm text-slate-500">{schema.description}</p>}
          {schema.hasStaticStandardRange && schema.staticStandardRange && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
              <p className="font-semibold mb-1 text-xs uppercase tracking-widest text-amber-600">Reference Values</p>
              <p className="whitespace-pre-wrap leading-relaxed">{schema.staticStandardRange}</p>
            </div>
          )}
        </div>

        {/* ── Patient context ── */}
        <div className="mb-8">
          <p className={`${labelCls} mb-3`}>Patient Details</p>
          <PatientContext gender={gender} age={age} onGenderChange={setGender} onAgeChange={setAge} />
        </div>

        {/* ── Section tabs (multi-section only) ── */}
        {isMultiSection && (
          <div className="flex flex-wrap gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl">
            {sections.map((sec, i) => {
              const hasErr = sec.fields?.some((f) => errors[f.name]);
              return (
                <SectionTab
                  key={sec.name}
                  label={sec.name}
                  active={activeSection === i}
                  onClick={() => setActiveSection(i)}
                  hasErrors={hasErr}
                />
              );
            })}
          </div>
        )}

        {/* ── Fields ── */}
        {currentSection && (
          <div key={currentSection.name} className="section-animate space-y-6">
            {isMultiSection && (
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-base font-bold text-slate-700">{currentSection.name}</h3>
                <span className="text-xs text-slate-400">
                  {currentSection.fields?.length || 0} field{currentSection.fields?.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {(currentSection.fields || []).length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-8">No fields in this section.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(currentSection.fields || []).map((field) => {
                  // Wide fields: textarea, checkbox, radio, number with combined range
                  const isWide = ["textarea", "checkbox", "radio"].includes(field.type);
                  return (
                    <div key={field.name} className={isWide ? "md:col-span-2" : ""}>
                      {renderField(field)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation / submit ── */}
        <div className="mt-10 flex items-center justify-between gap-4">
          {isMultiSection && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveSection((i) => Math.max(0, i - 1))}
                disabled={activeSection === 0}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl
                  hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← Back
              </button>
              {activeSection < sections.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveSection((i) => Math.min(sections.length - 1, i + 1))}
                  className="px-5 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 rounded-xl
                    hover:bg-teal-100 transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          )}

          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700
                bg-transparent hover:bg-slate-100 rounded-xl transition-all"
            >
              Clear
            </button>
            {(!isMultiSection || activeSection === sections.length - 1) && (
              <button
                type="submit"
                className="px-8 py-2.5 text-sm font-bold text-white bg-teal-600 rounded-xl
                  hover:bg-teal-700 active:scale-95 transition-all shadow-md shadow-teal-100"
              >
                Submit
              </button>
            )}
          </div>
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <p className="mt-4 text-xs text-rose-500 font-medium text-center">
            Please fill in all required fields before submitting.
          </p>
        )}
      </form>
    </div>
  );
}
