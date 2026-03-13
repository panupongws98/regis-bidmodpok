const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const FIXTURE_ITEMS = ["server.js", "public", "data"];

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = address && typeof address === "object" ? address.port : null;

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}

async function createFixture() {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), "bidmodpok-test-"));

  await Promise.all(FIXTURE_ITEMS.map((item) => {
    return fs.cp(
      path.join(PROJECT_ROOT, item),
      path.join(fixtureRoot, item),
      { recursive: true },
    );
  }));

  return fixtureRoot;
}

async function waitForServerReady(baseUrl, child, timeoutMs = 10000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (child.exitCode !== null) {
      throw new Error(`Server exited before becoming ready (code ${child.exitCode})`);
    }

    try {
      const response = await fetch(`${baseUrl}/api/meta`);
      if (response.ok) {
        return;
      }
    } catch {
      // Wait for the next poll.
    }

    await sleep(150);
  }

  throw new Error("Server did not become ready in time");
}

async function startServer(fixtureRoot) {
  const port = await getAvailablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server.js"], {
    cwd: fixtureRoot,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(port),
    },
    stdio: "ignore",
    windowsHide: true,
  });

  await waitForServerReady(baseUrl, child);
  return { baseUrl, child };
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      windowsHide: true,
    });
    await once(killer, "exit");
    if (child.exitCode === null) {
      await once(child, "exit");
    }
    return;
  }

  child.kill("SIGTERM");

  try {
    await Promise.race([once(child, "exit"), sleep(2000)]);
  } catch {
    // Fall through and force the process down below.
  }

  if (child.exitCode !== null) {
    return;
  }

  child.kill("SIGKILL");

  try {
    await once(child, "exit");
  } catch {
    // Ignore shutdown errors during cleanup.
  }
}

async function requestJson(baseUrl, pathname, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!("Content-Type" in headers) && options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers,
  });
  const text = await response.text();

  try {
    return { response, body: JSON.parse(text) };
  } catch {
    return { response, body: text };
  }
}

async function run() {
  const fixtureRoot = await createFixture();
  let child = null;

  try {
    const server = await startServer(fixtureRoot);
    child = server.child;
    const { baseUrl } = server;

    for (const pathname of ["/", "/index.html", "/classes.html", "/applicants.html", "/summary.html"]) {
      const response = await fetch(`${baseUrl}${pathname}`);
      const html = await response.text();

      assert.equal(response.status, 200, `${pathname} should respond with HTTP 200`);
      assert.match(html, /<!DOCTYPE html>/i, `${pathname} should return HTML`);
    }

    const metaResult = await requestJson(baseUrl, "/api/meta");
    assert.equal(metaResult.response.status, 200);
    assert.ok(Array.isArray(metaResult.body.classes));
    assert.equal(metaResult.body.maxVehicles, 20);

    const registrationsResult = await requestJson(baseUrl, "/api/registrations");
    assert.equal(registrationsResult.response.status, 200);
    assert.ok(Array.isArray(registrationsResult.body.registrations));

    const createdClassName = `Smoke Class ${Date.now()}`;
    const renamedClassName = `${createdClassName} Updated`;

    let result = await requestJson(baseUrl, "/api/meta/classes", {
      method: "POST",
      body: JSON.stringify({ className: createdClassName }),
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.className, createdClassName);

    result = await requestJson(baseUrl, "/api/meta/classes/rename", {
      method: "PUT",
      body: JSON.stringify({
        currentName: createdClassName,
        nextName: renamedClassName,
      }),
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.renamedTo, renamedClassName);

    result = await requestJson(baseUrl, `/api/meta/classes/${encodeURIComponent(renamedClassName)}`, {
      method: "DELETE",
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.deletedClass, renamedClassName);

    const bikeNumber = `TEST-${Date.now()}`;
    const updatedBikeNumber = `${bikeNumber}-UPD`;
    const createPayload = {
      applicantName: "Smoke Test Team",
      address: "Temporary Test Address",
      contactPhone: "0800000000",
      entries: [
        {
          raceClass: metaResult.body.classes[0],
          vehicleCount: 1,
          bikeNumbers: [bikeNumber],
        },
      ],
    };

    result = await requestJson(baseUrl, "/api/registrations", {
      method: "POST",
      body: JSON.stringify(createPayload),
    });
    assert.equal(result.response.status, 201);
    assert.equal(result.body.registration.entries[0].bikeNumbers[0], bikeNumber);
    const registrationId = result.body.registration.id;

    result = await requestJson(baseUrl, `/api/registrations/${registrationId}`, {
      method: "PUT",
      body: JSON.stringify({
        ...createPayload,
        entries: [
          {
            ...createPayload.entries[0],
            bikeNumbers: [updatedBikeNumber],
          },
        ],
      }),
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.registration.entries[0].bikeNumbers[0], updatedBikeNumber);

    result = await requestJson(baseUrl, "/api/registrations", {
      method: "POST",
      body: JSON.stringify({
        ...createPayload,
        applicantName: "Duplicate Bike Number Team",
        entries: [
          {
            ...createPayload.entries[0],
            bikeNumbers: [updatedBikeNumber],
          },
        ],
      }),
    });
    assert.equal(result.response.status, 400);
    assert.match(result.body.error, /หมายเลขรถซ้ำกับข้อมูลเดิม/);

    result = await requestJson(baseUrl, "/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{",
    });
    assert.equal(result.response.status, 400);
    assert.match(result.body.error, /รูปแบบข้อมูลไม่ถูกต้อง/);

    result = await requestJson(baseUrl, `/api/registrations/${registrationId}`, {
      method: "DELETE",
    });
    assert.equal(result.response.status, 200);
    assert.equal(result.body.success, true);
  } finally {
    await stopServer(child);
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
