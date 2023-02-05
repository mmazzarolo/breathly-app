// Given a number of seconds returns them in a "timer" format (mm:ss).
// E.g.: 120 -> 02:00
export const formatTimer = (numberOfSeconds: number) => {
  const hours = Math.floor(numberOfSeconds / 3600);
  const minutes = Math.floor((numberOfSeconds - hours * 3600) / 60);
  const seconds = numberOfSeconds - hours * 3600 - minutes * 60;

  let timerHours = String(hours);
  let timerMinutes = String(minutes);
  let timerSeconds = String(seconds);

  if (hours < 10) {
    timerHours = `0${hours}`;
  }
  if (minutes < 10) {
    timerMinutes = `0${minutes}`;
  }
  if (seconds < 10) {
    timerSeconds = `0${seconds}`;
  }

  if (hours > 0) {
    return `${timerHours}:${timerMinutes}:${timerSeconds}`;
  } else {
    return `${timerMinutes}:${timerSeconds}`;
  }
};
