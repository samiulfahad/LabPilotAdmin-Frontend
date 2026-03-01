import { useState, useEffect } from "react";
import useStore from "./store";
import InputField from "../../components/html/InputField";
import SelectField from "../../components/html/SelectField";
import Icons from "../../components/icons"; // Update this path
const AddField = () => {
  const { Add: AddIcon, Edit: EditIcon, Delete: DeleteIcon, Close: CloseIcon } = Icons;
  const { schema, addField, setPopup } = useStore();
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("input");
  const [isRequired, setIsRequired] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [maxLength, setMaxLength] = useState("");
  const [options, setOptions] = useState([]);
  const [standardRangeType, setStandardRangeType] = useState("none");
  const [rangeData, setRangeData] = useState(null);
  const [unit, setUnit] = useState(""); // Selected from dropdown
  const [customUnit, setCustomUnit] = useState(""); // For "Other"
  // Option editor
  const [newOption, setNewOption] = useState("");
  const [editingOptionIndex, setEditingOptionIndex] = useState(null);
  const [editingOptionValue, setEditingOptionValue] = useState("");
  // Range editor
  const [newRangeEntry, setNewRangeEntry] = useState({});
  const [editingRangeIndex, setEditingRangeIndex] = useState(null);
  const sections = schema.sections || [];
  const hasMultipleSections = sections.length > 1;
  // Common Medical Units
  const commonMedicalUnits = [
    { value: "", label: "No unit" },
    { value: "mg/dL", label: "mg/dL" },
    { value: "g/dL", label: "g/dL" },
    { value: "mmol/L", label: "mmol/L" },
    { value: "µmol/L", label: "µmol/L" },
    { value: "U/L", label: "U/L" },
    { value: "ng/mL", label: "ng/mL" },
    { value: "pg/mL", label: "pg/mL" },
    { value: "10³/µL", label: "10³/µL (thousand/µL)" },
    { value: "10⁶/µL", label: "10⁶/µL (million/µL)" },
    { value: "%", label: "% (Percentage)" },
    { value: "mmHg", label: "mmHg" },
    { value: "bpm", label: "bpm (beats/min)" },
    { value: "°C", label: "°C" },
    { value: "°F", label: "°F" },
    { value: "cm", label: "cm" },
    { value: "m", label: "m" },
    { value: "kg", label: "kg" },
    { value: "g", label: "g" },
    { value: "lbs", label: "lbs" },
    { value: "mL", label: "mL" },
    { value: "cells/HPF", label: "cells/HPF" },
    { value: "mg/24h", label: "mg/24h" },
    { value: "other", label: "Other (type manually)" },
  ];
  const finalUnit = unit === "other" ? customUnit.trim() : unit;
  useEffect(() => {
    if (!hasMultipleSections && sections.length > 0) {
      setSelectedSection(sections[0].name);
    }
  }, [sections, hasMultipleSections]);
  useEffect(() => {
    if (!["select", "checkbox", "radio"].includes(fieldType)) {
      setOptions([]);
      setNewOption("");
      setEditingOptionIndex(null);
      setEditingOptionValue("");
    }
    if (fieldType !== "number") {
      setUnit("");
      setCustomUnit("");
      setStandardRangeType("none");
    }
  }, [fieldType]);
  useEffect(() => {
    if (standardRangeType === "simple") {
      setRangeData({ min: "", max: "" });
    } else if (standardRangeType === "gender") {
      setRangeData({ male: { min: "", max: "" }, female: { min: "", max: "" } });
    } else if (standardRangeType === "age" || standardRangeType === "combined") {
      setRangeData([]);
    } else {
      setRangeData(null);
    }
    setNewRangeEntry({});
    setEditingRangeIndex(null);
  }, [standardRangeType]);
  const needsOptions = ["select", "checkbox", "radio"].includes(fieldType);
  const needsMaxLength = ["input", "textarea"].includes(fieldType);
  const needsStandardRange = fieldType === "number" && standardRangeType !== "none";
  // Handlers (unchanged)
  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };
  const handleRemoveOption = (i) => setOptions(options.filter((_, idx) => idx !== i));
  const handleStartEditOption = (i, val) => {
    setEditingOptionIndex(i);
    setEditingOptionValue(val);
  };
  const handleSaveEditOption = () => {
    if (editingOptionValue.trim()) {
      const updated = [...options];
      updated[editingOptionIndex] = editingOptionValue.trim();
      setOptions(updated);
      setEditingOptionIndex(null);
      setEditingOptionValue("");
    }
  };
  const handleCancelEditOption = () => {
    setEditingOptionIndex(null);
    setEditingOptionValue("");
  };
  const handleSimpleOrGenderChange = (key, subKey, val) => {
    setRangeData((prev) => ({ ...prev, [key]: subKey ? { ...prev[key], [subKey]: val } : val }));
  };
  const handleNewRangeChange = (key, val) => {
    setNewRangeEntry((prev) => ({ ...prev, [key]: val }));
  };
  const validateRangeEntry = (entry, type) => {
    if (type === "age") return entry.minAge && entry.minValue && entry.maxValue;
    if (type === "combined") return entry.gender && entry.minAge && entry.minValue && entry.maxValue;
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
        setPopup({ type: "success", message: "Range updated" });
      } else {
        setRangeData((prev) => [...prev, entry]);
      }
      setNewRangeEntry({});
    } else {
      setPopup({ type: "error", message: "Fill all required fields" });
    }
  };
  const handleRemoveRange = (i) => setRangeData((prev) => prev.filter((_, idx) => idx !== i));
  const handleStartEditRange = (i) => {
    setEditingRangeIndex(i);
    setNewRangeEntry({ ...rangeData[i] });
  };
  const handleCancelEditRange = () => {
    setEditingRangeIndex(null);
    setNewRangeEntry({});
  };
  const handleSubmit = () => {
    if (!fieldName.trim()) return setPopup({ type: "error", message: "Field name required" });
    if (hasMultipleSections && !selectedSection) return setPopup({ type: "error", message: "Select a section" });
    const allFields = sections.flatMap((s) => s.fields || []);
    if (allFields.some((f) => f.name === fieldName))
      return setPopup({ type: "error", message: "Field name already exists" });
    if (needsOptions && options.length === 0) return setPopup({ type: "error", message: "Add at least one option" });
    if (needsStandardRange) {
      if (standardRangeType === "simple" && (!rangeData.min || !rangeData.max))
        return setPopup({ type: "error", message: "Min and max required" });
      if (
        standardRangeType === "gender" &&
        (!rangeData.male?.min || !rangeData.male?.max || !rangeData.female?.min || !rangeData.female?.max)
      )
        return setPopup({ type: "error", message: "Min/max required for both genders" });
      if ((standardRangeType === "age" || standardRangeType === "combined") && rangeData.length === 0)
        return setPopup({ type: "error", message: "Add at least one range" });
    }
    const sectionName = selectedSection || sections[0]?.name;
    const newField = { name: fieldName, type: fieldType, required: isRequired };
    if (needsOptions) newField.options = options;
    if (needsMaxLength && maxLength) newField.maxLength = parseInt(maxLength, 10);
    if (needsStandardRange) newField.standardRange = { type: standardRangeType, data: rangeData };
    if (fieldType === "number" && finalUnit) newField.unit = finalUnit;
    addField(sectionName, newField);
    resetForm();
  };
  const resetForm = () => {
    setFieldName("");
    setFieldType("input");
    setIsRequired(false);
    setMaxLength("");
    setOptions([]);
    setStandardRangeType("none");
    setRangeData(null);
    setUnit("");
    setCustomUnit("");
    setNewOption("");
    setEditingOptionIndex(null);
    setEditingOptionValue("");
    setNewRangeEntry({});
    setEditingRangeIndex(null);
    setSelectedSection(hasMultipleSections ? "" : sections[0]?.name || "");
    setShowAddFieldForm(false);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Fields</h3>
          <p className="text-sm text-gray-600">Add fields to sections</p>
        </div>
        {!showAddFieldForm && (
          <button
            onClick={() => setShowAddFieldForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
          >
            <AddIcon className="w-5 h-5" />
            Add Field
          </button>
        )}
      </div>
      {/* Form */}
      {showAddFieldForm && (
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-800">Add New Field</h4>
            <button onClick={() => setShowAddFieldForm(false)} className="text-gray-500 hover:text-gray-700">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-6">
            {/* Section */}
            {hasMultipleSections && (
              <SelectField
                label="Attach to Section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                options={sections.map((s) => ({ value: s.name, label: s.name }))}
              />
            )}
            {!hasMultipleSections && sections.length > 0 && (
              <p className="text-sm text-gray-600">
                Attaching to: <span className="font-medium">{sections[0].name}</span>
              </p>
            )}
            <InputField label="Name" value={fieldName} onChange={(e) => setFieldName(e.target.value)} />
            <SelectField
              label="Type"
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
              options={[
                { value: "input", label: "Text Input" },
                { value: "textarea", label: "Textarea" },
                { value: "select", label: "Select Dropdown" },
                { value: "checkbox", label: "Checkbox Group" },
                { value: "radio", label: "Radio Group" },
                { value: "number", label: "Number Input" },
              ]}
            />
            {needsMaxLength && (
              <InputField
                label="Max"
                type="number"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
              />
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Required field</span>
            </label>
            {/* Options */}
            {needsOptions && (
              <div className="space-y-4">
                <h5 className="text-sm font-semibold text-gray-800">Options</h5>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    {editingOptionIndex === i ? (
                      <>
                        <input
                          type="text"
                          value={editingOptionValue}
                          onChange={(e) => setEditingOptionValue(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={handleSaveEditOption} className="text-green-600 font-medium">
                          Save
                        </button>
                        <button onClick={handleCancelEditOption} className="text-gray-600">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 font-medium text-gray-800">{opt}</span>
                        <button onClick={() => handleStartEditOption(i, opt)} className="text-blue-600">
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRemoveOption(i)} className="text-red-600">
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-3">
                  <InputField
                    label="Option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="flex-1 pl-2"
                  />
                  <button
                    onClick={handleAddOption}
                    disabled={!newOption.trim()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                  >
                    <AddIcon className="w-5 h-5" /> Add
                  </button>
                </div>
              </div>
            )}
            {/* Number Field Settings */}
            {fieldType === "number" && (
              <>
                {/* Unit Selection */}
                <div className="space-y-4">
                  <SelectField
                    label="Unit"
                    value={unit}
                    onChange={(e) => {
                      setUnit(e.target.value);
                      if (e.target.value !== "other") setCustomUnit("");
                    }}
                    options={commonMedicalUnits}
                  />
                  {unit === "other" && (
                    <InputField
                      label="Custom Unit"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                    />
                  )}
                  {finalUnit && finalUnit !== "" && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Selected unit:</span> <strong>{finalUnit}</strong>
                    </div>
                  )}
                </div>
                <SelectField
                  label="Standard Range"
                  value={standardRangeType}
                  onChange={(e) => setStandardRangeType(e.target.value)}
                  options={[
                    { value: "none", label: "None" },
                    { value: "simple", label: "Simple Range" },
                    { value: "age", label: "Age Based" },
                    { value: "gender", label: "Gender Based" },
                    { value: "combined", label: "Age + Gender" },
                  ]}
                />
                {/* Simple Range */}
                {standardRangeType === "simple" && rangeData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Min"
                      type="number"
                      value={rangeData.min}
                      onChange={(e) => handleSimpleOrGenderChange("min", null, e.target.value)}
                    />
                    <InputField
                      label="Max"
                      type="number"
                      value={rangeData.max}
                      onChange={(e) => handleSimpleOrGenderChange("max", null, e.target.value)}
                    />
                  </div>
                )}
                {/* Gender Range */}
                {standardRangeType === "gender" && rangeData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Male Min"
                        type="number"
                        value={rangeData.male.min}
                        onChange={(e) => handleSimpleOrGenderChange("male", "min", e.target.value)}
                      />
                      <InputField
                        label="Male Max"
                        type="number"
                        value={rangeData.male.max}
                        onChange={(e) => handleSimpleOrGenderChange("male", "max", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField
                        label="Female Min"
                        type="number"
                        value={rangeData.female.min}
                        onChange={(e) => handleSimpleOrGenderChange("female", "min", e.target.value)}
                      />
                      <InputField
                        label="Female Max"
                        type="number"
                        value={rangeData.female.max}
                        onChange={(e) => handleSimpleOrGenderChange("female", "max", e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {/* Age / Combined Ranges */}
                {(standardRangeType === "age" || standardRangeType === "combined") && rangeData && (
                  <div className="space-y-5">
                    <h5 className="text-sm font-semibold text-gray-800">Ranges</h5>
                    {rangeData.map((r, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border text-sm">
                        <div className="flex-1 font-medium">
                          {standardRangeType === "combined" && (
                            <span className="text-blue-600">{r.gender === "male" ? "Male" : "Female"} • </span>
                          )}
                          Age {r.minAge}–{r.maxAge === 999 ? "99+" : r.maxAge}: {r.minValue}–{r.maxValue}
                        </div>
                        <button onClick={() => handleStartEditRange(i)} className="text-blue-600">
                          <EditIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRemoveRange(i)} className="text-red-600">
                          <DeleteIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <div className="p-5 bg-gray-50 rounded-xl space-y-5 border">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={handleAddOrUpdateRange}
                          disabled={!validateRangeEntry(newRangeEntry, standardRangeType)}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
                        >
                          <AddIcon className="w-5 h-5" />
                          {editingRangeIndex !== null ? "Update" : "Add"} Range
                        </button>
                        {editingRangeIndex !== null && (
                          <button
                            onClick={handleCancelEditRange}
                            className="px-5 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-blue-200">
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm"
              >
                Add Field
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AddField;
