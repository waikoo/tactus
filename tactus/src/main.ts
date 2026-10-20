import WaveSurfer from "wavesurfer.js";
import Timer from "easytimer.js";

const WAVESURFER_PROGRESS_COLOR = "#ffffff";

const wavesurfer = WaveSurfer.create({
  container: "#waveform",
  waveColor: "#ffffff80",
  progressColor: WAVESURFER_PROGRESS_COLOR,
  dragToSeek: true,
  url: "/tsunami.mp3",
});

const playIcon = document.querySelector(".play");
const pauseIcon = document.querySelector(".pause");
const waveLine = document.querySelector(".line") as HTMLDivElement;

if (waveLine) {
  waveLine.style.backgroundColor = WAVESURFER_PROGRESS_COLOR;
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
        playIcon.classList.remove("hide")
        pauseIcon.classList.add("hide")
      } else {
        playIcon.classList.add("hide")
        pauseIcon.classList.remove("hide")
      }
    }
  });
}

const timer = new Timer();
timer.start()
timer.addEventListener("secondsUpdated", function (e) {
  $("#basicUsage").html(timer.getTimeValues().toString());
});
