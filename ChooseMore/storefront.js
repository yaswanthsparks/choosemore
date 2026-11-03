const categories = [
  { slug: "mens-fashion", name: "Men's Fashion" },
  { slug: "womens-fashion", name: "Women's Fashion" },
  { slug: "home-kitchen", name: "Home & Kitchen" },
  { slug: "kids-fashion", name: "Kid's Fashion" },
  { slug: "beauty-health", name: "Beauty & Health" },
  { slug: "automotives", name: "Automotives" },
  { slug: "mobile-accessories", name: "Mobile Accessories" },
  { slug: "electronics", name: "Electronics" },
  { slug: "sports-fitness", name: "Sports & Fitness" },
  { slug: "computers-gaming", name: "Computers & Gaming" },
  { slug: "books", name: "Books" },
  { slug: "hobbies", name: "Hobbies" }
];

const savedProductsStorageKey = "buymore-saved-products-v1";
const savedCartStorageKey = "buymore-saved-cart-v1";
const savedCheckoutOrdersStorageKey = "buymore-checkout-orders-v1";
const savedTrackerTimestampStorageKey = "buymore-last-tracker-timestamp-v1";
const readOnlyPreview = window.CHOOSEMORE_READ_ONLY === true;
const maxProductImages = 10;
const maxProductImageFileBytes = 8 * 1024 * 1024;
const maxStoredProductImageBytes = 900 * 1024;
const maxProductImageDimension = 1600;
let productStorageWarning = "";

const products = [
  {
    id: "relaxed-cotton-tee",
    category: "Men's Fashion",
    categorySlug: "mens-fashion",
    name: "Relaxed cotton tee",
    description: "An easy everyday layer with a relaxed shape and a clean, versatile finish.",
    price: 799,
    art: "tee",
    color: "#b8c5f6",
    specs: [["Fabric", "Cotton blend (sample)"]]
  },
  {
    id: "textured-everyday-tote",
    category: "Women's Fashion",
    categorySlug: "womens-fashion",
    name: "Textured everyday tote",
    description: "A roomy, simple carryall illustrated here as an original ChooseMore sample.",
    price: 899,
    art: "tote",
    color: "#f0c6a9",
    specs: [["Material", "Woven fabric (sample)"]]
  },
  {
    id: "stoneware-serving-set",
    category: "Home & Kitchen",
    categorySlug: "home-kitchen",
    name: "Stoneware serving set",
    description: "A small coordinated set for relaxed meals and everyday table settings.",
    price: 1299,
    art: "bowls",
    color: "#b7d8ca",
    specs: [["Material", "Stoneware (sample)"]]
  },
  {
    id: "mini-daypack",
    category: "Kid's Fashion",
    categorySlug: "kids-fashion",
    name: "Mini daypack",
    description: "A compact sample backpack with a practical shape for small everyday essentials.",
    price: 999,
    art: "backpack",
    color: "#f1d683",
    specs: [["Material", "Polyester (sample)"]]
  },
  {
    id: "daily-care-set",
    category: "Beauty & Health",
    categorySlug: "beauty-health",
    name: "Daily care starter set",
    description: "A simple sample collection of reusable personal-care accessories.",
    price: 649,
    art: "bottle",
    color: "#d8bee5",
    specs: [["Pieces", "Three accessories (sample)"]]
  },
  {
    id: "compact-car-organizer",
    category: "Automotives",
    categorySlug: "automotives",
    name: "Compact car organizer",
    description: "A foldable storage accessory, shown as a sample for keeping small items together.",
    price: 599,
    art: "car",
    color: "#c5d5e8",
    specs: [["Material", "Textile shell (sample)"]]
  },
  {
    id: "braided-charging-cable",
    category: "Mobile Accessories",
    categorySlug: "mobile-accessories",
    name: "Braided charging cable",
    description: "A sample 1.5 m braided cable. Check device compatibility before choosing a real cable.",
    price: 299,
    art: "phone",
    color: "#f0b5b1",
    specs: [["Length", "1.5 m (sample)"]]
  },
  {
    id: "foldable-desk-light",
    category: "Electronics",
    categorySlug: "electronics",
    name: "Foldable desk light",
    description: "A compact adjustable-light concept for a reading or work surface.",
    price: 1199,
    art: "lamp",
    color: "#efd4a1",
    specs: [["Power", "USB (sample)"]]
  },
  {
    id: "everyday-yoga-mat",
    category: "Sports & Fitness",
    categorySlug: "sports-fitness",
    name: "Everyday yoga mat",
    description: "A simple practice mat sample with a smooth, easy-to-roll silhouette.",
    price: 899,
    art: "dumbbell",
    color: "#a9d2d3",
    specs: [["Thickness", "6 mm (sample)"]]
  },
  {
    id: "wireless-keyboard",
    category: "Computers & Gaming",
    categorySlug: "computers-gaming",
    name: "Wireless keyboard",
    description: "A clean desk companion sample with a compact layout and wireless concept.",
    price: 1499,
    art: "keyboard",
    color: "#c2c8e8",
    specs: [["Layout", "Compact (sample)"]]
  },
  {
    id: "hardcover-notebook",
    category: "Books",
    categorySlug: "books",
    name: "Hardcover notebook",
    description: "A sturdy, everyday notebook sample for lists, notes, and ideas.",
    price: 449,
    art: "book",
    color: "#efb9a2",
    specs: [["Pages", "160 (sample)"]]
  },
  {
    id: "sketching-kit",
    category: "Hobbies",
    categorySlug: "hobbies",
    name: "Sketching kit",
    description: "A starter set concept for quick sketches, notes, and creative experiments.",
    price: 549,
    art: "palette",
    color: "#c2d5a5",
    specs: [["Pieces", "12 (sample)"]]
  }
];

function isValidSavedProduct(product) {
  const category = categories.find((entry) => entry.slug === product?.categorySlug);
  const imageDataUrls = product?.imageDataUrls !== undefined
    ? product.imageDataUrls
    : product?.imageDataUrl === undefined ? [] : [product.imageDataUrl];
  const validImages = Array.isArray(imageDataUrls)
    && imageDataUrls.length <= maxProductImages
    && imageDataUrls.every((image) => typeof image === "string"
      && /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/]+=*$/i.test(image));
  return product
    && typeof product.id === "string"
    && typeof product.name === "string"
    && typeof product.description === "string"
    && Number.isSafeInteger(product.price)
    && product.price > 0
    && (product.stockCount === undefined
      || (Number.isSafeInteger(product.stockCount) && product.stockCount >= 0))
    && category
    && product.category === category.name
    && typeof product.art === "string"
    && typeof product.color === "string"
    && Array.isArray(product.specs)
    && product.specs.length === 1
    && Array.isArray(product.specs[0])
    && product.specs[0].length === 2
    && product.specs[0].every((value) => typeof value === "string" && value.trim())
    && validImages;
}

function mergeSavedProducts(baseProducts) {
  productStorageWarning = "";
  try {
    const stored = window.localStorage.getItem(savedProductsStorageKey);
    if (stored === null) {
      return baseProducts;
    }

    const savedProducts = JSON.parse(stored);
    if (!Array.isArray(savedProducts) || !savedProducts.every(isValidSavedProduct)) {
      throw new Error("Saved product data has an invalid format.");
    }

    const merged = new Map(baseProducts.map((product) => [product.id, product]));
    savedProducts.forEach((product) => {
      const { imageDataUrl, ...savedProduct } = product;
      merged.set(product.id, {
        ...savedProduct,
        stockCount: product.stockCount ?? 1,
        imageDataUrls: productImageDataUrls(product)
      });
    });
    return Array.from(merged.values());
  } catch (error) {
    productStorageWarning = "Saved product changes could not be loaded from this browser.";
    console.error("Could not load saved ChooseMore product data:", error.message);
    return baseProducts;
  }
}

function saveProductCatalog() {
  if (readOnlyPreview) {
    return false;
  }

  try {
    window.localStorage.setItem(savedProductsStorageKey, JSON.stringify(products));
    productStorageWarning = "";
    return true;
  } catch (error) {
    productStorageWarning = "Product changes could not be saved in this browser.";
    if (error.name === "QuotaExceededError") {
      productStorageWarning = "Browser storage is full. Choose a smaller image or remove an old saved item, then try again.";
    }
    console.error("Could not save ChooseMore product data:", error.message);
    return false;
  }
}

function productStockCount(product) {
  return product.stockCount ?? 1;
}

function productImageDataUrls(product) {
  if (Array.isArray(product.imageDataUrls)) {
    return product.imageDataUrls;
  }
  return typeof product.imageDataUrl === "string" ? [product.imageDataUrl] : [];
}

function productForTransfer(product) {
  const exportedProduct = {
    id: product.id,
    category: product.category,
    categorySlug: product.categorySlug,
    name: product.name,
    description: product.description,
    price: product.price,
    stockCount: productStockCount(product),
    art: product.art,
    color: product.color,
    specs: product.specs.map(([name, value]) => [name, value])
  };
  const imageDataUrls = productImageDataUrls(product);
  if (imageDataUrls.length) {
    exportedProduct.imageDataUrls = [...imageDataUrls];
  }
  return exportedProduct;
}

function validateImportedProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    throw new Error("Every catalog entry must be a product object.");
  }
  const category = categories.find((entry) => entry.slug === product.categorySlug);
  if (typeof product.id !== "string"
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.id)
      || product.id.length > 120
      || !category
      || product.category !== category.name
      || typeof product.name !== "string"
      || !product.name.trim()
      || product.name.length > 80
      || typeof product.description !== "string"
      || !product.description.trim()
      || product.description.length > 240
      || !Number.isSafeInteger(product.price)
      || product.price < 1
      || (product.stockCount !== undefined
        && (!Number.isSafeInteger(product.stockCount) || product.stockCount < 0))
      || typeof product.art !== "string"
      || !Object.prototype.hasOwnProperty.call(artShapes, product.art)
      || typeof product.color !== "string"
      || !/^#[0-9a-f]{6}$/i.test(product.color)
      || !Array.isArray(product.specs)
      || product.specs.length !== 1
      || !Array.isArray(product.specs[0])
      || product.specs[0].length !== 2
      || typeof product.specs[0][0] !== "string"
      || !product.specs[0][0].trim()
      || product.specs[0][0].length > 32
      || typeof product.specs[0][1] !== "string"
      || !product.specs[0][1].trim()
      || product.specs[0][1].length > 80) {
    throw new Error("A product has missing or invalid fields. Use a ChooseMore catalog JSON export.");
  }

  const imageDataUrls = productImageDataUrls(product);
  if (imageDataUrls.length > maxProductImages
      || (product.imageDataUrls !== undefined && imageDataUrls.length === 0)
      || (product.imageDataUrls !== undefined && product.imageDataUrl !== undefined)) {
    throw new Error(`"${product.name}" must contain between 1 and ${maxProductImages} images.`);
  }
  for (const image of imageDataUrls) {
    const imageMatch = typeof image === "string"
      && /^data:image\/(png|jpeg|webp);base64,([a-z0-9+/]+={0,2})$/i.exec(image);
    if (!imageMatch || image.length > maxStoredProductImageBytes * 1.4) {
      throw new Error(`The image for "${product.name}" is invalid or too large.`);
    }
    let decodedLength;
    try {
      decodedLength = atob(imageMatch[2]).length;
    } catch {
      throw new Error(`The image for "${product.name}" is not valid base64 data.`);
    }
    if (decodedLength > maxStoredProductImageBytes) {
      throw new Error(`The image for "${product.name}" is larger than 900 KB.`);
    }
  }

  const importedProduct = {
    ...productForTransfer(product),
    stockCount: product.stockCount ?? 1
  };
  if (imageDataUrls.length) {
    importedProduct.imageDataUrls = [...imageDataUrls];
  }
  return importedProduct;
}

function readCatalogImport(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)
      || value.format !== "choosemore-catalog"
      || value.version !== 1
      || !Array.isArray(value.products)
      || value.products.length === 0
      || value.products.length > maxCatalogProducts) {
    throw new Error(`Choose a version 1 ChooseMore catalog JSON file containing 1–${maxCatalogProducts} products.`);
  }

  const importedProducts = value.products.map(validateImportedProduct);
  const ids = new Set();
  for (const product of importedProducts) {
    if (ids.has(product.id)) {
      throw new Error(`The backup contains the product ID "${product.id}" more than once.`);
    }
    ids.add(product.id);
  }
  return importedProducts;
}

function exportProductCatalog() {
  if (readOnlyPreview || !products.length) {
    return;
  }
  const backup = {
    format: "choosemore-catalog",
    version: 1,
    exportedAt: new Date().toISOString(),
    products: products.map(productForTransfer)
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `choosemore-catalog-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  if (transferStatus) {
    transferStatus.textContent = `Downloaded ${products.length} catalog products. The backup file stays on this device until you choose to share it.`;
  }
}

async function prepareCatalogImport(file) {
  if (readOnlyPreview || !file || !transferStatus || !importConfirmPanel || !importSummary) {
    return;
  }
  pendingCatalogImport = null;
  importConfirmPanel.hidden = true;
  transferStatus.textContent = "";
  if (file.size > maxCatalogImportBytes) {
    transferStatus.textContent = "That file is over 15 MB. Choose a smaller ChooseMore catalog backup.";
    return;
  }

  try {
    const backup = JSON.parse(await file.text());
    const importedProducts = readCatalogImport(backup);
    const currentIds = new Set(products.map((product) => product.id));
    let updatedCount = 0;
    for (const product of importedProducts) {
      if (currentIds.has(product.id)) {
        updatedCount += 1;
      }
    }
    pendingCatalogImport = importedProducts;
    importSummary.textContent =
      `Ready to import ${importedProducts.length} products: ${importedProducts.length - updatedCount} new and ${updatedCount} updates. Matching IDs will be replaced; all other current listings will remain.`;
    importConfirmPanel.hidden = false;
    transferStatus.textContent = `Validated ${file.name}. Nothing has been changed yet.`;
  } catch (error) {
    transferStatus.textContent = error instanceof SyntaxError
      ? "This file is not valid JSON. Choose a ChooseMore catalog backup."
      : error.message;
  }
}

function applyCatalogImport() {
  if (readOnlyPreview || !pendingCatalogImport || !transferStatus) {
    return;
  }
  const merged = new Map(products.map((product) => [product.id, product]));
  pendingCatalogImport.forEach((product) => merged.set(product.id, product));
  const importedCatalog = Array.from(merged.values());
  const previousProducts = products.map(productForTransfer);
  products.splice(0, products.length, ...importedCatalog);
  if (!saveProductCatalog()) {
    products.splice(0, products.length, ...previousProducts);
    transferStatus.textContent = productStorageWarning;
    return;
  }

  const importedCount = importedCatalog.length;
  pendingCatalogImport = null;
  importConfirmPanel.hidden = true;
  if (importCatalogInput) {
    importCatalogInput.value = "";
  }
  renderCatalog();
  renderFeatured();
  renderCart();
  document.dispatchEvent(new Event("choosemore-catalog-updated"));
  transferStatus.textContent = `Imported ${importedCount} products into this browser. They are still local and have not been saved to the project or GitHub.`;
}

if (!readOnlyPreview) {
  products.splice(0, products.length, ...mergeSavedProducts(products));
}
products.forEach((product) => {
  product.stockCount ??= 1;
  product.imageDataUrls = productImageDataUrls(product);
});
window.BuyMoreProducts = products;

const artShapes = {
  tee: [
    ["path", { d: "M142 62 173 43 198 57 222 43 255 62 285 104 257 120 242 97 242 226 153 226 153 97 138 120 110 104Z", fill: "#263d76" }],
    ["path", { d: "M173 43Q185 68 198 57Q211 68 222 43", fill: "none", stroke: "#d9e0ff", "stroke-width": "5", "stroke-linecap": "round" }],
    ["path", { d: "M177 129h41", fill: "none", stroke: "#9bacf1", "stroke-width": "5", "stroke-linecap": "round" }]
  ],
  tote: [
    ["path", { d: "M150 111V93Q150 51 195 51T240 93v18", fill: "none", stroke: "#7a453d", "stroke-width": "15", "stroke-linecap": "round" }],
    ["path", { d: "M119 107h152l-12 118H132Z", fill: "#b56b58" }],
    ["path", { d: "M149 133v64M241 133v64", fill: "none", stroke: "#e5aa91", "stroke-width": "5" }]
  ],
  bowls: [
    ["path", { d: "M105 150q90 91 180 0z", fill: "#587d6b" }],
    ["ellipse", { cx: "195", cy: "148", rx: "92", ry: "23", fill: "#a5c5b6", stroke: "#456c5a", "stroke-width": "7" }],
    ["path", { d: "M142 117q53-41 106 0", fill: "none", stroke: "#7da18e", "stroke-width": "8", "stroke-linecap": "round" }],
    ["path", { d: "M151 213h88", fill: "none", stroke: "#456c5a", "stroke-width": "8", "stroke-linecap": "round" }]
  ],
  backpack: [
    ["path", { d: "M149 101V88q0-34 46-34t46 34v13", fill: "none", stroke: "#775d20", "stroke-width": "13" }],
    ["rect", { x: "118", y: "92", width: "154", height: "137", rx: "42", fill: "#c5962e" }],
    ["rect", { x: "148", y: "157", width: "94", height: "55", rx: "17", fill: "#e8c76d", stroke: "#775d20", "stroke-width": "6" }],
    ["path", { d: "M195 101v45", fill: "none", stroke: "#f3dfa0", "stroke-width": "6", "stroke-linecap": "round" }]
  ],
  bottle: [
    ["rect", { x: "171", y: "48", width: "48", height: "26", rx: "6", fill: "#66516f" }],
    ["path", { d: "M177 75h36v27q31 18 31 48v62q0 17-17 17h-64q-17 0-17-17v-62q0-30 31-48z", fill: "#a782b5" }],
    ["path", { d: "M160 148h72", fill: "none", stroke: "#e1cce8", "stroke-width": "8", "stroke-linecap": "round" }],
    ["circle", { cx: "195", cy: "177", r: "14", fill: "#d9bddf" }]
  ],
  car: [
    ["path", { d: "m117 159 14-47q6-19 27-19h75q21 0 29 20l18 46 12 16v38h-23q-4-25-30-25t-30 25h-52q-4-25-30-25t-30 25h-13v-38z", fill: "#52718f" }],
    ["path", { d: "m150 111-11 38h112l-15-39q-3-8-13-8h-59q-10 0-14 9z", fill: "#b7d0e7" }],
    ["circle", { cx: "157", cy: "210", r: "19", fill: "#293d50" }],
    ["circle", { cx: "259", cy: "210", r: "19", fill: "#293d50" }],
    ["circle", { cx: "157", cy: "210", r: "8", fill: "#c5d8e9" }],
    ["circle", { cx: "259", cy: "210", r: "8", fill: "#c5d8e9" }]
  ],
  phone: [
    ["rect", { x: "144", y: "35", width: "103", height: "207", rx: "24", fill: "#8e5353" }],
    ["rect", { x: "153", y: "53", width: "85", height: "163", rx: "14", fill: "#f3d9d4" }],
    ["circle", { cx: "195", cy: "229", r: "5", fill: "#e6b9b4" }],
    ["path", { d: "M103 182c25-25 46-25 69 0s46 25 69 0 42-25 58 0", fill: "none", stroke: "#d3837c", "stroke-width": "9", "stroke-linecap": "round" }]
  ],
  lamp: [
    ["path", { d: "M193 91 135 157M203 91l44 53", fill: "none", stroke: "#80602d", "stroke-width": "13", "stroke-linecap": "round" }],
    ["path", { d: "m155 58 89 0-18 50h-53z", fill: "#d6a64f" }],
    ["path", { d: "M237 147 272 194", fill: "none", stroke: "#80602d", "stroke-width": "13", "stroke-linecap": "round" }],
    ["path", { d: "M236 207h73", fill: "none", stroke: "#80602d", "stroke-width": "12", "stroke-linecap": "round" }],
    ["circle", { cx: "193", cy: "91", r: "9", fill: "#f4d28d" }]
  ],
  dumbbell: [
    ["rect", { x: "114", y: "137", width: "168", height: "26", rx: "13", fill: "#3d7478" }],
    ["rect", { x: "111", y: "104", width: "32", height: "92", rx: "12", fill: "#69a5a7" }],
    ["rect", { x: "253", y: "104", width: "32", height: "92", rx: "12", fill: "#69a5a7" }],
    ["rect", { x: "91", y: "117", width: "24", height: "66", rx: "9", fill: "#3d7478" }],
    ["rect", { x: "281", y: "117", width: "24", height: "66", rx: "9", fill: "#3d7478" }],
    ["path", { d: "M143 147h110", fill: "none", stroke: "#c8e3df", "stroke-width": "5" }]
  ],
  keyboard: [
    ["rect", { x: "93", y: "92", width: "204", height: "127", rx: "18", fill: "#596481" }],
    ["rect", { x: "107", y: "106", width: "176", height: "87", rx: "10", fill: "#aab4d6" }],
    ["path", { d: "M117 124h155M117 145h155M117 166h155", fill: "none", stroke: "#596481", "stroke-width": "7", "stroke-dasharray": "7 9", "stroke-linecap": "round" }],
    ["path", { d: "M145 205h99", fill: "none", stroke: "#dfe4f4", "stroke-width": "5", "stroke-linecap": "round" }]
  ],
  book: [
    ["path", { d: "M111 73q47-20 84 9v153q-37-29-84-9z", fill: "#ad624d" }],
    ["path", { d: "M279 73q-47-20-84 9v153q37-29 84-9z", fill: "#d18b70" }],
    ["path", { d: "M195 82v153", fill: "none", stroke: "#f2c3ad", "stroke-width": "8" }],
    ["path", { d: "M129 109q27-9 49 1M129 130q27-9 49 1M213 110q22-10 49-1M213 131q22-10 49-1", fill: "none", stroke: "#f4d3c4", "stroke-width": "5", "stroke-linecap": "round" }]
  ],
  palette: [
    ["path", { d: "M203 59c-62-8-112 35-112 91 0 50 36 83 82 83h18c17 0 27-16 20-30-7-13 0-27 17-27h18c35 0 57-23 57-53 0-34-37-57-100-64z", fill: "#758c53" }],
    ["circle", { cx: "144", cy: "113", r: "11", fill: "#e9c871" }],
    ["circle", { cx: "184", cy: "91", r: "10", fill: "#d88978" }],
    ["circle", { cx: "224", cy: "106", r: "10", fill: "#aac7a1" }],
    ["circle", { cx: "253", cy: "139", r: "10", fill: "#e8d8a1" }],
    ["path", { d: "M123 186c14 16 32 24 55 25", fill: "none", stroke: "#d4e0bb", "stroke-width": "7", "stroke-linecap": "round" }]
  ]
};

const cart = new Map();
let galleryRotationTimer = null;
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});
const productDialog = document.querySelector("[data-product-dialog]");
const productDetail = document.querySelector("[data-product-detail]");
const cartDialog = document.querySelector("[data-cart-dialog]");
const checkoutDialog = document.querySelector("[data-checkout-dialog]");
const productGrid = document.querySelector("[data-product-grid]");
const featuredGrid = document.querySelector("[data-featured-grid]");
const categorySelect = document.querySelector("[data-category-select]");
const searchInput = document.querySelector("[data-product-search]");
const sortSelect = document.querySelector("[data-product-sort]");
const addProductForm = document.querySelector("[data-add-product]");
const addItemPanel = document.querySelector("[data-add-item-panel]");
const catalogTransferPanel = document.querySelector("[data-catalog-transfer]");
const exportCatalogButton = document.querySelector("[data-export-catalog]");
const importCatalogInput = document.querySelector("[data-import-catalog]");
const transferStatus = document.querySelector("[data-transfer-status]");
const importConfirmPanel = document.querySelector("[data-import-confirm]");
const importSummary = document.querySelector("[data-import-summary]");
const confirmImportButton = document.querySelector("[data-confirm-import]");
const cancelImportButton = document.querySelector("[data-cancel-import]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");
const cartStatus = document.querySelector("[data-cart-status]");
const maxCatalogImportBytes = 15 * 1024 * 1024;
const maxCatalogProducts = 250;
let pendingCatalogImport = null;
const generatedTrackerIds = new Set();

function createSvgElement(tagName, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  return element;
}

function createArtwork(product) {
  const visual = document.createElement("div");
  const imageDataUrls = productImageDataUrls(product);
  if (imageDataUrls.length) {
    visual.className = imageDataUrls.length > 1
      ? "product-visual product-gallery"
      : "product-visual";
    visual.dataset.productId = product.id;
    visual.dataset.galleryIndex = "0";
    visual.setAttribute("role", "group");
    visual.setAttribute("aria-label", `${product.name} image gallery`);
    const image = document.createElement("img");
    image.src = imageDataUrls[0];
    image.alt = imageDataUrls.length > 1
      ? `${product.name}, image 1 of ${imageDataUrls.length}`
      : `Product image: ${product.name}`;
    image.width = 400;
    image.height = 300;
    visual.append(image);
    if (imageDataUrls.length > 1) {
      const previous = document.createElement("button");
      previous.type = "button";
      previous.className = "gallery-control gallery-previous";
      previous.dataset.galleryAction = "previous";
      previous.setAttribute("aria-label", `Previous image of ${product.name}`);
      previous.textContent = "‹";
      const next = document.createElement("button");
      next.type = "button";
      next.className = "gallery-control gallery-next";
      next.dataset.galleryAction = "next";
      next.setAttribute("aria-label", `Next image of ${product.name}`);
      next.textContent = "›";
      const position = document.createElement("span");
      position.className = "gallery-position";
      position.setAttribute("aria-live", "polite");
      position.setAttribute("aria-atomic", "true");
      position.textContent = `1 / ${imageDataUrls.length}`;
      visual.append(previous, next, position);
    }
    return visual;
  }

  visual.className = "product-visual";
  visual.setAttribute("role", "img");
  visual.setAttribute("aria-label", `Original sample illustration: ${product.name}`);

  const svg = createSvgElement("svg", {
    viewBox: "0 0 400 300",
    "aria-hidden": "true",
    focusable: "false"
  });
  svg.append(createSvgElement("rect", {
    x: "0",
    y: "0",
    width: "400",
    height: "300",
    rx: "20",
    fill: product.color
  }));
  svg.append(createSvgElement("circle", {
    cx: "321",
    cy: "66",
    r: "48",
    fill: "#ffffff",
    opacity: "0.28"
  }));
  svg.append(createSvgElement("ellipse", {
    cx: "198",
    cy: "239",
    rx: "94",
    ry: "13",
    fill: "#172033",
    opacity: "0.12"
  }));

  const shapes = artShapes[product.art] || [];
  shapes.forEach(([tagName, attributes]) => svg.append(createSvgElement(tagName, attributes)));
  visual.append(svg);
  return visual;
}

window.BuyMoreCreateArtwork = createArtwork;

function createButton(label, className, action, productId, ariaLabel) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.dataset.productAction = action;
  button.dataset.productId = productId;
  button.textContent = label;
  if (ariaLabel) {
    button.setAttribute("aria-label", ariaLabel);
  }
  return button;
}

function createPurchaseQuantityControl(product) {
  const control = document.createElement("div");
  control.className = "product-quantity-control";
  const label = document.createElement("label");
  label.className = "visually-hidden";
  label.textContent = `Quantity of ${product.name} to add to bag`;
  const input = document.createElement("input");
  const available = productStockCount(product);
  input.type = "number";
  input.min = "1";
  input.max = String(Math.max(available, 1));
  input.step = "1";
  input.value = available > 0 ? "1" : "0";
  input.disabled = available < 1;
  input.dataset.purchaseQuantity = "";
  input.dataset.productId = product.id;
  input.setAttribute("aria-label", `Quantity of ${product.name} to add to bag`);
  label.append(input);
  control.append(label);
  return control;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.productId = product.id;
  card.append(createArtwork(product));

  const content = document.createElement("div");
  content.className = "product-card-content";
  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;

  const title = document.createElement("h2");
  title.className = "product-card-title";
  title.textContent = product.name;

  const description = document.createElement("p");
  description.className = "product-card-description";
  description.textContent = product.description;

  const priceRow = document.createElement("div");
  priceRow.className = "product-price-row";
  const price = document.createElement("strong");
  price.textContent = currency.format(product.price);
  const sampleLabel = document.createElement("span");
  sampleLabel.textContent = "sample price";
  priceRow.append(price, sampleLabel);

  const specification = product.specs[0];
  const specSummary = document.createElement("p");
  specSummary.className = "product-card-spec";
  if (specification) {
    const specName = document.createElement("strong");
    specName.textContent = `${specification[0]}: `;
    const specValue = document.createElement("span");
    specValue.textContent = specification[1];
    specSummary.append(specName, specValue);
  }
  const itemCount = document.createElement("p");
  itemCount.className = "product-card-spec";
  itemCount.textContent = `Available stock: ${productStockCount(product)}`;

  const actions = document.createElement("div");
  actions.className = "product-card-actions";
  const addButton = createButton("Add to bag", "product-add-button", "add", product.id);
  if (productStockCount(product) < 1) {
    addButton.disabled = true;
    addButton.textContent = "Out of stock";
  }
  const purchaseStatus = document.createElement("p");
  purchaseStatus.className = "product-purchase-status";
  purchaseStatus.dataset.purchaseStatus = product.id;
  purchaseStatus.setAttribute("role", "status");
  purchaseStatus.setAttribute("aria-live", "polite");
  actions.append(createPurchaseQuantityControl(product));
  actions.append(purchaseStatus);
  actions.append(
    createButton("Details", "product-details-button", "details", product.id),
    addButton
  );
  content.append(category, title, description, specSummary, itemCount, priceRow, actions);
  card.append(content);
  return card;
}

function renderFeatured() {
  if (!featuredGrid) {
    return;
  }
  featuredGrid.replaceChildren(...products.map(createProductCard));
  startGalleryRotation();
}

function renderCatalog() {
  if (!productGrid) {
    return;
  }

  const selectedCategory = categorySelect?.value || "";
  const query = searchInput?.value.trim().toLocaleLowerCase() || "";
  const sort = sortSelect?.value || "featured";
  const filtered = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.categorySlug === selectedCategory;
    const searchable = `${product.name} ${product.description} ${product.category}`.toLocaleLowerCase();
    return matchesCategory && searchable.includes(query);
  });

  if (sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  productGrid.replaceChildren(...filtered.map(createProductCard));
  const resultCount = document.querySelector("[data-result-count]");
  if (resultCount) {
    resultCount.textContent = `${filtered.length} sample ${filtered.length === 1 ? "item" : "items"}`;
  }
  const emptyState = document.querySelector("[data-empty-state]");
  if (emptyState) {
    emptyState.hidden = filtered.length !== 0;
  }
  const breadcrumb = document.querySelector("[data-category-breadcrumb]");
  if (breadcrumb) {
    const category = categories.find((entry) => entry.slug === selectedCategory);
    breadcrumb.textContent = category ? category.name : "All products";
  }
  startGalleryRotation();
}

function syncCategoryLocation(categorySlug) {
  const url = new URL(window.location.href);
  if (categorySlug) {
    url.searchParams.set("category", categorySlug);
  } else {
    url.searchParams.delete("category");
  }
  url.hash = "catalog";
  window.history.replaceState(null, "", url);

  document.querySelectorAll(".category-list a").forEach((link) => {
    const linkCategory = new URL(link.href).searchParams.get("category");
    if (categorySlug && linkCategory === categorySlug) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

function showGalleryImage(gallery, direction) {
  const product = getProduct(gallery.dataset.productId);
  const imageDataUrls = product ? productImageDataUrls(product) : [];
  if (imageDataUrls.length < 2) {
    return;
  }
  const currentIndex = Number(gallery.dataset.galleryIndex) || 0;
  const nextIndex = (currentIndex + direction + imageDataUrls.length) % imageDataUrls.length;
  gallery.dataset.galleryIndex = String(nextIndex);
  const image = gallery.querySelector("img");
  if (image) {
    if (typeof image.getAnimations === "function") {
      image.getAnimations().forEach((animation) => animation.cancel());
    }
    image.src = imageDataUrls[nextIndex];
    image.alt = `${product.name}, image ${nextIndex + 1} of ${imageDataUrls.length}`;
    const reduceMotion = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && typeof image.animate === "function") {
      image.animate(
        [
          { transform: `translateX(${direction > 0 ? "100%" : "-100%"})` },
          { transform: "translateX(0)" }
        ],
        {
          duration: 280,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)"
        }
      );
    }
  }
  const position = gallery.querySelector(".gallery-position");
  if (position) {
    position.textContent = `${nextIndex + 1} / ${imageDataUrls.length}`;
  }
}

function startGalleryRotation() {
  if (galleryRotationTimer !== null) {
    window.clearInterval(galleryRotationTimer);
    galleryRotationTimer = null;
  }
  const reduceMotion = window.matchMedia
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    return;
  }
  const galleries = Array.from(document.querySelectorAll(".product-gallery"));
  if (galleries.length) {
    galleryRotationTimer = window.setInterval(() => {
      if (!document.hidden) {
        galleries.forEach((gallery) => showGalleryImage(gallery, 1));
      }
    }, 1000);
  }
}

function saveInventoryAndCart() {
  if (readOnlyPreview) {
    return true;
  }

  let previousCatalog;
  let previousCart;
  try {
    previousCatalog = window.localStorage.getItem(savedProductsStorageKey);
    previousCart = window.localStorage.getItem(savedCartStorageKey);
    window.localStorage.setItem(savedProductsStorageKey, JSON.stringify(products));
    window.localStorage.setItem(savedCartStorageKey, JSON.stringify(Array.from(cart.entries())));
    productStorageWarning = "";
    return true;
  } catch (error) {
    try {
      if (previousCatalog === null) {
        window.localStorage.removeItem(savedProductsStorageKey);
      } else if (previousCatalog !== undefined) {
        window.localStorage.setItem(savedProductsStorageKey, previousCatalog);
      }
      if (previousCart === null) {
        window.localStorage.removeItem(savedCartStorageKey);
      } else if (previousCart !== undefined) {
        window.localStorage.setItem(savedCartStorageKey, previousCart);
      }
    } catch (rollbackError) {
      console.error("Could not restore the previous ChooseMore inventory state:", rollbackError.message);
    }
    productStorageWarning = error.name === "QuotaExceededError"
      ? "Browser storage is full. Remove saved images or items, then try again."
      : "Inventory and bag changes could not be saved in this browser.";
    console.error("Could not save ChooseMore inventory and bag:", error.message);
    return false;
  }
}

function saveCartState() {
  if (readOnlyPreview) {
    return true;
  }

  let previousCart;
  try {
    previousCart = window.localStorage.getItem(savedCartStorageKey);
    window.localStorage.setItem(savedCartStorageKey, JSON.stringify(Array.from(cart.entries())));
    return true;
  } catch (error) {
    try {
      if (previousCart === null) {
        window.localStorage.removeItem(savedCartStorageKey);
      } else if (previousCart !== undefined) {
        window.localStorage.setItem(savedCartStorageKey, previousCart);
      }
    } catch (rollbackError) {
      console.error("Could not restore the previous ChooseMore bag:", rollbackError.message);
    }
    productStorageWarning = error.name === "QuotaExceededError"
      ? "Browser storage is full. Remove saved images or items, then try again."
      : "Bag changes could not be saved in this browser.";
    console.error("Could not save ChooseMore bag:", error.message);
    return false;
  }
}

function restoreSavedCart() {
  if (readOnlyPreview) {
    return;
  }

  try {
    const stored = window.localStorage.getItem(savedCartStorageKey);
    if (stored === null) {
      return;
    }
    const entries = JSON.parse(stored);
    if (!Array.isArray(entries)
        || entries.some((entry) => !Array.isArray(entry)
          || entry.length !== 2
          || typeof entry[0] !== "string"
          || !getProduct(entry[0])
          || !Number.isSafeInteger(entry[1])
          || entry[1] < 1)
        || new Set(entries.map(([productId]) => productId)).size !== entries.length) {
      throw new Error("Saved bag data has an invalid format.");
    }
    entries.forEach(([productId, quantity]) => cart.set(productId, quantity));
  } catch (error) {
    cartStatus.textContent = "The saved bag could not be loaded from this browser.";
    console.error("Could not load the saved ChooseMore bag:", error.message);
  }
}

function refreshInventoryViews(productId) {
  renderCatalog();
  renderFeatured();
  renderCart();
  if (productDialog?.open && productId) {
    renderProductDetail(productId);
  }
}

function setPurchaseStatus(productId, message) {
  document.querySelectorAll("[data-purchase-status]").forEach((status) => {
    if (status.dataset.purchaseStatus === productId) {
      status.textContent = message;
    }
  });
}

function addToCart(productId, requestedQuantity = 1) {
  const product = getProduct(productId);
  if (!product) {
    return;
  }
  const quantity = Number(requestedQuantity);
  const available = productStockCount(product);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > available) {
    const message = available < 1
      ? `${product.name} is out of stock.`
      : `Choose a whole number from 1 to ${available}.`;
    setPurchaseStatus(productId, message);
    if (cartStatus) {
      cartStatus.textContent = message;
    }
    return;
  }

  const previousStock = product.stockCount;
  const previousQuantity = cart.get(productId) || 0;
  product.stockCount = available - quantity;
  cart.set(productId, previousQuantity + quantity);
  if (!saveInventoryAndCart()) {
    product.stockCount = previousStock;
    if (previousQuantity) {
      cart.set(productId, previousQuantity);
    } else {
      cart.delete(productId);
    }
    if (cartStatus) {
      cartStatus.textContent = productStorageWarning;
    }
    return;
  }
  if (cartStatus) {
    cartStatus.textContent = `Added ${quantity} ${product.name} ${quantity === 1 ? "item" : "items"} to your bag.`;
  }
  refreshInventoryViews(productId);
  setPurchaseStatus(
    productId,
    `Added ${quantity} ${product.name} ${quantity === 1 ? "item" : "items"} to your bag.`
  );
}

function releaseCartUnits(productId, quantity) {
  const product = getProduct(productId);
  const currentQuantity = cart.get(productId) || 0;
  if (!product || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > currentQuantity) {
    return false;
  }

  const previousStock = product.stockCount;
  const remaining = currentQuantity - quantity;
  product.stockCount = productStockCount(product) + quantity;
  if (remaining) {
    cart.set(productId, remaining);
  } else {
    cart.delete(productId);
  }
  if (!saveInventoryAndCart()) {
    product.stockCount = previousStock;
    cart.set(productId, currentQuantity);
    if (cartStatus) {
      cartStatus.textContent = productStorageWarning;
    }
    return false;
  }

  if (cartStatus) {
    cartStatus.textContent = `${quantity} ${product.name} ${quantity === 1 ? "item was" : "items were"} returned to available stock.`;
  }
  refreshInventoryViews(productId);
  return true;
}

function cancelCartReservations() {
  if (cart.size === 0) {
    return;
  }

  const previousStock = new Map();
  cart.forEach((quantity, productId) => {
    const product = getProduct(productId);
    if (product) {
      previousStock.set(productId, product.stockCount);
      product.stockCount = productStockCount(product) + quantity;
    }
  });
  const previousCart = new Map(cart);
  cart.clear();
  if (!saveInventoryAndCart()) {
    previousStock.forEach((stockCount, productId) => {
      const product = getProduct(productId);
      if (product) {
        product.stockCount = stockCount;
      }
    });
    previousCart.forEach((quantity, productId) => cart.set(productId, quantity));
    if (cartStatus) {
      cartStatus.textContent = productStorageWarning;
    }
    return;
  }
  refreshInventoryViews();
}

function renderCart() {
  if (!cartItems) {
    return;
  }

  cartItems.replaceChildren();
  let quantityTotal = 0;
  let subtotal = 0;

  cart.forEach((quantity, productId) => {
    const product = getProduct(productId);
    if (!product || quantity < 1) {
      cart.delete(productId);
      return;
    }
    quantityTotal += quantity;
    subtotal += product.price * quantity;

    const row = document.createElement("article");
    row.className = "cart-row";
    row.append(createArtwork(product));

    const info = document.createElement("div");
    info.className = "cart-row-info";
    const category = document.createElement("p");
    category.className = "cart-row-category";
    category.textContent = product.category;
    const title = document.createElement("h3");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.className = "cart-row-description";
    description.textContent = product.description;
    const price = document.createElement("p");
    price.className = "cart-row-unit-price";
    price.textContent = `${currency.format(product.price)} each`;
    const lineTotal = document.createElement("p");
    lineTotal.className = "cart-row-total";
    const lineTotalValue = document.createElement("strong");
    lineTotalValue.textContent = currency.format(product.price * quantity);
    lineTotal.append("Item total ", lineTotalValue);
    info.append(category, title, description, price, lineTotal);

    const controls = document.createElement("div");
    controls.className = "cart-quantity-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.dataset.cartAction = "decrease";
    decrease.dataset.productId = productId;
    decrease.setAttribute("aria-label", `Remove one ${product.name}`);
    decrease.textContent = "−";
    const count = document.createElement("span");
    count.textContent = String(quantity);
    count.setAttribute("aria-label", `${quantity} in bag`);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.dataset.cartAction = "increase";
    increase.dataset.productId = productId;
    increase.setAttribute("aria-label", `Add one ${product.name}`);
    increase.textContent = "+";
    increase.disabled = productStockCount(product) < 1;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.dataset.cartAction = "remove";
    remove.dataset.productId = productId;
    remove.setAttribute("aria-label", `Delete ${product.name} from bag`);
    remove.textContent = "Delete item";
    controls.append(decrease, count, increase, remove);

    row.append(info, controls);
    cartItems.append(row);
  });

  const emptyMessage = document.createElement("p");
  emptyMessage.className = "cart-empty";
  emptyMessage.textContent = "Your bag is empty. Add a sample item to see it here.";
  emptyMessage.hidden = quantityTotal !== 0;
  cartItems.append(emptyMessage);

  if (cartCount) {
    cartCount.textContent = String(quantityTotal);
    cartCount.setAttribute("aria-label", `${quantityTotal} items in bag`);
  }
  if (cartTotal) {
    cartTotal.textContent = currency.format(subtotal);
  }
  const checkoutButton = document.querySelector("[data-checkout-open]");
  if (checkoutButton) {
    checkoutButton.disabled = quantityTotal === 0;
  }
  startGalleryRotation();
}

function formatTrackerTimestamp(timestamp) {
  const date = new Date(timestamp);
  const twoDigits = (value) => String(value).padStart(2, "0");
  const threeDigits = (value) => String(value).padStart(3, "0");
  return `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())} `
    + `${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}:${twoDigits(date.getSeconds())}`
    + `.${threeDigits(date.getMilliseconds())}`;
}

function createCheckoutTrackerId(customerName) {
  const firstLetter = Array.from(customerName.trim())
    .find((character) => /\p{L}/u.test(character));
  if (!firstLetter) {
    throw new Error("Enter a name containing at least one letter to create your tracker ID.");
  }

  const initial = firstLetter.toLocaleUpperCase();
  const now = Date.now();
  let timestamp = now;
  try {
    const previousTimestamp = Number(window.localStorage.getItem(savedTrackerTimestampStorageKey));
    if (Number.isSafeInteger(previousTimestamp) && previousTimestamp >= now) {
      timestamp = previousTimestamp + 1;
    }
    window.localStorage.setItem(savedTrackerTimestampStorageKey, String(timestamp));
  } catch (error) {
    console.error("Could not save the latest ChooseMore tracker timestamp:", error.message);
  }

  const date = new Date(timestamp);
  const twoDigits = (value) => String(value).padStart(2, "0");
  const threeDigits = (value) => String(value).padStart(3, "0");
  const dateDigits = `${date.getFullYear()}${twoDigits(date.getMonth() + 1)}${twoDigits(date.getDate())}`
    + `${twoDigits(date.getHours())}${twoDigits(date.getMinutes())}${twoDigits(date.getSeconds())}`
    + threeDigits(date.getMilliseconds());
  let trackerId = `${initial}${dateDigits}`;
  let collision = 1;
  while (generatedTrackerIds.has(trackerId)) {
    collision += 1;
    trackerId = `${initial}${dateDigits}${collision}`;
  }
  generatedTrackerIds.add(trackerId);
  return { trackerId, timestamp };
}

function persistCheckoutOrder(order) {
  let previousOrders;
  let previousCart;
  try {
    previousOrders = window.localStorage.getItem(savedCheckoutOrdersStorageKey);
    previousCart = window.localStorage.getItem(savedCartStorageKey);
    const orders = previousOrders === null ? [] : JSON.parse(previousOrders);
    if (!Array.isArray(orders)) {
      throw new Error("Saved checkout history has an invalid format.");
    }
    if (orders.some((savedOrder) => savedOrder?.trackerId === order.trackerId)) {
      throw new Error("This tracker ID already exists. Submit again to create a new confirmation.");
    }

    orders.push(order);
    window.localStorage.setItem(savedCheckoutOrdersStorageKey, JSON.stringify(orders));
    window.localStorage.setItem(savedCartStorageKey, JSON.stringify([]));
    return true;
  } catch (error) {
    try {
      if (previousOrders === null) {
        window.localStorage.removeItem(savedCheckoutOrdersStorageKey);
      } else if (previousOrders !== undefined) {
        window.localStorage.setItem(savedCheckoutOrdersStorageKey, previousOrders);
      }
      if (previousCart === null) {
        window.localStorage.removeItem(savedCartStorageKey);
      } else if (previousCart !== undefined) {
        window.localStorage.setItem(savedCartStorageKey, previousCart);
      }
    } catch (rollbackError) {
      console.error("Could not restore the previous ChooseMore order and bag:", rollbackError.message);
    }
    console.error("Could not save the ChooseMore demo order:", error.message);
    return false;
  }
}

function appendReceiptField(list, labelText, valueText) {
  const row = document.createElement("div");
  const label = document.createElement("dt");
  label.textContent = labelText;
  const value = document.createElement("dd");
  value.textContent = valueText || "Not provided";
  row.append(label, value);
  list.append(row);
}

function renderCheckoutSuccess(order) {
  const success = checkoutDialog?.querySelector("[data-checkout-success]");
  const form = checkoutDialog?.querySelector("[data-checkout-form]");
  const title = checkoutDialog?.querySelector("#checkout-title");
  if (!success || !form || !title) {
    return;
  }
  success.replaceChildren();

  const heading = document.createElement("h2");
  heading.id = "checkout-success-title";
  heading.tabIndex = -1;
  heading.textContent = "Demo checkout complete";
  const note = document.createElement("p");
  note.className = "checkout-success-note";
  note.textContent = "This is a local demo confirmation only. No real order or payment was processed.";
  const tracker = document.createElement("p");
  tracker.className = "checkout-tracker";
  const trackerLabel = document.createElement("span");
  trackerLabel.textContent = "Tracker ID";
  const trackerValue = document.createElement("strong");
  trackerValue.textContent = order.trackerId;
  tracker.append(trackerLabel, trackerValue);
  const timestamp = document.createElement("p");
  timestamp.className = "checkout-timestamp";
  timestamp.textContent = `Date & time: ${order.timestampDisplay}`;

  const customerHeading = document.createElement("h3");
  customerHeading.textContent = "Customer details";
  const customerDetails = document.createElement("dl");
  customerDetails.className = "checkout-receipt-details";
  appendReceiptField(customerDetails, "Name", order.customer.name);
  appendReceiptField(customerDetails, "Email", order.customer.email);
  appendReceiptField(customerDetails, "Delivery address", order.customer.address);
  appendReceiptField(customerDetails, "Payment method", order.paymentMethod);

  const itemsHeading = document.createElement("h3");
  itemsHeading.textContent = "Items";
  const itemList = document.createElement("div");
  itemList.className = "checkout-receipt-items";
  order.items.forEach((item) => {
    const itemRow = document.createElement("article");
    itemRow.className = "checkout-receipt-item";
    const itemTitle = document.createElement("h4");
    itemTitle.textContent = item.name;
    const itemCategory = document.createElement("p");
    itemCategory.textContent = item.category;
    const itemDescription = document.createElement("p");
    itemDescription.textContent = item.description;
    const itemQuantity = document.createElement("p");
    itemQuantity.textContent = `Quantity: ${item.quantity} × ${currency.format(item.unitPrice)}`;
    const itemTotal = document.createElement("strong");
    itemTotal.textContent = currency.format(item.total);
    itemRow.append(itemTitle, itemCategory, itemDescription, itemQuantity, itemTotal);
    itemList.append(itemRow);
  });

  const subtotal = document.createElement("p");
  subtotal.className = "checkout-receipt-total";
  subtotal.append("Sample subtotal ");
  const subtotalValue = document.createElement("strong");
  subtotalValue.textContent = currency.format(order.subtotal);
  subtotal.append(subtotalValue);

  const actions = document.createElement("div");
  actions.className = "checkout-report-actions";
  const download = document.createElement("button");
  download.type = "button";
  download.className = "shop-button";
  download.dataset.checkoutReportAction = "download";
  download.textContent = "Download PDF report";
  const print = document.createElement("button");
  print.type = "button";
  print.className = "catalog-cancel-import";
  print.dataset.checkoutReportAction = "print";
  print.textContent = "Print confirmation";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "catalog-cancel-import";
  close.dataset.dialogClose = "";
  close.textContent = "Close";
  const reportStatus = document.createElement("p");
  reportStatus.className = "form-status checkout-report-status";
  reportStatus.dataset.checkoutReportStatus = "";
  reportStatus.setAttribute("role", "status");
  reportStatus.setAttribute("aria-live", "polite");
  actions.append(download, print, close);

  success.append(heading, note, tracker, timestamp, customerHeading, customerDetails,
    itemsHeading, itemList, subtotal, actions, reportStatus);
  form.hidden = true;
  checkoutDialog.querySelectorAll(".dialog-note, .field-help").forEach((element) => {
    element.hidden = true;
  });
  title.textContent = "Checkout confirmation";
  success.hidden = false;
  heading.focus();
}

function resetCheckoutConfirmation() {
  const form = checkoutDialog?.querySelector("[data-checkout-form]");
  const success = checkoutDialog?.querySelector("[data-checkout-success]");
  const title = checkoutDialog?.querySelector("#checkout-title");
  if (!form || !success || !title) {
    return;
  }
  form.hidden = false;
  success.hidden = true;
  success.replaceChildren();
  title.textContent = "Checkout preview";
  checkoutDialog.querySelectorAll(".dialog-note, .field-help").forEach((element) => {
    element.hidden = false;
  });
  const status = form.querySelector("[data-checkout-status]");
  if (status) {
    status.textContent = "";
  }
}

function pdfSafeText(value) {
  return String(value)
    .replaceAll("₹", "INR ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapPdfLine(value, maxLength = 88) {
  const words = pdfSafeText(value).split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) {
    lines.push(line);
  }
  return lines.length ? lines : [""];
}

function createCheckoutPdf(order) {
  const lines = [
    "CHOOSEMORE - DEMO CHECKOUT CONFIRMATION",
    "DEMO ONLY - NO REAL ORDER OR PAYMENT WAS PROCESSED",
    "",
    `Tracker ID: ${order.trackerId}`,
    `Date and time: ${order.timestampDisplay}`,
    `Payment method: ${order.paymentMethod}`,
    "",
    "CUSTOMER DETAILS",
    `Name: ${order.customer.name || "Not provided"}`,
    `Email: ${order.customer.email || "Not provided"}`,
    `Delivery address: ${order.customer.address || "Not provided"}`,
    "",
    "ITEM DETAILS"
  ];
  order.items.forEach((item, index) => {
    lines.push(...wrapPdfLine(`${index + 1}. ${item.name} (${item.category})`));
    lines.push(...wrapPdfLine(`   ${item.description}`));
    lines.push(...wrapPdfLine(`   Quantity: ${item.quantity} x INR ${item.unitPrice.toFixed(2)}`));
    lines.push(...wrapPdfLine(`   Item total: INR ${item.total.toFixed(2)}`));
    lines.push("");
  });
  lines.push(`Sample subtotal: INR ${order.subtotal.toFixed(2)}`);

  const pages = [];
  for (let index = 0; index < lines.length; index += 48) {
    pages.push(lines.slice(index, index + 48));
  }
  const objects = [];
  const pageReferences = [];
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pages.forEach((pageLines, index) => {
    const contentObjectId = 4 + index * 2;
    const pageObjectId = contentObjectId + 1;
    pageReferences.push(`${pageObjectId} 0 R`);
    const textCommands = pageLines.map((line, lineIndex) => {
      const escaped = pdfSafeText(line).replace(/([\\()])/g, "\\$1");
      return `${lineIndex === 0 ? "BT /F1 11 Tf 50 750 Td" : "0 -14 Td"} (${escaped}) Tj`;
    });
    const content = textCommands.join("\n") + "\nET";
    objects[contentObjectId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
  });
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageReferences.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([new TextEncoder().encode(pdf)], { type: "application/pdf" });
}

function downloadCheckoutPdf(order) {
  const status = checkoutDialog?.querySelector("[data-checkout-report-status]");
  try {
    const blob = createCheckoutPdf(order);
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `choosemore-demo-${order.trackerId}.pdf`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    if (status) {
      status.textContent = "PDF report downloaded to this device.";
    }
  } catch (error) {
    console.error("Could not create the ChooseMore checkout PDF:", error.message);
    if (status) {
      status.textContent = "The PDF report could not be created. Use Print confirmation and choose Save as PDF.";
    }
  }
}

function createDetailSpecList(product) {
  const list = document.createElement("dl");
  list.className = "spec-list";
  const countGroup = document.createElement("div");
  const countTerm = document.createElement("dt");
  countTerm.textContent = "Available stock";
  const countValue = document.createElement("dd");
  countValue.textContent = String(productStockCount(product));
  countGroup.append(countTerm, countValue);
  list.append(countGroup);
  product.specs.slice(0, 1).forEach(([name, value]) => {
    const group = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = name;
    const detail = document.createElement("dd");
    detail.textContent = value;
    group.append(term, detail);
    list.append(group);
  });
  return list;
}

function createEditForm(product) {
  const form = document.createElement("form");
  form.className = "product-edit-form";
  form.dataset.productEditForm = product.id;
  form.hidden = true;

  const heading = document.createElement("h3");
  heading.textContent = "Amend sample details";
  form.append(heading);

  const note = document.createElement("p");
  note.className = "edit-note";
  note.textContent = "Changes are saved in this browser only. They are not shared with other browsers or devices.";
  form.append(note);

  const fields = [
    { name: "name", label: "Product name", value: product.name, type: "text" },
    { name: "description", label: "Description", value: product.description, type: "textarea" },
    { name: "price", label: "Sample price (₹)", value: String(product.price), type: "number" }
  ];

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.append(field.label, createRequiredMarker());
    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 3;
    } else {
      input = document.createElement("input");
      input.type = field.type;
      if (field.type === "number") {
        input.min = "1";
        input.step = "1";
        input.required = true;
      }
    }
    input.name = field.name;
    input.value = field.value;
    input.required = true;
    label.append(input);
    form.append(label);
  });

  const itemCountField = document.createElement("div");
  itemCountField.className = "item-count-field";
  const itemCountLabel = document.createElement("label");
  itemCountLabel.className = "visually-hidden";
  itemCountLabel.htmlFor = `edit-item-count-${product.id}`;
  itemCountLabel.textContent = "Item count";
  const itemCountInput = document.createElement("input");
  itemCountInput.id = itemCountLabel.htmlFor;
  itemCountInput.name = "item-count";
  itemCountInput.type = "number";
  itemCountInput.min = "0";
  itemCountInput.step = "1";
  itemCountInput.required = true;
  itemCountInput.value = String(productStockCount(product));
  itemCountInput.setAttribute("aria-label", "Available stock count");
  const itemCountHelp = document.createElement("span");
  itemCountHelp.className = "field-help";
  itemCountHelp.id = `edit-item-count-help-${product.id}`;
  itemCountHelp.textContent = "Enter a whole number; use 0 for out of stock.";
  itemCountInput.setAttribute("aria-describedby", itemCountHelp.id);
  itemCountField.append(itemCountLabel, itemCountInput, itemCountHelp);
  form.append(itemCountField);

  const imageLabel = document.createElement("label");
  imageLabel.append("Item image (optional)");
  const imageInput = document.createElement("input");
  imageInput.name = "images";
  imageInput.type = "file";
  imageInput.accept = "image/*";
  imageInput.multiple = true;
  imageInput.setAttribute("aria-describedby", `edit-image-help-${product.id}`);
  imageLabel.append(imageInput);
  const imageHelp = document.createElement("span");
  imageHelp.className = "field-help";
  imageHelp.id = `edit-image-help-${product.id}`;
  imageHelp.textContent = `Choose up to ${maxProductImages} images, each up to 8 MB, to replace the gallery. Leave blank to keep the current images.`;
  imageLabel.append(imageHelp);
  form.append(imageLabel);

  const categoryLabel = document.createElement("label");
  categoryLabel.append("Category ", createRequiredMarker());
  const categoryInput = document.createElement("select");
  categoryInput.name = "category";
  categoryInput.required = true;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.slug;
    option.textContent = category.name;
    option.selected = product.categorySlug === category.slug;
    categoryInput.append(option);
  });
  categoryLabel.append(categoryInput);
  form.append(categoryLabel);

  const specsGroup = document.createElement("fieldset");
  specsGroup.className = "edit-specs";
  const legend = document.createElement("legend");
  legend.textContent = "Specifications";
  specsGroup.append(legend);
  const specificationLabel = document.createElement("label");
  specificationLabel.append("Specification 1 ", createRequiredMarker());
  const specificationInput = document.createElement("input");
  specificationInput.name = "spec-name-1";
  specificationInput.value = product.specs[0]?.[0] || "";
  specificationInput.required = true;
  specificationLabel.append(specificationInput);
  const valueLabel = document.createElement("label");
  valueLabel.append("Value 1 ", createRequiredMarker());
  const valueInput = document.createElement("input");
  valueInput.name = "spec-value-1";
  valueInput.value = product.specs[0]?.[1] || "";
  valueInput.required = true;
  valueLabel.append(valueInput);
  specsGroup.append(specificationLabel, valueLabel);
  form.append(specsGroup);

  const save = document.createElement("button");
  save.type = "submit";
  save.className = "shop-button";
  save.textContent = "Save changes in this browser";
  form.append(save);

  const status = document.createElement("p");
  status.className = "form-status";
  status.dataset.editStatus = "";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  form.append(status);
  return form;
}

function createRequiredMarker() {
  const marker = document.createElement("span");
  marker.className = "required-marker";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = " *";
  return marker;
}

async function readProductImage(file) {
  if (!(file instanceof File)) {
    throw new Error("Choose an image file.");
  }
  if (file.size > maxProductImageFileBytes) {
    throw new Error("Choose an image smaller than 8 MB.");
  }

  let bitmap;
  let objectUrl;
  try {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      objectUrl = URL.createObjectURL(file);
      bitmap = new Image();
      bitmap.src = objectUrl;
      try {
        await bitmap.decode();
      } catch {
        throw new Error("This file is not a readable image or uses a format this browser cannot decode. Choose a browser-supported image format and try again.");
      }
    }
  } catch {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    throw new Error("This file is not a readable image or uses a format this browser cannot decode. Choose a browser-supported image format and try again.");
  }

  try {
    const largestDimension = Math.max(bitmap.width, bitmap.height);
    if (!largestDimension || largestDimension > 12000) {
      throw new Error("This image has dimensions too large to save safely. Choose an image under 12,000 pixels per side.");
    }

    let scale = Math.min(1, maxProductImageDimension / largestDimension);
    while (scale >= 0.125) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("The image could not be prepared in this browser. Try another image.");
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.82, 0.68, 0.52, 0.36]) {
        let blob;
        try {
          blob = await new Promise((resolve, reject) => {
            try {
              canvas.toBlob(resolve, "image/webp", quality);
            } catch (error) {
              reject(error);
            }
          });
        } catch {
          throw new Error("The image could not be converted safely in this browser. Try a different image.");
        }
        if (blob && ["image/webp", "image/png", "image/jpeg"].includes(blob.type)
            && blob.size <= maxStoredProductImageBytes) {
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              if (typeof reader.result === "string"
                  && /^data:image\/(?:png|jpeg|webp);base64,/i.test(reader.result)) {
                resolve(reader.result);
              } else {
                reject(new Error("The image could not be prepared for browser storage."));
              }
            }, { once: true });
            reader.addEventListener("error", () => reject(new Error("The image could not be prepared for browser storage.")), { once: true });
            reader.readAsDataURL(blob);
          });
        }
      }
      scale *= 0.75;
    }
    throw new Error("This image is too detailed to save in browser storage. Choose a smaller or simpler image.");
  } finally {
    bitmap.close?.();
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}

async function readProductImages(files) {
  if (files.length > maxProductImages) {
    throw new Error(`Choose no more than ${maxProductImages} images for one item.`);
  }
  const imageDataUrls = [];
  for (const file of files) {
    imageDataUrls.push(await readProductImage(file));
  }
  return imageDataUrls;
}

function renderProductDetail(productId) {
  const product = getProduct(productId);
  if (!product || !productDetail) {
    return;
  }
  productDetail.replaceChildren();

  const image = createArtwork(product);
  image.classList.add("product-detail-art");

  const content = document.createElement("div");
  content.className = "product-detail-copy";
  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;
  const title = document.createElement("h2");
  title.id = "product-dialog-title";
  title.textContent = product.name;
  const description = document.createElement("p");
  description.className = "detail-description";
  description.textContent = product.description;
  const price = document.createElement("p");
  price.className = "detail-price";
  price.textContent = `${currency.format(product.price)} · illustrative sample price`;
  const specsHeading = document.createElement("h3");
  specsHeading.textContent = "Sample specifications";
  const specNote = document.createElement("p");
  specNote.className = "spec-note";
  specNote.textContent = "Illustrative details only. Confirm real product information with its seller or manufacturer.";
  const actions = document.createElement("div");
  actions.className = "detail-actions";
  const enquiryLink = document.createElement("a");
  enquiryLink.className = "product-help-button";
  enquiryLink.href = `order-help.html?product=${encodeURIComponent(product.id)}`;
  enquiryLink.textContent = "Ask about this item";
  const addButton = createButton("Add to bag", "product-add-button", "add", product.id);
  if (productStockCount(product) < 1) {
    addButton.disabled = true;
    addButton.textContent = "Out of stock";
  }
  const purchaseStatus = document.createElement("p");
  purchaseStatus.className = "product-purchase-status";
  purchaseStatus.dataset.purchaseStatus = product.id;
  purchaseStatus.setAttribute("role", "status");
  purchaseStatus.setAttribute("aria-live", "polite");
  const actionButtons = [
    createPurchaseQuantityControl(product),
    purchaseStatus,
    addButton
  ];
  if (!readOnlyPreview) {
    actionButtons.push(createButton("Amend sample details", "product-edit-button", "edit", product.id));
  }
  actionButtons.push(enquiryLink);
  actions.append(...actionButtons);

  const detailContent = [category, title, description, price, specsHeading, createDetailSpecList(product), specNote, actions];
  if (!readOnlyPreview) {
    detailContent.push(createEditForm(product));
  }
  content.append(...detailContent);
  productDetail.append(image, content);
  startGalleryRotation();
}

function openProduct(productId) {
  renderProductDetail(productId);
  if (productDialog && !productDialog.open) {
    productDialog.showModal();
  }
}

async function updateProduct(productId, form) {
  if (readOnlyPreview) {
    return;
  }

  const product = getProduct(productId);
  if (!product) {
    return;
  }

  const formData = new FormData(form);
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price"));
  const stockCountValue = String(formData.get("item-count") || "");
  const stockCount = Number(stockCountValue);
  const categorySlug = String(formData.get("category") || "");
  const specName = String(formData.get("spec-name-1") || "").trim();
  const specValue = String(formData.get("spec-value-1") || "").trim();
  const category = categories.find((entry) => entry.slug === categorySlug);
  const imageFiles = formData.getAll("images").filter((file) => file instanceof File && file.size > 0);
  const status = form.querySelector("[data-edit-status]");

  if (!name || !description || !Number.isSafeInteger(price) || price < 1
      || !/^\d+$/.test(stockCountValue) || !Number.isSafeInteger(stockCount)
      || !category || !specName || !specValue) {
    status.textContent = "Enter a name, description, whole-number sample price, nonnegative stock count, category, and the first specification and value.";
    return;
  }

  if (imageFiles.length > maxProductImages) {
    status.textContent = `Choose no more than ${maxProductImages} images for one item.`;
    return;
  }

  const originalProduct = { ...product, specs: product.specs.map((spec) => [...spec]) };
  try {
    if (imageFiles.length) {
      product.imageDataUrls = await readProductImages(imageFiles);
    }
    product.name = name;
    product.description = description;
    product.price = price;
    product.stockCount = stockCount;
    product.category = category.name;
    product.categorySlug = category.slug;
    product.specs = [[specName, specValue]];

    if (!saveProductCatalog()) {
      Object.assign(product, originalProduct);
      status.textContent = productStorageWarning;
      return;
    }
  } catch (error) {
    Object.assign(product, originalProduct);
    status.textContent = error.message;
    return;
  }
  renderCatalog();
  renderFeatured();
  renderCart();
  renderProductDetail(product.id);
  const updatedForm = productDetail.querySelector("[data-product-edit-form]");
  updatedForm.hidden = true;
  updatedForm.querySelector("[data-edit-status]").textContent = "Changes saved in this browser only; they are not shared with other devices.";
}

async function addNewProduct(form) {
  if (readOnlyPreview) {
    return;
  }

  const formData = new FormData(form);
  const category = categories.find((entry) => entry.slug === formData.get("category"));
  const baseProduct = products.find((product) => product.categorySlug === category?.slug);
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const price = Number(formData.get("price"));
  const stockCountValue = String(formData.get("item-count") || "");
  const stockCount = Number(stockCountValue);
  const status = form.querySelector("[data-add-product-status]");
  const specName = String(formData.get("spec-name-1") || "").trim();
  const specValue = String(formData.get("spec-value-1") || "").trim();
  const specs = [[specName, specValue]];
  const imageFiles = formData.getAll("images").filter((file) => file instanceof File && file.size > 0);

  if (!category || !baseProduct || !name || !description || !Number.isSafeInteger(price) || price < 1
      || !/^\d+$/.test(stockCountValue) || !Number.isSafeInteger(stockCount)
      || !specName || !specValue || imageFiles.length === 0) {
    status.textContent = "Complete every required field, including at least one image and a nonnegative whole-number stock count.";
    return;
  }
  if (imageFiles.length > maxProductImages) {
    status.textContent = `Choose no more than ${maxProductImages} images for one item.`;
    return;
  }

  let imageDataUrls;
  try {
    imageDataUrls = await readProductImages(imageFiles);
  } catch (error) {
    status.textContent = error.message;
    return;
  }

  const idBase = name.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sample-item";
  let id = `${idBase}-${Date.now().toString(36)}`;
  let suffix = 2;
  while (products.some((product) => product.id === id)) {
    id = `${idBase}-${Date.now().toString(36)}-${suffix}`;
    suffix += 1;
  }

  const newProduct = {
    id,
    category: category.name,
    categorySlug: category.slug,
    name,
    description,
    price,
    stockCount,
    art: baseProduct.art,
    color: baseProduct.color,
    specs,
    imageDataUrls
  };
  products.push(newProduct);
  if (!saveProductCatalog()) {
    products.pop();
    status.textContent = productStorageWarning;
    return;
  }
  if (categorySelect) {
    categorySelect.value = category.slug;
    syncCategoryLocation(category.slug);
  }
  renderCatalog();
  form.reset();
  if (addItemPanel) {
    addItemPanel.open = true;
  }
  status.textContent = `${newProduct.name} was saved in this browser under ${category.name}. It was not added to your bag.`;
  Array.from(productGrid?.children || [])
    .find((card) => card.dataset.productId === newProduct.id)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.addEventListener("click", (event) => {
  const galleryButton = event.target instanceof Element
    ? event.target.closest("[data-gallery-action]")
    : null;
  if (galleryButton) {
    const gallery = galleryButton.closest(".product-gallery");
    if (gallery) {
      showGalleryImage(gallery, galleryButton.dataset.galleryAction === "previous" ? -1 : 1);
    }
    return;
  }

  const closeButton = event.target instanceof Element
    ? event.target.closest("[data-dialog-close]")
    : null;
  if (closeButton) {
    closeButton.closest("dialog").close();
    return;
  }

  const reportButton = event.target instanceof Element
    ? event.target.closest("[data-checkout-report-action]")
    : null;
  if (reportButton) {
    const success = reportButton.closest("[data-checkout-success]");
    const trackerId = success?.querySelector(".checkout-tracker strong")?.textContent;
    let order;
    try {
      const orders = JSON.parse(window.localStorage.getItem(savedCheckoutOrdersStorageKey) || "[]");
      order = Array.isArray(orders)
        ? orders.find((savedOrder) => savedOrder.trackerId === trackerId)
        : null;
    } catch (error) {
      console.error("Could not read the saved ChooseMore demo order:", error.message);
    }
    if (!order) {
      const status = success?.querySelector("[data-checkout-report-status]");
      if (status) {
        status.textContent = "The saved confirmation could not be read from this browser. Check available storage and reload the page.";
      }
      return;
    }
    if (reportButton.dataset.checkoutReportAction === "download") {
      downloadCheckoutPdf(order);
    } else {
      try {
        window.print();
      } catch (error) {
        console.error("Could not open the print dialog:", error.message);
        const status = success.querySelector("[data-checkout-report-status]");
        if (status) {
          status.textContent = "Printing is unavailable in this browser. Download the PDF report instead.";
        }
      }
    }
    return;
  }

  const productButton = event.target instanceof Element
    ? event.target.closest("[data-product-action]")
    : null;
  if (productButton) {
    const productId = productButton.dataset.productId;
    if (productButton.dataset.productAction === "details") {
      openProduct(productId);
    } else if (productButton.dataset.productAction === "add") {
      const purchaseContext = productButton.closest(".product-card, .product-detail-copy");
      const quantityInput = purchaseContext?.querySelector("[data-purchase-quantity]");
      addToCart(productId, quantityInput ? quantityInput.value : 1);
    } else if (productButton.dataset.productAction === "edit") {
      const form = productDetail.querySelector("[data-product-edit-form]");
      if (form) {
        form.hidden = false;
        form.querySelector("input")?.focus();
      }
    }
    return;
  }

  const cartButton = event.target instanceof Element
    ? event.target.closest("[data-cart-open]")
    : null;
  if (cartButton && cartDialog && !cartDialog.open) {
    renderCart();
    cartDialog.showModal();
    return;
  }

  const checkoutButton = event.target instanceof Element
    ? event.target.closest("[data-checkout-open]")
    : null;
  if (checkoutButton && !checkoutButton.disabled && checkoutDialog) {
    cartDialog.close();
    resetCheckoutConfirmation();
    checkoutDialog.showModal();
    return;
  }

  const cartAction = event.target instanceof Element
    ? event.target.closest("[data-cart-action]")
    : null;
  if (cartAction) {
    const productId = cartAction.dataset.productId;
    const quantity = cart.get(productId) || 0;
    if (cartAction.dataset.cartAction === "increase") {
      addToCart(productId);
    } else if (cartAction.dataset.cartAction === "decrease") {
      releaseCartUnits(productId, 1);
    } else {
      releaseCartUnits(productId, quantity);
    }
  }
});

document.addEventListener("submit", (event) => {
  const editForm = event.target.closest("[data-product-edit-form]");
  if (editForm) {
    event.preventDefault();
    updateProduct(editForm.dataset.productEditForm, editForm);
    return;
  }

  const newProductForm = event.target.closest("[data-add-product]");
  if (newProductForm) {
    event.preventDefault();
    addNewProduct(newProductForm);
    return;
  }

  const checkoutForm = event.target.closest("[data-checkout-form]");
  if (checkoutForm) {
    event.preventDefault();
    const formData = new FormData(checkoutForm);
    const name = String(formData.get("name") || "").trim();
    const status = checkoutForm.querySelector("[data-checkout-status]");
    const paymentMethods = {
      "cash-delivery": "Cash and delivery (COD)",
      "store-to-pick": "Store-to-Pick (STP)"
    };
    const paymentMethod = paymentMethods[String(formData.get("payment") || "")];
    if (!paymentMethod) {
      status.textContent = "Choose Cash and delivery (COD) or Store-to-Pick (STP) to continue.";
      return;
    }
    const orderItems = [];
    for (const [productId, quantity] of cart.entries()) {
      const product = getProduct(productId);
      if (!product) {
        status.textContent = "A reserved product is no longer available in the catalog. Your bag and reserved stock are unchanged.";
        return;
      }
      orderItems.push({
        productId: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity
      });
    }
    if (!orderItems.length) {
      status.textContent = "Your bag is empty. Add an item before checking out.";
      return;
    }
    let tracker;
    try {
      tracker = createCheckoutTrackerId(name);
    } catch (error) {
      status.textContent = error.message;
      return;
    }
    const order = {
      trackerId: tracker.trackerId,
      timestamp: tracker.timestamp,
      timestampDisplay: formatTrackerTimestamp(tracker.timestamp),
      paymentMethod,
      customer: {
        name,
        email: String(formData.get("email") || "").trim(),
        address: String(formData.get("address") || "").trim()
      },
      items: orderItems,
      subtotal: orderItems.reduce((total, item) => total + item.total, 0)
    };
    if (!persistCheckoutOrder(order)) {
      status.textContent = "Checkout details could not be saved in this browser. Your bag and reserved stock are unchanged; free storage and try again.";
      return;
    }
    cart.clear();
    renderCart();
    status.textContent = "";
    renderCheckoutSuccess(order);
  }
});

function syncCheckoutAddressRequirement(form) {
  const paymentSelect = form.elements.payment;
  const addressField = form.querySelector("[data-delivery-address-field]");
  const addressInput = form.elements.address;
  const requiresDeliveryAddress = paymentSelect.value === "cash-delivery";
  addressField.hidden = !requiresDeliveryAddress;
  addressInput.required = requiresDeliveryAddress;
  if (!requiresDeliveryAddress) {
    addressInput.value = "";
  }
}

document.querySelectorAll("[data-checkout-form]").forEach((form) => {
  form.elements.payment.addEventListener("change", () => syncCheckoutAddressRequirement(form));
  syncCheckoutAddressRequirement(form);
});

document.querySelectorAll("[data-dialog-close]").forEach((button) => {
  button.closest("dialog")?.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  });
});

checkoutDialog?.addEventListener("close", () => {
  cancelCartReservations();
  resetCheckoutConfirmation();
  const form = checkoutDialog.querySelector("[data-checkout-form]");
  form?.reset();
  if (form) {
    syncCheckoutAddressRequirement(form);
  }
  const status = checkoutDialog.querySelector("[data-checkout-status]");
  if (status) {
    status.textContent = "";
  }
});

if (categorySelect) {
  const initialCategory = new URLSearchParams(window.location.search).get("category") || "";
  if (categories.some((category) => category.slug === initialCategory)) {
    categorySelect.value = initialCategory;
  }
  categorySelect.addEventListener("change", () => {
    syncCategoryLocation(categorySelect.value);
    renderCatalog();
  });
}

if (addItemPanel && window.location.hash === "#add-item") {
  addItemPanel.open = true;
}
if (readOnlyPreview) {
  addItemPanel?.setAttribute("hidden", "");
  catalogTransferPanel?.setAttribute("hidden", "");
  document.querySelectorAll('a[href="products.html#add-item"]').forEach((link) => link.remove());
}

restoreSavedCart();
exportCatalogButton?.addEventListener("click", exportProductCatalog);
importCatalogInput?.addEventListener("change", () => {
  prepareCatalogImport(importCatalogInput.files?.[0]);
});
confirmImportButton?.addEventListener("click", applyCatalogImport);
cancelImportButton?.addEventListener("click", () => {
  pendingCatalogImport = null;
  importConfirmPanel.hidden = true;
  if (importCatalogInput) {
    importCatalogInput.value = "";
  }
  if (transferStatus) {
    transferStatus.textContent = "Import cancelled. Your catalog was not changed.";
  }
});

searchInput?.addEventListener("input", renderCatalog);
sortSelect?.addEventListener("change", renderCatalog);

document.querySelectorAll("[data-feature-art]").forEach((element) => {
  const product = products.find((item) => item.art === element.dataset.featureArt);
  if (product) {
    const artwork = createArtwork(product);
    artwork.classList.add("hero-product-art");
    element.append(artwork);
  }
});

renderFeatured();
renderCatalog();
renderCart();
if (readOnlyPreview) {
  const status = document.querySelector("[data-api-status]");
  if (status) {
    status.textContent = "Read-only public preview · showing original sample data.";
  }
} else if (window.location.hostname.endsWith(".github.io")) {
  const status = document.querySelector("[data-api-status]");
  if (status) {
    status.textContent = "Hosted preview · showing original sample data; the local API is not connected.";
  }
} else {
  loadCatalogFromApi();
}

async function loadCatalogFromApi() {
  const status = document.querySelector("[data-api-status]");
  try {
    const response = await fetch("/api/products", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`The local catalog API returned HTTP ${response.status}.`);
    }
    const apiProducts = await response.json();
    const validCatalog = Array.isArray(apiProducts)
      && apiProducts.length > 0
      && apiProducts.every((product) => product
        && typeof product.id === "string"
        && typeof product.name === "string"
        && typeof product.description === "string"
        && Number.isSafeInteger(product.price)
        && (product.stockCount === undefined
          || (Number.isSafeInteger(product.stockCount) && product.stockCount >= 0))
        && Array.isArray(product.specs));
    if (!validCatalog) {
      throw new Error("The local catalog API returned an invalid sample catalog.");
    }
    const singleSpecProducts = apiProducts.map((product) => ({
      ...product,
      stockCount: product.stockCount ?? 1,
      imageDataUrls: productImageDataUrls(product),
      specs: product.specs.slice(0, 1)
    }));
    products.splice(0, products.length, ...(readOnlyPreview
      ? singleSpecProducts
      : mergeSavedProducts(singleSpecProducts)));
    renderFeatured();
    renderCatalog();
    renderCart();
    document.dispatchEvent(new Event("choosemore-catalog-updated"));
    if (status) {
      status.textContent = productStorageWarning
        ? `Local catalog connected · ${productStorageWarning}`
        : "Local catalog connected · sample data only.";
    }
  } catch (error) {
    if (status) {
      status.textContent = "Local catalog API unavailable; showing the built-in sample catalog.";
    }
    console.error("Could not load the local sample catalog:", error.message);
  }
}
