import ReportViewer from "./ReportViewer";

const mockReport = {
  _id: {
    $oid: "69a5b8d61a810d6e7696d258",
  },
  "Section A": {
    "Simple Number": {
      value: "4",
      referenceRange: "1–10",
    },
    "Gender Based": {
      value: "34",
      referenceRange: "8–10",
    },
    Age: {
      value: "108",
      referenceRange: "101–149",
    },
    Complex: {
      value: "29",
      referenceRange: "55–65",
    },
  },
  "Section B": {
    Result: {
      value: "Positive",
    },
    "Multi Select": {
      value: ["Option A", "Option B"],
    },
  },
  "Section C": {
    Comment: {
      value: "w4rt",
    },
  },
};

const ReportPage = () => {
  return (
    <section className="px-2 py-4">
      <ReportViewer report={mockReport} reportId={mockReport._id.$oid} reportName="Lab Report" />
    </section>
  );
};

export default ReportPage;
