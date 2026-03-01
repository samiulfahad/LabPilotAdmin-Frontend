import { useState, useEffect } from "react";
import useStore from "./store";
import InputField from "../../components/html/InputField";
import SelectField from "../../components/html/SelectField";
import Icons from "../../components/icons"; // Import the icons
const PreviewForm = () => {
  const { schema, updateSection, deleteSection, updateField, deleteField, setPopup } = useStore();
  // Section editing states
  const [editingSection, setEditingSection] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  // Field editing states
  const [editingField, setEditingField] = useState(null);
  const [fieldSection, setFieldSection] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("input");
  const [isRequired, setIsRequired] = useState(false);
  const [maxLength, setMaxLength] = useState("");
  const [options, setOptions] = useState([]);
  const [standardRangeType, setStandardRangeType] = useState("none");
  const [rangeData, setRangeData] = useState(null);
  const [unit, setUnit] = useState("");
  // FieldOptionsEditor states
  const [newOption, setNewOption] = useState("");
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);
  const [editingOptionValue, setEditingOptionValue] = useState("");
  // StandardRangeEditor states
  const [newRangeEntry, setNewRangeEntry] = useState({});
  const [editingRangeIndex, setEditingRangeIndex] = useState(null);
  const needsOptions = ["select", "checkbox", "radio"].includes(fieldType);
  const needsMaxLength = ["input", "textarea"].includes(fieldType);
  const needsStandardRange = fieldType === "number" && standardRangeType !== "none";
  useEffect(() => {
    if (!["select", "checkbox", "radio"].includes(fieldType)) {
      setOptions([]);
      setNewOption("");
      setEditingOptionIndex(null);
      setEditingOptionValue("");
    }
    if (fieldType !== "number") {
      setUnit("");
      setStandardRangeType("none");
    }
  }, [fieldType]);
  useEffect(() => {
    if (standardRangeType === "simple" && (rangeData == null || !("min" in rangeData && "max" in rangeData))) {
      setRangeData({ min: "", max: "" });
    } else if (
      standardRangeType === "gender" &&
      (rangeData == null || !("male" in rangeData && "female" in rangeData))
    ) {
      setRangeData({ male: { min: "", max: "" }, female: { min: "", max: "" } });
    } else if (
      (standardRangeType === "age" || standardRangeType === "combined") &&
      (rangeData == null || !Array.isArray(rangeData))
    ) {
      setRangeData([]);
    } else if (standardRangeType === "none" && rangeData != null) {
      setRangeData(null);
    }
    setNewRangeEntry({});
    setEditingRangeIndex(null);
  }, [standardRangeType]);
  useEffect(() => {
    if (editingField && fieldSection) {
      const section = schema.sections.find((s) => s.name === fieldSection);
      if (!section || !section.fields.find((f) => f.name === editingField)) {
        resetFieldForm();
      }
    }
  }, [schema, editingField, fieldSection]);
  // FieldOptionsEditor handlers
  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };
  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };
  const handleStartEditOption = (index, value) => {
    setEditingOptionIndex(index);
    setEditingOptionValue(value);
  };
  const handleSaveEditOption = () => {
    if (editingOptionValue.trim()) {
      const updatedOptions = [...options];
      updatedOptions[editingOptionIndex] = editingOptionValue.trim();
      setOptions(updatedOptions);
      setEditingOptionIndex(null);
      setEditingOptionValue("");
    }
  };
  const handleCancelEditOption = () => {
    setEditingOptionIndex(null);
    setEditingOptionValue("");
  };
  // StandardRangeEditor handlers
  const handleSimpleOrGenderChange = (key, subKey, value) => {
    setRangeData((prev) => ({
      ...prev,
      [key]: subKey ? { ...prev[key], [subKey]: value } : value,
    }));
  };
  const handleNewRangeChange = (key, value) => {
    setNewRangeEntry((prev) => ({ ...prev, [key]: value }));
  };
  const validateRangeEntry = (entry, type) => {
    if (type === "age") {
      return entry.minAge && entry.minValue && entry.maxValue;
    } else if (type === "combined") {
      return entry.gender && entry.minAge && entry.minValue && entry.maxValue;
    }
    return false;
  };
  const handleAddOrUpdateRange = () => {
    if (validateRangeEntry(newRangeEntry, standardRangeType)) {
      const entry = { ...newRangeEntry };
      if (!entry.maxAge) entry.maxAge = 999;
      if (editingRangeIndex !== null) {
        const updated = [...rangeData];
        updated[editingRangeIndex] = entry;
        setRangeData(updated);
        setEditingRangeIndex(null);
        setPopup({ type: "success", message: "Range updated successfully" });
      } else {
        setRangeData((prev) => [...prev, entry]);
        setPopup({ type: "success", message: "Range added successfully" });
      }
      setNewRangeEntry({});
    } else {
      setPopup({ type: "error", message: "Please fill all required fields for the range" });
    }
  };
  const handleRemoveRange = (index) => {
    setRangeData((prev) => prev.filter((_, i) => i !== index));
  };
  const handleStartEditRange = (index) => {
    setEditingRangeIndex(index);
    setNewRangeEntry({ ...rangeData[index] });
  };
  const handleCancelEditRange = () => {
    setEditingRangeIndex(null);
    setNewRangeEntry({});
  };
  const startEditSection = (sectionName) => {
    setEditingSection(sectionName);
    setNewSectionName(sectionName);
  };
  const saveSection = () => {
    updateSection(editingSection, newSectionName);
    setEditingSection(null);
    setNewSectionName("");
  };
  const cancelEditSection = () => {
    setEditingSection(null);
    setNewSectionName("");
  };
  const startEditField = (sectionName, field) => {
    setFieldSection(sectionName);
    setEditingField(field.name);
    setFieldName(field.name);
    setFieldType(field.type);
    setIsRequired(field.required || false);
    setMaxLength(field.maxLength || "");
    setOptions(field.options || []);
    setUnit(field.unit || "");
    if (field.standardRange) {
      setStandardRangeType(field.standardRange.type);
      setRangeData(field.standardRange.data);
    } else {
      setStandardRangeType("none");
      setRangeData(null);
    }
    setNewOption("");
    setEditingOptionIndex(null);
    setEditingOptionValue("");
    setNewRangeEntry({});
    setEditingRangeIndex(null);
  };
  const handleUpdate = () => {
    if (!fieldName.trim()) {
      setPopup({ type: "error", message: "Field name is required" });
      return;
    }
    const allFields = schema.sections.flatMap((section) => section.fields || []);
    if (allFields.some((f) => f.name === fieldName && f.name !== editingField)) {
      setPopup({ type: "error", message: "Field name must be unique" });
      return;
    }
    if (needsOptions && options.length === 0) {
      setPopup({ type: "error", message: "At least one option is required for this field type" });
      return;
    }
    if (needsStandardRange) {
      if (standardRangeType === "simple") {
        if (!rangeData.min || !rangeData.max) {
          setPopup({ type: "error", message: "Min and max required for simple range" });
          return;
        }
      } else if (standardRangeType === "gender") {
        if (!rangeData.male.min || !rangeData.male.max || !rangeData.female.min || !rangeData.female.max) {
          setPopup({ type: "error", message: "Min and max required for both genders" });
          return;
        }
      } else if ((standardRangeType === "age" || standardRangeType === "combined") && rangeData.length === 0) {
        setPopup({ type: "error", message: "At least one range required" });
        return;
      }
    }
    const updatedField = {
      name: fieldName,
      type: fieldType,
      required: isRequired,
    };
    if (needsOptions) updatedField.options = options;
    if (needsMaxLength && maxLength) updatedField.maxLength = parseInt(maxLength, 10);
    if (needsStandardRange) {
      updatedField.standardRange = { type: standardRangeType, data: rangeData };
    }
    if (fieldType === "number" && unit.trim()) {
      updatedField.unit = unit.trim();
    }
    updateField(fieldSection, editingField, updatedField);
    resetFieldForm();
  };
  const resetFieldForm = () => {
    setEditingField(null);
    setFieldSection("");
    setFieldName("");
    setFieldType("input");
    setIsRequired(false);
    setMaxLength("");
    setOptions([]);
    setStandardRangeType("none");
    setRangeData(null);
    setUnit("");
    setNewOption("");
    setEditingOptionIndex(null);
    setEditingOptionValue("");
    setNewRangeEntry({});
    setEditingRangeIndex(null);
  };
  const handleCancelField = () => {
    resetFieldForm();
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Preview</h3>
      {schema?.sections?.map((section) => (
        <div key={section.name} className="mb-6">
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            {editingSection === section.name ? (
              <div className="flex flex-wrap items-center gap-2">
                <InputField label="Title" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} />
                <button
                  onClick={saveSection}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-1"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditSection}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm flex items-center gap-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-md font-medium text-gray-800">{section.name}</h4>
                <div className="flex gap-2">
                  <button onClick={() => startEditSection(section.name)} className="btn-sm" title="Edit Section">
                    Edit
                  </button>
                  <button onClick={() => deleteSection(section.name)} className="delete-btn-sm" title="Delete Section">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
          {section.fields.length === 0 ? (
            <p className="text-sm text-gray-600">No fields in this section</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left text-sm font-medium text-gray-700">Field Name</th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="p-2 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {section.fields.map((field) => (
                    <tr key={field.name} className="border-t border-gray-200">
                      <td className="p-2 text-sm text-gray-900">{field.name}</td>
                      <td className="p-2 text-sm text-gray-900">{field.type}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => startEditField(section.name, field)}
                          className="btn-sm"
                          title="Edit Field"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteField(section.name, field.name)}
                          className="delete-btn-sm"
                          title="Delete Field"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      {editingField && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-md font-semibold mb-3 text-gray-800">Edit Field</h4>
          <div className="space-y-4">
            <InputField label="Field Name" value={fieldName} onChange={(e) => setFieldName(e.target.value)} />
            <SelectField
              label="Type"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              options={[
                { value: "input", label: "Text Input" },
                { value: "select", label: "Select Dropdown" },
                { value: "checkbox", label: "Checkbox Group" },
                { value: "radio", label: "Radio Group" },
                { value: "textarea", label: "Textarea" },
                { value: "number", label: "Number Input" },
              ]}
            />
            {needsMaxLength && (
              <InputField
                label="Max Length"
                type="number"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
              />
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Mark as required</span>
            </label>
            {needsOptions && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-800">Options</h5>
                {options.length > 0 && (
                  <div className="space-y-2">
                    {options.map((opt, index) => (
                      <div key={index} className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded">
                        {editingOptionIndex === index ? (
                          <>
                            <input
                              type="text"
                              value={editingOptionValue}
                              onChange={(e) => setEditingOptionValue(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveEditOption}
                              className="text-xs text-green-600 hover:underline flex items-center gap-1"
                            >
                              <Icons.Edit className="w-3 h-3" />
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditOption}
                              className="text-xs text-gray-600 hover:underline flex items-center gap-1"
                            >
                              <Icons.Close className="w-3 h-3" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm text-gray-900">{opt}</span>
                            <button
                              onClick={() => handleStartEditOption(index, opt)}
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Icons.Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemoveOption(index)}
                              className="text-xs text-red-600 hover:underline flex items-center gap-1"
                            >
                              <Icons.Delete className="w-3 h-3" />
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap items-end gap-2">
                  <InputField
                    label="New Option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm flex items-center gap-1"
                  >
                    <Icons.Add className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            )}
            {fieldType === "number" && (
              <>
                <InputField label="Unit (optional)" value={unit} onChange={(e) => setUnit(e.target.value)} />
                <div className="space-y-4">
                  <SelectField
                    label="Standard Range Type"
                    value={standardRangeType}
                    onChange={(e) => setStandardRangeType(e.target.value)}
                    options={[
                      { value: "none", label: "No Standard Range" },
                      { value: "simple", label: "Simple Range" },
                      { value: "age", label: "Age Based" },
                      { value: "gender", label: "Gender Based" },
                      { value: "combined", label: "Combined (Age and Gender)" },
                    ]}
                  />
                  {standardRangeType === "simple" && rangeData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Min Value"
                        type="number"
                        value={rangeData.min || ""}
                        onChange={(e) => handleSimpleOrGenderChange("min", null, e.target.value)}
                      />
                      <InputField
                        label="Max Value"
                        type="number"
                        value={rangeData.max || ""}
                        onChange={(e) => handleSimpleOrGenderChange("max", null, e.target.value)}
                      />
                    </div>
                  )}
                  {standardRangeType === "gender" && rangeData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label="Male Min"
                          type="number"
                          value={rangeData.male?.min || ""}
                          onChange={(e) => handleSimpleOrGenderChange("male", "min", e.target.value)}
                        />
                        <InputField
                          label="Male Max"
                          type="number"
                          value={rangeData.male?.max || ""}
                          onChange={(e) => handleSimpleOrGenderChange("male", "max", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label="Female Min"
                          type="number"
                          value={rangeData.female?.min || ""}
                          onChange={(e) => handleSimpleOrGenderChange("female", "min", e.target.value)}
                        />
                        <InputField
                          label="Female Max"
                          type="number"
                          value={rangeData.female?.max || ""}
                          onChange={(e) => handleSimpleOrGenderChange("female", "max", e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  {(standardRangeType === "age" || standardRangeType === "combined") && rangeData && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-medium text-gray-800">Ranges</h5>
                      {rangeData.length > 0 && (
                        <div className="space-y-2">
                          {rangeData.map((range, index) => (
                            <div key={index} className="flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded">
                              <span className="flex-1 text-sm text-gray-900">
                                {standardRangeType === "combined"
                                  ? `${range.gender.charAt(0).toUpperCase() + range.gender.slice(1)} `
                                  : ""}
                                Age {range.minAge}-{range.maxAge === 999 ? "+" : range.maxAge}: {range.minValue}-
                                {range.maxValue}
                              </span>
                              <button
                                onClick={() => handleStartEditRange(index)}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Icons.Edit className="w-3 h-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleRemoveRange(index)}
                                className="text-xs text-red-600 hover:underline flex items-center gap-1"
                              >
                                <Icons.Delete className="w-3 h-3" />
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="space-y-2">
                        <div
                          className={`grid gap-2 grid-cols-1 sm:grid-cols-${
                            standardRangeType === "combined" ? "5" : "4"
                          }`}
                        >
                          {standardRangeType === "combined" && (
                            <SelectField
                              label="Gender"
                              value={newRangeEntry.gender || ""}
                              onChange={(e) => handleNewRangeChange("gender", e.target.value)}
                              options={[
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                              ]}
                            />
                          )}
                          <InputField
                            label="Min Age"
                            type="number"
                            value={newRangeEntry.minAge || ""}
                            onChange={(e) => handleNewRangeChange("minAge", e.target.value)}
                          />
                          <InputField
                            label="Max Age"
                            type="number"
                            value={newRangeEntry.maxAge || ""}
                            onChange={(e) => handleNewRangeChange("maxAge", e.target.value)}
                          />
                          <InputField
                            label="Min Value"
                            type="number"
                            value={newRangeEntry.minValue || ""}
                            onChange={(e) => handleNewRangeChange("minValue", e.target.value)}
                          />
                          <InputField
                            label="Max Value"
                            type="number"
                            value={newRangeEntry.maxValue || ""}
                            onChange={(e) => handleNewRangeChange("maxValue", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          onClick={handleAddOrUpdateRange}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                          disabled={!validateRangeEntry(newRangeEntry, standardRangeType)}
                        >
                          {editingRangeIndex !== null ? (
                            <>
                              <Icons.Edit className="w-4 h-4" />
                              Update Range
                            </>
                          ) : (
                            <>
                              <Icons.Add className="w-4 h-4" />
                              Add Range
                            </>
                          )}
                        </button>
                        {editingRangeIndex !== null && (
                          <button
                            onClick={handleCancelEditRange}
                            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm flex items-center gap-1"
                          >
                            <Icons.Close className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={handleUpdate}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Icons.Edit className="w-4 h-4" />
                Update Field
              </button>
              <button
                onClick={handleCancelField}
                className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Icons.Close className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PreviewForm;
