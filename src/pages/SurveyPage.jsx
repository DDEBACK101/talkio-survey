import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { surveyData } from "../data/surveyData";
import { supabase } from "../lib/supabase.jsx";
import { requestExternalServerOk } from "../api/externalApi.jsx";
import "../index.css";

function SurveyPage() {
  const [answers, setAnswers] = useState({});
  const [etcInputs, setEtcInputs] = useState({});
  const [searchParams] = useSearchParams();

  const cukey = searchParams.get("cukey")?.trim() || "";
  const returnUrlParam = searchParams.get("returnUrl")?.trim() || "";

  const safeReturnUrl = useMemo(() => {
    try {
      if (returnUrlParam) {
        return new URL(returnUrlParam, window.location.origin).toString();
      }

      return `${window.location.origin}/?cukey=${encodeURIComponent(cukey)}`;
    } catch (error) {
      console.warn("[SurveyPage][1] returnUrl 파싱 실패:", error);
      return `${window.location.origin}/?cukey=${encodeURIComponent(cukey)}`;
    }
  }, [returnUrlParam, cukey]);

  useEffect(() => {
    const paramsObject = Object.fromEntries(searchParams.entries());

    console.log("[SurveyPage][2] 페이지 진입");
    console.log("[SurveyPage][3] 현재 경로:", window.location.pathname);
    console.log("[SurveyPage][4] 현재 쿼리:", window.location.search);
    console.log("[SurveyPage][5] 파라미터 전체:", paramsObject);
    console.log("[SurveyPage][6] cukey:", cukey);
    console.log("[SurveyPage][7] returnUrlParam:", returnUrlParam);
    console.log("[SurveyPage][8] safeReturnUrl:", safeReturnUrl);
  }, [searchParams, cukey, returnUrlParam, safeReturnUrl]);

  const allQuestions = useMemo(() => {
    return surveyData.sections.flatMap((section) => section.questions);
  }, []);

  const totalQuestionCount = allQuestions.length;

  const answeredCount = allQuestions.filter((question) => {
    const selectedValue = answers[question.id];

    if (!selectedValue) return false;

    if (selectedValue === "기타") {
      return Boolean(etcInputs[question.id]?.trim());
    }

    return true;
  }).length;

  const progressPercent =
    totalQuestionCount > 0
      ? Math.round((answeredCount / totalQuestionCount) * 100)
      : 0;

  const handleChange = (questionId, value) => {
    console.log("[SurveyPage][9] 답변 선택", { questionId, value });

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleEtcChange = (questionId, value) => {
    setEtcInputs((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateForm = () => {
    console.log("[SurveyPage][10] 유효성 검사 시작");

    const unansweredQuestions = [];

    for (const question of allQuestions) {
      const selectedValue = answers[question.id];

      if (!selectedValue) {
        unansweredQuestions.push(question.id);
        continue;
      }

      if (selectedValue === "기타" && !etcInputs[question.id]?.trim()) {
        unansweredQuestions.push(question.id);
      }
    }

    if (unansweredQuestions.length > 0) {
      console.warn("[SurveyPage][11] 미응답 문항:", unansweredQuestions);

      alert(
        `${unansweredQuestions.join(", ")}번 항목을 선택하지 않으셨습니다. 선택해주세요.`,
      );
      return false;
    }

    console.log("[SurveyPage][12] 유효성 검사 통과");
    return true;
  };

  const buildSubmitData = () => {
    const builtData = allQuestions.map((question) => {
      const selectedValue = answers[question.id];

      return {
        questionId: question.id,
        questionText: question.text,
        answer: selectedValue,
        etcText:
          selectedValue === "기타" ? etcInputs[question.id]?.trim() || "" : "",
      };
    });

    console.log("[SurveyPage][13] 제출 데이터 생성 완료");
    console.log(builtData);

    return builtData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("[SurveyPage][14] 제출 버튼 클릭");

    if (!cukey) {
      console.warn("[SurveyPage][15] cukey 없음");
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

    const submitData = {
      surveyTitle: surveyData.surveyTitle,
      cukey,
      submittedAt: new Date().toISOString(),
      responses: buildSubmitData(),
    };

    console.log("[SurveyPage][16] 최종 submitData");
    console.log(submitData);

    try {
      console.log("[SurveyPage][17] 외부 서버 요청 시작");

      // 1. 외부 서버 AJAX 통신
      const externalResult = await requestExternalServerOk(submitData);

      console.log("[SurveyPage][18] 외부 서버 응답 도착");
      console.log(externalResult);

      if (!externalResult.ok) {
        console.error("[SurveyPage][19] 외부 서버 응답 실패:", externalResult);
        alert("저장에 실패했습니다");
        return;
      }

      console.log("[SurveyPage][20] Supabase 저장 시작");

      // 2. 외부 서버 OK일 때만 Supabase 저장
      const { error } = await supabase.from("survey_responses").insert([
        {
          survey_title: surveyData.surveyTitle,
          cukey,
          responses: submitData.responses,
        },
      ]);

      if (error) {
        console.error("[SurveyPage][21] Supabase 저장 실패:", error);
        alert("저장에 실패했습니다");
        return;
      }

      console.log("[SurveyPage][22] Supabase 저장 성공");

      // 3. 저장 성공 후 NoticePage로 다시 이동
      const returnUrlObject = new URL(safeReturnUrl);
      returnUrlObject.searchParams.set("cukey", cukey);
      returnUrlObject.searchParams.set("surveyDone", "Y");
      returnUrlObject.searchParams.set("submittedAt", submitData.submittedAt);

      const finalReturnUrl = returnUrlObject.toString();

      console.log("[SurveyPage][23] NoticePage 복귀용 데이터");
      console.log({
        cukey,
        submittedAt: submitData.submittedAt,
        safeReturnUrl,
        finalReturnUrl,
      });

      console.log("[SurveyPage][24] NoticePage로 같은 창 이동 시작");
      window.location.href = finalReturnUrl;
    } catch (error) {
      console.error("[SurveyPage][25] 처리 실패:", error);
      alert("저장에 실패했습니다");
    }
  };

  return (
    <div className="survey-container popup-survey-container">
      <h1 className="survey-title">{surveyData.surveyTitle}</h1>

      <div className="progress-box">
        <div className="progress-text">
          진행률: {answeredCount} / {totalQuestionCount} ({progressPercent}%)
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {surveyData.sections.map((section) => (
          <section key={section.sectionId} className="survey-section">
            <h2 className="section-title">{section.sectionTitle}</h2>

            {section.questions.map((question) => {
              const selectedValue = answers[question.id];
              const isEtcSelected = selectedValue === "기타";

              return (
                <div key={question.id} className="question-box">
                  <p className="question-text">
                    {question.id}. {question.text}
                  </p>

                  <div className="option-list">
                    {question.options.map((option) => (
                      <label key={option} className="option-item">
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={selectedValue === option}
                          onChange={() => handleChange(question.id, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

                  {isEtcSelected && (
                    <div className="etc-box">
                      <input
                        type="text"
                        className="etc-input"
                        placeholder="기타 내용을 입력해주세요."
                        value={etcInputs[question.id] || ""}
                        onChange={(e) =>
                          handleEtcChange(question.id, e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        ))}

        <button type="submit" className="submit-button">
          제출하기
        </button>
      </form>
    </div>
  );
}

export default SurveyPage;
