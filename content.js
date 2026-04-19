console.log("ZAYU loaded");

let bookmarkBtn = null;

/* ---------- NODE PATH HELPER ---------- */
function getNodePath(node) {
    const path = [];
    while (node && node !== document.body) {
        const parent = node.parentNode;
        if (!parent) break;

        const index = Array.prototype.indexOf.call(parent.childNodes, node);
        path.unshift(index);
        node = parent;
    }
    return path;
}

/* ---------- BOOKMARK BUTTON ---------- */
function createBookmarkButton() {
    const btn = document.createElement("button");
    btn.className = "csm-bookmark-btn";

    btn.innerHTML = `
        <img class="csm-bookmark-icon"
             src="${chrome.runtime.getURL("icon/starSmily.svg")}" />
    `;

    btn.addEventListener("click", (e) => {
        e.stopPropagation(); // 🔒 IMPORTANT: prevent selection reset

        const selection = window.getSelection();
        const text = selection?.toString().trim();
        if (!text) return;

        const bookmarkData = {
            text,
            range: (() => {
                const r = selection.getRangeAt(0);
                return {
                    startOffset: r.startOffset,
                    endOffset: r.endOffset,
                    startPath: getNodePath(r.startContainer),
                    endPath: getNodePath(r.endContainer)
                };
            })(),
            scrollY: window.scrollY,
            url: location.href,
            timestamp: Date.now()
        };

        openNamingModal(bookmarkData, (savedBookmark) => {
            const item = {
                id: crypto.randomUUID(),
                title: savedBookmark.name,
                timeLabel: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                scrollY: savedBookmark.scrollY,
                url: savedBookmark.url,
                range: savedBookmark.range
            };

            openStackPanelIfClosed();
            StackList.add(item);
        });

        hideBookmarkButton();
    });

    document.body.appendChild(btn);
    return btn;
}

function showBookmarkButton(x, y) {
    if (!bookmarkBtn) bookmarkBtn = createBookmarkButton();
    bookmarkBtn.style.left = `${x}px`;
    bookmarkBtn.style.top = `${y}px`;
    bookmarkBtn.classList.add("visible");
}

function hideBookmarkButton() {
    if (bookmarkBtn) bookmarkBtn.classList.remove("visible");
}

/* ---------- SHOW ONLY AFTER SELECTION FINISHED ---------- */
document.addEventListener("mouseup", () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
        hideBookmarkButton();
        return;
    }

    const text = selection.toString().trim();
    if (!text) {
        hideBookmarkButton();
        return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    showBookmarkButton(
        rect.right + window.scrollX + 6,
        rect.top + window.scrollY - 6
    );
});

/* ---------- CLEANUP WHEN SELECTION IS CLEARED ---------- */
let selectionRAF = null;

document.addEventListener("selectionchange", () => {
    cancelAnimationFrame(selectionRAF);

    selectionRAF = requestAnimationFrame(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            hideBookmarkButton();
        }
    });
});







// console.log("ZAYU loaded");

// let bookmarkBtn = null;

// function getNodePath(node) {
//     const path = [];
//     while (node && node !== document.body) {
//         const parent = node.parentNode;
//         if (!parent) break;

//         const index = Array.prototype.indexOf.call(parent.childNodes, node);
//         path.unshift(index);
//         node = parent;
//     }
//     return path;
// }

// function createBookmarkButton() {
//     console.log("⭐ bookmark button clicked");
//     const btn = document.createElement("button");
//     btn.className = "csm-bookmark-btn";

//     btn.innerHTML = `
//     <img class="csm-bookmark-icon"
//          src="${chrome.runtime.getURL("icon/starSmily.svg")}" />
//   `;

//     btn.addEventListener("click", () => {
//         const selection = window.getSelection();
//         const text = selection.toString().trim();
//         if (!text) return;

//         const bookmarkData = {
//             text,
//             range: (() => {
//                 const r = selection.getRangeAt(0);
//                 return {
//                     startOffset: r.startOffset,
//                     endOffset: r.endOffset,
//                     startPath: getNodePath(r.startContainer),
//                     endPath: getNodePath(r.endContainer)
//                 };
//             })(),

//             scrollY: window.scrollY,
//             url: location.href,
//             timestamp: Date.now()
//         };
//         openNamingModal(bookmarkData, (savedBookmark) => {
//             const item = {
//                 id: crypto.randomUUID(),
//                 title: savedBookmark.name,
//                 timeLabel: new Date().toLocaleTimeString([], {
//                     hour: "2-digit",
//                     minute: "2-digit"
//                 }),
//                 scrollY: savedBookmark.scrollY,
//                 url: savedBookmark.url,
//                 range: savedBookmark.range
//             };

//             openStackPanelIfClosed();
//             StackList.add(item);
//         });

//         hideBookmarkButton();
//     });


//     document.body.appendChild(btn);
//     return btn;
// }

// function showBookmarkButton(x, y) {
//     if (!bookmarkBtn) bookmarkBtn = createBookmarkButton();
//     bookmarkBtn.style.left = `${x}px`;
//     bookmarkBtn.style.top = `${y}px`;
//     bookmarkBtn.classList.add("visible");
// }

// function hideBookmarkButton() {
//     if (bookmarkBtn) bookmarkBtn.classList.remove("visible");
// }

// // Selection detection
// document.addEventListener("mouseup", () => {
//     const selection = window.getSelection();
//     if (!selection || selection.isCollapsed) {
//         hideBookmarkButton();
//         return;
//     }

//     const rect = selection.getRangeAt(0).getBoundingClientRect();
//     if (!rect.width || !rect.height) return;

//     showBookmarkButton(
//         rect.right + window.scrollX + 6,
//         rect.top + window.scrollY - 6
//     );
// });

// document.addEventListener("mousedown", (e) => {
//     if (bookmarkBtn && !bookmarkBtn.contains(e.target)) {
//         hideBookmarkButton();
//     }
// });

// let selectionRAF = null;

// document.addEventListener("selectionchange", () => {
//     cancelAnimationFrame(selectionRAF);

//     selectionRAF = requestAnimationFrame(() => {
//         const selection = window.getSelection();
//         if (!selection || selection.isCollapsed) {
//             hideBookmarkButton();
//         }
//     });
// });


