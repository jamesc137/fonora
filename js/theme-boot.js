/** Sync theme attribute before first paint (loads before nav-boot.js). */
(function () {
  try {
    const theme = localStorage.getItem('fonora-theme');
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch {
    /* private browsing */
  }
})();
