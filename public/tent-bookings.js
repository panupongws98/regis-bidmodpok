const SVG_BOARD = {
  width: 1835,
  height: 1166,
};
const MOBILE_BREAKPOINT = 720;
const MOBILE_ZONE_VIEWS = {
  ALL: {
    x: 0,
    width: SVG_BOARD.width,
  },
  A: {
    x: 72,
    width: 390,
  },
  B: {
    x: 0,
    width: 340,
  },
  C: {
    x: 330,
    width: 1505,
  },
  D: {
    x: 130,
    width: 1510,
  },
};
const MOBILE_ZONE_BUTTONS = [
  { code: "ALL", label: "ทั้งผัง" },
  { code: "A", label: "โซน A" },
  { code: "B", label: "โซน B" },
  { code: "C", label: "โซน C" },
  { code: "D", label: "โซน D" },
];
const SLOT_LAYOUTS = {
  A: {
    x: 99,
    y: 118,
    width: 330,
    height: 56,
    columns: 6,
    accentPosition: "full",
    accentHeight: 56,
    labelY: 33,
    labelSize: 13,
  },
  B: {
    x: 45,
    y: 399,
    width: 269,
    height: 110,
    columns: 5,
    accentPosition: "full",
    accentHeight: 110,
    labelY: 60,
    labelSize: 13,
  },
  C: {
    x: 376,
    y: 285,
    width: 1447,
    height: 282,
    columns: 27,
    accentPosition: "top",
    accentHeight: 112,
    labelY: 57,
    labelSize: 12,
  },
  D: {
    x: 210,
    y: 788,
    width: 1432,
    height: 223,
    columns: 26,
    accentPosition: "top",
    accentHeight: 112,
    labelY: 58,
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
  mobileFocusZone: "ALL",
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

function isCompactViewport() {
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

function getZoneStats(zoneCode) {
  const slots = zoneCode === "ALL" ? state.slots : getSlotsForZone(zoneCode);
  const locked = slots.filter((slot) => !slot.isBookable).length;
  const booked = slots.filter((slot) => slot.isBookable && slot.registrationId).length;
  const available = slots.filter((slot) => slot.isBookable && !slot.registrationId).length;

  return {
    available,
    booked,
    locked,
    total: slots.length,
  };
}

function buildZoneHeadline(zoneCode, stats) {
  if (zoneCode === "ALL") {
    return `${stats.booked} จองแล้ว`;
  }

  if (stats.total === stats.locked) {
    return `ล็อก ${stats.locked} ช่อง`;
  }

  return `จอง ${stats.booked} / ${stats.total - stats.locked}`;
}

function buildZoneMeta(zoneCode, stats) {
  if (zoneCode === "ALL") {
    const lockedCopy = stats.locked > 0 ? ` · ล็อก ${stats.locked}` : "";
    return `ว่าง ${stats.available} ช่อง${lockedCopy}`;
  }

  if (stats.total === stats.locked) {
    return "ไม่เปิดให้เลือกจอง";
  }

  if (stats.locked > 0) {
    return `ว่าง ${stats.available} ช่อง · ล็อก ${stats.locked}`;
  }

  return `ว่าง ${stats.available} ช่อง`;
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

function renderMobileZoneNav() {
  return `
    <section class="tent-mobile-zone-nav" aria-label="ตัวช่วยดูผังการจองเต็นท์">
      <div class="tent-mobile-zone-copy">
        <p class="section-kicker">Zone Navigator</p>
        <strong>โฟกัสโซนที่ต้องการก่อน แล้วค่อยแตะเต็นท์เพื่อแก้ไขการจอง</strong>
        <p>กดปุ่มโซนเพื่อเลื่อนไปยังตำแหน่งนั้นในผังทันที และดูจำนวนที่จองแล้วหรือยังว่างได้จากการ์ดแต่ละโซน</p>
      </div>
      <div class="tent-mobile-zone-list" role="tablist" aria-label="เลือกตำแหน่งในผัง">
        ${MOBILE_ZONE_BUTTONS.map((zone) => {
          const isActive = state.mobileFocusZone === zone.code;
          const stats = getZoneStats(zone.code);
          return `
            <button
              class="tent-mobile-zone-button${isActive ? " is-active" : ""}"
              type="button"
              data-action="focus-zone"
              data-zone="${zone.code}"
              aria-pressed="${isActive}"
            >
              <span class="tent-mobile-zone-button-label">${zone.label}</span>
              <strong>${buildZoneHeadline(zone.code, stats)}</strong>
              <small>${buildZoneMeta(zone.code, stats)}</small>
            </button>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderSelectionSpotlight() {
  const selectedSlot = getSelectedSlot();

  if (!selectedSlot) {
    return `
      <section class="tent-selection-spotlight is-empty">
        <p class="section-kicker">Quick Start</p>
        <h3>เริ่มจากเลือกเต็นท์บนผัง</h3>
        <p>
          ใช้ปุ่มโซนด้านบนเพื่อเลื่อนไปยังบริเวณที่ต้องการ แล้วแตะช่องเต็นท์เพื่อเปิดแผงเลือกทีมได้ทันที
        </p>
      </section>
    `;
  }

  const registration = getRegistrationById(selectedSlot.registrationId);
  const isBooked = Boolean(selectedSlot.registrationId);

  return `
    <section class="tent-selection-spotlight" data-booked="${isBooked}">
      <p class="section-kicker">Selected Tent</p>
      <div class="tent-selection-spotlight-header">
        <div>
          <h3>${escapeHtml(selectedSlot.label)}</h3>
          <p>ZONE ${escapeHtml(selectedSlot.zone)}</p>
        </div>
        <span class="tent-selection-pill ${isBooked ? "is-booked" : "is-open"}">
          ${isBooked ? "จองแล้ว" : "ยังว่าง"}
        </span>
      </div>
      <strong class="tent-selection-team">
        ${escapeHtml(registration?.applicantName || "ยังไม่มีทีมเลือกช่องนี้")}
      </strong>
      <p class="tent-selection-meta">
        ${
          registration
            ? escapeHtml(buildRegistrationMeta(registration))
            : "เลือกทีมจาก dropdown ในแผงด้านล่างเพื่อบันทึกการจองได้เลย"
        }
      </p>
    </section>
  `;
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
            : "โซน A และโซน B ทั้งหมดถูกล็อกไม่ให้จองตามผังงาน"
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
          <defs>
            <pattern id="venue-grid-pattern" width="54" height="56" patternUnits="userSpaceOnUse">
              <path d="M 54 0 L 0 0 0 56" class="venue-svg-grid-line"></path>
            </pattern>
          </defs>
          <rect x="0.5" y="0.5" width="1834" height="1165" class="venue-svg-paper"></rect>
          <rect x="0.5" y="0.5" width="1834" height="1165" class="venue-svg-grid"></rect>

          <line x1="42" y1="0" x2="42" y2="1166" class="venue-svg-line"></line>
          <line x1="150" y1="0" x2="150" y2="1166" class="venue-svg-line"></line>
          <line x1="205" y1="0" x2="205" y2="1166" class="venue-svg-line"></line>

          <text x="21" y="316" class="venue-svg-gate" transform="rotate(-90 21 316)">ประตูแรก</text>
          <text x="21" y="876" class="venue-svg-gate" transform="rotate(-90 21 876)">ประตูสอง</text>

          <rect x="99" y="7" width="330" height="111" class="venue-svg-support"></rect>
          <text x="264" y="63" class="venue-svg-support-label" text-anchor="middle">
            เต็นท์เก็บรถเพื่อตรวจสภาพ
          </text>

          <text x="1470" y="102" class="venue-svg-parking-label" text-anchor="middle">ลานจอดรถ</text>

          <text x="231" y="206" class="venue-svg-zone-label">ZONE A</text>
          <text x="146" y="264" class="venue-svg-zone-label">ZONE B</text>
          <text x="1415" y="264" class="venue-svg-zone-label venue-svg-zone-label--dark">ZONE C</text>
          <text x="95" y="878" class="venue-svg-zone-label">ZONE D</text>

          ${renderZoneSlots("A")}

          <rect x="45" y="285" width="269" height="114" class="venue-svg-support"></rect>
          <text x="179.5" y="347" class="venue-svg-support-label" text-anchor="middle">
            ตรวจสภาพ
          </text>

          ${renderZoneSlots("B")}

          <g class="venue-svg-service-strip">
            <rect x="45" y="509" width="105" height="58" class="venue-svg-service-cell"></rect>
            <rect x="150" y="509" width="55" height="58" class="venue-svg-service-cell"></rect>
            <rect x="205" y="509" width="109" height="58" class="venue-svg-service-cell"></rect>
            <text
              x="97.5"
              y="545"
              class="venue-svg-service-label"
              text-anchor="middle"
            >
              จุดตรวจรถ
            </text>
            <text
              x="177.5"
              y="545"
              class="venue-svg-service-label"
              text-anchor="middle"
            >
              รับสมัคร
            </text>
            <text
              x="259.5"
              y="545"
              class="venue-svg-service-label"
              text-anchor="middle"
            >
              คอนโทรล
            </text>
          </g>

          ${renderZoneSlots("C")}

          <rect x="150" y="566" width="55" height="224" class="venue-svg-track-start"></rect>
          <text x="177.5" y="678" class="venue-svg-track-start-label" transform="rotate(-90 177.5 678)">
            จุดสตาร์ท
          </text>

          <g class="venue-svg-track-board">
            <rect x="205" y="566" width="1630" height="224" class="venue-svg-track"></rect>
            <line x1="205" y1="678" x2="1835" y2="678" class="venue-svg-line"></line>
            <text x="290" y="632" class="venue-svg-track-label">TRACK A</text>
            <text x="290" y="741" class="venue-svg-track-label">TRACK B</text>
            <text x="1018" y="636" class="venue-svg-event-title" text-anchor="middle">
              งานแข่งไฮสปีด บิดหมดปลอก
            </text>
            <text x="1018" y="742" class="venue-svg-event-subtitle" text-anchor="middle">
              สนามบ้านฉางเรซซิ่ง ระยอง
            </text>
          </g>

          ${renderZoneSlots("D")}
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
    ${renderMobileZoneNav()}
    <div class="venue-map-workspace">
      <div class="venue-map-column">
        ${renderVenueMapBoard()}
      </div>
      <aside class="venue-editor-rail" aria-label="แผงจัดการเต็นท์">
        ${renderSelectionSpotlight()}
        ${renderEditorCard()}
      </aside>
    </div>
  `;

  queueMobileZoneFocus();
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

  if (isCompactViewport()) {
    window.requestAnimationFrame(() => {
      elements.tentMap
        ?.querySelector(".venue-editor-rail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
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

function scrollMobileMapToZone(zoneCode, behavior = "auto") {
  const scroller = elements.tentMap?.querySelector(".venue-map-scroller");
  const board = elements.tentMap?.querySelector(".venue-map-board");
  const focusView = MOBILE_ZONE_VIEWS[zoneCode] || MOBILE_ZONE_VIEWS.ALL;

  if (!scroller || !board || !focusView) {
    return;
  }

  const scale = board.clientWidth / SVG_BOARD.width;
  const maxScrollLeft = Math.max(board.clientWidth - scroller.clientWidth, 0);

  if (zoneCode === "ALL" || maxScrollLeft === 0) {
    scroller.scrollTo({
      left: 0,
      behavior,
    });
    return;
  }

  const focusedLeft = focusView.x * scale;
  const focusedWidth = focusView.width * scale;
  const centeredLeft = focusedLeft + focusedWidth / 2 - scroller.clientWidth / 2;
  const nextLeft = Math.max(0, Math.min(centeredLeft, maxScrollLeft));

  scroller.scrollTo({
    left: nextLeft,
    behavior,
  });
}

function queueMobileZoneFocus(behavior = "auto") {
  window.requestAnimationFrame(() => {
    scrollMobileMapToZone(state.mobileFocusZone, behavior);
  });
}

function syncMobileZoneButtons() {
  elements.tentMap
    ?.querySelectorAll("[data-action='focus-zone']")
    .forEach((button) => {
      const isActive = button.dataset.zone === state.mobileFocusZone;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
}

function handleZoneFocus(target) {
  const zoneCode = target.dataset.zone;
  if (!zoneCode || !MOBILE_ZONE_VIEWS[zoneCode]) {
    return;
  }

  state.mobileFocusZone = zoneCode;
  syncMobileZoneButtons();
  scrollMobileMapToZone(zoneCode, "smooth");
}

function handleWindowResize() {
  if (!state.slots.length) {
    return;
  }

  queueMobileZoneFocus();
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

    if (clearButton?.dataset.action === "focus-zone") {
      handleZoneFocus(clearButton);
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

  window.addEventListener("resize", handleWindowResize);
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
