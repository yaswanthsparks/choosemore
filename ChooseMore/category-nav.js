const categorySlugs = new Map([
  ["Men's Fashion", "mens-fashion"],
  ["Women's Fashion", "womens-fashion"],
  ["Home & Kitchen", "home-kitchen"],
  ["Kid's Fashion", "kids-fashion"],
  ["Beauty & Health", "beauty-health"],
  ["Automotives", "automotives"],
  ["Mobile Accessories", "mobile-accessories"],
  ["Electronics", "electronics"],
  ["Sports & Fitness", "sports-fitness"],
  ["Computers & Gaming", "computers-gaming"],
  ["Books", "books"],
  ["Hobbies", "hobbies"]
]);

const activeCategory = new URLSearchParams(window.location.search).get("category");
const isCatalogPage = window.location.pathname.endsWith("/products.html");

document.querySelectorAll(".category-list li").forEach((item) => {
  const label = item.textContent.trim();
  const slug = categorySlugs.get(label);
  if (!slug) {
    return;
  }

  const link = document.createElement("a");
  link.href = `products.html?category=${slug}#catalog`;
  link.textContent = label;
  if (isCatalogPage && activeCategory === slug) {
    link.setAttribute("aria-current", "page");
  }
  item.replaceChildren(link);
});
