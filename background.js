chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    try {
        await chrome.tabs.sendMessage(tab.id, {
            action: "TOGGLE_STACK_PANEL",
        });
    } catch (err) {
        console.warn("Stack panel not available on this page");
    }
});