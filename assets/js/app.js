/* =============================================================================
 *  App — render config-driven content, wire interactions, handle registration
 * ========================================================================= */
(function (window, document) {
  "use strict";

  var CFG = window.THAI_AUDIO_CONFIG || {};
  var track = (window.Analytics && window.Analytics.track) || function () {};

  /* ------------------------- helpers ------------------------------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function isPlaceholder(v) { return typeof v === "string" && v.indexOf("[") === 0; }

  // แทนที่ token เช่น [COMPENSATION_AMOUNT] / [ESTIMATED_DURATION] / ข้อมูลติดต่อ
  function fillTokens(str) {
    if (typeof str !== "string") return str;
    var map = {
      "[COMPENSATION_AMOUNT]": (CFG.compensation && CFG.compensation.amount) || "[COMPENSATION_AMOUNT]",
      "[ESTIMATED_DURATION]": (CFG.time && CFG.time.estimatedDuration) || "[ESTIMATED_DURATION]",
      "[PROJECT_EMAIL]": (CFG.contact && CFG.contact.email) || "[PROJECT_EMAIL]",
      "[PROJECT_PHONE]": (CFG.contact && CFG.contact.phone) || "[PROJECT_PHONE]",
      "[LINE_CONTACT]": (CFG.contact && CFG.contact.line) || "[LINE_CONTACT]",
      "[BUSINESS_HOURS]": (CFG.contact && CFG.contact.hours) || "[BUSINESS_HOURS]",
    };
    return str.replace(/\[[A-Z_]+\]/g, function (m) { return map[m] != null ? map[m] : m; });
  }

  // ครอบค่าที่ยังเป็น placeholder ด้วย badge เตือน (มองเห็นเฉพาะทีมงาน — ช่วยกันลืมแก้)
  function valueOrPlaceholder(value) {
    var span = el("span");
    if (isPlaceholder(value)) {
      span.className = "placeholder-flag";
      span.title = "ยังไม่ได้กำหนดค่า — โปรดแก้ไขใน assets/js/config.js";
      span.textContent = value;
    } else {
      span.textContent = value;
    }
    return span;
  }

  /* ------------------------- text token replacement ---------------------- */
  // แทน token ในโหนดข้อความที่ทำเครื่องหมาย data-token ไว้
  $all("[data-token]").forEach(function (node) {
    node.textContent = fillTokens(node.getAttribute("data-token"));
  });

  /* ------------------------- populate simple config slots ---------------- */
  function setSlot(sel, value, asFlag) {
    var node = $(sel);
    if (!node) return;
    node.innerHTML = "";
    node.appendChild(asFlag ? valueOrPlaceholder(value) : document.createTextNode(value));
  }

  // Project / org
  setSlot('[data-cfg="org"]', CFG.project.org);
  $all('[data-cfg="deadline"]').forEach(function (n) { n.textContent = CFG.project.deadline; });
  $all('[data-cfg="targetPairs"]').forEach(function (n) { n.textContent = CFG.project.targetPairs; });
  setSlot('[data-cfg="orgLegalName"]', CFG.project.orgLegalName, true);
  setSlot('[data-cfg="orgRegistrationNo"]', CFG.project.orgRegistrationNo, true);

  // Compensation
  setSlot('[data-cfg="compAmount"]', CFG.compensation.amount, true);
  $all('[data-cfg="compAmountInline"]').forEach(function (n) {
    n.innerHTML = ""; n.appendChild(valueOrPlaceholder(CFG.compensation.amount));
  });
  setSlot('[data-cfg="compNote"]', CFG.compensation.note);

  // Time
  setSlot('[data-cfg="duration"]', CFG.time.estimatedDuration, true);
  setSlot('[data-cfg="durationNote"]', CFG.time.note);

  // Contact
  (function contact() {
    var c = CFG.contact;
    var emailEl = $('[data-cfg="email"]');
    if (emailEl) {
      emailEl.textContent = c.email;
      if (!isPlaceholder(c.email)) emailEl.href = "mailto:" + c.email;
      else emailEl.classList.add("placeholder-flag");
    }
    var phoneEl = $('[data-cfg="phone"]');
    if (phoneEl) {
      phoneEl.textContent = c.phone;
      if (!isPlaceholder(c.phone)) phoneEl.href = "tel:" + c.phone.replace(/[^0-9+]/g, "");
      else phoneEl.classList.add("placeholder-flag");
    }
    setSlot('[data-cfg="line"]', c.line, true);
    setSlot('[data-cfg="hours"]', c.hours, true);
  })();

  // Policy links
  (function links() {
    var l = CFG.links;
    $all('[data-cfg="privacyUrl"]').forEach(function (a) {
      a.href = isPlaceholder(l.privacyUrl) ? "#" : l.privacyUrl;
      if (isPlaceholder(l.privacyUrl)) a.classList.add("placeholder-link");
      if (!isPlaceholder(l.privacyUrl)) a.target = "_blank", a.rel = "noopener";
    });
    $all('[data-cfg="termsUrl"]').forEach(function (a) {
      a.href = isPlaceholder(l.termsUrl) ? "#" : l.termsUrl;
      if (isPlaceholder(l.termsUrl)) a.classList.add("placeholder-link");
      if (!isPlaceholder(l.termsUrl)) a.target = "_blank", a.rel = "noopener";
    });
    $all('[data-cfg="dataUseUrl"]').forEach(function (a) {
      a.href = isPlaceholder(l.dataUseUrl) ? "#" : l.dataUseUrl;
      if (isPlaceholder(l.dataUseUrl)) a.classList.add("placeholder-link");
      if (!isPlaceholder(l.dataUseUrl)) a.target = "_blank", a.rel = "noopener";
    });
  })();

  /* ------------------------- render lists -------------------------------- */
  // Hero badges
  (function heroBadges() {
    var wrap = $("#heroBadges");
    if (!wrap) return;
    (CFG.heroBadges || []).forEach(function (b) {
      var chip = el("span", "badge-chip");
      chip.appendChild(el("span", "badge-chip__icon", b.icon));
      chip.appendChild(el("span", null, b.text));
      wrap.appendChild(chip);
    });
  })();

  // How it works steps
  (function steps() {
    var wrap = $("#stepsGrid");
    if (!wrap) return;
    (CFG.steps || []).forEach(function (s, i) {
      var card = el("li", "step-card");
      var num = el("div", "step-card__num", String(i + 1));
      card.appendChild(num);
      var body = el("div", "step-card__body");
      body.appendChild(el("h3", "step-card__title", s.title));
      body.appendChild(el("p", null, s.desc));
      card.appendChild(body);
      wrap.appendChild(card);
    });
  })();

  // Eligibility checklist
  (function eligibility() {
    var wrap = $("#eligibilityList");
    if (!wrap) return;
    (CFG.eligibility || []).forEach(function (t) {
      var li = el("li", "check-item");
      li.appendChild(checkIcon());
      li.appendChild(el("span", null, t));
      wrap.appendChild(li);
    });
  })();

  // Core requirements
  (function requirements() {
    var wrap = $("#requirementsList");
    if (!wrap) return;
    (CFG.requirements || []).forEach(function (t) {
      var li = el("li", "check-item");
      li.appendChild(checkIcon());
      li.appendChild(el("span", null, t));
      wrap.appendChild(li);
    });
  })();

  // Tasks
  (function tasks() {
    var wrap = $("#tasksList");
    if (!wrap) return;
    (CFG.tasks || []).forEach(function (t) {
      var li = el("li", "dot-item");
      li.appendChild(el("span", "dot-item__dot"));
      li.appendChild(el("span", null, t));
      wrap.appendChild(li);
    });
    setSlot('[data-cfg="tasksNote"]', CFG.tasksNote);
  })();

  // Device + environment
  (function deviceEnv() {
    var d = $("#deviceList");
    if (d) (CFG.device.items || []).forEach(function (t) {
      var li = el("li", "check-item"); li.appendChild(checkIcon()); li.appendChild(el("span", null, t)); d.appendChild(li);
    });
    setSlot('[data-cfg="deviceNote"]', CFG.device.note);
    var e = $("#environmentList");
    if (e) (CFG.environment.items || []).forEach(function (t) {
      var li = el("li", "check-item"); li.appendChild(checkIcon()); li.appendChild(el("span", null, t)); e.appendChild(li);
    });
  })();

  // Benefits
  (function benefits() {
    var wrap = $("#benefitsGrid");
    if (!wrap) return;
    (CFG.benefits || []).forEach(function (b) {
      var card = el("div", "benefit-card");
      card.appendChild(el("div", "benefit-card__icon", b.icon));
      card.appendChild(el("h3", "benefit-card__title", b.title));
      card.appendChild(el("p", null, b.desc));
      wrap.appendChild(card);
    });
  })();

  // FAQ accordion
  (function faq() {
    var wrap = $("#faqList");
    if (!wrap) return;
    (CFG.faq || []).forEach(function (item, i) {
      var d = el("div", "faq-item");
      var btn = el("button", "faq-item__q");
      btn.type = "button";
      btn.setAttribute("aria-expanded", "false");
      btn.id = "faq-q-" + i;
      btn.setAttribute("aria-controls", "faq-a-" + i);
      btn.appendChild(el("span", null, item.q));
      btn.appendChild(el("span", "faq-item__chevron"));
      var ans = el("div", "faq-item__a");
      ans.id = "faq-a-" + i;
      ans.setAttribute("role", "region");
      ans.setAttribute("aria-labelledby", "faq-q-" + i);
      ans.hidden = true;
      ans.appendChild(el("p", null, fillTokens(item.a)));
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        ans.hidden = open;
        d.classList.toggle("is-open", !open);
        if (!open) track("faq_open", { question: item.q });
      });
      d.appendChild(btn);
      d.appendChild(ans);
      wrap.appendChild(d);
    });
  })();

  function checkIcon() {
    var span = el("span", "check-item__icon");
    span.innerHTML = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8.143 13.314 4.83 10l-1.18 1.172 4.492 4.492 9-9-1.172-1.172z"/></svg>';
    return span;
  }

  /* ------------------------- CTA behavior -------------------------------- */
  var mode = (CFG.registration && CFG.registration.mode) || "native";
  var externalUrl = CFG.links && CFG.links.registrationFormUrl;

  $all("[data-cta-apply]").forEach(function (btn) {
    var label = btn.getAttribute("data-cta-apply") || "unknown";
    if (mode === "external" && externalUrl && !isPlaceholder(externalUrl)) {
      var href = window.Attribution ? window.Attribution.appendTo(externalUrl) : externalUrl;
      btn.setAttribute("href", href);
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener");
    } else {
      btn.setAttribute("href", "#register");
    }
    btn.addEventListener("click", function () {
      track("cta_click", { cta_location: label, mode: mode });
      if (window.Analytics) window.Analytics.trackAdsConversion && 0; // conversion fires on submit
    });
  });

  $all("[data-cta-eligibility]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      track("eligibility_click", { cta_location: btn.getAttribute("data-cta-eligibility") || "" });
    });
  });

  /* ------------------------- mobile nav ---------------------------------- */
  (function nav() {
    var toggle = $("#navToggle");
    var nav = $("#nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $all("a", nav).forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  })();

  /* ------------------------- footer year --------------------------------- */
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ------------------------- registration form --------------------------- */
  (function registrationForm() {
    var section = $("#register");
    if (!section) return;

    // โหมด external: ซ่อนฟอร์ม native แสดงปุ่มไปยังฟอร์มภายนอกแทน
    var nativeWrap = $("#nativeForm");
    var externalWrap = $("#externalForm");
    if (mode === "external" && externalUrl && !isPlaceholder(externalUrl)) {
      if (nativeWrap) nativeWrap.hidden = true;
      if (externalWrap) externalWrap.hidden = false;
      return;
    }
    if (externalWrap) externalWrap.hidden = true;
    if (nativeWrap) nativeWrap.hidden = false;

    var form = $("#registrationForm");
    if (!form) return;

    // เติมตัวเลือก select จาก config
    fillSelect("#f_age", CFG.form.ageGroups, "เลือกกลุ่มอายุ");
    fillSelect("#f_province", CFG.form.provinces, "เลือกจังหวัด");
    fillSelect("#f_device", CFG.form.deviceTypes, "เลือกอุปกรณ์");
    fillSelect("#f_pair", CFG.form.pairStatus, "เลือกสถานะการจับคู่");
    fillCheckboxGroup("#f_availability", CFG.form.availability, "availability");

    // แนบ attribution เป็น hidden fields
    if (window.Attribution) {
      var fields = window.Attribution.fields;
      Object.keys(fields).forEach(function (k) {
        var input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = fields[k];
        form.appendChild(input);
      });
      // เติมช่องผู้แนะนำ/แหล่งที่มา อัตโนมัติถ้ามี
      var refInput = $("#f_referral");
      if (refInput && !refInput.value) {
        refInput.value = fields.internal_source || fields.utm_campaign || "";
      }
    }

    // form_start (ยิงครั้งเดียวเมื่อผู้ใช้เริ่มกรอก)
    var started = false;
    form.addEventListener("focusin", function () {
      if (!started) { started = true; track("form_start", {}); }
    });

    var note = $("#formNote");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      note.textContent = "";
      note.className = "form-note";

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var consent = $("#f_consent");
      if (consent && !consent.checked) {
        note.textContent = "กรุณายอมรับเงื่อนไขการเข้าร่วมโครงการและนโยบายความเป็นส่วนตัวก่อนส่ง";
        note.classList.add("is-error");
        consent.focus();
        return;
      }

      var data = collectForm(form);
      track("form_submit", { mode: mode });

      var submitBtn = $("#submitBtn");
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "กำลังส่ง..."; }

      var endpoint = CFG.registration && CFG.registration.endpoint;
      var done = function () {
        track("registration_complete", {});
        if (window.Analytics) window.Analytics.trackAdsConversion();
        showThankYou();
      };
      var fail = function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "สมัครเข้าร่วมโครงการ"; }
        note.textContent = "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมงาน";
        note.classList.add("is-error");
      };

      if (endpoint && !isPlaceholder(endpoint)) {
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }).then(function (r) {
          if (r.ok) done(); else fail();
        }).catch(fail);
      } else {
        // โหมดสาธิต — ไม่มี endpoint จริง
        setTimeout(done, 400);
      }
    });

    function collectForm(form) {
      var fd = new FormData(form);
      var out = {};
      fd.forEach(function (v, k) {
        if (out[k] !== undefined) {
          if (!Array.isArray(out[k])) out[k] = [out[k]];
          out[k].push(v);
        } else { out[k] = v; }
      });
      out.submitted_at = new Date().toISOString();
      return out;
    }

    function showThankYou() {
      var ty = $("#thankYou");
      var formCard = $("#formCard");
      if (formCard) formCard.hidden = true;
      if (ty) {
        ty.hidden = false;
        ty.setAttribute("tabindex", "-1");
        ty.focus();
        ty.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  })();

  function fillSelect(sel, options, placeholder) {
    var s = $(sel);
    if (!s) return;
    var ph = el("option", null, placeholder);
    ph.value = ""; ph.disabled = true; ph.selected = true;
    s.appendChild(ph);
    (options || []).forEach(function (o) {
      var opt = el("option", null, o); opt.value = o; s.appendChild(opt);
    });
  }

  function fillCheckboxGroup(sel, options, name) {
    var wrap = $(sel);
    if (!wrap) return;
    (options || []).forEach(function (o, i) {
      var id = name + "_" + i;
      var lbl = el("label", "pill-check");
      var inp = document.createElement("input");
      inp.type = "checkbox"; inp.name = name; inp.value = o; inp.id = id;
      lbl.appendChild(inp);
      lbl.appendChild(el("span", null, o));
      wrap.appendChild(lbl);
    });
  }

  /* ------------------------- sticky mobile CTA visibility ---------------- */
  (function stickyCta() {
    var bar = $("#stickyCta");
    var hero = $("#hero");
    if (!bar || !hero || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // แสดง sticky bar เมื่อเลื่อนพ้น hero
        bar.classList.toggle("is-visible", !e.isIntersecting);
      });
    }, { rootMargin: "-120px 0px 0px 0px" });
    io.observe(hero);
  })();
})(window, document);
