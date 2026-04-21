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
  const parentOrigin = searchParams.get("parentOrigin")?.trim() || "";

  useEffect(() => {
    console.group("[SurveyPage] 초기 진입");
    console.log("pathname:", window.location.pathname);
    console.log("search:", window.location.search);
    console.log("cukey:", cukey);
    console.log("parentOrigin:", parentOrigin);
    console.log("window.opener:", window.opener);
    console.log("has opener:", !!window.opener);
    console.groupEnd();
  }, [cukey, parentOrigin]);

  useEffect(() => {
    const handleAckMessage = (event) => {
      console.group("[SurveyPage] ACK 수신 확인");
      console.log("event.origin:", event.origin);
      console.log("event.data:", event.data);
      console.log("expected parentOrigin:", parentOrigin);

      if (!parentOrigin) {
        console.warn("[SurveyPage] parentOrigin 없음");
        console.groupEnd();
        return;
      }

      if (event.origin !== parentOrigin) {
        console.warn("[SurveyPage] 부모 origin 불일치");
        console.groupEnd();
        return;
      }

      if (event.data?.type === "REFRESH_PARENT_ACK") {
        console.log("[SurveyPage] 부모창이 REFRESH_PARENT를 정상 수신함");
        console.log("[SurveyPage] 3초 뒤 창 닫기");
        console.groupEnd();

        setTimeout(() => {
          console.log("[SurveyPage] window.close() 실행");
          window.close();

          setTimeout(() => {
            if (!window.closed) {
              alert(
                "저장 및 부모창 전달 요청이 완료되었습니다. 창이 자동으로 닫히지 않으면 직접 닫아주세요.",
              );
            }
          }, 300);
        }, 3000);

        return;
      }

      console.log("[SurveyPage] ACK 아님");
      console.groupEnd();
    };

    window.addEventListener("message", handleAckMessage);

    return () => {
      window.removeEventListener("message", handleAckMessage);
    };
  }, [parentOrigin]);

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

  const sendRefreshMessage = (submittedAt) => {
    console.group("[SurveyPage] 부모창 메시지 전달 시작");

    const payload = {
      type: "REFRESH_PARENT",
      cukey,
      submittedAt,
      targetPage: "https://talkio.co.kr/hub2/xtest/survey/",
    };

    console.log("parentOrigin:", parentOrigin);
    console.log("payload:", payload);
    console.log("window.opener:", window.opener);
    console.log("window.opener exists:", !!window.opener);
    console.log("window.opener closed:", window.opener?.closed);

    if (!parentOrigin) {
      console.error("[SurveyPage] parentOrigin이 없습니다.");
      console.groupEnd();
      alert("부모창 origin 정보가 없습니다.");
      return;
    }

    if (window.opener && !window.opener.closed) {
      try {
        console.log("[SurveyPage] postMessage 전송 직전");
        window.opener.postMessage(payload, parentOrigin);
        console.log("[SurveyPage] postMessage 전송 완료");
        console.log("[SurveyPage] 이제 부모창 ACK를 기다립니다.");
        console.groupEnd();
      } catch (error) {
        console.error("[SurveyPage] postMessage 전송 실패:", error);
        console.groupEnd();
        alert("저장은 완료되었지만 부모창 메시지 전달에 실패했습니다.");
      }
    } else {
      console.warn("[SurveyPage] opener를 찾지 못했습니다.");
      console.groupEnd();
      alert("저장은 완료되었지만 부모창(opener)을 찾지 못했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.group("[SurveyPage] 제출 시작");

    if (!cukey) {
      console.warn("[SurveyPage] cukey 없음");
      console.groupEnd();
      alert("cukey가 없습니다. 올바른 경로로 접속해주세요.");
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
        console.error("[SurveyPage] 외부 서버 응답 실패:", externalResult);
        console.groupEnd();
        alert("저장에 실패했습니다");
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
        console.error("[SurveyPage] Supabase 저장 실패:", error);
        console.groupEnd();
        alert("저장에 실패했습니다");
        return;
      }

      console.log("4) Supabase 저장 성공");
      console.log("5) 부모창 메시지 전달 준비");
      console.groupEnd();

      sendRefreshMessage(submitData.submittedAt);
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
