import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/Page.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/ComboBox.js";
import "@ui5/webcomponents/dist/ComboBoxItem.js";
import { Temporal } from "temporal-polyfill";

interface TimeZoneData {
  id: string;
  name: string;
}

const allTimeZones: string[] = Intl.supportedValuesOf("timeZone");
let selectedTimeZones: TimeZoneData[] = [];

export function init(container: HTMLElement) {
  const userTimeZone = Temporal.Now.timeZoneId();
  selectedTimeZones = [{ id: userTimeZone, name: userTimeZone }];
  render(container);
}

function addTimeZone(container: HTMLElement, id: string) {
  if (!selectedTimeZones.find((tz) => tz.id === id)) {
    selectedTimeZones.push({ id, name: id });
    render(container);
  }
}

function render(container: HTMLElement) {
  container.innerHTML = `
    <ui5-page style="height: 100vh;" floating-footer>
      <ui5-shellbar slot="header" primary-title="Time Zone Converter"></ui5-shellbar>
      <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <ui5-combobox id="tz-search" placeholder="Search for a city or time zone..." style="flex: 1;">
                ${timeZoneItemsHtml}
            </ui5-combobox>
            <ui5-button id="add-tz-btn" design="Emphasized">Add</ui5-button>
        </div>

        <ui5-table id="tz-table" no-data-text="No time zones added">
            <ui5-table-header-row slot="headerRow">
                <ui5-table-header-cell>Location</ui5-table-header-cell>
                <ui5-table-header-cell>Time Zone</ui5-table-header-cell>
                <ui5-table-header-cell>Current Time</ui5-table-header-cell>
            </ui5-table-header-row>
            ${selectedTimeZones
              .map(
                (tz) => `
                <ui5-table-row>
                    <ui5-table-cell>${tz.name.split("/").pop()?.replace(/_/g, " ")}</ui5-table-cell>
                    <ui5-table-cell>${tz.id}</ui5-table-cell>
                    <ui5-table-cell class="current-time" data-tz="${tz.id}">${formatTime(tz.id)}</ui5-table-cell>
                </ui5-table-row>
            `,
              )
              .join("")}
        </ui5-table>
      </div>
    </ui5-page>
  `;

  setupEventListeners(container);
}

function formatTime(timeZone: string): string {
  return Temporal.Now.zonedDateTimeISO(timeZone).toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function setupEventListeners(container: HTMLElement) {
  const addBtn = container.querySelector("#add-tz-btn");
  const searchInput = container.querySelector<any>("#tz-search");

  addBtn?.addEventListener("click", () => {
    const value = searchInput?.value;
    if (value && allTimeZones.includes(value)) {
      addTimeZone(container, value);
      searchInput.value = "";
    }
  });

  searchInput?.addEventListener("selection-change", (event: any) => {
    const item = event.detail.item;
    if (item) {
        addTimeZone(container, item.text);
        searchInput.value = "";
    }
  });
}

function updateClocks() {
    const timeCells = document.querySelectorAll(".current-time");
    timeCells.forEach(cell => {
        const tz = cell.getAttribute("data-tz");
        if (tz) {
            cell.textContent = formatTime(tz);
        }
    });
}

const appElement = document.querySelector<HTMLDivElement>("#app");
if (appElement) {
  init(appElement);
}

setInterval(updateClocks, 1000);
