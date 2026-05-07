window.StackList = (function () {
    let items = [];
    let container = null;

    function init(el) {
        container = el;
        render();
    }

    function add(item) {
        items.push(item); // oldest at top
        render();
    }

    function remove(id) {
        items = items.filter(i => i.id !== id);
        render();
    }

    function restorePosition(item) {
        if (!item || !item.range || !item.url) return;

        // Same page only (for now)
        if (location.href !== item.url) {
            window.open(item.url, "_blank");
            return;
        }

        try {
            const range = deserializeRange(item.range);

            // Grab rect for scroll position BEFORE touching selection
            const rect = range.getBoundingClientRect();
            const y = rect.top + window.scrollY - 120;

            // Clear any existing browser selection — we don't want the blue highlight
            window.getSelection().removeAllRanges();

            window.scrollTo({ top: y, behavior: "smooth" });

            // Show only our orange overlay — no native blue selection
            highlightRange(range);
        } catch (e) {
            console.warn("Restore failed", e);
        }
    }


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

    function resolveNodePath(path) {
        let node = document.body;
        for (const index of path) {
            if (!node.childNodes[index]) return null;
            node = node.childNodes[index];
        }
        return node;
    }

    function deserializeRange(saved) {
        const range = document.createRange();

        const startNode = resolveNodePath(saved.startPath);
        const endNode = resolveNodePath(saved.endPath);

        range.setStart(startNode, saved.startOffset);
        range.setEnd(endNode, saved.endOffset);

        return range;
    }

    // ---- DRAG-TO-REORDER STATE ----
    let dragSrcIndex = null;   // index of the row being dragged
    let dropIndicator = null;  // the thin line shown between rows

    function createDropIndicator() {
        const line = document.createElement("div");
        line.className = "csm-drop-indicator";
        return line;
    }

    /** Insert drop-indicator before the row at `targetIndex`, or after last row if targetIndex === items.length */
    function showIndicatorAt(targetIndex) {
        if (!dropIndicator) return;
        const rows = container.querySelectorAll(".csm-stack-row");
        if (targetIndex < rows.length) {
            container.insertBefore(dropIndicator, rows[targetIndex]);
        } else {
            container.appendChild(dropIndicator);
        }
    }

    /** Return the index (0-based) of the row the cursor is closest to (above or below mid-point) */
    function getDropIndex(clientY) {
        const rows = Array.from(container.querySelectorAll(".csm-stack-row"));
        for (let i = 0; i < rows.length; i++) {
            const rect = rows[i].getBoundingClientRect();
            if (clientY < rect.top + rect.height / 2) return i;
        }
        return rows.length;
    }

    function render() {
        if (!container) return;
        container.innerHTML = "";

        items.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "csm-stack-row";
            row.dataset.index = index;

            /* FORCE GRID INLINE (bypasses site CSS) */
            row.style.display = "grid";
            row.style.gridTemplateColumns = "32px minmax(0, 1fr) 70px 28px";
            row.style.alignItems = "center";
            row.style.columnGap = "8px";

            // ---- ROW-LEVEL DRAG (whole row is the handle) ----
            row.addEventListener("mousedown", (e) => {
                // Don't hijack the delete button
                if (e.target.closest(".csm-stack-delete")) return;
                e.preventDefault();
                dragSrcIndex = index;
                row.classList.add("csm-dragging");

                dropIndicator = createDropIndicator();
                showIndicatorAt(index);

                function onMove(ev) {
                    const di = getDropIndex(ev.clientY);
                    showIndicatorAt(di);
                }

                function onUp(ev) {
                    document.removeEventListener("mousemove", onMove);
                    document.removeEventListener("mouseup", onUp);

                    let targetIndex = getDropIndex(ev.clientY);

                    // Clean up visual state
                    row.classList.remove("csm-dragging");
                    if (dropIndicator) { dropIndicator.remove(); dropIndicator = null; }

                    // Adjust target if dragging downward (splice removes original first)
                    if (targetIndex !== dragSrcIndex && targetIndex !== dragSrcIndex + 1) {
                        const [moved] = items.splice(dragSrcIndex, 1);
                        const insertAt = targetIndex > dragSrcIndex ? targetIndex - 1 : targetIndex;
                        items.splice(insertAt, 0, moved);
                        render();
                    }
                    dragSrcIndex = null;
                }

                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
            });

            // ---- SERIAL NUMBER ----
            const sl = document.createElement("div");
            sl.className = "csm-stack-sl";
            sl.textContent = index + 1;
            sl.style.cursor = "pointer";

            sl.onclick = () => {
                restorePosition(item);
            };

            const title = document.createElement("div");
            title.className = "csm-stack-title-cell";
            title.textContent = item.title;
            title.title = item.title;

            /* FORCE single-line ellipsis (hostile CSS safe) */
            title.style.whiteSpace = "nowrap";
            title.style.overflow = "hidden";
            title.style.textOverflow = "ellipsis";
            title.style.maxWidth = "100%";

            const time = document.createElement("div");
            time.className = "csm-stack-time";
            time.textContent = item.timeLabel;

            const del = document.createElement("button");
            del.className = "csm-stack-delete";
            del.textContent = "🗑";
            del.onclick = () => remove(item.id);

            row.appendChild(sl);
            row.appendChild(title);
            row.appendChild(time);
            row.appendChild(del);

            container.appendChild(row);
        });
    }

    // Module-level so previous highlights are always cleared before new ones draw
    let activeOverlays = [];

    function highlightRange(range) {
        // Clear any existing highlight overlays first — prevents stacking on repeated clicks
        activeOverlays.forEach(el => el.remove());
        activeOverlays = [];

        const rects = Array.from(range.getClientRects());
        if (!rects.length) return;

        rects.forEach(rect => {
            const div = document.createElement("div");
            div.style.position      = "absolute";
            div.style.left          = rect.left + window.scrollX + "px";
            div.style.top           = rect.top  + window.scrollY + "px";
            div.style.width         = rect.width  + "px";
            div.style.height        = rect.height + "px";
            div.style.background    = "rgba(232, 114, 28, 0.15)";   /* light orange tint */
            div.style.border        = "1.5px solid rgba(232, 114, 28, 0.55)";
            div.style.borderRadius  = "2px";
            div.style.boxSizing     = "border-box";
            div.style.pointerEvents = "none";
            div.style.zIndex        = "999998";

            document.body.appendChild(div);
            activeOverlays.push(div);
        });

        setTimeout(() => {
            activeOverlays.forEach(el => el.remove());
            activeOverlays = [];
        }, 5000);
    }



    return { init, add };
})();
