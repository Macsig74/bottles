const invoke = window.__TAURI__?.core?.invoke;

const platformPill = document.querySelector("#platform");
const pingBtn = document.querySelector("#ping");
const pingMsg = document.querySelector("#ping-msg");

async function init() {
  if (!invoke) {
    platformPill.textContent = "web";
    return;
  }
  try {
    platformPill.textContent = await invoke("platform_info");
  } catch {
    platformPill.textContent = "natif";
  }
}

pingBtn?.addEventListener("click", async () => {
  pingMsg.textContent = "…";
  if (!invoke) {
    pingMsg.textContent = "Pont natif indisponible (aperçu web)";
    return;
  }
  try {
    pingMsg.textContent = await invoke("greet", { name: "le groupe" });
  } catch {
    pingMsg.textContent = "Erreur d'appel natif";
  }
});

document.querySelectorAll(".card").forEach((c) => {
  c.addEventListener("click", () => {
    pingMsg.textContent = `→ ${c.dataset.nav} (à brancher sur le site)`;
  });
});

init();
