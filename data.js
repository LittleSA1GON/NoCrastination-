var defaultBlockedSites = [
  ["discord.com", ""],
  ["www.youtube.com", "/shorts/*"],
]; // Distracting sites

var defaultAllowedSites = [
  ["mail.google.com", ""],
  ["classroom.google.com", ""],
]; // Educational sites

// Exports for use in popup.js
export { defaultBlockedSites, defaultAllowedSites };
