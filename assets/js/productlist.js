function iterateProducts() {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;

  let iterationData = {
    iteration: true,
    page: 1,
    index: 0,
  }
  let skuData = {
    OD: 0,
    BD: 0,
    SS: 0,
    FT: 0,
    PD: 0,
    AC: 0,

    EC: 0,
    CC: 0,
    MC: 0,
    ST: 0,
    DC: 0,
    SF: 0,

    TS: 0,
    FC: 0,
    LK: 0,

    CN: 0,
    MT: 0,
    CF: 0,

    RC: 0,
    SO: 0,
    CT: 0,
    CS: 0,

    FS: 0,
    MB: 0,
    TT: 0,
    WM: 0,
    SU: 0,

    KC: 0,
    KT: 0,
    OF: 0,
  }

  extAPI.storage.local.set({ sharkTradingData: iterationData, sharkTradingSkuData: skuData }, () => {
    iterationStep();
  });
}

function iterationStep() {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;
  extAPI.storage.local.get("sharkTradingData", (result) => {
    let { index, page } = result.sharkTradingData;

    let nextProduct = document.querySelector("tbody#the-list").children[index];
    // The number after the element id "post-<NUMBER>" is the product id
    const productId = nextProduct.id.split("-")[1];

    index++;
    if (index >= document.querySelector("tbody#the-list").children.length) {
      index = 0;
      page++;
    }
    
    const totalPages = parseInt(document.querySelector("span.total-pages").innerText.trim());
    if (page <= totalPages) {
      const newData = { ...result.sharkTradingData, index, page }

      extAPI.storage.local.set({ sharkTradingData: newData }, () => {
        window.location = `https://sharktrading.ie/wp-admin/post.php?post=${productId}&action=edit`;
      });
    }
    else {
      extAPI.storage.local.set({ sharkTradingData: {} });
      console.log("Iteration complete!");
    }
  });
}

if (window.location.href.includes("/wp-admin/edit.php?post_type=product")) {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;
  extAPI.storage.local.get("sharkTradingData", (result) => {
    if ("sharkTradingData" in result && "iteration" in result.sharkTradingData) {
      iterationStep();
    }
    else {
      let iterateButton = document.createElement("a");
      iterateButton.role = "button";
      iterateButton.onclick = iterateProducts;
      iterateButton.innerText = "Start Iteration";

      document.querySelector("h1.wp-heading-inline").after(iterateButton);
    }
  });
}
