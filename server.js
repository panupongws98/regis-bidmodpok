const http = require("http");
const path = require("path");
const { randomUUID } = require("crypto");
const fs = require("fs/promises");

const HOST = process.env.HOST || "0.0.0.0";
const DEFAULT_PORT = getPortFromEnvironment(process.env.PORT);
const MAX_BODY_SIZE = 1024 * 1024;
const MAX_VEHICLES = 20;

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const VENUES_DIR = path.join(DATA_DIR, "venues");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const TENT_BOOKINGS_FILE = path.join(DATA_DIR, "tent-bookings.json");
const DEFAULT_VENUE_ID = "default";

const DEFAULT_CLASSES = [
  "รุ่น 56 ชัก 3 (ไฮสปีด)",
  "รุ่น 57 ชักเดิม ตรอ. (ไฮสปีด)",
  "รุ่น 66 ชัก 5 มิล ตรอ (ไฮสปีด)",
  "รุ่น 67 ชักเดิม ตรอ (ไฮสปีด)",
  "รุ่น Lead125 63 ชักเดิม + Grand filano (ไฮสปีด)",
  "รุ่น 56 ชัก 3 ตรอ 110i หรือบังลม (ไม่บังคับอะไหล่)",
  "รุ่น 57 ชักเดิม ตรอ. Wave125, FiNN (ไม่บังคับอะไหล่)",
  "รุ่น 66 ชัก 5 มิล ตรอ (ไม่บังคับอะไหล่)",
  "รุ่น 67 ชักเดิม ตรอ (ไม่บังคับอะไหล่)",
];
const DEFAULT_EVENT_BRAND = {
  name: "งานแข่งรถไฮสปีด บิดหมดปลอก",
  locationLine1: "ณ สนามแข่งรถบ้านฉางเรสซิ่ง",
  locationLine2: "จ.ระยอง",
  header: "ระบบจัดการผู้สมัครหน้างาน",
  logoPath: "/logo-bidmodplok.svg",
};

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function getPortFromEnvironment(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return 3000;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return 3000;
  }

  return parsed;
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeText(value) {
  return sanitizeText(value).toLowerCase();
}

function uniqueStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    const normalized = value.toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function readConfiguredText(value, fallback, options = {}) {
  const { allowBlank = false } = options;
  if (typeof value !== "string") {
    return fallback;
  }

  const text = value.trim();
  return allowBlank ? text : text || fallback;
}

function buildEventBrand(eventBrand = {}) {
  const name = readConfiguredText(eventBrand.name, DEFAULT_EVENT_BRAND.name);
  const locationLine1 = readConfiguredText(
    eventBrand.locationLine1,
    DEFAULT_EVENT_BRAND.locationLine1,
  );
  const locationLine2 = readConfiguredText(
    eventBrand.locationLine2,
    DEFAULT_EVENT_BRAND.locationLine2,
    { allowBlank: true },
  );
  const header = readConfiguredText(eventBrand.header, DEFAULT_EVENT_BRAND.header);
  const logoPath = readConfiguredText(eventBrand.logoPath, DEFAULT_EVENT_BRAND.logoPath);
  const locationLines = [locationLine1, locationLine2].filter(Boolean);
  const subtitle = locationLines.join(" ");
  const fullName = [name, subtitle].filter(Boolean).join(" ");

  return {
    name,
    locationLine1,
    locationLine2,
    locationLines,
    subtitle,
    fullName,
    header,
    logoPath,
  };
}

function serializeEventBrand(eventBrand) {
  const normalized = buildEventBrand(eventBrand);
  return {
    name: normalized.name,
    locationLine1: normalized.locationLine1,
    locationLine2: normalized.locationLine2,
    header: normalized.header,
    logoPath: normalized.logoPath,
  };
}

function serializeSettings(settings = {}) {
  const classes = Array.isArray(settings.classes)
    ? uniqueStrings(settings.classes.map(sanitizeText))
    : [];
  const currentVenueId = sanitizeText(settings.currentVenueId) || DEFAULT_VENUE_ID;
  const venueAvailability = normalizeVenueAvailabilityStore(settings.venueAvailability);

  return {
    classes: classes.length > 0 ? classes : DEFAULT_CLASSES,
    eventBrand: serializeEventBrand(settings.eventBrand),
    currentVenueId,
    venueAvailability,
  };
}

function sanitizeZoneCode(value) {
  return sanitizeText(value).toUpperCase();
}

function sanitizeTentSlotId(value) {
  return sanitizeText(value).toUpperCase();
}

function normalizeVenueAvailabilityOverride(input = {}) {
  const candidate = input && typeof input === "object" ? input : {};
  const openZones = uniqueStrings(
    (Array.isArray(candidate.openZones) ? candidate.openZones : []).map(sanitizeZoneCode),
  );
  const openZoneSet = new Set(openZones);
  const lockedZones = uniqueStrings(
    (Array.isArray(candidate.lockedZones) ? candidate.lockedZones : []).map(sanitizeZoneCode),
  ).filter((zoneCode) => !openZoneSet.has(zoneCode));
  const openSlots = uniqueStrings(
    (Array.isArray(candidate.openSlots) ? candidate.openSlots : []).map(sanitizeTentSlotId),
  );
  const openSlotSet = new Set(openSlots);
  const lockedSlots = uniqueStrings(
    (Array.isArray(candidate.lockedSlots) ? candidate.lockedSlots : []).map(sanitizeTentSlotId),
  ).filter((slotId) => !openSlotSet.has(slotId));

  return {
    lockedZones,
    openZones,
    lockedSlots,
    openSlots,
  };
}

function isVenueAvailabilityOverrideEmpty(override) {
  return (
    !override ||
    (override.lockedZones || []).length === 0 &&
      (override.openZones || []).length === 0 &&
      (override.lockedSlots || []).length === 0 &&
      (override.openSlots || []).length === 0
  );
}

function normalizeVenueAvailabilityStore(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const entries = [];
  for (const [venueId, override] of Object.entries(input)) {
    const normalizedVenueId = sanitizeText(venueId);
    if (!normalizedVenueId) {
      continue;
    }

    const normalizedOverride = normalizeVenueAvailabilityOverride(override);
    if (isVenueAvailabilityOverrideEmpty(normalizedOverride)) {
      continue;
    }

    entries.push([normalizedVenueId, normalizedOverride]);
  }

  return Object.fromEntries(entries);
}

function getVenueAvailabilityOverride(settings = {}, venueId = DEFAULT_VENUE_ID) {
  const store = normalizeVenueAvailabilityStore(settings.venueAvailability);
  const normalizedVenueId = sanitizeText(venueId) || DEFAULT_VENUE_ID;
  return (
    store[normalizedVenueId] ||
    normalizeVenueAvailabilityOverride()
  );
}

function getVenueFilePath(venueId) {
  return path.join(VENUES_DIR, `${sanitizeText(venueId) || DEFAULT_VENUE_ID}.json`);
}

function getPositiveNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeVenueZoneDefinition(zone) {
  const code = sanitizeText(zone?.code).toUpperCase();
  const count = Number.parseInt(zone?.count, 10);
  const layout = zone?.layout && typeof zone.layout === "object" ? zone.layout : {};

  if (!code || !Number.isInteger(count) || count < 1) {
    return null;
  }

  return {
    code,
    label: sanitizeText(zone?.label) || `ZONE ${code}`,
    mobileLabel: sanitizeText(zone?.mobileLabel) || `โซน ${code}`,
    count,
    bookable: zone?.bookable !== false,
    description: sanitizeText(zone?.description),
    layout: {
      x: getPositiveNumber(Number(layout.x), 0),
      y: getPositiveNumber(Number(layout.y), 0),
      width: getPositiveNumber(Number(layout.width), 1),
      height: getPositiveNumber(Number(layout.height), 1),
      columns: getPositiveNumber(Number.parseInt(layout.columns, 10), count),
      accentPosition: sanitizeText(layout.accentPosition) || "top",
      accentHeight: getPositiveNumber(Number(layout.accentHeight), 0),
      labelY: getPositiveNumber(Number(layout.labelY), 24),
      labelSize: getPositiveNumber(Number(layout.labelSize), 12),
    },
  };
}

function normalizeVenueDefinition(input = {}, requestedVenueId = DEFAULT_VENUE_ID) {
  const board = input?.board && typeof input.board === "object" ? input.board : {};
  const boardWidth = getPositiveNumber(Number(board.width), 1835);
  const boardHeight = getPositiveNumber(Number(board.height), 1166);
  const zones = Array.isArray(input?.zones)
    ? input.zones.map(normalizeVenueZoneDefinition).filter(Boolean)
    : [];
  const boardMobileViews =
    board.mobileViews && typeof board.mobileViews === "object" ? board.mobileViews : {};
  const mobileViews = {
    ALL: {
      x: getPositiveNumber(Number(boardMobileViews.ALL?.x), 0) - 0,
      width: getPositiveNumber(Number(boardMobileViews.ALL?.width), boardWidth),
    },
  };

  for (const zone of zones) {
    const mobileView = boardMobileViews[zone.code];
    if (!mobileView || typeof mobileView !== "object") {
      continue;
    }

    mobileViews[zone.code] = {
      x: getPositiveNumber(Number(mobileView.x), 0) - 0,
      width: getPositiveNumber(Number(mobileView.width), boardWidth),
    };
  }

  return {
    id: sanitizeText(input?.id) || sanitizeText(requestedVenueId) || DEFAULT_VENUE_ID,
    label: sanitizeText(input?.label) || "ผังสนามหลัก",
    mobileBreakpoint: getPositiveNumber(Number.parseInt(input?.mobileBreakpoint, 10), 720),
    board: {
      width: boardWidth,
      height: boardHeight,
      mobileViews,
      elements: Array.isArray(board.elements) ? board.elements : [],
    },
    zones,
  };
}

function buildVenueRuntime(definition, availabilityOverride = {}) {
  const venue = normalizeVenueDefinition(definition);
  const overrides = normalizeVenueAvailabilityOverride(availabilityOverride);
  const lockedZoneSet = new Set(overrides.lockedZones);
  const openZoneSet = new Set(overrides.openZones);
  const lockedSlotSet = new Set(overrides.lockedSlots);
  const openSlotSet = new Set(overrides.openSlots);
  const zones = venue.zones.map((zone) => {
    const availabilityOverrideMode = openZoneSet.has(zone.code)
      ? "open"
      : lockedZoneSet.has(zone.code)
        ? "locked"
        : "default";
    const baseBookable = zone.bookable !== false;
    const isBookable = availabilityOverrideMode === "open"
      ? true
      : availabilityOverrideMode === "locked"
        ? false
        : baseBookable;

    return {
      ...zone,
      baseBookable,
      isBookable,
      availabilityOverride: availabilityOverrideMode,
      availabilitySource:
        availabilityOverrideMode !== "default"
          ? `zone-${availabilityOverrideMode}`
          : baseBookable
            ? "venue-open"
            : "venue-locked",
    };
  });
  const zoneMap = new Map(zones.map((zone) => [zone.code, zone]));
  const slots = zones.flatMap((zone) => {
    return Array.from({ length: zone.count }, (_, index) => {
      const label = `${index + 1}${zone.code}`;
      const availabilityOverrideMode = openSlotSet.has(label)
        ? "open"
        : lockedSlotSet.has(label)
          ? "locked"
          : "default";
      const isBookable = availabilityOverrideMode === "open"
        ? true
        : availabilityOverrideMode === "locked"
          ? false
          : zone.isBookable;

      return {
        id: label,
        label,
        zone: zone.code,
        order: index + 1,
        isBookable,
        availabilityOverride: availabilityOverrideMode,
        availabilitySource:
          availabilityOverrideMode !== "default"
            ? `slot-${availabilityOverrideMode}`
            : zone.availabilityOverride !== "default"
              ? `zone-${zone.availabilityOverride}`
              : zone.baseBookable
                ? "venue-open"
                : "venue-locked",
      };
    });
  });
  const slotMap = new Map(slots.map((slot) => [slot.id.toLowerCase(), slot]));
  const unavailableSlotIds = new Set(
    slots.filter((slot) => !slot.isBookable).map((slot) => slot.id.toLowerCase()),
  );

  return {
    ...venue,
    availabilityOverride: overrides,
    zones,
    zoneMap,
    slots,
    slotMap,
    unavailableSlotIds,
  };
}

function serializeVenueZoneForClient(zone) {
  return {
    code: zone.code,
    label: zone.label,
    mobileLabel: zone.mobileLabel,
    count: zone.count,
    bookable: zone.bookable,
    description: zone.description,
    layout: zone.layout,
    baseBookable: zone.baseBookable !== false,
    isBookable: zone.isBookable !== false,
    availabilityOverride: sanitizeText(zone.availabilityOverride) || "default",
    availabilitySource: sanitizeText(zone.availabilitySource) || "venue-open",
    totalSlots: Number.parseInt(zone.totalSlots, 10) || zone.count,
    availableSlots: Number.parseInt(zone.availableSlots, 10) || 0,
    bookedSlots: Number.parseInt(zone.bookedSlots, 10) || 0,
    lockedSlots: Number.parseInt(zone.lockedSlots, 10) || 0,
  };
}

function serializeVenueForClient(venue, zones = venue.zones) {
  return {
    id: venue.id,
    label: venue.label,
    mobileBreakpoint: venue.mobileBreakpoint,
    board: venue.board,
    zones: zones.map(serializeVenueZoneForClient),
  };
}

function setZoneAvailabilityOverride(overrides, venue, zoneCode, action) {
  const zone = venue.zoneMap.get(sanitizeZoneCode(zoneCode));
  if (!zone) {
    return null;
  }

  const normalized = normalizeVenueAvailabilityOverride(overrides);
  const lockedZones = new Set(normalized.lockedZones);
  const openZones = new Set(normalized.openZones);
  const lockedSlots = new Set(normalized.lockedSlots);
  const openSlots = new Set(normalized.openSlots);

  lockedZones.delete(zone.code);
  openZones.delete(zone.code);
  if (action === "lock") {
    lockedZones.add(zone.code);
  } else {
    openZones.add(zone.code);
  }

  for (const slot of venue.slots) {
    if (slot.zone !== zone.code) {
      continue;
    }

    lockedSlots.delete(slot.id);
    openSlots.delete(slot.id);
  }

  return normalizeVenueAvailabilityOverride({
    lockedZones: [...lockedZones],
    openZones: [...openZones],
    lockedSlots: [...lockedSlots],
    openSlots: [...openSlots],
  });
}

function setSlotAvailabilityOverride(overrides, slotId, action) {
  const normalizedSlotId = sanitizeTentSlotId(slotId);
  if (!normalizedSlotId) {
    return null;
  }

  const normalized = normalizeVenueAvailabilityOverride(overrides);
  const lockedSlots = new Set(normalized.lockedSlots);
  const openSlots = new Set(normalized.openSlots);

  lockedSlots.delete(normalizedSlotId);
  openSlots.delete(normalizedSlotId);
  if (action === "lock") {
    lockedSlots.add(normalizedSlotId);
  } else {
    openSlots.add(normalizedSlotId);
  }

  return normalizeVenueAvailabilityOverride({
    lockedZones: normalized.lockedZones,
    openZones: normalized.openZones,
    lockedSlots: [...lockedSlots],
    openSlots: [...openSlots],
  });
}

function findClassIndex(classes, className) {
  const target = normalizeText(className);
  return classes.findIndex((item) => normalizeText(item) === target);
}

function findMatchingClassName(classes, className) {
  return classes.find((item) => normalizeText(item) === normalizeText(className)) || "";
}

function validateClassName(value) {
  const className = sanitizeText(value);
  if (!className) {
    throw new Error("กรุณากรอกชื่อรุ่นแข่งขัน");
  }

  return className;
}

function validateEventLocationLine(value, label, options = {}) {
  const { required = false, maxLength = 120 } = options;
  const text = sanitizeText(value);

  if (required && !text) {
    throw new Error(`กรุณากรอก${label}`);
  }

  if (text.length > maxLength) {
    throw new Error(`${label}ต้องไม่เกิน ${maxLength} ตัวอักษร`);
  }

  return text;
}

function validateEventLocation(payload) {
  return {
    locationLine1: validateEventLocationLine(payload?.locationLine1, "สถานที่บรรทัดแรก", {
      required: true,
    }),
    locationLine2: validateEventLocationLine(payload?.locationLine2, "สถานที่บรรทัดที่สอง"),
  };
}

function ensureClassNameAvailable(classes, className, ignoreIndex = -1) {
  const normalized = normalizeText(className);
  const duplicateIndex = classes.findIndex((item, index) => {
    return index !== ignoreIndex && normalizeText(item) === normalized;
  });

  if (duplicateIndex !== -1) {
    throw new Error("มีรุ่นแข่งขันชื่อนี้อยู่แล้ว");
  }
}

function getRawRegistrationEntries(payload) {
  if (Array.isArray(payload?.entries) && payload.entries.length > 0) {
    return payload.entries;
  }

  if (
    payload &&
    (Object.prototype.hasOwnProperty.call(payload, "raceClass") ||
      Object.prototype.hasOwnProperty.call(payload, "vehicleCount") ||
      Object.prototype.hasOwnProperty.call(payload, "bikeNumbers"))
  ) {
    return [
      {
        raceClass: payload.raceClass,
        vehicleCount: payload.vehicleCount,
        bikeNumbers: payload.bikeNumbers,
      },
    ];
  }

  return [];
}

function normalizeRegistrationEntryRecord(entry) {
  const candidate = entry && typeof entry === "object" ? entry : {};
  const bikeNumbers = Array.isArray(candidate.bikeNumbers)
    ? candidate.bikeNumbers.map(sanitizeText).filter(Boolean)
    : [];
  const parsedVehicleCount = Number.parseInt(candidate.vehicleCount, 10);
  const fallbackVehicleCount = bikeNumbers.length > 0 ? bikeNumbers.length : 1;
  const vehicleCount =
    Number.isInteger(parsedVehicleCount) && parsedVehicleCount > 0
      ? Math.min(parsedVehicleCount, MAX_VEHICLES)
      : Math.min(fallbackVehicleCount, MAX_VEHICLES);

  return {
    raceClass: sanitizeText(candidate.raceClass),
    vehicleCount,
    bikeNumbers: bikeNumbers.slice(0, vehicleCount),
  };
}

function normalizeRegistrationRecord(registration) {
  const candidate = registration && typeof registration === "object" ? registration : {};
  const entries = getRawRegistrationEntries(candidate)
    .map(normalizeRegistrationEntryRecord)
    .filter((entry) => entry.raceClass);

  if (!candidate.id || !sanitizeText(candidate.applicantName) || entries.length === 0) {
    return null;
  }

  return {
    id: String(candidate.id),
    applicantName: sanitizeText(candidate.applicantName),
    address: sanitizeText(candidate.address),
    contactPhone: sanitizeText(candidate.contactPhone),
    entries,
    createdAt: sanitizeText(candidate.createdAt),
    updatedAt: sanitizeText(candidate.updatedAt),
  };
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(VENUES_DIR, { recursive: true });

  try {
    await fs.access(REGISTRATIONS_FILE);
  } catch {
    await fs.writeFile(REGISTRATIONS_FILE, "[]\n", "utf8");
  }

  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.writeFile(
      SETTINGS_FILE,
      `${JSON.stringify(
        serializeSettings({
          classes: DEFAULT_CLASSES,
          eventBrand: DEFAULT_EVENT_BRAND,
        }),
        null,
        2,
      )}\n`,
      "utf8",
    );
  }

  try {
    await fs.access(TENT_BOOKINGS_FILE);
  } catch {
    await fs.writeFile(TENT_BOOKINGS_FILE, "[]\n", "utf8");
  }
}

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function loadRegistrations() {
  const registrations = await readJson(REGISTRATIONS_FILE, []);
  return Array.isArray(registrations)
    ? registrations.map(normalizeRegistrationRecord).filter(Boolean)
    : [];
}

async function saveRegistrations(registrations) {
  const normalized = Array.isArray(registrations)
    ? registrations.map(normalizeRegistrationRecord).filter(Boolean)
    : [];
  await writeJson(REGISTRATIONS_FILE, normalized);
}

async function loadSettings() {
  const settings = await readJson(SETTINGS_FILE, {});
  return serializeSettings(settings);
}

async function loadClasses() {
  const settings = await loadSettings();
  return settings.classes;
}

async function saveClasses(classes) {
  const settings = await loadSettings();
  await writeJson(
    SETTINGS_FILE,
    serializeSettings({
      ...settings,
      classes,
    }),
  );
}

async function loadEventBrand() {
  const settings = await loadSettings();
  return settings.eventBrand;
}

async function saveEventBrand(eventBrand) {
  const settings = await loadSettings();
  await writeJson(
    SETTINGS_FILE,
    serializeSettings({
      ...settings,
      eventBrand,
    }),
  );
}

async function loadVenue(venueId = DEFAULT_VENUE_ID, availabilityOverride = {}) {
  const normalizedVenueId = sanitizeText(venueId) || DEFAULT_VENUE_ID;
  const preferredVenue = await readJson(getVenueFilePath(normalizedVenueId), null);
  const fallbackVenue = normalizedVenueId === DEFAULT_VENUE_ID
    ? preferredVenue
    : await readJson(getVenueFilePath(DEFAULT_VENUE_ID), null);

  return buildVenueRuntime(
    preferredVenue || fallbackVenue || { id: normalizedVenueId },
    availabilityOverride,
  );
}

async function loadCurrentVenue() {
  const settings = await loadSettings();
  return loadVenue(
    settings.currentVenueId,
    getVenueAvailabilityOverride(settings, settings.currentVenueId),
  );
}

function findTentSlot(venue, slotId) {
  return venue.slotMap.get(normalizeText(slotId)) || null;
}

function isTentSlotBookable(venue, slotOrSlotId) {
  const slot = typeof slotOrSlotId === "string" ? findTentSlot(venue, slotOrSlotId) : slotOrSlotId;
  return Boolean(slot) && !venue.unavailableSlotIds.has(slot.id.toLowerCase());
}

function sortTentBookings(venue, bookings) {
  return [...bookings].sort((left, right) => {
    const leftSlot = findTentSlot(venue, left.slotId);
    const rightSlot = findTentSlot(venue, right.slotId);
    const leftRank = leftSlot ? `${leftSlot.zone}-${String(leftSlot.order).padStart(2, "0")}` : "";
    const rightRank = rightSlot ? `${rightSlot.zone}-${String(rightSlot.order).padStart(2, "0")}` : "";
    return leftRank.localeCompare(rightRank);
  });
}

function normalizeTentBookingRecord(venue, booking) {
  const candidate = booking && typeof booking === "object" ? booking : {};
  const slot = findTentSlot(venue, candidate.slotId);
  const registrationId = sanitizeText(candidate.registrationId);

  if (!slot || !registrationId || !isTentSlotBookable(venue, slot)) {
    return null;
  }

  return {
    slotId: slot.id,
    registrationId,
    updatedAt: sanitizeText(candidate.updatedAt),
  };
}

function normalizeTentBookingStore(store, fallbackVenueId) {
  if (Array.isArray(store)) {
    return { [fallbackVenueId]: store };
  }

  return store && typeof store === "object" ? { ...store } : {};
}

async function loadTentBookings(venue) {
  const store = normalizeTentBookingStore(
    await readJson(TENT_BOOKINGS_FILE, {}),
    venue.id,
  );
  const bookings = Array.isArray(store[venue.id]) ? store[venue.id] : [];
  const bookingMap = new Map();
  for (const booking of bookings) {
    const normalized = normalizeTentBookingRecord(venue, booking);
    if (!normalized) {
      continue;
    }

    bookingMap.set(normalized.slotId, normalized);
  }

  return sortTentBookings(venue, [...bookingMap.values()]);
}

async function saveTentBookings(venue, bookings) {
  const store = normalizeTentBookingStore(
    await readJson(TENT_BOOKINGS_FILE, {}),
    venue.id,
  );
  const bookingMap = new Map();
  if (Array.isArray(bookings)) {
    for (const booking of bookings) {
      const normalized = normalizeTentBookingRecord(venue, booking);
      if (!normalized) {
        continue;
      }

      bookingMap.set(normalized.slotId, normalized);
    }
  }

  store[venue.id] = sortTentBookings(venue, [...bookingMap.values()]);
  await writeJson(TENT_BOOKINGS_FILE, store);
}

function filterTentBookingsByRegistrations(venue, bookings, registrations) {
  const validRegistrationIds = new Set(
    registrations.map((registration) => registration.id),
  );

  return bookings.filter((booking) => {
    return (
      validRegistrationIds.has(booking.registrationId) &&
      isTentSlotBookable(venue, booking.slotId)
    );
  });
}

function buildTentSlotPayload(venue, bookings, registrations) {
  const registrationsById = new Map(
    registrations.map((registration) => [registration.id, registration]),
  );
  const bookingsBySlotId = new Map(
    bookings.map((booking) => [booking.slotId, booking]),
  );
  const zones = venue.zones.map((zone) => {
    const zoneSlots = venue.slots.filter((slot) => slot.zone === zone.code);
    const lockedSlots = zoneSlots.filter((slot) => !slot.isBookable).length;
    const bookedSlots = zoneSlots.filter((slot) => {
      return slot.isBookable && bookingsBySlotId.has(slot.id);
    }).length;
    const availableSlots = zoneSlots.filter((slot) => {
      return slot.isBookable && !bookingsBySlotId.has(slot.id);
    }).length;

    return {
      ...zone,
      totalSlots: zoneSlots.length,
      lockedSlots,
      bookedSlots,
      availableSlots,
    };
  });

  const slots = venue.slots.map((slot) => {
    const booking = bookingsBySlotId.get(slot.id);
    const registration = booking ? registrationsById.get(booking.registrationId) : null;

    return {
      id: slot.id,
      label: slot.label,
      zone: slot.zone,
      order: slot.order,
      isBookable: slot.isBookable !== false,
      isLocked: slot.isBookable === false,
      availabilityOverride: sanitizeText(slot.availabilityOverride) || "default",
      availabilitySource: sanitizeText(slot.availabilitySource) || "venue-open",
      registrationId: registration?.id || "",
      applicantName: registration?.applicantName || "",
      contactPhone: registration?.contactPhone || "",
      updatedAt: booking?.updatedAt || "",
    };
  });
  const bookedSlots = slots.filter((slot) => slot.isBookable && slot.registrationId).length;
  const unavailableSlots = slots.filter((slot) => !slot.isBookable).length;
  const bookableSlots = slots.length - unavailableSlots;
  const lastUpdatedAt = slots.reduce((latest, slot) => {
    return slot.updatedAt && slot.updatedAt > latest ? slot.updatedAt : latest;
  }, "");

  return {
    venue: serializeVenueForClient(venue, zones),
    zones,
    slots,
    totalSlots: slots.length,
    bookableSlots,
    unavailableSlots,
    bookedSlots,
    availableSlots: bookableSlots - bookedSlots,
    lastUpdatedAt,
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": CONTENT_TYPES[".json"],
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, statusCode, message) {
  sendJson(response, statusCode, { error: message });
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": CONTENT_TYPES[".txt"],
    "Cache-Control": "no-store",
  });
  response.end(message);
}

async function parseRequestBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_SIZE) {
      throw new Error("PAYLOAD_TOO_LARGE");
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("INVALID_JSON");
  }
}

async function parseJsonBodyOrSendError(request, response) {
  try {
    return await parseRequestBody(request);
  } catch (error) {
    if (error.message === "PAYLOAD_TOO_LARGE") {
      sendError(response, 413, "ข้อมูลมีขนาดใหญ่เกินไป");
      return null;
    }

    sendError(response, 400, "รูปแบบข้อมูลไม่ถูกต้อง");
    return null;
  }
}

async function updateCurrentVenueAvailability(action, targetKind, targetId) {
  const settings = await loadSettings();
  const currentVenueId = settings.currentVenueId;
  const currentOverride = getVenueAvailabilityOverride(settings, currentVenueId);
  const currentVenue = await loadVenue(currentVenueId, currentOverride);

  const nextOverride = targetKind === "zone"
    ? setZoneAvailabilityOverride(currentOverride, currentVenue, targetId, action)
    : setSlotAvailabilityOverride(currentOverride, targetId, action);

  if (!nextOverride) {
    return null;
  }

  const [registrations, currentTentBookings] = await Promise.all([
    loadRegistrations(),
    loadTentBookings(currentVenue),
  ]);
  const validTentBookings = filterTentBookingsByRegistrations(
    currentVenue,
    currentTentBookings,
    registrations,
  );
  const nextVenueAvailability = {
    ...normalizeVenueAvailabilityStore(settings.venueAvailability),
  };

  if (isVenueAvailabilityOverrideEmpty(nextOverride)) {
    delete nextVenueAvailability[currentVenue.id];
  } else {
    nextVenueAvailability[currentVenue.id] = nextOverride;
  }

  await writeJson(
    SETTINGS_FILE,
    serializeSettings({
      ...settings,
      venueAvailability: nextVenueAvailability,
    }),
  );

  const nextVenue = await loadVenue(currentVenue.id, nextOverride);
  const nextTentBookings = validTentBookings.filter((booking) => {
    return isTentSlotBookable(nextVenue, booking.slotId);
  });

  await saveTentBookings(nextVenue, nextTentBookings);

  return {
    clearedBookings: validTentBookings.length - nextTentBookings.length,
    payload: buildTentSlotPayload(nextVenue, nextTentBookings, registrations),
  };
}

function validateClasses(input) {
  const classes = Array.isArray(input)
    ? uniqueStrings(input.map(sanitizeText))
    : [];

  if (classes.length === 0) {
    throw new Error("ต้องมีรุ่นแข่งขันอย่างน้อย 1 รุ่น");
  }

  return classes;
}

function validateRegistrationEntry(payload, classes, selectedClasses) {
  const matchingClassName = findMatchingClassName(classes, payload.raceClass);
  const vehicleCount = Number.parseInt(payload.vehicleCount, 10);
  const rawBikeNumbers = Array.isArray(payload.bikeNumbers)
    ? payload.bikeNumbers
    : [];
  const bikeNumbers = rawBikeNumbers.map(sanitizeText);

  if (!matchingClassName) {
    throw new Error("กรุณาเลือกรุ่นที่สมัครจากรายการ");
  }

  const normalizedClassName = normalizeText(matchingClassName);
  if (selectedClasses.has(normalizedClassName)) {
    throw new Error("ในใบสมัครเดียวกัน ห้ามเลือกรุ่นแข่งขันซ้ำ");
  }
  selectedClasses.add(normalizedClassName);

  if (
    !Number.isInteger(vehicleCount) ||
    vehicleCount < 1 ||
    vehicleCount > MAX_VEHICLES
  ) {
    throw new Error(`จำนวนรถต้องอยู่ระหว่าง 1 ถึง ${MAX_VEHICLES} คัน`);
  }

  if (bikeNumbers.length !== vehicleCount) {
    throw new Error("จำนวนหมายเลขรถไม่ตรงกับจำนวนรถที่ลงแข่ง");
  }

  if (bikeNumbers.some((value) => !value)) {
    throw new Error("กรุณากรอกหมายเลขรถให้ครบทุกคัน");
  }

  const bikeNumberSet = new Set();
  for (const bikeNumber of bikeNumbers) {
    const normalized = bikeNumber.toLowerCase();
    if (bikeNumberSet.has(normalized)) {
      throw new Error("หมายเลขรถในใบสมัครเดียวกันต้องไม่ซ้ำกัน");
    }
    bikeNumberSet.add(normalized);
  }

  return {
    raceClass: matchingClassName,
    vehicleCount,
    bikeNumbers,
  };
}

function getBikeNumberWarnings(entries, registrations, currentId = null) {
  const requestedNumbers = new Map();
  for (const entry of entries) {
    for (const bikeNumber of entry.bikeNumbers || []) {
      const normalizedBikeNumber = normalizeText(bikeNumber);
      if (!normalizedBikeNumber || requestedNumbers.has(normalizedBikeNumber)) {
        continue;
      }

      requestedNumbers.set(normalizedBikeNumber, sanitizeText(bikeNumber));
    }
  }

  if (requestedNumbers.size === 0) {
    return [];
  }

  const warningMap = new Map();
  for (const registration of registrations) {
    if (registration.id === currentId) {
      continue;
    }

    const applicantName = sanitizeText(registration.applicantName) || "ทีมไม่ระบุชื่อ";
    for (const entry of registration.entries || []) {
      for (const bikeNumber of entry.bikeNumbers || []) {
        const normalizedBikeNumber = normalizeText(bikeNumber);
        if (!requestedNumbers.has(normalizedBikeNumber)) {
          continue;
        }

        const currentWarning = warningMap.get(normalizedBikeNumber) || {
          bikeNumber: requestedNumbers.get(normalizedBikeNumber) || sanitizeText(bikeNumber),
          applicantNames: [],
        };
        if (!currentWarning.applicantNames.includes(applicantName)) {
          currentWarning.applicantNames.push(applicantName);
        }
        warningMap.set(normalizedBikeNumber, currentWarning);
      }
    }
  }

  return [...warningMap.values()].sort((left, right) => {
    return left.bikeNumber.localeCompare(right.bikeNumber, "th");
  });
}

function validateRegistration(payload, classes, registrations, currentId = null) {
  const applicantName = sanitizeText(payload.applicantName);
  const address = sanitizeText(payload.address);
  const contactPhone = sanitizeText(payload.contactPhone);
  const rawEntries = getRawRegistrationEntries(payload);

  if (!applicantName) {
    throw new Error("กรุณากรอกชื่อผู้สมัคร");
  }

  if (!address) {
    throw new Error("กรุณากรอกที่อยู่");
  }

  if (!contactPhone) {
    throw new Error("กรุณากรอกเบอร์โทรติดต่อ");
  }

  if (rawEntries.length === 0) {
    throw new Error("กรุณาเพิ่มรุ่นที่สมัครอย่างน้อย 1 รุ่น");
  }

  const selectedClasses = new Set();
  const entries = rawEntries.map((entry) => {
    return validateRegistrationEntry(entry, classes, selectedClasses);
  });

  return {
    applicantName,
    address,
    contactPhone,
    entries,
  };
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/meta") {
    const settings = await loadSettings();
    return sendJson(response, 200, {
      classes: settings.classes,
      maxVehicles: MAX_VEHICLES,
      eventBrand: settings.eventBrand,
      currentVenueId: settings.currentVenueId,
    });
  }

  if (request.method === "PUT" && url.pathname === "/api/meta/event-location") {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    try {
      const currentEventBrand = await loadEventBrand();
      const nextEventBrand = buildEventBrand({
        ...currentEventBrand,
        ...validateEventLocation(body),
      });

      await saveEventBrand(nextEventBrand);
      return sendJson(response, 200, { eventBrand: nextEventBrand });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  if (request.method === "POST" && url.pathname === "/api/meta/classes") {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    try {
      const className = validateClassName(body.className);
      const classes = await loadClasses();
      ensureClassNameAvailable(classes, className);

      const nextClasses = [...classes, className];
      await saveClasses(nextClasses);
      return sendJson(response, 201, { classes: nextClasses, className });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  if (request.method === "PUT" && url.pathname === "/api/meta/classes/rename") {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    try {
      const currentName = validateClassName(body.currentName);
      const nextName = validateClassName(body.nextName);
      const [classes, registrations] = await Promise.all([
        loadClasses(),
        loadRegistrations(),
      ]);
      const classIndex = findClassIndex(classes, currentName);

      if (classIndex === -1) {
        return sendError(response, 404, "ไม่พบรุ่นแข่งขันที่ต้องการแก้ไข");
      }

      ensureClassNameAvailable(classes, nextName, classIndex);

      const currentNormalized = normalizeText(currentName);
      const updatedClasses = [...classes];
      updatedClasses[classIndex] = nextName;

      const updatedRegistrations = registrations.map((registration) => {
        let didChange = false;
        const nextEntries = (registration.entries || []).map((entry) => {
          if (normalizeText(entry.raceClass) !== currentNormalized) {
            return entry;
          }

          didChange = true;
          return {
            ...entry,
            raceClass: nextName,
          };
        });

        if (!didChange) {
          return registration;
        }

        return {
          ...registration,
          entries: nextEntries,
          updatedAt: new Date().toISOString(),
        };
      });

      await Promise.all([
        saveClasses(updatedClasses),
        saveRegistrations(updatedRegistrations),
      ]);

      return sendJson(response, 200, {
        classes: updatedClasses,
        renamedFrom: currentName,
        renamedTo: nextName,
      });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  const classRouteMatch = url.pathname.match(/^\/api\/meta\/classes\/([^/]+)$/);
  if (request.method === "DELETE" && classRouteMatch) {
    const className = sanitizeText(decodeURIComponent(classRouteMatch[1]));

    try {
      const [classes, registrations] = await Promise.all([
        loadClasses(),
        loadRegistrations(),
      ]);
      const classIndex = findClassIndex(classes, className);

      if (classIndex === -1) {
        return sendError(response, 404, "ไม่พบรุ่นแข่งขันที่ต้องการลบ");
      }

      if (classes.length === 1) {
        return sendError(response, 400, "ต้องเหลือรุ่นแข่งขันอย่างน้อย 1 รุ่น");
      }

      const targetName = classes[classIndex];
      const usageCount = registrations.reduce((count, registration) => {
        return count + (registration.entries || []).filter((entry) => {
          return normalizeText(entry.raceClass) === normalizeText(targetName);
        }).length;
      }, 0);

      if (usageCount > 0) {
        return sendError(
          response,
          400,
          `ยังลบรุ่นนี้ไม่ได้ เพราะมีข้อมูลใช้งานอยู่ ${usageCount} รายการ`,
        );
      }

      const nextClasses = classes.filter((_, index) => index !== classIndex);
      await saveClasses(nextClasses);
      return sendJson(response, 200, { classes: nextClasses, deletedClass: targetName });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  if (request.method === "PUT" && url.pathname === "/api/meta/classes") {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    try {
      const classes = validateClasses(body.classes);
      const registrations = await loadRegistrations();
      const inUseClasses = new Set(
        registrations.flatMap((item) => {
          return (item.entries || []).map((entry) => entry.raceClass);
        }),
      );
      const missingInUseClasses = [...inUseClasses].filter(
        (className) => !classes.includes(className),
      );

      if (missingInUseClasses.length > 0) {
        return sendError(
          response,
          400,
          `ยังลบรุ่นนี้ไม่ได้ เพราะมีข้อมูลใช้งานอยู่: ${missingInUseClasses.join(", ")}`,
        );
      }

      await saveClasses(classes);
      return sendJson(response, 200, { classes });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  if (request.method === "GET" && url.pathname === "/api/registrations") {
    const registrations = await loadRegistrations();
    const sorted = [...registrations].sort((left, right) => {
      return right.createdAt.localeCompare(left.createdAt);
    });
    return sendJson(response, 200, { registrations: sorted });
  }

  if (request.method === "GET" && url.pathname === "/api/tent-bookings") {
    const [venue, registrations] = await Promise.all([
      loadCurrentVenue(),
      loadRegistrations(),
    ]);
    const tentBookings = await loadTentBookings(venue);
    const validTentBookings = filterTentBookingsByRegistrations(
      venue,
      tentBookings,
      registrations,
    );

    if (validTentBookings.length !== tentBookings.length) {
      await saveTentBookings(venue, validTentBookings);
    }

    return sendJson(
      response,
      200,
      buildTentSlotPayload(venue, validTentBookings, registrations),
    );
  }

  const tentZoneActionMatch = url.pathname.match(/^\/api\/tent-bookings\/zones\/([^/]+)\/(lock|unlock)$/);
  if (request.method === "PUT" && tentZoneActionMatch) {
    const zoneCode = sanitizeZoneCode(decodeURIComponent(tentZoneActionMatch[1]));
    const action = tentZoneActionMatch[2];
    const venue = await loadCurrentVenue();

    if (!venue.zoneMap.has(zoneCode)) {
      return sendError(response, 404, "ไม่พบโซนที่ต้องการอัปเดต");
    }

    const result = await updateCurrentVenueAvailability(action, "zone", zoneCode);
    if (!result) {
      return sendError(response, 400, "ไม่สามารถอัปเดตสถานะโซนได้");
    }

    return sendJson(response, 200, {
      ...result.payload,
      action,
      clearedBookings: result.clearedBookings,
      zone: result.payload.zones.find((item) => item.code === zoneCode) || null,
    });
  }

  const tentSlotActionMatch = url.pathname.match(/^\/api\/tent-bookings\/slots\/([^/]+)\/(lock|unlock)$/);
  if (request.method === "PUT" && tentSlotActionMatch) {
    const slotId = sanitizeTentSlotId(decodeURIComponent(tentSlotActionMatch[1]));
    const action = tentSlotActionMatch[2];
    const venue = await loadCurrentVenue();

    if (!findTentSlot(venue, slotId)) {
      return sendError(response, 404, "ไม่พบเต็นท์ที่ต้องการอัปเดต");
    }

    const result = await updateCurrentVenueAvailability(action, "slot", slotId);
    if (!result) {
      return sendError(response, 400, "ไม่สามารถอัปเดตสถานะเต็นท์ได้");
    }

    return sendJson(response, 200, {
      ...result.payload,
      action,
      clearedBookings: result.clearedBookings,
      slot: result.payload.slots.find((item) => item.id === slotId) || null,
    });
  }

  const tentRouteMatch = url.pathname.match(/^\/api\/tent-bookings\/([^/]+)$/);
  if (request.method === "PUT" && tentRouteMatch) {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    const venue = await loadCurrentVenue();
    const slot = findTentSlot(venue, decodeURIComponent(tentRouteMatch[1]));
    if (!slot) {
      return sendError(response, 404, "ไม่พบเต็นท์ที่ต้องการบันทึก");
    }

    if (!isTentSlotBookable(venue, slot)) {
      return sendError(response, 400, "เต็นท์ช่องนี้ไม่เปิดให้จอง");
    }

    const registrationId = sanitizeText(body.registrationId);
    const [registrations, tentBookings] = await Promise.all([
      loadRegistrations(),
      loadTentBookings(venue),
    ]);
    const validTentBookings = filterTentBookingsByRegistrations(
      venue,
      tentBookings,
      registrations,
    );

    if (validTentBookings.length !== tentBookings.length) {
      await saveTentBookings(venue, validTentBookings);
    }

    if (registrationId) {
      const registration = registrations.find((item) => item.id === registrationId);
      if (!registration) {
        return sendError(response, 400, "ไม่พบรายชื่อผู้สมัครที่เลือกสำหรับการจองเต็นท์");
      }
    }

    const nextTentBookings = validTentBookings.filter((booking) => booking.slotId !== slot.id);
    if (registrationId) {
      nextTentBookings.push({
        slotId: slot.id,
        registrationId,
        updatedAt: new Date().toISOString(),
      });
    }

    await saveTentBookings(venue, nextTentBookings);

    const payload = buildTentSlotPayload(venue, nextTentBookings, registrations);
    return sendJson(response, 200, {
      ...payload,
      slot: payload.slots.find((item) => item.id === slot.id) || null,
    });
  }

  if (request.method === "POST" && url.pathname === "/api/registrations") {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    const [classes, registrations] = await Promise.all([
      loadClasses(),
      loadRegistrations(),
    ]);

    try {
      const registration = validateRegistration(body, classes, registrations);
      const bikeNumberWarnings = getBikeNumberWarnings(
        registration.entries,
        registrations,
      );
      const now = new Date().toISOString();
      const createdRegistration = {
        id: randomUUID(),
        ...registration,
        createdAt: now,
        updatedAt: now,
      };

      registrations.push(createdRegistration);
      await saveRegistrations(registrations);
      return sendJson(response, 201, {
        registration: createdRegistration,
        bikeNumberWarnings,
      });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  const match = url.pathname.match(/^\/api\/registrations\/([^/]+)$/);
  if (!match) {
    return false;
  }

  const registrationId = decodeURIComponent(match[1]);
  const registrations = await loadRegistrations();
  const index = registrations.findIndex((item) => item.id === registrationId);

  if (index === -1) {
    return sendError(response, 404, "ไม่พบข้อมูลที่ต้องการ");
  }

  if (request.method === "DELETE") {
    registrations.splice(index, 1);
    const venue = await loadCurrentVenue();
    const tentBookings = await loadTentBookings(venue);
    const nextTentBookings = tentBookings.filter((booking) => {
      return booking.registrationId !== registrationId;
    });
    await Promise.all([
      saveRegistrations(registrations),
      nextTentBookings.length !== tentBookings.length
        ? saveTentBookings(venue, nextTentBookings)
        : Promise.resolve(),
    ]);
    return sendJson(response, 200, { success: true });
  }

  if (request.method === "PUT") {
    const body = await parseJsonBodyOrSendError(request, response);
    if (body === null) {
      return;
    }

    const classes = await loadClasses();

    try {
      const registration = validateRegistration(
        body,
        classes,
        registrations,
        registrationId,
      );
      const bikeNumberWarnings = getBikeNumberWarnings(
        registration.entries,
        registrations,
        registrationId,
      );
      const updatedRegistration = {
        ...registrations[index],
        ...registration,
        updatedAt: new Date().toISOString(),
      };

      registrations[index] = updatedRegistration;
      await saveRegistrations(registrations);
      return sendJson(response, 200, {
        registration: updatedRegistration,
        bikeNumberWarnings,
      });
    } catch (error) {
      return sendError(response, 400, error.message);
    }
  }

  return sendError(response, 405, "คำขอนี้ยังไม่รองรับ");
}

async function sendStaticFile(response, filePath) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[extension] || "application/octet-stream";

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    });
    response.end(fileBuffer);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(response, 404, "Not found");
      return;
    }

    sendText(response, 500, "Internal server error");
  }
}

async function handleRequest(request, response) {
  const host = request.headers.host || `${HOST}:${DEFAULT_PORT}`;
  const url = new URL(request.url || "/", `http://${host}`);

  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(request, response, url);
    if (handled === false) {
      sendError(response, 404, "ไม่พบ API ที่ร้องขอ");
    }
    return;
  }

  if (request.method !== "GET") {
    sendText(response, 405, "Method not allowed");
    return;
  }

  const requestedPath =
    url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  await sendStaticFile(response, filePath);
}

function createServer() {
  return http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error(error);
      sendError(response, 500, "เกิดข้อผิดพลาดภายในระบบ");
    });
  });
}

function listen(server, port, host) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      server.off("error", handleError);
      server.off("listening", handleListening);
    };
    const handleError = (error) => {
      cleanup();
      reject(error);
    };
    const handleListening = () => {
      cleanup();
      resolve();
    };

    server.once("error", handleError);
    server.once("listening", handleListening);
    server.listen(port, host);
  });
}

async function start({ host = HOST, port = DEFAULT_PORT } = {}) {
  await ensureDataFiles();
  const eventBrand = await loadEventBrand();

  const server = createServer();
  await listen(server, port, host);

  const address = server.address();
  const activePort =
    address && typeof address === "object" ? address.port : port;

  console.log(
    `${eventBrand.fullName} app started at http://${host}:${activePort}`
  );

  return server;
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Unable to start server", error);
    process.exitCode = 1;
  });
}

module.exports = {
  createServer,
  start,
};

