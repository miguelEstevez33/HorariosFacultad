// Servicio de red para la sincronización bidireccional PC ↔ Celular
(function (global) {
  const App = (global.App = global.App || {});

  function isNativeMobileApp() {
    return Boolean(
      (typeof window !== "undefined" &&
        window.Capacitor &&
        typeof window.Capacitor.isNativePlatform === "function" &&
        window.Capacitor.isNativePlatform()) ||
        (typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent))
    );
  }

  function normalizeSyncUrl(raw) {
    let url = (raw || "").trim().replace(/\/+$/, "");
    if (!url) return "";
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + url;
    }
    return url;
  }

  function getDefaultSyncUrl() {
    const saved = App.store && typeof App.store.getSyncUrl === "function" ? App.store.getSyncUrl() : "";
    if (saved) return saved;
    if (!isNativeMobileApp() && typeof window !== "undefined" && window.location && window.location.protocol.startsWith("http")) {
      return window.location.origin;
    }
    return isNativeMobileApp() ? "http://192.168.1.100:3456" : "http://localhost:3456";
  }

  async function requestJson(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }

  async function fetchServerInfo(baseUrl) {
    return requestJson(`${baseUrl}/api/info`, { method: "GET" });
  }

  async function pushState(baseUrl, payload) {
    const data = await requestJson(`${baseUrl}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!data.ok) {
      throw new Error(data.error || "Error al guardar");
    }
    return data;
  }

  async function pullState(baseUrl) {
    const data = await requestJson(`${baseUrl}/api/sync`, { method: "GET" });
    if (!data.ok) {
      throw new Error(data.error || "Error al descargar");
    }
    return data;
  }

  App.syncClient = {
    isNativeMobileApp,
    normalizeSyncUrl,
    getDefaultSyncUrl,
    fetchServerInfo,
    pushState,
    pullState
  };
})(window);
