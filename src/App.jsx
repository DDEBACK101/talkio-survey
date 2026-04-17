import { Routes, Route } from "react-router-dom";
import NoticePage from "./pages/NoticePage.jsx";
import SurveyPage from "./pages/SurveyPage.jsx";
import "./index.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<NoticePage />} />
      <Route path="/survey" element={<SurveyPage />} />
    </Routes>
  );
}

export default App;
