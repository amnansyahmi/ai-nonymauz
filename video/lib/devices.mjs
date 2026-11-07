// Output formats for the site's laptop and phone frames (see .walkthrough-* in styles.css).
// `scale` renders the CSS layout at a higher pixel density so text stays sharp on retina screens.
export const devices = {
  desktop: { width: 1440, height: 960, scale: 1.5, input: "pointer", cardWidth: 760, crf: 33 },
  mobile: { width: 390, height: 740, scale: 1, input: "touch", cardWidth: 366, crf: 30 },
};
