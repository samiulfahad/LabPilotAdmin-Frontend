import { useEffect, useState } from "react";
import { FileText, DatabaseZap, X } from "lucide-react";
import reportService from "../../services/reportService";
import schemaService from "../../services/schemaService";
import Popup from "../../components/popup/Popup";
import LoadingScreen from "../../components/loadingPage";
import Report from "./Report";
import SchemaRenderer from "../schemaRenderer/v1/SchemaRenderer";

// ─── Edit Drawer ──────────────────────────────────────────────────────────────
function EditDrawer({ report, schema, onClose, onSaved }) {
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState(null);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleUpdate = async (payload) => {
    const reportId = report._id?.$oid || report._id;
    if (!reportId) {
      setPopup({ type: "error", message: "Report ID missing — cannot update." });
      return;
    }
    try {
      setSubmitting(true);
      await reportService.updateReport(reportId, payload);
      setPopup({ type: "success", message: "Report updated successfully" });
      setTimeout(() => {
        onSaved(payload, reportId);
        onClose();
      }, 1000);
    } catch (e) {
      setPopup({ type: "error", message: e?.response?.data?.message || "Could not update report" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-3xl bg-white shadow-2xl flex flex-col"
        style={{ animation: "srDrawerIn 0.22s cubic-bezier(0.4,0,0.2,1)" }}
      >
        <style>{`
          @keyframes srDrawerIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <div>
            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-widest mb-0.5">Editing Report</p>
            <h2 className="text-base font-bold text-slate-900 capitalize leading-tight">{report.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {submitting && <LoadingScreen />}
          {popup && <Popup type={popup.type} message={popup.message} onClose={() => setPopup(null)} />}
          <SchemaRenderer schema={schema} onUpdate={handleUpdate} loading={submitting} existingReport={report} />
        </div>
      </div>
    </>
  );
}

// ─── ReportList ───────────────────────────────────────────────────────────────
const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({});

  // Edit state
  const [editReport, setEditReport] = useState(null);
  const [editSchema, setEditSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);

  // ── Fetch all reports ──
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAll();
      setReports(response.data || []);
      if (!response.data?.length) {
        setPopup({ type: "error", message: "No reports found" });
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setPopup({ type: "error", message: "Failed to load reports" });
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    try {
      setLoading(true);
      await reportService.deleteReport(popup._id);
      setReports((prev) => prev.filter((r) => r._id !== popup._id));
      setPopup({ type: "success", message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      setPopup({ type: "error", message: "Failed to delete report" });
    } finally {
      setLoading(false);
    }
  };

  // ── Open edit drawer ──
  // Resolves the schema for the report being edited.
  // Fast path: uses report.schemaId if present.
  // Fallback: fetches all schemas and matches by report.name.
  const handleEdit = async (report) => {
    setEditReport(report);
    setEditSchema(null);
    setSchemaLoading(true);
    try {
      const schemaId = report.schemaId || report.schema?._id;
      if (schemaId) {
        const res = await schemaService.getById(schemaId);
        setEditSchema(res.data);
      } else {
        const res = await schemaService.getAll();
        const matched = (res?.data || []).find((s) => s.name?.toLowerCase() === report.name?.toLowerCase());
        if (!matched) throw new Error(`No schema found for "${report.name}"`);
        setEditSchema(matched);
      }
    } catch (e) {
      console.error("Schema load failed:", e);
      setPopup({ type: "error", message: e?.response?.data?.message || "Could not load schema for this report." });
      setEditReport(null);
    } finally {
      setSchemaLoading(false);
    }
  };

  const closeDrawer = () => {
    setEditReport(null);
    setEditSchema(null);
  };

  // Patch the in-memory list after a successful save — no full refetch needed
  const handleSaved = (updatedPayload, reportId) => {
    setReports((prev) =>
      prev.map((r) => {
        const id = r._id?.$oid || r._id;
        return id === reportId ? { ...r, ...updatedPayload } : r;
      }),
    );
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const drawerReady = editReport && editSchema;

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 px-4 sm:px-6 lg:px-8">
      {(loading || schemaLoading) && <LoadingScreen />}

      {/* Delete confirmation */}
      {popup.type === "confirmation" && popup.action === "delete" && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({})} onConfirm={handleDelete} />
      )}

      {/* Success / Error */}
      {(popup.type === "success" || popup.type === "error") && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({})} />
      )}

      {/* Edit drawer */}
      {drawerReady && (
        <EditDrawer report={editReport} schema={editSchema} onClose={closeDrawer} onSaved={handleSaved} />
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <DatabaseZap className="w-4 h-4 text-indigo-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports</h1>
            </div>
            <p className="text-sm text-slate-500 ml-10">View and manage all submitted test reports</p>
          </div>
        </div>

        {/* ── Report list ── */}
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">No reports yet</p>
            <p className="text-xs text-slate-400 max-w-xs">Submitted test reports will appear here.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-3 px-1">
              <span className="text-sm font-semibold text-slate-700">
                {reports.length} report{reports.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-2.5">
              {reports.map((report, index) => (
                <Report
                  key={report._id?.$oid || report._id || index}
                  input={report}
                  index={index}
                  onDelete={() =>
                    setPopup({
                      type: "confirmation",
                      message: `Do you want to delete the report "${report.name}"?`,
                      _id: report._id,
                      action: "delete",
                    })
                  }
                  onEdit={() => handleEdit(report)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportList;
