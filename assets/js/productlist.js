function iterateProducts() {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;

  let iterationData = {
    iteration: true,
    page: 1,
    index: 0,
  }

  extAPI.storage.local.set({ sharkTradingData: iterationData }, () => {
    iterationStep();
  });
}

function iterationStep() {
  const extAPI = typeof browser !== "undefined" ? browser : chrome;
  extAPI.storage.local.get("sharkTradingData", (result) => {
    let { index, page } = result.sharkTradingData;
    const totalPages = parseInt(document.querySelector("span.total-pages").innerText.trim());

    if (page <= totalPages) {
      let nextProduct = document.querySelector("tbody#the-list").children[index];
      // The number after the element id "post-<NUMBER>" is the product id
      const productId = nextProduct.id.split("-")[1];

      index++;
      if (index >= document.querySelector("tbody#the-list").children.length) {
        index = 0;
        page++;
      }
    
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
