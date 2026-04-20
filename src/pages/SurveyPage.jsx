import { useMemo, useState } from "react";
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

  const progressPercent = Math.round(
    (answeredCount / totalQuestionCount) * 100,
  );

  const handleChange = (questionId, value) => {
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
      alert(
        `${unansweredQuestions.join(", ")}번 항목을 선택하지 않으셨습니다. 선택해주세요.`,
      );
      return false;
    }

    return true;
  };

  const buildSubmitData = () => {
    return allQuestions.map((question) => {
      const selectedValue = answers[question.id];

      return {
        questionId: question.id,
        questionText: question.text,
        answer: selectedValue,
        etcText:
          selectedValue === "기타" ? etcInputs[question.id]?.trim() || "" : "",
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cukey) {
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

    try {
      const externalResult = await requestExternalServerOk(submitData);

      if (!externalResult.ok) {
        alert("저장에 실패했습니다");
        return;
      }

      const { error } = await supabase.from("survey_responses").insert([
        {
          survey_title: surveyData.surveyTitle,
          cukey,
          responses: submitData.responses,
        },
      ]);

      if (error) {
        console.error("저장 실패:", error);
        alert("저장에 실패했습니다");
        return;
      }

      const returnUrl = `${window.location.origin}/?cukey=${encodeURIComponent(cukey)}&result=OK`;

      if (window.opener && !window.opener.closed) {
        window.opener.location.href = returnUrl;
      }

      window.close();
    } catch (error) {
      console.error("처리 실패:", error);
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
