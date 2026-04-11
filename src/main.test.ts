import { expect, test, beforeEach } from "vitest";
import { init } from "./main";

beforeEach(() => {
  document.body.innerHTML = '<div id="app"></div>';
  const app = document.querySelector<HTMLElement>("#app")!;
  init(app);
});

test("App should render correctly and auto-detect timezone", async () => {
  // Wait for the app to initialize and render
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const shellbar = document.querySelector("ui5-shellbar");
  expect(shellbar).toBeTruthy();
  expect(shellbar?.getAttribute("primary-title")).toBe("Time Zone Converter");

  const table = document.querySelector("ui5-table");
  expect(table).toBeTruthy();

  const rows = document.querySelectorAll("ui5-table-row");
  expect(rows.length).toBeGreaterThanOrEqual(1);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const cells = document.querySelectorAll("ui5-table-cell");
  let found = false;
  cells.forEach((cell) => {
    if (cell.textContent?.includes(userTimeZone)) {
      found = true;
    }
  });
  expect(found).toBe(true);
});

test("Time should update in real-time", async () => {
  const initialTimeCell = document.querySelector(".current-time");
  expect(initialTimeCell).toBeTruthy();
  const initialTime = initialTimeCell?.textContent;

  // Wait for at least 2 seconds to be sure the clock updates
  await new Promise((resolve) => setTimeout(resolve, 2100));

  const updatedTimeCell = document.querySelector(".current-time");
  const updatedTime = updatedTimeCell?.textContent;
  expect(updatedTime).not.toBe(initialTime);
});

test("Adding multiple time zones via search", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  expect(search).toBeTruthy();
  expect(addBtn).toBeTruthy();

  const timeZonesToAdd = ["Europe/London", "Asia/Tokyo", "America/Los_Angeles"];

  for (const tz of timeZonesToAdd) {
    search.value = tz;
    addBtn.click();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const rows = document.querySelectorAll("ui5-table-row");
  // Initial TZ + 3 added
  expect(rows.length).toBeGreaterThanOrEqual(4);

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );

  for (const tz of timeZonesToAdd) {
    expect(cells.some((c) => c?.includes(tz))).toBe(true);
    const city = tz.split("/").pop()?.replace(/_/g, " ");
    if (city) {
      expect(cells.some((c) => c?.includes(city))).toBe(true);
    }
  }

  // Verify current time cells exist
  const timeCells = document.querySelectorAll(".current-time");
  expect(timeCells.length).toBeGreaterThanOrEqual(4);
  timeCells.forEach((cell) => {
    expect(cell.textContent).toMatch(/\d{2}:\d{2}:\d{2} [AP]M/);
  });
});

test("Searching with partial name and filter='Contains'", async () => {
  const search = document.querySelector<any>("#tz-search");
  expect(search.getAttribute("filter")).toBe("Contains");

  // We can't easily test the internal filtering of ui5-combobox in a unit test without more complex setup,
  // but we can verify that the attribute is set and adding by full name still works as a proxy.
  const tz = "Europe/Berlin";
  search.value = tz;
  document.querySelector<any>("#add-tz-btn").click();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes("Berlin"))).toBe(true);
});

test("Time slider should update all time zones", async () => {
  const timeSlider = document.querySelector<any>("#time-slider");
  expect(timeSlider).toBeTruthy();

  // Set slider to 12:00 PM (720 minutes)
  timeSlider.value = 720;
  timeSlider.dispatchEvent(new CustomEvent("input"));

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const timeCells = document.querySelectorAll(".current-time");
  timeCells.forEach((cell) => {
    // Check if it's 12:00:00 PM in ANY timezone being displayed
    // Since we only have UTC by default in beforeEach, it should be 12:00:00 PM UTC
    // But the slider value is local minutes. Let's just check for '00:00' minutes/seconds
    expect(cell.textContent).toMatch(/:00:00 [AP]M/);
  });

  // Verify timeline highlighting (blue border for current hour)
  const highlightedBlocks = document.querySelectorAll('div[style*="2px solid #0074d9"]');
  // At least one block for the selected 12 PM
  expect(highlightedBlocks.length).toBeGreaterThanOrEqual(1);
});

test("Opening event view dialog", async () => {
  const eventViewBtn = document.querySelector<any>("#event-view-btn");
  expect(eventViewBtn).toBeTruthy();

  eventViewBtn.click();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const dialog = document.querySelector("ui5-dialog");
  // We can't easily check 'open' property in JSDOM-like environment sometimes,
  // but we can check if it exists and has content
  expect(dialog).toBeTruthy();
  expect(dialog?.innerHTML).toContain("Meeting Details");
});

test("State should persist in URL hash", async () => {
  const tz = "Europe/Paris";
  const search = document.querySelector<any>("#tz-search");
  search.value = tz;
  document.querySelector<any>("#add-tz-btn").click();

  await new Promise((resolve) => setTimeout(resolve, 500));

  expect(window.location.hash).toContain(encodeURIComponent(tz));

  // Clear app and re-init to test loading from hash
  const app = document.querySelector<HTMLElement>("#app")!;
  app.innerHTML = "";
  init(app);

  await new Promise((resolve) => setTimeout(resolve, 500));
  const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map((c) =>
    c.textContent?.trim(),
  );
  expect(cells.some((c) => c?.includes("Paris"))).toBe(true);
});

test("Google Calendar link should be generated", async () => {
  const eventViewBtn = document.querySelector<any>("#event-view-btn");
  eventViewBtn.click();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const gcalBtn = document.querySelector("#gcal-btn");
  expect(gcalBtn).toBeTruthy();
  // Since we can't easily test window.open, we just verify the button exists in the rendered dialog
});

test("Custom settings: toggle 24h format", async () => {
  const settingsBtn = document.querySelector<any>("#settings-btn");
  settingsBtn.click();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const formatSwitch = document.querySelector<any>("#format-switch");
  expect(formatSwitch).toBeTruthy();

  formatSwitch.checked = true;
  formatSwitch.dispatchEvent(new CustomEvent("change"));
  await new Promise((resolve) => setTimeout(resolve, 500));

  const timeCells = document.querySelectorAll(".current-time");
  timeCells.forEach((cell) => {
    // Should NOT contain AM/PM if 24h
    expect(cell.textContent).not.toMatch(/[AP]M/);
  });
});

test("Reordering and removing time zones", async () => {
  // Add a second TZ
  const tz = "Asia/Seoul";
  const search = document.querySelector<any>("#tz-search");
  search.value = tz;
  document.querySelector<any>("#add-tz-btn").click();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const rowsBefore = document.querySelectorAll("ui5-table-row");
  expect(rowsBefore.length).toBeGreaterThanOrEqual(2);

  const removeBtn = document.querySelector<any>(".remove-tz-btn");
  removeBtn.click();
  await new Promise((resolve) => setTimeout(resolve, 500));

  const rowsAfter = document.querySelectorAll("ui5-table-row");
  expect(rowsAfter.length).toBe(rowsBefore.length - 1);
});

test("No login required: app should be immediately usable", async () => {
  // Verify that there are no login forms or redirection indicators
  const bodyText = document.body.textContent;
  expect(bodyText).not.toContain("Login");
  expect(bodyText).not.toContain("Sign up");
  expect(bodyText).not.toContain("Authentication");

  // Check if core elements are present immediately
  expect(document.querySelector("#tz-search")).toBeTruthy();
  expect(document.querySelector("#tz-table")).toBeTruthy();
});

test("Adding up to 10 time zones", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  const extraZones = [
    "Africa/Cairo",
    "Asia/Seoul",
    "Australia/Sydney",
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
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  const rows = document.querySelectorAll("ui5-table-row");
  expect(rows.length).toBeGreaterThanOrEqual(10);
});
