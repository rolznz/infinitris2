export function launchFullscreen() {
  try {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  } catch (error) {
    console.error('Failed to launch fullscreen', error);
  }
}
