// Punto de entrada principal: navegación por pestañas, renderizado global e inicialización
(function (global) {
  const App = (global.App = global.App || {});

  function switchTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-tab") === tabName);
    });
    document.getElementById("tab-alumno").classList.toggle("active", tabName === "alumno");
    document.getElementById("tab-cursado").classList.toggle("active", tabName === "cursado");
    const tabCorr = document.getElementById("tab-correlativas");
    if (tabCorr) {
      tabCorr.classList.toggle("active", tabName === "correlativas");
    }
  }

  function renderAll() {
    const {
      HeaderStats,
      AlumnoTab,
      CursadoPicker,
      UtnCalendar,
      CorrelativasTab,
      KillMateriaModal
    } = App.components;

    HeaderStats.render();
    AlumnoTab.render();
    CursadoPicker.render();
    UtnCalendar.render();
    CorrelativasTab.render();
    if (KillMateriaModal.isOpen()) {
      KillMateriaModal.render();
    }
  }

  function setupThemeToggle() {
    const btn = document.getElementById("btn-toggle-theme");
    if (!btn) return;

    function syncButtonLabel() {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      btn.textContent = isDark ? "Modo claro" : "Modo oscuro";
      btn.setAttribute("aria-pressed", String(isDark));
    }

    syncButtonLabel();
    btn.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      if (isDark) {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("horarios_theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("horarios_theme", "dark");
      }
      syncButtonLabel();
    });
  }

  function setupNavigationEvents() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");
        switchTab(target);
      });
    });
  }

  App.switchTab = switchTab;
  App.renderAll = renderAll;

  document.addEventListener("DOMContentLoaded", () => {
    const {
      AlumnoTab,
      CursadoPicker,
      UtnCalendar,
      CorrelativasTab,
      KillMateriaModal,
      SyncModal
    } = App.components;

    setupThemeToggle();
    setupNavigationEvents();
    AlumnoTab.bindEvents();
    CursadoPicker.bindEvents();
    UtnCalendar.bindEvents();
    CorrelativasTab.bindEvents();
    KillMateriaModal.bindEvents();
    SyncModal.bindEvents();

    renderAll();
  });
})(window);
