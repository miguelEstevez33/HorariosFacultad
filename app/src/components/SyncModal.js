// Componente: Modal de Sincronización Bidireccional PC ↔ Celular (Capacitor APK)
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatSyncTimestamp(isoStr) {
    if (!isoStr) return "Nunca";
    try {
      return new Date(isoStr).toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return isoStr;
    }
  }

  function queryModalElements() {
    return {
      btnOpen: document.getElementById("btn-open-sync"),
      modal: document.getElementById("sync-modal"),
      btnClose: document.getElementById("btn-close-sync-modal"),
      btnCloseFooter: document.getElementById("btn-close-sync-modal-footer"),
      urlInput: document.getElementById("sync-server-url"),
      btnTest: document.getElementById("btn-sync-test"),
      btnPush: document.getElementById("btn-sync-push"),
      btnPull: document.getElementById("btn-sync-pull"),
      statusEl: document.getElementById("sync-conn-status"),
      lastInfoEl: document.getElementById("sync-last-info"),
      ipsHintEl: document.getElementById("sync-ips-hint"),
      feedbackEl: document.getElementById("sync-feedback-msg"),
      deviceLabel: document.getElementById("sync-device-label"),
      pushTitle: document.getElementById("sync-push-title"),
      pushDesc: document.getElementById("sync-push-desc"),
      pullTitle: document.getElementById("sync-pull-title"),
      pullDesc: document.getElementById("sync-pull-desc")
    };
  }

  function setSyncFeedback(els, message, type = "info") {
    if (!els.feedbackEl) return;
    els.feedbackEl.textContent = message;
    els.feedbackEl.className = `sync-feedback sync-feedback-${type}`;
    els.feedbackEl.style.display = "block";
  }

  function configureDeviceLabels(els, isMobile) {
    if (els.deviceLabel) {
      els.deviceLabel.textContent = isMobile ? "📱 Modo: App Celular (APK)" : "💻 Modo: PC / Navegador";
    }
    if (!els.pushTitle || !els.pushDesc || !els.pullTitle || !els.pullDesc) return;

    if (isMobile) {
      els.pushTitle.textContent = "Enviar del Celular → PC";
      els.pushDesc.textContent = "Sube tus materias y horarios modificados en el celular para actualizar la PC.";
      els.pullTitle.textContent = "Traer de la PC → Celular";
      els.pullDesc.textContent =
        "Descarga tus materias, estados y los horarios actualizados (schedules.js) desde la PC.";
    } else {
      els.pushTitle.textContent = "Enviar de la PC → Celular";
      els.pushDesc.textContent =
        "Guarda el estado actual de la PC en el servidor local para que el celular lo descargue.";
      els.pullTitle.textContent = "Traer del Celular → PC";
      els.pullDesc.textContent = "Importa en esta PC los cambios de materias y horarios enviados desde el celular.";
    }
  }

  function renderConnectionInfo(els, data) {
    if (els.statusEl) els.statusEl.textContent = "🟢 Conectado a la PC";

    if (els.ipsHintEl && Array.isArray(data.ips) && data.ips.length > 0) {
      const safePort = escapeHtml(data.port);
      const urls = data.ips.map(ip => `<code>http://${escapeHtml(ip)}:${safePort}</code>`).join(" o ");
      els.ipsHintEl.innerHTML = `En tu celular (conectado al mismo Wi-Fi), ingresá: ${urls}`;
    }

    if (!els.lastInfoEl) return;

    if (data.lastSync && data.lastSync.updatedAt) {
      const origen =
        data.lastSync.source === "mobile" ? "Celular" : data.lastSync.source === "pc" ? "PC" : "Otro";
      const safeTimestamp = escapeHtml(formatSyncTimestamp(data.lastSync.updatedAt));
      const safeEstados = escapeHtml(data.lastSync.estadosCount);
      const safeCursos = escapeHtml(data.lastSync.cursosCount);
      els.lastInfoEl.innerHTML = `Última sincronización en el servidor: <strong>${safeTimestamp}</strong> (enviada desde <strong>${origen}</strong> — ${safeEstados} materias con estado, ${safeCursos} cursos inscriptos).`;
    } else {
      els.lastInfoEl.textContent =
        "Servidor conectado. Todavía no hay datos guardados en el servidor: tocá 'Enviar' desde el dispositivo que tenga tus datos actualizados.";
    }
  }

  function resolveBaseUrl(els, emptyErrorMsg, silent = false) {
    const baseUrl = App.syncClient.normalizeSyncUrl(els.urlInput ? els.urlInput.value : "");
    if (!baseUrl) {
      if (!silent) setSyncFeedback(els, emptyErrorMsg, "error");
      return "";
    }
    App.store.setSyncUrl(baseUrl);
    return baseUrl;
  }

  async function testSyncConnection(els, silent = false) {
    const baseUrl = resolveBaseUrl(
      els,
      "Ingresá la IP y puerto del servidor de la PC (ej: http://192.168.1.45:3456).",
      silent
    );
    if (!baseUrl) return false;

    if (els.statusEl) els.statusEl.textContent = "🟡 Conectando...";

    try {
      const data = await App.syncClient.fetchServerInfo(baseUrl);
      renderConnectionInfo(els, data);
      if (!silent) {
        setSyncFeedback(els, "✅ Conexión exitosa con el servidor de sincronización.", "success");
      }
      return true;
    } catch {
      if (els.statusEl) els.statusEl.textContent = "🔴 Sin conexión";
      if (els.lastInfoEl) {
        els.lastInfoEl.textContent =
          "No se pudo conectar. Asegurate de correr 'npm run sync' en la PC y que ambos dispositivos estén en la misma red Wi-Fi.";
      }
      if (!silent) {
        setSyncFeedback(
          els,
          `❌ No se pudo conectar a ${baseUrl}. Verificá que 'npm run sync' esté corriendo en tu PC y el Firewall permita el puerto 3456.`,
          "error"
        );
      }
      return false;
    }
  }

  async function pushSyncData(els) {
    const baseUrl = resolveBaseUrl(els, "Ingresá primero la dirección del servidor de la PC.");
    if (!baseUrl) return;

    const { state } = App.store;
    const source = App.syncClient.isNativeMobileApp() ? "mobile" : "pc";
    setSyncFeedback(els, "⏳ Enviando materias y horarios...", "info");

    try {
      await App.syncClient.pushState(baseUrl, {
        estadosAlumno: state.estadosAlumno,
        cursosSeleccionados: state.cursosSeleccionados,
        ordenCursosSeleccionados: state.ordenCursosSeleccionados,
        source
      });

      await testSyncConnection(els, true);
      setSyncFeedback(
        els,
        source === "mobile"
          ? "✅ ¡Datos enviados a la PC! Ahora en la PC abrí Sincronizar y tocá 'Traer del Celular → PC'."
          : "✅ ¡Datos guardados en el servidor! Ahora en la app del celular tocá 'Traer de la PC → Celular'.",
        "success"
      );
    } catch (err) {
      setSyncFeedback(els, `❌ Error al enviar datos a ${baseUrl}: ${err.message}`, "error");
    }
  }

  async function pullSyncData(els) {
    const baseUrl = resolveBaseUrl(els, "Ingresá primero la dirección del servidor de la PC.");
    if (!baseUrl) return;

    const { setHorariosOverride, applySyncedData } = App.store;
    setSyncFeedback(els, "⏳ Descargando materias y horarios...", "info");

    try {
      const data = await App.syncClient.pullState(baseUrl);

      let horariosActualizados = false;
      if (data.horariosMaterias && typeof data.horariosMaterias === "object") {
        setHorariosOverride(data.horariosMaterias);
        horariosActualizados = true;
      }

      if (data.updatedAt) {
        applySyncedData(data);
      }

      if (App.renderAll) App.renderAll();
      await testSyncConnection(els, true);

      if (data.updatedAt) {
        setSyncFeedback(
          els,
          `✅ ¡Sincronización completada! Se actualizaron tus materias, comisiones${horariosActualizados ? " y los horarios de la PC" : ""}.`,
          "success"
        );
      } else if (horariosActualizados) {
        setSyncFeedback(
          els,
          "✅ Se actualizaron los horarios base (schedules.js) desde la PC. Todavía no había estados de materias subidos en el servidor.",
          "success"
        );
      } else {
        setSyncFeedback(els, "⚠️ No había datos nuevos guardados en el servidor.", "info");
      }
    } catch (err) {
      setSyncFeedback(els, `❌ Error al descargar desde ${baseUrl}: ${err.message}`, "error");
    }
  }

  function bindEvents() {
    const els = queryModalElements();
    if (!els.modal) return;

    configureDeviceLabels(els, App.syncClient.isNativeMobileApp());

    function openSyncModal() {
      if (els.urlInput) {
        els.urlInput.value = App.syncClient.getDefaultSyncUrl();
      }
      if (els.feedbackEl) {
        els.feedbackEl.style.display = "none";
      }
      els.modal.style.display = "flex";
      testSyncConnection(els, true);
    }

    function closeSyncModal() {
      els.modal.style.display = "none";
    }

    if (els.btnOpen) els.btnOpen.addEventListener("click", openSyncModal);
    if (els.btnClose) els.btnClose.addEventListener("click", closeSyncModal);
    if (els.btnCloseFooter) els.btnCloseFooter.addEventListener("click", closeSyncModal);
    els.modal.addEventListener("click", e => {
      if (e.target === els.modal) closeSyncModal();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && els.modal.style.display !== "none") {
        closeSyncModal();
      }
    });

    if (els.btnTest) els.btnTest.addEventListener("click", () => testSyncConnection(els, false));
    if (els.btnPush) els.btnPush.addEventListener("click", () => pushSyncData(els));
    if (els.btnPull) els.btnPull.addEventListener("click", () => pullSyncData(els));
  }

  App.components.SyncModal = {
    bindEvents
  };
})(window);
