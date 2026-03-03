import api from "./api";

const reportService = {
  getReports: () => api.get("/report/all"),
  addReport: (data) => api.post("/report/add", { data: data }),
};

export default reportService;
