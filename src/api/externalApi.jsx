const USE_MOCK_SERVER = false;
const MOCK_SERVER_RESULT = "OK"; // 남겨둬도됨 false 면 사용 안 함

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

  const response = await fetch("https://talkio-survey.netlify.app/", {
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
