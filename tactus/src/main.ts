import WaveSurfer from "wavesurfer.js";
import { Timer } from "easytimer.js";

// dominant color here:
const WAVESURFER_PROGRESS_COLOR = "#8ab8b8b8";

const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "#ffffff",
  progressColor: WAVESURFER_PROGRESS_COLOR,
  dragToSeek: true,
});

// waveform
const waveLine = document.querySelector(".line") as HTMLDivElement;

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
const filePickerCon = document.querySelector<HTMLDivElement>(".file-picker-con")
const folderPicker = document.querySelector<HTMLInputElement>("#folder-picker");
const playlistCon = document.querySelector<HTMLDivElement>(".playlist-con");

// background
// define gradients
const bgColors = {
  magentaRedYellowLR: [
    "rgba(131, 58, 180) 0%",
    "rgba(253, 29, 29) 50%",
    "rgba(252, 176, 69) 100%",
  ],
};

const createGradient = (colors: string[], angle = "90deg"): string => {
  return `linear-gradient(${angle}, ${colors.join(", ")})`;
};

const backgroundGradient = createGradient(bgColors.magentaRedYellowLR);

// inject the constructed string to the body
document.body.style.background = backgroundGradient;

if (waveLine) {
  waveLine.style.backgroundColor = WAVESURFER_PROGRESS_COLOR;
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
folderPicker?.addEventListener("change", () => {
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
    filePickerCon.classList.add("hide")
  }
});

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
    document.body.dataset.currentSongId = index.toString()
  }
});


nextIcon.addEventListener('click', async () => {
  const index = Number(document.body.dataset.currentSongId) + 1
  if (audioFiles) {
    const file = audioFiles[index];

    if (!file) return;
    
    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString()
  }
})

previousIcon.addEventListener('click', async () => {
  const index = Number(document.body.dataset.currentSongId) - 1
  if (audioFiles) {
    const file = audioFiles[index];

    if (!file) return;
    
    await wavesurfer.loadBlob(file);
    await wavesurfer.play();
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    document.body.dataset.currentSongId = index.toString()
  }
})
