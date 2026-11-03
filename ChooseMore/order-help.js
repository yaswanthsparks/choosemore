const enquiryProducts = window.BuyMoreProducts || [];
const productSelect = document.querySelector("[data-enquiry-product]");
const productDetails = document.querySelector("[data-enquiry-details]");
const enquiryForm = document.querySelector("[data-order-enquiry]");
const enquiryStatus = document.querySelector("[data-enquiry-status]");
const requestedProduct = new URLSearchParams(window.location.search).get("product");

function renderEnquiryProduct(product) {
  productDetails.replaceChildren();
  if (!product) {
    const placeholder = document.createElement("p");
    placeholder.className = "order-detail-placeholder";
    placeholder.textContent = "Choose a product to see its sample description and specifications.";
    productDetails.append(placeholder);
    return;
  }

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;
  const title = document.createElement("h3");
  title.textContent = product.name;
  const description = document.createElement("p");
  description.className = "order-product-description";
  description.textContent = product.description;
  const price = document.createElement("p");
  price.className = "order-product-price";
  price.textContent = `Illustrative sample price: ₹${product.price.toLocaleString("en-IN")}`;

  const heading = document.createElement("h4");
  heading.textContent = "Sample specifications";
  const artwork = window.BuyMoreCreateArtwork(product);
  const list = document.createElement("dl");
  list.className = "spec-list";
  product.specs.slice(0, 1).forEach(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = value;
    row.append(term, detail);
    list.append(row);
  });
  productDetails.append(artwork, category, title, description, price, heading, list);
}

if (productSelect && productDetails && enquiryForm && enquiryStatus) {
  function populateProductOptions(selectedId) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a sample product";
    productSelect.replaceChildren(placeholder);
    enquiryProducts.forEach((product) => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = `${product.name} — ${product.category} (sample)`;
      productSelect.append(option);
    });
    productSelect.value = enquiryProducts.some((product) => product.id === selectedId)
      ? selectedId
      : "";
  }

  populateProductOptions(requestedProduct);
  renderEnquiryProduct(enquiryProducts.find((product) => product.id === productSelect.value));
  if (window.CHOOSEMORE_READ_ONLY) {
    const submitButton = enquiryForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    enquiryStatus.textContent = "Enquiries are disabled in this read-only public preview.";
  }
  document.addEventListener("choosemore-catalog-updated", () => {
    const selectedId = productSelect.value || requestedProduct;
    populateProductOptions(selectedId);
    renderEnquiryProduct(enquiryProducts.find((product) => product.id === productSelect.value));
  });

  productSelect.addEventListener("change", () => {
    renderEnquiryProduct(enquiryProducts.find((product) => product.id === productSelect.value));
    enquiryStatus.textContent = "";
    const url = new URL(window.location.href);
    if (productSelect.value) {
      url.searchParams.set("product", productSelect.value);
    } else {
      url.searchParams.delete("product");
    }
    window.history.replaceState(null, "", url);
  });

  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (window.CHOOSEMORE_READ_ONLY) {
      enquiryStatus.textContent = "Enquiries are disabled in this read-only public preview.";
      return;
    }
    const formData = new FormData(enquiryForm);
    const product = enquiryProducts.find((item) => item.id === formData.get("product"));
    if (!product) {
      enquiryStatus.textContent = "Choose a sample product before reviewing the enquiry.";
      productSelect.focus();
      return;
    }

    const submitButton = enquiryForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    if (window.location.hostname.endsWith(".github.io")) {
      enquiryStatus.textContent = "This hosted preview does not send or store enquiries. Run the local ChooseMore server to test the local API preview.";
      submitButton.disabled = false;
      return;
    }
    enquiryStatus.textContent = "Sending this sample enquiry to the local preview API…";
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          reason: formData.get("reason"),
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
          orderReference: formData.get("order-reference")
        })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "The local API rejected the preview.");
      }
      enquiryStatus.textContent = result.message;
    } catch (error) {
      enquiryStatus.textContent = `The local API could not accept this preview. Start the server with npm.cmd start and try again. ${error.message}`;
    } finally {
      submitButton.disabled = false;
    }
  });
}
