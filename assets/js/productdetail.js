// Takes the admin to the edit product page
function editProduct(action, data) {
    const extAPI = typeof browser !== "undefined" ? browser : chrome;

    const exportData = { action, ...data };

    extAPI.storage.local.set({ sharkTradingData: exportData }, () => {
        const productId = document.getElementById("product-id-for-enquiry").value;
        window.location = `/wp-admin/post.php?post=${productId}&action=edit`;
    });
}


// Finds the current price of the product
function getPrice() {
    return parseFloat(document.querySelector(".price bdi").innerText.replace("€", ""));
}


// Hides the price options, and shows a specific form
function openForm(formType) {
    let buttonDiv = document.getElementById("br-ext-price-buttons");
    let form = document.getElementById(`br-ext-${formType}-form`);
    let feedback = document.getElementById(`br-ext-${formType}-feedback`);

    buttonDiv.style.display = "none";
    form.style.display = "flex";
    feedback.style.display = "block";

    // Hide the price when editing it
    if (formType === "price") {
        let priceEl = document.querySelector(".woocommerce-Price-amount.amount");
        priceEl.style.display = "none";
    }
}


// Checks if the number entered by the user is valid
function validateSale() {
    let feedback = "";
    const input = document.getElementById("br-ext-sale-input");
    input.classList.remove("invalid");
    const val = parseFloat(input.value);
    const originalPrice = getPrice();

    // A value must be entered to set a sale
    if (isNaN(val)) {
        feedback = "Please enter a value";
    }
    else if (val < 1) {
        feedback = "New price must be at least €1";
    }
    else if (val >= originalPrice) {
        feedback = "New price must be less than the original price";
    }
    document.querySelector("#br-ext-sale-submit").disabled = feedback !== "";
    document.querySelector("#br-ext-sale-feedback").innerText = feedback;
    if (feedback) {
        input.classList.add("invalid");
    }
}


// Checks if the number entered by the user is valid
function validatePrice() {
    let feedback = "";
    const input = document.getElementById("br-ext-price-input");
    input.classList.remove("invalid");
    const val = parseFloat(input.value);

    // A value must be entered to set a sale
    if (isNaN(val)) {
        feedback = "Please enter a value";
    }
    else if (val < 1) {
        feedback = "New price must be at least €1";
    }
    document.querySelector("#br-ext-price-submit").disabled = feedback !== "";
    document.querySelector("#br-ext-price-feedback").innerText = feedback;
    if (feedback) {
        input.classList.add("invalid");
    }
}


// Returns the "Start Sale" button and hides the form
function cancelPriceEdit() {
    // Hide all price forms
    const forms = ["sale", "price"];
    for (let f of forms) {
        let form = document.getElementById(`br-ext-${f}-form`);
        let feedback = document.getElementById(`br-ext-${f}-form`);

        form.style.display = "none";
        feedback.style.display = "none";
    }
    let buttonDiv = document.getElementById("br-ext-price-buttons");
    buttonDiv.style.display = "flex";
    let priceEl = document.querySelector(".woocommerce-Price-amount.amount");
    priceEl.style.display = "inline";
}


function editPriceButtonInit() {
    const buttonDiv = document.getElementById("br-ext-price-buttons");

    let priceButton = document.createElement("button");
    priceButton.id = `br-ext-edit-price`;
    priceButton.className = `br-ext`;
    priceButton.innerText = "Edit Price";
    priceButton.onclick = () => openForm("price");

    buttonDiv.appendChild(priceButton);

    // Create the price form
    let priceForm = document.createElement("div");
    priceForm.id = "br-ext-price-form";
    priceForm.className = "br-ext br-ext-form";
    priceForm.style.display = "none";

    // Create the sale input
    let priceInput = document.createElement("input");
    priceInput.id = "br-ext-price-input";
    priceInput.className = "br-ext";
    priceInput.type = "number";
    priceInput.min = "1";
    priceInput.value = getPrice();
    priceInput.oninput = validatePrice;
    priceForm.appendChild(priceInput);

    // Create the submit button
    let priceSubmit = document.createElement("button");
    priceSubmit.id = "br-ext-price-submit";
    priceSubmit.className = "br-ext";
    priceSubmit.innerText = "Submit";
    priceSubmit.disabled = true;
    priceSubmit.onclick = () => editProduct("updatePrice", { price: parseFloat(document.getElementById("br-ext-price-input").value) });
    priceForm.appendChild(priceSubmit);

    // Create the cancel button
    let priceCancel = document.createElement("button");
    priceCancel.id = "br-ext-price-cancel";
    priceCancel.className = "br-ext cancel";
    priceCancel.innerText = "Cancel";
    priceCancel.onclick = cancelPriceEdit;
    priceForm.appendChild(priceCancel);

    // Create the input feedback element
    let priceFeedback = document.createElement("div");
    priceFeedback.id = "br-ext-price-feedback";
    priceFeedback.className = "br-ext feedback";

    const priceEl = document.querySelector(".price");
    priceEl.appendChild(priceForm);
    priceEl.appendChild(priceFeedback);
}


// Creates a sale button under the price display
function saleButtonInit() {
    const priceEl = document.querySelector("p.price");
    priceEl.style.marginBottom = "0";
    const isSale = priceEl.querySelectorAll(".woocommerce-Price-amount").length > 1;

    let buttonDiv = document.createElement("div");
    buttonDiv.id = "br-ext-price-buttons";
    priceEl.after(buttonDiv);

    let priceButton = document.createElement("button");
    priceButton.id = `br-ext-start-sale`;
    priceButton.className = `br-ext`;

    if (isSale) {
        priceButton.innerText = "End Sale";

        priceButton.onclick = () => editProduct("removeSale", {});
    }
    else {
        const price = getPrice();
        priceButton.innerText = "Start Sale";
        priceButton.onclick = () => openForm("sale");

        // Create the sale form so the admin can set the sale price on the product detail page
        // We don't use a form element because we are not posting data in a normal way
        let saleForm = document.createElement("div");
        saleForm.id = "br-ext-sale-form";
        saleForm.className = "br-ext br-ext-form";
        saleForm.style.display = "none";

        // Create the sale input
        let saleInput = document.createElement("input");
        saleInput.id = "br-ext-sale-input";
        saleInput.className = "br-ext";
        saleInput.type = "number";
        saleInput.min = "1";
        saleInput.max = `${price - 1}`;
        saleInput.placeholder = "Sale Price"
        saleInput.oninput = validateSale;
        saleForm.appendChild(saleInput);

        // Create the submit button
        let saleSubmit = document.createElement("button");
        saleSubmit.id = "br-ext-sale-submit";
        saleSubmit.className = "br-ext";
        saleSubmit.innerText = "Submit";
        saleSubmit.disabled = true;
        saleSubmit.onclick = () => editProduct("setSale", { price: parseFloat(document.getElementById("br-ext-sale-input").value) });
        saleForm.appendChild(saleSubmit);

        // Create the cancel button
        let saleCancel = document.createElement("button");
        saleCancel.id = "br-ext-sale-cancel";
        saleCancel.className = "br-ext cancel";
        saleCancel.innerText = "Cancel";
        saleCancel.onclick = cancelPriceEdit;
        saleForm.appendChild(saleCancel);

        // Create the input feedback element
        let saleFeedback = document.createElement("div");
        saleFeedback.id = "br-ext-sale-feedback";
        saleFeedback.className = "br-ext feedback";
        
        priceEl.after(saleFeedback);
        priceEl.after(saleForm);
    }
    buttonDiv.appendChild(priceButton);

    // Add the "Edit Price" button for items not on sale
    if (!isSale) {
        editPriceButtonInit();
    }
}


if (window.location.href.includes("/product/")) {
    saleButtonInit();
}
