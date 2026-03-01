import { useState } from "react";
import useStore from "./store";
import InputField from "../../components/html/InputField";
const Section = () => {
  const [editingSectionName, setEditingSectionName] = useState(null);
  const [editingNewSectionName, setEditingNewSectionName] = useState("");
  const [showAddSectionInput, setShowAddSectionInput] = useState(false);
  const { schema, setSchema, addSection, updateSection, setPopup } = useStore();
  const startEditing = (section) => {
    setEditingSectionName(section.name);
    setEditingNewSectionName(section.name);
  };
  const saveEditing = () => {
    if (editingSectionName && editingNewSectionName.trim()) {
      updateSection(editingSectionName, editingNewSectionName);
      setEditingSectionName(null);
      setEditingNewSectionName("");
    }
  };
  const cancelEditing = () => {
    setEditingSectionName(null);
    setEditingNewSectionName("");
  };
  const handleAddSectionClick = () => {
    const success = addSection();
    if (success) {
      setShowAddSectionInput(false);
    } else {
      setShowAddSectionInput(true);
    }
  };
  const handleCancelAddSection = () => {
    setSchema("currentSectionName", "");
    setShowAddSectionInput(false);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Sections</h3>
          <p className="text-sm text-gray-600 mt-1">Organize test fields into sections</p>
        </div>
        {!showAddSectionInput && (
          <button
            onClick={() => setShowAddSectionInput(true)}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Add Section
          </button>
        )}
      </div>
      {/* Add Section Input */}
      {showAddSectionInput && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <InputField
            label="Title"
            value={schema.currentSectionName || ""}
            onChange={(e) => setSchema("currentSectionName", e.target.value)}
            autoFocus
          />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddSectionClick}
              disabled={!schema.currentSectionName?.trim()}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Add Section
            </button>
            <button
              onClick={handleCancelAddSection}
              className="flex-1 px-4 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Existing Sections List */}
      {schema.sections?.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Existing Sections ({schema.sections.length})</h4>
            {schema.sections.length === 1 && <span className="text-xs text-gray-500">Default section is required</span>}
          </div>
          <div className="space-y-3">
            {schema.sections.map((section) => (
              <div key={section.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {editingSectionName === section.name ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingNewSectionName}
                      onChange={(e) => setEditingNewSectionName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Section name"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEditing}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">{section.name}</span>
                      {section.name === "Default" && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Default</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(section)}
                        className="px-3 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setPopup({
                            type: "confirmation",
                            message: "All data will be lost. Are you sure?",
                            action: "deleteSection",
                            data: section.name,
                          })
                        }
                        className="px-3 py-1.5 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={schema.sections.length === 1}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default Section;
