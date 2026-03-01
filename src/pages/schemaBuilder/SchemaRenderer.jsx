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

// ─── Shared UI Primitives ─────────────────────────────────────────────────────
export function RangeBadge({ status, range, unit }) {
  if (!range) return null;
  const cfg = {
    normal: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: "Normal",
    },
    low: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: <TrendingDown className="w-3.5 h-3.5" />,
      label: "Low",
    },
    high: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      label: "High",
    },
    neutral: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      text: "text-gray-500",
      icon: <Minus className="w-3.5 h-3.5" />,
      label: `${range.min}\u2013${range.max}${unit ? " " + unit : ""}`,
    },
  };
  const c = cfg[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.border} ${c.text}`}
    >
      {c.icon}
      {status === "neutral"
        ? c.label
        : `${c.label} \u00b7 ref: ${range.min}\u2013${range.max}${unit ? " " + unit : ""}`}
    </span>
  );
}

export function RangeInfoTooltip({ field }) {
  const [open, setOpen] = useState(false);
  const sr = field.standardRange;
  if (!sr || sr.type === "none") return null;
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="text-gray-300 hover:text-blue-400 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-900 text-white text-xs rounded-xl p-3 shadow-2xl">
          <p className="font-semibold mb-1.5 text-gray-200">Reference Ranges</p>
          {sr.type === "simple" && (
            <p className="text-gray-400">
              {sr.data.min} \u2013 {sr.data.max} {field.unit || ""}
            </p>
          )}
          {sr.type === "age" &&
            Array.isArray(sr.data) &&
            sr.data.map((r, i) => (
              <div key={i} className="text-gray-400 leading-5">
                Age {r.minAge}\u2013{r.maxAge === 999 ? "\u221e" : r.maxAge}:{" "}
                <span className="text-white">
                  {r.minValue}\u2013{r.maxValue}
                </span>
              </div>
            ))}
          {sr.type === "gender" &&
            sr.data &&
            Object.entries(sr.data).map(([g, v]) => (
              <div key={g} className="text-gray-400 leading-5 capitalize">
                {g}:{" "}
                <span className="text-white">
                  {v.min}\u2013{v.max}
                </span>
              </div>
            ))}
          {sr.type === "combined" &&
            Array.isArray(sr.data) &&
            sr.data.map((r, i) => (
              <div key={i} className="text-gray-400 leading-5 capitalize">
                {r.gender} {r.minAge}\u2013{r.maxAge === 999 ? "\u221e" : r.maxAge}yr:{" "}
                <span className="text-white">
                  {r.minValue}\u2013{r.maxValue}
                </span>
              </div>
            ))}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────
function NumberField({ field, value, onChange, error, patientAge, patientGender }) {
  const range = getStandardRange(field, patientAge, patientGender);
  const status = getRangeStatus(value, range);
  const needsContext =
    ((field.standardRange?.type === "age" || field.standardRange?.type === "combined") && !patientAge) ||
    ((field.standardRange?.type === "gender" || field.standardRange?.type === "combined") && !patientGender);
  const statusBorder = {
    normal: "border-emerald-300 ring-2 ring-emerald-100",
    low: "border-blue-300 ring-2 ring-blue-100",
    high: "border-red-300 ring-2 ring-red-100",
    neutral: "border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400",
  };
  return (
    <div className="space-y-1.5">
      <div className="relative flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value"
          className={`w-full pl-3 pr-20 py-2.5 border rounded-xl text-sm transition-all outline-none bg-white ${
            error ? "border-red-400 ring-2 ring-red-100" : statusBorder[status]
          }`}
        />
        {field.unit && (
          <span className="absolute right-3 text-xs font-medium text-gray-400 pointer-events-none select-none">
            {field.unit}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <RangeBadge status={value !== "" ? status : "neutral"} range={range} unit={field.unit} />
        <RangeInfoTooltip field={field} />
        {needsContext && range === null && field.standardRange?.type !== "none" && (
          <span className="text-xs text-amber-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {!patientAge && (field.standardRange?.type === "age" || field.standardRange?.type === "combined")
              ? "Enter patient age"
              : "Select patient gender"}
          </span>
        )}
      </div>
    </div>
  );
}

function RadioField({ options = [], value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(value === opt ? "" : opt)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            value === opt
              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          <span
            className={`inline-block w-3.5 h-3.5 rounded-full border-2 mr-2 align-middle transition-all ${value === opt ? "border-white bg-white" : "border-gray-300"}`}
            style={{ boxShadow: value === opt ? "inset 0 0 0 3px #2563eb" : "none" }}
          />
          {opt}
        </button>
      ))}
    </div>
  );
}

function DropdownField({ options = [], value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-xl text-sm transition-all bg-white ${open ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className={value ? "text-gray-800 font-medium" : "text-gray-400"}>{value || "Select an option..."}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${value === opt ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
            >
              {opt}
              {value === opt && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
              checked
                ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? "bg-white border-white" : "border-gray-300"}`}
            >
              {checked && (
                <svg className="w-2.5 h-2.5 text-indigo-600" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="currentColor"
                    strokeWidth="2"
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

function FieldWrapper({ field, children, error }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-semibold text-gray-700">{field.name}</label>
        {field.required && <span className="text-red-400 text-xs">*</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function SectionPanel({ section, sectionIndex, values, onChange, errors, patientAge, patientGender }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100 hover:from-slate-100 transition-all"
      >
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-xs font-bold">{sectionIndex + 1}</span>
        </div>
        <div className="flex-1 text-left">
          <span className="font-semibold text-gray-800 text-sm">{section.name}</span>
          <span className="ml-2 text-xs text-gray-400">
            {section.fields.length} field{section.fields.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? "" : "rotate-180"}`} />
      </button>
      {!collapsed && (
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {section.fields.map((field) => {
            const key = `${sectionIndex}_${field.name}`;
            const val = values[key] ?? (field.type === "checkbox" ? [] : "");
            const err = errors[key];
            const spanFull = field.type === "textarea" || field.type === "checkbox" || field.type === "radio";
            return (
              <div key={key} className={spanFull ? "md:col-span-2" : ""}>
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
                        className={`w-full px-3 py-2.5 border rounded-xl text-sm resize-none outline-none transition-all ${
                          err
                            ? "border-red-400 ring-2 ring-red-100"
                            : "border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        }`}
                      />
                      <p className="text-xs text-gray-400 text-right mt-0.5">
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
                        className={`w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition-all ${
                          err
                            ? "border-red-400 ring-2 ring-red-100"
                            : "border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                        }`}
                      />
                      <p className="text-xs text-gray-400 text-right mt-0.5">
                        {(val || "").length}/{field.maxLength}
                      </p>
                    </div>
                  )}
                </FieldWrapper>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultsSummaryModal({ schema, values, patientAge, patientGender, onClose }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-lg">{schema.name} \u2014 Results</h2>
              <p className="text-blue-200 text-xs">
                {results.length} value{results.length !== 1 ? "s" : ""} recorded \u00b7 {abnormal.length} abnormal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white text-lg leading-none"
          >
            \u2715
          </button>
        </div>
        {abnormal.length > 0 && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              {abnormal.length} value{abnormal.length > 1 ? "s are" : " is"} outside the reference range
            </p>
          </div>
        )}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No values recorded yet</p>
            </div>
          ) : (
            schema.sections.map((sec, si) => {
              const rows = results.filter((r) => r.section === sec.name);
              if (!rows.length) return null;
              return (
                <div key={si}>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{sec.name}</p>
                  <div className="space-y-2">
                    {rows.map((r) => (
                      <div
                        key={r.key}
                        className={`flex items-start justify-between px-4 py-3 rounded-xl border text-sm ${
                          r.status === "high"
                            ? "bg-red-50 border-red-200"
                            : r.status === "low"
                              ? "bg-blue-50 border-blue-200"
                              : r.status === "normal"
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div>
                          <span className="font-medium text-gray-800">{r.field.name}</span>
                          <div className="mt-0.5">
                            {Array.isArray(r.val) ? (
                              <span className="text-gray-600">{r.val.join(", ")}</span>
                            ) : (
                              <span className="text-gray-700 font-semibold">
                                {r.val}
                                {r.field.unit ? ` ${r.field.unit}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        {r.status && r.status !== "neutral" && (
                          <RangeBadge status={r.status} range={r.range} unit={r.field.unit} />
                        )}
                        {r.range && r.status === "neutral" && (
                          <span className="text-xs text-gray-400">
                            ref: {r.range.min}\u2013{r.range.max}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors"
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

  if (!schema || !hasFields) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Eye className="w-6 h-6 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">No fields to preview</p>
        <p className="text-gray-400 text-sm mt-1">Add fields to your sections in the Builder tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Schema header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {schema.name || <span className="text-gray-400 italic font-normal">Untitled Schema</span>}
          </h2>
          {schema.description && <p className="text-sm text-gray-500 mt-0.5">{schema.description}</p>}
        </div>
        <span
          className={`text-xs px-3 py-1.5 rounded-full font-medium border flex-shrink-0 ${
            schema.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
          }`}
        >
          {schema.isActive ? "\u25cf Active" : "\u25cb Inactive"}
        </span>
      </div>

      {/* Progress */}
      {requiredKeys.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Required fields</span>
            <span className={`font-semibold ${progress === 100 ? "text-emerald-600" : "text-gray-600"}`}>
              {filledRequired.length}/{requiredKeys.length} filled
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Abnormal warning */}
      {abnormalCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            <span className="font-semibold">
              {abnormalCount} value{abnormalCount > 1 ? "s" : ""}
            </span>{" "}
            outside reference range
          </p>
        </div>
      )}

      {/* Patient context */}
      {needsContext && (
        <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
            <div className="w-7 h-7 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <span className="font-semibold text-gray-800 text-sm">Patient Context</span>
              <p className="text-xs text-gray-400">For age/gender-based reference ranges</p>
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Patient Age</label>
              <div className="relative">
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder="e.g. 35"
                  min="0"
                  max="150"
                  className="w-full pl-3 pr-12 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">yrs</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Patient Gender</label>
              <div className="flex gap-2">
                {["male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPatientGender(patientGender === g ? "" : g)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      patientGender === g
                        ? g === "male"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-pink-500 border-pink-500 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {g === "male" ? "\u2642 Male" : "\u2640 Female"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
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
        />
      ))}

      {/* Static range note */}
      {schema.hasStaticStandardRange && schema.staticStandardRange && (
        <div className="px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-amber-700 mb-0.5">Standard Reference</p>
            <p className="text-xs text-amber-600">{schema.staticStandardRange}</p>
          </div>
        </div>
      )}

      {/* Validation error summary */}
      {Object.keys(errors).length > 0 && (
        <div className="px-5 py-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-red-700">Please complete all required fields</p>
            <p className="text-xs text-red-500 mt-0.5">
              {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s" : ""} need attention
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-1 pb-4">
        <button
          type="button"
          onClick={() => {
            setValues({});
            setErrors({});
          }}
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <Send className="w-4 h-4" /> Submit Report
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
