/* DECUCARE — малко JavaScript за менюто, анимациите и формата.
   Цените тук са само за показване. Сървърът смята окончателната сума сам. */
(function () {
  "use strict";

  var FREE_SHIPPING_FROM = 60; // безплатна доставка над тази сума (лв)
  var SHIPPING_COST = 5.9;     // цена на доставка под нея (лв)

  function money(value) {
    return Number(value).toFixed(2).replace(".", ",") + " лв";
  }
  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* ── Горна лента: фон при скрол + мобилно меню ── */
  var header = $("#site-header");
  var menuBtn = $("#menu-btn");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 24); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function setMenu(open) {
    header.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Затвори менюто" : "Отвори менюто");
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!header.classList.contains("menu-open"));
  });
  $$("#nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  /* ── Плавно показване при скрол ── */
  var revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  $("#year").textContent = new Date().getFullYear();

  /* ── Формата ── */
  var form = $("#order-form");
  var done = $("#done");
  var select = $("#f-product");
  var noneOption = $("#opt-none");
  var qtyWrap = $("#qty-wrap");
  var qtyValue = $("#qty-value");
  var summary = $("#summary");
  var formError = $("#form-error");
  var submitBtn = $("#submit-btn");
  var tabs = $$(".tab");
  var mode = "order";
  var quantity = 1;
  var openedAt = Date.now();

  function currentPrice() {
    var opt = select.options[select.selectedIndex];
    return opt && opt.dataset.price ? Number(opt.dataset.price) : 0;
  }

  function updateSummary() {
    var subtotal = currentPrice() * quantity;
    var shipping = subtotal > 0 && subtotal < FREE_SHIPPING_FROM ? SHIPPING_COST : 0;
    $("#sum-sub").textContent = money(subtotal);
    $("#sum-ship").textContent = shipping === 0 ? "Безплатна" : money(shipping);
    $("#sum-total").textContent = money(subtotal + shipping);
    $("#free-hint").textContent =
      subtotal > 0 && subtotal < FREE_SHIPPING_FROM
        ? "Още " + money(FREE_SHIPPING_FROM - subtotal) + " до безплатна доставка."
        : "";
  }

  function setMode(next) {
    mode = next === "question" ? "question" : "order";
    tabs.forEach(function (tab) {
      var active = tab.dataset.mode === mode;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-pressed", String(active));
    });
    var isOrder = mode === "order";
    noneOption.disabled = isOrder;
    if (isOrder && select.value === "") select.selectedIndex = 1;
    $("#f-product-label").textContent = isOrder ? "Продукт *" : "Продукт (по желание)";
    qtyWrap.hidden = !isOrder;
    summary.hidden = !isOrder;
    $("#f-message").placeholder = isOrder
      ? "Адрес за доставка, подробности за кожата Ви, предпочитания…"
      : "Опишете какво Ви интересува — с удоволствие ще помогнем.";
    submitBtn.textContent = isOrder ? "Изпрати поръчката" : "Изпрати въпроса";
    clearErrors();
  }

  function clearErrors() {
    formError.hidden = true;
    formError.textContent = "";
    $$(".err").forEach(function (el) { el.textContent = ""; });
    $$(".field.invalid").forEach(function (el) { el.classList.remove("invalid"); });
  }

  function showErrors(errors) {
    Object.keys(errors || {}).forEach(function (key) {
      var target = $('[data-error-for="' + key + '"]');
      if (target) {
        target.textContent = errors[key];
        if (target.parentElement) target.parentElement.classList.add("invalid");
      }
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { setMode(tab.dataset.mode); });
  });
  select.addEventListener("change", updateSummary);
  $("#qty-minus").addEventListener("click", function () {
    quantity = Math.max(1, quantity - 1); qtyValue.textContent = quantity; updateSummary();
  });
  $("#qty-plus").addEventListener("click", function () {
    quantity = Math.min(24, quantity + 1); qtyValue.textContent = quantity; updateSummary();
  });

  /* Бутоните „Поръчай“ / „Въпрос“ избират продукта във формата */
  $$("[data-order]").forEach(function (link) {
    link.addEventListener("click", function () {
      var slug = link.getAttribute("data-order");
      var kind = link.getAttribute("data-kind") || "order";
      showForm();
      setMode(kind);
      if (slug) select.value = slug;
      if (select.value === "" && mode === "order") select.selectedIndex = 1;
      updateSummary();
      setTimeout(function () { $("#f-name").focus({ preventScroll: true }); }, 650);
    });
  });

  function showForm() {
    done.hidden = true;
    form.hidden = false;
  }

  $("#again-btn").addEventListener("click", function () {
    showForm();
    openedAt = Date.now();
    $("#f-name").focus();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    submitBtn.disabled = true;
    var originalLabel = submitBtn.textContent;
    submitBtn.textContent = "Изпращаме…";

    var payload = {
      kind: mode,
      name: $("#f-name").value,
      email: $("#f-email").value,
      phone: $("#f-phone").value,
      productSlug: select.value,
      quantity: quantity,
      message: $("#f-message").value,
      company: $("#f-company").value,
      elapsedMs: Date.now() - openedAt
    };

    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          return { ok: response.ok && data.ok, data: data };
        });
      })
      .then(function (result) {
        var data = result.data;
        if (!result.ok) {
          showErrors(data.errors);
          formError.textContent = data.message || "Нещо се обърка. Моля, опитайте отново.";
          formError.hidden = false;
          return;
        }
        showSuccess(data);
      })
      .catch(function () {
        formError.textContent =
          "Нямахме връзка със сървъра. Проверете интернета и опитайте още веднъж, или пишете директно на имейла ни.";
        formError.hidden = false;
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      });
  });

  function showSuccess(data) {
    var isOrder = data.kind !== "question";
    $("#done-title").textContent = isOrder ? "Поръчката е приета" : "Съобщението е изпратено";
    $("#done-ref").textContent = data.reference || "—";

    var sum = data.summary;
    var box = $("#done-sum");
    if (isOrder && sum && sum.product) {
      $("#d-product").textContent = sum.product;
      $("#d-qty").textContent = sum.quantity;
      $("#d-ship").textContent = Number(sum.shipping) === 0 ? "Безплатна" : money(sum.shipping);
      $("#d-total").textContent = money(sum.total);
      box.hidden = false;
    } else {
      box.hidden = true;
    }

    form.reset();
    quantity = 1;
    qtyValue.textContent = "1";
    setMode("order");
    updateSummary();

    form.hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
    done.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  setMode("order");
  updateSummary();
})();
