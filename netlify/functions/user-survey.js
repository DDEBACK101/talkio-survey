export default async (request) => {
  try {
    const payload = await request.json();
    const cukey = String(payload?.cukey || "").trim();

    if (!cukey) {
      return new Response(
        JSON.stringify({
          result: "FAIL",
          message: "cukey is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const formData = new URLSearchParams();

    // 서버가 추가 값을 요구할 가능성에 대비해서 남겨둠
    // 필요 없으면 빈 POST로 나가게 됨
    // 예: formData.append("status", "complete");

    const response = await fetch(
      `https://talkio.co.kr/api/user_survey/${encodeURIComponent(cukey)}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: formData.toString(),
      },
    );

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        result: "FAIL",
        message: "Proxy request failed",
        error: String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
