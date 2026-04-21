/* import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function NoticePage() {
  const [searchParams] = useSearchParams();

  const cukey = searchParams.get("cukey")?.trim() || "";
  const surveyDone = searchParams.get("surveyDone")?.trim() || "";
  const submittedAt = searchParams.get("submittedAt")?.trim() || "";

  // NoticePage가 현재 "/" 경로라고 가정
  // 경로가 다르면 여기만 바꾸면 됨
  const noticePath = "/";

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());

    console.log("[NoticePage][1] 페이지 진입");
    console.log("[NoticePage][2] 현재 경로:", window.location.pathname);
    console.log("[NoticePage][3] 현재 쿼리:", window.location.search);
    console.log("[NoticePage][4] 파라미터 전체:", paramsObject);
    console.log("[NoticePage][5] cukey:", cukey);
    console.log("[NoticePage][6] surveyDone:", surveyDone);
    console.log("[NoticePage][7] submittedAt:", submittedAt);

    if (!cukey) {
      console.warn("[NoticePage][8] cukey 없음");
      return;
    }

    // SurveyPage에서 저장 완료 후 다시 돌아왔을 때
    if (surveyDone === "Y") {
      const cleanUrl =
        `${window.location.origin}${noticePath}` +
        `?cukey=${encodeURIComponent(cukey)}`;

      console.log("[NoticePage][9] 설문 완료 후 NoticePage 복귀 감지");
      console.log("[NoticePage][10] 최종 새로고침용 URL:", cleanUrl);
      console.log("[NoticePage][11] 0.3초 후 최종 새로고침 실행");

      setTimeout(() => {
        window.location.replace(cleanUrl);
      }, 300);
    }
  }, [searchParams, cukey, surveyDone, submittedAt]);

  const handleMoveSurveyPage = () => {
    console.log("[NoticePage][12] 설문조사 버튼 클릭");

    if (!cukey) {
      console.warn("[NoticePage][13] cukey가 없어서 이동 중단");
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      return;
    }

    const returnUrl =
      `${window.location.origin}${noticePath}` +
      `?cukey=${encodeURIComponent(cukey)}`;

    const surveyUrl =
      `${window.location.origin}/survey` +
      `?cukey=${encodeURIComponent(cukey)}` +
      `&returnUrl=${encodeURIComponent(returnUrl)}`;

    console.log("[NoticePage][14] SurveyPage 이동용 데이터");
    console.log({
      cukey,
      returnUrl,
      surveyUrl,
    });

    console.log("[NoticePage][15] SurveyPage로 같은 창 이동 시작");
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
 */
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function NoticePage() {
  const [searchParams] = useSearchParams();

  const cukey = searchParams.get("cukey")?.trim() || "";
  const surveyDone = searchParams.get("surveyDone")?.trim() || "";
  const submittedAt = searchParams.get("submittedAt")?.trim() || "";
  const debugReturn = searchParams.get("debugReturn")?.trim() || "";

  const noticePath = "/";

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());

    console.group("[NoticePage] 진입");
    console.log("pathname:", window.location.pathname);
    console.log("search:", window.location.search);
    console.log("params:", paramsObject);
    console.log("cukey:", cukey);
    console.log("surveyDone:", surveyDone);
    console.log("submittedAt:", submittedAt);
    console.log("debugReturn:", debugReturn);
    console.groupEnd();

    if (!cukey) {
      console.warn("[NoticePage] cukey 없음");
      return;
    }

    if (surveyDone === "Y") {
      const cleanUrl =
        `${window.location.origin}${noticePath}` +
        `?cukey=${encodeURIComponent(cukey)}`;

      console.group("[NoticePage] 설문 완료 복귀 감지");
      console.log("cleanUrl:", cleanUrl);
      console.log("현재 sessionStorage:", {
        survey_debug_pause: sessionStorage.getItem("survey_debug_pause"),
      });
      console.groupEnd();

      // 디버그 모드면 refresh를 1회 막고 콘솔 확인
      if (debugReturn === "1") {
        const alreadyPaused = sessionStorage.getItem("survey_debug_pause");

        if (!alreadyPaused) {
          sessionStorage.setItem("survey_debug_pause", "done");

          console.warn(
            "[NoticePage] DEBUG MODE - 자동 새로고침을 1회 막았습니다. 콘솔 확인 후 아래 버튼으로 수동 새로고침하세요.",
          );
          return;
        }
      }

      console.log("[NoticePage] 자동 새로고침 실행");
      window.location.replace(cleanUrl);
    }
  }, [searchParams, cukey, surveyDone, submittedAt, debugReturn]);

  const handleMoveSurveyPage = () => {
    console.group("[NoticePage] 설문 페이지 이동");
    console.log("cukey:", cukey);

    if (!cukey) {
      console.warn("cukey가 없어서 이동 중단");
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      console.groupEnd();
      return;
    }

    const returnUrl =
      `${window.location.origin}${noticePath}` +
      `?cukey=${encodeURIComponent(cukey)}` +
      `&debugReturn=${encodeURIComponent(debugReturn || "0")}`;

    const surveyUrl =
      `${window.location.origin}/survey` +
      `?cukey=${encodeURIComponent(cukey)}` +
      `&returnUrl=${encodeURIComponent(returnUrl)}`;

    console.log("returnUrl:", returnUrl);
    console.log("surveyUrl:", surveyUrl);
    console.groupEnd();

    window.location.href = surveyUrl;
  };

  const handleManualRefresh = () => {
    console.log("[NoticePage] 수동 새로고침 버튼 클릭");
    sessionStorage.removeItem("survey_debug_pause");
    window.location.replace(
      `${window.location.origin}${noticePath}?cukey=${encodeURIComponent(cukey)}`,
    );
  };

  return (
    <div className="notice-page">
      <button className="notice-button" onClick={handleMoveSurveyPage}>
        설문조사하러 가기
      </button>

      {debugReturn === "1" && (
        <button
          type="button"
          className="notice-button"
          onClick={handleManualRefresh}
          style={{ marginLeft: "8px" }}
        >
          수동 새로고침
        </button>
      )}
    </div>
  );
}