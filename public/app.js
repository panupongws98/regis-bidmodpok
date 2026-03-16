const PRINT_COLUMNS_STORAGE_KEY = "drag-bike-print-columns";
const BRACKET_SELECTIONS_STORAGE_KEY = "drag-bike-bracket-selections-v1";
const TIMING_SHEET_STORAGE_KEY = "drag-bike-timing-sheet-v1";
const EVENT_BRAND = {
  name: "งานแข่งรถไฮสปีด บิดหมดปลอก",
  subtitle: "ณ สนามแข่งรถบ้านฉางเรสซิ่ง จ.ระยอง",
  fullName: "งานแข่งรถไฮสปีด บิดหมดปลอก ณ สนามแข่งรถบ้านฉางเรสซิ่ง จ.ระยอง",
  header: "ระบบจัดการผู้สมัครหน้างาน",
  logoPath: "/logo-bidmodplok.svg",
};
const EVENT_LOCKUP = EVENT_BRAND.fullName;
const PRINT_COLUMN_DEFINITIONS = [
  { id: "rowNumber", label: "ลำดับ", header: "ลำดับ" },
  { id: "entryCode", label: "รหัสรายการ", header: "รหัสรายการ" },
  { id: "applicantName", label: "ชื่อผู้สมัคร", header: "ชื่อผู้สมัคร" },
  { id: "raceClass", label: "รุ่นที่สมัคร", header: "รุ่นที่สมัคร" },
  { id: "vehicleCount", label: "จำนวนรถ", header: "จำนวนรถ" },
  { id: "bikeNumbers", label: "หมายเลขรถ", header: "หมายเลขรถ" },
  { id: "address", label: "ที่อยู่", header: "ที่อยู่" },
  { id: "contactPhone", label: "เบอร์โทรติดต่อ", header: "เบอร์โทรติดต่อ" },
  { id: "createdAt", label: "วันที่บันทึก", header: "วันที่บันทึก" },
  { id: "updatedAt", label: "วันที่แก้ไขล่าสุด", header: "วันที่แก้ไขล่าสุด" },
];
const DEFAULT_PRINT_COLUMN_IDS = [
  "rowNumber",
  "applicantName",
  "raceClass",
  "vehicleCount",
  "bikeNumbers",
  "address",
];
const SUMMARY_TEMPLATES = [
  {
    id: "name-only",
    label: "รายชื่อผู้สมัคร",
    description: "แสดงชื่อผู้สมัครอย่างเดียวตามแบบลิสต์รายชื่อ",
    livePrintLabel: "พิมพ์รายชื่อผู้สมัคร",
    blankPrintLabel: "พิมพ์รายชื่อเปล่า",
    liveHint: "ใช้ข้อมูลจริงจากผู้สมัครในรุ่นนี้สำหรับเช็กชื่อหรือประกาศรายชื่อ",
    blankHint: "เหมาะสำหรับปริ้นไว้เติมชื่อเพิ่มหรือขีดเช็กมือหน้างาน",
  },
  {
    id: "with-vehicle-numbers",
    label: "รายชื่อพร้อมรถและเลขรถ",
    description: "แสดงชื่อผู้สมัคร จำนวนรถ และหมายเลขรถในตารางเดียว",
    livePrintLabel: "พิมพ์รายชื่อพร้อมรถ",
    blankPrintLabel: "พิมพ์ฟอร์มชื่อและเลขรถเปล่า",
    liveHint: "ใช้ข้อมูลจริงสำหรับเช็กทีม จำนวนรถ และหมายเลขรถได้จากกระดาษใบเดียว",
    blankHint: "เหมาะสำหรับปริ้นไว้กรอกชื่อทีม จำนวนรถ และเลขรถเพิ่มด้วยมือ",
  },
  {
    id: "timing-sheet",
    label: "ตารางจับเวลา",
    description: "สำหรับจดเวลารอบ 1 รอบ 2 เวลาที่ดีที่สุด และอันดับ",
    livePrintLabel: "พิมพ์ตารางจับเวลา",
    blankPrintLabel: "พิมพ์ตารางจับเวลาเปล่า",
    liveHint: "ใช้ข้อมูลทีมและหมายเลขรถจริงเพื่อเริ่มจับเวลาได้ทันที",
    blankHint: "เหมาะสำหรับเตรียมกระดาษสำรองไว้เขียนเวลาเองหน้างาน",
  },
  {
    id: "bracket-12",
    label: "สายประกบรุ่นแข่ง",
    description: "กำหนดช่องรอบแรกเอง แล้วเลือกรอบถัดไปจากผู้ชนะของคู่ก่อนหน้า",
    livePrintLabel: "พิมพ์สายประกบรุ่น",
    blankPrintLabel: "พิมพ์สายประกบเปล่า",
    liveHint: "ใช้พิมพ์สายประกบที่จัดไว้ในตัวอย่างตอนนี้พร้อมรายชื่อผู้ชนะในแต่ละช่อง",
    blankHint: "เหมาะสำหรับปริ้นผังว่างไว้เขียนจับคู่และจดผลการแข่งขันด้วยมือ",
  },
];
const DEFAULT_SUMMARY_TEMPLATE_ID = "with-vehicle-numbers";
const SUMMARY_MINIMUM_ROWS = {
  "name-only": 24,
  "with-vehicle-numbers": 24,
  "timing-sheet": 22,
};
const SUMMARY_ROWS_PER_PAGE = {
  "name-only": 24,
  "with-vehicle-numbers": 24,
  "timing-sheet": 22,
};
const REQUIRED_TEAM_CONTACT_FIELDS = [
  { name: "applicantName", label: "ชื่อผู้สมัคร" },
  { name: "contactPhone", label: "เบอร์โทรติดต่อ" },
  { name: "address", label: "ที่อยู่" },
];
const currentPage = document.body.dataset.page || "registration";
const DEFAULT_STATUS_MESSAGES = {
  registration: "พร้อมเปิดรับผู้สมัคร",
  classes: "พร้อมจัดการรุ่นแข่งขัน",
  applicants: "พร้อมแสดงรายชื่อผู้สมัคร",
  summary: "พร้อมสร้างหน้าสรุปและพิมพ์เอกสาร",
};
const REGISTRATIONS_PER_PAGE = 5;

function getPrintColumnDefinition(id) {
  return PRINT_COLUMN_DEFINITIONS.find((definition) => definition.id === id);
}

function createDefaultPrintColumns() {
  return PRINT_COLUMN_DEFINITIONS.map((definition) => {
    return {
      id: definition.id,
      enabled: DEFAULT_PRINT_COLUMN_IDS.includes(definition.id),
    };
  });
}

function sanitizePrintColumns(input) {
  const printColumns = [];
  const seen = new Set();

  if (Array.isArray(input)) {
    for (const item of input) {
      const id = typeof item === "string" ? item : item?.id;
      const definition = getPrintColumnDefinition(id);

      if (!definition || seen.has(definition.id)) {
        continue;
      }

      const enabled =
        typeof item === "object" && item !== null && "enabled" in item
          ? Boolean(item.enabled)
          : DEFAULT_PRINT_COLUMN_IDS.includes(definition.id);

      printColumns.push({ id: definition.id, enabled });
      seen.add(definition.id);
    }
  }

  for (const definition of PRINT_COLUMN_DEFINITIONS) {
    if (seen.has(definition.id)) {
      continue;
    }

    printColumns.push({
      id: definition.id,
      enabled: DEFAULT_PRINT_COLUMN_IDS.includes(definition.id),
    });
  }

  return printColumns;
}

function loadPrintColumnsPreference() {
  try {
    const rawValue = window.localStorage.getItem(PRINT_COLUMNS_STORAGE_KEY);
    if (!rawValue) {
      return createDefaultPrintColumns();
    }

    return sanitizePrintColumns(JSON.parse(rawValue));
  } catch {
    return createDefaultPrintColumns();
  }
}

function savePrintColumnsPreference() {
  try {
    window.localStorage.setItem(
      PRINT_COLUMNS_STORAGE_KEY,
      JSON.stringify(state.printColumns),
    );
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}
function loadBracketSelectionsPreference() {
  try {
    const rawValue = window.localStorage.getItem(BRACKET_SELECTIONS_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveBracketSelectionsPreference() {
  try {
    window.localStorage.setItem(
      BRACKET_SELECTIONS_STORAGE_KEY,
      JSON.stringify(state.bracketSelections),
    );
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}

function loadTimingSheetEntriesPreference() {
  try {
    const rawValue = window.localStorage.getItem(TIMING_SHEET_STORAGE_KEY);
    if (!rawValue) {
      return {};
    }

    const parsed = JSON.parse(rawValue);
    return sanitizeTimingSheetEntriesPreference(parsed);
  } catch {
    return {};
  }
}

function saveTimingSheetEntriesPreference() {
  try {
    window.localStorage.setItem(
      TIMING_SHEET_STORAGE_KEY,
      JSON.stringify(state.timingSheetEntries),
    );
  } catch {
    // Ignore storage failures and keep the UI usable.
  }
}

const state = {
  classes: [],
  registrations: [],
  registrationPage: 1,
  maxVehicles: 20,
  editingId: null,
  editingClassName: null,
  printColumns: loadPrintColumnsPreference(),
  selectedSummaryClass: "",
  selectedBlankBracketSize: "16",
  selectedSummaryTemplate: DEFAULT_SUMMARY_TEMPLATE_ID,
  bracketSelections: loadBracketSelectionsPreference(),
  timingSheetEntries: loadTimingSheetEntriesPreference(),
};

const elements = {
  addClassEntryButton: document.querySelector("#addClassEntryButton"),
  applicantCount: document.querySelector("#applicantCount"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  classEntriesContainer: document.querySelector("#classEntriesContainer"),
  classCountBadge: document.querySelector("#classCountBadge"),
  classForm: document.querySelector("#classForm"),
  classList: document.querySelector("#classList"),
  applicantEditModal: document.querySelector("#applicantEditModal"),
  closeApplicantEditModalButton: document.querySelector("#closeApplicantEditModalButton"),
  closeApplicantEditModalButtonSecondary: document.querySelector("#closeApplicantEditModalButtonSecondary"),
  closePrintModalButton: document.querySelector("#closePrintModalButton"),
  closePrintModalButtonSecondary: document.querySelector("#closePrintModalButtonSecondary"),
  editModalStatusBanner: document.querySelector("#editModalStatusBanner"),
  formModeBadge: document.querySelector("#formModeBadge"),
  newClassInput: document.querySelector("#newClassInput"),
  openPrintModalButton: document.querySelector("#openPrintModalButton"),
  printAllButton: document.querySelector("#printAllButton"),
  printColumnList: document.querySelector("#printColumnList"),
  printColumnSummary: document.querySelector("#printColumnSummary"),
  printModal: document.querySelector("#printModal"),
  printModalStatus: document.querySelector("#printModalStatus"),
  printBlankSummaryButton: document.querySelector("#printBlankSummaryButton"),
  printSummaryButton: document.querySelector("#printSummaryButton"),
  registrationForm: document.querySelector("#registrationForm"),
  registrationList: document.querySelector("#registrationList"),
  registrationPagination: document.querySelector("#registrationPagination"),
  resetPrintColumnsButton: document.querySelector("#resetPrintColumnsButton"),
  searchInput: document.querySelector("#searchInput"),
  searchResultsMeta: document.querySelector("#searchResultsMeta"),
  statusBanner: document.querySelector("#statusBanner"),
  submitButton: document.querySelector("#submitButton"),
  summaryActionCopy: document.querySelector("#summaryActionCopy"),
  summaryActionHint: document.querySelector("#summaryActionHint"),
  summaryActionSummary: document.querySelector("#summaryActionSummary"),
  summaryActionTitle: document.querySelector("#summaryActionTitle"),
  summaryBlankBracketSizeField: document.querySelector("#summaryBlankBracketSizeField"),
  summaryBlankBracketSizeSelect: document.querySelector("#summaryBlankBracketSizeSelect"),
  summaryClassSelect: document.querySelector("#summaryClassSelect"),
  summaryPreview: document.querySelector("#summaryPreview"),
  summaryPreviewMeta: document.querySelector("#summaryPreviewMeta"),
  summaryTemplateList: document.querySelector("#summaryTemplateList"),
  vehicleCountStat: document.querySelector("#vehicleCountStat"),
};

function hasElement(key) {
  return Boolean(elements[key]);
}

function getDefaultStatusMessage() {
  return DEFAULT_STATUS_MESSAGES[currentPage] || DEFAULT_STATUS_MESSAGES.registration;
}

function getRequestedRegistrationId() {
  const registrationId = new URLSearchParams(window.location.search).get("edit");
  return registrationId ? registrationId.trim() : "";
}

function clearRequestedRegistrationId() {
  if (currentPage !== "registration" && currentPage !== "applicants") {
    return;
  }

  const url = new URL(window.location.href);
  if (!url.searchParams.has("edit")) {
    return;
  }

  url.searchParams.delete("edit");
  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function openRegistrationEditor(registrationId) {
  if (currentPage === "applicants" && hasElement("applicantEditModal") && hasElement("registrationForm")) {
    const registration = state.registrations.find((item) => item.id === registrationId);
    if (!registration) {
      setStatus("ไม่พบข้อมูลผู้สมัครที่ต้องการแก้ไข", "warning");
      return;
    }

    openApplicantEditModal(registration);
    return;
  }

  window.location.assign(`/index.html?edit=${encodeURIComponent(registrationId)}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getEventLogoUrl() {
  return new URL(EVENT_BRAND.logoPath, window.location.origin).toString();
}

function getStylesheetUrl() {
  return new URL("/styles.css", window.location.origin).toString();
}

function buildPrintBrandBanner(modeLabel) {
  return `
    <div class="print-banner">
      <div class="print-banner-copy">
        <img
          class="print-logo"
          src="${escapeHtml(getEventLogoUrl())}"
          alt="${escapeHtml(EVENT_BRAND.fullName)}"
        />
        <div class="print-brand-text">
          <p class="print-kicker">${escapeHtml(EVENT_BRAND.header)}</p>
          <div class="print-lockup">${escapeHtml(EVENT_BRAND.name)}</div>
          <div class="print-subtitle">${escapeHtml(EVENT_BRAND.subtitle)}</div>
        </div>
      </div>
      <div class="print-chip">${escapeHtml(modeLabel)}</div>
    </div>
  `;
}

function buildSummarySheetBrand() {
  return `
    <div class="summary-sheet-brand">
      <img
        class="summary-sheet-brand-logo"
        src="${escapeHtml(getEventLogoUrl())}"
        alt="${escapeHtml(EVENT_BRAND.fullName)}"
      />
      <div class="summary-sheet-brand-copy">
        <div class="summary-sheet-brand-name">${escapeHtml(EVENT_BRAND.name)}</div>
        <div class="summary-sheet-brand-subtitle">${escapeHtml(EVENT_BRAND.subtitle)}</div>
      </div>
    </div>
  `;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getRawRegistrationEntries(registration) {
  if (Array.isArray(registration?.entries) && registration.entries.length > 0) {
    return registration.entries;
  }

  if (
    registration &&
    (registration.raceClass ||
      registration.vehicleCount ||
      Array.isArray(registration.bikeNumbers))
  ) {
    return [
      {
        raceClass: registration.raceClass,
        vehicleCount: registration.vehicleCount,
        bikeNumbers: registration.bikeNumbers,
      },
    ];
  }

  return [];
}

function normalizeVehicleCount(value, fallbackCount = 1) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return clampVehicleCount(fallbackCount);
  }

  return clampVehicleCount(parsed);
}

function normalizeRegistrationEntry(entry, index = 0, registrationId = "") {
  const rawBikeNumbers = Array.isArray(entry?.bikeNumbers)
    ? entry.bikeNumbers.map((value) => String(value ?? ""))
    : [];
  const fallbackCount = rawBikeNumbers.length > 0 ? rawBikeNumbers.length : 1;
  const vehicleCount = normalizeVehicleCount(entry?.vehicleCount, fallbackCount);
  const bikeNumbers = Array.from({ length: vehicleCount }, (_, bikeIndex) => {
    return rawBikeNumbers[bikeIndex] ?? "";
  });

  return {
    id: entry?.id || `${registrationId || "registration"}-entry-${index + 1}`,
    raceClass: String(entry?.raceClass || ""),
    vehicleCount,
    bikeNumbers,
  };
}

function normalizeRegistration(registration) {
  const normalized = registration && typeof registration === "object" ? registration : {};
  const registrationId = String(normalized.id || "");
  const entries = getRawRegistrationEntries(normalized)
    .map((entry, index) => normalizeRegistrationEntry(entry, index, registrationId))
    .filter((entry) => entry.raceClass);

  return {
    ...normalized,
    id: registrationId,
    applicantName: String(normalized.applicantName || ""),
    address: String(normalized.address || ""),
    contactPhone: String(normalized.contactPhone || ""),
    entries,
  };
}

function buildRegistrationViewModel(registration) {
  const normalized = normalizeRegistration(registration);
  const allBikeNumbers = normalized.entries.flatMap((entry) => {
    return entry.bikeNumbers.map((value) => value.trim()).filter(Boolean);
  });
  const totalVehicleCount = normalized.entries.reduce((total, entry) => {
    return total + entry.vehicleCount;
  }, 0);

  return {
    ...normalized,
    allBikeNumbers,
    totalVehicleCount,
  };
}

function createEmptyRegistrationEntry() {
  return {
    raceClass: "",
    vehicleCount: 1,
    bikeNumbers: [""],
  };
}

function getRegistrationClassNames(registration) {
  return (registration.entries || [])
    .map((entry) => String(entry.raceClass || "").trim())
    .filter(Boolean);
}

function getRegistrationAllBikeNumbers(registration) {
  if (Array.isArray(registration.allBikeNumbers)) {
    return registration.allBikeNumbers;
  }

  return (registration.entries || []).flatMap((entry) => {
    return (entry.bikeNumbers || []).map((value) => value.trim()).filter(Boolean);
  });
}

function getRegistrationTotalVehicleCount(registration) {
  if (Number.isInteger(registration.totalVehicleCount)) {
    return registration.totalVehicleCount;
  }

  return (registration.entries || []).reduce((total, entry) => {
    return total + Number(entry.vehicleCount || 0);
  }, 0);
}

function buildBikeNumberRegistry(excludeRegistrationId = state.editingId) {
  const registry = new Map();

  for (const registration of state.registrations) {
    if (registration.id === excludeRegistrationId) {
      continue;
    }

    const applicantName = String(registration.applicantName || "").trim() || "ทีมไม่ระบุชื่อ";
    for (const bikeNumber of getRegistrationAllBikeNumbers(registration)) {
      const normalizedBikeNumber = normalizeText(bikeNumber);
      if (!normalizedBikeNumber) {
        continue;
      }

      const existingWarning = registry.get(normalizedBikeNumber) || {
        bikeNumber: bikeNumber.trim(),
        applicantNames: [],
      };
      if (!existingWarning.applicantNames.includes(applicantName)) {
        existingWarning.applicantNames.push(applicantName);
      }
      registry.set(normalizedBikeNumber, existingWarning);
    }
  }

  return registry;
}

function getDuplicateBikeNumberWarnings(entries, options = {}) {
  const registry = buildBikeNumberRegistry(options.excludeRegistrationId);

  return entries.map((entry) => {
    const warnings = [];
    const seenBikeNumbers = new Set();

    for (const bikeNumber of entry.bikeNumbers || []) {
      const normalizedBikeNumber = normalizeText(bikeNumber);
      if (!normalizedBikeNumber || seenBikeNumbers.has(normalizedBikeNumber)) {
        continue;
      }

      const warning = registry.get(normalizedBikeNumber);
      if (!warning) {
        continue;
      }

      warnings.push({
        bikeNumber: bikeNumber.trim() || warning.bikeNumber,
        applicantNames: [...warning.applicantNames],
      });
      seenBikeNumbers.add(normalizedBikeNumber);
    }

    return warnings;
  });
}

function formatBikeNumberWarnings(warnings, maxItems = 3) {
  if (!Array.isArray(warnings) || warnings.length === 0) {
    return "";
  }

  const visibleWarnings = warnings.slice(0, maxItems).map((warning) => {
    const visibleApplicantNames = warning.applicantNames
      .slice(0, 2)
      .map((name) => shortenText(name, 28));
    const extraApplicantCount = Math.max(0, warning.applicantNames.length - visibleApplicantNames.length);
    const applicantLabel = visibleApplicantNames.length > 0
      ? `${visibleApplicantNames.join(", ")}${extraApplicantCount > 0 ? ` และอีก ${extraApplicantCount} ทีม` : ""}`
      : "";

    return applicantLabel
      ? `${warning.bikeNumber} (${applicantLabel})`
      : warning.bikeNumber;
  });

  const extraWarningCount = Math.max(0, warnings.length - visibleWarnings.length);
  return `${visibleWarnings.join(", ")}${extraWarningCount > 0 ? ` และอีก ${extraWarningCount} เลข` : ""}`;
}

function shortenText(value, maxLength) {
  const text = String(value || "").trim();
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.error || "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์");
  }

  return payload;
}

function applyStatusState(target, message, tone) {
  if (!target) {
    return;
  }

  target.textContent = message;
  if (tone === "success") {
    target.removeAttribute("data-tone");
    return;
  }

  target.setAttribute("data-tone", tone);
}

function setStatus(message, tone = "success") {
  applyStatusState(elements.statusBanner, message, tone);
  applyStatusState(elements.editModalStatusBanner, message, tone);
  applyStatusState(elements.printModalStatus, message, tone);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isEditableTarget(target) {
  return target instanceof HTMLElement && (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

function scrollRegistrationFormIntoView() {
  if (!hasElement("registrationForm")) {
    return;
  }

  if (currentPage === "applicants" && hasElement("applicantEditModal") && !elements.applicantEditModal.hidden) {
    const modalPanel = elements.registrationForm.closest(".modal-panel");
    if (modalPanel) {
      modalPanel.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
      return;
    }
  }

  elements.registrationForm.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

function focusApplicantNameInput(selectText = false) {
  if (!hasElement("registrationForm")) {
    return;
  }

  const applicantNameInput = elements.registrationForm.elements.namedItem("applicantName");
  if (!(applicantNameInput instanceof HTMLElement)) {
    return;
  }

  applicantNameInput.focus({ preventScroll: true });
  if (selectText && typeof applicantNameInput.select === "function") {
    applicantNameInput.select();
  }
}

function getRegistrationFormField(fieldName) {
  if (!hasElement("registrationForm")) {
    return null;
  }

  return elements.registrationForm.elements.namedItem(fieldName);
}

function validateTeamContactFields(options = {}) {
  const { showValidationMessage = false } = options;
  if (!hasElement("registrationForm")) {
    return true;
  }

  let hasInvalidField = false;

  for (const field of REQUIRED_TEAM_CONTACT_FIELDS) {
    const input = getRegistrationFormField(field.name);
    if (
      !(
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement ||
        input instanceof HTMLSelectElement
      )
    ) {
      continue;
    }

    const isBlank = !input.value.trim();
    input.setCustomValidity(isBlank ? `กรุณากรอก${field.label}` : "");
    hasInvalidField = hasInvalidField || isBlank;
  }

  if (hasInvalidField && showValidationMessage) {
    elements.registrationForm.reportValidity();
    return false;
  }

  return !hasInvalidField;
}

function resetTeamContactFieldValidation() {
  for (const field of REQUIRED_TEAM_CONTACT_FIELDS) {
    const input = getRegistrationFormField(field.name);
    if (
      input instanceof HTMLInputElement ||
      input instanceof HTMLTextAreaElement ||
      input instanceof HTMLSelectElement
    ) {
      input.setCustomValidity("");
    }
  }
}

function focusClassEntryField(entryIndex, fieldName) {
  if (!hasElement("classEntriesContainer")) {
    return;
  }

  const selector = `[data-entry-index="${entryIndex}"] [data-entry-field="${fieldName}"]`;
  const field = elements.classEntriesContainer.querySelector(selector);
  if (!(field instanceof HTMLElement)) {
    return;
  }

  field.focus({ preventScroll: true });
  if (typeof field.select === "function") {
    field.select();
  }
}

function renderSearchResultsMeta(totalFiltered, visibleCount) {
  if (!hasElement("searchResultsMeta")) {
    return;
  }

  const totalRegistrations = state.registrations.length;
  const searchTerm = elements.searchInput?.value.trim() || "";

  if (searchTerm) {
    const safeSearchTerm = escapeHtml(searchTerm);
    if (totalFiltered > 0) {
      elements.searchResultsMeta.innerHTML = `
        <strong>พบ ${totalFiltered} รายการ</strong>
        <span>จากคำค้นหา "${safeSearchTerm}" และกำลังแสดง ${visibleCount} รายการในหน้านี้</span>
      `;
      return;
    }

    elements.searchResultsMeta.innerHTML = `
      <strong>ไม่พบรายการที่ตรงคำค้นหา</strong>
      <span>ลองค้นด้วยชื่อทีม รุ่นแข่ง หรือหมายเลขรถจากทั้งหมด ${totalRegistrations} รายการ</span>
    `;
    return;
  }

  if (totalRegistrations > 0) {
    elements.searchResultsMeta.innerHTML = `
      <strong>ทั้งหมด ${totalRegistrations} รายการ</strong>
      <span>กำลังแสดง ${visibleCount} รายการในหน้านี้ พร้อมเปิดแก้ไขหรือพิมพ์ต่อได้ทันที</span>
    `;
    return;
  }

  elements.searchResultsMeta.innerHTML = `
    <strong>ยังไม่มีข้อมูลผู้สมัคร</strong>
    <span>เริ่มต้นที่หน้าโต๊ะรับสมัคร แล้วรายการจะถูกส่งมาที่หน้านี้อัตโนมัติ</span>
  `;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function updateSummaryStats() {
  if (hasElement("applicantCount")) {
    elements.applicantCount.textContent = state.registrations.length.toString();
  }

  const totalVehicles = state.registrations.reduce((total, item) => {
    return total + getRegistrationTotalVehicleCount(item);
  }, 0);

  if (hasElement("vehicleCountStat")) {
    elements.vehicleCountStat.textContent = totalVehicles.toString();
  }
}

function sortRegistrationsForSummary(registrations) {
  return [...registrations].sort((left, right) => {
    return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
  });
}

function findMatchingClassName(className) {
  return state.classes.find((item) => normalizeText(item) === normalizeText(className)) || "";
}

function normalizeDraftRegistrationEntry(entry) {
  const rawBikeNumbers = Array.isArray(entry?.bikeNumbers)
    ? entry.bikeNumbers.map((value) => String(value ?? ""))
    : [];
  const fallbackCount = rawBikeNumbers.length > 0 ? rawBikeNumbers.length : 1;
  const vehicleCount = normalizeVehicleCount(entry?.vehicleCount, fallbackCount);
  const bikeNumbers = Array.from({ length: vehicleCount }, (_, bikeIndex) => {
    return rawBikeNumbers[bikeIndex] ?? "";
  });

  return {
    raceClass: findMatchingClassName(entry?.raceClass) || String(entry?.raceClass || ""),
    vehicleCount,
    bikeNumbers,
  };
}

function collectRegistrationEntries() {
  if (!hasElement("classEntriesContainer")) {
    return [];
  }

  const entryCards = [
    ...elements.classEntriesContainer.querySelectorAll(".class-entry-card[data-entry-index]"),
  ];
  return entryCards.map((card) => {
    const raceClass = card.querySelector("[data-entry-field='raceClass']")?.value || "";
    const vehicleCount = card.querySelector("[data-entry-field='vehicleCount']")?.value || 1;
    const bikeNumbers = [...card.querySelectorAll("[data-entry-field='bikeNumber']")].map(
      (input) => input.value,
    );

    return normalizeDraftRegistrationEntry({ raceClass, vehicleCount, bikeNumbers });
  });
}

function buildClassEntryOptions(selectedValue) {
  const normalizedSelectedValue = normalizeText(selectedValue);
  const options = state.classes
    .map((className) => {
      const isSelected = normalizeText(className) === normalizedSelectedValue;
      return `<option value="${escapeHtml(className)}"${isSelected ? " selected" : ""}>${escapeHtml(className)}</option>`;
    })
    .join("");

  return `<option value="">เลือกรุ่นแข่งขัน</option>${options}`;
}

function renderClassEntryBikeInputs(entry, entryIndex) {
  return Array.from({ length: entry.vehicleCount }, (_, bikeIndex) => {
    const value = entry.bikeNumbers[bikeIndex] || "";
    return `
      <div class="bike-input">
        <label for="entry-${entryIndex + 1}-bike-${bikeIndex + 1}">คันที่ ${bikeIndex + 1}</label>
        <input
          id="entry-${entryIndex + 1}-bike-${bikeIndex + 1}"
          data-entry-field="bikeNumber"
          type="text"
          maxlength="20"
          placeholder="หมายเลขรถ"
          value="${escapeHtml(value)}"
          required
        />
      </div>
    `;
  }).join("");
}

function renderClassEntries(entries = [createEmptyRegistrationEntry()]) {
  if (!hasElement("classEntriesContainer")) {
    return;
  }

  const normalizedEntries = (entries.length > 0 ? entries : [createEmptyRegistrationEntry()])
    .map((entry) => normalizeDraftRegistrationEntry(entry));
  const duplicateBikeNumberWarnings = getDuplicateBikeNumberWarnings(normalizedEntries);

  elements.classEntriesContainer.innerHTML = normalizedEntries
    .map((entry, index) => {
      const entryWarnings = duplicateBikeNumberWarnings[index] || [];
      const warningSummary = formatBikeNumberWarnings(entryWarnings, 4);
      const warningMarkup = entryWarnings.length > 0
        ? `
          <div class="duplicate-number-warning" role="note">
            <strong>เตือน: เลขรถซ้ำกับทีมอื่น แต่ยังบันทึกได้</strong>
            <span>พบเลขซ้ำ: ${escapeHtml(warningSummary)}</span>
          </div>
        `
        : "";

      return `
        <section class="class-entry-card" data-entry-index="${index}">
          <div class="class-entry-card-header">
            <div class="class-entry-card-copy">
              <strong>รุ่นที่สมัคร ${index + 1}</strong>
              <span>กำหนดรุ่น จำนวนรถ และหมายเลขรถแยกกันในแต่ละรุ่น</span>
            </div>
            <button
              class="button button-danger button-small"
              type="button"
              data-action="remove-class-entry"
              data-entry-index="${index}"
              ${normalizedEntries.length === 1 ? "disabled" : ""}
            >
              ลบรุ่น
            </button>
          </div>

          <div class="field-grid class-entry-grid">
            <label class="field">
              <span>รุ่นที่สมัคร</span>
              <select data-entry-field="raceClass" required>
                ${buildClassEntryOptions(entry.raceClass)}
              </select>
            </label>

            <label class="field">
              <span>จำนวนรถที่จะลงแข่ง</span>
              <input
                data-entry-field="vehicleCount"
                type="number"
                min="1"
                max="${state.maxVehicles}"
                value="${entry.vehicleCount}"
                required
              />
            </label>
          </div>

          <div class="field">
            <div class="field-heading">
              <span>หมายเลขรถของรุ่นนี้</span>
              <small>ระบบจะแจ้งเตือนถ้าเลขรถซ้ำกับทีมอื่น แต่ยังบันทึกได้</small>
            </div>
            <div class="bike-grid class-entry-bike-grid">
              ${renderClassEntryBikeInputs(entry, index)}
            </div>
            ${warningMarkup}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderClassOptions() {
  if (!hasElement("classEntriesContainer")) {
    return;
  }

  const currentEntries = collectRegistrationEntries();
  renderClassEntries(currentEntries.length > 0 ? currentEntries : [createEmptyRegistrationEntry()]);
}

function getClassUsageCount(className) {
  return state.registrations.reduce((count, item) => {
    return count + (item.entries || []).filter((entry) => {
      return normalizeText(entry.raceClass) === normalizeText(className);
    }).length;
  }, 0);
}

function renderClassList() {
  if (!hasElement("classList") || !hasElement("classCountBadge")) {
    return;
  }

  elements.classCountBadge.textContent = `${state.classes.length} รุ่น`;

  if (state.classes.length === 0) {
    elements.classList.innerHTML = `
      <div class="class-empty-state">
        ยังไม่มีรุ่นที่เปิดรับสมัครในระบบ
      </div>
    `;
    return;
  }

  elements.classList.innerHTML = state.classes
    .map((className) => {
      const usageCount = getClassUsageCount(className);
      const usageLabel =
        usageCount > 0
          ? `ใช้งานอยู่ ${usageCount} รายการสมัคร`
          : "ยังไม่มีผู้สมัครในรุ่นนี้";
      const isEditing = normalizeText(state.editingClassName) === normalizeText(className);

      if (isEditing) {
        return `
          <form class="class-row class-row-editing" data-class="${escapeHtml(className)}">
            <div class="class-row-main">
              <input
                class="class-inline-input"
                name="classNameEdit"
                type="text"
                maxlength="80"
                value="${escapeHtml(className)}"
                required
              />
              <span class="class-meta">${escapeHtml(usageLabel)}</span>
            </div>
            <div class="class-row-actions">
              <button class="button button-primary button-small" type="submit">บันทึก</button>
              <button
                class="button button-secondary button-small"
                type="button"
                data-action="cancel-class-edit"
                data-class="${escapeHtml(className)}"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        `;
      }

      return `
        <div class="class-row">
          <div class="class-row-main">
            <strong class="class-row-name">${escapeHtml(className)}</strong>
            <span class="class-meta">${escapeHtml(usageLabel)}</span>
          </div>
          <div class="class-row-actions">
            <button
              class="button button-secondary button-small"
              type="button"
              data-action="edit-class"
              data-class="${escapeHtml(className)}"
            >
              แก้ไข
            </button>
            <button
              class="button button-danger button-small"
              type="button"
              data-action="remove-class"
              data-class="${escapeHtml(className)}"
            >
              ลบ
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  if (state.editingClassName) {
    const input = elements.classList.querySelector(".class-inline-input");
    if (input) {
      input.focus();
      input.select();
    }
  }
}

function getPrintColumnsInUse() {
  return state.printColumns.filter((item) => item.enabled);
}

function renderPrintColumnConfigurator() {
  if (!hasElement("printColumnSummary") || !hasElement("printColumnList")) {
    return;
  }

  const activeColumns = getPrintColumnsInUse()
    .map((item) => getPrintColumnDefinition(item.id))
    .filter(Boolean);

  elements.printColumnSummary.textContent = activeColumns.length > 0
    ? `คอลัมน์ที่จะพิมพ์: ${activeColumns.map((item) => item.label).join(" | ")}`
    : "ยังไม่ได้เลือกคอลัมน์สำหรับพิมพ์";

  elements.printColumnList.innerHTML = state.printColumns
    .map((item, index) => {
      const definition = getPrintColumnDefinition(item.id);
      if (!definition) {
        return "";
      }

      const moveUpDisabled = index === 0 ? "disabled" : "";
      const moveDownDisabled = index === state.printColumns.length - 1 ? "disabled" : "";
      const disabledState = item.enabled ? "false" : "true";

      return `
        <div class="print-column-row" data-disabled="${disabledState}">
          <label class="print-column-toggle">
            <input
              type="checkbox"
              data-action="toggle-print-column"
              data-id="${definition.id}"
              ${item.enabled ? "checked" : ""}
            />
            <span>${escapeHtml(definition.label)}</span>
          </label>
          <div class="print-column-actions">
            <button
              class="button button-secondary button-small"
              type="button"
              data-action="move-print-column"
              data-id="${definition.id}"
              data-direction="up"
              ${moveUpDisabled}
            >
              ขึ้น
            </button>
            <button
              class="button button-secondary button-small"
              type="button"
              data-action="move-print-column"
              data-id="${definition.id}"
              data-direction="down"
              ${moveDownDisabled}
            >
              ลง
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function togglePrintColumn(columnId, enabled) {
  const target = state.printColumns.find((item) => item.id === columnId);
  if (!target) {
    return;
  }

  const enabledCount = state.printColumns.filter((item) => item.enabled).length;
  if (!enabled && target.enabled && enabledCount === 1) {
    setStatus("ต้องเลือกอย่างน้อย 1 คอลัมน์สำหรับพิมพ์รายการ", "warning");
    renderPrintColumnConfigurator();
    return;
  }

  target.enabled = enabled;
  savePrintColumnsPreference();
  renderPrintColumnConfigurator();
}

function movePrintColumn(columnId, direction) {
  const currentIndex = state.printColumns.findIndex((item) => item.id === columnId);
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (nextIndex < 0 || nextIndex >= state.printColumns.length) {
    return;
  }

  const [column] = state.printColumns.splice(currentIndex, 1);
  state.printColumns.splice(nextIndex, 0, column);
  savePrintColumnsPreference();
  renderPrintColumnConfigurator();
}

function resetPrintColumns() {
  state.printColumns = createDefaultPrintColumns();
  savePrintColumnsPreference();
  renderPrintColumnConfigurator();
  setStatus("รีเซ็ตคอลัมน์สำหรับพิมพ์กลับเป็นค่าเริ่มต้นแล้ว");
}

function getPrintModalReadyMessage() {
  return "พร้อมพิมพ์รายชื่อผู้สมัครรวม";
}

function getApplicantEditModalReadyMessage() {
  return "พร้อมแก้ไขข้อมูลผู้สมัครจากหน้ารายชื่อ";
}

function openApplicantEditModal(registration) {
  if (!hasElement("applicantEditModal") || !hasElement("registrationForm")) {
    return;
  }

  applyStatusState(elements.editModalStatusBanner, getApplicantEditModalReadyMessage(), "success");
  elements.applicantEditModal.hidden = false;
  document.body.classList.add("modal-open");
  fillForm(registration);
}

function closeApplicantEditModal(restoreFocus = false) {
  if (!hasElement("applicantEditModal") || elements.applicantEditModal.hidden) {
    return;
  }

  elements.applicantEditModal.hidden = true;
  document.body.classList.remove("modal-open");
  applyStatusState(elements.editModalStatusBanner, getApplicantEditModalReadyMessage(), "success");

  if (restoreFocus) {
    elements.searchInput?.focus();
  }
}

function openPrintModal() {
  if (!hasElement("printModal")) {
    return;
  }

  renderPrintColumnConfigurator();
  applyStatusState(elements.printModalStatus, getPrintModalReadyMessage(), "success");
  elements.printModal.hidden = false;
  document.body.classList.add("modal-open");
  elements.closePrintModalButton?.focus();
}

function closePrintModal(restoreFocus = true) {
  if (!hasElement("printModal") || elements.printModal.hidden) {
    return;
  }

  elements.printModal.hidden = true;
  document.body.classList.remove("modal-open");
  applyStatusState(elements.printModalStatus, getPrintModalReadyMessage(), "success");
  if (restoreFocus) {
    elements.openPrintModalButton?.focus();
  }
}

function syncSummarySelection() {
  if (state.classes.length === 0) {
    state.selectedSummaryClass = "";
    return;
  }

  if (!findMatchingClassName(state.selectedSummaryClass)) {
    state.selectedSummaryClass = state.classes[0];
  }
}

function renderSummaryClassOptions() {
  if (!hasElement("summaryClassSelect")) {
    return;
  }

  if (state.classes.length === 0) {
    elements.summaryClassSelect.innerHTML = `<option value="">ยังไม่มีรุ่นแข่งขัน</option>`;
    elements.summaryClassSelect.value = "";
    return;
  }

  const options = state.classes
    .map((className) => {
      return `<option value="${escapeHtml(className)}">${escapeHtml(className)}</option>`;
    })
    .join("");
  elements.summaryClassSelect.innerHTML = options;
  elements.summaryClassSelect.value = state.selectedSummaryClass;
}

function renderSummaryTemplates() {
  if (!hasElement("summaryTemplateList")) {
    return;
  }

  elements.summaryTemplateList.innerHTML = SUMMARY_TEMPLATES.map((template, index) => {
    const isActive = template.id === state.selectedSummaryTemplate;
    return `
      <button
        class="summary-template-button ${isActive ? "is-active" : ""}"
        type="button"
        data-template-id="${template.id}"
        aria-pressed="${isActive}"
      >
        <small class="summary-template-eyebrow">แบบพิมพ์ ${index + 1}</small>
        <strong>${escapeHtml(template.label)}</strong>
        <span>${escapeHtml(template.description)}</span>
        <em class="summary-template-state">${isActive ? "กำลังเลือกอยู่" : "กดเพื่อดูตัวอย่าง"}</em>
      </button>
    `;
  }).join("");

  renderBlankBracketSizeControl();
}

function getRegistrationsForClass(className) {
  const entries = state.registrations.flatMap((registration) => {
    return (registration.entries || [])
      .filter((entry) => normalizeText(entry.raceClass) === normalizeText(className))
      .map((entry, index) => {
        return {
          ...entry,
          id: entry.id || `${registration.id}-entry-${index + 1}`,
          registrationId: registration.id,
          applicantName: registration.applicantName,
          address: registration.address,
          contactPhone: registration.contactPhone,
          createdAt: registration.createdAt,
          updatedAt: registration.updatedAt,
        };
      });
  });

  return sortRegistrationsForSummary(entries);
}

function getBikeEntriesForClass(className) {
  return getRegistrationsForClass(className).flatMap((registration) => {
    const bikeNumbers = Array.isArray(registration.bikeNumbers) && registration.bikeNumbers.length > 0
      ? registration.bikeNumbers
      : [""];

    return bikeNumbers.map((bikeNumber, index) => {
      return {
        id: `${registration.id}-bike-${index + 1}`,
        entryId: registration.id,
        applicantName: registration.applicantName,
        bikeNumber,
        registrationId: registration.registrationId,
        contactPhone: registration.contactPhone,
        order: `${registration.createdAt || ""}-${index}`,
      };
    });
  });
}

function sanitizeTimingNumericSegment(value) {
  const sanitized = String(value || "").replace(/[^0-9.]/g, "");
  if (!sanitized) {
    return "";
  }

  const [whole, ...fraction] = sanitized.split(".");
  return fraction.length > 0 ? `${whole}.${fraction.join("")}` : whole;
}

function sanitizeTimingInputValue(value) {
  const rawValue = String(value || "").trim().replaceAll(",", ".");
  if (!rawValue) {
    return "";
  }

  if (rawValue.includes(":")) {
    const [minutesRaw, ...secondsParts] = rawValue.split(":");
    const minutes = minutesRaw.replace(/\D/g, "");
    const seconds = sanitizeTimingNumericSegment(secondsParts.join(""));

    if (!minutes && !seconds) {
      return "";
    }

    return seconds ? `${minutes || "0"}:${seconds}` : `${minutes}:`;
  }

  return sanitizeTimingNumericSegment(rawValue);
}

function sanitizeTimingSheetEntriesPreference(input) {
  if (!input || typeof input !== "object") {
    return {};
  }

  const sanitized = {};
  for (const [classKey, classEntries] of Object.entries(input)) {
    if (!classEntries || typeof classEntries !== "object") {
      continue;
    }

    const nextEntries = {};
    for (const [entryId, entryValues] of Object.entries(classEntries)) {
      if (!entryValues || typeof entryValues !== "object") {
        continue;
      }

      const round1 = sanitizeTimingInputValue(entryValues.round1);
      const round2 = sanitizeTimingInputValue(entryValues.round2);
      if (!round1 && !round2) {
        continue;
      }

      nextEntries[entryId] = { round1, round2 };
    }

    if (Object.keys(nextEntries).length > 0) {
      sanitized[classKey] = nextEntries;
    }
  }

  return sanitized;
}

function getTimingSheetClassKey(className) {
  return normalizeText(className);
}

function getTimingSheetEntryValues(className, entryId) {
  const classKey = getTimingSheetClassKey(className);
  const entryValues = state.timingSheetEntries[classKey]?.[entryId];

  return {
    round1: entryValues?.round1 || "",
    round2: entryValues?.round2 || "",
  };
}

function setTimingSheetEntryValue(className, entryId, field, value) {
  if (!className || !entryId || !["round1", "round2"].includes(field)) {
    return;
  }

  const classKey = getTimingSheetClassKey(className);
  const sanitizedValue = sanitizeTimingInputValue(value);
  const nextState = {
    ...state.timingSheetEntries,
    [classKey]: {
      ...(state.timingSheetEntries[classKey] || {}),
      [entryId]: {
        ...getTimingSheetEntryValues(className, entryId),
        [field]: sanitizedValue,
      },
    },
  };

  const nextEntry = nextState[classKey]?.[entryId];
  if (nextEntry && !nextEntry.round1 && !nextEntry.round2) {
    delete nextState[classKey][entryId];
  }

  if (nextState[classKey] && Object.keys(nextState[classKey]).length === 0) {
    delete nextState[classKey];
  }

  state.timingSheetEntries = nextState;
  saveTimingSheetEntriesPreference();
}

function parseTimingValue(value) {
  const sanitizedValue = sanitizeTimingInputValue(value);
  if (!sanitizedValue) {
    return null;
  }

  if (/^\d+:\d+(?:\.\d+)?$/.test(sanitizedValue)) {
    const [minutesPart, secondsPart] = sanitizedValue.split(":");
    const minutes = Number.parseInt(minutesPart, 10);
    const seconds = Number.parseFloat(secondsPart);
    if (Number.isFinite(minutes) && Number.isFinite(seconds)) {
      return (minutes * 60) + seconds;
    }

    return null;
  }

  const parsed = Number.parseFloat(sanitizedValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function getBestTimingValue(round1, round2) {
  const candidates = [
    { value: round1, numeric: parseTimingValue(round1) },
    { value: round2, numeric: parseTimingValue(round2) },
  ].filter((item) => item.numeric !== null);

  if (candidates.length === 0) {
    return {
      displayValue: "",
      numericValue: null,
    };
  }

  const bestCandidate = candidates.reduce((best, current) => {
    return current.numeric < best.numeric ? current : best;
  });

  return {
    displayValue: bestCandidate.value,
    numericValue: bestCandidate.numeric,
  };
}

function getTimingSheetRows(className) {
  const rows = getBikeEntriesForClass(className).map((entry) => {
    const timingValues = getTimingSheetEntryValues(className, entry.id);
    const round1Numeric = parseTimingValue(timingValues.round1);
    const round2Numeric = parseTimingValue(timingValues.round2);
    const bestTiming = getBestTimingValue(timingValues.round1, timingValues.round2);

    return {
      ...entry,
      round1: timingValues.round1,
      round2: timingValues.round2,
      round1Numeric,
      round2Numeric,
      bestTime: bestTiming.displayValue,
      bestTimeNumeric: bestTiming.numericValue,
      rank: "",
    };
  });

  const hasCompleteRankingData = rows.length > 0 && rows.every((row) => {
    return row.round1Numeric !== null && row.round2Numeric !== null;
  });
  if (!hasCompleteRankingData) {
    return rows;
  }

  const rankedRows = [...rows].sort((left, right) => {
    if (left.bestTimeNumeric !== right.bestTimeNumeric) {
      return left.bestTimeNumeric - right.bestTimeNumeric;
    }

    const applicantComparison = String(left.applicantName || "").localeCompare(String(right.applicantName || ""), "th");
    if (applicantComparison !== 0) {
      return applicantComparison;
    }

    return String(left.bikeNumber || "").localeCompare(String(right.bikeNumber || ""), "th");
  });

  let previousBestTime = null;
  let previousRank = 0;
  const rankMap = new Map();

  rankedRows.forEach((row, index) => {
    const isSameTime = previousBestTime !== null && Math.abs(row.bestTimeNumeric - previousBestTime) < 0.000001;
    const nextRank = isSameTime ? previousRank : index + 1;
    rankMap.set(row.id, String(nextRank));
    previousBestTime = row.bestTimeNumeric;
    previousRank = nextRank;
  });

  return rows.map((row) => {
    return {
      ...row,
      rank: rankMap.get(row.id) || "",
    };
  });
}

function updateTimingSheetPreviewComputedFields() {
  if (
    !hasElement("summaryPreview") ||
    !state.selectedSummaryClass ||
    state.selectedSummaryTemplate !== "timing-sheet"
  ) {
    return;
  }

  const timingRows = getTimingSheetRows(state.selectedSummaryClass);
  const timingRowMap = new Map(timingRows.map((row) => [row.id, row]));
  const previewRows = elements.summaryPreview.querySelectorAll("[data-timing-entry-id]");

  previewRows.forEach((previewRow) => {
    const entryId = previewRow.dataset.timingEntryId;
    const rowData = timingRowMap.get(entryId);
    if (!rowData) {
      return;
    }

    const bestTimeTarget = previewRow.querySelector("[data-role='timing-best']");
    if (bestTimeTarget) {
      bestTimeTarget.textContent = rowData.bestTime;
    }

    const rankTarget = previewRow.querySelector("[data-role='timing-rank']");
    if (rankTarget) {
      rankTarget.textContent = rowData.rank;
    }
  });
}

function handleTimingSheetInput(target) {
  if (!(target instanceof HTMLInputElement) || !state.selectedSummaryClass) {
    return false;
  }

  const entryId = target.dataset.entryId;
  const field = target.dataset.field === "round2" ? "round2" : "round1";
  if (!entryId) {
    return false;
  }

  const sanitizedValue = sanitizeTimingInputValue(target.value);
  if (target.value !== sanitizedValue) {
    target.value = sanitizedValue;
  }

  setTimingSheetEntryValue(state.selectedSummaryClass, entryId, field, sanitizedValue);
  updateTimingSheetPreviewComputedFields();
  return true;
}

function getSummaryTemplate(templateId) {
  return SUMMARY_TEMPLATES.find((template) => template.id === templateId);
}

function getSelectedBlankBracketSlotCount() {
  return state.selectedBlankBracketSize === "8" ? 8 : 16;
}

function getSummaryTemplateActionConfig(template) {
  if (!template) {
    return {
      livePrintLabel: "พิมพ์หน้าสรุป",
      blankPrintLabel: "พิมพ์แบบเปล่า",
      blankModeLabel: "-",
      liveHint: "เลือกแบบพิมพ์ก่อน ระบบจะแสดงความหมายของปุ่มพิมพ์ให้อัตโนมัติ",
      blankHint: "ปุ่มพิมพ์แบบเปล่าเหมาะสำหรับเตรียมกระดาษไว้เขียนมือหน้างาน",
    };
  }

  if (template.id === "bracket-12") {
    const slotCount = getSelectedBlankBracketSlotCount();
    return {
      livePrintLabel: template.livePrintLabel,
      blankPrintLabel: `${template.blankPrintLabel} ${slotCount} ทีม`,
      blankModeLabel: `ผังสายประกบ ${slotCount} ทีม`,
      liveHint: template.liveHint,
      blankHint: `${template.blankHint} ตอนนี้ตั้งไว้เป็นแบบ ${slotCount} ทีม`,
    };
  }

  return {
    livePrintLabel: template.livePrintLabel,
    blankPrintLabel: template.blankPrintLabel,
    blankModeLabel: "ฟอร์มเปล่าสำหรับเขียนมือ",
    liveHint: template.liveHint,
    blankHint: template.blankHint,
  };
}

function renderSummaryActionPanel() {
  if (
    !hasElement("summaryActionTitle") ||
    !hasElement("summaryActionCopy") ||
    !hasElement("summaryActionSummary") ||
    !hasElement("summaryActionHint")
  ) {
    return;
  }

  const className = state.selectedSummaryClass;
  const template = getSummaryTemplate(state.selectedSummaryTemplate);
  const actionConfig = getSummaryTemplateActionConfig(template);
  const hasSelection = Boolean(className && template);
  const selectionRows = [
    {
      label: "รุ่นที่เลือก",
      value: className || "ยังไม่ได้เลือกรุ่น",
    },
    {
      label: "แบบพิมพ์",
      value: template?.label || "ยังไม่ได้เลือกแบบพิมพ์",
    },
    {
      label: "โหมดพิมพ์แบบเปล่า",
      value: actionConfig.blankModeLabel,
    },
  ];

  elements.summaryActionTitle.textContent = hasSelection
    ? `พร้อมพิมพ์ ${template.label}`
    : "เลือกรุ่นและแบบพิมพ์ก่อน";
  elements.summaryActionCopy.textContent = hasSelection
    ? actionConfig.liveHint
    : "เริ่มจาก Step 1 และ Step 2 ด้านซ้ายก่อน แล้วระบบจะสรุปให้ทันทีว่าปุ่มไหนพิมพ์อะไร";
  elements.summaryActionSummary.innerHTML = selectionRows
    .map((row) => {
      return `
        <div class="summary-action-row">
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.value)}</strong>
        </div>
      `;
    })
    .join("");
  elements.summaryActionHint.textContent = hasSelection
    ? `พิมพ์หน้าสรุป: ${actionConfig.liveHint} | พิมพ์แบบเปล่า: ${actionConfig.blankHint}`
    : "ปุ่มพิมพ์หน้าสรุปจะใช้ข้อมูลจริงของรุ่นที่เลือก ส่วนพิมพ์แบบเปล่าจะสร้างกระดาษสำรองไว้เขียนมือหน้างาน";

  if (hasElement("printSummaryButton")) {
    elements.printSummaryButton.textContent = actionConfig.livePrintLabel;
    elements.printSummaryButton.disabled = !hasSelection;
  }

  if (hasElement("printBlankSummaryButton")) {
    elements.printBlankSummaryButton.textContent = actionConfig.blankPrintLabel;
    elements.printBlankSummaryButton.disabled = !hasSelection;
  }
}

function renderSummaryPreviewMetaChips() {
  if (!hasElement("summaryPreviewMeta")) {
    return;
  }

  const className = state.selectedSummaryClass;
  const template = getSummaryTemplate(state.selectedSummaryTemplate);

  if (!className || !template) {
    elements.summaryPreviewMeta.innerHTML = `
      <div class="summary-meta-chip is-empty">
        <span>พร้อมเริ่ม</span>
        <strong>เลือกรุ่นแข่งและแบบพิมพ์เพื่อดูตัวอย่าง</strong>
      </div>
    `;
    return;
  }

  const chips = [
    { label: "รุ่น", value: className },
    { label: "แบบพิมพ์", value: template.label },
    {
      label: "แบบเปล่า",
      value: template.id === "bracket-12"
        ? `${getSelectedBlankBracketSlotCount()} ทีม`
        : "พร้อมพิมพ์",
    },
    { label: "ข้อมูลในรุ่น", value: getSummaryMetaText(className), wide: true },
  ];

  elements.summaryPreviewMeta.innerHTML = chips
    .map((chip) => {
      return `
        <div class="summary-meta-chip${chip.wide ? " is-wide" : ""}">
          <span>${escapeHtml(chip.label)}</span>
          <strong>${escapeHtml(chip.value)}</strong>
        </div>
      `;
    })
    .join("");
}

function renderBlankBracketSizeControl() {
  if (!hasElement("summaryBlankBracketSizeField") || !hasElement("summaryBlankBracketSizeSelect")) {
    return;
  }

  const isBracketTemplate = state.selectedSummaryTemplate === "bracket-12";
  elements.summaryBlankBracketSizeField.hidden = !isBracketTemplate;
  elements.summaryBlankBracketSizeSelect.value = state.selectedBlankBracketSize;
}

function buildSummaryTable(
  columns,
  rows,
  minimumRows,
  className,
  extraClass = "",
  rowsPerPage = minimumRows,
  options = {},
) {
  const inlineNoteText = options.inlineNoteText || "";
  const filledRows = [...rows];
  while (filledRows.length < minimumRows) {
    filledRows.push(columns.map(() => ""));
  }

  const colgroup = columns
    .map((column) => `<col style="width: ${column.width};" />`)
    .join("");
  const head = columns
    .map((column) => `<th>${escapeHtml(column.header)}</th>`)
    .join("");
  const pageSize = Math.max(1, rowsPerPage);
  const pages = [];
  for (let index = 0; index < filledRows.length; index += pageSize) {
    pages.push(filledRows.slice(index, index + pageSize));
  }

  return pages
    .map((pageRows, pageIndex) => {
      const body = pageRows
        .map((row) => {
          const cells = row
            .map((cell) => `<td>${escapeHtml(cell)}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");
      const totalPages = pages.length;
      const inlineNote = inlineNoteText
        ? `${inlineNoteText}${totalPages > 1 ? ` | หน้า ${pageIndex + 1} / ${totalPages}` : ""}`
        : totalPages > 1
          ? `หน้า ${pageIndex + 1} / ${totalPages}`
          : "";
      const titleRow = inlineNote
        ? `
          <div class="summary-sheet-title-row">
            <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
            <div class="summary-sheet-note summary-sheet-note--inline">${escapeHtml(inlineNote)}</div>
          </div>
        `
        : `<div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>`;

      return `
        <section class="summary-sheet ${extraClass}">
          ${buildSummarySheetBrand()}
          ${titleRow}
          <table class="summary-sheet-table">
            <colgroup>${colgroup}</colgroup>
            <thead>
              <tr>${head}</tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    })
    .join("");
}

function buildNameOnlySummary(className, options = {}) {
  const { blank = false } = options;
  const rows = blank ? [] : getRegistrationsForClass(className).map((registration) => {
    return [registration.applicantName || ""];
  });

  return buildSummaryTable(
    [{ header: "ชื่อผู้สมัคร (ชื่อร้านค้า/ชื่อทีม)", width: "100%" }],
    rows,
    SUMMARY_MINIMUM_ROWS["name-only"],
    className,
    "summary-sheet-name-only",
    SUMMARY_ROWS_PER_PAGE["name-only"],
    blank ? { inlineNoteText: "แบบเปล่าสำหรับเขียนหน้างาน" } : {},
  );
}

function buildVehicleSummary(className, options = {}) {
  const { blank = false } = options;
  const rows = blank ? [] : getRegistrationsForClass(className).map((registration) => {
    return [
      registration.applicantName || "",
      registration.vehicleCount ? `${registration.vehicleCount} คัน` : "-",
      Array.isArray(registration.bikeNumbers) ? registration.bikeNumbers.join(", ") : "-",
    ];
  });

  return buildSummaryTable(
    [
      { header: "ชื่อผู้สมัคร (ชื่อร้านค้า/ชื่อทีม)", width: "70%" },
      { header: "จำนวนรถ", width: "12%" },
      { header: "หมายเลขรถ", width: "18%" },
    ],
    rows,
    SUMMARY_MINIMUM_ROWS["with-vehicle-numbers"],
    className,
    "summary-sheet-vehicle-list",
    SUMMARY_ROWS_PER_PAGE["with-vehicle-numbers"],
    blank ? { inlineNoteText: "แบบเปล่าสำหรับเขียนหน้างาน" } : {},
  );
}

function buildTimingSummaryRow(row, options = {}) {
  const { interactive = false } = options;
  const bestTimeCell = `
    <span class="summary-sheet-time-derived" data-role="timing-best">${escapeHtml(row.bestTime || "")}</span>
  `;
  const rankCell = `
    <span class="summary-sheet-rank-derived" data-role="timing-rank">${escapeHtml(row.rank || "")}</span>
  `;
  const round1Cell = interactive
    ? `
      <input
        class="summary-sheet-time-input"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        data-action="timing-input"
        data-entry-id="${escapeHtml(row.id)}"
        data-field="round1"
        value="${escapeHtml(row.round1 || "")}"
      />
    `
    : escapeHtml(row.round1 || "");
  const round2Cell = interactive
    ? `
      <input
        class="summary-sheet-time-input"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        spellcheck="false"
        data-action="timing-input"
        data-entry-id="${escapeHtml(row.id)}"
        data-field="round2"
        value="${escapeHtml(row.round2 || "")}"
      />
    `
    : escapeHtml(row.round2 || "");

  return `
    <tr data-timing-entry-id="${escapeHtml(row.id)}">
      <td>${escapeHtml(row.applicantName || "")}</td>
      <td>${escapeHtml(row.bikeNumber || "")}</td>
      <td class="summary-sheet-time-cell">${round1Cell}</td>
      <td class="summary-sheet-time-cell">${round2Cell}</td>
      <td class="summary-sheet-derived-cell">${bestTimeCell}</td>
      <td class="summary-sheet-rank-cell">${rankCell}</td>
    </tr>
  `;
}

function buildEmptyTimingSummaryRow() {
  return `
    <tr>
      <td></td>
      <td></td>
      <td class="summary-sheet-time-cell"></td>
      <td class="summary-sheet-time-cell"></td>
      <td class="summary-sheet-derived-cell"></td>
      <td class="summary-sheet-rank-cell"></td>
    </tr>
  `;
}

function buildTimingSummary(className, options = {}) {
  const { blank = false, interactive = false } = options;
  const columns = [
    { header: "ชื่อทีมแข่ง", width: "40%" },
    { header: "หมายเลขรถ", width: "12%" },
    { header: "เวลารอบที่ 1", width: "12%" },
    { header: "เวลารอบที่ 2", width: "12%" },
    { header: "เวลาที่ดีที่สุด", width: "14%" },
    { header: "อันดับ", width: "10%" },
  ];
  const filledRows = blank ? [] : getTimingSheetRows(className);
  const minimumRows = SUMMARY_MINIMUM_ROWS["timing-sheet"];
  const rowsPerPage = SUMMARY_ROWS_PER_PAGE["timing-sheet"];
  const colgroup = columns
    .map((column) => `<col style="width: ${column.width};" />`)
    .join("");
  const head = columns
    .map((column) => `<th>${escapeHtml(column.header)}</th>`)
    .join("");
  const pageRows = [...filledRows];

  while (pageRows.length < minimumRows) {
    pageRows.push(null);
  }

  const pages = [];
  for (let index = 0; index < pageRows.length; index += rowsPerPage) {
    pages.push(pageRows.slice(index, index + rowsPerPage));
  }

  return pages
    .map((rows, pageIndex) => {
      const body = rows
        .map((row) => {
          return row
            ? buildTimingSummaryRow(row, { interactive: interactive && !blank })
            : buildEmptyTimingSummaryRow();
        })
        .join("");
      const totalPages = pages.length;
      const inlineNote = blank
        ? `แบบเปล่าสำหรับเขียนหน้างาน${totalPages > 1 ? ` | หน้า ${pageIndex + 1} / ${totalPages}` : ""}`
        : totalPages > 1
          ? `หน้า ${pageIndex + 1} / ${totalPages}`
          : "";
      const titleRow = inlineNote
        ? `
          <div class="summary-sheet-title-row">
            <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
            <div class="summary-sheet-note summary-sheet-note--inline">${escapeHtml(inlineNote)}</div>
          </div>
        `
        : `<div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>`;

      return `
        <section class="summary-sheet summary-sheet-timing">
          ${buildSummarySheetBrand()}
          ${titleRow}
          <table class="summary-sheet-table">
            <colgroup>${colgroup}</colgroup>
            <thead>
              <tr>${head}</tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    })
    .join("");
}
function getBracketEntriesForClass(className) {
  return getRegistrationsForClass(className).map((registration, index) => {
    const applicantName = registration.applicantName || `ทีม ${index + 1}`;
    const bikeNote = Array.isArray(registration.bikeNumbers) && registration.bikeNumbers.length > 0
      ? ` | รถ ${registration.bikeNumbers.join(", ")}`
      : "";

    return {
      id: registration.id,
      label: `${applicantName}${bikeNote}`,
      shortLabel: applicantName,
    };
  });
}

function getBracketSlotCount(entryCount) {
  let slotCount = 2;
  const targetCount = Math.max(2, entryCount);

  while (slotCount < targetCount) {
    slotCount *= 2;
  }

  return slotCount;
}

function getBracketRoundLabel(count) {
  if (count <= 1) {
    return "CHAMPION";
  }

  if (count === 2) {
    return "รอบชิงชนะเลิศ";
  }

  if (count === 4) {
    return "รอบรองชนะเลิศ";
  }

  return `รอบ ${count} คัน`;
}

function buildBracketRounds(slotCount) {
  const rounds = [];
  let currentCount = slotCount;

  while (currentCount >= 1) {
    rounds.push({
      count: currentCount,
      label: getBracketRoundLabel(currentCount),
    });

    if (currentCount === 1) {
      break;
    }

    currentCount /= 2;
  }

  return rounds;
}

function buildBracketPageGroups(rounds, entryCount = 0) {
  if (rounds.length === 0) {
    return [];
  }

  if (entryCount <= 16) {
    return [{
      startIndex: 0,
      rounds: [...rounds],
    }];
  }

  if (entryCount <= 32 && rounds[0]?.count === 32) {
    return [
      {
        startIndex: 0,
        rounds: rounds.slice(0, 2),
      },
      {
        startIndex: 1,
        rounds: rounds.slice(1),
      },
    ];
  }

  const maxColumnsPerPage = rounds[0].count >= 64 ? 3 : 4;
  if (rounds.length <= maxColumnsPerPage) {
    return [{
      startIndex: 0,
      rounds: [...rounds],
    }];
  }

  const overlapColumns = 1;
  const uniqueColumnsPerAdditionalPage = maxColumnsPerPage - overlapColumns;
  const pageCount = Math.max(
    1,
    Math.ceil((rounds.length - 1) / uniqueColumnsPerAdditionalPage),
  );
  const displayedColumnCount = rounds.length + ((pageCount - 1) * overlapColumns);
  const baseColumnsPerPage = Math.floor(displayedColumnCount / pageCount);
  const extraColumns = displayedColumnCount % pageCount;
  const columnsPerPage = Array.from({ length: pageCount }, (_, index) => {
    return baseColumnsPerPage + (index < extraColumns ? 1 : 0);
  });

  const groups = [];
  let startIndex = 0;

  columnsPerPage.forEach((columnCount, pageIndex) => {
    const endIndex = Math.min(rounds.length - 1, startIndex + columnCount - 1);
    groups.push({
      startIndex,
      rounds: rounds.slice(startIndex, endIndex + 1),
    });

    if (pageIndex < columnsPerPage.length - 1) {
      startIndex = endIndex;
    }
  });

  return groups;
}

function createEmptyBracketSelections(rounds) {
  return rounds.map((round) => {
    return Array.from({ length: round.count }, () => "");
  });
}

function createEmptyBracketState(config) {
  return {
    rounds: createEmptyBracketSelections(config.rounds),
    thirdPlaceWinner: "",
  };
}

function getBracketConfig(className) {
  const entries = getBracketEntriesForClass(className);
  const slotCount = getBracketSlotCount(entries.length);
  const rounds = buildBracketRounds(slotCount);

  return {
    className,
    entries,
    entryMap: new Map(entries.map((entry) => [entry.id, entry])),
    rounds,
    pageGroups: buildBracketPageGroups(rounds, entries.length),
  };
}

function getStoredBracketSelections(className) {
  return state.bracketSelections[normalizeText(className)] || null;
}

function getFinalMatchRoundIndex(config) {
  return config.rounds.findIndex((round) => round.count === 2);
}

function hasThirdPlaceMatch(config) {
  return getFinalMatchRoundIndex(config) > 0;
}

function getAllowedBracketOptionIds(config, rounds, roundIndex, slotIndex) {
  if (roundIndex === 0) {
    return config.entries.map((entry) => entry.id);
  }

  const previousRound = rounds[roundIndex - 1] || [];
  const pairStart = slotIndex * 2;
  const pair = previousRound.slice(pairStart, pairStart + 2).filter(Boolean);
  return [...new Set(pair)];
}

function getThirdPlaceParticipantIds(config, rounds) {
  const finalRoundIndex = getFinalMatchRoundIndex(config);
  if (finalRoundIndex <= 0) {
    return ["", ""];
  }

  const semifinalists = rounds[finalRoundIndex - 1] || [];
  const finalists = rounds[finalRoundIndex] || [];
  return Array.from({ length: 2 }, (_, matchIndex) => {
    const pair = semifinalists
      .slice(matchIndex * 2, matchIndex * 2 + 2)
      .filter((entryId) => config.entryMap.has(entryId));

    if (pair.length < 2) {
      return "";
    }

    const winnerId = finalists[matchIndex] || "";
    if (!winnerId || !pair.includes(winnerId)) {
      return "";
    }

    return pair.find((entryId) => entryId !== winnerId) || "";
  });
}

function getThirdPlaceOptionIds(config, rounds) {
  const participantIds = getThirdPlaceParticipantIds(config, rounds).filter(Boolean);
  if (participantIds.length !== 2 || new Set(participantIds).size !== 2) {
    return [];
  }

  return participantIds;
}

function getThirdPlaceLoserId(config, rounds, winnerId) {
  const optionIds = getThirdPlaceOptionIds(config, rounds);
  if (!optionIds.includes(winnerId)) {
    return "";
  }

  return optionIds.find((entryId) => entryId !== winnerId) || "";
}

function sanitizeBracketState(config, inputState) {
  const inputRounds = Array.isArray(inputState)
    ? inputState
    : Array.isArray(inputState?.rounds)
      ? inputState.rounds
      : [];
  const rounds = createEmptyBracketSelections(config.rounds);

  if (Array.isArray(inputRounds)) {
    config.rounds.forEach((round, roundIndex) => {
      const storedRound = Array.isArray(inputRounds[roundIndex]) ? inputRounds[roundIndex] : [];
      rounds[roundIndex] = Array.from({ length: round.count }, (_, slotIndex) => {
        return typeof storedRound[slotIndex] === "string" ? storedRound[slotIndex] : "";
      });
    });
  }

  const usedFirstRoundIds = new Set();
  rounds[0] = rounds[0].map((value) => {
    if (!config.entryMap.has(value) || usedFirstRoundIds.has(value)) {
      return "";
    }

    usedFirstRoundIds.add(value);
    return value;
  });

  for (let roundIndex = 1; roundIndex < rounds.length; roundIndex += 1) {
    rounds[roundIndex] = rounds[roundIndex].map((value, slotIndex) => {
      const allowedIds = getAllowedBracketOptionIds(config, rounds, roundIndex, slotIndex);
      return allowedIds.includes(value) ? value : "";
    });
  }

  const storedThirdPlaceWinner =
    typeof inputState?.thirdPlaceWinner === "string"
      ? inputState.thirdPlaceWinner
      : "";
  const thirdPlaceWinner = getThirdPlaceOptionIds(config, rounds).includes(storedThirdPlaceWinner)
    ? storedThirdPlaceWinner
    : "";

  return {
    rounds,
    thirdPlaceWinner,
  };
}

function getBracketRecord(className) {
  const config = getBracketConfig(className);
  const bracketState = sanitizeBracketState(config, getStoredBracketSelections(className));
  return {
    config,
    rounds: bracketState.rounds,
    thirdPlaceWinner: bracketState.thirdPlaceWinner,
    thirdPlaceParticipantIds: getThirdPlaceParticipantIds(config, bracketState.rounds),
    thirdPlaceOptionIds: getThirdPlaceOptionIds(config, bracketState.rounds),
    thirdPlaceLoserId: getThirdPlaceLoserId(
      config,
      bracketState.rounds,
      bracketState.thirdPlaceWinner,
    ),
  };
}

function getBlankBracketConfig(className, slotCount) {
  const normalizedSlotCount = slotCount === 8 ? 8 : 16;
  const rounds = buildBracketRounds(normalizedSlotCount);

  return {
    className,
    entries: [],
    entryMap: new Map(),
    rounds,
    pageGroups: buildBracketPageGroups(rounds, normalizedSlotCount),
  };
}

function getBlankBracketRecord(className, slotCount) {
  const config = getBlankBracketConfig(className, slotCount);
  const blankState = createEmptyBracketState(config);
  return {
    config,
    rounds: blankState.rounds,
    thirdPlaceWinner: "",
    thirdPlaceParticipantIds: ["", ""],
    thirdPlaceOptionIds: [],
    thirdPlaceLoserId: "",
  };
}

function persistBracketSelections(className, bracketState) {
  state.bracketSelections[normalizeText(className)] = bracketState;
  saveBracketSelectionsPreference();
}

function resetBracketSelections(className) {
  const { config } = getBracketRecord(className);
  persistBracketSelections(className, createEmptyBracketState(config));
}

function setBracketSelection(className, roundIndex, slotIndex, value) {
  const { config, rounds, thirdPlaceWinner } = getBracketRecord(className);
  if (!config.rounds[roundIndex]) {
    return;
  }

  const nextRounds = rounds.map((round) => [...round]);

  if (roundIndex === 0) {
    nextRounds[0][slotIndex] = config.entryMap.has(value) ? value : "";

    if (value) {
      nextRounds[0] = nextRounds[0].map((currentValue, currentIndex) => {
        if (currentIndex !== slotIndex && currentValue === value) {
          return "";
        }

        return currentValue;
      });
    }
  } else {
    const allowedIds = getAllowedBracketOptionIds(config, nextRounds, roundIndex, slotIndex);
    nextRounds[roundIndex][slotIndex] = allowedIds.includes(value) ? value : "";
  }

  persistBracketSelections(
    className,
    sanitizeBracketState(config, {
      rounds: nextRounds,
      thirdPlaceWinner,
    }),
  );
}

function setThirdPlaceWinner(className, value) {
  const { config, rounds } = getBracketRecord(className);
  persistBracketSelections(
    className,
    sanitizeBracketState(config, {
      rounds: rounds.map((round) => [...round]),
      thirdPlaceWinner: value,
    }),
  );
}

function getBracketEntryLabel(config, entryId, maxLength = 22) {
  const entry = config.entryMap.get(entryId);
  return entry ? shortenText(entry.shortLabel, maxLength) : "";
}

function buildEvenlySpacedCenters(count, topY, bottomY) {
  const safeCount = Math.max(1, count);
  if (safeCount === 1) {
    return [(topY + bottomY) / 2];
  }

  const availableHeight = bottomY - topY;
  const maxStep = 156;
  let step = availableHeight / (safeCount - 1);
  step = Math.min(step, maxStep);
  const contentHeight = step * (safeCount - 1);
  const startY = topY + (availableHeight - contentHeight) / 2;

  return Array.from({ length: safeCount }, (_, index) => {
    return startY + step * index;
  });
}

function buildNextRoundCenters(previousCenters) {
  if (previousCenters.length <= 1) {
    return [...previousCenters];
  }

  const centers = [];
  for (let index = 0; index < previousCenters.length; index += 2) {
    const topCenter = previousCenters[index];
    const bottomCenter = previousCenters[Math.min(index + 1, previousCenters.length - 1)];
    centers.push((topCenter + bottomCenter) / 2);
  }

  return centers;
}

function snapBracketCoordinate(value) {
  return Math.round(value * 2) / 2;
}

function getBracketPageLayouts(pageGroup, topY, bottomY) {
  const centersByRound = [];
  centersByRound[0] = buildEvenlySpacedCenters(pageGroup.rounds[0].count, topY, bottomY);

  for (let index = 1; index < pageGroup.rounds.length; index += 1) {
    centersByRound[index] = buildNextRoundCenters(centersByRound[index - 1]);
  }

  return pageGroup.rounds.map((round, index) => {
    const centers = centersByRound[index].map((value) => snapBracketCoordinate(value));
    const roundStep = centers.length > 1
      ? Math.abs(centers[1] - centers[0])
      : index > 0 && centersByRound[index - 1]?.length > 1
        ? Math.abs(centersByRound[index - 1][1] - centersByRound[index - 1][0]) * 2
        : 72;
    const boxHeight = snapBracketCoordinate(Math.max(22, Math.min(50, roundStep - 4, roundStep * 0.92)));
    const fontSize = boxHeight >= 46 ? 10.25 : boxHeight >= 38 ? 10 : 9.25;

    return {
      ...round,
      centers,
      boxHeight,
      fontSize,
    };
  });
}

function renderBracketPairConnector(startX, topY, bottomY, nextX, nextY, options = {}) {
  const sourceX = snapBracketCoordinate(startX);
  const targetX = snapBracketCoordinate(nextX);
  const gap = Math.max(20, targetX - sourceX);
  const branchStub = snapBracketCoordinate(
    Math.min(
      options.maxStub ?? 26,
      Math.max(options.minStub ?? 16, gap * (options.ratio ?? 0.28)),
    ),
  );
  const elbowX = snapBracketCoordinate(sourceX + branchStub);
  const mergeY = snapBracketCoordinate((topY + bottomY) / 2);
  const topYAligned = snapBracketCoordinate(topY);
  const bottomYAligned = snapBracketCoordinate(bottomY);
  const nextYAligned = snapBracketCoordinate(nextY);

  return [
    `<path d="M ${sourceX} ${topYAligned} H ${elbowX} V ${bottomYAligned}" />`,
    `<path d="M ${sourceX} ${bottomYAligned} H ${elbowX}" />`,
    `<path d="M ${elbowX} ${mergeY} V ${nextYAligned} H ${targetX}" />`,
  ].join("");
}

function getBracketPageMetrics(columnCount, viewBoxWidth, leftPadding, rightPadding) {
  const usableWidth = viewBoxWidth - leftPadding - rightPadding;
  const connectorGap = columnCount >= 4 ? 66 : columnCount === 3 ? 92 : columnCount === 2 ? 118 : 0;
  const maxBoxWidth = columnCount >= 4 ? 212 : columnCount === 3 ? 288 : columnCount === 2 ? 432 : 540;
  const rawBoxWidth = columnCount > 1
    ? (usableWidth - connectorGap * (columnCount - 1)) / columnCount
    : usableWidth;
  const boxWidth = snapBracketCoordinate(Math.min(maxBoxWidth, rawBoxWidth));
  const totalWidth = columnCount > 1
    ? (boxWidth * columnCount) + connectorGap * (columnCount - 1)
    : boxWidth;
  const startX = snapBracketCoordinate(leftPadding + Math.max(0, (usableWidth - totalWidth) / 2));
  const xStep = snapBracketCoordinate(columnCount > 1 ? boxWidth + connectorGap : 0);

  return {
    boxWidth,
    startX,
    xStep,
  };
}

function getRoundOfSixteenBracketPreset(pageGroup) {
  if (pageGroup.rounds[0]?.count !== 16 || pageGroup.rounds.length !== 5) {
    return null;
  }

  return {
    viewBoxWidth: 1120,
    viewBoxHeight: 1020,
    canvasPaddingTop: 126,
    labelY: 34,
    topY: 102,
    bottomY: 962,
    leftPadding: 22,
    rightPadding: 18,
    roundXs: [26, 252, 484, 718, 940],
    roundWidths: [150, 148, 148, 156, 174],
    firstRound: {
      maxBoxHeight: 42,
    },
    connectorOptions: {
      minStub: 24,
      maxStub: 38,
      ratio: 0.38,
    },
    thirdPlace: {
      sourceWidth: 126,
      resultWidth: 174,
      boxHeight: 44,
      fontSize: 10,
      leftX: 724,
      winnerX: 930,
      topCenterY: 892,
      bottomCenterY: 952,
      titleOffset: 46,
      rankOffset: 36,
      connectorOptions: {
        minStub: 24,
        maxStub: 34,
        ratio: 0.36,
      },
    },
  };
}

function getRoundOfThirtyTwoIntroPreset(pageGroup, totalPages) {
  if (
    totalPages !== 2 ||
    pageGroup.startIndex !== 0 ||
    pageGroup.rounds[0]?.count !== 32 ||
    pageGroup.rounds[1]?.count !== 16
  ) {
    return null;
  }

  return {
    viewBoxWidth: 1120,
    viewBoxHeight: 1020,
    canvasPaddingTop: 126,
    labelY: 34,
    topY: 102,
    bottomY: 962,
    leftPadding: 22,
    rightPadding: 18,
    roundXs: [26, 252],
    roundWidths: [150, 148],
    connectorOptions: {
      minStub: 24,
      maxStub: 38,
      ratio: 0.38,
    },
    firstRound: {
      maxBoxHeight: 22,
    },
  };
}

function getBracketSlotStyle(x, centerY, boxWidth, boxHeight, viewBoxWidth, viewBoxHeight) {
  return [
    `left:${(x / viewBoxWidth) * 100}%`,
    `top:${((centerY - boxHeight / 2) / viewBoxHeight) * 100}%`,
    `width:${(boxWidth / viewBoxWidth) * 100}%`,
    `height:${(boxHeight / viewBoxHeight) * 100}%`,
  ].join(";");
}

function renderBracketSlotShape(x, centerY, boxWidth, boxHeight, slotClassName = "") {
  const shapeClasses = slotClassName
    .split(/\s+/)
    .filter((className) => className && className !== "bracket-slot")
    .join(" ");
  const shapeClassName = `bracket-slot-shape${shapeClasses ? ` ${shapeClasses}` : ""}`;
  const y = snapBracketCoordinate(centerY - boxHeight / 2);
  const radius = snapBracketCoordinate(Math.min(12, boxHeight / 3.2));

  return `
    <rect
      class="${shapeClassName}"
      x="${snapBracketCoordinate(x)}"
      y="${y}"
      width="${snapBracketCoordinate(boxWidth)}"
      height="${snapBracketCoordinate(boxHeight)}"
      rx="${radius}"
      ry="${radius}"
    />
  `;
}

function buildBracketValueSlotMarkup(label, x, centerY, boxWidth, boxHeight, fontSize, slotClassName, viewBoxWidth, viewBoxHeight) {
  return `
    <div class="${slotClassName}" style="${getBracketSlotStyle(x, centerY, boxWidth, boxHeight, viewBoxWidth, viewBoxHeight)}">
      <div class="bracket-slot-value" style="font-size:${fontSize}px">${escapeHtml(label)}</div>
    </div>
  `;
}

function buildBracketSelectSlotMarkup(optionsHtml, selectedLabel, selectAttributes, x, centerY, boxWidth, boxHeight, fontSize, slotClassName, viewBoxWidth, viewBoxHeight) {
  return `
    <div class="${slotClassName}" style="${getBracketSlotStyle(x, centerY, boxWidth, boxHeight, viewBoxWidth, viewBoxHeight)}">
      <select
        class="bracket-slot-select"
        style="font-size:${fontSize}px"
        ${selectAttributes}
      >
        ${optionsHtml}
      </select>
      <div class="bracket-slot-display" style="font-size:${fontSize}px">${escapeHtml(selectedLabel)}</div>
    </div>
  `;
}

function getBracketDisplayLabel(config, entryId) {
  const entry = config.entryMap.get(entryId);
  return entry ? shortenText(entry.shortLabel, 84) : "";
}

function buildBracketSelectOptions(config, rounds, roundIndex, slotIndex) {
  const currentValue = rounds[roundIndex][slotIndex] || "";

  if (roundIndex === 0) {
    const usedElsewhere = new Set(
      rounds[0].filter((value, currentIndex) => {
        return value && currentIndex !== slotIndex;
      }),
    );

    return [
      `<option value=""></option>`,
      ...config.entries.map((entry) => {
        const selected = entry.id === currentValue ? " selected" : "";
        const disabled = usedElsewhere.has(entry.id) ? " disabled" : "";
        return `<option value="${entry.id}"${selected}${disabled}>${escapeHtml(entry.label)}</option>`;
      }),
    ].join("");
  }

  const options = getAllowedBracketOptionIds(config, rounds, roundIndex, slotIndex);
  return [
    `<option value=""></option>`,
    ...options.map((entryId) => {
      const selected = entryId === currentValue ? " selected" : "";
      return `<option value="${entryId}"${selected}>${escapeHtml(config.entryMap.get(entryId)?.shortLabel || "")}</option>`;
    }),
  ].join("");
}

function buildBracketSlotMarkup(
  config,
  rounds,
  absoluteRoundIndex,
  slotIndex,
  x,
  centerY,
  boxWidth,
  boxHeight,
  fontSize,
  interactive,
  viewBoxWidth,
  viewBoxHeight,
) {
  const selectedValue = rounds[absoluteRoundIndex][slotIndex] || "";
  const slotClassName = absoluteRoundIndex === rounds.length - 1 ? "bracket-slot champion" : "bracket-slot";

  if (interactive) {
    return buildBracketSelectSlotMarkup(
      buildBracketSelectOptions(config, rounds, absoluteRoundIndex, slotIndex),
      getBracketDisplayLabel(config, selectedValue),
      `data-action="bracket-select" data-round-index="${absoluteRoundIndex}" data-slot-index="${slotIndex}"`,
      x,
      centerY,
      boxWidth,
      boxHeight,
      fontSize,
      slotClassName,
      viewBoxWidth,
      viewBoxHeight,
    );
  }

  return buildBracketValueSlotMarkup(
    getBracketDisplayLabel(config, selectedValue),
    x,
    centerY,
    boxWidth,
    boxHeight,
    fontSize,
    slotClassName,
    viewBoxWidth,
    viewBoxHeight,
  );
}

function buildThirdPlaceSelectOptions(config, optionIds, currentValue) {
  return [
    `<option value=""></option>`,
    ...optionIds.map((entryId) => {
      const selected = entryId === currentValue ? " selected" : "";
      return `<option value="${entryId}"${selected}>${escapeHtml(config.entryMap.get(entryId)?.shortLabel || "")}</option>`;
    }),
  ].join("");
}

function buildThirdPlaceMarkup(record, interactive, viewBoxWidth, viewBoxHeight, layoutOptions = null) {
  if (!hasThirdPlaceMatch(record.config)) {
    return {
      connectorsHtml: "",
      shapesHtml: "",
      overlaysHtml: "",
    };
  }

  const sourceWidth = layoutOptions?.sourceWidth ?? 212;
  const resultWidth = layoutOptions?.resultWidth ?? 214;
  const boxHeight = layoutOptions?.boxHeight ?? 48;
  const fontSize = layoutOptions?.fontSize ?? 10;
  const leftX = layoutOptions?.leftX ?? 620;
  const winnerX = layoutOptions?.winnerX ?? 906;
  const topCenterY = layoutOptions?.topCenterY ?? 790;
  const bottomCenterY = layoutOptions?.bottomCenterY ?? 856;
  const winnerCenterY = (topCenterY + bottomCenterY) / 2;
  const resultClassName = "bracket-slot third-place-result";
  const thirdPlaceWinnerLabel = getBracketDisplayLabel(record.config, record.thirdPlaceWinner);
  const fourthPlaceLabel = getBracketDisplayLabel(record.config, record.thirdPlaceLoserId);
  const titleOffset = layoutOptions?.titleOffset ?? 72;
  const rankOffset = layoutOptions?.rankOffset ?? 50;

  const titleStyle = [
    `left:${(leftX / viewBoxWidth) * 100}%`,
    `top:${((topCenterY - titleOffset) / viewBoxHeight) * 100}%`,
    `width:${((winnerX + resultWidth - leftX) / viewBoxWidth) * 100}%`,
  ].join(";");
  const rankStyle = [
    `left:${(leftX / viewBoxWidth) * 100}%`,
    `top:${((bottomCenterY + rankOffset) / viewBoxHeight) * 100}%`,
    `width:${((winnerX + resultWidth - leftX) / viewBoxWidth) * 100}%`,
  ].join(";");

  const participantSlots = record.thirdPlaceParticipantIds
    .map((entryId, index) => {
      const centerY = index === 0 ? topCenterY : bottomCenterY;
      return buildBracketValueSlotMarkup(
        getBracketDisplayLabel(record.config, entryId),
        leftX,
        centerY,
        sourceWidth,
        boxHeight,
        fontSize,
        "bracket-slot third-place-source",
        viewBoxWidth,
        viewBoxHeight,
      );
    })
    .join("");

  const participantShapes = record.thirdPlaceParticipantIds
    .map((entryId, index) => {
      const centerY = index === 0 ? topCenterY : bottomCenterY;
      return renderBracketSlotShape(
        leftX,
        centerY,
        sourceWidth,
        boxHeight,
        "bracket-slot third-place-source",
      );
    })
    .join("");

  const winnerSlot = interactive
    ? buildBracketSelectSlotMarkup(
      buildThirdPlaceSelectOptions(record.config, record.thirdPlaceOptionIds, record.thirdPlaceWinner),
      thirdPlaceWinnerLabel,
      `data-action="bracket-third-place-select"`,
      winnerX,
      winnerCenterY,
      resultWidth,
      boxHeight,
      fontSize,
      resultClassName,
      viewBoxWidth,
      viewBoxHeight,
    )
    : buildBracketValueSlotMarkup(
      thirdPlaceWinnerLabel,
      winnerX,
      winnerCenterY,
      resultWidth,
      boxHeight,
      fontSize,
      resultClassName,
      viewBoxWidth,
      viewBoxHeight,
    );

  const winnerShape = renderBracketSlotShape(
    winnerX,
    winnerCenterY,
    resultWidth,
    boxHeight,
    resultClassName,
  );

  return {
    connectorsHtml: renderBracketPairConnector(
      leftX + sourceWidth,
      topCenterY,
      bottomCenterY,
      winnerX,
      winnerCenterY,
      layoutOptions?.connectorOptions,
    ),
    shapesHtml: `${participantShapes}${winnerShape}`,
    overlaysHtml: `
      <div class="bracket-third-place-title" style="${titleStyle}">ชิงอันดับ 3</div>
      ${participantSlots}
      ${winnerSlot}
      <div class="bracket-third-place-ranks" style="${rankStyle}">
        <div><strong>อันดับ 3:</strong> ${escapeHtml(thirdPlaceWinnerLabel)}</div>
        <div><strong>อันดับ 4:</strong> ${escapeHtml(fourthPlaceLabel)}</div>
      </div>
    `,
  };
}

function buildBracketPageMarkup(
  className,
  record,
  pageGroup,
  pageNumber,
  totalPages,
  interactive,
  options = {},
) {
  const { blank = false, blankSlotCount = null } = options;
  const pagePreset =
    getRoundOfThirtyTwoIntroPreset(pageGroup, totalPages) ||
    getRoundOfSixteenBracketPreset(pageGroup);
  const viewBoxWidth = pagePreset?.viewBoxWidth ?? 1120;
  const viewBoxHeight = pagePreset?.viewBoxHeight ?? 980;
  const isFinalPage =
    pageGroup.startIndex + pageGroup.rounds.length === record.config.rounds.length;
  const includeThirdPlace = isFinalPage && hasThirdPlaceMatch(record.config);
  const canvasPaddingTop = pagePreset?.canvasPaddingTop ?? (includeThirdPlace ? 120 : 114);
  const leftPadding = pagePreset?.leftPadding ?? 36;
  const columnCount = pageGroup.rounds.length;
  const rightPadding = pagePreset?.rightPadding ?? 40;
  const { boxWidth, startX, xStep } = getBracketPageMetrics(
    columnCount,
    viewBoxWidth,
    leftPadding,
    rightPadding,
  );
  const labelY = pagePreset?.labelY ?? 42;
  const topY = pagePreset?.topY ?? 138;
  const bottomY = pagePreset?.bottomY ?? (includeThirdPlace ? 716 : 920);

  const layoutRounds = getBracketPageLayouts(pageGroup, topY, bottomY).map((round, index) => {
    const adjustedBoxHeight = index === 0 && pagePreset?.firstRound?.maxBoxHeight
      ? Math.min(round.boxHeight, pagePreset.firstRound.maxBoxHeight)
      : round.boxHeight;
    return {
      ...round,
      absoluteIndex: pageGroup.startIndex + index,
      boxHeight: adjustedBoxHeight,
      fontSize: adjustedBoxHeight <= 42 ? Math.min(round.fontSize, 9.75) : round.fontSize,
      boxWidth: pagePreset?.roundWidths?.[index] ?? boxWidth,
      x: pagePreset?.roundXs?.[index] ?? (startX + xStep * index),
    };
  });

  const labels = layoutRounds.map((round) => {
    return `<text x="${round.x + round.boxWidth / 2}" y="${labelY}" text-anchor="middle" class="bracket-round-label">${escapeHtml(round.label)}</text>`;
  });

  const connectors = [];
  for (let roundIndex = 0; roundIndex < layoutRounds.length - 1; roundIndex += 1) {
    const currentRound = layoutRounds[roundIndex];
    const nextRound = layoutRounds[roundIndex + 1];

    for (let slotIndex = 0; slotIndex < nextRound.count; slotIndex += 1) {
      connectors.push(
        renderBracketPairConnector(
          currentRound.x + currentRound.boxWidth,
          currentRound.centers[slotIndex * 2],
          currentRound.centers[slotIndex * 2 + 1],
          nextRound.x,
          nextRound.centers[slotIndex],
          pagePreset?.connectorOptions,
        ),
      );
    }
  }

  const thirdPlaceMarkup = includeThirdPlace
    ? buildThirdPlaceMarkup(
      record,
      interactive,
      viewBoxWidth,
      viewBoxHeight,
      pagePreset?.thirdPlace ?? null,
    )
    : { connectorsHtml: "", shapesHtml: "", overlaysHtml: "" };

  const slotShapes = layoutRounds.flatMap((round) => {
    return round.centers.map((centerY) => {
      const slotClassName =
        round.absoluteIndex === record.rounds.length - 1 ? "bracket-slot champion" : "bracket-slot";
      return renderBracketSlotShape(round.x, centerY, round.boxWidth, round.boxHeight, slotClassName);
    });
  }).join("");

  const slots = layoutRounds.flatMap((round) => {
    return round.centers.map((centerY, slotIndex) => {
      return buildBracketSlotMarkup(
        record.config,
        record.rounds,
        round.absoluteIndex,
        slotIndex,
        round.x,
        centerY,
        round.boxWidth,
        round.boxHeight,
        round.fontSize,
        interactive,
        viewBoxWidth,
        viewBoxHeight,
      );
    });
  }).join("");

  return `
    <section class="summary-sheet summary-sheet-bracket${interactive ? " is-editor" : ""}">
      ${buildSummarySheetBrand()}
      <div class="summary-sheet-title-row">
        <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
        <div class="summary-sheet-note summary-sheet-note--inline">${escapeHtml(
          blank
            ? `แบบเปล่าสำหรับเขียนหน้างาน | ${blankSlotCount || record.config.rounds[0]?.count || 16} ทีม${totalPages > 1 ? ` | หน้า ${pageNumber} / ${totalPages}` : ""}`
            : `ผู้สมัคร ${record.config.entries.length} ทีม | หน้า ${pageNumber} / ${totalPages}`,
        )}</div>
      </div>
      <div class="bracket-canvas" style="padding-top:${canvasPaddingTop}%">
        <svg viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" preserveAspectRatio="none" class="bracket-canvas-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Bracket page ${pageNumber}">
          <g class="bracket-labels">${labels.join("")}</g>
          <g class="bracket-connectors">${connectors.join("")}${thirdPlaceMarkup.connectorsHtml}</g>
          <g class="bracket-slot-shapes">${slotShapes}${thirdPlaceMarkup.shapesHtml}</g>
        </svg>
        ${slots}
        ${thirdPlaceMarkup.overlaysHtml}
      </div>
    </section>
  `;
}

function buildBracketSummary(className, options = {}) {
  const { interactive = false, blank = false, blankSlotCount = 16 } = options;
  const record = blank
    ? getBlankBracketRecord(className, blankSlotCount)
    : getBracketRecord(className);

  if (!blank && record.config.entries.length < 2) {
    return `
      <section class="summary-sheet summary-sheet-bracket">
        ${buildSummarySheetBrand()}
        <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
        <div class="summary-sheet-note">ต้องมีผู้สมัครอย่างน้อย 2 ทีม จึงจะสร้างสายประกบรุ่นแข่งได้</div>
      </section>
    `;
  }

  const pages = record.config.pageGroups
    .map((pageGroup, index) => {
      return buildBracketPageMarkup(
        className,
        record,
        pageGroup,
        index + 1,
        record.config.pageGroups.length,
        interactive,
        { blank, blankSlotCount },
      );
    })
    .join("");

  if (!interactive) {
    return pages;
  }

  return `
    <div class="summary-bracket-editor-actions">
      <div class="summary-bracket-editor-copy">
        รอบแรกเลือกทีมลงแต่ละช่องเองก่อน แล้วรอบถัดไปจะเลือกผู้ชนะได้เฉพาะจากคู่ก่อนหน้าเท่านั้น เมื่อได้ผู้แพ้รอบรองครบแล้ว ระบบจะเปิดชิงอันดับ 3 ให้เลือกผู้ชนะต่อได้
      </div>
      <button class="button button-secondary button-small" type="button" data-action="reset-bracket">
        ล้างสายประกบ
      </button>
    </div>
    ${pages}
  `;
}

function getSummaryMetaText(className) {
  const registrations = getRegistrationsForClass(className);
  const bikeEntries = getBikeEntriesForClass(className);

  if (state.selectedSummaryTemplate === "bracket-12") {
    return `ผู้สมัคร ${registrations.length} ทีม | จัดสายประกบแบบเลือกเอง`;
  }

  return `ผู้สมัคร ${registrations.length} รายการ | รถที่ลงแข่ง ${bikeEntries.length} คัน`;
}
function buildSummaryDocument(options = {}) {
  const { blank = false } = options;
  const className = state.selectedSummaryClass;
  const templateId = state.selectedSummaryTemplate;
  const template = getSummaryTemplate(templateId);
  const blankBracketSlotCount = getSelectedBlankBracketSlotCount();

  if (!className || !template) {
    return {
      title: `${EVENT_BRAND.fullName} | หน้าสรุป`,
      html: `
        <section class="summary-sheet summary-sheet-empty">
          ${buildSummarySheetBrand()}
          <div class="summary-sheet-title">ยังไม่มีข้อมูลสรุป</div>
          <div class="summary-sheet-note">กรุณาเลือกรุ่นแข่งขันและแบบฟอร์มสรุปก่อน</div>
        </section>
      `,
    };
  }

  if (templateId === "name-only") {
    return {
      title: `${EVENT_BRAND.fullName} | ${template.label} ${className}${blank ? " (แบบเปล่า)" : ""}`,
      html: buildNameOnlySummary(className, { blank }),
    };
  }

  if (templateId === "with-vehicle-numbers") {
    return {
      title: `${EVENT_BRAND.fullName} | ${template.label} ${className}${blank ? " (แบบเปล่า)" : ""}`,
      html: buildVehicleSummary(className, { blank }),
    };
  }

  if (templateId === "timing-sheet") {
    return {
      title: `${EVENT_BRAND.fullName} | ${template.label} ${className}${blank ? " (แบบเปล่า)" : ""}`,
      html: buildTimingSummary(className, { blank }),
    };
  }

  return {
    title: `${EVENT_BRAND.fullName} | ${template.label} ${className}${blank ? ` (แบบเปล่า ${blankBracketSlotCount} ทีม)` : ""}`,
    html: buildBracketSummary(className, { blank, blankSlotCount: blankBracketSlotCount }),
  };
}

function renderSummaryPreview() {
  if (!hasElement("summaryPreview") || !hasElement("summaryPreviewMeta")) {
    return;
  }

  const className = state.selectedSummaryClass;
  const summaryDocument = buildSummaryDocument();
  renderSummaryActionPanel();
  renderSummaryPreviewMetaChips();

  if (!className) {
    elements.summaryPreview.innerHTML = summaryDocument.html;
    return;
  }

  const isBracketTemplate = state.selectedSummaryTemplate === "bracket-12";
  const isTimingTemplate = state.selectedSummaryTemplate === "timing-sheet";
  const previewHtml = isBracketTemplate
    ? buildBracketSummary(className, { interactive: true })
    : isTimingTemplate
      ? buildTimingSummary(className, { interactive: true })
      : summaryDocument.html;
  elements.summaryPreview.innerHTML = `
    <div class="summary-preview-paper${isBracketTemplate ? " summary-preview-paper-bracket" : ""}">
      ${previewHtml}
    </div>
  `;
  elements.summaryPreview.scrollLeft = 0;
  if (isTimingTemplate) {
    updateTimingSheetPreviewComputedFields();
  }
}
function clampVehicleCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, state.maxVehicles);
}

function getFilteredRegistrations() {
  const term = elements.searchInput?.value.trim().toLowerCase() || "";
  if (!term) {
    return state.registrations;
  }

  return state.registrations.filter((item) => {
    const classes = (item.entries || []).map((entry) => entry.raceClass);
    const bikeNumbers = (item.entries || []).flatMap((entry) => entry.bikeNumbers || []);
    const haystack = [
      item.applicantName,
      item.address,
      item.contactPhone,
      ...classes,
      ...bikeNumbers,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

function getRegistrationPageCount(totalItems) {
  return Math.max(1, Math.ceil(totalItems / REGISTRATIONS_PER_PAGE));
}

function clampRegistrationPage(totalItems) {
  const pageCount = getRegistrationPageCount(totalItems);
  state.registrationPage = Math.min(Math.max(state.registrationPage, 1), pageCount);
  return pageCount;
}

function goToRegistrationPage(page) {
  const pageCount = clampRegistrationPage(getFilteredRegistrations().length);
  const nextPage = Math.min(Math.max(page, 1), pageCount);

  if (state.registrationPage === nextPage) {
    return;
  }

  state.registrationPage = nextPage;
  renderRegistrations();
}

function resetRegistrationPage() {
  state.registrationPage = 1;
}

function renderRegistrationPagination(totalItems, pageCount) {
  if (!hasElement("registrationPagination")) {
    return;
  }

  if (totalItems === 0 || pageCount <= 1) {
    elements.registrationPagination.innerHTML = "";
    return;
  }

  const currentPageNumber = state.registrationPage;
  const pageButtons = Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;
    const isCurrent = pageNumber === currentPageNumber;

    return `
      <button
        class="pagination-button ${isCurrent ? "is-active" : ""}"
        type="button"
        data-action="go-to-page"
        data-page="${pageNumber}"
        ${isCurrent ? 'aria-current="page"' : ""}
      >
        ${pageNumber}
      </button>
    `;
  }).join("");

  elements.registrationPagination.innerHTML = `
    <div class="pagination-summary">
      หน้า ${currentPageNumber} / ${pageCount}
      <span>แสดง ${REGISTRATIONS_PER_PAGE} รายการต่อหน้า</span>
    </div>
    <div class="pagination-actions">
      <button
        class="pagination-button"
        type="button"
        data-action="go-to-page"
        data-page="${currentPageNumber - 1}"
        ${currentPageNumber === 1 ? "disabled" : ""}
      >
        ก่อนหน้า
      </button>
      ${pageButtons}
      <button
        class="pagination-button"
        type="button"
        data-action="go-to-page"
        data-page="${currentPageNumber + 1}"
        ${currentPageNumber === pageCount ? "disabled" : ""}
      >
        ถัดไป
      </button>
    </div>
  `;
}

function renderRegistrations() {
  if (!hasElement("registrationList")) {
    return;
  }

  const registrations = getFilteredRegistrations();
  const pageCount = clampRegistrationPage(registrations.length);

  if (registrations.length === 0) {
    renderSearchResultsMeta(0, 0);
    elements.registrationList.innerHTML = `
      <div class="empty-state">
        ยังไม่มีข้อมูลผู้สมัครในรายการนี้ หรือไม่พบข้อมูลจากคำค้นหา
      </div>
    `;
    renderRegistrationPagination(0, pageCount);
    return;
  }

  const startIndex = (state.registrationPage - 1) * REGISTRATIONS_PER_PAGE;
  const visibleRegistrations = registrations.slice(
    startIndex,
    startIndex + REGISTRATIONS_PER_PAGE,
  );
  renderSearchResultsMeta(registrations.length, visibleRegistrations.length);

  elements.registrationList.innerHTML = visibleRegistrations
    .map((item) => {
      const entryBlocks = (item.entries || [])
        .map((entry) => {
          const bikeNumbers = (entry.bikeNumbers || [])
            .map((bikeNumber) => `<span class="number-pill">${escapeHtml(bikeNumber)}</span>`)
            .join("");

          return `
            <div class="registration-entry-block">
              <div class="registration-entry-head">
                <strong>${escapeHtml(entry.raceClass || "-")}</strong>
                <span>${entry.vehicleCount} คัน</span>
              </div>
              <div class="numbers-row">${bikeNumbers}</div>
            </div>
          `;
        })
        .join("");

      return `
        <article class="registration-card">
          <div class="registration-card-header">
            <div>
              <h3>${escapeHtml(item.applicantName)}</h3>
              <div class="meta-line">
                <span>สมัคร ${item.entries.length} รุ่น</span>
                <span>รถรวม ${getRegistrationTotalVehicleCount(item)} คัน</span>
                <span>บันทึกเมื่อ ${escapeHtml(formatDate(item.createdAt))}</span>
              </div>
            </div>
            <span class="badge"># ${escapeHtml(item.id.slice(0, 8))}</span>
          </div>

          <div class="registration-entry-list">${entryBlocks}</div>

          <div class="address-block">${escapeHtml(item.address)}${item.contactPhone ? `<br />เบอร์โทร: ${escapeHtml(item.contactPhone)}` : ""}</div>

          <div class="card-actions">
            <button class="action-link" type="button" data-action="edit" data-id="${item.id}">
              แก้ไข
            </button>
            <button class="action-link" type="button" data-action="print" data-id="${item.id}">
              พิมพ์ใบสมัคร
            </button>
            <button
              class="action-link"
              type="button"
              data-action="copy-numbers"
              data-id="${item.id}"
            >
              คัดลอกเลขรถ
            </button>
            <button
              class="action-link"
              data-tone="danger"
              type="button"
              data-action="delete"
              data-id="${item.id}"
            >
              ลบ
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  renderRegistrationPagination(registrations.length, pageCount);
}

function applyRegistrations(registrations) {
  state.registrations = registrations.map((registration) => {
    return buildRegistrationViewModel(registration);
  });
  clampRegistrationPage(state.registrations.length);
  renderRegistrations();
  renderClassList();
  renderSummaryPreview();
  updateSummaryStats();
}

async function refreshData() {
  const [meta, registrations] = await Promise.all([
    api("/api/meta"),
    api("/api/registrations"),
  ]);

  state.classes = meta.classes;
  state.maxVehicles = meta.maxVehicles;
  syncSummarySelection();
  renderClassOptions();
  renderSummaryClassOptions();
  applyRegistrations(registrations.registrations);
}

function resetForm() {
  if (!hasElement("registrationForm")) {
    state.editingId = null;
    return;
  }

  const shouldCloseApplicantModal =
    currentPage === "applicants" &&
    hasElement("applicantEditModal") &&
    !elements.applicantEditModal.hidden;

  state.editingId = null;
  clearRequestedRegistrationId();
  elements.registrationForm.reset();
  resetTeamContactFieldValidation();
  if (hasElement("formModeBadge")) {
    elements.formModeBadge.textContent =
      currentPage === "applicants" ? "แก้ไขข้อมูลในรายการ" : "สร้างรายการใหม่";
  }
  if (hasElement("submitButton")) {
    elements.submitButton.textContent =
      currentPage === "applicants" ? "อัปเดตข้อมูล" : "บันทึกข้อมูล";
  }
  renderClassEntries([createEmptyRegistrationEntry()]);

  if (shouldCloseApplicantModal) {
    closeApplicantEditModal();
  }

  setStatus(
    currentPage === "applicants" ? getApplicantEditModalReadyMessage() : getDefaultStatusMessage(),
  );

  if (currentPage === "applicants") {
    return;
  }

  window.requestAnimationFrame(() => {
    focusApplicantNameInput();
  });
}

function fillForm(registration) {
  if (!hasElement("registrationForm")) {
    return;
  }

  state.editingId = registration.id;
  resetTeamContactFieldValidation();
  elements.registrationForm.applicantName.value = registration.applicantName;
  elements.registrationForm.address.value = registration.address;
  elements.registrationForm.contactPhone.value = registration.contactPhone || "";
  elements.formModeBadge.textContent = "โหมดแก้ไขข้อมูล";
  elements.submitButton.textContent = "อัปเดตข้อมูล";
  renderClassEntries((registration.entries || []).map((entry) => {
    return {
      raceClass: entry.raceClass,
      vehicleCount: entry.vehicleCount,
      bikeNumbers: [...(entry.bikeNumbers || [])],
    };
  }));
  setStatus(`กำลังแก้ไขข้อมูลของ ${registration.applicantName}`, "warning");
  scrollRegistrationFormIntoView();
  window.requestAnimationFrame(() => {
    focusApplicantNameInput(true);
  });
}

async function loadInitialData() {
  renderSummaryTemplates();
  await refreshData();
  renderPrintColumnConfigurator();
  renderClassEntries([createEmptyRegistrationEntry()]);
}

function buildPrintShell(title, body) {
  const usesSummaryLayout = body.includes("summary-sheet");
  const usesBracketLayout = body.includes("summary-sheet-bracket");
  const printBodyClass = usesSummaryLayout
    ? "print-body print-body-summary"
    : "print-body print-body-standard";
  const stylesheetLink = usesSummaryLayout
    ? `<link rel="stylesheet" href="${escapeHtml(getStylesheetUrl())}" />`
    : "";
  const renderedBody = usesSummaryLayout
    ? `
      <div class="summary-preview-shell print-summary-shell">
        <div class="${usesBracketLayout ? "summary-preview-paper summary-preview-paper-bracket" : "summary-preview-paper"}">
          ${body}
        </div>
      </div>
    `
    : body;
  return `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        ${stylesheetLink}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }

          body {
            margin: 0;
            color: #111;
            font-family: Tahoma, "Segoe UI", sans-serif;
            background:
              linear-gradient(135deg, rgba(214, 20, 43, 0.1), transparent 32%),
              #fff;
          }

          .print-body {
            box-sizing: border-box;
          }

          .print-body-standard {
            padding: 8mm;
          }

          .print-body-summary {
            padding: 16px;
          }

          body.print-body-summary {
            background: #fff;
          }

          .print-summary-shell {
            max-width: calc(210mm + 32px);
            margin: 0 auto;
          }

          .print-body-summary .summary-preview-shell {
            padding: 0;
            border: 0;
            border-radius: 0;
            background: #fff;
            overflow: visible;
          }

          .print-body-summary .summary-preview-paper {
            background: #fff;
          }

          .print-body-summary .summary-preview-paper .summary-sheet {
            border: 0;
            box-shadow: none;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }

          p {
            margin: 6px 0;
            line-height: 1.6;
          }

          hr {
            border: 0;
            border-top: 1px dashed rgba(17, 17, 17, 0.18);
            margin: 16px 0;
          }

          .sheet {
            border: 2px solid #111;
            border-radius: 18px;
            padding: 24px;
            background:
              linear-gradient(180deg, rgba(214, 20, 43, 0.06), transparent 80px),
              #fff;
          }

          .print-banner {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 14px;
            margin-bottom: 18px;
            padding-bottom: 14px;
            border-bottom: 2px solid #111;
          }

          .print-banner-copy {
            display: flex;
            align-items: center;
            gap: 14px;
            min-width: 0;
          }

          .print-logo {
            width: 126px;
            height: auto;
            flex: 0 0 auto;
          }

          .print-brand-text {
            min-width: 0;
          }

          .print-kicker {
            margin: 0 0 6px;
            color: #9c1022;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
          }

          .print-lockup {
            color: #d6142b;
            font-size: 30px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: 0.04em;
          }

          .print-subtitle {
            margin-top: 4px;
            color: #111;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.12em;
          }

          .print-chip {
            padding: 8px 12px;
            border: 1px solid #111;
            border-radius: 999px;
            background: #111;
            color: #fff;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .row {
            margin-top: 14px;
          }

          .numbers {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 8px;
          }

          .entry-block + .entry-block {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed rgba(17, 17, 17, 0.18);
          }

          .pill {
            padding: 7px 10px;
            border-radius: 999px;
            border: 1px solid #111;
            font-weight: 700;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }

          th,
          td {
            border: 1px solid #111;
            padding: 8px 6px;
            text-align: left;
            vertical-align: top;
            white-space: pre-line;
          }

          .muted {
            color: #444;
            font-size: 14px;
          }

          @media print {
            body.print-body-summary {
              padding: 0;
              background: #fff !important;
            }

            body.print-body-summary .summary-preview-shell {
              padding: 0;
              border: 0;
              border-radius: 0;
              background: transparent;
              overflow: visible;
            }

            body.print-body-summary .summary-preview-paper {
              gap: 0;
            }

            body.print-body-summary .summary-preview-paper .summary-sheet {
              margin: 0 auto;
              border: 0;
              box-shadow: none;
              page-break-after: always;
            }

            body.print-body-summary .summary-preview-paper .summary-sheet:last-child {
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body class="${printBodyClass}">${renderedBody}</body>
    </html>
  `;
}

function openPrintWindow(title, body) {
  const printWindow = window.open("", "_blank", "width=1100,height=900");
  if (!printWindow) {
    setStatus("เบราว์เซอร์บล็อกหน้าต่างสำหรับพิมพ์ กรุณาอนุญาต popup", "danger");
    return;
  }

  let hasPrinted = false;
  const triggerPrint = () => {
    if (hasPrinted || printWindow.closed) {
      return;
    }

    hasPrinted = true;
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 80);
  };

  printWindow.document.write(buildPrintShell(title, body));
  printWindow.document.close();

  printWindow.addEventListener("load", () => {
    if (typeof printWindow.requestAnimationFrame === "function") {
      printWindow.requestAnimationFrame(() => {
        printWindow.requestAnimationFrame(triggerPrint);
      });
      return;
    }

    window.setTimeout(triggerPrint, 120);
  }, { once: true });

  window.setTimeout(triggerPrint, 1000);
}

function printRegistration(registration) {
  const entrySections = (registration.entries || [])
    .map((entry) => {
      const numbers = (entry.bikeNumbers || [])
        .map((value) => `<span class="pill">${escapeHtml(value)}</span>`)
        .join("");

      return `
        <div class="entry-block">
          <div class="row"><strong>รุ่นที่สมัคร:</strong> ${escapeHtml(entry.raceClass)}</div>
          <div class="row"><strong>จำนวนรถที่จะลงแข่ง:</strong> ${entry.vehicleCount} คัน</div>
          <div class="row">
            <strong>หมายเลขรถที่ลงแข่ง:</strong>
            <div class="numbers">${numbers}</div>
          </div>
        </div>
      `;
    })
    .join("");

  const body = `
    <section class="sheet">
      ${buildPrintBrandBanner("ใบสมัคร")}
      <h1>ใบสมัครแข่งขัน ${escapeHtml(EVENT_LOCKUP)}</h1>
      <p class="muted">พิมพ์เมื่อ ${escapeHtml(formatDate(new Date().toISOString()))}</p>
      <div class="row"><strong>ชื่อผู้สมัคร:</strong> ${escapeHtml(registration.applicantName)}</div>
      <div class="row"><strong>ที่อยู่:</strong> ${escapeHtml(registration.address)}</div>
      <div class="row"><strong>เบอร์โทรติดต่อ:</strong> ${escapeHtml(registration.contactPhone || "-")}</div>
      <div class="row"><strong>สมัครทั้งหมด:</strong> ${registration.entries.length} รุ่น | รถรวม ${getRegistrationTotalVehicleCount(registration)} คัน</div>
      ${entrySections}
    </section>
  `;

  openPrintWindow(`${EVENT_BRAND.fullName} | ใบสมัคร ${registration.applicantName}`, body);
}

function formatPrintColumnValue(columnId, registration, index) {
  switch (columnId) {
    case "rowNumber":
      return String(index + 1);
    case "entryCode":
      return registration.id ? registration.id.slice(0, 8) : "-";
    case "applicantName":
      return registration.applicantName || "-";
    case "raceClass":
      return getRegistrationClassNames(registration).join(" | ") || "-";
    case "vehicleCount":
      return `${getRegistrationTotalVehicleCount(registration)} คัน`;
    case "bikeNumbers":
      return getRegistrationAllBikeNumbers(registration).length > 0
        ? getRegistrationAllBikeNumbers(registration).join(", ")
        : "-";
    case "address":
      return registration.address || "-";
    case "contactPhone":
      return registration.contactPhone || "-";
    case "createdAt":
      return formatDate(registration.createdAt);
    case "updatedAt":
      return formatDate(registration.updatedAt);
    default:
      return "-";
  }
}

function printAllRegistrations() {
  const registrations = getFilteredRegistrations();

  if (registrations.length === 0) {
    setStatus("ยังไม่มีข้อมูลสำหรับพิมพ์รายการรวม", "warning");
    return;
  }

  const activeColumns = getPrintColumnsInUse()
    .map((item) => getPrintColumnDefinition(item.id))
    .filter(Boolean);

  if (activeColumns.length === 0) {
    setStatus("กรุณาเลือกอย่างน้อย 1 คอลัมน์ก่อนพิมพ์รายการรวม", "warning");
    return;
  }

  const headers = activeColumns
    .map((column) => `<th>${escapeHtml(column.header)}</th>`)
    .join("");
  const rows = registrations
    .map((item, index) => {
      const cells = activeColumns
        .map((column) => {
          return `<td>${escapeHtml(formatPrintColumnValue(column.id, item, index))}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");
  const filterText = elements.searchInput?.value.trim() || "";
  const filterNote = filterText
    ? `<p class="muted">พิมพ์จากผลค้นหา: ${escapeHtml(filterText)}</p>`
    : "";

  const body = `
    <section class="sheet">
      ${buildPrintBrandBanner("รายชื่อผู้สมัคร")}
      <h1>รายการผู้สมัคร ${escapeHtml(EVENT_LOCKUP)}</h1>
      <p class="muted">จำนวนรายการ ${registrations.length} รายการ</p>
      ${filterNote}
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;

  openPrintWindow(`${EVENT_BRAND.fullName} | รายการผู้สมัครทั้งหมด`, body);
}

function printSummaryDocument() {
  const summaryDocument = buildSummaryDocument();
  if (!state.selectedSummaryClass) {
    setStatus("กรุณาเลือกรุ่นแข่งขันก่อนพิมพ์หน้าสรุป", "warning");
    return;
  }

  openPrintWindow(summaryDocument.title, summaryDocument.html);
}

function printBlankSummaryDocument() {
  const summaryDocument = buildSummaryDocument({ blank: true });
  if (!state.selectedSummaryClass) {
    setStatus("กรุณาเลือกรุ่นแข่งขันก่อนพิมพ์แบบเปล่า", "warning");
    return;
  }

  openPrintWindow(summaryDocument.title, summaryDocument.html);
}

async function addClass(className) {
  return api("/api/meta/classes", {
    method: "POST",
    body: JSON.stringify({ className }),
  });
}

async function renameClass(currentName, nextName) {
  return api("/api/meta/classes/rename", {
    method: "PUT",
    body: JSON.stringify({ currentName, nextName }),
  });
}

async function deleteClass(className) {
  return api(`/api/meta/classes/${encodeURIComponent(className)}`, {
    method: "DELETE",
  });
}

async function handleClassSubmit(event) {
  event.preventDefault();
  if (!hasElement("newClassInput")) {
    return;
  }

  const className = elements.newClassInput.value.trim();

  if (!className) {
    setStatus("กรุณากรอกชื่อรุ่นที่ต้องการเพิ่ม", "warning");
    return;
  }

  try {
    await addClass(className);
    elements.newClassInput.value = "";
    await refreshData();
    setStatus(`เพิ่มรุ่นแข่งขัน ${className} เรียบร้อยแล้ว`);
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

function startClassEdit(className) {
  state.editingClassName = className;
  renderClassList();
}

function cancelClassEdit() {
  state.editingClassName = null;
  renderClassList();
}

async function handleClassRename(currentName, nextName) {
  if (!nextName) {
    setStatus("กรุณากรอกชื่อรุ่นแข่งขันใหม่", "warning");
    return;
  }

  const draftEntries = collectRegistrationEntries().map((entry) => {
    if (normalizeText(entry.raceClass) !== normalizeText(currentName)) {
      return entry;
    }

    return {
      ...entry,
      raceClass: nextName,
    };
  });

  try {
    state.editingClassName = null;
    await renameClass(currentName, nextName);
    await refreshData();
    renderClassEntries(draftEntries);
    setStatus(`แก้ไขชื่อรุ่นจาก ${currentName} เป็น ${nextName} เรียบร้อยแล้ว`);
  } catch (error) {
    state.editingClassName = currentName;
    renderClassList();
    setStatus(error.message, "danger");
  }
}

async function handleClassRemoval(className) {
  const confirmed = window.confirm(`ยืนยันการลบรุ่นแข่งขัน ${className} ?`);
  if (!confirmed) {
    return;
  }

  const draftEntries = collectRegistrationEntries().map((entry) => {
    if (normalizeText(entry.raceClass) !== normalizeText(className)) {
      return entry;
    }

    return {
      ...entry,
      raceClass: "",
    };
  });

  try {
    await deleteClass(className);
    await refreshData();
    renderClassEntries(draftEntries);
    setStatus(`ลบรุ่นแข่งขัน ${className} เรียบร้อยแล้ว`);
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

function getRegistrationPayload() {
  if (!hasElement("registrationForm")) {
    return null;
  }

  const entries = collectRegistrationEntries().map((entry) => {
    return {
      raceClass: entry.raceClass,
      vehicleCount: entry.vehicleCount,
      bikeNumbers: entry.bikeNumbers
        .slice(0, entry.vehicleCount)
        .map((value) => value.trim()),
    };
  });

  return {
    applicantName: elements.registrationForm.applicantName.value.trim(),
    address: elements.registrationForm.address.value.trim(),
    contactPhone: elements.registrationForm.contactPhone.value.trim(),
    entries,
  };
}

async function reloadRegistrations() {
  const registrations = await api("/api/registrations");
  applyRegistrations(registrations.registrations);
}

async function handleSubmit(event) {
  event.preventDefault();
  if (!validateTeamContactFields({ showValidationMessage: true })) {
    setStatus("กรุณากรอกข้อมูลทีมและการติดต่อให้ครบทุกช่อง", "warning");
    return;
  }

  const isEditing = Boolean(state.editingId);
  const payload = getRegistrationPayload();
  if (!payload) {
    return;
  }

  const path = state.editingId
    ? `/api/registrations/${state.editingId}`
    : "/api/registrations";
  const method = state.editingId ? "PUT" : "POST";

  try {
    const result = await api(path, {
      method,
      body: JSON.stringify(payload),
    });

    await reloadRegistrations();

    const message = isEditing
      ? "อัปเดตข้อมูลผู้สมัครเรียบร้อยแล้ว"
      : "บันทึกข้อมูลผู้สมัครเรียบร้อยแล้ว";
    resetForm();
    if (Array.isArray(result.bikeNumberWarnings) && result.bikeNumberWarnings.length > 0) {
      setStatus(
        `${message} | เตือนเลขรถซ้ำกับทีมอื่น: ${formatBikeNumberWarnings(result.bikeNumberWarnings, 3)}`,
        "warning",
      );
      return;
    }

    setStatus(message);
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

async function handleDelete(id) {
  const registration = state.registrations.find((item) => item.id === id);
  if (!registration) {
    return;
  }

  const confirmed = window.confirm(
    `ยืนยันการลบข้อมูลของ ${registration.applicantName} ?`,
  );

  if (!confirmed) {
    return;
  }

  try {
    await api(`/api/registrations/${id}`, { method: "DELETE" });
    if (state.editingId === id) {
      resetForm();
    }
    await reloadRegistrations();
    setStatus(`ลบข้อมูลของ ${registration.applicantName} เรียบร้อยแล้ว`);
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

async function handleCopyNumbers(id) {
  const registration = state.registrations.find((item) => item.id === id);
  if (!registration) {
    return;
  }

  const text = (registration.entries || [])
    .map((entry) => {
      const numbers = (entry.bikeNumbers || []).join(", ");
      return `${entry.raceClass}: ${numbers || "-"}`;
    })
    .join(" | ");

  try {
    await navigator.clipboard.writeText(text);
    setStatus(`คัดลอกหมายเลขรถแล้ว: ${text}`);
  } catch {
    setStatus("ไม่สามารถคัดลอกข้อความอัตโนมัติได้", "warning");
  }
}

function applyRequestedRegistrationEdit() {
  if (!hasElement("registrationForm")) {
    return false;
  }

  const requestedId = getRequestedRegistrationId();
  if (!requestedId) {
    return false;
  }

  const registration = state.registrations.find((item) => item.id === requestedId);
  if (!registration) {
    clearRequestedRegistrationId();
    setStatus("ไม่พบข้อมูลผู้สมัครที่ต้องการแก้ไข", "warning");
    return true;
  }

  if (currentPage === "applicants" && hasElement("applicantEditModal")) {
    openApplicantEditModal(registration);
    return true;
  }

  fillForm(registration);
  return true;
}

function bindIfPresent(element, eventName, handler) {
  if (!element) {
    return;
  }

  element.addEventListener(eventName, handler);
}

function bindEvents() {
  bindIfPresent(elements.cancelEditButton, "click", resetForm);
  bindIfPresent(elements.closeApplicantEditModalButton, "click", () => {
    resetForm();
  });
  bindIfPresent(elements.closeApplicantEditModalButtonSecondary, "click", () => {
    resetForm();
  });
  bindIfPresent(elements.addClassEntryButton, "click", () => {
    const entries = collectRegistrationEntries();
    const nextEntryIndex = entries.length;
    entries.push(createEmptyRegistrationEntry());
    renderClassEntries(entries);
    window.requestAnimationFrame(() => {
      focusClassEntryField(nextEntryIndex, "raceClass");
    });
  });
  bindIfPresent(elements.classForm, "submit", handleClassSubmit);
  for (const field of REQUIRED_TEAM_CONTACT_FIELDS) {
    const input = getRegistrationFormField(field.name);
    bindIfPresent(input, "input", () => {
      validateTeamContactFields();
    });
    bindIfPresent(input, "blur", () => {
      validateTeamContactFields();
    });
  }
  bindIfPresent(elements.classEntriesContainer, "click", (event) => {
    const target = event.target.closest("[data-action='remove-class-entry']");
    if (!target) {
      return;
    }

    const entryIndex = Number.parseInt(target.dataset.entryIndex, 10);
    if (!Number.isInteger(entryIndex)) {
      return;
    }

    const entries = collectRegistrationEntries();
    entries.splice(entryIndex, 1);
    renderClassEntries(entries);
  });
  bindIfPresent(elements.classEntriesContainer, "change", (event) => {
    const target = event.target.closest("[data-entry-field]");
    if (!target) {
      return;
    }

    const entryCard = target.closest("[data-entry-index]");
    const entryIndex = Number.parseInt(entryCard?.dataset.entryIndex, 10);
    if (!Number.isInteger(entryIndex)) {
      return;
    }

    if (target.dataset.entryField === "bikeNumber") {
      renderClassEntries(collectRegistrationEntries());
      return;
    }

    if (target.dataset.entryField !== "vehicleCount") {
      return;
    }

    const entries = collectRegistrationEntries();
    entries[entryIndex] = {
      ...entries[entryIndex],
      vehicleCount: target.value,
    };
    renderClassEntries(entries);
    window.requestAnimationFrame(() => {
      focusClassEntryField(entryIndex, "bikeNumber");
    });
  });
  bindIfPresent(elements.registrationForm, "submit", handleSubmit);
  bindIfPresent(elements.applicantEditModal, "click", (event) => {
    if (event.target !== elements.applicantEditModal) {
      return;
    }

    resetForm();
  });
  bindIfPresent(elements.openPrintModalButton, "click", openPrintModal);
  bindIfPresent(elements.closePrintModalButton, "click", () => {
    closePrintModal();
  });
  bindIfPresent(elements.closePrintModalButtonSecondary, "click", () => {
    closePrintModal();
  });
  bindIfPresent(elements.printModal, "click", (event) => {
    if (event.target !== elements.printModal) {
      return;
    }

    closePrintModal();
  });
  bindIfPresent(elements.resetPrintColumnsButton, "click", resetPrintColumns);
  bindIfPresent(elements.searchInput, "input", () => {
    resetRegistrationPage();
    renderRegistrations();
  });
  bindIfPresent(elements.printAllButton, "click", printAllRegistrations);
  bindIfPresent(elements.printBlankSummaryButton, "click", printBlankSummaryDocument);
  bindIfPresent(elements.printSummaryButton, "click", printSummaryDocument);
  document.addEventListener("keydown", (event) => {
    const isApplicantEditModalOpen =
      hasElement("applicantEditModal") && !elements.applicantEditModal.hidden;

    if (
      event.key === "/" &&
      hasElement("searchInput") &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !isApplicantEditModalOpen &&
      !isEditableTarget(event.target)
    ) {
      event.preventDefault();
      elements.searchInput.focus();
      elements.searchInput.select();
      return;
    }

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key === "Enter" &&
      hasElement("registrationForm") &&
      elements.registrationForm.contains(document.activeElement)
    ) {
      event.preventDefault();
      elements.registrationForm.requestSubmit();
      return;
    }

    if (
      event.key === "Escape" &&
      hasElement("searchInput") &&
      document.activeElement === elements.searchInput &&
      elements.searchInput.value
    ) {
      elements.searchInput.value = "";
      resetRegistrationPage();
      renderRegistrations();
      return;
    }

    if (event.key === "Escape") {
      if (hasElement("applicantEditModal") && !elements.applicantEditModal.hidden) {
        resetForm();
        return;
      }

      closePrintModal();
    }
  });

  bindIfPresent(elements.summaryClassSelect, "change", (event) => {
    state.selectedSummaryClass = event.target.value;
    renderSummaryPreview();
  });

  bindIfPresent(elements.summaryBlankBracketSizeSelect, "change", (event) => {
    state.selectedBlankBracketSize = event.target.value === "8" ? "8" : "16";
    renderBlankBracketSizeControl();
    renderSummaryPreview();
  });

  bindIfPresent(elements.summaryTemplateList, "click", (event) => {
    const target = event.target.closest("[data-template-id]");
    if (!target) {
      return;
    }

    state.selectedSummaryTemplate = target.dataset.templateId;
    renderSummaryTemplates();
    renderSummaryPreview();
  });

  bindIfPresent(elements.summaryPreview, "input", (event) => {
    const timingTarget = event.target instanceof Element
      ? event.target.closest("[data-action='timing-input']")
      : null;
    if (timingTarget) {
      handleTimingSheetInput(timingTarget);
    }
  });

  bindIfPresent(elements.summaryPreview, "change", (event) => {
    if (!state.selectedSummaryClass) {
      return;
    }

    const timingTarget = event.target instanceof Element
      ? event.target.closest("[data-action='timing-input']")
      : null;
    if (timingTarget) {
      handleTimingSheetInput(timingTarget);
      return;
    }

    const bracketTarget = event.target instanceof Element
      ? event.target.closest("[data-action='bracket-select']")
      : null;
    if (bracketTarget) {
      setBracketSelection(
        state.selectedSummaryClass,
        Number.parseInt(bracketTarget.dataset.roundIndex, 10),
        Number.parseInt(bracketTarget.dataset.slotIndex, 10),
        bracketTarget.value,
      );
      renderSummaryPreview();
      return;
    }

    const thirdPlaceTarget = event.target instanceof Element
      ? event.target.closest("[data-action='bracket-third-place-select']")
      : null;
    if (thirdPlaceTarget) {
      setThirdPlaceWinner(state.selectedSummaryClass, thirdPlaceTarget.value);
      renderSummaryPreview();
    }
  });

  bindIfPresent(elements.summaryPreview, "click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("[data-action='reset-bracket']")
      : null;
    if (!target || !state.selectedSummaryClass) {
      return;
    }

    resetBracketSelections(state.selectedSummaryClass);
    renderSummaryPreview();
    setStatus(`ล้างสายประกบของรุ่น ${state.selectedSummaryClass} แล้ว`);
  });

  bindIfPresent(elements.printColumnList, "change", (event) => {
    const target = event.target.closest("[data-action='toggle-print-column']");
    if (!target) {
      return;
    }

    togglePrintColumn(target.dataset.id, target.checked);
  });

  bindIfPresent(elements.printColumnList, "click", (event) => {
    const target = event.target.closest("[data-action='move-print-column']");
    if (!target) {
      return;
    }

    movePrintColumn(target.dataset.id, target.dataset.direction);
  });

  bindIfPresent(elements.classList, "click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const { action, class: className } = target.dataset;

    if (action === "edit-class") {
      startClassEdit(className);
      return;
    }

    if (action === "cancel-class-edit") {
      cancelClassEdit();
      return;
    }

    if (action === "remove-class") {
      handleClassRemoval(className);
    }
  });

  bindIfPresent(elements.classList, "submit", (event) => {
    const form = event.target.closest("form[data-class]");
    if (!form) {
      return;
    }

    event.preventDefault();
    handleClassRename(form.dataset.class, form.classNameEdit.value.trim());
  });

  bindIfPresent(elements.registrationList, "click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const { action, id } = target.dataset;
    const registration = state.registrations.find((item) => item.id === id);

    if (action === "edit" && registration) {
      openRegistrationEditor(registration.id);
      return;
    }

    if (action === "print" && registration) {
      printRegistration(registration);
      return;
    }

    if (action === "copy-numbers") {
      handleCopyNumbers(id);
      return;
    }

    if (action === "delete") {
      handleDelete(id);
    }
  });

  bindIfPresent(elements.registrationPagination, "click", (event) => {
    const target = event.target.closest("[data-action='go-to-page']");
    if (!target || target.disabled) {
      return;
    }

    goToRegistrationPage(Number.parseInt(target.dataset.page, 10));
  });
}

async function init() {
  bindEvents();

  try {
    await loadInitialData();
    if (!applyRequestedRegistrationEdit()) {
      setStatus(getDefaultStatusMessage());
    }
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

init();



















