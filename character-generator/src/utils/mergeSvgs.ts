export function mergeSvgs(...svgs: string[]) {
  const header = /[\s\S]*<svg[\s\S]*?>/;
  const footer = '</svg>';
  if (svgs.length !== 2) {
    throw new Error('Unsupported svg merge length: ' + svgs.length);
  }
  // remove id conflicts
  svgs = svgs.map((svg, i) =>
    svg.replace(new RegExp('SVGID_', 'g'), `SVGID_${i}_`)
  );
  return [
    svgs[0].replace(footer, ''),
    svgs[svgs.length - 1].replace(header, ''),
  ].join('');
}
