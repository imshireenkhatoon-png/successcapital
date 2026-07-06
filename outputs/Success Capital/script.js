(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const header = $("[data-header]");
  const navToggle = $("[data-nav-toggle]");
  const navMenu = $("[data-nav-menu]");
  const modal = $("#investment-modal");
  const form = $("#investment-form");
  const planSelect = $("[data-plan-select]");
  const amountInput = $("[data-amount-input]");
  const fileInput = $("[data-file-input]");
  const fileName = $("[data-file-name]");
  const submitBtn = $("[data-submit-btn]");
  const formAlert = $("[data-form-alert]");
  const successState = $("[data-success-state]");
  const modalCopy = $(".modal-copy", modal);
  const toast = $("[data-toast]");

  let lastFocusedElement = null;
  let toastTimer = null;

  const setHeaderState = () => {
    header.classList.toggle("scrolled", window.scrollY > 18);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const closeMenu = () => {
    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  $$(".nav-menu a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("menu-open")) {
      return;
    }

    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".btn");

    if (!button || button.disabled) {
      return;
    }

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - rect.top : rect.height / 2;

    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.appendChild(ripple);

    window.setTimeout(() => ripple.remove(), 620);
  });

  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const counters = $$("[data-counter]");

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || "0");
    const decimals = Number(counter.dataset.decimals || "0");
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      counter.textContent = value.toFixed(decimals);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        counter.textContent = target.toFixed(decimals);
      }
    };

    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = "true";
            animateCounter(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const closeFaqItem = (item) => {
    const button = $("button", item);
    const panel = $(".faq-panel", item);

    item.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    panel.style.maxHeight = "0px";
  };

  const openFaqItem = (item) => {
    const button = $("button", item);
    const panel = $(".faq-panel", item);

    item.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    panel.style.maxHeight = `${panel.scrollHeight}px`;
  };

  $$("[data-accordion] .faq-item").forEach((item) => {
    const button = $("button", item);

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      $$("[data-accordion] .faq-item").forEach(closeFaqItem);

      if (!isOpen) {
        openFaqItem(item);
      }
    });
  });

  window.addEventListener(
    "resize",
    () => {
      $$(".faq-item.is-open").forEach((item) => {
        const panel = $(".faq-panel", item);
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      });
    },
    { passive: true }
  );

  const showToast = (message) => {
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => {
        toast.hidden = true;
        toast.textContent = "";
      }, 260);
    }, 3600);
  };

  $("[data-investor-login]").addEventListener("click", () => {
    closeMenu();
    showToast("Investor portal access is issued after portfolio activation. Contact support for credentials.");
  });

  const getFocusable = (container) =>
    $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter((element) => element.offsetParent !== null);

  const trapFocus = (event) => {
    if (event.key !== "Tab" || modal.hidden) {
      return;
    }

    const focusable = getFocusable(modal);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const resetApplicationModal = () => {
    form.hidden = false;
    modalCopy.hidden = false;
    successState.hidden = true;
    form.reset();
    setSelectedPlan("Starter", "100000");
    setAlert("");
    setLoading(false);
    fileName.textContent = "No file selected";
  };

  const openModal = () => {
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => modal.classList.add("is-open"));

    window.setTimeout(() => {
      const firstInput = $('input[name="name"]', form);
      if (firstInput) {
        firstInput.focus();
      }
    }, 120);
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");

    window.setTimeout(() => {
      modal.hidden = true;
      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    }, 260);
  };

  function setSelectedPlan(plan, amount) {
    if (!planSelect || !amountInput) {
      return;
    }

    planSelect.value = plan;

    const selectedOption = planSelect.selectedOptions[0];
    const selectedAmount = amount || (selectedOption ? selectedOption.dataset.amount : "100000");
    amountInput.value = selectedAmount;
  }

  $$("[data-open-application]").forEach((button) => {
    button.addEventListener("click", () => {
      resetApplicationModal();
      setSelectedPlan(button.dataset.plan || "Starter", button.dataset.amount || "100000");
      openModal();
    });
  });

  planSelect.addEventListener("change", () => {
    const selectedOption = planSelect.selectedOptions[0];
    amountInput.value = selectedOption ? selectedOption.dataset.amount : "";
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    fileName.textContent = file ? file.name : "No file selected";
  });

  $$("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("keydown", trapFocus);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeModal();
    }
  });

  const setAlert = (message, type = "") => {
    formAlert.textContent = message;
    formAlert.classList.remove("is-error", "is-success");

    if (type) {
      formAlert.classList.add(`is-${type}`);
    }
  };

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle("is-loading", isLoading);
  };

  const isConfiguredScriptUrl = () => {
    if (typeof SCRIPT_URL !== "string") {
      return false;
    }

    const url = SCRIPT_URL.trim();
    return Boolean(url) && url !== "https://script.google.com/macros/s/AKfycbwyTBOhe-PCa_bDhZv_FL3dj7Ix6qbdmiOplkm3itfMPLkOW29BO8iPekpDrrFes8bbEg/exec";
  };

  const submitToGoogleSheets = async (payload) => {

    const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams(payload)
    });

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Submission Failed");
    }

    return result;
};

  const buildSubmissionPayload = () => {

    const values = new FormData(form);

    return {
        name: values.get("name"),
        phone: values.get("phone"),
        email: values.get("email"),
        city: values.get("city"),
        occupation: values.get("occupation"),
        plan: values.get("plan"),
        amount: values.get("amount"),
        paymentScreenshotName: fileInput.files.length
            ? fileInput.files[0].name
            : "",
        status: "Pending"
    };
};

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setAlert("");

    if (!form.checkValidity()) {
      form.reportValidity();
      setAlert("Please complete all required fields before submitting.", "error");
      return;
    }

    if (!fileInput.files.length) {
      setAlert("Please upload your payment screenshot.", "error");
      fileInput.focus();
      return;
    }

    setLoading(true);
    setAlert("Sending application...", "success");

    try {
      const payload = buildSubmissionPayload();
      await submitToGoogleSheets(payload);
      form.hidden = true;
      modalCopy.hidden = true;
      successState.hidden = false;
      successState.focus();
    } catch (error) {
      setAlert(error.message || "Unable to submit application. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  });
})();
