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
  cells.forEach(cell => {
    if (cell.textContent === userTimeZone) {
        found = true;
    }
  });
  expect(found).toBe(true);
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

    const cells = Array.from(document.querySelectorAll("ui5-table-cell")).map(c => c.textContent);

    for (const tz of timeZonesToAdd) {
        expect(cells).toContain(tz);
        const city = tz.split("/").pop()?.replace(/_/g, " ");
        expect(cells).toContain(city);
    }

    // Verify current time cells exist
    const timeCells = document.querySelectorAll(".current-time");
    expect(timeCells.length).toBeGreaterThanOrEqual(4);
    timeCells.forEach(cell => {
        expect(cell.textContent).toMatch(/\d{2}:\d{2}:\d{2} [AP]M/);
    });
});
