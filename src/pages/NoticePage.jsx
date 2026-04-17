export default function NoticePage() {
  const handleOpenSurveyPopup = () => {
    const surveyUrl = `${window.location.origin}/survey`;

    const popup = window.open(
      surveyUrl,
      "surveyPopup",
      "width=900,height=850,left=200,top=100,resizable=yes,scrollbars=yes",
    );

    if (!popup) {
      alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
      return;
    }

    popup.focus();
  };

  return (
    <div className="notice-page">
      <button className="notice-button" onClick={handleOpenSurveyPopup}>
        설문조사하러 가기
      </button>
    </div>
  );
}
