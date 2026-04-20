import { useSearchParams } from "react-router-dom";

export default function NoticePage() {
  const [searchParams] = useSearchParams();
  const userKey = searchParams.get("userkey")?.trim() || "";

  const handleOpenSurveyPopup = () => {
    if (!userKey) {
      alert("userkey가 없습니다. 올바른 경로로 접속해주세요.");
      return;
    }

    const surveyUrl = `${window.location.origin}/survey?userkey=${encodeURIComponent(userKey)}`;

    const popup = window.open(
      surveyUrl,
      "surveyPopup",
      "width=900,height=850,left=200,top=100,resizable=yes,scrollbars=yes",
    );

    if (!popup) {
      alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
      return;
    }

    popup.focus();
  };

  return (
    <div className="notice-page">
      <div style={{ marginBottom: "12px", fontSize: "14px" }}>
        현재 userKey: {userKey || "없음"}
      </div>

      <button className="notice-button" onClick={handleOpenSurveyPopup}>
        설문조사하러 가기
      </button>
    </div>
  );
}
