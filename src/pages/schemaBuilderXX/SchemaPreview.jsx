import { useState } from "react";
import useStore from "./store";
const SchemaPreview = () => {
  const { schema } = useStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const safeStringify = (obj) => {
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "function" || value instanceof HTMLElement) return undefined;
        return value;
      },
      2
    );
  };
  const schemaJson = safeStringify(schema);
  const handleCopy = () => {
    navigator.clipboard.writeText(schemaJson).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="bg-gray-50 rounded-lg border border-gray-200">
        <div className="p-4 flex bg-gray-200 justify-between items-center border-b border-gray-200">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 text-center w-full hover:text-blue-800 font-medium text-sm transition-colors duration-200"
          >
            {isExpanded ? "Hide Schema" : "Show Schema"}
          </button>
          {isExpanded && (
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 rounded-full text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        {isExpanded && (
          <div className="p-4">
            <pre className="text-xs md:text-sm text-green-600 font-mono whitespace-pre-wrap break-words max-h-96 overflow-y-auto bg-gray-900 p-4 rounded-lg border border-gray-800">
              {schemaJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
export default SchemaPreview;
