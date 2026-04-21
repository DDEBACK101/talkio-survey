import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function NoticePage() {
  const [searchParams] = useSearchParams();
  const cukey = searchParams.get("cukey")?.trim() || "";

  useEffect(() => {
    const handleMessage = (event) => {
      console.group("[NoticePage] message 수신");
      console.log("event.origin:", event.origin);
      console.log("event.data:", event.data);

      if (event.origin !== "https://talkio-survey.netlify.app") {
        console.warn("[NoticePage] 허용되지 않은 origin");
        console.groupEnd();
        return;
      }

      if (!event.data || typeof event.data !== "object") {
        console.warn("[NoticePage] data 형식 오류");
        console.groupEnd();
        return;
      }

      if (event.data.type === "REFRESH_PARENT") {
        console.log("[NoticePage] REFRESH_PARENT 수신");
        console.log("[NoticePage] 수신 데이터:", {
          cukey: event.data.cukey,
          submittedAt: event.data.submittedAt,
        });
        console.log("[NoticePage] 1초 후 새로고침");
        console.groupEnd();

        setTimeout(() => {
          window.location.reload();
        }, 1000);

        return;
      }

      console.log("[NoticePage] 처리 대상 아님");
      console.groupEnd();
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleMoveSurveyPage = () => {
    console.group("[NoticePage] 설문 페이지 열기");

    if (!cukey) {
      console.warn("[NoticePage] cukey 없음");
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      console.groupEnd();
      return;
    }

    const surveyUrl = `https://talkio-survey.netlify.app/survey?cukey=${encodeURIComponent(cukey)}`;

    console.log("cukey:", cukey);
    console.log("surveyUrl:", surveyUrl);

    const popup = window.open(
      surveyUrl,
      "talkioSurveyPopup",
      "width=900,height=860,left=100,top=50,resizable=yes,scrollbars=yes",
    );

    if (!popup) {
      console.warn("[NoticePage] 팝업 차단됨");
      alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
      console.groupEnd();
      return;
    }

    console.log("[NoticePage] 팝업 열기 성공");
    popup.focus();
    console.groupEnd();
  };

  return (
    <div className="notice-page">
      <button className="notice-button" onClick={handleMoveSurveyPage}>
        설문조사하러 가기
      </button>
    </div>
  );
}
