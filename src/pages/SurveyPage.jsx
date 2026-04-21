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
      console.warn("[SurveyPage] returnUrl 파싱 실패:", error);
      return `${window.location.origin}/?cukey=${encodeURIComponent(cukey)}`;
    }
  }, [returnUrlParam, cukey]);

  useEffect(() => {
    console.group("[SurveyPage] 초기 진입");
    console.log("pathname:", window.location.pathname);
    console.log("search:", window.location.search);
    console.log("cukey:", cukey);
    console.log("returnUrlParam:", returnUrlParam);
    console.log("safeReturnUrl:", safeReturnUrl);
    console.groupEnd();
  }, [cukey, returnUrlParam, safeReturnUrl]);

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
    console.log("[SurveyPage] 답변 선택:", { questionId, value });
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleEtcChange = (questionId, value) => {
    console.log("[SurveyPage] 기타 입력:", { questionId, value });
    setEtcInputs((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const validateForm = () => {
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
      console.warn("[SurveyPage] 미응답 문항:", unansweredQuestions);
      alert(
        `${unansweredQuestions.join(", ")}번 항목을 선택하지 않으셨습니다. 선택해주세요.`,
      );
      return false;
    }

    console.log("[SurveyPage] 유효성 검사 통과");
    return true;
  };

  const buildSubmitData = () => {
    const data = allQuestions.map((question) => {
      const selectedValue = answers[question.id];

      return {
        questionId: question.id,
        questionText: question.text,
        answer: selectedValue,
        etcText:
          selectedValue === "기타" ? etcInputs[question.id]?.trim() || "" : "",
      };
    });

    console.group("[SurveyPage] buildSubmitData 결과");
    console.log(data);
    console.groupEnd();

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.group("[SurveyPage] 제출 시작");

    if (!cukey) {
      console.warn("cukey 없음");
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
      console.groupEnd();
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      console.groupEnd();
      return;
    }

    const submitData = {
      surveyTitle: surveyData.surveyTitle,
      cukey,
      submittedAt: new Date().toISOString(),
      responses: buildSubmitData(),
    };

    console.log("submitData:", submitData);

    try {
      console.log("1) 외부 서버 요청 시작");
      const externalResult = await requestExternalServerOk(submitData);
      console.log("2) 외부 서버 응답:", externalResult);

      if (!externalResult.ok) {
        console.error("외부 서버 응답 실패");
        alert("저장에 실패했습니다");
        console.groupEnd();
        return;
      }

      console.log("3) Supabase 저장 시작");
      const { error } = await supabase.from("survey_responses").insert([
        {
          survey_title: surveyData.surveyTitle,
          cukey,
          responses: submitData.responses,
        },
      ]);

      if (error) {
        console.error("4) Supabase 저장 실패:", error);
        alert("저장에 실패했습니다");
        console.groupEnd();
        return;
      }

      console.log("4) Supabase 저장 성공");

      const returnUrlObject = new URL(safeReturnUrl);
      returnUrlObject.searchParams.set("cukey", cukey);
      returnUrlObject.searchParams.set("surveyDone", "Y");
      returnUrlObject.searchParams.set("submittedAt", submitData.submittedAt);

      const finalReturnUrl = returnUrlObject.toString();

      console.log("5) 최종 복귀 URL:", finalReturnUrl);
      console.groupEnd();

      window.location.href = finalReturnUrl;
    } catch (error) {
      console.error("[SurveyPage] 처리 실패:", error);
      console.groupEnd();
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
