const PRINT_COLUMNS_STORAGE_KEY = "drag-bike-print-columns";
const BRACKET_SELECTIONS_STORAGE_KEY = "drag-bike-bracket-selections-v1";
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
  },
  {
    id: "with-vehicle-numbers",
    label: "รายชื่อพร้อมรถและเลขรถ",
    description: "แสดงชื่อผู้สมัคร จำนวนรถ และหมายเลขรถในตารางเดียว",
  },
  {
    id: "timing-sheet",
    label: "ตารางจับเวลา",
    description: "สำหรับจดเวลารอบ 1 รอบ 2 เวลาที่ดีที่สุด และอันดับ",
  },
  {
    id: "bracket-12",
    label: "Tournament Bracket",
    description: "รอบแรกเลือกทีมเองด้วย dropdown และรอบต่อไปเลือกผู้ชนะจากคู่ก่อนหน้า",
  },
];
const DEFAULT_SUMMARY_TEMPLATE_ID = "with-vehicle-numbers";
const SUMMARY_ROWS = {
  "name-only": 24,
  "with-vehicle-numbers": 24,
  "timing-sheet": 25,
};

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

const state = {
  classes: [],
  registrations: [],
  maxVehicles: 20,
  editingId: null,
  editingClassName: null,
  printColumns: loadPrintColumnsPreference(),
  selectedSummaryClass: "",
  selectedSummaryTemplate: DEFAULT_SUMMARY_TEMPLATE_ID,
  bracketSelections: loadBracketSelectionsPreference(),
};

const elements = {
  applicantCount: document.querySelector("#applicantCount"),
  bikeNumbersContainer: document.querySelector("#bikeNumbersContainer"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  classCountBadge: document.querySelector("#classCountBadge"),
  classForm: document.querySelector("#classForm"),
  classList: document.querySelector("#classList"),
  formModeBadge: document.querySelector("#formModeBadge"),
  newClassInput: document.querySelector("#newClassInput"),
  printAllButton: document.querySelector("#printAllButton"),
  printColumnList: document.querySelector("#printColumnList"),
  printColumnSummary: document.querySelector("#printColumnSummary"),
  printSummaryButton: document.querySelector("#printSummaryButton"),
  raceClass: document.querySelector("#raceClass"),
  registrationForm: document.querySelector("#registrationForm"),
  registrationList: document.querySelector("#registrationList"),
  resetPrintColumnsButton: document.querySelector("#resetPrintColumnsButton"),
  searchInput: document.querySelector("#searchInput"),
  statusBanner: document.querySelector("#statusBanner"),
  submitButton: document.querySelector("#submitButton"),
  summaryClassSelect: document.querySelector("#summaryClassSelect"),
  summaryPreview: document.querySelector("#summaryPreview"),
  summaryPreviewMeta: document.querySelector("#summaryPreviewMeta"),
  summaryTemplateList: document.querySelector("#summaryTemplateList"),
  vehicleCount: document.querySelector("#vehicleCount"),
  vehicleCountStat: document.querySelector("#vehicleCountStat"),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
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

function setStatus(message, tone = "success") {
  elements.statusBanner.textContent = message;
  if (tone === "success") {
    elements.statusBanner.removeAttribute("data-tone");
    return;
  }

  elements.statusBanner.setAttribute("data-tone", tone);
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
  elements.applicantCount.textContent = state.registrations.length.toString();

  const totalVehicles = state.registrations.reduce((total, item) => {
    return total + Number(item.vehicleCount || 0);
  }, 0);

  elements.vehicleCountStat.textContent = totalVehicles.toString();
}

function sortRegistrationsForSummary(registrations) {
  return [...registrations].sort((left, right) => {
    return String(left.createdAt || "").localeCompare(String(right.createdAt || ""));
  });
}

function findMatchingClassName(className) {
  return state.classes.find((item) => normalizeText(item) === normalizeText(className));
}

function selectRaceClass(className) {
  const match = findMatchingClassName(className);
  elements.raceClass.value = match || "";
}

function renderClassOptions(preferredValue = elements.raceClass.value) {
  const options = state.classes
    .map((className) => {
      return `<option value="${escapeHtml(className)}">${escapeHtml(className)}</option>`;
    })
    .join("");

  elements.raceClass.innerHTML = `<option value="">เลือกรุ่นแข่งขัน</option>${options}`;
  selectRaceClass(preferredValue);
}

function getClassUsageCount(className) {
  return state.registrations.filter((item) => {
    return normalizeText(item.raceClass) === normalizeText(className);
  }).length;
}

function renderClassList() {
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
  elements.summaryTemplateList.innerHTML = SUMMARY_TEMPLATES.map((template) => {
    const isActive = template.id === state.selectedSummaryTemplate;
    return `
      <button
        class="summary-template-button ${isActive ? "is-active" : ""}"
        type="button"
        data-template-id="${template.id}"
      >
        <strong>${escapeHtml(template.label)}</strong>
        <span>${escapeHtml(template.description)}</span>
      </button>
    `;
  }).join("");
}

function getRegistrationsForClass(className) {
  return sortRegistrationsForSummary(
    state.registrations.filter((item) => {
      return normalizeText(item.raceClass) === normalizeText(className);
    }),
  );
}

function getBikeEntriesForClass(className) {
  return getRegistrationsForClass(className).flatMap((registration) => {
    const bikeNumbers = Array.isArray(registration.bikeNumbers) && registration.bikeNumbers.length > 0
      ? registration.bikeNumbers
      : [""];

    return bikeNumbers.map((bikeNumber, index) => {
      return {
        applicantName: registration.applicantName,
        bikeNumber,
        registrationId: registration.id,
        contactPhone: registration.contactPhone,
        order: `${registration.createdAt || ""}-${index}`,
      };
    });
  });
}

function getSummaryTemplate(templateId) {
  return SUMMARY_TEMPLATES.find((template) => template.id === templateId);
}

function buildSummaryTable(columns, rows, minimumRows, className, extraClass = "") {
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
  const body = filledRows
    .map((row) => {
      const cells = row
        .map((cell) => `<td>${escapeHtml(cell)}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <section class="summary-sheet ${extraClass}">
      <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
      <table class="summary-sheet-table">
        <colgroup>${colgroup}</colgroup>
        <thead>
          <tr>${head}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>
  `;
}

function buildNameOnlySummary(className) {
  const rows = getRegistrationsForClass(className).map((registration) => {
    return [registration.applicantName || ""];
  });

  return buildSummaryTable(
    [{ header: "ชื่อผู้สมัคร (ชื่อร้านค้า/ชื่อทีม)", width: "100%" }],
    rows,
    SUMMARY_ROWS["name-only"],
    className,
    "summary-sheet-name-only",
  );
}

function buildVehicleSummary(className) {
  const rows = getRegistrationsForClass(className).map((registration) => {
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
    SUMMARY_ROWS["with-vehicle-numbers"],
    className,
    "summary-sheet-vehicle-list",
  );
}

function buildTimingSummary(className) {
  const rows = getBikeEntriesForClass(className).map((entry) => {
    return [entry.applicantName || "", entry.bikeNumber || "", "", "", "", ""];
  });

  return buildSummaryTable(
    [
      { header: "ชื่อทีมแข่ง", width: "38%" },
      { header: "หมายเลขรถ", width: "14%" },
      { header: "เวลารอบที่ 1", width: "14%" },
      { header: "เวลารอบที่ 2", width: "14%" },
      { header: "เวลาที่ดีที่สุด", width: "14%" },
      { header: "อันดับ", width: "10%" },
    ],
    rows,
    SUMMARY_ROWS["timing-sheet"],
    className,
    "summary-sheet-timing",
  );
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

function buildBracketPageGroups(rounds) {
  if (rounds.length === 0) {
    return [];
  }

  const groups = [];
  const maxColumnsPerPage = rounds[0].count >= 32 ? 3 : 4;
  let startIndex = 0;

  while (startIndex < rounds.length) {
    const endIndex = Math.min(rounds.length - 1, startIndex + (maxColumnsPerPage - 1));
    groups.push({
      startIndex,
      rounds: rounds.slice(startIndex, endIndex + 1),
    });

    if (endIndex === rounds.length - 1) {
      break;
    }

    startIndex = endIndex;
  }

  return groups;
}

function createEmptyBracketSelections(rounds) {
  return rounds.map((round) => {
    return Array.from({ length: round.count }, () => "");
  });
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
    pageGroups: buildBracketPageGroups(rounds),
  };
}

function getStoredBracketSelections(className) {
  return state.bracketSelections[normalizeText(className)]?.rounds || null;
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

function sanitizeBracketSelections(config, inputRounds) {
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

  return rounds;
}

function getBracketRecord(className) {
  const config = getBracketConfig(className);
  const rounds = sanitizeBracketSelections(config, getStoredBracketSelections(className));
  return { config, rounds };
}

function persistBracketSelections(className, rounds) {
  state.bracketSelections[normalizeText(className)] = { rounds };
  saveBracketSelectionsPreference();
}

function resetBracketSelections(className) {
  const { config } = getBracketRecord(className);
  persistBracketSelections(className, createEmptyBracketSelections(config.rounds));
}

function setBracketSelection(className, roundIndex, slotIndex, value) {
  const { config, rounds } = getBracketRecord(className);
  if (!config.rounds[roundIndex]) {
    return;
  }

  if (roundIndex === 0) {
    rounds[0][slotIndex] = config.entryMap.has(value) ? value : "";

    if (value) {
      rounds[0] = rounds[0].map((currentValue, currentIndex) => {
        if (currentIndex !== slotIndex && currentValue === value) {
          return "";
        }

        return currentValue;
      });
    }
  } else {
    const allowedIds = getAllowedBracketOptionIds(config, rounds, roundIndex, slotIndex);
    rounds[roundIndex][slotIndex] = allowedIds.includes(value) ? value : "";
  }

  persistBracketSelections(className, sanitizeBracketSelections(config, rounds));
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

function getBracketPageLayouts(pageGroup, topY, bottomY) {
  const centersByRound = [];
  centersByRound[0] = buildEvenlySpacedCenters(pageGroup.rounds[0].count, topY, bottomY);

  for (let index = 1; index < pageGroup.rounds.length; index += 1) {
    centersByRound[index] = buildNextRoundCenters(centersByRound[index - 1]);
  }

  return pageGroup.rounds.map((round, index) => {
    const centers = centersByRound[index];
    const localStep = centers.length > 1
      ? Math.abs(centers[1] - centers[0])
      : index > 0 && centersByRound[index - 1].length > 1
        ? Math.abs(centersByRound[index - 1][1] - centersByRound[index - 1][0])
        : 96;
    const boxHeight = Math.max(18, Math.min(34, localStep * 0.55));
    const fontSize = Math.max(8, Math.min(12, boxHeight * 0.62));

    return {
      ...round,
      centers,
      boxHeight,
      fontSize,
    };
  });
}

function renderBracketPairConnector(startX, topY, bottomY, nextX, nextY) {
  const elbowX = startX + (nextX - startX) / 2;
  const mergeY = (topY + bottomY) / 2;

  return [
    `<path d="M ${startX} ${topY} H ${elbowX} V ${bottomY}" />`,
    `<path d="M ${startX} ${bottomY} H ${elbowX}" />`,
    `<path d="M ${elbowX} ${mergeY} V ${nextY} H ${nextX}" />`,
  ].join("");
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
      `<option value="">เลือกทีม</option>`,
      ...config.entries.map((entry) => {
        const selected = entry.id === currentValue ? " selected" : "";
        const disabled = usedElsewhere.has(entry.id) ? " disabled" : "";
        return `<option value="${entry.id}"${selected}${disabled}>${escapeHtml(entry.label)}</option>`;
      }),
    ].join("");
  }

  const options = getAllowedBracketOptionIds(config, rounds, roundIndex, slotIndex);
  return [
    `<option value="">เลือกผู้ชนะ</option>`,
    ...options.map((entryId) => {
      const selected = entryId === currentValue ? " selected" : "";
      return `<option value="${entryId}"${selected}>${escapeHtml(config.entryMap.get(entryId)?.shortLabel || "")}</option>`;
    }),
  ].join("");
}

function buildBracketSlotMarkup(config, rounds, absoluteRoundIndex, slotIndex, x, centerY, boxWidth, boxHeight, fontSize, interactive) {
  const viewBoxWidth = 1120;
  const viewBoxHeight = 980;
  const selectedValue = rounds[absoluteRoundIndex][slotIndex] || "";
  const slotClassName = absoluteRoundIndex === rounds.length - 1 ? "bracket-slot champion" : "bracket-slot";
  const style = [
    `left:${(x / viewBoxWidth) * 100}%`,
    `top:${((centerY - boxHeight / 2) / viewBoxHeight) * 100}%`,
    `width:${(boxWidth / viewBoxWidth) * 100}%`,
    `height:${(boxHeight / viewBoxHeight) * 100}%`,
  ].join(";");

  if (interactive) {
    return `
      <div class="${slotClassName}" style="${style}">
        <select
          class="bracket-slot-select"
          style="font-size:${fontSize}px"
          data-action="bracket-select"
          data-round-index="${absoluteRoundIndex}"
          data-slot-index="${slotIndex}"
        >
          ${buildBracketSelectOptions(config, rounds, absoluteRoundIndex, slotIndex)}
        </select>
      </div>
    `;
  }

  return `
    <div class="${slotClassName}" style="${style}">
      <div class="bracket-slot-value" style="font-size:${fontSize}px">${escapeHtml(getBracketEntryLabel(config, selectedValue, 24))}</div>
    </div>
  `;
}

function buildBracketPageMarkup(className, record, pageGroup, pageNumber, totalPages, interactive) {
  const viewBoxWidth = 1120;
  const viewBoxHeight = 980;
  const leftX = 28;
  const columnCount = pageGroup.rounds.length;
  const rightPadding = 32;
  const boxWidth = columnCount >= 4 ? 168 : columnCount === 3 ? 204 : columnCount === 2 ? 240 : 276;
  const labelY = 42;
  const topY = 118;
  const bottomY = 900;
  const xStep = columnCount > 1
    ? (viewBoxWidth - leftX - rightPadding - boxWidth) / (columnCount - 1)
    : 0;

  const layoutRounds = getBracketPageLayouts(pageGroup, topY, bottomY).map((round, index) => {
    return {
      ...round,
      absoluteIndex: pageGroup.startIndex + index,
      x: leftX + xStep * index,
    };
  });

  const labels = layoutRounds.map((round) => {
    return `<text x="${round.x + boxWidth / 2}" y="${labelY}" text-anchor="middle" class="bracket-round-label">${escapeHtml(round.label)}</text>`;
  });

  const connectors = [];
  for (let roundIndex = 0; roundIndex < layoutRounds.length - 1; roundIndex += 1) {
    const currentRound = layoutRounds[roundIndex];
    const nextRound = layoutRounds[roundIndex + 1];

    for (let slotIndex = 0; slotIndex < nextRound.count; slotIndex += 1) {
      connectors.push(
        renderBracketPairConnector(
          currentRound.x + boxWidth,
          currentRound.centers[slotIndex * 2],
          currentRound.centers[slotIndex * 2 + 1],
          nextRound.x,
          nextRound.centers[slotIndex],
        ),
      );
    }
  }

  const slots = layoutRounds.flatMap((round) => {
    return round.centers.map((centerY, slotIndex) => {
      return buildBracketSlotMarkup(
        record.config,
        record.rounds,
        round.absoluteIndex,
        slotIndex,
        round.x,
        centerY,
        boxWidth,
        round.boxHeight,
        round.fontSize,
        interactive,
      );
    });
  }).join("");

  return `
    <section class="summary-sheet summary-sheet-bracket${interactive ? " is-editor" : ""}">
      <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
      <div class="summary-sheet-note">ผู้สมัคร ${record.config.entries.length} ทีม | หน้า ${pageNumber} / ${totalPages}</div>
      <div class="bracket-canvas" style="padding-top:${(viewBoxHeight / viewBoxWidth) * 100}%">
        <svg viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" class="bracket-canvas-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Bracket page ${pageNumber}">
          <g class="bracket-labels">${labels.join("")}</g>
          <g class="bracket-connectors">${connectors.join("")}</g>
        </svg>
        ${slots}
      </div>
    </section>
  `;
}

function buildBracketSummary(className, options = {}) {
  const { interactive = false } = options;
  const record = getBracketRecord(className);

  if (record.config.entries.length < 2) {
    return `
      <section class="summary-sheet summary-sheet-bracket">
        <div class="summary-sheet-title">รุ่น ${escapeHtml(className || "-")}</div>
        <div class="summary-sheet-note">ต้องมีผู้สมัครอย่างน้อย 2 ทีม จึงจะสร้าง Tournament Bracket ได้</div>
      </section>
    `;
  }

  const pages = record.config.pageGroups
    .map((pageGroup, index) => {
      return buildBracketPageMarkup(className, record, pageGroup, index + 1, record.config.pageGroups.length, interactive);
    })
    .join("");

  if (!interactive) {
    return pages;
  }

  return `
    <div class="summary-bracket-editor-actions">
      <div class="summary-bracket-editor-copy">
        รอบแรกเลือกทีมลงแต่ละช่องเองก่อน แล้วรอบถัดไปจะเลือกผู้ชนะได้เฉพาะจากคู่ก่อนหน้าเท่านั้น
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
function buildSummaryDocument() {
  const className = state.selectedSummaryClass;
  const templateId = state.selectedSummaryTemplate;
  const template = getSummaryTemplate(templateId);

  if (!className || !template) {
    return {
      title: "Summary",
      html: `
        <section class="summary-sheet summary-sheet-empty">
          <div class="summary-sheet-title">ยังไม่มีข้อมูลสรุป</div>
          <div class="summary-sheet-note">กรุณาเลือกรุ่นแข่งขันและแบบฟอร์มสรุปก่อน</div>
        </section>
      `,
    };
  }

  if (templateId === "name-only") {
    return {
      title: `${template.label} ${className}`,
      html: buildNameOnlySummary(className),
    };
  }

  if (templateId === "with-vehicle-numbers") {
    return {
      title: `${template.label} ${className}`,
      html: buildVehicleSummary(className),
    };
  }

  if (templateId === "timing-sheet") {
    return {
      title: `${template.label} ${className}`,
      html: buildTimingSummary(className),
    };
  }

  return {
    title: `${template.label} ${className}`,
    html: buildBracketSummary(className),
  };
}

function renderSummaryPreview() {
  const className = state.selectedSummaryClass;
  const summaryDocument = buildSummaryDocument();

  if (!className) {
    elements.summaryPreviewMeta.textContent = "ยังไม่มีรุ่นแข่งขันสำหรับสร้างหน้าสรุป";
    elements.summaryPreview.innerHTML = summaryDocument.html;
    return;
  }

  const isBracketTemplate = state.selectedSummaryTemplate === "bracket-12";
  const previewHtml = isBracketTemplate
    ? buildBracketSummary(className, { interactive: true })
    : summaryDocument.html;

  elements.summaryPreviewMeta.textContent = `${getSummaryMetaText(className)} | แบบพิมพ์: ${getSummaryTemplate(state.selectedSummaryTemplate)?.label || "-"}`;
  elements.summaryPreview.innerHTML = `
    <div class="summary-preview-paper${isBracketTemplate ? " summary-preview-paper-bracket" : ""}">
      ${previewHtml}
    </div>
  `;
}
function clampVehicleCount(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return Math.min(parsed, state.maxVehicles);
}

function collectBikeNumbers() {
  return [...elements.bikeNumbersContainer.querySelectorAll("input")].map(
    (input) => input.value,
  );
}

function renderBikeInputs(count, existingValues = []) {
  elements.vehicleCount.value = count.toString();

  const inputs = Array.from({ length: count }, (_, index) => {
    const value = existingValues[index] || "";
    return `
      <div class="bike-input">
        <label for="bikeNumber-${index + 1}">คันที่ ${index + 1}</label>
        <input
          id="bikeNumber-${index + 1}"
          name="bikeNumber"
          type="text"
          maxlength="20"
          placeholder="หมายเลขรถ"
          value="${escapeHtml(value)}"
          required
        />
      </div>
    `;
  }).join("");

  elements.bikeNumbersContainer.innerHTML = inputs;
}

function getFilteredRegistrations() {
  const term = elements.searchInput.value.trim().toLowerCase();
  if (!term) {
    return state.registrations;
  }

  return state.registrations.filter((item) => {
    const haystack = [
      item.applicantName,
      item.address,
      item.contactPhone,
      item.raceClass,
      ...(item.bikeNumbers || []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  });
}

function renderRegistrations() {
  const registrations = getFilteredRegistrations();

  if (registrations.length === 0) {
    elements.registrationList.innerHTML = `
      <div class="empty-state">
        ยังไม่มีข้อมูลผู้สมัครในรายการนี้ หรือไม่พบข้อมูลจากคำค้นหา
      </div>
    `;
    return;
  }

  elements.registrationList.innerHTML = registrations
    .map((item) => {
      const bikeNumbers = (item.bikeNumbers || [])
        .map((bikeNumber) => `<span class="number-pill">${escapeHtml(bikeNumber)}</span>`)
        .join("");

      return `
        <article class="registration-card">
          <div class="registration-card-header">
            <div>
              <h3>${escapeHtml(item.applicantName)}</h3>
              <div class="meta-line">
                <span>${escapeHtml(item.raceClass)}</span>
                <span>${item.vehicleCount} คัน</span>
                <span>บันทึกเมื่อ ${escapeHtml(formatDate(item.createdAt))}</span>
              </div>
            </div>
            <span class="badge"># ${escapeHtml(item.id.slice(0, 8))}</span>
          </div>

          <div class="numbers-row">${bikeNumbers}</div>

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
}

function applyRegistrations(registrations) {
  state.registrations = registrations;
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
  elements.vehicleCount.max = state.maxVehicles.toString();
  syncSummarySelection();
  renderClassOptions();
  renderSummaryClassOptions();
  applyRegistrations(registrations.registrations);
}

function resetForm() {
  state.editingId = null;
  elements.registrationForm.reset();
  elements.formModeBadge.textContent = "สร้างรายการใหม่";
  elements.submitButton.textContent = "บันทึกข้อมูล";
  renderClassOptions();
  renderBikeInputs(1);
  setStatus("พร้อมบันทึกข้อมูลผู้สมัครใหม่");
}

function fillForm(registration) {
  state.editingId = registration.id;
  elements.registrationForm.applicantName.value = registration.applicantName;
  elements.registrationForm.address.value = registration.address;
  elements.registrationForm.contactPhone.value = registration.contactPhone || "";
  selectRaceClass(registration.raceClass);
  elements.formModeBadge.textContent = "โหมดแก้ไขข้อมูล";
  elements.submitButton.textContent = "อัปเดตข้อมูล";
  renderBikeInputs(registration.vehicleCount, registration.bikeNumbers);
  setStatus(`กำลังแก้ไขข้อมูลของ ${registration.applicantName}`, "warning");
}

async function loadInitialData() {
  renderSummaryTemplates();
  await refreshData();
  renderPrintColumnConfigurator();
  renderBikeInputs(1);
}
function buildPrintShell(title, body) {
  return `
    <!DOCTYPE html>
    <html lang="th">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          body {
            margin: 0;
            color: #111;
            font-family: Tahoma, "Segoe UI", sans-serif;
            background: #fff;
          }

          h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }

          p {
            margin: 6px 0;
            line-height: 1.6;
          }

          .sheet {
            border: 2px solid #111;
            border-radius: 18px;
            padding: 24px;
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

          .summary-sheet {
            width: 100%;
            min-height: calc(297mm - 24mm);
            padding: 18mm 14mm 12mm;
            background: #fff;
            page-break-after: always;
            box-sizing: border-box;
          }

          .summary-sheet:last-child {
            page-break-after: auto;
          }

          .summary-sheet-title {
            margin-bottom: 16px;
            font-size: 22px;
            font-weight: 700;
          }

          .summary-sheet-note {
            margin-bottom: 10px;
            color: #444;
            font-size: 14px;
          }

          .summary-sheet-table {
            margin-top: 0;
            table-layout: fixed;
          }

          .summary-sheet-table th,
          .summary-sheet-table td {
            height: 34px;
            font-size: 15px;
            text-align: center;
          }

          .summary-sheet-table td:first-child {
            text-align: left;
          }

          .summary-bracket-wrap {
            width: 100%;
            overflow: hidden;
          }

          .summary-bracket-svg {
            width: 100%;
            height: auto;
          }

          .bracket-title {
            font-size: 22px;
            font-weight: 700;
          }
          .bracket-page-note {
            fill: #444;
            font-size: 12px;
            font-weight: 600;
          }

          .bracket-round-label,
          .bracket-champion-label {
            font-size: 16px;
            font-weight: 700;
          }

          .bracket-connectors path {
            fill: none;
            stroke: #111;
            stroke-width: 3;
          }

          .bracket-box-group rect {
            fill: #fff;
            stroke: #111;
            stroke-width: 1.5;
          }

          .bracket-box-group.entrant rect {
            fill: #fffdf9;
          }

          .bracket-box-group.champion rect {
            fill: #f7efe2;
          }

          .bracket-box-group text {
            font-size: 12px;
            font-weight: 700;
          }

          .bracket-canvas {
            position: relative;
            width: 100%;
          }

          .bracket-canvas-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
          }

          .bracket-slot {
            position: absolute;
            display: flex;
            align-items: center;
          }

          .bracket-slot-value {
            width: 100%;
            height: 100%;
            padding: 0 10px;
            border: 1.5px solid #111;
            border-radius: 14px;
            background: #fff;
            color: #111;
            display: flex;
            align-items: center;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .bracket-slot.champion .bracket-slot-value {
            background: #f7efe2;
          }
        </style>
      </head>
      <body>${body}</body>
    </html>
  `;
}

function openPrintWindow(title, body) {
  const printWindow = window.open("", "_blank", "width=1100,height=900");
  if (!printWindow) {
    setStatus("เบราว์เซอร์บล็อกหน้าต่างสำหรับพิมพ์ กรุณาอนุญาต popup", "danger");
    return;
  }

  printWindow.document.write(buildPrintShell(title, body));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function printRegistration(registration) {
  const numbers = registration.bikeNumbers
    .map((value) => `<span class="pill">${escapeHtml(value)}</span>`)
    .join("");

  const body = `
    <section class="sheet">
      <h1>ใบสมัครแข่งขันแด็กไบค์</h1>
      <p class="muted">พิมพ์เมื่อ ${escapeHtml(formatDate(new Date().toISOString()))}</p>
      <div class="row"><strong>ชื่อผู้สมัคร:</strong> ${escapeHtml(registration.applicantName)}</div>
      <div class="row"><strong>ที่อยู่:</strong> ${escapeHtml(registration.address)}</div>
      <div class="row"><strong>เบอร์โทรติดต่อ:</strong> ${escapeHtml(registration.contactPhone || "-")}</div>
      <div class="row"><strong>รุ่นที่สมัคร:</strong> ${escapeHtml(registration.raceClass)}</div>
      <div class="row"><strong>จำนวนรถที่จะลงแข่ง:</strong> ${registration.vehicleCount} คัน</div>
      <div class="row">
        <strong>หมายเลขรถที่ลงแข่ง:</strong>
        <div class="numbers">${numbers}</div>
      </div>
    </section>
  `;

  openPrintWindow(`ใบสมัคร ${registration.applicantName}`, body);
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
      return registration.raceClass || "-";
    case "vehicleCount":
      return registration.vehicleCount ? `${registration.vehicleCount} คัน` : "-";
    case "bikeNumbers":
      return Array.isArray(registration.bikeNumbers) && registration.bikeNumbers.length > 0
        ? registration.bikeNumbers.join(", ")
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
  const filterText = elements.searchInput.value.trim();
  const filterNote = filterText
    ? `<p class="muted">พิมพ์จากผลค้นหา: ${escapeHtml(filterText)}</p>`
    : "";

  const body = `
    <section class="sheet">
      <h1>รายการผู้สมัครแข่งขันแด็กไบค์</h1>
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

  openPrintWindow("รายการผู้สมัครทั้งหมด", body);
}

function printSummaryDocument() {
  const summaryDocument = buildSummaryDocument();
  if (!state.selectedSummaryClass) {
    setStatus("กรุณาเลือกรุ่นแข่งขันก่อนพิมพ์หน้าสรุป", "warning");
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

  const previousSelection = elements.raceClass.value;
  const nextSelection =
    normalizeText(previousSelection) === normalizeText(currentName)
      ? nextName
      : previousSelection;

  try {
    state.editingClassName = null;
    await renameClass(currentName, nextName);
    await refreshData();
    selectRaceClass(nextSelection);
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

  const previousSelection = elements.raceClass.value;

  try {
    await deleteClass(className);
    await refreshData();
    if (normalizeText(previousSelection) === normalizeText(className)) {
      elements.raceClass.value = "";
    } else {
      selectRaceClass(previousSelection);
    }
    setStatus(`ลบรุ่นแข่งขัน ${className} เรียบร้อยแล้ว`);
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

function getRegistrationPayload() {
  const vehicleCount = clampVehicleCount(elements.vehicleCount.value);
  const bikeNumbers = collectBikeNumbers()
    .slice(0, vehicleCount)
    .map((value) => value.trim());

  return {
    applicantName: elements.registrationForm.applicantName.value.trim(),
    address: elements.registrationForm.address.value.trim(),
    contactPhone: elements.registrationForm.contactPhone.value.trim(),
    raceClass: elements.raceClass.value,
    vehicleCount,
    bikeNumbers,
  };
}

async function reloadRegistrations() {
  const registrations = await api("/api/registrations");
  applyRegistrations(registrations.registrations);
}

async function handleSubmit(event) {
  event.preventDefault();
  const payload = getRegistrationPayload();
  const path = state.editingId
    ? `/api/registrations/${state.editingId}`
    : "/api/registrations";
  const method = state.editingId ? "PUT" : "POST";

  try {
    await api(path, {
      method,
      body: JSON.stringify(payload),
    });

    await reloadRegistrations();

    const message = state.editingId
      ? "อัปเดตข้อมูลผู้สมัครเรียบร้อยแล้ว"
      : "บันทึกข้อมูลผู้สมัครเรียบร้อยแล้ว";
    resetForm();
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

  const text = registration.bikeNumbers.join(", ");

  try {
    await navigator.clipboard.writeText(text);
    setStatus(`คัดลอกหมายเลขรถแล้ว: ${text}`);
  } catch {
    setStatus("ไม่สามารถคัดลอกข้อความอัตโนมัติได้", "warning");
  }
}

function bindEvents() {
  elements.vehicleCount.addEventListener("input", () => {
    const count = clampVehicleCount(elements.vehicleCount.value);
    renderBikeInputs(count, collectBikeNumbers());
  });

  elements.cancelEditButton.addEventListener("click", resetForm);
  elements.classForm.addEventListener("submit", handleClassSubmit);
  elements.registrationForm.addEventListener("submit", handleSubmit);
  elements.resetPrintColumnsButton.addEventListener("click", resetPrintColumns);
  elements.searchInput.addEventListener("input", renderRegistrations);
  elements.printAllButton.addEventListener("click", printAllRegistrations);
  elements.printSummaryButton.addEventListener("click", printSummaryDocument);

  elements.summaryClassSelect.addEventListener("change", (event) => {
    state.selectedSummaryClass = event.target.value;
    renderSummaryPreview();
  });

  elements.summaryTemplateList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-template-id]");
    if (!target) {
      return;
    }

    state.selectedSummaryTemplate = target.dataset.templateId;
    renderSummaryTemplates();
    renderSummaryPreview();
  });

  elements.summaryPreview.addEventListener("change", (event) => {
    const target = event.target.closest("[data-action='bracket-select']");
    if (!target || !state.selectedSummaryClass) {
      return;
    }

    setBracketSelection(
      state.selectedSummaryClass,
      Number.parseInt(target.dataset.roundIndex, 10),
      Number.parseInt(target.dataset.slotIndex, 10),
      target.value,
    );
    renderSummaryPreview();
  });

  elements.summaryPreview.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action='reset-bracket']");
    if (!target || !state.selectedSummaryClass) {
      return;
    }

    resetBracketSelections(state.selectedSummaryClass);
    renderSummaryPreview();
    setStatus(`ล้างสายประกบของรุ่น ${state.selectedSummaryClass} แล้ว`);
  });

  elements.printColumnList.addEventListener("change", (event) => {
    const target = event.target.closest("[data-action='toggle-print-column']");
    if (!target) {
      return;
    }

    togglePrintColumn(target.dataset.id, target.checked);
  });

  elements.printColumnList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action='move-print-column']");
    if (!target) {
      return;
    }

    movePrintColumn(target.dataset.id, target.dataset.direction);
  });

  elements.classList.addEventListener("click", (event) => {
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

  elements.classList.addEventListener("submit", (event) => {
    const form = event.target.closest("form[data-class]");
    if (!form) {
      return;
    }

    event.preventDefault();
    handleClassRename(form.dataset.class, form.classNameEdit.value.trim());
  });

  elements.registrationList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const { action, id } = target.dataset;
    const registration = state.registrations.find((item) => item.id === id);

    if (action === "edit" && registration) {
      fillForm(registration);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
}

async function init() {
  bindEvents();

  try {
    await loadInitialData();
    setStatus("พร้อมบันทึกข้อมูลผู้สมัครใหม่");
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

init();



















