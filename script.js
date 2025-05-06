const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const chatWindow = document.getElementById('chat');
const indicator = document.getElementById('recording-indicator');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ja-JP';
recognition.interimResults = true;
recognition.continuous = true;
recognition.maxAlternatives = 1; // より確実な候補を取得

let finalTranscript = '';

function typeText(element, text, delay = 20) {
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, delay);
}

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const transcript = event.results[i][0].transcript.trim();
    if (transcript.length === 0) continue;

    if (event.results[i].isFinal) {
      const bubble = document.createElement('div');
      chatWindow.appendChild(bubble);
      typeText(bubble, transcript);
    }
  }
};

recognition.onaudiostart = () => {
  console.log("音声検出開始");
};

recognition.onaudioend = () => {
  console.log("音声検出終了");
};

recognition.onend = () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  indicator.classList.add('hidden');
  console.log("認識停止");
};

startBtn.onclick = () => {
  recognition.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  indicator.classList.remove('hidden');
  console.log("認識開始");
};

stopBtn.onclick = () => {
  recognition.stop();
  indicator.classList.add('hidden');
  console.log("認識終了ボタン押下");
};
