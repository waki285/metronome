let bpm = 60;
let startTime = performance.now();
let beat = 4;
let currentBeat = 1;
let sounded = false;

const pendulumElement = document.getElementById("pendulum")
const bpmSlider = document.getElementById("bpm");
const weightElement = document.getElementById("weight");
const bpmInput = document.getElementById("bpminput");
const resetButton = document.getElementById("reset");
const audio = document.getElementById("audio");
const metronome = document.getElementById("metronome");
let audioRes;

let tolerance = 0.15;
const tranceElement = document.getElementById("trance");
let game = false;
let successInThisTerm = true;
let resetOk = false; 
let trance = 0;
const tranceMeter = document.getElementById("trance_meter");
const tranceSound = new Audio("assets/TranceStatic.mp3");
tranceSound.volume = 0;

const measureSound = new Audio("assets/measure.mp3");
const beatSound = new Audio("assets/beat.mp3");
const beatInput = document.getElementById("beatinput");
const beatHit = document.getElementById("beathit");
let intervalId = null;
let hell = false;
let beatEnabled = false;

let inputted = "";

function toRadians(angle) {
  return angle * (Math.PI / 180);
}

const pendulum = () => {
  const elapsedTime = performance.now() - startTime;
  const now = (elapsedTime / 1000 * bpm * 3) % 360;
  const degree = 45 * Math.sin(toRadians(now));
  pendulumElement.style.transform = `rotate(${degree}deg)`;
  if (game) {
    if (!resetOk) {
      if (Math.abs(degree) > (tolerance * bpm)) {
        if (successInThisTerm) successInThisTerm = false;
        else trance += (hell ? 10:5);
        resetOk = true;
      } else {
        
      }
    } else {
      if (Math.abs(degree) < (tolerance * bpm)) {
        resetOk = false;
      }
    }
  }
  requestAnimationFrame(pendulum);
};
const tranceApply = () => {
  if (game) {
    tranceElement.style.opacity = Math.max(0, (trance - 10) / 100);
    tranceSound.volume = Math.max(0, (trance - 40) / 100);
    if (tranceSound.currentTime > 1.2) tranceSound.currentTime = 0;
  } else {
    tranceElement.style.opacity = 0;
    tranceSound.volume = 0;
  }
  tranceMeter.textContent = trance;
  if (trance >= 100) trance = 0;
  requestAnimationFrame(tranceApply);
}

bpmSlider.addEventListener("input", (e) => {
  bpm = e.target.value;
  weightElement.setAttribute("y", String(65 + bpm / 2));
  bpmInput.value = bpm;
});
bpmInput.addEventListener("keyup", (e) => {
  bpm = Number(e.target.value);
  weightElement.setAttribute("y", String(65 + bpm / 2));
  bpmSlider.value = bpm;
});
beatInput.addEventListener("keyup", (e) => {
  beat = Number(e.target.value);
});
resetButton.addEventListener("click", (e) => {
  e.preventDefault();
  audioRes?.pause();
  if (audioRes) audioRes.currentTime = 0;
  currentBeat = 1;
  clearInterval(intervalId);
  const func = () => {
    if (beatEnabled) {
      if (currentBeat === 1) {
        measureSound.currentTime = 0;
        measureSound.play();
      } else {
        beatSound.currentTime = 0;
        beatSound.play();
      }
      const fade = beatHit.cloneNode(true);
      fade.removeAttribute("id");
      fade.classList.remove("hidden");
      fade.style.zIndex = 10;
      fade.style.right = "15%";
      fade.style.top = "20%";
      document.body.appendChild(fade);
      const anim = fade.animate([
        { opacity: 1, top: "20%" },
        { opacity: 0, top: "15%" }
      ], { duration: 500, easing: "ease-out" });
      anim.addEventListener("finish", (e) => {
        fade.remove();
      });
    }
    if (currentBeat >= beat) currentBeat = 1;
    else currentBeat++;
  }
  intervalId = setInterval(() => func(), 60 / bpm * 1000);
  func();
  audioRes?.play();
  startTime = performance.now();
});
document.getElementById("audio_button").addEventListener("click", () => {
  document.getElementById("audio").click();
});

document.getElementById("audio").addEventListener("change", async (e) => {
  resetButton.disabled = true;
  const file = e.target.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type: file.type });
  const url = URL.createObjectURL(blob);
  audioRes = new Audio(url);
  resetButton.disabled = false;
});
document.getElementById("audio_remove").addEventListener("click", async (e) => {
  audioRes.pause();
  audioRes = null;
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && game && !e.repeat) {
    const degree = Number(pendulumElement.style.transform.match(/\d{1,3}\.?\d{0,2}/)[0]);
    if (degree > (tolerance * bpm) || successInThisTerm) return trance += (hell ? 10:5);
    successInThisTerm = true;
    trance = Math.max(trance - 3, 0);
    const fade = pendulumElement.cloneNode(true);
    fade.removeAttribute("id");
    fade.classList.remove("z-20");
    fade.style.zIndex = 10;
    metronome.appendChild(fade);
    const anim = fade.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], { duration: 300, easing: "ease" });
    anim.addEventListener("finish", (e) => {
      fade.remove();
    });
  }
});
document.addEventListener("keyup", (e) => {
  inputted += e.key;
  if (inputted.toLowerCase().slice(-4) === "hell") {
    hell = !hell;
    document.getElementById("gametext").style.color = hell ? "red":"unset";
  }
})

document.getElementById("game").addEventListener("change", (e) => {
  game = e.target.checked;
  tranceSound.play();
});
document.getElementById("beat").addEventListener("change", (e) => {
  beatEnabled = e.target.checked;
});

pendulum();
tranceApply();