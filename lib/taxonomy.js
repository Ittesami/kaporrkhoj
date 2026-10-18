// Our own taxonomy. Every brand's product is mapped onto these values by
// scraper/normalize.js, and the shop filters are built from these lists.

export const GENDERS = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

// Order matters in matching: more specific categories come first
// (e.g. "polo shirt" must hit polo before shirt).
export const CATEGORIES = [
  { value: "panjabi", label: "Panjabi", words: ["panjabi", "punjabi", "pajabi"] },
  { value: "kabli", label: "Kabli", words: ["kabli", "kabuli"] },
  { value: "polo", label: "Polo", words: ["polo"] },
  { value: "t-shirt", label: "T-Shirt", words: ["t-shirt", "t shirt", "tshirt", "t- shirt", "tee"] },
  { value: "shirt", label: "Shirt", words: ["shirt"] },
  { value: "kurti", label: "Kurti & Tunic", words: ["kurti", "kurta", "tunic", "fatua"] },
  { value: "three-piece", label: "Three Piece", words: ["three piece", "3 pcs", "3pcs", "3 piece", "3-piece", "salwar"] },
  { value: "two-piece", label: "Two Piece & Sets", words: ["two piece", "two-piece", "2 pcs", "2pcs", "2 piece", "co-ord", "set", "romper", "onesie"] },
  { value: "saree", label: "Saree", words: ["saree", "sari"] },
  { value: "dress", label: "Dress & Gown", words: ["dress", "gown", "frock", "maxi"] },
  { value: "tops", label: "Tops", words: ["tops", "top", "blouse", "shrug", "camisole", "nima"] },
  { value: "waistcoat", label: "Waistcoat & Koti", words: ["waistcoat", "waist coat", "koti", "vest", "coaty"] },
  { value: "jacket", label: "Jacket & Blazer", words: ["jacket", "blazer", "suit", "hoodie", "hoody", "sweater", "cardigan", "cardigen", "sweatshirt"] },
  { value: "jeans", label: "Jeans & Denim", words: ["jeans", "denim"] },
  { value: "trousers", label: "Trousers & Pants", words: ["trouser", "pant", "chino", "jogger", "cargo", "bottom", "palazzo", "legging", "leggins", "pajama", "payjama", "shorts", "skirt", "boxer"] },
  { value: "orna", label: "Orna & Scarf", words: ["orna", "dupatta", "scarf", "hijab", "stole", "shawl"] },
  { value: "lungi", label: "Lungi", words: ["lungi"] },
  { value: "accessories", label: "Accessories", words: ["socks", "sock", "wallet", "belt", "cap", "hat", "bag", "tote", "backpack", "tie", "bow tie", "sunglasses", "watch", "handkerchief", "mask", "cufflink", "bib"] },
  { value: "footwear", label: "Footwear", words: ["shoe", "sandal", "slipper", "loafer", "sneaker", "chappal", "boot", "flip flop"] },
];

// Products we skip entirely: not fashion.
export const SKIP_WORDS = ["bed sheet", "bedsheet", "cushion", "pillow", "table mat", "table runner", "curtain", "towel", "comforter", "quilt", "gift card", "gift voucher", "candle", "mug", "napkin", "doormat", "house hold", "household", "home decor"];

export const SLEEVES = [
  { value: "half", label: "Half sleeve" },
  { value: "full", label: "Full sleeve" },
  { value: "sleeveless", label: "Sleeveless" },
];

// Colour families with the words brands use for them. Longest phrases are
// matched first, so "navy blue" wins over "blue" and "off white" over "white".
export const COLOR_FAMILIES = [
  { value: "black", label: "Black", hex: "#1c1917", words: ["kalo", "black", "jet", "charcoal black", "onyx"] },
  { value: "white", label: "White", hex: "#ffffff", words: ["sada", "white", "snow", "optic white"] },
  { value: "offwhite", label: "Off-white & Cream", hex: "#f3ead7", words: ["off white", "off-white", "offwhite", "cream", "ivory", "ecru", "beige", "parmesan", "vanilla", "pearl", "bone", "sand", "khaki", "stone", "oatmeal", "natural"] },
  { value: "grey", label: "Grey", hex: "#9ca3af", words: ["grey", "gray", "ash", "charcoal", "silver", "slate", "anthra", "melange", "smoke"] },
  { value: "blue", label: "Blue", hex: "#2563eb", words: ["nil", "neel", "blue", "sky", "aqua", "turquoise", "teal", "cyan", "indigo", "denim", "cobalt", "azure", "royal", "steel", "sapphire", "petrol", "peacock", "ocean", "powder blue"] },
  { value: "navy", label: "Navy", hex: "#1e2a5a", words: ["navy", "navy blue", "french navy", "midnight", "dk indigo"] },
  { value: "green", label: "Green", hex: "#16a34a", words: ["sobuj", "green", "olive", "mint", "lime", "sage", "emerald", "bottle green", "army", "moss", "pista", "pistachio", "jade", "forest", "mehendi", "mehndi", "parrot", "pine", "fern"] },
  { value: "red", label: "Red", hex: "#dc2626", words: ["lal", "red", "crimson", "scarlet", "cherry", "ruby"] },
  { value: "maroon", label: "Maroon & Wine", hex: "#7f1d1d", words: ["maroon", "wine", "burgundy", "wine red", "oxblood", "plum", "berry", "merlot"] },
  { value: "pink", label: "Pink", hex: "#ec4899", words: ["golapi", "pink", "rose", "blush", "magenta", "fuchsia", "peach", "salmon", "coral", "onion"] },
  { value: "orange", label: "Orange", hex: "#ea580c", words: ["orange", "rust", "saffron", "tangerine", "komla", "apricot", "copper", "amber", "terracotta", "burnt"] },
  { value: "yellow", label: "Yellow", hex: "#eab308", words: ["holud", "yellow", "mustard", "lemon", "gold", "golden", "ochre", "turmeric", "haldi"] },
  { value: "purple", label: "Purple", hex: "#7e22ce", words: ["beguni", "purple", "violet", "lavender", "lilac", "mauve", "orchid", "grape", "eggplant"] },
  { value: "brown", label: "Brown", hex: "#78350f", words: ["khoyeri", "brown", "coffee", "chocolate", "tan", "camel", "mocha", "cocoa", "caramel", "rust brown", "taupe", "wine brown", "bronze", "clay", "walnut", "chestnut", "hazel", "cinnamon", "mud"] },
  { value: "multi", label: "Multicolour & Print", hex: "linear-gradient(135deg,#ea580c,#2563eb,#16a34a)", words: ["multi", "multicolor", "multicolour", "printed", "print", "aop", "check", "checked", "stripe", "striped", "paisley", "floral", "kalamkari", "batik", "tie dye", "block print", "ikat"] },
];

export const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export const SORTS = [
  { value: "relevance", label: "Best match" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export function labelFor(list, value) {
  return list.find((x) => x.value === value)?.label || value;
}
