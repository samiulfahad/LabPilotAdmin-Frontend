import api from "./api";

const reportService = {
  getAll: () => api.get("/report/all"),
  getById: (id) => api.get("/report/" + id),
  addReport: (data) => api.post("/report/add", { data }),
  updateReport: (id, data) => api.put("/report/update/" + id, { data }),
  deleteReport: (id) => api.delete("/report/delete/" + id),
};

export default reportService;
