function closeModal() {
    document.querySelector("#br-ext-overlay:has(#br-ext-modal)")?.remove();
}

// Causes a modal to appear
/**
 * Options
 *  - header: The title of the modal
 *  - body: The text content of the modal. Supports HTML
 *  - submit: The text for the submit button. Defaults to "Confirm"
 *  - action: The action performed when the user confirms the modal
 *  - cancel: The text for the cancel button. Defaults to "Cancel"
 */
function showModal(options) {
    let overlay = document.createElement("div");
    overlay.id = "br-ext-overlay";

    let modal = document.createElement("div");
    modal.id = "br-ext-modal";
    modal.innerHTML = `
        <div id="br-ext-modal-header">
            <a role="button" class="close">&times;</a>
            ${"header" in options ? "<span>" + options.header + "</span>" : ""}
        </div>
        <div id="br-ext-modal-body">
            ${options.body || ""}
        </div>
        <div id="br-ext-modal-footer">
            <button class="br-ext submit">${options.submit || "Confirm"}</button>
            <button class="br-ext cancel">${options.cancel || "Cancel"}</button>
        </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Add the event listeners
    modal.querySelector(".submit").onclick = options.action;
    modal.querySelector(".close").onclick = closeModal;
    modal.querySelector(".cancel").onclick = closeModal;
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    }

}