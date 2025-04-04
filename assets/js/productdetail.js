// Takes the admin to the edit product page
function editProduct() {
    const productId = document.getElementById("product-id-for-enquiry").value;
    window.location = `/wp-admin/post.php?post=${productId}&action=edit`;
}


// Finds the current price of the product
function getPrice() {
    return parseFloat(document.querySelector(".price bdi").innerText.replace("€", ""));
}


// Replaces the "Start Sale" button with the sale form
function initSale() {
    let saleForm = document.getElementById("br-ext-sale-form");
    let saleButton = document.getElementById("br-ext-start-sale");

    saleButton.style.display = "none";
    saleForm.style.display = "flex";
}


// Returns the "Start Sale" button and hides the form
function cancelSale() {
    let saleForm = document.getElementById("br-ext-sale-form");
    let saleButton = document.getElementById("br-ext-start-sale");

    saleButton.style.display = "inline-block";
    saleForm.style.display = "none";
}


// Creates a sale button under the price display
function saleButtonInit() {
    const priceEl = document.querySelector("p.price");
    priceEl.style.marginBottom = "0";
    const isSale = priceEl.querySelectorAll(".woocommerce-Price-amount").length > 1;

    let priceButton = document.createElement("button");
    priceButton.id = `br-ext-start-sale`;
    priceButton.className = `br-ext`;

    if (isSale) {
        priceButton.innerText = "End Sale";

        priceButton.onclick = editProduct;
    }
    else {
        const price = getPrice();
        priceButton.innerText = "Start Sale";
        priceButton.onclick = initSale;

        // Create the sale form so the admin can set the sale price on the product detail page
        // We don't use a form element because we are not posting data in a normal way
        let saleForm = document.createElement("div");
        saleForm.id = "br-ext-sale-form";
        saleForm.className = "br-ext";
        saleForm.style.display = "none";

        // Create the sale input
        let saleInput = document.createElement("input");
        saleInput.id = "br-ext-sale-input";
        saleInput.className = "br-ext";
        saleInput.type = "number";
        saleInput.min = "1";
        saleInput.max = `${price - 1}`;
        saleInput.placeholder = "Sale Price"
        saleForm.appendChild(saleInput);

        // Create the submit button
        let saleSubmit = document.createElement("button");
        saleSubmit.id = "br-ext-sale-submit";
        saleSubmit.className = "br-ext";
        saleSubmit.innerText = "Submit";
        saleSubmit.disabled = true;
        saleForm.appendChild(saleSubmit);

        // Create the cancel button
        let saleCancel = document.createElement("button");
        saleCancel.id = "br-ext-sale-cancel";
        saleCancel.className = "br-ext cancel";
        saleCancel.innerText = "Cancel";
        saleCancel.onclick = cancelSale;
        saleForm.appendChild(saleCancel);

        priceEl.after(saleForm);
    }
    priceEl.after(priceButton);
}

if (window.location.href.includes("/product/")) {
    saleButtonInit();
}
