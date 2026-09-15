/* =============================================================================
 *  Campaign attribution / UTM + source tracking
 * -----------------------------------------------------------------------------
 *  จับค่า UTM และรหัสแคมเปญจาก URL แล้วเก็บไว้ตลอด session
 *  เพื่อแนบไปกับทุกการลงทะเบียน (วัดผลรายช่องทาง/พาร์ตเนอร์/QR ได้)
 *
 *  รองรับ:
 *    utm_source, utm_medium, utm_campaign, utm_content, utm_term
 *    และรหัสภายใน เช่น ?src=FB01 / ?ref=PT02
 *
 *  ตัวอย่าง:
 *    /index.html?utm_source=facebook&utm_medium=community&utm_campaign=FB01
 *    /index.html?utm_source=partner&utm_medium=referral&utm_campaign=foundation_a
 *    /index.html?utm_source=offline&utm_medium=qr&utm_campaign=event01
 * ========================================================================= */
(function (window) {
  "use strict";

  var STORAGE_KEY = "ta_attribution";
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var EXTRA_KEYS = ["src", "ref", "source", "campaign"]; // รหัสภายใน เช่น FB01, PT02

  function safeGet(store, key) {
    try { return store.getItem(key); } catch (e) { return null; }
  }
  function safeSet(store, key, val) {
    try { store.setItem(key, val); } catch (e) { /* private mode / disabled */ }
  }

  function readParams() {
    var params = new URLSearchParams(window.location.search);
    var data = {};
    UTM_KEYS.concat(EXTRA_KEYS).forEach(function (k) {
      var v = params.get(k);
      if (v) data[k] = v.slice(0, 120); // จำกัดความยาวกันข้อมูลผิดปกติ
    });
    return data;
  }

  function collect() {
    var fresh = readParams();

    // ใช้ค่าเดิมจาก session แรกที่เข้ามา (first-touch) ถ้ามี
    var storedRaw = safeGet(window.sessionStorage, STORAGE_KEY);
    var stored = null;
    if (storedRaw) {
      try { stored = JSON.parse(storedRaw); } catch (e) { stored = null; }
    }

    // ถ้ามีค่าจาก URL ใหม่ ให้ถือเป็นการเข้าชมครั้งล่าสุด (last-touch)
    var hasFresh = Object.keys(fresh).length > 0;

    var attribution = stored || {};
    if (hasFresh) {
      // เก็บ first-touch ครั้งแรก
      if (!attribution.first_touch) attribution.first_touch = fresh;
      // อัปเดต last-touch เสมอเมื่อมีค่าใหม่
      attribution.last_touch = fresh;
    } else if (!attribution.first_touch) {
      attribution.first_touch = { utm_source: "direct" };
      attribution.last_touch = { utm_source: "direct" };
    }

    attribution.landing_page = window.location.pathname;
    attribution.referrer = document.referrer || "";
    if (!attribution.first_seen_at) attribution.first_seen_at = new Date().toISOString();

    safeSet(window.sessionStorage, STORAGE_KEY, JSON.stringify(attribution));
    return attribution;
  }

  // ทำให้เป็นชุดฟิลด์แบนราบ พร้อมส่งไปกับฟอร์ม/analytics
  function flatten(attribution) {
    var t = (attribution && attribution.last_touch) || {};
    var f = (attribution && attribution.first_touch) || {};
    return {
      utm_source: t.utm_source || "",
      utm_medium: t.utm_medium || "",
      utm_campaign: t.utm_campaign || t.campaign || "",
      utm_content: t.utm_content || "",
      utm_term: t.utm_term || "",
      internal_source: t.src || t.ref || t.source || "",
      first_utm_source: f.utm_source || "",
      first_utm_campaign: f.utm_campaign || f.campaign || "",
      referrer: (attribution && attribution.referrer) || "",
      landing_page: (attribution && attribution.landing_page) || "",
    };
  }

  var attribution = collect();

  window.Attribution = {
    data: attribution,
    fields: flatten(attribution),
    // แนบ UTM ปัจจุบันเข้ากับ URL ปลายทาง (ใช้กับปุ่มสมัครแบบ external)
    appendTo: function (url) {
      if (!url) return url;
      try {
        var params = new URLSearchParams(window.location.search);
        if (![].some.call(params.keys(), function () { return true; })) return url;
        var sep = url.indexOf("?") === -1 ? "?" : "&";
        return url + sep + params.toString();
      } catch (e) {
        return url;
      }
    },
  };
})(window);
