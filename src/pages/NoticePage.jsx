import { useSearchParams } from "react-router-dom";

export default function NoticePage() {
  const [searchParams] = useSearchParams();
  const cukey = searchParams.get("cukey")?.trim() || "";

  const handleMoveSurveyPage = () => {
    if (!cukey) {
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      return;
    }

    const surveyUrl = `${window.location.origin}/survey?cukey=${encodeURIComponent(cukey)}`;

    window.location.href = surveyUrl;
  };

  return (
    <div className="notice-page">
      <button className="notice-button" onClick={handleMoveSurveyPage}>
        설문조사하러 가기
      </button>
    </div>
  );
}
