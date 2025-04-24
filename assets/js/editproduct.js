const actions = {
  editName: (data) => {
    const nameInput = document.getElementById("title");
    if (!nameInput) return false;

    // Get if there is a sale
    const saleInput = document.getElementById("_sale_price");
    if (!saleInput) return false;

    nameInput.value = saleInput.value !== "" ? `*SPECIAL OFFER* ${data.name}` : data.name;
    return true;
  },
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
  },
  deleteProduct: () => {
    const deleteButton = document.querySelector("#delete-action>a");

    if (deleteButton) {
      deleteButton.click();
      return true;
    }
  }
}


// Extracts the product id from the URL
function getProductId() {
  return parseInt(window.location.href.split("?post=")[1].split("&action=")[0]);
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


async function performIteration() {
  await iterate();
  setTimeout(() => {
    const skuInput = document.getElementById("_sku");
    if (!skuInput || !skuInput.value) {
      console.log("Failed");
      performIteration();
    }
  }, 1000);
}


function iterate() {
  return new Promise((resolve) => {
    const skuIds = {
      OD: 61,
      BD: 60,
      SS: 62,
      FT: 90,
      PD: 63,
      AC: 89,
  
      EC: 53,
      CC: 56,
      MC: 58,
      ST: 59,
      DC: 57,
      SF: 93,
  
      TS: 73,
      FC: 74,
      LK: 75,
  
      CN: 65,
      MT: 66,
      CF: 67,
  
      RC: 71,
      SO: 70,
      CT: 69,
      CS: 92,
  
      FS: 81,
      MB: 83,
      TT: 80,
      WM: 82,
      SU: 91,
  
      KC: 85,
      KT: 86,
      OF: 87,
    }
    const selectedCategory = document.querySelector("ul.children>li:has(>label>input[checked='checked']):not(:has(ul))");
    if (selectedCategory) {
      let catId = selectedCategory.id.split("-")[2];
      const skuInput = document.getElementById("_sku");
  
      if (skuInput) {
        const extAPI = typeof browser !== "undefined" ? browser : chrome;
        let skuKey = "";
        for (let [key, value] of Object.entries(skuIds)) {
          if (value == catId) {
            skuKey = key;
            break;
          }
        }
  
        extAPI.storage.local.get("sharkTradingData", (result) => {
          let newData = { ...result.sharkTradingData, continueIteration: true };
          let productId = getProductId();
          skuInput.value = `${skuKey}-${productId}`;
          newData[skuKey]++;
          extAPI.storage.local.set({ sharkTradingData: newData }, () => {
            resolve(true);
            document.getElementById("publish").click();
          });
        });
      }
    }
  })
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
      else if ("continueIteration" in result.sharkTradingData) {
        let newData = { ...result.sharkTradingData };
        delete newData.continueIteration;

        extAPI.storage.local.set({ sharkTradingData: newData }, () => {
          window.location = `https://sharktrading.ie/wp-admin/edit.php?post_type=product&paged=${newData.page}`;
        });
      }
      else if ("iteration" in result.sharkTradingData) {
        performIteration(result.sharkTradingData);
      }
    }
});
}