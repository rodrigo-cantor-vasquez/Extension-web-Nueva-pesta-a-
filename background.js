chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (
            message.action !== "searchWeb"
        ) {
            return;
        }

        chrome.search.query({
            text: message.text,
            disposition: "CURRENT_TAB"
        });

    }
);