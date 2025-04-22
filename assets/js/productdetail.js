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
    let priceEl = document.querySelector(".summary .price bdi");
    if (priceEl) {
        return parseFloat(priceEl.innerText.replace("€", ""));
    }
    return null;
}


// Hides the price options, and shows a specific form
function openForm(formType) {
    let buttonDiv = document.getElementById("br-ext-price-buttons");

    // Only open the form if no other form is selected
    if (buttonDiv.style.display !== "none") {
        let form = document.getElementById(`br-ext-${formType}-form`);
        let feedback = document.getElementById(`br-ext-${formType}-feedback`);
    
        buttonDiv.style.display = "none";
        form.style.display = "flex";
        feedback.style.display = "block";
    
        // Hide the title when editing it
        if (formType === "name") {
            let nameEl = document.querySelector(".summary>.product_title");
            if (nameEl) {
                nameEl.style.display = "none";
            }
        }
        // Hide the price when editing it
        else if (formType === "price") {
            let priceEl = document.querySelector(".woocommerce-Price-amount.amount");
            if (priceEl) {
                priceEl.style.display = "none";
            }
        }
    }
}


function validate(form, options={}) {
    let feedback = "";
    form.input.classList.remove("invalid");
    const isNumber = ("min" in options || "max" in options);
    const val = isNumber ? parseFloat(form.input.value) : form.input.value;

    if (!("required" in options && !options.required) && (val === "" || (isNumber && isNaN(val)))) {
        feedback = "Please enter a value";
    }
    else if ("min" in options && val < options.min) {
        feedback = "Value must be at least " + options.min;
    }
    else if ("max" in options && val > options.max) {
        feedback = "Value must be no more than " + options.max;
    }
    form.submit.disabled = feedback !== "";
    form.feedback.innerText = feedback;
    if (feedback) {
        form.input.classList.add("invalid");
    }
}


// Returns the "Start Sale" button and hides the form
function cancelPriceEdit() {
    // Hide all price forms
    const forms = ["name", "sale", "price"];
    for (let f of forms) {
        let form = document.getElementById(`br-ext-${f}-form`);
        let feedback = document.getElementById(`br-ext-${f}-feedback`);

        if (form) {
            form.style.display = "none";
            feedback.style.display = "none";
        }
    }
    let buttonDiv = document.getElementById("br-ext-price-buttons");
    buttonDiv.style.display = "flex";
    let priceEl = document.querySelector(".woocommerce-Price-amount.amount");
    if (priceEl) {
        priceEl.style.display = "inline";
    }
    let nameEl = document.querySelector(".summary>.product_title");
    if (nameEl) {
        nameEl.style.display = "inline";
    }
}


function editPriceButtonInit() {
    const buttonDiv = document.getElementById("br-ext-price-buttons");
    let price = getPrice() || "";

    let priceButton = document.createElement("button");
    priceButton.id = `br-ext-edit-price`;
    priceButton.className = `br-ext`;
    priceButton.innerText = price ? "Edit Price" : "Set Price";
    priceButton.onclick = () => openForm("price");

    buttonDiv.appendChild(priceButton);

    // Create the price form
    let { form, input, submit, cancel, feedback } = createInlineForm("price");
    input.type = "number";
    input.min = "1";
    input.value = price;
    input.oninput = () => validate(
        { form, input, submit, feedback },
        { min: 1, required: false }
    );
    
    submit.onclick = () => editProduct("updatePrice", { price: parseFloat(document.getElementById("br-ext-price-input").value) });
    cancel.onclick = cancelPriceEdit;

    const priceEl = document.querySelector(".summary .price");
    if (priceEl) {
        priceEl.appendChild(form);
        priceEl.appendChild(feedback);
    }
}


// Creates a sale button under the price display
function saleButtonInit() {
    const buttonDiv = document.getElementById("br-ext-price-buttons");
    let priceButton = document.createElement("button");
    priceButton.id = `br-ext-start-sale`;
    priceButton.className = `br-ext`;

    const isSale = document.querySelectorAll(".summary .woocommerce-Price-amount").length > 1;
    if (isSale) {
        priceButton.innerText = "End Sale";
        priceButton.onclick = () => editProduct("removeSale", {});
    }
    else {
        const price = getPrice();
        priceButton.innerText = "Start Sale";
        priceButton.onclick = () => openForm("sale");

        let { form, input, submit, cancel, feedback } = createInlineForm("sale");
        input.type = "number";
        input.min = "1";
        input.max = `${price - 1}`;
        input.placeholder = "Sale Price";
        input.oninput = () => validate(
            { form, input, submit, feedback },
            { min: 1, max: price - 1 }
        );

        submit.onclick = () => editProduct("setSale", { price: parseFloat(document.getElementById("br-ext-sale-input").value) });
        cancel.onclick = cancelPriceEdit;
        
        buttonDiv.after(feedback);
        buttonDiv.after(form);
    }
    buttonDiv.appendChild(priceButton);

    // Add the "Edit Price" button for items not on sale
    if (!isSale) {
        editPriceButtonInit();
    }
}


function editNameInit() {
    let title = document.querySelector(".summary>.product_title");
    let { form, input, submit, cancel, feedback } = createInlineForm("name");

    input.type = "text";
    input.value = title.innerText;

    input.oninput = () => validate(
        { form, input, submit, feedback },
        {  }
    );
    submit.onclick = () => editProduct("editName", { name: document.getElementById("br-ext-name-input").value })

    cancel.onclick = cancelPriceEdit;
    title.after(feedback);
    title.after(form);
    
    title.onclick = () => openForm("name");
}


// Creates an inline form element with an input, a submit and a cancel button
function createInlineForm(formType) {
    // We don't use a form element because we are not posting data in a normal way
    let form = document.createElement("div");
    form.id = `br-ext-${formType}-form`;
    form.className = "br-ext br-ext-form";
    form.style.display = "none";

    // Create the sale input
    let input = document.createElement("input");
    input.id = `br-ext-${formType}-input`;
    input.className = "br-ext";
    form.appendChild(input);

    // Create the submit button
    let submit = document.createElement("button");
    submit.id = `br-ext-${formType}-submit`;
    submit.className = "br-ext";
    submit.innerText = "Submit";
    submit.disabled = true;
    form.appendChild(submit);

    // Create the cancel button
    let cancel = document.createElement("button");
    cancel.id = `br-ext-${formType}-cancel`;
    cancel.className = "br-ext cancel";
    cancel.innerText = "Cancel";
    form.appendChild(cancel);

    // Create the input feedback element
    let feedback = document.createElement("div");
    feedback.id = `br-ext-${formType}-feedback`;
    feedback.className = "br-ext feedback";

    return { form, input, submit, cancel, feedback };
}


function optionsInit() {
    // Replace the Enquiry button with the product options
    let optionsDiv = document.querySelector(".woocommerce-catalog-enquiry-btn");
    
    let option = document.createElement("div");
    option.id = "br-ext-product-options";

    let editButton = document.createElement("a");
    editButton.innerText = "Edit Product";
    const productId = document.getElementById("product-id-for-enquiry").value;
    editButton.href = `/wp-admin/post.php?post=${productId}&action=edit`;
    option.appendChild(editButton);

    let deleteButton = document.createElement("a");
    deleteButton.role = "button";
    deleteButton.id = "br-ext-product-delete";
    deleteButton.innerText = "Delete Product";
    const deleteModalOptions = {
        header: "Delete Product",
        body: "Are you sure you want to delete this product?",
        action: () => editProduct("deleteProduct", {})
    };
    deleteButton.onclick = () => showModal(deleteModalOptions);
    option.appendChild(deleteButton);

    optionsDiv.after(option);
    optionsDiv.remove();
}


// Copies the SKU to the clipboard
function copySku() {
    let sku = document.querySelector(".sku_wrapper>.sku");
    navigator.clipboard.writeText(sku.innerText.trim());

    if (!document.getElementById("br-ext-copied-sku")) {
        let note = document.createElement("small");
        note.id = "br-ext-copied-sku";
        note.innerText = "Copied to clipboard!";

        // Start a fade out after 3 seconds
        setTimeout(() => note.style.opacity = "0", 3000);

        // Remove the notification after it has faded out
        note.addEventListener("transitionend", () => note.remove());
        sku.after(note);
    }
}


if (window.location.href.includes("/product/")) {
    // Add the ability to copy the SKU on click
    const sku = document.querySelector(".sku");
    if (sku) {
        sku.addEventListener("click", copySku);
    }

    // Add the sale button div below the price
    const priceEl = document.querySelector(".summary .price");
    priceEl.style.marginBottom = "0";

    let buttonDiv = document.createElement("div");
    buttonDiv.id = "br-ext-price-buttons";
    priceEl.after(buttonDiv);

    // You can only start a sale if an original price exists
    if (getPrice() !== null) {
        saleButtonInit();
    }
    else {
        editPriceButtonInit();
    }
    optionsInit();
    editNameInit();
}
