import { Link } from "react-router-dom";
import { FileText, Trash2, ChevronRight, Eye, Pencil } from "lucide-react";

// Keys that are report-level metadata — excluded from section badge display
const META_KEYS = new Set([
  "_id",
  "__v",
  "name",
  "schemaId",
  "patientAge",
  "patientGender",
  "patientName",
  "invoiceId",
  "createdAt",
  "updatedAt",
]);

const Report = ({ input, index, onDelete, onEdit }) => {
  const sectionKeys = Object.keys(input).filter((key) => !META_KEYS.has(key));

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-200 group-hover:bg-indigo-400 transition-colors duration-300" />

      <div className="pl-5 pr-4 py-4 sm:pl-6 sm:pr-5 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Icon badge */}
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-900 items-center justify-center flex-shrink-0 shadow-sm">
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>

          {/* Name + section badges */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-[15px] tracking-tight truncate capitalize">
              {input.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {sectionKeys.map((section) => (
                <span
                  key={section}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-400 border border-slate-200"
                >
                  {section}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {/* View */}
            <Link
              to="/view-report"
              state={{ report: input }}
              title="View Report"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all duration-150"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View</span>
            </Link>

            <div className="w-px h-5 bg-slate-100 mx-1" />

            {/* Edit */}
            <button
              onClick={onEdit}
              title="Edit Report"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                         text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all duration-150"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            <div className="w-px h-5 bg-slate-100 mx-1" />

            {/* Delete */}
            <button
              onClick={onDelete}
              title="Delete Report"
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-indigo-300 transition-colors hidden sm:block flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default Report;
