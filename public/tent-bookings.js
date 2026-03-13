const DECORATIVE_STALLS = Array.from({ length: 12 }, (_, index) => index + 1);
const SVG_BOARD = {
  width: 1835,
  height: 1166,
};
const SLOT_LAYOUTS = {
  A: {
    x: 97,
    y: 11,
    width: 326,
    height: 173,
    columns: 6,
    accentPosition: "bottom",
    accentHeight: 56,
    labelY: 147,
    labelSize: 13,
  },
  B: {
    x: 41,
    y: 404,
    width: 273,
    height: 111,
    columns: 5,
    accentPosition: "full",
    accentHeight: 111,
    labelY: 66,
    labelSize: 13,
  },
  C: {
    x: 367,
    y: 294,
    width: 1466,
    height: 275,
    columns: 27,
    accentPosition: "top",
    accentHeight: 111,
    labelY: 59,
    labelSize: 12,
  },
  D: {
    x: 205,
    y: 789,
    width: 1411,
    height: 222,
    columns: 26,
    accentPosition: "top",
    accentHeight: 111,
    labelY: 59,
    labelSize: 12,
  },
};
const UNAVAILABLE_COPY = "เต็นท์ช่องนี้ไม่เปิดให้จอง";

const zoneCopyMap = {
  A: "โซนด้านบนใกล้ลานจอดรถ",
  B: "โซนด้านซ้ายใกล้พื้นที่บริการ",
  C: "โซนหลักแนวยาวกลางผัง",
  D: "โซนด้านล่างใกล้ Track B",
};

const elements = {
  printButton: document.querySelector("#printTentMapButton"),
  refreshButton: document.querySelector("#refreshTentMapButton"),
  statusBanner: document.querySelector("#tentStatusBanner"),
  tentAvailableCount: document.querySelector("#tentAvailableCount"),
  tentBookedCount: document.querySelector("#tentBookedCount"),
  tentLastUpdated: document.querySelector("#tentLastUpdated"),
  tentMap: document.querySelector("#tentMap"),
  tentRegistrationCount: document.querySelector("#tentRegistrationCount"),
  tentTotalCount: document.querySelector("#tentTotalCount"),
};

const state = {
  availableSlots: 0,
  lastUpdatedAt: "",
  registrations: [],
  savingSlotId: "",
  selectedSlotId: "",
  slots: [],
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "ยังไม่มีการอัปเดตการจองเต็นท์";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function setStatus(message, tone = "success") {
  if (!elements.statusBanner) {
    return;
  }

  elements.statusBanner.textContent = message;
  if (tone === "success") {
    elements.statusBanner.removeAttribute("data-tone");
    return;
  }

  elements.statusBanner.setAttribute("data-tone", tone);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
  }

  return payload;
}

function sortRegistrations(registrations) {
  return [...registrations].sort((left, right) => {
    return String(left.applicantName || "").localeCompare(
      String(right.applicantName || ""),
      "th",
    );
  });
}

function getRegistrationById(registrationId) {
  return state.registrations.find((registration) => registration.id === registrationId) || null;
}

function getRegistrationVehicleCount(registration) {
  return (registration.entries || []).reduce((total, entry) => {
    return total + Number(entry.vehicleCount || 0);
  }, 0);
}

function buildRegistrationMeta(registration) {
  if (!registration) {
    return "ยังไม่มีทีมจองเต็นท์นี้";
  }

  const classCount = Array.isArray(registration.entries) ? registration.entries.length : 0;
  const vehicleCount = getRegistrationVehicleCount(registration);
  const meta = [];

  if (registration.contactPhone) {
    meta.push(`เบอร์ ${registration.contactPhone}`);
  }

  if (classCount > 0) {
    meta.push(`สมัคร ${classCount} รุ่น`);
  }

  if (vehicleCount > 0) {
    meta.push(`รถรวม ${vehicleCount} คัน`);
  }

  return meta.length > 0 ? meta.join(" | ") : "มีข้อมูลทีมแล้ว แต่ยังไม่มีรายละเอียดเพิ่มเติม";
}

function getSlotsForZone(zoneCode) {
  return state.slots
    .filter((slot) => slot.zone === zoneCode)
    .sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
}

function syncSelectedSlot() {
  if (!state.selectedSlotId) {
    return;
  }

  const existing = state.slots.find((slot) => slot.id === state.selectedSlotId);
  if (!existing) {
    state.selectedSlotId = "";
  }
}

function getSelectedSlot() {
  syncSelectedSlot();
  return state.slots.find((slot) => slot.id === state.selectedSlotId) || null;
}

function buildApplicantOptions(selectedId) {
  const defaultOption = `<option value="">ว่าง</option>`;
  const options = state.registrations
    .map((registration) => {
      const isSelected = registration.id === selectedId;
      return `
        <option value="${escapeHtml(registration.id)}"${isSelected ? " selected" : ""}>
          ${escapeHtml(registration.applicantName)}
        </option>
      `;
    })
    .join("");

  return `${defaultOption}${options}`;
}

function getSlotGeometry(slot) {
  const layout = SLOT_LAYOUTS[slot.zone];
  const slotWidth = layout.width / layout.columns;

  return {
    ...layout,
    slotWidth,
    x: layout.x + slotWidth * (Number(slot.order || 1) - 1),
    y: layout.y,
  };
}

function renderSvgSlotAccent(slot, geometry) {
  if (geometry.accentPosition === "full") {
    return "";
  }

  const accentY =
    geometry.accentPosition === "bottom"
      ? geometry.y + geometry.height - geometry.accentHeight
      : geometry.y;

  return `
    <rect
      class="venue-svg-slot-band"
      x="${geometry.x}"
      y="${accentY}"
      width="${geometry.slotWidth}"
      height="${geometry.accentHeight}"
      rx="0"
      ry="0"
    ></rect>
  `;
}

function getSlotLabelMetrics(slot, geometry) {
  const labelLength = String(slot.label || "").length;
  const nextFontSize =
    labelLength >= 4
      ? geometry.labelSize - 2
      : labelLength === 3
        ? geometry.labelSize - 1
        : geometry.labelSize;

  return {
    fontSize: Math.max(nextFontSize, 12),
  };
}

function getSlotBodyGeometry(geometry) {
  if (geometry.accentPosition === "full") {
    return {
      x: geometry.x,
      y: geometry.y,
      width: geometry.slotWidth,
      height: geometry.height,
    };
  }

  if (geometry.accentPosition === "bottom") {
    return {
      x: geometry.x,
      y: geometry.y,
      width: geometry.slotWidth,
      height: geometry.height - geometry.accentHeight,
    };
  }

  return {
    x: geometry.x,
    y: geometry.y + geometry.accentHeight,
    width: geometry.slotWidth,
    height: geometry.height - geometry.accentHeight,
  };
}

function getBookedNameMetrics(applicantName, bodyGeometry) {
  const normalizedName = String(applicantName || "").trim();
  const availableLength = Math.max(bodyGeometry.height - 16, 28);
  const baseSize = Math.min(Math.max(bodyGeometry.width * 0.26, 10), 13);

  if (normalizedName.length <= 8) {
    return {
      fontSize: Math.max(baseSize, 11),
      textLength: null,
    };
  }

  return {
    fontSize: Math.max(baseSize - 0.5, 10),
    textLength: Math.round(availableLength * 10) / 10,
  };
}

function getSlotBodyGeometryForRange(startGeometry, endGeometry) {
  const startBody = getSlotBodyGeometry(startGeometry);
  const endBody = getSlotBodyGeometry(endGeometry);

  return {
    x: startBody.x,
    y: startBody.y,
    width: endBody.x + endBody.width - startBody.x,
    height: startBody.height,
  };
}

function getBookedSlotGroups(zoneCode) {
  const groups = [];
  const slots = getSlotsForZone(zoneCode).filter((slot) => slot.registrationId && slot.applicantName);

  for (const slot of slots) {
    const lastGroup = groups[groups.length - 1];
    const canExtendGroup =
      lastGroup &&
      lastGroup.registrationId === slot.registrationId &&
      lastGroup.applicantName === slot.applicantName &&
      lastGroup.lastOrder + 1 === slot.order;

    if (canExtendGroup) {
      lastGroup.slots.push(slot);
      lastGroup.lastOrder = slot.order;
      continue;
    }

    groups.push({
      applicantName: slot.applicantName,
      firstOrder: slot.order,
      lastOrder: slot.order,
      registrationId: slot.registrationId,
      slots: [slot],
      zone: slot.zone,
    });
  }

  return groups;
}

function renderBookedSlotGroup(group) {
  const firstSlot = group.slots[0];
  const lastSlot = group.slots[group.slots.length - 1];
  const startGeometry = getSlotGeometry(firstSlot);
  const endGeometry = getSlotGeometry(lastSlot);
  const bodyGeometry = getSlotBodyGeometryForRange(startGeometry, endGeometry);
  const nameMetrics = getBookedNameMetrics(group.applicantName, bodyGeometry);

  return `
    <g class="venue-svg-slot-group" data-slot-group="${escapeHtml(group.zone)}-${group.firstOrder}">
      <rect
        class="venue-svg-slot-booked-fill"
        x="${bodyGeometry.x}"
        y="${bodyGeometry.y}"
        width="${bodyGeometry.width}"
        height="${bodyGeometry.height}"
        rx="0"
        ry="0"
      ></rect>
      <text
        class="venue-svg-slot-booked-name"
        x="${bodyGeometry.x + bodyGeometry.width / 2}"
        y="${bodyGeometry.y + bodyGeometry.height / 2}"
        font-size="${nameMetrics.fontSize}"
        text-anchor="middle"
        transform="rotate(-90 ${bodyGeometry.x + bodyGeometry.width / 2} ${
          bodyGeometry.y + bodyGeometry.height / 2
        })"
        ${nameMetrics.textLength ? `textLength="${nameMetrics.textLength}" lengthAdjust="spacing"` : ""}
      >
        ${escapeHtml(group.applicantName)}
      </text>
    </g>
  `;
}

function renderBookedSlotGroups(zoneCode) {
  return getBookedSlotGroups(zoneCode).map(renderBookedSlotGroup).join("");
}

function renderSlotSelection(slot) {
  if (!slot || state.selectedSlotId !== slot.id) {
    return "";
  }

  const geometry = getSlotGeometry(slot);

  return `
    <rect
      class="venue-svg-slot-highlight"
      x="${geometry.x + 1.5}"
      y="${geometry.y + 1.5}"
      width="${geometry.slotWidth - 3}"
      height="${geometry.height - 3}"
      rx="0"
      ry="0"
    ></rect>
  `;
}

function renderSvgSlot(slot) {
  const geometry = getSlotGeometry(slot);
  const labelMetrics = getSlotLabelMetrics(slot, geometry);
  const isBookable = Boolean(slot.isBookable);
  const classes = [
    "venue-svg-slot",
    `venue-svg-slot--${slot.zone.toLowerCase()}`,
    slot.registrationId ? "is-booked" : "",
    isBookable ? "" : "is-locked",
    state.selectedSlotId === slot.id ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const labelY = geometry.y + geometry.labelY;
  const accessibilityAttributes = isBookable
    ? `tabindex="0" role="button" aria-pressed="${state.selectedSlotId === slot.id}"`
    : `aria-disabled="true"`;

  return `
    <g
      class="${classes}"
      data-slot-id="${escapeHtml(slot.id)}"
      data-bookable="${isBookable}"
      aria-label="เต็นท์ ${escapeHtml(slot.label)}"
      ${accessibilityAttributes}
    >
      <rect
        class="venue-svg-slot-frame"
        x="${geometry.x}"
        y="${geometry.y}"
        width="${geometry.slotWidth}"
        height="${geometry.height}"
        rx="0"
        ry="0"
      ></rect>
      ${renderSvgSlotAccent(slot, geometry)}
      <text
        class="venue-svg-slot-label"
        x="${geometry.x + geometry.slotWidth / 2}"
        y="${labelY}"
        font-size="${labelMetrics.fontSize}"
        text-anchor="middle"
      >
        ${escapeHtml(slot.label)}
      </text>
    </g>
  `;
}

function renderZoneSlots(zoneCode) {
  const slots = getSlotsForZone(zoneCode);
  return `
    ${slots.map(renderSvgSlot).join("")}
    ${renderBookedSlotGroups(zoneCode)}
    ${slots.map(renderSlotSelection).join("")}
  `;
}

function renderDecorativeStalls() {
  const stallWidth = 651 / DECORATIVE_STALLS.length;

  return DECORATIVE_STALLS.map((stall, index) => {
    const x = 1184 + stallWidth * index;
    return `
      <g class="venue-svg-mini-stall">
        <rect
          x="${x}"
          y="1068"
          width="${stallWidth}"
          height="98"
          class="venue-svg-mini-stall-frame"
        ></rect>
        <rect
          x="${x}"
          y="1068"
          width="${stallWidth}"
          height="20"
          class="venue-svg-mini-stall-band"
        ></rect>
        <text
          x="${x + stallWidth / 2}"
          y="1085"
          text-anchor="middle"
          class="venue-svg-mini-stall-label"
        >
          ${stall}
        </text>
      </g>
    `;
  }).join("");
}

function renderEditorCard() {
  const selectedSlot = getSelectedSlot();

  if (!selectedSlot) {
    return `
      <section class="venue-editor-card">
        <div class="venue-editor-header">
          <p class="section-kicker">Tent Editor</p>
          <h3>เลือกเต็นท์จากผัง</h3>
        </div>
        <div class="venue-editor-note">
          คลิกเต็นท์บนผังเพื่อเปิดรายละเอียดและกำหนดทีมที่จองในแผงจัดการด้านล่าง
        </div>
      </section>
    `;
  }

  const registration = getRegistrationById(selectedSlot.registrationId);
  const isBooked = Boolean(selectedSlot.registrationId);
  const isSaving = state.savingSlotId === selectedSlot.id;
  const isBookable = Boolean(selectedSlot.isBookable);

  return `
    <section class="venue-editor-card">
      <div class="venue-editor-header">
        <p class="section-kicker">Tent Editor</p>
        <h3>เต็นท์ ${escapeHtml(selectedSlot.label)}</h3>
      </div>

      <div class="venue-editor-chip-row">
        <span class="venue-editor-chip">ZONE ${escapeHtml(selectedSlot.zone)}</span>
        <span class="venue-editor-chip ${isBookable ? "is-available" : "is-locked"}">
          ${isBookable ? (isBooked ? "เปิดให้จอง" : "ว่างและจองได้") : "ล็อกไม่ให้จอง"}
        </span>
      </div>

      <div class="venue-editor-summary" data-booked="${isBooked}" data-locked="${!isBookable}">
        <strong>${
          isBookable
            ? escapeHtml(registration?.applicantName || "ยังไม่มีทีมจอง")
            : "ไม่เปิดให้จอง"
        }</strong>
        <span>${
          isBookable
            ? escapeHtml(registration ? buildRegistrationMeta(registration) : zoneCopyMap[selectedSlot.zone] || "")
            : escapeHtml(UNAVAILABLE_COPY)
        }</span>
      </div>

      <label class="field">
        <span>เลือกทีมที่จองเต็นท์นี้</span>
        <select
          data-action="editor-registration-select"
          ${!isBookable || isSaving || state.registrations.length === 0 ? "disabled" : ""}
        >
          ${buildApplicantOptions(selectedSlot.registrationId)}
        </select>
      </label>

      <div class="venue-editor-actions">
        <button
          class="button button-secondary"
          type="button"
          data-action="clear-slot-booking"
          ${!isBookable || !isBooked || isSaving ? "disabled" : ""}
        >
          ล้างการจอง
        </button>
      </div>

      <div class="venue-editor-note">
        ${
          isBookable
            ? "คลิกช่องอื่นบนผังเพื่อสลับเต็นท์ที่ต้องการจัดการ"
            : "โซน B ทั้งหมด และ D1, D2 ถูกล็อกไม่ให้จองตามผังงาน"
        }
      </div>
    </section>
  `;
}

function renderVenueMapBoard() {
  return `
    <div class="venue-map-scroller">
      <div class="venue-map-board">
        <svg
          class="venue-map-svg"
          viewBox="0 0 ${SVG_BOARD.width} ${SVG_BOARD.height}"
          aria-label="ผังจองเต็นท์ล่วงหน้า"
          role="img"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x="0.5" y="0.5" width="1834" height="1165" class="venue-svg-paper"></rect>

          <line x1="42" y1="0" x2="42" y2="1166" class="venue-svg-line"></line>
          <line x1="150" y1="0" x2="150" y2="1166" class="venue-svg-line"></line>
          <line x1="205" y1="0" x2="205" y2="1166" class="venue-svg-line"></line>

          <text x="21" y="317" class="venue-svg-gate" transform="rotate(-90 21 317)">ประตูงาน</text>
          <text x="21" y="877" class="venue-svg-gate" transform="rotate(-90 21 877)">ประตูงาน</text>

          <text x="500" y="214" class="venue-svg-zone-label">ZONE A</text>
          <text x="145" y="270" class="venue-svg-zone-label">ZONE B</text>
          <text x="1392" y="270" class="venue-svg-zone-label venue-svg-zone-label--dark">ZONE C</text>
          <text x="92" y="877" class="venue-svg-zone-label">ZONE D</text>

          ${renderZoneSlots("A")}

          <rect x="41" y="294" width="273" height="110" class="venue-svg-support"></rect>
          <text x="177.5" y="349" class="venue-svg-vertical-text" transform="rotate(-90 177.5 349)">
            ตรวจสภาพ
          </text>

          ${renderZoneSlots("B")}

          <g class="venue-svg-service-strip">
            <rect x="41" y="515" width="109" height="53" class="venue-svg-service-cell"></rect>
            <rect x="150" y="515" width="55" height="53" class="venue-svg-service-cell"></rect>
            <rect x="205" y="515" width="109" height="53" class="venue-svg-service-cell"></rect>
            <text
              x="95.5"
              y="549"
              class="venue-svg-service-label"
              text-anchor="middle"
            >
              จุดตรวจรถ
            </text>
            <text
              x="177.5"
              y="549"
              class="venue-svg-service-label"
              text-anchor="middle"
            >
              รับสมัคร
            </text>
            <text
              x="259.5"
              y="549"
              class="venue-svg-service-label"
              text-anchor="middle"
            >
              คอนโทรล
            </text>
          </g>

          ${renderZoneSlots("C")}

          <rect x="150" y="569" width="55" height="221" class="venue-svg-track-start"></rect>
          <text x="177.5" y="681" class="venue-svg-track-start-label" transform="rotate(-90 177.5 681)">
            จุดสตาร์ท
          </text>

          <g class="venue-svg-track-board">
            <rect x="205" y="569" width="1630" height="221" class="venue-svg-track"></rect>
            <line x1="205" y1="679.5" x2="1835" y2="679.5" class="venue-svg-line"></line>
            <text x="286" y="636" class="venue-svg-track-label">TRACK A</text>
            <text x="286" y="737" class="venue-svg-track-label">TRACK B</text>
          </g>

          ${renderZoneSlots("D")}

          <rect x="205" y="901" width="109" height="110" class="venue-svg-support"></rect>
          <text x="259.5" y="963" class="venue-svg-merch-label" text-anchor="middle">ขายเสื้อ</text>

          ${renderDecorativeStalls()}
        </svg>
      </div>
    </div>
  `;
}

function renderMap() {
  if (!elements.tentMap) {
    return;
  }

  if (state.slots.length === 0) {
    elements.tentMap.innerHTML = `
      <div class="tent-map-empty">
        ยังไม่สามารถโหลดผังจองเต็นท์ได้ในขณะนี้
      </div>
    `;
    return;
  }

  elements.tentMap.innerHTML = `
    <div class="venue-map-workspace">
      ${renderVenueMapBoard()}
      ${renderEditorCard()}
    </div>
  `;
}

function renderStats() {
  const totalSlots = state.slots.length;
  const bookedSlots = state.slots.filter((slot) => slot.isBookable && slot.registrationId).length;

  if (elements.tentTotalCount) {
    elements.tentTotalCount.textContent = String(totalSlots);
  }

  if (elements.tentBookedCount) {
    elements.tentBookedCount.textContent = String(bookedSlots);
  }

  if (elements.tentAvailableCount) {
    elements.tentAvailableCount.textContent = String(state.availableSlots);
  }

  if (elements.tentRegistrationCount) {
    elements.tentRegistrationCount.textContent = `${state.registrations.length} ทีมพร้อมเลือกจอง`;
  }

  if (elements.tentLastUpdated) {
    elements.tentLastUpdated.textContent = formatDate(state.lastUpdatedAt);
  }
}

function renderPage() {
  renderStats();
  renderMap();
}

async function loadPageData() {
  setStatus("กำลังโหลดรายชื่อผู้สมัครและข้อมูลผังจองเต็นท์...", "warning");

  const [tentBookings, registrations] = await Promise.all([
    api("/api/tent-bookings"),
    api("/api/registrations"),
  ]);

  state.slots = Array.isArray(tentBookings.slots) ? tentBookings.slots : [];
  state.registrations = sortRegistrations(
    Array.isArray(registrations.registrations) ? registrations.registrations : [],
  );
  state.availableSlots = Number(tentBookings.availableSlots || 0);
  state.lastUpdatedAt = String(tentBookings.lastUpdatedAt || "");
  syncSelectedSlot();
  renderPage();

  if (state.registrations.length === 0) {
    setStatus(
      "ยังไม่มีรายชื่อผู้สมัครในระบบ จึงยังไม่สามารถเลือกทีมมาจองเต็นท์ได้",
      "warning",
    );
    return;
  }

  setStatus("พร้อมบันทึกการจองเต็นท์ล่วงหน้าตามผังสนาม");
}

async function saveTentBooking(slotId, registrationId) {
  const selectedRegistration = getRegistrationById(registrationId);
  state.savingSlotId = slotId;
  renderPage();

  try {
    setStatus(`กำลังบันทึกเต็นท์ ${slotId}...`, "warning");
    const payload = await api(`/api/tent-bookings/${encodeURIComponent(slotId)}`, {
      method: "PUT",
      body: JSON.stringify({ registrationId }),
    });

    state.slots = Array.isArray(payload.slots) ? payload.slots : state.slots;
    state.availableSlots = Number(payload.availableSlots || 0);
    state.lastUpdatedAt = String(payload.lastUpdatedAt || new Date().toISOString());
    state.selectedSlotId = slotId;

    if (selectedRegistration) {
      setStatus(`บันทึกการจองเต็นท์ ${slotId} ให้ ${selectedRegistration.applicantName} เรียบร้อยแล้ว`);
    } else {
      setStatus(`คืนสถานะเต็นท์ ${slotId} ให้กลับเป็นว่างแล้ว`);
    }
  } catch (error) {
    setStatus(error.message, "danger");
  } finally {
    state.savingSlotId = "";
    syncSelectedSlot();
    renderPage();
  }
}

function findClosestDataElement(target, key) {
  let current = target instanceof Element ? target : target?.parentElement || null;
  while (current) {
    if (current.dataset && current.dataset[key]) {
      return current;
    }

    current = current.parentElement || null;
  }

  return null;
}

function handleSlotClick(target) {
  const slotId = target.dataset.slotId;
  if (!slotId || target.dataset.bookable !== "true") {
    return;
  }

  state.selectedSlotId = slotId;
  renderPage();
}

function handleEditorSelection(target) {
  const selectedSlot = getSelectedSlot();
  if (!selectedSlot || !selectedSlot.isBookable) {
    return;
  }

  saveTentBooking(selectedSlot.id, target.value);
}

function handleClearSlotBooking() {
  const selectedSlot = getSelectedSlot();
  if (!selectedSlot || !selectedSlot.isBookable || !selectedSlot.registrationId) {
    return;
  }

  saveTentBooking(selectedSlot.id, "");
}

async function handleRefresh() {
  try {
    await loadPageData();
  } catch (error) {
    setStatus(error.message, "danger");
  }
}

function handlePrint() {
  setStatus("กำลังเปิดหน้าต่างพิมพ์ผังเต็นท์ขนาด A4 แนวนอน...");
  window.print();
}

function bindEvents() {
  elements.printButton?.addEventListener("click", () => {
    handlePrint();
  });

  elements.refreshButton?.addEventListener("click", () => {
    handleRefresh();
  });

  elements.tentMap?.addEventListener("click", (event) => {
    const clearButton = findClosestDataElement(event.target, "action");
    if (clearButton?.dataset.action === "clear-slot-booking") {
      handleClearSlotBooking();
      return;
    }

    const slotButton = findClosestDataElement(event.target, "slotId");
    if (slotButton) {
      handleSlotClick(slotButton);
    }
  });

  elements.tentMap?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const slotButton = findClosestDataElement(event.target, "slotId");
    if (!slotButton || slotButton.dataset.bookable !== "true") {
      return;
    }

    event.preventDefault();
    handleSlotClick(slotButton);
  });

  elements.tentMap?.addEventListener("change", (event) => {
    const select = findClosestDataElement(event.target, "action");
    if (!select || select.dataset.action !== "editor-registration-select") {
      return;
    }

    handleEditorSelection(select);
  });
}

async function init() {
  bindEvents();

  try {
    await loadPageData();
  } catch (error) {
    setStatus(error.message, "danger");
    renderPage();
  }
}

init();
