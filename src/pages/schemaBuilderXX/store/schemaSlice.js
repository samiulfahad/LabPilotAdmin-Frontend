// schemaSlice.js
import testService from "../../../services/testService";
const initialSchema = {
  name: "",
  description: "",
  testId: "",
  isActive: false,
  hasStaticStandardRange: false,
  staticStandardRange: "",
  sections: [{ name: "Default", fields: [] }],
  currentSectionName: "",
};
const schemaSlice = (set, get) => ({
  testList: [],
  schema: { ...initialSchema },
  // Reset schema to initial state
  resetSchema: () => {
    set({ schema: { ...initialSchema } });
  },
  setFullSchema: (newSchema) => {
    set({ schema: { ...initialSchema, ...newSchema } });
  },
  setSchema: (field, value) => {
    set((state) => ({
      schema: { ...state.schema, [field]: value },
    }));
  },
  loadTestList: async () => {
    try {
      get().startLoading();
      const response = await testService.getTestList();
      // console.log(response.data);
      set({ testList: response.data });
    } catch (e) {
      get().setPopup({
        type: "error",
        message: "Failed to load tests. Please try again.",
      });
    } finally {
      get().stopLoading();
    }
  },
  isSectionNameUnique: (name, excludeName = null) => {
    const sections = get().schema.sections;
    const normalized = name.toLowerCase().trim();
    return !sections.some((s) => {
      if (excludeName && s.name === excludeName) return false;
      return s.name.toLowerCase().trim() === normalized;
    });
  },
  addSection: () => {
    const name = get().schema.currentSectionName.trim();
    if (!name) return;
    if (!get().isSectionNameUnique(name)) {
      get().setPopup({
        type: "error",
        message: `Section "${name}" already exists!`,
      });
      return false;
    }
    set((state) => ({
      schema: {
        ...state.schema,
        sections: [...state.schema.sections, { name, fields: [] }],
        currentSectionName: "",
      },
    }));
    return true;
  },
  deleteSection: (sectionName) => {
    if (get().schema.sections.length === 1) {
      get().setPopup({
        type: "error",
        message: "Cannot delete the last section!",
      });
      return;
    }
    set((state) => ({
      schema: {
        ...state.schema,
        sections: state.schema.sections.filter((s) => s.name !== sectionName),
      },
    }));
  },
  updateSection: (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (!get().isSectionNameUnique(trimmed, oldName)) {
      get().setPopup({
        type: "error",
        message: `Section "${trimmed}" already exists!`,
      });
      return;
    }
    set((state) => ({
      schema: {
        ...state.schema,
        sections: state.schema.sections.map((s) => (s.name === oldName ? { ...s, name: trimmed } : s)),
      },
    }));
    get().setPopup({
      type: "success",
      message: "Section renamed successfully!",
    });
  },
  confirmRemoveStaticStandardRange: () => {
    get().setPopup({
      type: "confirmation",
      message: "This will delete all reference values. Continue?",
      onConfirm: () => {
        set((state) => ({
          schema: {
            ...state.schema,
            hasStaticStandardRange: false,
            staticStandardRange: "",
          },
        }));
        get().setPopup({
          type: "success",
          message: "Standard range disabled.",
        });
      },
    });
  },
  addField: (sectionName, newField) =>
    set((state) => {
      const updatedSections = state.schema?.sections?.map((sec) => {
        if (sec.name === sectionName) {
          return {
            ...sec,
            fields: [...(sec.fields || []), newField],
          };
        }
        return sec;
      });
      return {
        schema: {
          ...state.schema,
          sections: updatedSections,
        },
      };
    }),
  updateField: (sectionName, oldFieldName, updatedField) =>
    set((state) => {
      const updatedSections = state.schema.sections.map((sec) => {
        if (sec.name === sectionName) {
          const updatedFields = sec.fields.map((field) => (field.name === oldFieldName ? updatedField : field));
          return { ...sec, fields: updatedFields };
        }
        return sec;
      });
      return {
        schema: {
          ...state.schema,
          sections: updatedSections,
        },
      };
    }),
  deleteField: (sectionName, fieldName) =>
    set((state) => {
      const updatedSections = state.schema.sections.map((sec) => {
        if (sec.name === sectionName) {
          return {
            ...sec,
            fields: sec.fields.filter((field) => field.name !== fieldName),
          };
        }
        return sec;
      });
      return {
        schema: {
          ...state.schema,
          sections: updatedSections,
        },
      };
    }),
  clearStaticStandardRange: () => {
    set((state) => ({
      schema: { ...state.schema, staticStandardRange: "" },
    }));
  },
});
export default schemaSlice;
