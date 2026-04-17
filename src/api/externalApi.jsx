const USE_MOCK_SERVER = true;
const MOCK_SERVER_RESULT = "OK"; // "FAIL"로 바꾸면 실패 테스트 가능

export const requestExternalServerOk = async (payload) => {
  if (USE_MOCK_SERVER) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: MOCK_SERVER_RESULT === "OK",
          result: MOCK_SERVER_RESULT,
          payload,
        });
      }, 700);
    });
  }

  const response = await fetch("https://talkio-survey.netlify.app", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  return {
    ok: response.ok && data.result === "OK",
    result: data.result,
    data,
  };
};
