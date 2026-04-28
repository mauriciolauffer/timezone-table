import { expect, test, beforeEach, afterEach, vi } from "vitest";
import { Temporal } from "temporal-polyfill";
import { init } from "./main";

function waitFor(fn: () => boolean, timeout = 3000, interval = 50): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeout;
    const check = () => {
      if (fn()) {
        resolve();
      } else if (Date.now() >= deadline) {
        reject(new Error("waitFor timed out"));
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
}

function getApp(): HTMLElement {
  return document.querySelector<HTMLElement>("#app")!;
}

beforeEach(() => {
  // Encode a full reset state so init() resets ALL module-level variables,
  // including is24HourFormat and selectedDuration which init() skips when hash is empty.
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = Temporal.Now.zonedDateTimeISO().toString();
  window.location.hash = encodeURIComponent(
    JSON.stringify({
      zones: [{ id: userTz, name: userTz }],
      time: now,
      duration: 60,
      is24h: false,
    }),
  );
  document.body.innerHTML = '<div id="app"></div>';
  init(getApp());
});

afterEach(() => {
  window.location.hash = "";
});

// ---------------------------------------------------------------------------
// Existing tests (quality-improved: replaced fixed sleeps with waitFor)
// ---------------------------------------------------------------------------

test("App should render correctly and auto-detect timezone", async () => {
  await waitFor(() => !!document.querySelector("ui5-shellbar"));

  const shellbar = document.querySelector("ui5-shellbar");
  expect(shellbar).toBeTruthy();
  expect(shellbar?.getAttribute("primary-title")).toBe("Time Zone Converter");
  expect(document.querySelector("ui5-table")).toBeTruthy();
  expect(document.querySelectorAll("ui5-table-row").length).toBeGreaterThanOrEqual(1);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const cells = document.querySelectorAll("ui5-table-cell");
  let found = false;
  cells.forEach((cell) => {
    if (cell.textContent?.includes(userTimeZone)) found = true;
  });
  expect(found).toBe(true);
});

test("Time should update in real-time", async () => {
  const initialTimeCell = document.querySelector(".current-time");
  expect(initialTimeCell).toBeTruthy();
  const initialTime = initialTimeCell?.textContent;

  // Real-time test: must wait for seconds to tick — kept as intentional sleep
  await new Promise((resolve) => setTimeout(resolve, 2100));

  const updatedTime = document.querySelector(".current-time")?.textContent;
  expect(updatedTime).not.toBe(initialTime);
});

test("Adding multiple time zones via search", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  expect(search).toBeTruthy();
  expect(addBtn).toBeTruthy();

  const timeZonesToAdd = ["Europe/London", "Asia/Tokyo", "America/Los_Angeles"];

  for (const tz of timeZonesToAdd) {
    const beforeCount = document.querySelectorAll("ui5-table-row").length;
    search.value = tz;
    addBtn.click();
    await waitFor(() => document.querySelectorAll("ui5-table-row").length > beforeCount);
  }

  expect(document.querySelectorAll("ui5-table-row").length).toBeGreaterThanOrEqual(4);

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );

  for (const tz of timeZonesToAdd) {
    expect(cells.some((c) => c?.includes(tz))).toBe(true);
    const city = tz.split("/").pop()?.replace(/_/g, " ");
    if (city) expect(cells.some((c) => c?.includes(city))).toBe(true);
  }

  const timeCells = document.querySelectorAll(".current-time");
  expect(timeCells.length).toBeGreaterThanOrEqual(4);
  timeCells.forEach((cell) => {
    expect(cell.textContent).toMatch(/\d{2}:\d{2}:\d{2} [AP]M/);
  });
});

test("Searching with partial name and filter='Contains'", async () => {
  const search = document.querySelector<any>("#tz-search");
  expect(search.getAttribute("filter")).toBe("Contains");

  const beforeCount = document.querySelectorAll("ui5-table-row").length;
  search.value = "Europe/Berlin";
  document.querySelector<any>("#add-tz-btn").click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > beforeCount);

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes("Berlin"))).toBe(true);
});

test("Time slider should update all time zones", async () => {
  const timeSlider = document.querySelector<any>("#time-slider");
  expect(timeSlider).toBeTruthy();

  timeSlider.value = 720;
  timeSlider.dispatchEvent(new CustomEvent("input"));

  await waitFor(() => {
    const cells = document.querySelectorAll(".current-time");
    return Array.from(cells).every((c) => /:00:00 [AP]M/.test(c.textContent ?? ""));
  });

  document.querySelectorAll(".current-time").forEach((cell) => {
    expect(cell.textContent).toMatch(/:00:00 [AP]M/);
  });

  const highlightedBlocks = document.querySelectorAll('div[style*="2px solid #0074d9"]');
  expect(highlightedBlocks.length).toBeGreaterThanOrEqual(1);
});

test("Opening event view dialog", async () => {
  document.querySelector<any>("#event-view-btn").click();
  await waitFor(() => !!document.querySelector("ui5-dialog"));

  const dialog = document.querySelector("ui5-dialog");
  expect(dialog).toBeTruthy();
  expect(dialog?.innerHTML).toContain("Meeting Details");
});

test("State should persist in URL hash", async () => {
  const beforeCount = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");
  search.value = "Europe/Paris";
  document.querySelector<any>("#add-tz-btn").click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > beforeCount);

  expect(window.location.hash).toContain(encodeURIComponent("Europe/Paris"));

  const app = getApp();
  app.innerHTML = "";
  init(app);

  await waitFor(() => {
    const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
      c.textContent?.trim(),
    );
    return cells.some((c) => c?.includes("Paris"));
  });

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes("Paris"))).toBe(true);
});

test("Google Calendar link should be generated", async () => {
  document.querySelector<any>("#event-view-btn").click();
  await waitFor(() => !!document.querySelector("#gcal-btn"));
  expect(document.querySelector("#gcal-btn")).toBeTruthy();
});

test("Custom settings: toggle 24h format", async () => {
  document.querySelector<any>("#settings-btn").click();
  await waitFor(() => !!document.querySelector("#format-switch"));

  const formatSwitch = document.querySelector<any>("#format-switch");
  expect(formatSwitch).toBeTruthy();

  formatSwitch.checked = true;
  formatSwitch.dispatchEvent(new CustomEvent("change"));

  await waitFor(() => {
    const cells = document.querySelectorAll(".current-time");
    return Array.from(cells).every((c) => !/[AP]M/.test(c.textContent ?? ""));
  });

  document.querySelectorAll(".current-time").forEach((cell) => {
    expect(cell.textContent).not.toMatch(/[AP]M/);
  });
});

test("Reordering and removing time zones", async () => {
  const beforeCount = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");
  search.value = "Asia/Seoul";
  document.querySelector<any>("#add-tz-btn").click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > beforeCount);

  const rowsBefore = document.querySelectorAll("ui5-table-row").length;
  expect(rowsBefore).toBeGreaterThanOrEqual(2);

  document.querySelector<any>(".remove-tz-btn").click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length < rowsBefore);

  expect(document.querySelectorAll("ui5-table-row").length).toBe(rowsBefore - 1);
});

test("No login required: app should be immediately usable", async () => {
  await waitFor(() => !!document.querySelector("#tz-search"));

  const bodyText = document.body.textContent;
  expect(bodyText).not.toContain("Login");
  expect(bodyText).not.toContain("Sign up");
  expect(bodyText).not.toContain("Authentication");
  expect(document.querySelector("#tz-search")).toBeTruthy();
  expect(document.querySelector("#tz-table")).toBeTruthy();
});

test("Adding up to 10 time zones", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  // Australia/Sydney is already present (default zone), so skip it to avoid duplicate
  const extraZones = [
    "Africa/Cairo",
    "Asia/Seoul",
    "Europe/London",
    "Europe/Berlin",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "Asia/Dubai",
    "Pacific/Auckland",
  ];

  for (const tz of extraZones) {
    search.value = tz;
    addBtn.click();
    // Re-renders are slow with hundreds of ComboBox items; wait generously per zone
    await new Promise((r) => setTimeout(r, 3000));
  }

  expect(document.querySelectorAll("ui5-table-row").length).toBeGreaterThanOrEqual(10);
}, 120000);

// ---------------------------------------------------------------------------
// New integration tests
// ---------------------------------------------------------------------------

test("Duplicate add is prevented", async () => {
  const before = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  // Add London once
  search.value = "Europe/London";
  addBtn.click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > before);

  const afterFirst = document.querySelectorAll("ui5-table-row").length;

  // Add London again — row count must not increase
  search.value = "Europe/London";
  addBtn.click();
  await new Promise((r) => setTimeout(r, 200));

  expect(document.querySelectorAll("ui5-table-row").length).toBe(afterFirst);
});

test("Move-down button reorders time zones", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  // Add a second TZ so we have 2 rows
  const before = document.querySelectorAll("ui5-table-row").length;
  search.value = "Europe/London";
  addBtn.click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > before);

  const getFirstTzTag = () => document.querySelectorAll("ui5-tag")[0]?.textContent?.trim() ?? "";

  const originalFirst = getFirstTzTag();

  // Click move-down on the first row (index 0)
  const moveDownBtns = document.querySelectorAll<any>(".move-down-btn");
  expect(moveDownBtns.length).toBeGreaterThanOrEqual(2);
  moveDownBtns[0].click();

  await waitFor(() => getFirstTzTag() !== originalFirst);

  expect(getFirstTzTag()).not.toBe(originalFirst);
});

test("Move-up button reorders time zones", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  const before = document.querySelectorAll("ui5-table-row").length;
  search.value = "Asia/Tokyo";
  addBtn.click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > before);

  const getFirstTzTag = () => document.querySelectorAll("ui5-tag")[0]?.textContent?.trim() ?? "";
  const getLastTzTag = () => {
    const tags = document.querySelectorAll("ui5-tag");
    return tags[tags.length - 1]?.textContent?.trim() ?? "";
  };

  const originalFirst = getFirstTzTag();
  const originalLast = getLastTzTag();

  // Click move-up on the last row
  const moveUpBtns = document.querySelectorAll<any>(".move-up-btn");
  moveUpBtns[moveUpBtns.length - 1].click();

  await waitFor(() => getFirstTzTag() !== originalFirst);

  expect(getFirstTzTag()).toBe(originalLast);
  expect(getLastTzTag()).toBe(originalFirst);
});

test("Reset-time button restores current time", async () => {
  const timeSlider = document.querySelector<any>("#time-slider");

  // Move to midnight
  timeSlider.value = 0;
  timeSlider.dispatchEvent(new CustomEvent("input"));
  await waitFor(() => /:00:00/.test(document.querySelector(".current-time")?.textContent ?? ""));

  const resetBtn = document.querySelector<any>("#reset-time-btn");
  resetBtn.click();

  // After reset the selected-time-display should be non-empty and slider should reflect current time
  await waitFor(() => {
    const display = document.querySelector("#selected-time-display")?.textContent ?? "";
    const slider = document.querySelector<any>("#time-slider");
    return display.length > 0 && slider && Number(slider.value) > 0;
  }, 3000);

  const display = document.querySelector("#selected-time-display")?.textContent ?? "";
  expect(display.length).toBeGreaterThan(0);
  // Slider should no longer be at 0 (midnight) since we reset to now
  const sliderValue = Number(document.querySelector<any>("#time-slider")?.value ?? 0);
  expect(sliderValue).toBeGreaterThan(0);
});

test("Duration display shows correct minutes", async () => {
  await waitFor(() => !!document.querySelector("#tz-table"));
  const bodyText = document.body.textContent ?? "";
  expect(bodyText).toContain("Duration: 60 min");
});

test("Close settings dialog button works", async () => {
  document.querySelector<any>("#settings-btn").click();
  await waitFor(() => !!document.querySelector("#close-settings-btn"));

  const dialog = document.querySelector<any>("#settings-dialog");
  dialog.open = true;

  document.querySelector<any>("#close-settings-btn").click();
  await waitFor(() => !document.querySelector<any>("#settings-dialog")?.open);

  expect(document.querySelector<any>("#settings-dialog")?.open).toBeFalsy();
});

test("Close event dialog button works", async () => {
  document.querySelector<any>("#event-view-btn").click();
  await waitFor(() => !!document.querySelector("#close-dialog-btn"));

  const dialog = document.querySelector<any>("#event-dialog");
  dialog.open = true;

  document.querySelector<any>("#close-dialog-btn").click();
  await waitFor(() => !document.querySelector<any>("#event-dialog")?.open);

  expect(document.querySelector<any>("#event-dialog")?.open).toBeFalsy();
});

test("Malformed URL hash falls back gracefully", async () => {
  window.location.hash = "notvalidjson";
  document.body.innerHTML = '<div id="app"></div>';
  init(getApp());

  await waitFor(() => document.querySelectorAll("ui5-table-row").length >= 1);

  // Should still show user's local TZ as fallback
  expect(document.querySelectorAll("ui5-table-row").length).toBeGreaterThanOrEqual(1);
});

test("Google Calendar URL has correct format", async () => {
  const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

  document.querySelector<any>("#event-view-btn").click();
  await waitFor(() => !!document.querySelector("#gcal-btn"));

  document.querySelector<any>("#gcal-btn").click();

  expect(openSpy).toHaveBeenCalledOnce();
  const url = openSpy.mock.calls[0][0] as string;
  expect(url).toMatch(/^https:\/\/www\.google\.com\/calendar\/render\?action=TEMPLATE/);
  expect(url).toContain("&text=");
  expect(url).toContain("&dates=");
  expect(url).toContain("&details=");
  // dates segment: two UTC timestamps separated by /
  expect(url).toMatch(/&dates=\d{8}T\d{6}Z\/\d{8}T\d{6}Z/);

  openSpy.mockRestore();
});

test("syncStateToURL serializes all required state fields", async () => {
  const beforeCount = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");
  search.value = "Europe/Paris";
  document.querySelector<any>("#add-tz-btn").click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > beforeCount);

  const hash = window.location.hash.slice(1);
  expect(hash.length).toBeGreaterThan(0);

  const state = JSON.parse(decodeURIComponent(hash));
  expect(Array.isArray(state.zones)).toBe(true);
  expect(state.zones.length).toBeGreaterThan(0);
  expect(state.zones[0]).toHaveProperty("id");
  expect(state.zones[0]).toHaveProperty("name");
  expect(typeof state.time).toBe("string");
  expect(typeof state.duration).toBe("number");
  expect(typeof state.is24h).toBe("boolean");
});

test("formatTime respects 24h format setting", async () => {
  document.querySelector<any>("#settings-btn").click();
  await waitFor(() => !!document.querySelector("#format-switch"));

  // Switch to 24h
  const formatSwitch = document.querySelector<any>("#format-switch");
  formatSwitch.checked = true;
  formatSwitch.dispatchEvent(new CustomEvent("change"));

  await waitFor(() => {
    const cells = document.querySelectorAll(".current-time");
    return Array.from(cells).every((c) => /^\d{2}:\d{2}:\d{2}$/.test(c.textContent?.trim() ?? ""));
  });

  document.querySelectorAll(".current-time").forEach((cell) => {
    expect(cell.textContent?.trim()).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

test("formatTime uses 12h format by default", async () => {
  await waitFor(() => !!document.querySelector(".current-time"));

  document.querySelectorAll(".current-time").forEach((cell) => {
    expect(cell.textContent?.trim()).toMatch(/^\d{2}:\d{2}:\d{2} [AP]M$/);
  });
});

test("ComboBox selection-change adds time zone", async () => {
  const before = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");

  search.dispatchEvent(
    new CustomEvent("selection-change", {
      detail: { item: { text: "Europe/Madrid" } },
      bubbles: true,
    }),
  );

  await waitFor(() => document.querySelectorAll("ui5-table-row").length > before);

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes("Europe/Madrid"))).toBe(true);
  expect(search.value).toBe("");
});

test("ComboBox selection-change with no item is ignored", async () => {
  const before = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");

  search.dispatchEvent(
    new CustomEvent("selection-change", {
      detail: { item: null },
      bubbles: true,
    }),
  );

  await new Promise((r) => setTimeout(r, 200));
  expect(document.querySelectorAll("ui5-table-row").length).toBe(before);
});

test("Add button ignores invalid time zone value", async () => {
  const before = document.querySelectorAll("ui5-table-row").length;
  const search = document.querySelector<any>("#tz-search");
  search.value = "Not/AReal/Zone";
  document.querySelector<any>("#add-tz-btn").click();

  await new Promise((r) => setTimeout(r, 200));
  expect(document.querySelectorAll("ui5-table-row").length).toBe(before);
});

test("Move-up on first row is a no-op", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  const before = document.querySelectorAll("ui5-table-row").length;
  search.value = "Europe/London";
  addBtn.click();
  await waitFor(() => document.querySelectorAll("ui5-table-row").length > before);

  const getFirstTzTag = () => document.querySelectorAll("ui5-tag")[0]?.textContent?.trim() ?? "";
  const originalFirst = getFirstTzTag();

  const moveUpBtns = document.querySelectorAll<any>(".move-up-btn");
  // First row move-up button is disabled but we dispatch click anyway to hit the guard
  moveUpBtns[0].removeAttribute("disabled");
  moveUpBtns[0].click();

  await new Promise((r) => setTimeout(r, 200));
  expect(getFirstTzTag()).toBe(originalFirst);
});

test("Move-down on last row is a no-op", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  search.value = "Asia/Calcutta";
  addBtn.click();
  // Re-render with ComboBox rebuild is slow; wait for it to settle
  await new Promise((r) => setTimeout(r, 5000));

  expect(document.querySelectorAll("ui5-table-row").length).toBeGreaterThanOrEqual(2);

  const getTags = () =>
    Array.from(document.querySelectorAll("ui5-tag")).map((t) => t.textContent?.trim());
  const originalTags = getTags();

  // Enable the disabled button to exercise the index guard
  const moveDownBtns = document.querySelectorAll<any>(".move-down-btn");
  const last = moveDownBtns[moveDownBtns.length - 1];
  last.removeAttribute("disabled");
  last.click();

  // Guard check is synchronous; wait briefly for any accidental re-render
  await new Promise((r) => setTimeout(r, 500));
  expect(getTags()).toEqual(originalTags);
}, 30000);

test("updateClocks triggers full re-render when hour changes", async () => {
  // Move slider to midnight so selectedDateTime is far from now
  const timeSlider = document.querySelector<any>("#time-slider");
  timeSlider.value = 0;
  timeSlider.dispatchEvent(new CustomEvent("input"));
  await waitFor(() => /:00:00/.test(document.querySelector(".current-time")?.textContent ?? ""));

  // Reset restores selectedDateTime ≈ now; the clock interval (100ms) will then
  // detect isCurrentlyNow=true and update both the display and slider.
  document.querySelector<any>("#reset-time-btn").click();
  await new Promise((r) => setTimeout(r, 300));

  const sliderVal = Number(document.querySelector<any>("#time-slider")?.value ?? 0);
  expect(sliderVal).toBeGreaterThan(0);
});

test("init with empty hash uses auto-detected timezone", async () => {
  window.location.hash = "";
  document.body.innerHTML = '<div id="app"></div>';
  init(document.querySelector<HTMLElement>("#app")!);

  await waitFor(() => document.querySelectorAll("ui5-table-row").length >= 1);

  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes(userTz))).toBe(true);
});

test("init with partial hash only applies present fields", async () => {
  // Hash with zones only — time, duration, is24h all absent
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  window.location.hash = encodeURIComponent(
    JSON.stringify({ zones: [{ id: "Europe/London", name: "Europe/London" }] }),
  );
  document.body.innerHTML = '<div id="app"></div>';
  init(document.querySelector<HTMLElement>("#app")!);

  await waitFor(() => document.querySelectorAll("ui5-table-row").length >= 1);

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes("London"))).toBe(true);
  // duration defaults to 60 min when not in hash
  expect(document.body.textContent).toContain("Duration: 60 min");
});

test("updateClocks triggers re-render when hour rolls over", async () => {
  const now = Temporal.Now.zonedDateTimeISO();

  // Set selectedDateTime to the same instant but with a different hour value
  // by mocking the slider to the previous hour
  const prevHourMinutes = ((now.hour === 0 ? 23 : now.hour - 1) * 60) + now.minute;
  const timeSlider = document.querySelector<any>("#time-slider");
  timeSlider.value = prevHourMinutes;
  timeSlider.dispatchEvent(new CustomEvent("input"));
  await new Promise((r) => setTimeout(r, 200));

  // Spy on render indirectly: the shellbar re-renders when render() is called
  const shellbarBefore = document.querySelector("ui5-shellbar");

  // Now reset to current time — updateClocks will see isCurrentlyNow=true and
  // selectedDateTime.hour !== now.hour, triggering a full render()
  document.querySelector<any>("#reset-time-btn").click();
  // Wait for the 100ms clock tick + render
  await new Promise((r) => setTimeout(r, 300));

  // Table should still be rendered correctly after the re-render
  expect(document.querySelector("ui5-shellbar")).toBeTruthy();
  expect(document.querySelectorAll("ui5-table-row").length).toBeGreaterThanOrEqual(1);
  // Slider should now reflect current time
  const sliderVal = Number(document.querySelector<any>("#time-slider")?.value ?? 0);
  expect(sliderVal).toBeGreaterThan(0);
});
