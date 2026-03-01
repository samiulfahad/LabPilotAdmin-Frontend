import { create } from "zustand";

import loadingSlice from "../../../store/common/loadingSlice";
import modalSlice from "../../../store/common/modalSlice";
import popupSlice from "../../../store/common/popupSlice";
import schemaSlice  from "./schemaSlice";

const useStore = create((set, get) => ({
  ...loadingSlice(set, get),
  ...modalSlice(set, get),
  ...popupSlice(set, get),

  // domain data after UI slices
  ...schemaSlice(set, get),

  clearState: () =>
    set({
      loading: false,
      popup: { type: null, action: null, message: null, data: null },
      modal: { view: null, data: null },
    }),
}));

export default useStore;
