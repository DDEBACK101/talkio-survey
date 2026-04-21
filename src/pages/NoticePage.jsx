import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function NoticePage() {
  const [searchParams] = useSearchParams();
  const cukey = searchParams.get("cukey")?.trim() || "";

  /**
   * survey가 같은 도메인에서 동작하면 그대로 사용
   * 만약 survey가 다른 도메인이라면 아래 값을 실제 survey 도메인으로 변경
   * 예: const surveyBaseUrl = "https://survey.example.com";
   */
  const surveyBaseUrl = window.location.origin;
  const surveyOrigin = new URL(surveyBaseUrl).origin;
  const parentOrigin = window.location.origin;

  useEffect(() => {
    const handleMessage = (event) => {
      // survey 페이지에서 보낸 메시지만 허용
      if (event.origin !== surveyOrigin) {
        return;
      }

      const data = event.data;

      if (!data || typeof data !== "object") {
        return;
      }

      if (data.type !== "SURVEY_COMPLETED") {
        return;
      }

      // 혹시 다른 사용자/다른 설문 메시지가 섞이는 것 방지
      if (cukey && data.cukey && cukey !== data.cukey) {
        console.warn("cukey가 일치하지 않는 메시지입니다.", data);
        return;
      }

      console.log("[NoticePage] 설문 완료 메시지 수신:", data);

      // 부모 페이지 새로고침
      window.location.reload();
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [cukey, surveyOrigin]);

  const handleMoveSurveyPage = () => {
    if (!cukey) {
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      return;
    }

    const surveyUrl =
      `${surveyBaseUrl}/survey` +
      `?cukey=${encodeURIComponent(cukey)}` +
      `&parentOrigin=${encodeURIComponent(parentOrigin)}`;

    const popup = window.open(
      surveyUrl,
      "talkioSurveyPopup",
      "width=900,height=860,left=100,top=50,resizable=yes,scrollbars=yes",
    );

    if (!popup) {
      alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
      return;
    }

    popup.focus();
  };

  return (
    <div className="notice-page">
      <button className="notice-button" onClick={handleMoveSurveyPage}>
        설문조사하러 가기
      </button>
    </div>
  );
}
