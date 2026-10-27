// Single source of truth for product + pricing. Used by the UI and by the API.
// The API NEVER trusts prices sent by the browser; it recomputes from this file.
export const PRODUCT = {
  price: 550,
  shipping: 130,
  freeShippingMinQty: 2,
  maxQty: 20,
  colors: [
    { id: "black", bn: "ব্ল্যাক", en: "Black", img: "/images/hoodie-black.jpg" },
    { id: "white", bn: "হোয়াইট", en: "White", img: "/images/hoodie-white.jpg" },
    { id: "navy", bn: "নেভি", en: "Navy", img: "/images/hoodie-navy.jpg" },
    { id: "maroon", bn: "মারুন", en: "Maroon", img: "/images/hoodie-maroon.jpg" },
    { id: "brown", bn: "ব্রাউন", en: "Brown", img: "/images/hoodie-brown.jpg" },
    { id: "forest-green", bn: "ফরেস্ট গ্রিন", en: "Forest Green", img: "/images/hoodie-forest-green.jpg" },
  ],
  sizes: [
    { id: "M", num: 40 },
    { id: "L", num: 42 },
    { id: "XL", num: 44 },
  ],
};

export const COLOR_IDS = PRODUCT.colors.map((c) => c.id);
export const SIZE_IDS = PRODUCT.sizes.map((s) => s.id);

export function calcTotals(qty) {
  const subtotal = PRODUCT.price * qty;
  const shipping = qty >= PRODUCT.freeShippingMinQty ? 0 : PRODUCT.shipping;
  return { unitPrice: PRODUCT.price, subtotal, shipping, total: subtotal + shipping };
}
