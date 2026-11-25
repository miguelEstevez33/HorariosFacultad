// Componente: Modal y cliente de Sincronización Bidireccional PC ↔ Celular (Capacitor APK)
(function (global) {
  const App = (global.App = global.App || {});
  App.components = App.components || {};

  function isNativeMobileApp() {
    return Boolean(
      (typeof window !== "undefined" &&
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform()) ||
        /Android|iPhone|iPad/i.test(navigator.userAgent)
    );
  }

  function getDefaultSyncUrl() {
    const { STORAGE_KEYS } = App.store;
    const saved = localStorage.getItem(STORAGE_KEYS.SYNC_URL);
    if (saved) return saved;
    if (!isNativeMobileApp() && window.location && window.location.protocol.startsWith("http")) {
      return window.location.origin;
    }
    return isNativeMobileApp() ? "http://192.168.1.100:3456" : "http://localhost:3456";
  }

  function normalizeSyncUrl(raw) {
    let url = (raw || "").trim().replace(/\/+$/, "");
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    return url;
  }

  function setSyncFeedback(message, type = "info") {
    const el = document.getElementById("sync-feedback-msg");
    if (!el) return;
    el.textContent = message;
    el.className = `sync-feedback sync-feedback-${type}`;
    el.style.display = "block";
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

  async function testSyncConnection(silent = false) {
    const { STORAGE_KEYS } = App.store;
    const urlInput = document.getElementById("sync-server-url");
    const statusEl = document.getElementById("sync-conn-status");
    const lastInfoEl = document.getElementById("sync-last-info");
    const ipsHintEl = document.getElementById("sync-ips-hint");
    const baseUrl = normalizeSyncUrl(urlInput ? urlInput.value : "");

    if (!baseUrl) {
      if (!silent) {
        setSyncFeedback("Ingresá la IP y puerto del servidor de la PC (ej: http://192.168.1.45:3456).", "error");
      }
      return false;
    }

    localStorage.setItem(STORAGE_KEYS.SYNC_URL, baseUrl);
    if (statusEl) statusEl.textContent = "🟡 Conectando...";

    try {
      const res = await fetch(`${baseUrl}/api/info`, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (statusEl) statusEl.textContent = "🟢 Conectado a la PC";
      if (ipsHintEl && Array.isArray(data.ips) && data.ips.length > 0) {
        const urls = data.ips.map(ip => `<code>http://${ip}:${data.port}</code>`).join(" o ");
        ipsHintEl.innerHTML = `En tu celular (conectado al mismo Wi-Fi), ingresá: ${urls}`;
      }

      if (lastInfoEl) {
        if (data.lastSync && data.lastSync.updatedAt) {
          const origen =
            data.lastSync.source === "mobile" ? "Celular" : data.lastSync.source === "pc" ? "PC" : "Otro";
          lastInfoEl.innerHTML = `Última sincronización en el servidor: <strong>${formatSyncTimestamp(data.lastSync.updatedAt)}</strong> (enviada desde <strong>${origen}</strong> — ${data.lastSync.estadosCount} materias con estado, ${data.lastSync.cursosCount} cursos inscriptos).`;
        } else {
          lastInfoEl.textContent =
            "Servidor conectado. Todavía no hay datos guardados en el servidor: tocá 'Enviar' desde el dispositivo que tenga tus datos actualizados.";
        }
      }

      if (!silent) {
        setSyncFeedback("✅ Conexión exitosa con el servidor de sincronización.", "success");
      }
      return true;
    } catch {
      if (statusEl) statusEl.textContent = "🔴 Sin conexión";
      if (lastInfoEl) {
        lastInfoEl.textContent =
          "No se pudo conectar. Asegurate de correr 'npm run sync' en la PC y que ambos dispositivos estén en la misma red Wi-Fi.";
      }
      if (!silent) {
        setSyncFeedback(
          `❌ No se pudo conectar a ${baseUrl}. Verificá que 'npm run sync' esté corriendo en tu PC y el Firewall permita el puerto 3456.`,
          "error"
        );
      }
      return false;
    }
  }

  async function pushSyncData() {
    const { STORAGE_KEYS, state } = App.store;
    const urlInput = document.getElementById("sync-server-url");
    const baseUrl = normalizeSyncUrl(urlInput ? urlInput.value : "");
    if (!baseUrl) {
      setSyncFeedback("Ingresá primero la dirección del servidor de la PC.", "error");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.SYNC_URL, baseUrl);

    const source = isNativeMobileApp() ? "mobile" : "pc";
    setSyncFeedback("⏳ Enviando materias y horarios...", "info");

    try {
      const res = await fetch(`${baseUrl}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estadosAlumno: state.estadosAlumno,
          cursosSeleccionados: state.cursosSeleccionados,
          ordenCursosSeleccionados: state.ordenCursosSeleccionados,
          source
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al guardar");

      await testSyncConnection(true);
      setSyncFeedback(
        source === "mobile"
          ? "✅ ¡Datos enviados a la PC! Ahora en la PC abrí Sincronizar y tocá 'Traer del Celular → PC'."
          : "✅ ¡Datos guardados en el servidor! Ahora en la app del celular tocá 'Traer de la PC → Celular'.",
        "success"
      );
    } catch (err) {
      setSyncFeedback(`❌ Error al enviar datos a ${baseUrl}: ${err.message}`, "error");
    }
  }

  async function pullSyncData() {
    const { STORAGE_KEYS, setHorariosOverride, applySyncedData } = App.store;
    const urlInput = document.getElementById("sync-server-url");
    const baseUrl = normalizeSyncUrl(urlInput ? urlInput.value : "");
    if (!baseUrl) {
      setSyncFeedback("Ingresá primero la dirección del servidor de la PC.", "error");
      return;
    }
    localStorage.setItem(STORAGE_KEYS.SYNC_URL, baseUrl);

    setSyncFeedback("⏳ Descargando materias y horarios...", "info");

    try {
      const res = await fetch(`${baseUrl}/api/sync`, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Error al descargar");

      let horariosActualizados = false;
      if (data.horariosMaterias && typeof data.horariosMaterias === "object") {
        setHorariosOverride(data.horariosMaterias);
        horariosActualizados = true;
      }

      if (data.updatedAt) {
        applySyncedData(data);
      }

      if (App.renderAll) App.renderAll();
      await testSyncConnection(true);

      if (data.updatedAt) {
        setSyncFeedback(
          `✅ ¡Sincronización completada! Se actualizaron tus materias, comisiones${horariosActualizados ? " y los horarios de la PC" : ""}.`,
          "success"
        );
      } else if (horariosActualizados) {
        setSyncFeedback(
          "✅ Se actualizaron los horarios base (schedules.js) desde la PC. Todavía no había estados de materias subidos en el servidor.",
          "success"
        );
      } else {
        setSyncFeedback("⚠️ No había datos nuevos guardados en el servidor.", "info");
      }
    } catch (err) {
      setSyncFeedback(`❌ Error al descargar desde ${baseUrl}: ${err.message}`, "error");
    }
  }

  function bindEvents() {
    const btnOpen = document.getElementById("btn-open-sync");
    const modal = document.getElementById("sync-modal");
    const btnClose = document.getElementById("btn-close-sync-modal");
    const btnCloseFooter = document.getElementById("btn-close-sync-modal-footer");
    const urlInput = document.getElementById("sync-server-url");
    const btnTest = document.getElementById("btn-sync-test");
    const btnPush = document.getElementById("btn-sync-push");
    const btnPull = document.getElementById("btn-sync-pull");

    if (!modal) return;

    const isMobile = isNativeMobileApp();
    const deviceLabel = document.getElementById("sync-device-label");
    const pushTitle = document.getElementById("sync-push-title");
    const pushDesc = document.getElementById("sync-push-desc");
    const pullTitle = document.getElementById("sync-pull-title");
    const pullDesc = document.getElementById("sync-pull-desc");

    if (deviceLabel) {
      deviceLabel.textContent = isMobile ? "📱 Modo: App Celular (APK)" : "💻 Modo: PC / Navegador";
    }
    if (pushTitle && pushDesc && pullTitle && pullDesc) {
      if (isMobile) {
        pushTitle.textContent = "Enviar del Celular → PC";
        pushDesc.textContent = "Sube tus materias y horarios modificados en el celular para actualizar la PC.";
        pullTitle.textContent = "Traer de la PC → Celular";
        pullDesc.textContent =
          "Descarga tus materias, estados y los horarios actualizados (schedules.js) desde la PC.";
      } else {
        pushTitle.textContent = "Enviar de la PC → Celular";
        pushDesc.textContent =
          "Guarda el estado actual de la PC en el servidor local para que el celular lo descargue.";
        pullTitle.textContent = "Traer del Celular → PC";
        pullDesc.textContent = "Importa en esta PC los cambios de materias y horarios enviados desde el celular.";
      }
    }

    function openSyncModal() {
      if (urlInput) {
        urlInput.value = getDefaultSyncUrl();
      }
      const fb = document.getElementById("sync-feedback-msg");
      if (fb) fb.style.display = "none";
      modal.style.display = "flex";
      testSyncConnection(true);
    }

    function closeSyncModal() {
      modal.style.display = "none";
    }

    if (btnOpen) btnOpen.addEventListener("click", openSyncModal);
    if (btnClose) btnClose.addEventListener("click", closeSyncModal);
    if (btnCloseFooter) btnCloseFooter.addEventListener("click", closeSyncModal);
    modal.addEventListener("click", e => {
      if (e.target === modal) closeSyncModal();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.style.display !== "none") {
        closeSyncModal();
      }
    });

    if (btnTest) btnTest.addEventListener("click", () => testSyncConnection(false));
    if (btnPush) btnPush.addEventListener("click", pushSyncData);
    if (btnPull) btnPull.addEventListener("click", pullSyncData);
  }

  App.components.SyncModal = {
    bindEvents
  };
})(window);
