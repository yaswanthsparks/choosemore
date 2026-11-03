const breadcrumb = document.querySelector(".breadcrumbs ol");
const productPage = window.location.pathname.endsWith("/products.html");
const homePage = window.location.pathname.endsWith("/index.html") || window.location.pathname === "/";
const homeSections = ["products", "tools", "accessories"];

function renderBreadcrumb(entries) {
  breadcrumb.replaceChildren();

  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    const isCurrent = index === entries.length - 1;
    const part = entry.href && !isCurrent
      ? document.createElement("a")
      : document.createElement("span");
    part.textContent = entry.label;
    if (entry.href && !isCurrent) {
      part.href = entry.href;
    }
    if (isCurrent) {
      part.setAttribute("aria-current", "page");
    }
    item.append(part);
    breadcrumb.append(item);
  });
}

function updateHomeSectionView(hash) {
  if (!homePage) {
    return;
  }

  const selectedSection = homeSections.includes(hash) ? hash : null;
  document.querySelectorAll("main > *").forEach((section) => {
    const isSelected = section.id === selectedSection;
    const isHomeContent = section.matches(".product-intro, .directory-section");
    if (isHomeContent) {
      section.hidden = selectedSection
        ? !isSelected
        : section.matches(".directory-section");
    }
  });

  if (selectedSection) {
    window.scrollTo(0, 0);
  }
}

function updateProductCategoryView(selectedItem) {
  if (!productPage) {
    return;
  }

  const selectedCategory = selectedItem?.closest(".card");
  const categoryCards = document.querySelectorAll("main > .grid > .card");
  categoryCards.forEach((card) => {
    card.hidden = Boolean(selectedCategory && card !== selectedCategory);
  });

  const intro = document.querySelector("main > .intro");
  const source = document.querySelector("main > .source");
  if (intro) {
    intro.hidden = Boolean(selectedCategory);
  }
  if (source) {
    source.hidden = Boolean(selectedCategory);
  }
}

function updateBreadcrumb() {
  const hash = window.location.hash.slice(1);
  updateHomeSectionView(hash);
  const selectedItem = hash ? document.getElementById(decodeURIComponent(hash)) : null;
  updateProductCategoryView(selectedItem);
  const category = selectedItem?.closest(".card, .product-card");

  if (category) {
    const categoryName = category.querySelector("h2")?.textContent.trim();
    const entries = [
      { label: "Home", href: "index.html" },
      { label: "Help Center", href: "products.html" }
    ];
    entries.push({ label: categoryName, href: `products.html#${category.id}` });

    const itemName = selectedItem !== category ? selectedItem.textContent.trim() : "";
    if (itemName) {
      entries.push({ label: itemName });
    }
    renderBreadcrumb(entries);
    return;
  }

  const menuLabels = {
    products: "Product Help",
    tools: "Order Help",
    accessories: "Service Help",
    "sign-in": "Account"
  };
  const menuLabel = menuLabels[hash];
  if (menuLabel) {
    renderBreadcrumb([
      { label: "Home", href: "index.html" },
      { label: menuLabel }
    ]);
    return;
  }

  const pageLabel = productPage
    ? "Help Center"
    : window.location.pathname.endsWith("/about.html")
      ? "About"
      : window.location.pathname.endsWith("/contact.html")
        ? "Contact Support"
        : window.location.pathname.endsWith("/signin.html")
          ? "Account"
      : null;

  renderBreadcrumb(pageLabel
    ? [{ label: "Home", href: "index.html" }, { label: pageLabel }]
    : [{ label: "Home" }]);
}

if (productPage && window.location.hash) {
  window.scrollTo(0, 0);
}

function showCategoryPath(details) {
  const categoryName = details.querySelector("summary").textContent.trim();
  const categoryIds = {
    Electronics: "electronics",
    Electrical: "electrical",
    Hardware: "hardware",
    "Safety & Security": "safety-security",
    "Health & Medical": "health-medical",
    Others: "others"
  };
  const entries = [
    { label: "Home", href: "index.html" },
    { label: "Help Center", href: "products.html" }
  ];
  entries.push({
    label: categoryName,
    href: `products.html#${categoryIds[categoryName]}`
  });
  renderBreadcrumb(entries);
}

window.addEventListener("hashchange", updateBreadcrumb);
window.addEventListener("popstate", updateBreadcrumb);
document.addEventListener("click", (event) => {
  const link = event.target instanceof Element
    ? event.target.closest("a[href]")
    : null;
  if (!link) {
    return;
  }

  const destination = new URL(link.href);
  if (homePage
      && destination.pathname === window.location.pathname
      && homeSections.includes(destination.hash.slice(1))) {
    event.preventDefault();
    window.history.pushState(null, "", destination.hash);
    updateBreadcrumb();
    window.scrollTo(0, 0);
    return;
  }

  if (!productPage || destination.pathname !== window.location.pathname || !destination.hash) {
    return;
  }

  const targetId = decodeURIComponent(destination.hash.slice(1));
  if (!document.getElementById(targetId)) {
    return;
  }

  event.preventDefault();
  window.history.pushState(null, "", destination.hash);
  updateBreadcrumb();
});
updateBreadcrumb();
if (homePage && homeSections.includes(window.location.hash.slice(1))) {
  window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, 0));
    });
  }, { once: true });
}
