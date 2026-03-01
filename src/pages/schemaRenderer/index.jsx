import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RotateCcw } from "lucide-react";
import SchemaRenderer from "../schemaBuilder/SchemaRenderer";
import schemaService from "../../services/schemaService";

export default function RenderSchemaPage() {
  const { schemaId } = useParams();
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schemaService.getById(schemaId);
      setSchema(response.data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load schema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, [schemaId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading schema...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={fetchSchema}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <Link
          to="/schema-list"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Schemas
        </Link>
      </div>
      <SchemaRenderer schema={schema} />
    </div>
  );
}
