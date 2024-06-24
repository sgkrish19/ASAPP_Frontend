// audioUtils.js
import { Howl } from "howler";
 
// Define a function to play the beep sound
export const playBeepSound = () => {
  const beepSound = new Howl({
    src: [process.env.PUBLIC_URL + "/beep-01a.mp3"],
  });
  beepSound.play();
};