const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const upload = document.getElementById("upload");
const detailSlider = document.getElementById("detail");
const contrastSlider = document.getElementById("contrast");
const darkPaper = document.getElementById("darkPaper");
const downloadBtn = document.getElementById("downloadBtn");
const cameraBtn = document.getElementById("cameraBtn");
const video = document.getElementById("video");

let sourceImage = null;
let stream = null;

upload.addEventListener("change", loadImage);
detailSlider.addEventListener("input", draw);
contrastSlider.addEventListener("input", draw);
darkPaper.addEventListener("change", draw);
downloadBtn.addEventListener("click", download);
cameraBtn.addEventListener("click", startCamera);

function loadImage() {
  const file = upload.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = () => {
    sourceImage = img;
    canvas.width = img.width;
    canvas.height = img.height;
    draw();
  };
}

function draw() {
  if (!sourceImage) return;

  const scale = parseInt(detailSlider.value);
  const contrast = parseInt(contrastSlider.value);

  ctx.drawImage(sourceImage, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  canvas.style.background = darkPaper.checked ? "#111" : "#fff";
  ctx.fillStyle = darkPaper.checked ? "#fff" : "#000";
  ctx.font = `${scale}px monospace`;

  for (let y = 0; y < data.height; y += scale) {
    for (let x = 0; x < data.width; x += scale) {
      const i = (y * data.width + x) * 4;
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];

      let brightness = (r + g + b) / 3;
      brightness = (brightness - 128) * (contrast / 100) + 128;

      let char = " ";
      if (brightness < 50) char = "♥";
      else if (brightness < 100) char = "♦";
      else if (brightness < 150) char = ".";
      else if (brightness < 200) char = ",";

      ctx.fillText(char, x, y);
    }
  }
}

function download() {
  const link = document.createElement("a");
  link.download = "symbol-sketch.png";
  link.href = canvas.toDataURL();
  link.click();
}

async function startCamera() {
  if (stream) return;

  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;

  video.onloadedmetadata = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    requestAnimationFrame(drawCamera);
  };
}

function drawCamera() {
  ctx.drawImage(video, 0, 0);
  sourceImage = video;
  draw();
  requestAnimationFrame(drawCamera);
}
