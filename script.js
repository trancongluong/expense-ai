document.addEventListener("DOMContentLoaded", function () {
  const expenseText = document.getElementById("expenseText");
  const voiceButton = document.getElementById("voiceButton");
  const saveButton = document.getElementById("saveButton");
  const status = document.getElementById("status");

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  let recognition = null;
  let isListening = false;

  function showStatus(message, type) {
    status.className = type;
    status.textContent = message;
  }

  function updateVoiceButton() {
    if (isListening) {
      voiceButton.textContent = "⏹ Dừng ghi âm";
      voiceButton.classList.add("listening");
    } else {
      voiceButton.textContent = "🎤 Nhấn để nói";
      voiceButton.classList.remove("listening");
    }
  }

  if (!SpeechRecognition) {
    voiceButton.disabled = true;

    showStatus(
      "Trình duyệt này không hỗ trợ nhận dạng giọng nói. Hãy mở bằng Chrome trên Android.",
      "error"
    );
  } else {
    recognition = new SpeechRecognition();

    recognition.lang = "vi-VN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function () {
      isListening = true;
      updateVoiceButton();

      showStatus(
        "Đang nghe... Hãy nói nội dung chi tiêu.",
        "loading"
      );
    };

    recognition.onresult = function (event) {
      let transcript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        transcript += event.results[index][0].transcript;
      }

      expenseText.value = transcript.trim();
    };

    recognition.onerror = function (event) {
      isListening = false;
      updateVoiceButton();

      let message =
        "Không thể nhận dạng giọng nói. Mã lỗi: " +
        event.error;

      if (event.error === "not-allowed") {
        message =
          "Quyền micro đang bị chặn. Hãy mở trang trực tiếp bằng Chrome và cấp quyền micro.";
      } else if (event.error === "no-speech") {
        message =
          "Không nghe thấy giọng nói. Hãy bấm lại và nói rõ hơn.";
      } else if (event.error === "audio-capture") {
        message =
          "Không tìm thấy hoặc không sử dụng được micro.";
      } else if (event.error === "network") {
        message =
          "Dịch vụ nhận dạng giọng nói gặp lỗi mạng.";
      }

      showStatus(message, "error");
    };

    recognition.onend = function () {
      isListening = false;
      updateVoiceButton();

      if (expenseText.value.trim()) {
        showStatus(
          "Đã nhận dạng giọng nói thành công.",
          "success"
        );
      }
    };

    voiceButton.addEventListener("click", function () {
      if (isListening) {
        recognition.stop();
        return;
      }

      expenseText.value = "";

      try {
        recognition.start();
      } catch (error) {
        showStatus(
          "Không thể khởi động micro: " + error.message,
          "error"
        );
      }
    });
  }

  saveButton.addEventListener("click", function () {
    const text = expenseText.value.trim();

    if (!text) {
      showStatus(
        "Vui lòng nhập hoặc nói nội dung chi tiêu.",
        "error"
      );
      return;
    }

    alert("Nội dung đã nhận được:\n\n" + text);
  });
});
