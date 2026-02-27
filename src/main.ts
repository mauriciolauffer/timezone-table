import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/Page.js";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <ui5-page style="height: 100vh;" floating-footer>
      <ui5-shellbar slot="header" primary-title="Time Zone Converter"></ui5-shellbar>
      <div style="padding: 1rem;">
        <ui5-button id="myBtn" design="Emphasized">Hello UI5 Web Components!</ui5-button>
      </div>
    </ui5-page>
  `;

  const btn = document.querySelector("#myBtn");
  btn?.addEventListener("click", () => {
    alert("Button clicked!");
  });
}
