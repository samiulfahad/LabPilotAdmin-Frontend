import { Routes, Route } from "react-router-dom";

import Layout from "./components/layout";
import Home from "./pages/home";
import Lab from "./pages/lab";
import Zone from "./pages/zone";
import TestList from "./pages/testList";
import LabManagement from "./pages/labManagement";
import SchemaList from "./pages/schemaList";
import SchemaBuilder from "./pages/schemaBuilder";
import SchemaRenderer from "./pages/schemaRenderer";

import UnderConstruction from "./pages/schemaBuilder";
import ReportViewer from "./pages/reportViewer";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/labs" element={<Lab />} />
        <Route path="/zones" element={<Zone />} />
        <Route path="/test-list" element={<TestList />} />
        <Route path="/lab-management" element={<LabManagement />} />
        <Route path="/schema-builder" element={<SchemaBuilder />} />
        <Route path="/schema-builder/:schemaId" element={<SchemaBuilder />} />
        <Route path="/render-schema/:schemaId" element={<SchemaRenderer />} />
        <Route path="/schema-list" element={<SchemaList />} />
        <Route path="/reports" element={<ReportViewer />} />
        <Route path="/underConstruction" element={<UnderConstruction />} />
      </Routes>
    </Layout>
  );
}

export default App;
