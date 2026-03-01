import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
  ClipboardList,
  RotateCcw,
  Send,
  AlertTriangle,
  Eye,
  Activity,
} from "lucide-react";

// ─── Range Logic ──────────────────────────────────────────────────────────────
export function getStandardRange(field, patientAge, patientGender) {
  const sr = field.standardRange;
  if (!sr || sr.type === "none") return null;
  if (sr.type === "simple") return { min: parseFloat(sr.data.min), max: parseFloat(sr.data.max) };
  if (sr.type === "age" && patientAge) {
    const age = parseFloat(patientAge);
    const row = sr.data.find((r) => age >= parseFloat(r.minAge) && age <= parseFloat(r.maxAge));
    if (row) return { min: parseFloat(row.minValue), max: parseFloat(row.maxValue) };
  }
  if (sr.type === "gender" && patientGender) {
    const g = sr.data[patientGender];
    if (g) return { min: parseFloat(g.min), max: parseFloat(g.max) };
  }
  if (sr.type === "combined" && patientAge && patientGender) {
    const age = parseFloat(patientAge);
    const row = sr.data.find(
      (r) => r.gender === patientGender && age >= parseFloat(r.minAge) && age <= parseFloat(r.maxAge),
    );
    if (row) return { min: parseFloat(row.minValue), max: parseFloat(row.maxValue) };
  }
  return null;
}

export function getRangeStatus(value, range) {
  if (!range || value === "" || value === null || value === undefined) return "neutral";
  const v = parseFloat(value);
  if (isNaN(v)) return "neutral";
  if (v < range.min) return "low";
  if (v > range.max) return "high";
  return "normal";
}

// ─── Range Info Tooltip ───────────────────────────────────────────────────────
export function RangeInfoTooltip({ field }) {
  const [open, setOpen] = useState(false);
  const sr = field.standardRange;
  if (!sr || sr.type === "none") return null;
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-slate-300 hover:text-slate-500 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-2xl border border-slate-700">
          <p className="font-bold mb-2 text-slate-300 uppercase tracking-widest text-[10px]">Reference Ranges</p>
          {sr.type === "simple" && (
            <p className="text-slate-400">
              {sr.data.min} – {sr.data.max} {field.unit || ""}
            </p>
          )}
          {sr.type === "age" &&
            Array.isArray(sr.data) &&
            sr.data.map((r, i) => (
              <div key={i} className="text-slate-400 leading-5">
                Age {r.minAge}–{r.maxAge === 999 ? "∞" : r.maxAge}:{" "}
                <span className="text-white font-medium">
                  {r.minValue}–{r.maxValue}
                </span>
              </div>
            ))}
          {sr.type === "gender" &&
            sr.data &&
            Object.entries(sr.data).map(([g, v]) => (
              <div key={g} className="text-slate-400 leading-5 capitalize">
                {g}:{" "}
                <span className="text-white font-medium">
                  {v.min}–{v.max}
                </span>
              </div>
            ))}
          {sr.type === "combined" &&
            Array.isArray(sr.data) &&
            sr.data.map((r, i) => (
              <div key={i} className="text-slate-400 leading-5 capitalize">
                {r.gender} {r.minAge}–{r.maxAge === 999 ? "∞" : r.maxAge}yr:{" "}
                <span className="text-white font-medium">
                  {r.minValue}–{r.maxValue}
                </span>
              </div>
            ))}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

// ─── Number Field ─────────────────────────────────────────────────────────────
function NumberField({ field, value, onChange, error, patientAge, patientGender }) {
  const range = getStandardRange(field, patientAge, patientGender);
  const status = getRangeStatus(value, range);
  const hasValue = value !== "" && value !== null && value !== undefined;

  const needsContext =
    ((field.standardRange?.type === "age" || field.standardRange?.type === "combined") && !patientAge) ||
    ((field.standardRange?.type === "gender" || field.standardRange?.type === "combined") && !patientGender);

  const inputCls = error
    ? "border-red-300 ring-2 ring-red-100 bg-red-50/30"
    : hasValue
      ? {
          normal: "border-emerald-300 ring-2 ring-emerald-50",
          low: "border-orange-400 ring-2 ring-orange-50",
          high: "border-red-400 ring-2 ring-red-50",
          neutral: "border-slate-200",
        }[status]
      : "border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50";

  const statusCfg =
    hasValue && range
      ? {
          normal: {
            cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
            icon: <CheckCircle2 className="w-3 h-3" />,
            label: "Normal",
          },
          low: {
            cls: "bg-orange-50 text-orange-700 border-orange-200",
            icon: <TrendingDown className="w-3 h-3" />,
            label: "Below Range",
          },
          high: {
            cls: "bg-red-50 text-red-700 border-red-200",
            icon: <TrendingUp className="w-3 h-3" />,
            label: "Above Range",
          },
          neutral: {
            cls: "bg-slate-50 text-slate-500 border-slate-200",
            icon: <Minus className="w-3 h-3" />,
            label: "—",
          },
        }[status]
      : null;

  return (
    <div className="space-y-1.5">
      <div className={`relative flex items-center rounded-lg border transition-all bg-white ${inputCls}`}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          className="w-full pl-3.5 pr-2 py-2.5 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-300 font-semibold"
        />
        {field.unit && (
          <span className="absolute right-3 text-xs font-bold text-slate-400 pointer-events-none select-none uppercase tracking-wide">
            {field.unit}
          </span>
        )}
      </div>

      {/* Range ref + status badge row */}
      <div className="flex items-center gap-2 flex-wrap min-h-[18px]">
        {range ? (
          <span className="text-xs text-slate-400">
            Std. Range:{" "}
            <span className="text-slate-600 font-semibold">
              {range.min} – {range.max}
              {field.unit ? ` ${field.unit}` : ""}
            </span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
        {statusCfg && (
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold border ${statusCfg.cls}`}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        )}
        <RangeInfoTooltip field={field} />
        {needsContext && !range && field.standardRange?.type !== "none" && (
          <span className="text-xs text-amber-500 flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3 h-3" />
            {!patientAge && (field.standardRange?.type === "age" || field.standardRange?.type === "combined")
              ? "Enter age for range"
              : "Select gender for range"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Radio Field ──────────────────────────────────────────────────────────────
function RadioField({ options = [], value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
            value === opt
              ? "bg-slate-900 border-slate-900 text-white shadow-sm"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
          }`}
        >
          <span
            className={`inline-block w-3 h-3 rounded-full border-2 mr-2 align-middle transition-all ${value === opt ? "border-white bg-white" : "border-slate-300"}`}
            style={{ boxShadow: value === opt ? "inset 0 0 0 2.5px #0f172a" : "none" }}
          />
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Dropdown Field ───────────────────────────────────────────────────────────
function DropdownField({ options = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 border rounded-lg text-sm transition-all bg-white ${open ? "border-blue-400 ring-2 ring-blue-50" : "border-slate-200 hover:border-slate-300"}`}
      >
        <span className={value ? "text-slate-800 font-semibold" : "text-slate-400"}>{value || "Select an option"}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${value === opt ? "bg-slate-900 text-white font-medium" : "text-slate-700 hover:bg-slate-50"}`}
            >
              {opt}
              {value === opt && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Checkbox Field ───────────────────────────────────────────────────────────
function CheckboxField({ options = [], value = [], onChange }) {
  const toggle = (opt) => onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const checked = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              checked
                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-800"
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-white border-white" : "border-slate-300"}`}
            >
              {checked && (
                <svg className="w-2 h-2 text-slate-900" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Field Wrapper ────────────────────────────────────────────────────────────
function FieldWrapper({ field, children, error }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{field.name}</label>
        {field.required && <span className="text-red-400 text-[10px] leading-none font-bold">*</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1 font-medium">
          <XCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function SectionPanel({ section, sectionIndex, values, onChange, errors, patientAge, patientGender, hideTitle }) {
  const [collapsed, setCollapsed] = useState(false);

  const fieldCount = section.fields.length;
  const filledCount = section.fields.filter((f) => {
    const key = `${sectionIndex}_${f.name}`;
    const v = values[key];
    return Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined && v !== null;
  }).length;
  const hasError = section.fields.some((f) => errors[`${sectionIndex}_${f.name}`]);

  const fieldsGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-5">
      {section.fields.map((field) => {
        const key = `${sectionIndex}_${field.name}`;
        const val = values[key] ?? (field.type === "checkbox" ? [] : "");
        const err = errors[key];
        const spanFull = field.type === "textarea" || field.type === "checkbox" || field.type === "radio";
        return (
          <div
            key={key}
            className={spanFull ? "col-span-2 sm:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6" : ""}
          >
            <FieldWrapper field={field} error={err}>
              {field.type === "number" && (
                <NumberField
                  field={field}
                  value={val}
                  onChange={(v) => onChange(key, v)}
                  error={err}
                  patientAge={patientAge}
                  patientGender={patientGender}
                />
              )}
              {field.type === "radio" && (
                <RadioField options={field.options} value={val} onChange={(v) => onChange(key, v)} />
              )}
              {field.type === "select" && (
                <DropdownField options={field.options} value={val} onChange={(v) => onChange(key, v)} />
              )}
              {field.type === "checkbox" && (
                <CheckboxField options={field.options} value={val} onChange={(v) => onChange(key, v)} />
              )}
              {field.type === "textarea" && (
                <div>
                  <textarea
                    value={val}
                    onChange={(e) => onChange(key, e.target.value)}
                    maxLength={field.maxLength}
                    rows={3}
                    placeholder="Enter notes..."
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm resize-none outline-none transition-all text-slate-800 placeholder-slate-300 bg-white ${
                      err
                        ? "border-red-300 ring-2 ring-red-50"
                        : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    }`}
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">
                    {(val || "").length}/{field.maxLength}
                  </p>
                </div>
              )}
              {field.type === "input" && (
                <div>
                  <input
                    type="text"
                    value={val}
                    onChange={(e) => onChange(key, e.target.value)}
                    maxLength={field.maxLength}
                    placeholder="Enter text..."
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm outline-none transition-all text-slate-800 placeholder-slate-300 bg-white ${
                      err
                        ? "border-red-300 ring-2 ring-red-50"
                        : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
                    }`}
                  />
                  <p className="text-xs text-slate-400 text-right mt-1">
                    {(val || "").length}/{field.maxLength}
                  </p>
                </div>
              )}
            </FieldWrapper>
          </div>
        );
      })}
    </div>
  );

  // Single section: no card wrapper, no title
  if (hideTitle) return <div>{fieldsGrid}</div>;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${hasError ? "border-red-200" : "border-slate-200"}`}
    >
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left border-b border-slate-200"
      >
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ${hasError ? "bg-red-500" : "bg-slate-700"}`}
        >
          {sectionIndex + 1}
        </div>
        <span className="flex-1 font-semibold text-slate-700 text-sm">{section.name}</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${filledCount === fieldCount ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
        >
          {filledCount}/{fieldCount}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
        />
      </button>
      <div className="h-0.5 bg-slate-100">
        <div
          className={`h-full transition-all duration-700 ${filledCount === fieldCount && fieldCount > 0 ? "bg-emerald-400" : "bg-blue-400"}`}
          style={{ width: fieldCount > 0 ? `${(filledCount / fieldCount) * 100}%` : "0%" }}
        />
      </div>
      {!collapsed && <div className="p-5 bg-white">{fieldsGrid}</div>}
    </div>
  );
}

// ─── Results Modal ────────────────────────────────────────────────────────────
function ResultsSummaryModal({ schema, values, patientAge, patientGender, onClose }) {
  const isSingleSection = schema.sections.length === 1;
  const results = [];
  schema.sections.forEach((sec, si) => {
    sec.fields.forEach((field) => {
      const key = `${si}_${field.name}`;
      const val = values[key];
      if (val === "" || val === undefined || val === null || (Array.isArray(val) && val.length === 0)) return;
      const range = field.type === "number" ? getStandardRange(field, patientAge, patientGender) : null;
      const status = field.type === "number" ? getRangeStatus(val, range) : null;
      results.push({ section: sec.name, field, val, range, status, key });
    });
  });
  const abnormal = results.filter((r) => r.status === "high" || r.status === "low");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">{schema.name}</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                {results.length} value{results.length !== 1 ? "s" : ""} · {abnormal.length} flagged
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>

        {abnormal.length > 0 && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-800 font-semibold">
              {abnormal.length} value{abnormal.length > 1 ? "s" : ""} outside reference range
            </p>
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No values recorded</p>
            </div>
          ) : (
            schema.sections.map((sec, si) => {
              const rows = results.filter((r) => r.section === sec.name);
              if (!rows.length) return null;
              return (
                <div key={si}>
                  {!isSingleSection && (
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                      {sec.name}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    {rows.map((r) => {
                      const isHigh = r.status === "high";
                      const isLow = r.status === "low";
                      const isNormal = r.status === "normal";
                      return (
                        <div
                          key={r.key}
                          className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
                            isHigh
                              ? "bg-red-50 border-red-200"
                              : isLow
                                ? "bg-orange-50 border-orange-200"
                                : isNormal
                                  ? "bg-emerald-50 border-emerald-200"
                                  : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-wide w-28 truncate">
                              {r.field.name}
                            </span>
                            <span className="font-bold text-slate-800">
                              {Array.isArray(r.val) ? r.val.join(", ") : r.val}
                              {r.field.unit && (
                                <span className="text-slate-400 font-normal ml-1 text-xs">{r.field.unit}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {r.range && (
                              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                                Ref: {r.range.min}–{r.range.max}
                              </span>
                            )}
                            {isHigh && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                <TrendingUp className="w-3 h-3" />
                                High
                              </span>
                            )}
                            {isLow && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                <TrendingDown className="w-3 h-3" />
                                Low
                              </span>
                            )}
                            {isNormal && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Normal
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function SchemaRenderer({ schema }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [showResults, setShowResults] = useState(false);

  if (!schema || !schema.sections) return null;

  const isSingleSection = schema.sections.length === 1;

  useEffect(() => {
    setValues({});
    setErrors({});
  }, [JSON.stringify(schema?.sections)]);

  const handleChange = (key, val) => {
    setValues((v) => ({ ...v, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    schema.sections.forEach((sec, si) => {
      sec.fields.forEach((field) => {
        if (!field.required) return;
        const key = `${si}_${field.name}`;
        const val = values[key];
        if (field.type === "checkbox") {
          if (!val || val.length === 0) errs[key] = "At least one option is required";
        } else {
          if (val === "" || val === undefined || val === null) errs[key] = "This field is required";
        }
      });
    });
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setShowResults(true);
  };

  const needsContext = schema.sections.some((sec) =>
    sec.fields.some(
      (f) => f.type === "number" && f.standardRange?.type !== "none" && f.standardRange?.type !== "simple",
    ),
  );

  const hasFields = schema.sections.some((s) => s.fields.length > 0);

  const requiredKeys = schema.sections.flatMap((sec, si) =>
    sec.fields.filter((f) => f.required).map((f) => `${si}_${f.name}`),
  );
  const filledRequired = requiredKeys.filter((k) => {
    const v = values[k];
    return Array.isArray(v) ? v.length > 0 : v !== "" && v !== undefined;
  });
  const progress = requiredKeys.length > 0 ? (filledRequired.length / requiredKeys.length) * 100 : 100;

  const abnormalCount = schema.sections
    .flatMap((sec, si) =>
      sec.fields
        .filter((f) => f.type === "number")
        .map((f) => {
          const range = getStandardRange(f, patientAge, patientGender);
          return getRangeStatus(values[`${si}_${f.name}`], range);
        }),
    )
    .filter((s) => s === "high" || s === "low").length;

  if (!hasFields) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
          <Eye className="w-5 h-5 text-slate-300" />
        </div>
        <p className="text-slate-500 font-semibold text-sm">No fields configured</p>
        <p className="text-slate-400 text-xs mt-1">Add fields in the Builder to preview</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Header ── */}
      <div className="pb-5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Lab Report Form</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{schema.name || "Untitled Schema"}</h1>
            {schema.description && <p className="text-sm text-slate-500 mt-1">{schema.description}</p>}
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-md font-bold border uppercase tracking-wide flex-shrink-0 ${
              schema.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {schema.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {requiredKeys.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Completion</span>
              <span className={`font-bold ${progress === 100 ? "text-emerald-600" : "text-slate-500"}`}>
                {filledRequired.length} / {requiredKeys.length} required
              </span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Abnormal Alert ── */}
      {abnormalCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-semibold">
            {abnormalCount} value{abnormalCount > 1 ? "s" : ""} outside reference range
          </p>
        </div>
      )}

      {/* ── Patient Context ── */}
      {needsContext && (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patient Context</span>
            <span className="text-xs text-slate-400 ml-auto">Required for dynamic reference ranges</span>
          </div>
          <div className="px-5 py-4 bg-white grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Age</label>
              <div className="relative">
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 35"
                  min="0"
                  max="150"
                  className="w-full pl-3.5 pr-12 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-400 text-slate-800 bg-white font-medium"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                  yrs
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Gender</label>
              <div className="flex gap-2">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPatientGender(patientGender === g ? "" : g)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      patientGender === g
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {g === "male" ? "♂ Male" : "♀ Female"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sections ── */}
      <div className={isSingleSection ? "" : "space-y-3"}>
        {schema.sections.map((section, si) => (
          <SectionPanel
            key={si}
            section={section}
            sectionIndex={si}
            values={values}
            onChange={handleChange}
            errors={errors}
            patientAge={patientAge}
            patientGender={patientGender}
            hideTitle={isSingleSection}
          />
        ))}
      </div>

      {/* ── Static Range Note ── */}
      {schema.hasStaticStandardRange && schema.staticStandardRange && (
        <div className="px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-0.5">Standard Reference</p>
            <p className="text-xs text-amber-600">{schema.staticStandardRange}</p>
          </div>
        </div>
      )}

      {/* ── Validation Errors ── */}
      {Object.keys(errors).length > 0 && (
        <div className="px-4 py-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-red-700">Validation errors</p>
            <p className="text-xs text-red-500 mt-0.5">
              {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s" : ""} require attention
            </p>
          </div>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setValues({});
            setErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:bg-slate-50 transition-all font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm"
        >
          <Send className="w-3.5 h-3.5" /> Submit Report
        </button>
      </div>

      {showResults && (
        <ResultsSummaryModal
          schema={schema}
          values={values}
          patientAge={patientAge}
          patientGender={patientGender}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
