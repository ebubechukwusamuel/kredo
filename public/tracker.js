(function () {
  var TRACKER_URL = window.__KREDO_TRACKER_URL__ || "https://kredo-gray.vercel.app/api/track";
  var PROJECT = window.__KREDO_PROJECT__ || "";

  if (!PROJECT) {
    console.warn("[Kredo Analytics] Set __KREDO_PROJECT__ or window.KredoAnalytics.init({project: '...'})");
    return;
  }

  var uid = localStorage.getItem("_kredo_vid");
  if (!uid) {
    uid = "v_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem("_kredo_vid", uid);
  }

  function send(data) {
    data.project = PROJECT;
    data.visitorId = uid;
    try {
      var r = new XMLHttpRequest();
      r.open("POST", TRACKER_URL, true);
      r.setRequestHeader("Content-Type", "application/json");
      r.send(JSON.stringify(data));
    } catch (e) {}
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "Other";
  }

  function getDevice() {
    var ua = navigator.userAgent;
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "Mobile";
    if (/Tablet|iPad/i.test(ua)) return "Tablet";
    return "Desktop";
  }

  function getElLabel(el) {
    var text = "";
    if (el.textContent) text = el.textContent.trim().slice(0, 100);
    if (!text && el.tagName === "IMG") text = el.alt || "";
    if (!text && el.tagName === "INPUT") text = el.placeholder || el.name || el.type || "";
    if (!text && el.tagName === "A") text = el.href ? el.href.split("/").pop()?.split("?")[0]?.replace(/-/g, " ") || "" : "";
    if (!text && el.getAttribute && el.getAttribute("aria-label")) text = el.getAttribute("aria-label");
    return text || "(no label)";
  }

  function getElInfo(el) {
    var tag = (el.tagName || "").toLowerCase();
    var info = tag;
    if (el.id) info += "#" + el.id;
    if (el.className && typeof el.className === "string" && el.className.trim())
      info += "." + el.className.trim().split(/\s+/).slice(0, 2).join(".");
    if (tag === "a" && el.href) info += " -> " + el.href.slice(0, 200);
    if (tag === "img" && el.alt) info += " [" + el.alt.slice(0, 50) + "]";
    return info.slice(0, 300);
  }

  function getQueryParams() {
    var s = window.location.search;
    if (!s) return "";
    var p = new URLSearchParams(s);
    var parts = [];
    p.forEach(function (v, k) { parts.push(k + "=" + v); });
    return parts.join("&");
  }

  function basePayload() {
    return {
      page: window.location.pathname + window.location.search,
      pageTitle: document.title || "",
      referrer: document.referrer || "",
      browser: getBrowser(),
      device: getDevice(),
      urlParams: getQueryParams(),
    };
  }

  function pageView() {
    send(Object.assign(basePayload(), { action: "pageview" }));
  }

  window.KredoAnalytics = {
    init: function (opts) {
      if (opts.project) PROJECT = opts.project;
      if (opts.trackerUrl) TRACKER_URL = opts.trackerUrl;
      if (opts.debug) debug = true;
      pageView();
    },
    track: function (action, actionLabel, metadata) {
      send(Object.assign(basePayload(), {
        action: action,
        actionLabel: actionLabel || "",
        metadata: metadata || {},
      }));
    },
    pageView: pageView,
  };

  var start = Date.now();
  window.addEventListener("beforeunload", function () {
    var secs = Math.round((Date.now() - start) / 1000);
    if (secs >= 3) {
      send({ action: "duration", duration: secs, page: window.location.pathname + window.location.search });
    }
  });

  document.addEventListener("click", function (e) {
    var el = e.target;
    if (!el) return;
    var interactive = el.closest("a, button, input[type=submit], [role=button], [onclick]");
    if (!interactive) {
      if (["INPUT", "IMG", "SELECT", "TEXTAREA"].includes(el.tagName)) interactive = el;
      else return;
    }
    if (interactive.href && interactive.href.includes(TRACKER_URL)) return;
    if (interactive.closest && interactive.closest("[data-kredo-ignore]")) return;

    send(Object.assign(basePayload(), {
      action: "click",
      actionLabel: getElLabel(interactive),
      metadata: {
        element: getElInfo(interactive),
        href: interactive.href ? interactive.href.slice(0, 500) : "",
        target: interactive.target || "",
      },
    }));
  }, true);

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form) return;
    var formName = form.name || form.id || form.getAttribute("aria-label") || "";
    send(Object.assign(basePayload(), {
      action: "form_submit",
      actionLabel: formName || (form.action ? form.action.split("/").pop() : "") || "(unnamed form)",
      metadata: {
        formName: formName,
        formAction: form.action || "",
        formMethod: form.method || "GET",
        fieldCount: form.elements ? form.elements.length : 0,
      },
    }));
  }, true);

  var scrollTracked = {};
  var scrollTimer;
  window.addEventListener("scroll", function () {
    if (scrollTimer) return;
    scrollTimer = setTimeout(function () {
      scrollTimer = null;
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      if (docH <= 0) return;
      var pct = Math.round((window.scrollY / docH) * 100);
      [25, 50, 75, 100].forEach(function (threshold) {
        if (pct >= threshold && !scrollTracked[threshold]) {
          scrollTracked[threshold] = true;
          send(Object.assign(basePayload(), {
            action: "scroll",
            actionLabel: threshold + "%",
            metadata: { scrollPercent: threshold, scrollPx: Math.round(window.scrollY) },
          }));
        }
      });
    }, 300);
  }, { passive: true });

  document.addEventListener("visibilitychange", function () {
    var hidden = document.hidden;
    send(Object.assign(basePayload(), {
      action: "visibility",
      actionLabel: hidden ? "tab_hidden" : "tab_visible",
      metadata: { visible: !hidden, elapsed: Math.round((Date.now() - start) / 1000) },
    }));
  });
})();
