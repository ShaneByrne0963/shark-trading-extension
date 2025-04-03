if (window.location.href.includes("/product/")) {
    const priceEl = document.querySelector("p.price");
    priceEl.style.marginBottom = "0";

    const priceButton = document.createElement("button");
    priceButton.className = "br-ext";
    priceButton.innerText = "Click Me!";

    priceEl.after(priceButton);
}
