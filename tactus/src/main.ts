import WaveSurfer from "wavesurfer.js";
import { Timer } from "easytimer.js";
declare const ColorThief: any;

export type RGB = [number, number, number];

export default async function extractDominantColorFromComplexGradient(
  cssGradient: string,
): Promise<RGB> {
  const colorThiefInstance = new ColorThief();
  const dominantColor = colorThiefInstance.getColor(canvas) as RGB;

  return dominantColor;
}

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

// waveform
const waveLine = document.querySelector(".line") as HTMLDivElement;
const bars = document.querySelector<HTMLDivElement>(".bars");

// music player controls
const playIcon = document.querySelector(".play") as HTMLDivElement;
const pauseIcon = document.querySelector(".pause") as HTMLDivElement;
const previousIcon = document.querySelector(".previous") as HTMLDivElement;
const nextIcon = document.querySelector(".next") as HTMLDivElement;

// timer controls
const timerEl = document.querySelector<HTMLDivElement>(".timer");
const timerMinutes = timerEl?.querySelector<HTMLParagraphElement>(".minutes");
const timerSeconds = timerEl?.querySelector<HTMLParagraphElement>(".seconds");
const timerStart = document.querySelector<HTMLButtonElement>(".timer-start");
const resetTimer = document.querySelector<HTMLButtonElement>(".reset");

// playlist
const filePickerCon =
  document.querySelector<HTMLDivElement>(".file-picker-con");
const folderPicker = document.querySelector<HTMLInputElement>("#folder-picker");
const playlistCon = document.querySelector<HTMLDivElement>(".playlist-con");

const canvas = document.querySelector<HTMLCanvasElement>("canvas");
const barsText = document.querySelector<HTMLDivElement>(
  ".bars-text",
);
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
    "rgba(2, 0, 36, 1) 0%",
    "rgba(9, 9, 121, 1) 35%",
    "rgba(0, 212, 255, 1) 100%",
  ],
  tealGreenBrownLR: [
    "rgba(42, 123, 155, 1) 0%",
    "rgba(87, 199, 133, 1) 50%",
    "rgba(237, 221, 83, 1) 100%",
  ],
};

const createGradient = (colors: string[], angle = "90deg"): string => {
  return `linear-gradient(${angle}, ${colors.join(", ")})`;
};

const backgroundGradient = createGradient(bgColors.magentaRedYellowLR);
const swatch1Gradient = createGradient(bgColors.magentaRedYellowLR);
const swatch2Gradient = createGradient(bgColors.blackBlueLR);
const swatch3Gradient = createGradient(bgColors.tealGreenBrownLR);

// inject the constructed string to the body
document.body.style.background = backgroundGradient;
window.addEventListener("DOMContentLoaded", () => {
  if (swatch1 && swatch2 && swatch3) {
    swatch1.style.background = swatch1Gradient;
    swatch2.style.background = swatch2Gradient;
    swatch3.style.background = swatch3Gradient;
  }
});

// change background gradients
settingsPanel?.addEventListener("click", (e: MouseEvent) => {
  e.stopPropagation();
  const eTarget = e.target as HTMLDivElement;
  if (e.target) {
    document.body.style.background = eTarget.style.background;
    const swatches = settingsPanel.children;
    Array.from(swatches).forEach((child) => {
      child.classList.remove("selected-gradient");
    });
    eTarget.classList.add("selected-gradient");
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
    wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
  });

  // when waveform is clicked, play the song
  wavesurfer.on("click", () => {
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
  wavesurfer.on("dragend", () => {
    wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
  });

  // play or pause depending on current state when hitting space & change icon
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.code == "Space") {
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
const renderTimer = () => {
  const { minutes, seconds } = timer.getTimeValues();

  if (timerMinutes && timerSeconds) {
    timerMinutes.textContent = minutes.toString();
    timerSeconds.textContent = seconds.toString().padStart(2, "0");
  }
};
renderTimer();

// Update immediately when started
timer.addEventListener("started", renderTimer);

// Update every second
timer.addEventListener("secondsUpdated", renderTimer);

// Handle completion
timer.addEventListener("targetAchieved", () => {
  renderTimer();
  console.log("Rest finished!");
});

if (resetTimer) {
  resetTimer.addEventListener("click", () => {
    timer.reset();
  });
}

// start the countdown
if (timerStart) {
  timerStart.addEventListener("click", () => {
    console.log("clicked");
    timer.start({
      countdown: true,
      startValues: { minutes: 1, seconds: 30 },
      precision: "seconds",
    });
  });
}

let audioFiles: null | File[] = null;

// folder picker
folderPicker?.addEventListener("change", async () => {
  if (bars && barsText) {
    bars.classList.toggle("hide");
    barsText.classList.toggle("hide");
  }

  const files = Array.from(folderPicker.files ?? []);
  folderPicker.classList.add("hide");
  audioFiles = files.filter((file) => file.type.startsWith("audio/"));

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

  if (bars && barsText) {
    bars.classList.toggle("hide");
    barsText.classList.toggle("hide");
  }
});

// play clicked music with 1 event listener on the container
playlistCon?.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const item = target.closest<HTMLElement>(".song-con");

  if (!item) return;

  const index = Number(item.dataset.index);
  if (audioFiles) {
    const file = audioFiles[index];

    if (!file) return;

    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString();
  }
});

// add navigation when playlist is loaded
nextIcon.addEventListener("click", async () => {
  const index = Number(document.body.dataset.currentSongId) + 1;
  if (audioFiles) {
    const file = audioFiles[index];

    if (!file) return;

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

    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString();
  }
});
