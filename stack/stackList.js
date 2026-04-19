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
            const sel = window.getSelection();
            sel.removeAllRanges();

            const range = deserializeRange(item.range);
            sel.addRange(range);

            const rect = range.getBoundingClientRect();
            const y = rect.top + window.scrollY - 120;

            window.scrollTo({
                top: y,
                behavior: "smooth"
            });

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

    function render() {
        if (!container) return;
        container.innerHTML = "";

        items.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "csm-stack-row";

            /* FORCE GRID INLINE (bypasses site CSS) */
            row.style.display = "grid";
            row.style.gridTemplateColumns = "32px minmax(0, 1fr) 70px 28px";
            row.style.alignItems = "center";
            row.style.columnGap = "8px";

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

    function highlightRange(range) {
        const rects = Array.from(range.getClientRects());
        if (!rects.length) return;

        const overlays = [];

        rects.forEach(rect => {
            const div = document.createElement("div");
            div.style.position = "absolute";
            div.style.left = rect.left + window.scrollX + "px";
            div.style.top = rect.top + window.scrollY + "px";
            div.style.width = rect.width + "px";
            div.style.height = rect.height + "px";
            div.style.background = "rgba(255, 230, 150, 0.6)";
            div.style.pointerEvents = "none";
            div.style.zIndex = "999999";

            document.body.appendChild(div);
            overlays.push(div);
        });

        setTimeout(() => {
            overlays.forEach(el => el.remove());
        }, 2000);
    }


    return { init, add };
})();
