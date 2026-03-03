import { useEffect, useState } from "react";
import { FileText, DatabaseZap } from "lucide-react";
import reportService from "../../services/reportService";
import Popup from "../../components/popup/Popup";
import LoadingScreen from "../../components/loadingPage";
import Report from "./Report";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({});

  // Fetch all reports
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

  // Handle report deletion
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

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/60 py-6 px-4 sm:px-6 lg:px-8">
      {loading && <LoadingScreen />}

      {/* Popup for delete confirmation */}
      {popup.type === "confirmation" && popup.action === "delete" && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({})} onConfirm={handleDelete} />
      )}

      {/* Success / Error popup */}
      {(popup.type === "success" || popup.type === "error") && (
        <Popup type={popup.type} message={popup.message} onClose={() => setPopup({})} />
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

        {/* ── Results ── */}
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
            {/* Results header */}
            <div className="flex items-center mb-3 px-1">
              <span className="text-sm font-semibold text-slate-700">
                {reports.length} report{reports.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Report list */}
            <div className="space-y-2.5">
              {reports.map((report, index) => (
                <Report
                  key={report._id?.$oid || index}
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
