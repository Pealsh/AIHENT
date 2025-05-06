// script.js
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const chatWindow = document.getElementById('chat');
const indicator = document.getElementById('recording-indicator');
const dots = indicator.querySelectorAll('.dot');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ja-JP';
recognition.interimResults = true;
recognition.continuous = true;
recognition.maxAlternatives = 1;

let finalTranscript = '';
let audioContext;
let analyser;
let microphone;
let animationId;
let streamRef;
let bounceInterval;

indicator.classList.add('hidden'); // 初期状態で非表示にする

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

async function startAudioVisualization() {
  streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  microphone = audioContext.createMediaStreamSource(streamRef);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  microphone.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let bounceIndex = 0;

  function bounceLoop() {
    dots.forEach((dot, index) => {
      dot.style.animation = 'none';
    });
    dots[bounceIndex].style.animation = 'bounceDot 0.6s ease-out';
    bounceIndex = (bounceIndex + 1) % dots.length;
  }

  bounceInterval = setInterval(bounceLoop, 400);

  function animate() {
    analyser.getByteTimeDomainData(dataArray);
    const volume = Math.max(...dataArray.map(n => Math.abs(n - 128))) / 128;
    const dynamicScale = Math.min(1.6, 1 + volume * 2.5);
    dots.forEach((dot, index) => {
      dot.style.transform = `scale(${dynamicScale.toFixed(2)})`;
    });
    animationId = requestAnimationFrame(animate);
  }
  animate();
}

function stopAudioVisualization() {
  if (animationId) cancelAnimationFrame(animationId);
  if (bounceInterval) clearInterval(bounceInterval);
  if (audioContext) audioContext.close();
  if (streamRef) {
    streamRef.getTracks().forEach(track => track.stop());
  }
  dots.forEach(dot => {
    dot.style.transform = 'scale(1)';
    dot.style.animation = 'none';
  });
  indicator.classList.add('hidden');
}

recognition.onaudiostart = () => {
  console.log("音声検出開始");
};

recognition.onaudioend = () => {
  console.log("音声検出終了");
};

recognition.onend = () => {
  startBtn.disabled = false;
  stopBtn.disabled = true;
  stopAudioVisualization();
  console.log("認識停止");
};

startBtn.onclick = () => {
  recognition.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
  indicator.classList.remove('hidden');
  startAudioVisualization();
  console.log("認識開始");
};

stopBtn.onclick = () => {
  recognition.stop();
  console.log("認識終了ボタン押下");
};
