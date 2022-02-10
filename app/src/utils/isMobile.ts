export function isIos() {
  const toMatch = [/iPhone/i, /iPad/i, /iPod/i];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}
export function isAndroid() {
  const toMatch = [/Android/i];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}

export default function isMobile() {
  const toMatch = [/webOS/i, /BlackBerry/i, /Windows Phone/i];

  return (
    isIos() ||
    isAndroid() ||
    toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
    })
  );
}

export const requiresPwa = () =>
  isMobile() && !window.matchMedia('(display-mode: standalone)').matches;
