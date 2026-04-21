import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const SURVEY_ORIGIN = "https://talkio-survey.netlify.app";
const TALKIO_ORIGIN = "https://talkio.co.kr";

export default function NoticePage() {
  const [searchParams] = useSearchParams();
  const cukey = searchParams.get("cukey")?.trim() || "";

  const postToOpener = (payload, label = "opener postMessage") => {
    console.group(`[NoticePage] ${label}`);
    console.log("current href:", window.location.href);
    console.log("current origin:", window.location.origin);
    console.log("window.opener:", window.opener);
    console.log("window.opener exists:", !!window.opener);
    console.log("window.opener closed:", window.opener?.closed);
    console.log("targetOrigin:", TALKIO_ORIGIN);
    console.log("payload:", payload);

    if (!window.opener || window.opener.closed) {
      console.warn("[NoticePage] 부모창(opener)을 찾지 못했습니다.");
      console.groupEnd();
      return false;
    }

    try {
      window.opener.postMessage(payload, TALKIO_ORIGIN);
      console.log("[NoticePage] postMessage 전송 완료");
      console.groupEnd();
      return true;
    } catch (error) {
      console.error("[NoticePage] postMessage 전송 실패:", error);
      console.groupEnd();
      return false;
    }
  };

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
        const forwardPayload = {
          type: "REFRESH_TALKIO_NOTICE",
          cukey: event.data.cukey,
          submittedAt: event.data.submittedAt,
          forwardedAt: new Date().toISOString(),
          source: "talkio-survey-notice-bridge",
        };

        const forwarded = postToOpener(forwardPayload, "Talkio 부모창 전달");

        if (forwarded) {
          console.log("[NoticePage] 부모창 전달 성공 - 1초 뒤 창 닫기");
          console.groupEnd();

          setTimeout(() => {
            console.log("[NoticePage] window.close() 실행");
            window.close();
          }, 1000);
        } else {
          console.warn(
            "[NoticePage] 부모창 전달 실패 - 디버깅을 위해 창을 닫지 않습니다.",
          );
          console.groupEnd();
        }

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

  const handleSendTestEvent = () => {
    const testPayload = {
      type: "TEST_EVENT_FROM_NOTICE",
      message: "NoticePage에서 보낸 테스트 이벤트입니다.",
      cukey,
      sentAt: new Date().toISOString(),
      source: "talkio-survey-notice-test-button",
    };

    const ok = postToOpener(testPayload, "테스트 이벤트 전송");

    if (ok) {
      alert(
        "테스트 이벤트를 부모창으로 전송했습니다. 부모창 콘솔을 확인해주세요.",
      );
    } else {
      alert(
        "부모창(opener)을 찾지 못했습니다. 부모창의 여는 방식(window.open / target=_blank)을 먼저 확인해주세요.",
      );
    }
  };

  const handleCheckOpener = () => {
    console.group("[NoticePage] opener 상태 확인");
    console.log("current href:", window.location.href);
    console.log("current origin:", window.location.origin);
    console.log("window.opener:", window.opener);
    console.log("window.opener exists:", !!window.opener);
    console.log("window.opener closed:", window.opener?.closed);
    console.groupEnd();

    if (window.opener && !window.opener.closed) {
      alert("opener가 연결되어 있습니다. 개발자도구 콘솔을 확인해주세요.");
    } else {
      alert("opener가 없습니다. 부모창 여는 방식 문제일 가능성이 큽니다.");
    }
  };

  return (
    <div className="notice-page">
      <button className="notice-button" onClick={handleMoveSurveyPage}>
        설문조사하러 가기
      </button>

      <button className="notice-button" onClick={handleSendTestEvent}>
        이벤트 전송
      </button>

      <button className="notice-button" onClick={handleCheckOpener}>
        opener 확인
      </button>
    </div>
  );
}
