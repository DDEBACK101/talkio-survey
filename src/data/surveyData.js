export const surveyData = {
  surveyTitle: "토키오 설문",
  sections: [
    {
      sectionId: "content-learning-effect",
      sectionTitle: "콘텐츠 및 학습 효과",
      questions: [
        {
          id: 1,
          type: "radio",
          text: "학습 콘텐츠(회화 주제, 구성 등)가 만족스럽다.",
          options: [
            "매우 만족한다",
            "어느정도 만족한다",
            "보통이다",
            "대체로 불만족한다",
            "매우 불만족한다",
          ],
        },
        {
          id: 2,
          type: "radio",
          text: "AI와의 대화형 학습이 실제 외국어 회화 능력 향상에 도움이 되었다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 3,
          type: "radio",
          text: "학습 내용이 실생활 또는 업무에 활용 가능하다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 4,
          type: "radio",
          text: "학습 난이도가 적절하다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
      ],
    },
    {
      sectionId: "service-usability",
      sectionTitle: "서비스 및 사용 편의성",
      questions: [
        {
          id: 5,
          type: "radio",
          text: "모바일 앱 사용이 전반적으로 편리하다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 6,
          type: "radio",
          text: "음성 인식 및 AI 응답 기능이 자연스럽다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 7,
          type: "radio",
          text: "학습 진행 방식(대화형, 반복 학습 등)이 효과적이다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
      ],
    },
    {
      sectionId: "participation-continuity",
      sectionTitle: "참여 경험 및 지속성",
      questions: [
        {
          id: 8,
          type: "radio",
          text: "학습에 흥미를 느끼며 지속적으로 참여할 수 있었다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 9,
          type: "radio",
          text: "토키오 서비스를 동료에게 추천할 의향이 있다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 10,
          type: "radio",
          text: "향후에도 계속 이용할 의향이 있다.",
          options: [
            "매우 그렇다",
            "어느정도 만족한다",
            "보통이다",
            "별로 그렇지 않다",
            "매우 그렇지 않다",
          ],
        },
        {
          id: 11,
          type: "radio",
          text: "하루 평균 학습 시간은 어느 정도입니까?",
          options: ["10분 미만", "10~20분", "20~30분", "30분 이상"],
        },
        {
          id: 12,
          type: "radio",
          text: "가장 도움이 된 기능은 무엇입니까? (1개 선택)",
          options: [
            "AI 대화 기능",
            "발음 교정",
            "반복 학습",
            "상황별 회화",
            "기타",
          ],
        },
      ],
    },
    {
      sectionId: "improvement-opinion",
      sectionTitle: "개선의견",
      questions: [
        {
          id: 13,
          type: "radio",
          text: "개선이 필요하다고 생각되는 부분은 무엇입니까? (1개 선택)",
          options: [
            "콘텐츠(주제/난이도) 개선",
            "AI 기능(음성인식/응답) 개선",
            "앱 사용성(UI/UX) 개선",
            "학습 운영(안내/독려) 개선",
            "기타",
          ],
        },
      ],
    },
  ],
};
