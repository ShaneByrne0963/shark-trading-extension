// Creates a sale button under the price display
function saleButtonInit() {
    const priceEl = document.querySelector("p.price");
    priceEl.style.marginBottom = "0";
    const isSale = priceEl.querySelectorAll(".woocommerce-Price-amount").length > 1;

    const priceButton = document.createElement("button");
    priceButton.className = `br-ext`;

    if (isSale) {
        priceButton.innerText = "End Sale";
    }
    else {
        priceButton.innerText = "Start Sale";
    }

    priceEl.after(priceButton);
}

if (window.location.href.includes("/product/")) {
    saleButtonInit();
}
