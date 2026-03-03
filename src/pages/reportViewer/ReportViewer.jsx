import { useState } from "react";
import {
  FlaskConical,
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  Stethoscope,
  Hash,
  ClipboardList,
  TriangleAlert,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Share2,
  Printer,
  Download,
  ChevronDown,
  Check,
  TestTube2,
  FileText,
} from "lucide-react";

// ─── Demo Lab Info ─────────────────────────────────────────────────────────────
const LAB_INFO = {
  name: "MediScan Diagnostics",
  tagline: "Precision Medicine · Trusted Results",
  address: "House 12, Road 5, Dhanmondi, Dhaka-1205, Bangladesh",
  email: "reports@mediscan.com.bd",
  phone: "+880 1711-000000",
  regNo: "DGDA/LAB/2024/0042",
};

const DEMO_PATIENT = {
  name: "Demo Patient",
  age: "32 yrs",
  gender: "Male",
  contact: "+880 1700-000000",
  referredBy: "Dr. Karim Ahmed",
  sampleDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  reportDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseRange(ref) {
  if (!ref) return null;
  const m = ref.match(/^([\d.]+)\s*[–\-]\s*([\d.]+)$/);
  if (!m) return null;
  return { min: parseFloat(m[1]), max: parseFloat(m[2]) };
}

function getStatus(value, ref) {
  const n = parseFloat(value);
  if (isNaN(n) || !ref) return null;
  const r = parseRange(ref);
  if (!r) return null;
  if (n < r.min) return "low";
  if (n > r.max) return "high";
  return "normal";
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  if (!status) return <span className="text-xs text-slate-300">—</span>;
  const cfg = {
    normal: { label: "Normal", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
    low: { label: "Low", cls: "bg-amber-50 text-amber-700 border-amber-200", Icon: TrendingDown },
    high: { label: "High", cls: "bg-red-50 text-red-700 border-red-200", Icon: TrendingUp },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.cls}`}>
      <cfg.Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Result Rows ──────────────────────────────────────────────────────────────
function NumericRow({ name, field }) {
  const { value, referenceRange, unit } = field;
  const status = getStatus(value, referenceRange);
  const isAbnormal = status === "low" || status === "high";
  return (
    <tr className={isAbnormal ? "bg-red-50/50" : "odd:bg-white even:bg-slate-50/30"}>
      <td className="pl-4 pr-3 py-2.5 text-sm text-slate-700 border-b border-slate-100">{name}</td>
      <td
        className={`px-3 py-2.5 text-sm font-bold tabular-nums border-b border-slate-100 ${isAbnormal ? "text-red-700" : "text-slate-900"}`}
      >
        {value}
        {unit && <span className="ml-1 text-[10px] font-normal text-slate-400 uppercase">{unit}</span>}
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-500 border-b border-slate-100">{referenceRange || "—"}</td>
      <td className="px-3 pr-4 py-2.5 border-b border-slate-100">
        <StatusPill status={status} />
      </td>
    </tr>
  );
}

function TextRow({ name, field }) {
  const val = Array.isArray(field.value) ? field.value.join(", ") : field.value;
  return (
    <tr className="odd:bg-white even:bg-slate-50/30">
      <td className="pl-4 pr-3 py-2.5 text-sm text-slate-700 border-b border-slate-100">{name}</td>
      <td colSpan={2} className="px-3 py-2.5 text-sm font-semibold text-slate-800 border-b border-slate-100">
        {val || "—"}
      </td>
      <td className="px-3 pr-4 py-2.5 border-b border-slate-100" />
    </tr>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ sectionName, sectionData, index }) {
  const [collapsed, setCollapsed] = useState(false);
  const entries = Object.entries(sectionData);
  const abnormal = entries.filter(([, v]) => {
    const s = getStatus(v.value, v.referenceRange);
    return s === "high" || s === "low";
  }).length;

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 mb-2.5">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 transition-colors text-left"
      >
        <span className="w-5 h-5 rounded bg-white/20 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="flex-1 text-sm font-semibold text-white">{sectionName}</span>
        {abnormal > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-full">
            <TriangleAlert className="w-2.5 h-2.5" /> {abnormal} Abnormal
          </span>
        )}
        <span className="text-[10px] text-slate-400">
          {entries.length} test{entries.length !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      {!collapsed && (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="pl-4 pr-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[38%]">
                Test Name
              </th>
              <th className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">
                Result
              </th>
              <th className="px-3 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[22%]">
                Ref. Range
              </th>
              <th className="px-3 pr-4 py-1.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-[18%]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([name, field]) =>
              field.referenceRange ? (
                <NumericRow key={name} name={name} field={field} />
              ) : (
                <TextRow key={name} name={name} field={field} />
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Summary Strip ────────────────────────────────────────────────────────────
function SummaryStrip({ report }) {
  let normal = 0,
    low = 0,
    high = 0;
  Object.values(report).forEach((sec) => {
    if (typeof sec !== "object" || sec.$oid) return;
    Object.values(sec).forEach((field) => {
      if (!field.referenceRange) return;
      const s = getStatus(field.value, field.referenceRange);
      if (s === "normal") normal++;
      else if (s === "low") low++;
      else if (s === "high") high++;
    });
  });
  const total = normal + low + high;
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-1 text-xs">
      <ClipboardList className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
      <span className="text-slate-500 font-medium">{total} numeric tests:</span>
      <span className="font-bold text-emerald-600 ml-1">{normal} Normal</span>
      {low > 0 && (
        <>
          <span className="text-slate-300 mx-0.5">·</span>
          <span className="font-bold text-amber-600">{low} Low</span>
        </>
      )}
      {high > 0 && (
        <>
          <span className="text-slate-300 mx-0.5">·</span>
          <span className="font-bold text-red-600">{high} High</span>
        </>
      )}
    </div>
  );
}

// ─── Patient Info Grid ────────────────────────────────────────────────────────
// Row 1: Patient Name | Age / Gender | Contact
// Row 2: Referred By  | Sample Date  | Report Date
function PatientGrid({ patient }) {
  const row1 = [
    { label: "Patient Name", value: patient.name, Icon: User },
    { label: "Age / Gender", value: [patient.age, patient.gender].filter(Boolean).join(" · "), Icon: Hash },
    { label: "Contact", value: patient.contact, Icon: Phone },
  ];
  const row2 = [
    { label: "Referred By", value: patient.referredBy, Icon: Stethoscope },
    { label: "Sample Date", value: patient.sampleDate, Icon: Calendar },
    { label: "Report Date", value: patient.reportDate, Icon: Calendar },
  ];

  const Cell = ({ label, value, Icon }) => (
    <div className="bg-white px-4 py-2.5">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800 truncate">{value || "—"}</p>
    </div>
  );

  return (
    <div className="border-b border-slate-200">
      {/* Row 1 */}
      <div className="grid grid-cols-3 gap-px bg-slate-200 border-b border-slate-200">
        {row1.map((f) => (
          <Cell key={f.label} {...f} />
        ))}
      </div>
      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-px bg-slate-200">
        {row2.map((f) => (
          <Cell key={f.label} {...f} />
        ))}
      </div>
    </div>
  );
}

// ─── Build Print HTML ─────────────────────────────────────────────────────────
function buildPrintHTML({ report, testName, reportName, shortId, mergedPatient, labInfo, sections, hasAnyAbnormal }) {
  const statusLabel = (s) => ({ normal: "Normal", low: "↓ Low", high: "↑ High" })[s] || "—";
  const statusColor = (s) => ({ normal: "#059669", low: "#d97706", high: "#dc2626" })[s] || "#94a3b8";
  const statusBg = (s) => ({ normal: "#f0fdf4", low: "#fffbeb", high: "#fef2f2" })[s] || "white";

  const renderSection = (sectionName, sectionData, index) => {
    const entries = Object.entries(sectionData);
    const abnormal = entries.filter(([, v]) => {
      const s = getStatus(v.value, v.referenceRange);
      return s === "high" || s === "low";
    }).length;
    const rows = entries
      .map(([name, field]) => {
        if (field.referenceRange) {
          const status = getStatus(field.value, field.referenceRange);
          const isAb = status === "low" || status === "high";
          return `<tr style="background:${isAb ? "#fff1f2" : "white"};">
          <td style="padding:7px 12px;font-size:12px;color:#374151;border-bottom:1px solid #f1f5f9;">${name}</td>
          <td style="padding:7px 12px;font-size:12px;font-weight:700;color:${isAb ? "#b91c1c" : "#111827"};border-bottom:1px solid #f1f5f9;">
            ${field.value}${field.unit ? `<span style="font-size:9px;font-weight:400;color:#9ca3af;margin-left:3px;">${field.unit}</span>` : ""}
          </td>
          <td style="padding:7px 12px;font-size:11px;color:#6b7280;border-bottom:1px solid #f1f5f9;">${field.referenceRange || "—"}</td>
          <td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;">
            <span style="font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;border:1px solid;background:${statusBg(status)};color:${statusColor(status)};border-color:${statusColor(status)}40;">${statusLabel(status)}</span>
          </td>
        </tr>`;
        }
        const val = Array.isArray(field.value) ? field.value.join(", ") : field.value;
        return `<tr style="background:white;">
        <td style="padding:7px 12px;font-size:12px;color:#374151;border-bottom:1px solid #f1f5f9;">${name}</td>
        <td colspan="2" style="padding:7px 12px;font-size:12px;font-weight:600;color:#111827;border-bottom:1px solid #f1f5f9;">${val || "—"}</td>
        <td style="padding:7px 12px;border-bottom:1px solid #f1f5f9;"></td>
      </tr>`;
      })
      .join("");

    return `<div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:10px;">
      <div style="background:#334155;padding:8px 14px;display:flex;align-items:center;gap:8px;">
        <span style="width:20px;height:20px;background:rgba(255,255,255,0.15);border-radius:4px;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:9px;font-weight:700;">${String.fromCharCode(65 + index)}</span>
        <span style="color:white;font-size:12px;font-weight:600;flex:1;">${sectionName}</span>
        ${abnormal > 0 ? `<span style="font-size:9px;font-weight:700;padding:2px 8px;background:#ef4444;color:white;border-radius:99px;">⚠ ${abnormal} Abnormal</span>` : ""}
        <span style="color:#94a3b8;font-size:9px;">${entries.length} test${entries.length !== 1 ? "s" : ""}</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          <th style="padding:5px 12px;text-align:left;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;width:38%;">Test Name</th>
          <th style="padding:5px 12px;text-align:left;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;width:22%;">Result</th>
          <th style="padding:5px 12px;text-align:left;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;width:22%;">Ref. Range</th>
          <th style="padding:5px 12px;text-align:left;font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;width:18%;">Status</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  };

  // Patient rows for print
  const patientRow1 = [
    { label: "Patient Name", value: mergedPatient.name },
    { label: "Age / Gender", value: [mergedPatient.age, mergedPatient.gender].filter(Boolean).join(" · ") },
    { label: "Contact", value: mergedPatient.contact },
  ];
  const patientRow2 = [
    { label: "Referred By", value: mergedPatient.referredBy },
    { label: "Sample Date", value: mergedPatient.sampleDate },
    { label: "Report Date", value: mergedPatient.reportDate },
  ];

  const renderPatientRow = (fields) =>
    fields
      .map(
        ({ label, value }) => `
    <td style="padding:7px 14px;background:white;vertical-align:top;border-right:1px solid #e2e8f0;width:33.3%;">
      <div style="font-size:8px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;">${label}</div>
      <div style="font-size:12px;font-weight:600;color:#1e293b;margin-top:2px;">${value || "—"}</div>
    </td>`,
      )
      .join("");

  let normal = 0,
    low = 0,
    high = 0;
  Object.values(report).forEach((sec) => {
    if (typeof sec !== "object" || sec.$oid) return;
    Object.values(sec).forEach((field) => {
      if (!field.referenceRange) return;
      const s = getStatus(field.value, field.referenceRange);
      if (s === "normal") normal++;
      else if (s === "low") low++;
      else if (s === "high") high++;
    });
  });
  const total = normal + low + high;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${reportName} — ${labInfo.name}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:white; color:#1e293b; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
    @page { size:A4; margin:14mm; }
  </style>
</head>
<body>
<div style="max-width:680px;margin:0 auto;">

  <!-- Lab Header -->
  <div style="background:#1e293b;padding:16px 20px;display:flex;align-items:flex-start;justify-content:space-between;border-radius:10px 10px 0 0;">
    <div style="display:flex;align-items:flex-start;gap:12px;">
      <div style="width:36px;height:36px;background:rgba(255,255,255,0.12);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.402 2.798H4.2c-1.432 0-2.401-1.799-1.401-2.798L4 15.3"/></svg>
      </div>
      <div>
        <div style="font-size:15px;font-weight:700;color:white;">${labInfo.name}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${labInfo.tagline}</div>
        <div style="font-size:9px;color:#64748b;margin-top:4px;">📍 ${labInfo.address}</div>
      </div>
    </div>
    <div style="text-align:right;flex-shrink:0;">
      <div style="font-size:9px;color:#94a3b8;">📞 ${labInfo.phone}</div>
      <div style="font-size:9px;color:#94a3b8;margin-top:2px;">✉ ${labInfo.email}</div>
      <div style="font-size:9px;color:#64748b;margin-top:4px;font-family:monospace;">Reg: ${labInfo.regNo}</div>
    </div>
  </div>

  <!-- Report Title -->
  <div style="background:#f1f5f9;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
    <div>
      <div style="font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Medical Test Report</div>
      <div style="font-size:15px;font-weight:700;color:#0f172a;margin-top:2px;">${testName || reportName}</div>
      ${testName ? `<div style="font-size:10px;color:#64748b;margin-top:2px;">Report: ${reportName}</div>` : ""}
    </div>
    <div style="text-align:right;">
      ${hasAnyAbnormal ? `<div style="display:inline-block;font-size:9px;font-weight:700;padding:3px 10px;background:#fee2e2;color:#b91c1c;border:1px solid #fecaca;border-radius:99px;margin-bottom:4px;">⚠ Abnormal Values Present</div><br/>` : ""}
      ${shortId ? `<div style="font-size:9px;color:#94a3b8;font-family:monospace;">ID: ${shortId}</div>` : ""}
    </div>
  </div>

  <!-- Patient Info Row 1 -->
  <table style="width:100%;border-collapse:collapse;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
    <tr style="border-bottom:1px solid #e2e8f0;">${renderPatientRow(patientRow1)}</tr>
    <tr>${renderPatientRow(patientRow2)}</tr>
  </table>

  <!-- Summary -->
  ${
    total > 0
      ? `
  <div style="background:#f8fafc;padding:7px 20px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;font-size:11px;display:flex;align-items:center;gap:6px;">
    <span style="color:#64748b;font-weight:500;">${total} numeric tests:</span>
    <span style="font-weight:700;color:#059669;">${normal} Normal</span>
    ${low > 0 ? `<span style="color:#e2e8f0;">·</span><span style="font-weight:700;color:#d97706;">${low} Low</span>` : ""}
    ${high > 0 ? `<span style="color:#e2e8f0;">·</span><span style="font-weight:700;color:#dc2626;">${high} High</span>` : ""}
  </div>`
      : ""
  }

  <!-- Results -->
  <div style="padding:14px 20px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;">
    ${sections.map(([name, data], i) => renderSection(name, data, i)).join("")}
  </div>

  <!-- Signatures + Footer -->
  <div style="padding:14px 20px 16px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 0 10px 10px;">
    <table style="width:100%;margin-bottom:12px;">
      <tr>
        <td style="width:45%;padding-right:20px;">
          <div style="height:36px;border-bottom:1px dashed #cbd5e1;"></div>
          <div style="font-size:9px;color:#94a3b8;margin-top:4px;">Pathologist Signature &amp; Seal</div>
        </td>
        <td style="width:10%;"></td>
        <td style="width:45%;padding-left:20px;">
          <div style="height:36px;border-bottom:1px dashed #cbd5e1;"></div>
          <div style="font-size:9px;color:#94a3b8;margin-top:4px;text-align:right;">Authorized Signatory</div>
        </td>
      </tr>
    </table>
    <div style="font-size:9px;color:#94a3b8;text-align:center;border-top:1px solid #f1f5f9;padding-top:10px;line-height:1.6;">
      This report is intended for qualified medical professionals only. Interpret results in full clinical context. · ${labInfo.name} · ${labInfo.phone}
    </div>
  </div>

</div>
</body>
</html>`;
}

// ─── Print window helper ──────────────────────────────────────────────────────
function openPrintWindow(html, autoDownload = false) {
  const win = window.open("", "_blank", "width=820,height=950");
  if (!win) {
    alert("Please allow popups to download/print reports.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    if (autoDownload) {
      win.document.title = "report";
      win.print();
      setTimeout(() => win.close(), 1000);
    } else {
      win.print();
    }
  };
}

// ─── Main ReportViewer ────────────────────────────────────────────────────────
/**
 * Props:
 *   report      – raw report object
 *   reportId    – string id
 *   testName    – e.g. "CBC" / "Complete Blood Count"   ← the test type
 *   reportName  – e.g. "Lab Report"                     ← the document title
 *   patient     – { name, age, gender, contact, referredBy, sampleDate, reportDate }
 *   labInfo     – override LAB_INFO
 */
function ReportViewer({
  report,
  reportId,
  testName = "Complete Blood Count (CBC)",
  reportName = "Lab Report",
  patient = {},
  labInfo = LAB_INFO,
}) {
  const [shareStatus, setShareStatus] = useState("idle");
  const mergedPatient = { ...DEMO_PATIENT, ...patient };

  const sections = Object.entries(report).filter(([key, val]) => key !== "_id" && typeof val === "object" && !val.$oid);

  const id = report._id?.$oid || reportId || "";
  const shortId = id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;

  let hasAnyAbnormal = false;
  sections.forEach(([, sec]) => {
    Object.values(sec).forEach((field) => {
      const s = getStatus(field.value, field.referenceRange);
      if (s === "low" || s === "high") hasAnyAbnormal = true;
    });
  });

  const getHTML = () =>
    buildPrintHTML({ report, testName, reportName, shortId, mergedPatient, labInfo, sections, hasAnyAbnormal });
  const handlePrint = () => openPrintWindow(getHTML(), false);
  const handleDownload = () => openPrintWindow(getHTML(), true);
  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `${testName} — ${reportName}`, url: window.location.href });
      else throw new Error();
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-sans">
      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-all"
        >
          {shareStatus === "copied" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" /> Share
            </>
          )}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-400 transition-all"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
      </div>

      {/* ── Report Card ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Lab Header */}
        <div className="bg-slate-800 px-5 py-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{labInfo.name}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">{labInfo.tagline}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
                <p className="text-slate-500 text-[10px]">{labInfo.address}</p>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            <div className="flex items-center justify-end gap-1">
              <Phone className="w-2.5 h-2.5 text-slate-500" />
              <p className="text-slate-400 text-[10px]">{labInfo.phone}</p>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Mail className="w-2.5 h-2.5 text-slate-500" />
              <p className="text-slate-400 text-[10px]">{labInfo.email}</p>
            </div>
            <p className="text-slate-500 text-[10px] font-mono">Reg: {labInfo.regNo}</p>
          </div>
        </div>

        {/* Report Title Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-100 border-b border-slate-200">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Medical Test Report</p>
            {/* Test name — prominent */}
            <div className="flex items-center gap-2 mt-1">
              <TestTube2 className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <h2 className="text-base font-bold text-slate-900">{testName}</h2>
            </div>
            {/* Report / document name — subtle sub-label */}
            <div className="flex items-center gap-1.5 mt-0.5 ml-6">
              <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <p className="text-[11px] text-slate-500">{reportName}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            {hasAnyAbnormal && (
              <div className="flex justify-end">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 bg-red-100 text-red-700 border border-red-200 rounded-full">
                  <TriangleAlert className="w-2.5 h-2.5" /> Abnormal Values
                </span>
              </div>
            )}
            {shortId && <p className="text-[10px] text-slate-400 font-mono">ID: {shortId}</p>}
          </div>
        </div>

        {/* Patient Info — 2 rows × 3 cols */}
        <PatientGrid patient={mergedPatient} />

        {/* Summary */}
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200">
          <SummaryStrip report={report} />
        </div>

        {/* Results */}
        <div className="px-5 pt-4 pb-2">
          {sections.map(([sectionName, sectionData], i) => (
            <Section key={sectionName} sectionName={sectionName} sectionData={sectionData} index={i} />
          ))}
        </div>

        {/* Signatures + Footer */}
        <div className="px-5 pb-5 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-8 mb-3">
            <div>
              <div className="h-8 border-b border-dashed border-slate-300" />
              <p className="text-[9px] text-slate-400 mt-1">Pathologist Signature &amp; Seal</p>
            </div>
            <div>
              <div className="h-8 border-b border-dashed border-slate-300" />
              <p className="text-[9px] text-slate-400 mt-1 text-right">Authorized Signatory</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3 leading-relaxed">
            For qualified medical professionals only. Interpret results in full clinical context. · {labInfo.name} ·{" "}
            {labInfo.phone}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ReportViewer;
