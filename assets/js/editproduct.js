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


function returnToProduct() {
  window.location = document.querySelector("#sample-permalink>a").href;
}


if (window.location.href.includes("/post.php") && window.location.href.includes("&action=edit")) {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;

  extAPI.storage.local.get("sharkTradingData", (result) => {
    if ("sharkTradingData" in result) {
      performAction(result.sharkTradingData);
  
      // Clear the data once received
      extAPI.storage.local.set({ sharkTradingData: {} });
    }
});
}