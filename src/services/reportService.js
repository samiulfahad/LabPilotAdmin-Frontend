import api from "./api";

const reportService = {
  getAll: () => api.get("/report/all"),
  addReport: (data) => api.post("/report/add", { data: data }),
  deleteReport: (id) => api.delete("/report/delete/" + id),
};

export default reportService;
