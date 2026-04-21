import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const SURVEY_ORIGIN = "https://talkio-survey.netlify.app";
const TALKIO_ORIGIN = "https://talkio.co.kr";

export default function NoticePage() {
  const [searchParams] = useSearchParams();
  const cukey = searchParams.get("cukey")?.trim() || "";

  useEffect(() => {
    const handleMessage = (event) => {
      console.group("[NoticePage] message 수신");
      console.log("event.origin:", event.origin);
      console.log("event.data:", event.data);
      console.log("current origin:", window.location.origin);
      console.log("window.opener:", window.opener);
      console.log("window.opener exists:", !!window.opener);
      console.log("window.opener closed:", window.opener?.closed);

      if (event.origin !== SURVEY_ORIGIN) {
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
        console.log("[NoticePage] 수신 payload:", {
          cukey: event.data.cukey,
          submittedAt: event.data.submittedAt,
          targetPage: event.data.targetPage,
        });

        // 1) SurveyPage에 ACK 반환
        try {
          if (event.source) {
            event.source.postMessage(
              {
                type: "REFRESH_PARENT_ACK",
                received: true,
                receivedAt: new Date().toISOString(),
              },
              event.origin,
            );
            console.log("[NoticePage] SurveyPage로 ACK 전송 완료");
          } else {
            console.warn("[NoticePage] event.source가 없어 ACK 전송 불가");
          }
        } catch (ackError) {
          console.error("[NoticePage] ACK 전송 실패:", ackError);
        }

        // 2) Talkio 부모창으로 다시 전달
        try {
          if (window.opener && !window.opener.closed) {
            const forwardPayload = {
              type: "REFRESH_TALKIO_NOTICE",
              cukey: event.data.cukey,
              submittedAt: event.data.submittedAt,
              forwardedAt: new Date().toISOString(),
              source: "talkio-survey-notice-bridge",
            };

            console.log("[NoticePage] Talkio 부모창 전달 직전");
            console.log("targetOrigin:", TALKIO_ORIGIN);
            console.log("forwardPayload:", forwardPayload);

            window.opener.postMessage(forwardPayload, TALKIO_ORIGIN);

            console.log("[NoticePage] Talkio 부모창 전달 완료");
            console.log("[NoticePage] 1초 뒤 NoticePage 닫기");
          } else {
            console.warn(
              "[NoticePage] Talkio 부모창(opener)을 찾지 못했습니다.",
            );
          }
        } catch (forwardError) {
          console.error("[NoticePage] Talkio 부모창 전달 실패:", forwardError);
        }

        console.groupEnd();

        setTimeout(() => {
          console.log("[NoticePage] window.close() 실행");
          window.close();
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
    console.group("[NoticePage] SurveyPage 열기");

    if (!cukey) {
      console.warn("[NoticePage] cukey 없음");
      console.groupEnd();
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      return;
    }

    const parentOrigin = window.location.origin;

    const surveyUrl =
      `${SURVEY_ORIGIN}/survey` +
      `?cukey=${encodeURIComponent(cukey)}` +
      `&parentOrigin=${encodeURIComponent(parentOrigin)}`;

    console.log("cukey:", cukey);
    console.log("parentOrigin:", parentOrigin);
    console.log("surveyUrl:", surveyUrl);

    const popup = window.open(
      surveyUrl,
      "talkioSurveyPopup",
      "width=900,height=860,left=100,top=50,resizable=yes,scrollbars=yes",
    );

    if (!popup) {
      console.warn("[NoticePage] 팝업 차단됨");
      console.groupEnd();
      alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
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
