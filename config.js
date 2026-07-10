export const VISITS_LOCAL_KEY = "repair_cafe_visits_v1";
export const REPAIRS_LOCAL_KEY = "repair_cafe_repairs_v1";
export const SLIDESHOW_STORAGE_KEY = "repair_cafe_slideshow_v1";

// Slideshow for the TV display page.
// Set SLIDESHOW_ENABLED to true and add slides below.
// Each slide: { type, url?, duration? }
//   type: "dashboard" | "image" | "webpage"
//   url: required for image/webpage slides
//   duration: ms to show this slide (overrides SLIDESHOW_DEFAULT_DURATION)
// Note: webpages that set X-Frame-Options/CSP may refuse to load in an iframe.
export const SLIDESHOW_ENABLED = true;
export const SLIDESHOW_DEFAULT_DURATION = 10000;

export const SLIDESHOW_SLIDES = [
  { type: "dashboard" },
  { type: "image", url: "./assets/img/repaircafexneworig.png", duration: 8000 },
  { type: "webpage", url: "https://repaircafezuilen.nl", duration: 15000 },
];
