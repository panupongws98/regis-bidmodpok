const http = require("http");
const path = require("path");
const { randomUUID } = require("crypto");
const fs = require("fs/promises");

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 3000;
const MAX_BODY_SIZE = 1024 * 1024;
const MAX_VEHICLES = 20;

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const REGISTRATIONS_FILE = path.join(DATA_DIR, "registrations.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

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

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

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
      `${JSON.stringify({ classes: DEFAULT_CLASSES }, null, 2)}\n`,
      "utf8",
    );
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

async function loadClasses() {
  const settings = await readJson(SETTINGS_FILE, { classes: DEFAULT_CLASSES });
  const classes = Array.isArray(settings.classes)
    ? uniqueStrings(settings.classes.map(sanitizeText))
    : [];

  if (classes.length > 0) {
    return classes;
  }

  return DEFAULT_CLASSES;
}

async function saveClasses(classes) {
  await writeJson(SETTINGS_FILE, { classes });
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
  const bikeNumberSet = new Set();
  for (const entry of entries) {
    for (const bikeNumber of entry.bikeNumbers) {
      bikeNumberSet.add(bikeNumber.toLowerCase());
    }
  }

  const conflictingNumbers = [];
  for (const registration of registrations) {
    if (registration.id === currentId) {
      continue;
    }

    for (const entry of registration.entries || []) {
      for (const bikeNumber of entry.bikeNumbers || []) {
        if (bikeNumberSet.has(String(bikeNumber).trim().toLowerCase())) {
          conflictingNumbers.push(bikeNumber);
        }
      }
    }
  }

  if (conflictingNumbers.length > 0) {
    throw new Error(
      `หมายเลขรถซ้ำกับข้อมูลเดิม: ${uniqueStrings(conflictingNumbers).join(", ")}`,
    );
  }

  return {
    applicantName,
    address,
    contactPhone,
    entries,
  };
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/meta") {
    const classes = await loadClasses();
    return sendJson(response, 200, { classes, maxVehicles: MAX_VEHICLES });
  }

  if (request.method === "POST" && url.pathname === "/api/meta/classes") {
    let body;

    try {
      body = await parseRequestBody(request);
    } catch (error) {
      if (error.message === "PAYLOAD_TOO_LARGE") {
        return sendError(response, 413, "ข้อมูลมีขนาดใหญ่เกินไป");
      }

      return sendError(response, 400, "รูปแบบข้อมูลไม่ถูกต้อง");
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
    let body;

    try {
      body = await parseRequestBody(request);
    } catch (error) {
      if (error.message === "PAYLOAD_TOO_LARGE") {
        return sendError(response, 413, "ข้อมูลมีขนาดใหญ่เกินไป");
      }

      return sendError(response, 400, "รูปแบบข้อมูลไม่ถูกต้อง");
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
    let body;

    try {
      body = await parseRequestBody(request);
    } catch (error) {
      if (error.message === "PAYLOAD_TOO_LARGE") {
        return sendError(response, 413, "ข้อมูลมีขนาดใหญ่เกินไป");
      }

      return sendError(response, 400, "รูปแบบข้อมูลไม่ถูกต้อง");
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

  if (request.method === "POST" && url.pathname === "/api/registrations") {
    let body;

    try {
      body = await parseRequestBody(request);
    } catch (error) {
      if (error.message === "PAYLOAD_TOO_LARGE") {
        return sendError(response, 413, "ข้อมูลมีขนาดใหญ่เกินไป");
      }

      return sendError(response, 400, "รูปแบบข้อมูลไม่ถูกต้อง");
    }

    const [classes, registrations] = await Promise.all([
      loadClasses(),
      loadRegistrations(),
    ]);

    try {
      const registration = validateRegistration(body, classes, registrations);
      const now = new Date().toISOString();
      const createdRegistration = {
        id: randomUUID(),
        ...registration,
        createdAt: now,
        updatedAt: now,
      };

      registrations.push(createdRegistration);
      await saveRegistrations(registrations);
      return sendJson(response, 201, { registration: createdRegistration });
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
    await saveRegistrations(registrations);
    return sendJson(response, 200, { success: true });
  }

  if (request.method === "PUT") {
    let body;

    try {
      body = await parseRequestBody(request);
    } catch (error) {
      if (error.message === "PAYLOAD_TOO_LARGE") {
        return sendError(response, 413, "ข้อมูลมีขนาดใหญ่เกินไป");
      }

      return sendError(response, 400, "รูปแบบข้อมูลไม่ถูกต้อง");
    }

    const classes = await loadClasses();

    try {
      const registration = validateRegistration(
        body,
        classes,
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
      return sendJson(response, 200, { registration: updatedRegistration });
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
      response.writeHead(404, {
        "Content-Type": CONTENT_TYPES[".txt"],
      });
      response.end("Not found");
      return;
    }

    response.writeHead(500, {
      "Content-Type": CONTENT_TYPES[".txt"],
    });
    response.end("Internal server error");
  }
}

async function handleRequest(request, response) {
  const host = request.headers.host || `${HOST}:${PORT}`;
  const url = new URL(request.url || "/", `http://${host}`);

  if (url.pathname.startsWith("/api/")) {
    const handled = await handleApi(request, response, url);
    if (handled === false) {
      sendError(response, 404, "ไม่พบ API ที่ร้องขอ");
    }
    return;
  }

  if (request.method !== "GET") {
    response.writeHead(405, {
      "Content-Type": CONTENT_TYPES[".txt"],
    });
    response.end("Method not allowed");
    return;
  }

  const requestedPath =
    url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403, {
      "Content-Type": CONTENT_TYPES[".txt"],
    });
    response.end("Forbidden");
    return;
  }

  await sendStaticFile(response, filePath);
}

async function start() {
  await ensureDataFiles();

  const server = http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      console.error(error);
      sendError(response, 500, "เกิดข้อผิดพลาดภายในระบบ");
    });
  });

  server.listen(PORT, () => {
    console.log(
      `งานแข่งรถไฮสปีด บิดหมดปลอก ณ สนามแข่งรถบ้านฉางเรสซิ่ง จ.ระยอง app started at http://${HOST}:${PORT}`
    );
  });
}

start().catch((error) => {
  console.error("Unable to start server", error);
  process.exitCode = 1;
});



