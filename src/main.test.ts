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
    if (cell.textContent === userTimeZone) {
      found = true;
    }
  });
  expect(found).toBe(true);
});

test("Adding a timezone via search", async () => {
  const search = document.querySelector<any>("#tz-search");
  const addBtn = document.querySelector<any>("#add-tz-btn");

  expect(search).toBeTruthy();
  expect(addBtn).toBeTruthy();

  search.value = "Europe/London";
  addBtn.click();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const rows = document.querySelectorAll("ui5-table-row");
  // Should have initial TZ + London
  expect(rows.length).toBeGreaterThanOrEqual(2);

  const cells = document.querySelectorAll("ui5-table-cell");
  let found = false;
  cells.forEach((cell) => {
    if (cell.textContent === "Europe/London") {
      found = true;
    }
  });
  expect(found).toBe(true);
});
