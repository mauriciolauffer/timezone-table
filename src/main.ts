import "@ui5/webcomponents/dist/Button.js";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <h1>Time Zone Converter</h1>
    <ui5-button id="myBtn">Hello UI5 Web Components!</ui5-button>
  `;

  const btn = document.querySelector("#myBtn");
  btn?.addEventListener("click", () => {
    alert("Button clicked!");
  });
}
