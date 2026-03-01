import { useEffect } from "react";
import schemaService from "../../services/schemaService";
import useStore from "./store";
import Popup from "../../components/popup/Popup";
import LoadingScreen from "../../components/loadingPage";
import SchemaInfo from "./SchemaInfo";
import SelectTest from "./SelectTest";
import Status from "./Status";
import Section from "./Section";
import SchemaPreview from "./SchemaPreview";
import StaticStandardRange from "./StaticStandardRange";
import AddField from "./AddField"; // Updated component
import FormPreview from "./FormPreview";
import FormRenderer from "./FormRenderer";
import { useParams } from "react-router-dom";
const SchemaBuilder = () => {
  const {
    schema,
    setSchema,
    setFullSchema, 
    deleteSection,
    setPopup,
    popup,
    closePopup,
    loading,
    startLoading,
    stopLoading,
    resetSchema,
  } = useStore();
  const { schemaId } = useParams();
  // Fetch existing schema when in edit mode
  useEffect(() => {
    const fetchExistingSchema = async () => {
      if (schemaId) {
        startLoading();
        try {
          const response = await schemaService.getById(schemaId);
          const existingSchema = response.data;
          console.log(existingSchema);
          setFullSchema(existingSchema); // Fixed: Use the new action
        } catch (error) {
          console.error("Error fetching schema:", error);
          setPopup({ type: "error", message: "Failed to load schema for editing" });
          // navigate("/schema-list");
        } finally {
          stopLoading();
        }
      }
    };
    fetchExistingSchema();
    return () => {
      resetSchema();
    };
  }, [schemaId]);
  const handleSubmit = async () => {
    try {
      setSchema("currentSectionName", undefined); // Fixed: Use setter instead of delete/mutation
      startLoading();
      if (!schemaId) {
        // Add new schema
        // console.log(schema);
        const response = await schemaService.addNew(schema);
        // console.log(response.data);
        setPopup({ type: "success", message: "Schema added successfully", data: null, action: null });
      } else {
        const response = await schemaService.update(schemaId, schema);
        console.log(response.data);
        setPopup({ type: "success", message: "Schema updated successfully", data: null, action: null });
      }
    } catch (e) {
      setPopup({ type: "error", message: "Failed to add schema", data: null, action: null });
    } finally {
      stopLoading();
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 pb-4 pt-2 md:p-6">
      {loading && <LoadingScreen />}
      {/* Popups */}
      {popup && popup.type === "success" && <Popup type="success" message={popup.message} onClose={closePopup} />}
      {popup && popup.type === "error" && <Popup type="error" message={popup.message} onClose={closePopup} />}
      {popup && popup.type === "confirmation" && (
        <Popup type="confirmation" message={popup.message} onClose={closePopup} onConfirm={popup.onConfirm} />
      )}
      {popup && popup.type === "confirmation" && popup.action === "deleteSection" && (
        <Popup
          type="confirmation"
          message={popup.message}
          onClose={closePopup}
          onConfirm={() => deleteSection(popup.data)}
        />
      )}
      {/* No more modal for addField; handled inline now */}
      <div className="max-w-4xl mx-auto space-y-6 -mt-3">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-lg md:text-xl font-bold text-gray-800">Schema Engine</h1>
        </div>

        {/* Row 1: Schema Name and Test Name */}
        <SchemaInfo />
        {/* Row 2: Test Category & Test Selection */}
        <SelectTest />
        {/* Row 3: Status Toggle */}
        <Status />
        {/* Row 4: Sections */}
        <Section />
        {/* Row 5: Add Field (now with inline form) */}
        <AddField />
        {/* Row 6: Standard Range */}
        <StaticStandardRange />
        {/* Row 7: Preview Form */}
        <FormPreview />
        {/* Row 8: Save Schema Button */}
        <div className="w-full flex justify-center items-center">
          <button onClick={handleSubmit} className="btn">
            Save Schema
          </button>
        </div>
        {/* Row 9: Form Renderer */}
        <FormRenderer />
        {/* Row 10: Schema Preview */}
        <SchemaPreview />
      </div>
    </div>
  );
};
export default SchemaBuilder;
