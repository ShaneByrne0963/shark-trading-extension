const actions = {
  setSale: (data) => {
    // Find the sale price and title inputs
    const saleInput = document.getElementById("_sale_price");
    const titleInput = document.getElementById("title");

    // Try again if any required input is not found
    if (!saleInput || !titleInput) {
      return false;
    }
    // Add the *SPECIAL OFFER* prefix to the title
    if (!titleInput.value.includes("*SPECIAL OFFER*")) {
      titleInput.value = `*SPECIAL OFFER* ${titleInput.value}`;
    }
    saleInput.value = data.price;
    // Success
    return true;
  },
  removeSale: () => {
    // Find the sale price and title inputs
    const saleInput = document.getElementById("_sale_price");
    const titleInput = document.getElementById("title");

    // Try again if any required input is not found
    if (!saleInput || !titleInput) {
      return false;
    }
    // Remove the *SPECIAL OFFER* prefix from the title
    if (titleInput.value.includes("*SPECIAL OFFER*")) {
      titleInput.value = titleInput.value.replace("*SPECIAL OFFER* ", "");
    }
    // Clear the sale input
    saleInput.value = "";
    // Success
    return true;
  },
  updatePrice: (data) => {
    const priceInput = document.getElementById("_regular_price");

    if (priceInput) {
      priceInput.value = data.price;
      return true;
    }
  }
}


function performAction(data) {
  // Keep checking for the action to be completed until it is
  if (!actions[data.action](data)) {
    setTimeout(() => performAction(data), 1000);
  }
  else {
    // Click the "publish" button when the action has been performed
    document.getElementById("publish").click();
  }
}


// Create an overlay that prevents the user from clicking anything while changes are being applied
function createOverlay(heading, subheading) {
  let overlay = document.createElement("div");
  overlay.id = "br-ext-overlay";
  overlay.innerHTML = `
  <div id="br-ext-overlay-text"><p>${heading}</p><span>${subheading}</span></div>
  `;
  document.body.appendChild(overlay);
}


function returnToProduct() {
  window.location = document.querySelector("#sample-permalink>a").href;
}


if (window.location.href.includes("/post.php") && window.location.href.includes("&action=edit")) {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;

  extAPI.storage.local.get("sharkTradingData", (result) => {
    if ("sharkTradingData" in result) {
      if ("action" in result.sharkTradingData) {
        createOverlay("Applying changes", "Please wait...");
        performAction(result.sharkTradingData);
    
        // Add a completed field to the data to signal a return to the product
        extAPI.storage.local.set({ sharkTradingData: { completed: true } });
      }
      else if ("completed" in result.sharkTradingData) {
        createOverlay("Changes applied", "Returning to product...");

        // Clear the data once received
        extAPI.storage.local.set({ sharkTradingData: {} });

        // Go back to the product details page
        returnToProduct();
      }
    }
});
}