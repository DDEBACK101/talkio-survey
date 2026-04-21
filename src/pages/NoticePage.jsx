import { useEffect } from "react";
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
