/* =============================================================================
 *  Analytics — GA4 / Google Tag Manager / Google Ads
 * -----------------------------------------------------------------------------
 *  - สคริปต์ GA4/GTM จะถูกโหลด "ต่อเมื่อ" ใส่ ID จริงใน config.js เท่านั้น
 *    (ถ้ายังเป็น [GA4_ID] / [GTM_ID] จะไม่โหลดอะไร — ปลอดภัยตอนพัฒนา)
 *  - ทุกอีเวนต์ถูกส่งเข้า window.dataLayer เสมอ จึงพร้อมต่อ GTM/GA ภายหลัง
 *
 *  Events: page_view, cta_click, form_start, form_submit,
 *          eligibility_click, faq_open, registration_complete
 * ========================================================================= */
(function (window, document) {
  "use strict";

  var cfg = (window.THAI_AUDIO_CONFIG && window.THAI_AUDIO_CONFIG.analytics) || {};
  window.dataLayer = window.dataLayer || [];

  function isReal(v) {
    return typeof v === "string" && v && v.indexOf("[") !== 0;
  }

  function loadScript(src, async) {
    var s = document.createElement("script");
    s.src = src;
    s.async = async !== false;
    document.head.appendChild(s);
    return s;
  }

  // ---- Google Tag Manager -------------------------------------------------
  if (isReal(cfg.gtmId)) {
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    loadScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(cfg.gtmId));
  }

  // ---- Google Analytics 4 (gtag) -----------------------------------------
  var gtagReady = false;
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (isReal(cfg.ga4Id)) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id));
    gtag("js", new Date());
    gtag("config", cfg.ga4Id);
    gtagReady = true;
  }
  if (isReal(cfg.adsConversionId)) {
    if (!gtagReady) {
      loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.adsConversionId));
      gtag("js", new Date());
      gtagReady = true;
    }
    gtag("config", cfg.adsConversionId);
  }

  // ---- Public event API ---------------------------------------------------
  function track(eventName, params) {
    var payload = Object.assign({ event: eventName }, params || {});
    // แนบ attribution ทุกครั้งถ้ามี
    if (window.Attribution && window.Attribution.fields) {
      payload = Object.assign({}, window.Attribution.fields, payload);
    }
    window.dataLayer.push(payload);
    if (gtagReady && typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }

  function trackAdsConversion() {
    if (gtagReady && isReal(cfg.adsConversionId) && isReal(cfg.adsConversionLabel)) {
      window.gtag("event", "conversion", {
        send_to: cfg.adsConversionId + "/" + cfg.adsConversionLabel,
      });
    }
  }

  window.Analytics = { track: track, trackAdsConversion: trackAdsConversion };

  // page_view (GA4 ส่งเองอยู่แล้ว แต่ push เข้า dataLayer ไว้เผื่อ GTM)
  track("page_view", { page_title: document.title });
})(window, document);
