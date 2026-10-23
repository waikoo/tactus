import WaveSurfer from "wavesurfer.js";
import { Timer } from "easytimer.js";
import { getDominantColorFromDiv, type RGB } from "./dominantColor";
import { FFTVisualizer } from '@fft-visualizer/core'


const minutesInput =
  document.querySelector<HTMLInputElement>("#minutes")!;

const secondsInput =
  document.querySelector<HTMLInputElement>("#seconds")!;

function getDurationInSeconds(): number {
  const minutes = Math.max(0, Number(minutesInput.value) || 0);
  const seconds = Math.max(0, Number(secondsInput.value) || 0);

  return minutes * 60 + seconds;
}

function getStartValues(): { minutes: number; seconds: number } {
  const totalSeconds = getDurationInSeconds();

  return {
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
  };
}

const uploadInput = document.querySelector(
  "#background-upload",
) as HTMLInputElement;

uploadInput.addEventListener("change", () => {
  const file = uploadInput.files?.[0];

  if (!file) return;

  const image = new Image();
  const imageUrl = URL.createObjectURL(file);

  image.onload = () => {
    document.body.style.backgroundImage = `url("${imageUrl}")`;
  };

  image.onerror = () => {
    URL.revokeObjectURL(imageUrl);
  };

  image.src = imageUrl;

  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";

  if (settingsPanel) {
    settingsPanel.classList.toggle("hide");
  }
});

// dominant color here:
const WAVESURFER_PROGRESS_COLOR = "#000";
const WAVESURFER_BASE_COLOR = "#ffffff";

const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: WAVESURFER_BASE_COLOR,
  progressColor: WAVESURFER_PROGRESS_COLOR,
  dragToSeek: true,
});

// settings
const settings = document.querySelector<HTMLTableSectionElement>(".settings");
const settingsPanel = document.querySelector<HTMLDivElement>(".settings-panel");

const swatch1 = settingsPanel?.querySelector<HTMLDivElement>(".swatch1");
const swatch2 = settingsPanel?.querySelector<HTMLDivElement>(".swatch2");
const swatch3 = settingsPanel?.querySelector<HTMLDivElement>(".swatch3");
const swatch4 = settingsPanel?.querySelector<HTMLDivElement>(".swatch4");
const swatch5 = settingsPanel?.querySelector<HTMLDivElement>(".swatch5");
const swatch6 = settingsPanel?.querySelector<HTMLDivElement>(".swatch6");

// waveform
const waveLine = document.querySelector(".line") as HTMLDivElement;
const bars = document.querySelector<HTMLDivElement>(".bars");
const barsText = document.querySelector<HTMLDivElement>(".bars-text");

// title
const currentTitleCon = document.querySelector<HTMLParagraphElement>(".current-title-con")
const currentTitle = document.querySelector<HTMLParagraphElement>(".current-title")
const currentTitleP = document.querySelector<HTMLParagraphElement>(".current-title p")

// music player controls
const playIcon = document.querySelector(".play") as HTMLDivElement;
const pauseIcon = document.querySelector(".pause") as HTMLDivElement;
const previousIcon = document.querySelector(".previous") as HTMLDivElement;
const nextIcon = document.querySelector(".next") as HTMLDivElement;

// timer controls
const timerEl = document.querySelector<HTMLDivElement>(".timer");
const timerStart = document.querySelector<HTMLButtonElement>(".timer-start");
const resetTimer = document.querySelector<HTMLButtonElement>(".reset");

// playlist
const filePickerCon =
  document.querySelector<HTMLDivElement>(".file-picker-con");
const folderPicker = document.querySelector<HTMLInputElement>("#folder-picker");
const playlistCon = document.querySelector<HTMLDivElement>(".playlist-con");


const swatchColorMap = new Map<HTMLDivElement, RGB>();
// settings handler
settings?.addEventListener("click", (e: MouseEvent) => {
  console.log(e.currentTarget);
  settingsPanel?.classList.toggle("hide");
});

// background
// define gradients
const bgColors = {
  magentaRedYellowLR: [
    "rgba(131, 58, 180) 0%",
    "rgba(253, 29, 29) 50%",
    "rgba(252, 176, 69) 100%",
  ],
  blackBlueLR: [
    "rgba(18, 18, 48, 1) 0%",
    "rgba(9, 9, 121, 1) 35%",
    "rgba(0, 212, 255, 1) 100%",
  ],
  tealGreenBrownLR: [
    "rgba(42, 123, 155, 1) 0%",
    "rgba(87, 199, 133, 1) 50%",
    "rgba(237, 221, 83, 1) 100%",
  ],
  orchidDreamRadial: [
    "rgba(255, 119, 200, 1) 0%",
    "rgba(192, 132, 252, 0.95) 30%",
    "rgba(124, 58, 237, 0.8) 60%",
    "rgba(36, 14, 56, 0) 100%",
  ],

  arcticPulseRadial: [
    "rgba(165, 243, 252, 1) 0%",
    "rgba(103, 232, 249, 0.95) 25%",
    "rgba(129, 140, 248, 0.8) 55%",
    "rgba(30, 27, 75, 0) 100%",
  ],

  emberRoseRadial: [
    "rgba(255, 190, 165, 1) 0%",
    "rgba(251, 113, 133, 0.95) 30%",
    "rgba(190, 100, 130, 0.8) 60%",
    "rgba(55, 24, 43, 1) 100%",
  ],
};

type GradientType = "linear" | "radial";

const createGradient = (
  colors: string[],
  type: GradientType = "linear",
  angle = "90deg",
): string => {
  if (type === "radial") {
    return `radial-gradient(circle, ${colors.join(", ")})`;
  }

  return `linear-gradient(${angle}, ${colors.join(", ")})`;
};

const swatch1Gradient = createGradient(bgColors.magentaRedYellowLR);
const swatch2Gradient = createGradient(bgColors.blackBlueLR);
const swatch3Gradient = createGradient(bgColors.tealGreenBrownLR);
const swatch4Gradient = createGradient(bgColors.orchidDreamRadial, "radial");
const swatch5Gradient = createGradient(bgColors.arcticPulseRadial, "radial");
const swatch6Gradient = createGradient(bgColors.emberRoseRadial, "radial");

// apply the gradients to the swatches before extracting their colors
if (swatch1 && swatch2 && swatch3 && swatch4 && swatch5 && swatch6) {
  swatch1.style.background = swatch1Gradient;
  swatch2.style.background = swatch2Gradient;
  swatch3.style.background = swatch3Gradient;
  swatch4.style.background = swatch4Gradient;
  swatch5.style.background = swatch5Gradient;
  swatch6.style.background = swatch6Gradient;
}

// start with the first swatch's gradient as the background
document.body.style.background = swatch1Gradient;

// visualizer setup
const canvas = document.querySelector('canvas')!

if (!canvas) throw new Error("Visualizer canvas not found");

const viz = new FFTVisualizer(canvas, {
  mode: "external",
  bands: 40,
  smoothing: 0.75,
  colorMode: "gradient",
  gradient: [
    { stop: 0, color: "#000" },
    { stop: 0.5, color: "#000" },
    { stop: 1, color: "#000" },
  ],
  gradientDirection: "vertical",
  background: "transparent",
  glow: 0.5,
  radial: false,
});
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();

analyser.fftSize = 2048;
analyser.smoothingTimeConstant = 0.8;

const audioElement = wavesurfer.getMediaElement();
if (audioElement) {
  const source = audioContext.createMediaElementSource(audioElement);
  
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);
  
  function updateVisualizer() {
    analyser.getByteFrequencyData(frequencyData);
    viz.feedData(frequencyData);
  
    requestAnimationFrame(updateVisualizer);
  }
  
  updateVisualizer();
}
// change background gradients
settingsPanel?.addEventListener("click", (e: MouseEvent) => {
  e.stopPropagation();
  const target = e.target as HTMLElement;
  const swatch = target.closest<HTMLDivElement>(
    ".swatch1, .swatch2, .swatch3, .swatch4, .swatch5, .swatch6",
  );

  if (!swatch || !settingsPanel.contains(swatch)) return;

  document.body.style.background = swatch.style.background;

  settingsPanel
    .querySelectorAll(
      ".swatch1, .swatch2, .swatch3, .swatch4, .swatch5, .swatch6",
    )
    .forEach((child) => child.classList.remove("selected-gradient"));
  swatch.classList.add("selected-gradient");

  const rgb = swatchColorMap.get(swatch);
  if (timerEl && rgb) {
    timerEl.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  }
});

if (waveLine) {
  waveLine.style.backgroundColor = WAVESURFER_BASE_COLOR;
}

// set tooltips
if (playIcon && pauseIcon && timerStart && resetTimer) {
  pauseIcon.title = "Pause Song";
  playIcon.title = "Play Current Song";
  previousIcon.title = "Play Previous Song";
  nextIcon.title = "Play Next Song";
  timerStart.title = "Start Timer";
  resetTimer.title = "Reset Timer";
}
if (playIcon && pauseIcon) {
  // play song when play button is clicked, hide pause icon
  playIcon.addEventListener("click", () => {
    if (bars && barsText) {
      bars.classList.toggle("hide");
    }
    wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
  });

  // when waveform is clicked, play the song
  wavesurfer.on("click", async () => {
    await audioContext.resume();
    wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
  });

  // when pause is clicked, icon changes back to play & change icon
  pauseIcon.addEventListener("click", () => {
    wavesurfer.pause();
    playIcon.classList.remove("hide");
    pauseIcon.classList.add("hide");
  });

  // when scrubbing the playhead, play song after releasing the mouse & change icon
  wavesurfer.on("dragend", async () => {
    await audioContext.resume();
    wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
  });

  // play or pause depending on current state when hitting space & change icon
  window.addEventListener("keydown", async (e: KeyboardEvent) => {
    if (e.code == "Space") {
      await audioContext.resume();
      wavesurfer.playPause();
      if (playIcon.classList.contains("hide")) {
        playIcon.classList.remove("hide");
        pauseIcon.classList.add("hide");
      } else {
        playIcon.classList.add("hide");
        pauseIcon.classList.remove("hide");
      }
    }
  });
}

const timer = new Timer();
let lastStartValues = getStartValues();

const renderTimer = () => {
  const { minutes, seconds } = timer.getTimeValues();

  minutesInput.value = minutes.toString().padStart(2, "0");
  secondsInput.value = seconds.toString().padStart(2, "0");
};

minutesInput.addEventListener("click", () => {
  timer.stop()
})

secondsInput.addEventListener("click", () => {
  timer.stop()
})

// Update immediately when started
timer.addEventListener("started", renderTimer);

// Update every second
timer.addEventListener("secondsUpdated", renderTimer);

// Handle completion
timer.addEventListener("targetAchieved", () => {
  renderTimer();
  console.log("Rest finished!");
});

timer.addEventListener("stopped", () => {
  console.log("STOPPED")
})

if (resetTimer) {
  resetTimer.addEventListener("click", () => {
    timer.reset();
    minutesInput.value = lastStartValues.minutes.toString().padStart(2, "0");
    secondsInput.value = lastStartValues.seconds.toString().padStart(2, "0");
  });
}

// start the countdown using the values currently in the DOM
if (timerStart) {
  timerStart.addEventListener("click", () => {
    lastStartValues = getStartValues();

    minutesInput.value = lastStartValues.minutes.toString().padStart(2, "0");
    secondsInput.value = lastStartValues.seconds.toString().padStart(2, "0");

    timer.start({
      countdown: true,
      startValues: lastStartValues,
      precision: "seconds",
    });
  });
}

let audioFiles: null | File[] = null;

// folder picker
folderPicker?.addEventListener("change", async () => {
  await wavesurfer.empty()
  if (bars) {
    bars.classList.remove("hide");
  }
  if (barsText) {
    barsText.classList.remove("hide");
  }

  const files = Array.from(folderPicker.files ?? []);
  folderPicker.classList.add("hide");
  audioFiles = files.filter((file) => file.type.startsWith("audio/"));
  
  if (currentTitleP && audioFiles && currentTitleCon && !currentTitleP.textContent) {
    currentTitleP.textContent = audioFiles[0].name
    currentTitleCon.classList.remove("hide")
  }


  if (playlistCon) {
    playlistCon.innerHTML = audioFiles
      .map(
        (file, i) => `
          <div class="song-con" data-index="${i}">
            <p class="song glass">${file.name}</p>
          </div>
        `,
      )
      .join("");
  }
  if (filePickerCon) {
    filePickerCon.classList.add("hide");
  }
  // load first file to waveform
  await wavesurfer.loadBlob(audioFiles[0]);
  
  if (barsText) {
    barsText.classList.add("hide");
  }
  if (bars) {
    bars.classList.add("hide");
  }
});

// play clicked music with 1 event listener on the container
playlistCon?.addEventListener("click", async (event) => {
  await wavesurfer.empty()
  let file
  if (bars && currentTitleCon) {
    bars.classList.toggle("hide");
    currentTitleCon.classList.remove("hide")
  }
  const target = event.target as HTMLElement;
  const item = target.closest<HTMLElement>(".song-con");

  if (!item) return;

  const index = Number(item.dataset.index);
  if (audioFiles) {
    file = audioFiles[index];

    if (!file) return;
    
    if (currentTitle && currentTitleP && file) {
      currentTitleP.textContent = file.name
    }

    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString();
  }
  
  if (bars) {
    bars.classList.toggle("hide");
  }
  
  
});

// add continuous play of multiple files
wavesurfer.on("finish", async () => {
  if (audioFiles) {
    const index = Number(document.body.dataset.currentSongId) + 1
    const file = audioFiles[index]
    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    if (currentTitle && currentTitleP && file) {
      currentTitleP.textContent = file.name
    }
  }
});

// add navigation when playlist is loaded
nextIcon.addEventListener("click", async () => {
  const index = Number(document.body.dataset.currentSongId) + 1;
  if (audioFiles) {
    const file = audioFiles[index];

    if (!file) return;

    if (currentTitle && currentTitleP) {
      currentTitleP.textContent = file.name
    }
    
    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString();
  }
});

// add navigation when playlist is loaded
previousIcon.addEventListener("click", async () => {
  const index = Number(document.body.dataset.currentSongId) - 1;
  if (audioFiles) {
    const file = audioFiles[index];

    if (!file) return;
    
    if (currentTitle && currentTitleP) {
      currentTitleP.textContent = file.name
    }

    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString();
  }
});

const swatchSelectors = [".swatch1", ".swatch2", ".swatch3"];

async function extractSwatchColors(): Promise<RGB[]> {
  const wasHidden = settingsPanel?.classList.contains("hide") ?? false;

  // html-to-image needs the swatches to be laid out to capture their gradients
  if (settingsPanel && wasHidden) {
    settingsPanel.classList.remove("hide");
    settingsPanel.style.position = "fixed";
    settingsPanel.style.right = "auto";
    settingsPanel.style.left = "-10000px";
    settingsPanel.style.top = "0";
  }

  try {
    return await Promise.all(
      swatchSelectors.map((selector) => getDominantColorFromDiv(selector)),
    );
  } finally {
    if (settingsPanel && wasHidden) {
      settingsPanel.classList.add("hide");
      settingsPanel.style.removeProperty("position");
      settingsPanel.style.removeProperty("right");
      settingsPanel.style.removeProperty("left");
      settingsPanel.style.removeProperty("top");
    }
  }
}

const swatchColors = await extractSwatchColors();
const swatches = [swatch1, swatch2, swatch3];

swatches.forEach((swatch, index) => {
  const rgb = swatchColors[index];

  if (swatch && rgb) {
    swatchColorMap.set(swatch, rgb);
  }
});

// test: show the first swatch's dominant color on the timer
const [r, g, b] = swatchColors[0] ?? [128, 128, 128];

document.documentElement.style.setProperty(
  "--dominant-color",
  `rgb(${r}, ${g}, ${b}) 75%`,
);