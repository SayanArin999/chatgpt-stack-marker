let modal = null;
let input = null;
let currentData = null;
let saveCallback = null;

/* ---------- OPEN MODAL ---------- */
function openNamingModal(bookmarkData, onSave) {
    if (modal) return;

    currentData = bookmarkData;
    saveCallback = onSave;

    // Backdrop
    modal = document.createElement("div");
    modal.className = "csm-spotlight-backdrop";

    // Spotlight box
    const box = document.createElement("div");
    box.className = "csm-spotlight-box";

    // Input
    input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Name this bookmark…";
    input.className = "csm-spotlight-input";

    box.appendChild(input);
    modal.appendChild(box);
    document.body.appendChild(modal);

    // Focus input
    setTimeout(() => input.focus(), 0);

    /* ---------- ENTER KEY ---------- */
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const name = input.value.trim();
            if (!name) return;

            saveCallback({
                ...currentData,
                name
            });

            closeModal();
        }
    });

    /* ---------- ESC KEY (GLOBAL) ---------- */
    document.addEventListener("keydown", onKeyDown);

    /* ---------- OUTSIDE CLICK ---------- */
    modal.addEventListener("mousedown", (e) => {
        if (e.target === modal) closeModal();
    });
}

/* ---------- ESC HANDLER ---------- */
function onKeyDown(e) {
    if (e.key === "Escape" && modal) {
        closeModal();
    }
}

/* ---------- CLOSE MODAL ---------- */
function closeModal() {
    document.removeEventListener("keydown", onKeyDown);

    if (!modal) return;

    modal.remove();
    modal = null;
    input = null;
    currentData = null;
    saveCallback = null;
}

/* ---------- ENTER INPUT ---------- */
function initNamingModal(onSubmit) {
    const input = document.querySelector("#stack-title-input");

    if (!input) return;

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            const title = input.value.trim();
            if (!title) return;

            onSubmit(title);

            input.value = "";
            document.querySelector("#spotlight-modal")?.remove();
        }
    });
}

