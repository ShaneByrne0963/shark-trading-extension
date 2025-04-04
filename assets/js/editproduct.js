const actions = {
  setSale: (data) => {
    // Find the sale price input
    const saleInput = document.getElementById("_sale_price");

    // Keep checking 
    if (saleInput) {
      saleInput.value = data.price;
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
    console.log("Action Complete!");
  }
}


function returnToProduct() {
  window.location = document.querySelector("#sample-permalink>a").href;
}


if (window.location.href.includes("/post.php") && window.location.href.includes("&action=edit")) {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;

  extAPI.storage.local.get("sharkTradingData", (result) => {
    performAction(result.sharkTradingData);
});
}