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

  const response = await fetch("/.netlify/functions/user-survey", {
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

  const normalizedText = rawText.trim().toUpperCase();
  const normalizedResult =
    typeof data.result === "string" ? data.result.trim().toUpperCase() : "";
  const normalizedStatus =
    typeof data.status === "string" ? data.status.trim().toUpperCase() : "";
  const normalizedMessage =
    typeof data.message === "string" ? data.message.trim().toUpperCase() : "";

  const isSuccess =
    response.ok &&
    (normalizedText === "OK" ||
      normalizedResult === "OK" ||
      normalizedStatus === "OK" ||
      normalizedMessage === "OK");

  return {
    ok: isSuccess,
    result:
      normalizedResult ||
      normalizedStatus ||
      normalizedMessage ||
      normalizedText,
    data,
    rawText,
    status: response.status,
  };
};
