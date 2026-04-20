const USE_MOCK_SERVER = false;
// const MOCK_SERVER_RESULT = "OK";

export const requestExternalServerOk = async (payload) => {
  if (USE_MOCK_SERVER) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          result: "OK",
          payload,
        });
      }, 700);
    });
  }

  const response = await fetch("https://talkio.co.kr/api/user_survey/2319/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();

  let data = {};
  try {
    data = JSON.parse(rawText);
  } catch (error) {
    data = {};
  }

  const textResult = rawText.trim().toUpperCase();
  const jsonResult =
    typeof data.result === "string" ? data.result.toUpperCase() : "";

  return {
    ok: response.ok && (textResult === "OK" || jsonResult === "OK"),
    result: jsonResult || textResult,
    data,
    rawText,
  };
};
