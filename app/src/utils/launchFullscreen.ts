export async function launchFullscreen() {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.error('Failed to launch fullscreen', error);
  }
}

export async function exitFullscreen() {
  try {
    await document.exitFullscreen();
  } catch (error) {
    console.error('Failed to exit fullscreen', error);
  }
}
