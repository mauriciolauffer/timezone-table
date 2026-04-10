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
import "@ui5/webcomponents/dist/Slider.js";
import "@ui5/webcomponents/dist/Dialog.js";
import "@ui5/webcomponents/dist/Switch.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/calendar.js";
import "@ui5/webcomponents-icons/dist/settings.js";
import "@ui5/webcomponents-icons/dist/delete.js";
import "@ui5/webcomponents-icons/dist/navigation-up-arrow.js";
import "@ui5/webcomponents-icons/dist/navigation-down-arrow.js";
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";
import { Temporal } from "temporal-polyfill";

interface TimeZoneData {
  id: string;
  name: string;
}

const allTimeZones: string[] = Intl.supportedValuesOf("timeZone");
let selectedTimeZones: TimeZoneData[] = [];
let selectedDateTime = Temporal.Now.zonedDateTimeISO();
let selectedDuration = 60; // 1 hour default
let is24HourFormat = false;
let clockInterval: any;

export function init(container: HTMLElement) {
  const userTimeZone = Temporal.Now.timeZoneId();

  // Load state from URL if present
  const hash = window.location.hash.substring(1);
  if (hash) {
    try {
      const state = JSON.parse(decodeURIComponent(hash));
      if (state.zones) selectedTimeZones = state.zones;
      if (state.time) selectedDateTime = Temporal.ZonedDateTime.from(state.time);
      if (state.duration) selectedDuration = state.duration;
      if (state.is24h !== undefined) is24HourFormat = state.is24h;
    } catch (e) {
      console.error("Failed to parse state from URL", e);
      selectedTimeZones = [{ id: userTimeZone, name: userTimeZone }];
      selectedDateTime = Temporal.Now.zonedDateTimeISO();
    }
  } else {
    selectedTimeZones = [{ id: userTimeZone, name: userTimeZone }];
    selectedDateTime = Temporal.Now.zonedDateTimeISO();
  }

  render(container);

  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    updateClocks(container);
  }, 100);
}

function addTimeZone(container: HTMLElement, id: string) {
  if (!selectedTimeZones.find((tz) => tz.id === id)) {
    selectedTimeZones.push({ id, name: id });
    syncStateToURL();
    render(container);
  }
}

function syncStateToURL() {
  const state = {
    zones: selectedTimeZones,
    time: selectedDateTime.toString(),
    duration: selectedDuration,
    is24h: is24HourFormat,
  };
  window.location.hash = encodeURIComponent(JSON.stringify(state));
}

function render(container: HTMLElement) {
  const currentTotalMinutes = selectedDateTime.hour * 60 + selectedDateTime.minute;

  container.innerHTML = `
    <style>
        @media (max-width: 600px) {
            .hide-on-mobile {
                display: none !important;
            }
            ui5-table-header-cell, ui5-table-cell {
                min-width: 100px !important;
            }
        }
    </style>
    <ui5-page style="height: 100vh;" floating-footer>
      <ui5-shellbar slot="header" primary-title="Time Zone Converter">
        <ui5-button icon="settings" slot="profile" id="settings-btn" design="Transparent"></ui5-button>
      </ui5-shellbar>
      <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
            <ui5-combobox id="tz-search" placeholder="Search for a city or time zone..." style="flex: 1;" filter="Contains">
                ${allTimeZones.map((tz) => `<ui5-cb-item text="${tz}"></ui5-cb-item>`).join("")}
            </ui5-combobox>
            <ui5-button id="add-tz-btn" design="Emphasized">Add</ui5-button>
        </div>

        <div style="padding: 1rem; background: #f5f5f5; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <div style="display: flex; flex-direction: column;">
                    <span>Selected Range: <b id="selected-time-display">${selectedDateTime.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", hour12: !is24HourFormat })} - ${selectedDateTime.add({ minutes: selectedDuration }).toLocaleString("en-US", { timeStyle: "short", hour12: !is24HourFormat })}</b></span>
                    <span style="font-size: 0.8rem; color: #666;">Duration: ${selectedDuration} min</span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <ui5-button id="event-view-btn" icon="calendar" design="Emphasized">View Event</ui5-button>
                    <ui5-button id="reset-time-btn" icon="refresh" design="Transparent">Reset</ui5-button>
                </div>
            </div>
            <ui5-slider id="time-slider" min="0" max="1439" value="${currentTotalMinutes}" label-interval="60" show-tickmarks></ui5-slider>
            <div style="display: flex; gap: 1rem; font-size: 0.75rem; margin-top: 0.5rem; justify-content: center;">
                <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 12px; height: 12px; background: #2c3e50; border: 1px solid #ddd;"></div> Night</div>
                <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 12px; height: 12px; background: #f39c12; border: 1px solid #ddd;"></div> Morning/Evening</div>
                <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 12px; height: 12px; background: #2ecc71; border: 1px solid #ddd;"></div> Work Hours</div>
                <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="width: 12px; height: 12px; border: 2px solid #0074d9;"></div> Selected</div>
            </div>
        </div>

        <ui5-table id="tz-table" no-data-text="No time zones added" sticky-header>
            <ui5-table-header-row slot="headerRow">
                <ui5-table-header-cell min-width="150px">Location</ui5-table-header-cell>
                <ui5-table-header-cell min-width="120px">Local Time</ui5-table-header-cell>
                <ui5-table-header-cell class="hide-on-mobile">Timeline (24h)</ui5-table-header-cell>
                <ui5-table-header-cell width="120px">Actions</ui5-table-header-cell>
            </ui5-table-header-row>
            ${selectedTimeZones
              .map((tz, index) => {
                const tzDateTime = selectedDateTime.withTimeZone(tz.id);
                return `
                <ui5-table-row>
                    <ui5-table-cell>
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-weight: bold;">${tz.name.split("/").pop()?.replace(/_/g, " ")}</span>
                            <span style="font-size: 0.8rem; color: #666;">${tz.id}</span>
                        </div>
                    </ui5-table-cell>
                    <ui5-table-cell class="current-time" data-tz="${tz.id}">${formatTime(tzDateTime)}</ui5-table-cell>
                    <ui5-table-cell class="hide-on-mobile">
                        <div style="display: flex; gap: 2px; height: 30px; align-items: center;">
                            ${Array.from({ length: 24 })
                              .map((_, i) => {
                                const isSelectedHour = tzDateTime.hour === i;
                                let bgColor = "#fff";
                                if (i < 6 || i >= 20)
                                  bgColor = "#2c3e50"; // Night
                                else if (i < 9 || i >= 17)
                                  bgColor = "#f39c12"; // Morning/Evening
                                else bgColor = "#2ecc71"; // Work

                                const isRangeHour =
                                  i >= tzDateTime.hour &&
                                  i <
                                    (selectedDateTime
                                      .add({ minutes: selectedDuration })
                                      .withTimeZone(tz.id).hour || 24);
                                // Simplified range logic for visualization
                                const isEndHour =
                                  selectedDateTime
                                    .add({ minutes: selectedDuration })
                                    .withTimeZone(tz.id).hour === i;

                                return `<div title="${i}:00" style="flex: 1; height: 20px; border: ${isSelectedHour ? "2px solid #0074d9" : isEndHour ? "2px dashed #0074d9" : "1px solid #ddd"}; background: ${isRangeHour ? "#b3d7ff" : bgColor}; box-sizing: border-box;"></div>`;
                              })
                              .join("")}
                        </div>
                    </ui5-table-cell>
                    <ui5-table-cell>
                        <div style="display: flex; gap: 0.25rem;">
                            <ui5-button class="move-up-btn" icon="navigation-up-arrow" design="Transparent" data-index="${index}" ${index === 0 ? "disabled" : ""}></ui5-button>
                            <ui5-button class="move-down-btn" icon="navigation-down-arrow" design="Transparent" data-index="${index}" ${index === selectedTimeZones.length - 1 ? "disabled" : ""}></ui5-button>
                            <ui5-button class="remove-tz-btn" icon="delete" design="Negative" data-id="${tz.id}"></ui5-button>
                        </div>
                    </ui5-table-cell>
                </ui5-table-row>
            `;
              })
              .join("")}
        </ui5-table>
      </div>
    </ui5-page>
  `;

  setupEventListeners(container);
  renderDialog(container);
  renderSettingsDialog(container);
}

function renderSettingsDialog(container: HTMLElement) {
  let dialog = container.querySelector<any>("#settings-dialog");
  if (!dialog) {
    dialog = document.createElement("ui5-dialog");
    dialog.id = "settings-dialog";
    dialog.headerText = "Settings";
    container.appendChild(dialog);
  }

  dialog.innerHTML = `
        <div style="padding: 1rem; min-width: 300px; display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>24h Time Format</span>
                <ui5-switch id="format-switch" ${is24HourFormat ? "checked" : ""}></ui5-switch>
            </div>
        </div>
        <div slot="footer" style="display: flex; justify-content: flex-end; padding: 0.5rem;">
            <ui5-button id="close-settings-btn" design="Transparent">Close</ui5-button>
        </div>
    `;

  const closeBtn = dialog.querySelector("#close-settings-btn");
  closeBtn?.addEventListener("click", () => {
    dialog.open = false;
  });

  const formatSwitch = dialog.querySelector("#format-switch");
  formatSwitch?.addEventListener("change", (e: any) => {
    is24HourFormat = e.target.checked;
    syncStateToURL();
    render(container);
  });
}

function renderDialog(container: HTMLElement) {
  let dialog = container.querySelector<any>("#event-dialog");
  if (!dialog) {
    dialog = document.createElement("ui5-dialog");
    dialog.id = "event-dialog";
    dialog.headerText = "Event View";
    container.appendChild(dialog);
  }

  const gCalUrl = generateGoogleCalendarLink();

  dialog.innerHTML = `
        <div style="padding: 1rem; min-width: 300px;">
            <h3>Meeting Details</h3>
            <p><b>Date:</b> ${selectedDateTime.toLocaleString("en-US", { dateStyle: "full" })}</p>
            <div style="margin-top: 1rem;">
                ${selectedTimeZones
                  .map((tz) => {
                    const start = selectedDateTime.withTimeZone(tz.id);
                    const end = selectedDateTime
                      .add({ minutes: selectedDuration })
                      .withTimeZone(tz.id);
                    return `
                        <div style="margin-bottom: 0.5rem; padding: 0.5rem; border-bottom: 1px solid #eee;">
                            <div><b>${tz.name.split("/").pop()?.replace(/_/g, " ")}</b></div>
                            <div style="font-size: 0.9rem;">${start.toLocaleString("en-US", { timeStyle: "short", hour12: !is24HourFormat })} - ${end.toLocaleString("en-US", { timeStyle: "short", hour12: !is24HourFormat })}</div>
                        </div>
                    `;
                  })
                  .join("")}
            </div>
        </div>
        <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end; padding: 0.5rem; width: 100%;">
            <ui5-button id="gcal-btn" design="Emphasized" icon="calendar">Add to Google Calendar</ui5-button>
            <ui5-button id="close-dialog-btn" design="Transparent">Close</ui5-button>
        </div>
    `;

  const closeBtn = dialog.querySelector("#close-dialog-btn");
  closeBtn?.addEventListener("click", () => {
    dialog.open = false;
  });

  const gcalBtn = dialog.querySelector("#gcal-btn");
  gcalBtn?.addEventListener("click", () => {
    window.open(gCalUrl, "_blank");
  });
}

function generateGoogleCalendarLink(): string {
  const start = selectedDateTime.toInstant().toString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const end =
    selectedDateTime
      .add({ minutes: selectedDuration })
      .toInstant()
      .toString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  const title = encodeURIComponent("Meeting across time zones");
  const details = encodeURIComponent(
    "Locations:\n" +
      selectedTimeZones
        .map(
          (tz) =>
            `${tz.name}: ${selectedDateTime.withTimeZone(tz.id).toLocaleString("en-US", { hour12: !is24HourFormat })}`,
        )
        .join("\n"),
  );

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`;
}

function formatTime(dateTime: Temporal.ZonedDateTime): string {
  return dateTime.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: !is24HourFormat,
  });
}

function setupEventListeners(container: HTMLElement) {
  const addBtn = container.querySelector("#add-tz-btn");
  const searchInput = container.querySelector<any>("#tz-search");
  const timeSlider = container.querySelector<any>("#time-slider");
  const resetBtn = container.querySelector("#reset-time-btn");

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

  timeSlider?.addEventListener("input", (event: any) => {
    const minutes = event.target.value;
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    selectedDateTime = selectedDateTime.with({ hour, minute, second: 0 });
    syncStateToURL();
    render(container);
  });

  resetBtn?.addEventListener("click", () => {
    selectedDateTime = Temporal.Now.zonedDateTimeISO();
    render(container);
  });

  const eventViewBtn = container.querySelector("#event-view-btn");
  eventViewBtn?.addEventListener("click", () => {
    const dialog = container.querySelector<any>("#event-dialog");
    if (dialog) {
      dialog.open = true;
    }
  });

  const settingsBtn = container.querySelector("#settings-btn");
  settingsBtn?.addEventListener("click", () => {
    const dialog = container.querySelector<any>("#settings-dialog");
    if (dialog) {
      dialog.open = true;
    }
  });

  container.querySelectorAll(".remove-tz-btn").forEach((btn: any) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      selectedTimeZones = selectedTimeZones.filter((tz) => tz.id !== id);
      syncStateToURL();
      render(container);
    });
  });

  container.querySelectorAll(".move-up-btn").forEach((btn: any) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      if (index > 0) {
        [selectedTimeZones[index], selectedTimeZones[index - 1]] = [
          selectedTimeZones[index - 1],
          selectedTimeZones[index],
        ];
        syncStateToURL();
        render(container);
      }
    });
  });

  container.querySelectorAll(".move-down-btn").forEach((btn: any) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.getAttribute("data-index"));
      if (index < selectedTimeZones.length - 1) {
        [selectedTimeZones[index], selectedTimeZones[index + 1]] = [
          selectedTimeZones[index + 1],
          selectedTimeZones[index],
        ];
        syncStateToURL();
        render(container);
      }
    });
  });
}

function updateClocks(container: HTMLElement) {
  const now = Temporal.Now.zonedDateTimeISO();
  const isCurrentlyNow = Math.abs(now.epochSeconds - selectedDateTime.epochSeconds) < 2;

  // For testing US 1 real-time updates, always update the table cells
  const timeCells = container.querySelectorAll(".current-time");
  timeCells.forEach((cell) => {
    const tz = cell.getAttribute("data-tz");
    if (tz) {
      const displayDateTime = isCurrentlyNow
        ? now.withTimeZone(tz)
        : selectedDateTime.withTimeZone(tz);
      cell.textContent = formatTime(displayDateTime);
    }
  });

  if (isCurrentlyNow) {
    const oldHour = selectedDateTime.hour;
    selectedDateTime = now;

    if (now.hour !== oldHour) {
      render(container);
    } else {
      const selectedTimeDisplay = container.querySelector("#selected-time-display");
      if (selectedTimeDisplay) {
        selectedTimeDisplay.textContent = `${now.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", hour12: !is24HourFormat })} - ${now.add({ minutes: selectedDuration }).toLocaleString("en-US", { timeStyle: "short", hour12: !is24HourFormat })}`;
      }
      const timeSlider = container.querySelector<any>("#time-slider");
      if (timeSlider) {
        timeSlider.value = now.hour * 60 + now.minute;
      }
    }
  }
}

const appElement = document.querySelector<HTMLDivElement>("#app");
if (appElement) {
  init(appElement);
}
