/*
  The Chill Cove - Google Apps Script backend

  Setup summary:
  1. Create a Google Sheet.
  2. Open Extensions > Apps Script.
  3. Paste this file into Code.gs.
  4. Change DEFAULT_ADMIN_PIN below.
  5. Run setupChillCove once and authorize.
  6. Deploy as Web app:
     - Execute as: Me
     - Who has access: Anyone
  7. Copy the Web app URL into CONFIG.GOOGLE_SCRIPT_URL in index.html.
*/

var SPREADSHEET_ID = ""; // Optional. Leave blank when this script is bound to your Google Sheet.
var DEFAULT_ADMIN_PIN = "1234"; // Change this before going live, then run resetOwnerPin.

var SHEETS = {
  ORDERS: "Orders",
  ORDER_ITEMS: "Order Items",
  FEEDBACK: "Feedback",
  MENU_ITEMS: "Menu Items"
};

var HEADERS = {
  ORDERS: [
    "Timestamp",
    "Order ID",
    "Customer Name",
    "Mobile",
    "Items Summary",
    "Subtotal",
    "Discount",
    "Total",
    "Payment Mode",
    "Payment Done",
    "Delivered",
    "Notes",
    "Created By",
    "Last Updated"
  ],
  ORDER_ITEMS: [
    "Timestamp",
    "Order ID",
    "Category",
    "Item ID",
    "Item Name",
    "Price",
    "Qty",
    "Line Total"
  ],
  FEEDBACK: [
    "Timestamp",
    "Name",
    "Mobile",
    "Rating",
    "Recommend",
    "Comment"
  ],
  MENU_ITEMS: [
    "Category",
    "Item ID",
    "Item Name",
    "Description",
    "Price",
    "Active"
  ]
};

function setupChillCove() {
  var ss = getSpreadsheet_();
  ensureSheets_(ss);
  PropertiesService.getScriptProperties().setProperty("ADMIN_PIN_HASH", sha256Hex_(DEFAULT_ADMIN_PIN));
  return "The Chill Cove setup completed. Owner PIN was saved.";
}

function resetOwnerPin() {
  PropertiesService.getScriptProperties().setProperty("ADMIN_PIN_HASH", sha256Hex_(DEFAULT_ADMIN_PIN));
  return "Owner PIN reset from DEFAULT_ADMIN_PIN.";
}

function doPost(e) {
  try {
    var payload = parseBody_(e);
    var action = String(payload.action || "");
    if (action === "createOrder") return json_({ ok: true, data: createOrder_(payload) });
    if (action === "feedback") return json_({ ok: true, data: saveFeedback_(payload) });
    return json_({ ok: false, error: "Unknown POST action." });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var callback = params.callback || "";
  var result;
  try {
    var action = String(params.action || "");
    if (action === "ping") result = { ok: true, message: "The Chill Cove backend is running." };
    else if (action === "checkAdmin") result = checkAdmin_(params);
    else if (action === "listOrders") result = listOrders_(params);
    else if (action === "updateStatus") result = updateStatus_(params);
    else if (action === "listFeedback") result = listFeedback_(params);
    else result = { ok: false, error: "Unknown GET action." };
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }
  return output_(result, callback);
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error("No active spreadsheet. Bind this script to a Google Sheet or set SPREADSHEET_ID.");
  return ss;
}

function ensureSheets_(ss) {
  ensureSheet_(ss, SHEETS.ORDERS, HEADERS.ORDERS);
  ensureSheet_(ss, SHEETS.ORDER_ITEMS, HEADERS.ORDER_ITEMS);
  ensureSheet_(ss, SHEETS.FEEDBACK, HEADERS.FEEDBACK);
  ensureSheet_(ss, SHEETS.MENU_ITEMS, HEADERS.MENU_ITEMS);
  seedMenuItems_(ss.getSheetByName(SHEETS.MENU_ITEMS));
}

function ensureSheet_(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var first = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var empty = first.join("") === "";
  if (empty) sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#00a6d6");
  sheet.autoResizeColumns(1, headers.length);
  return sheet;
}

function seedMenuItems_(sheet) {
  if (sheet.getLastRow() > 1) return;
  var rows = [
    [
        "Cold Coco - Classic Series",
        "classic-cold-coco",
        "Classic Cold Coco",
        "Smooth, rich & perfectly chilled cocoa blend",
        80,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "choco-chip-avalanche",
        "Choco Chip Avalanche",
        "Cold coco + choco chips",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "vanilla-frost-coco",
        "Vanilla Frost Coco",
        "Cold coco + vanilla",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "cream-crunch-coco",
        "Cream Crunch Coco",
        "Cold coco + cookies & cream",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "oreo-blizzard-coco",
        "Oreo Blizzard Coco",
        "Cold coco + Oreo crush",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "pie-crush-coco",
        "Pie Crush Coco",
        "Cold coco + Chocopie blend",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "nutty-royale-coco",
        "Nutty Royale Coco",
        "Cold coco + premium dry fruits",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "biscoff-bliss-coco",
        "Biscoff Bliss Coco",
        "Cold coco + Biscoff crunch",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "kitkat-crush-coco",
        "KitKat Crush Coco",
        "Cold coco + KitKat chunks",
        100,
        true
    ],
    [
        "Cold Coco - Flavour Series",
        "dark-fantasy-delight-coco",
        "Dark Fantasy Delight Coco",
        "Cold coco + Dark Fantasy crumble",
        100,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "oreo-vanilla-coco",
        "Oreo Vanilla Coco",
        "Cold coco + Oreo + vanilla",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "oreo-cookies-cream-coco",
        "Oreo Cookies & Cream Coco",
        "Cold coco + Oreo + cookies & cream",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "chocopie-vanilla-coco",
        "Chocopie Vanilla Coco",
        "Cold coco + Chocopie + vanilla",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "chocopie-cookies-cream-coco",
        "Chocopie Cookies & Cream Coco",
        "Cold coco + Chocopie + cookies & cream",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "brownie-vanilla-coco",
        "Brownie Vanilla Coco",
        "Cold coco + Brownie + vanilla",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "brownie-cookies-cream-coco",
        "Brownie Cookies & Cream Coco",
        "Cold coco + Brownie + cookies & cream",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "biscoff-vanilla-coco",
        "Biscoff Vanilla Coco",
        "Cold coco + Biscoff + vanilla",
        120,
        true
    ],
    [
        "Cold Coco - Royale Mix Series",
        "biscoff-cookies-cream-coco",
        "Biscoff Cookies & Cream Coco",
        "Cold coco + Biscoff + cookies & cream",
        120,
        true
    ],
    [
        "Cold Coco - Signature Special",
        "the-cove-monster",
        "The Cove Monster",
        "Loaded premium cold coco experience",
        150,
        true
    ],
    [
        "Cold Coco - Extra Toppings",
        "topping-oreo-crumble",
        "Oreo Crumble",
        "Extra topping",
        20,
        true
    ],
    [
        "Cold Coco - Extra Toppings",
        "topping-choco-chips",
        "Choco Chips",
        "Extra topping",
        20,
        true
    ],
    [
        "Cold Coco - Extra Toppings",
        "topping-vanilla-scoop",
        "Vanilla Scoop",
        "Extra topping",
        30,
        true
    ],
    [
        "Cold Coco - Extra Toppings",
        "topping-dry-fruits",
        "Dry Fruits",
        "Extra topping",
        30,
        true
    ],
    [
        "Mocktail - Crush Series",
        "pink-mirage",
        "Pink Mirage",
        "Strawberry Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "kiwi-drift",
        "Kiwi Drift",
        "Kiwi Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "citrus-glow",
        "Citrus Glow",
        "Orange Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "tropical-rush",
        "Tropical Rush",
        "Pineapple Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "green-pulse",
        "Green Pulse",
        "Green Apple Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "purple-jam",
        "Purple Jam",
        "Jamun Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "guava-blush",
        "Guava Blush",
        "Guava Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "blue-velvet",
        "Blue Velvet",
        "Blueberry Crush",
        70,
        true
    ],
    [
        "Mocktail - Crush Series",
        "lychee-haze",
        "Lychee Haze",
        "Litchi Crush",
        70,
        true
    ],
    [
        "Mocktail - Mojito Series",
        "minted-mist",
        "Minted Mist",
        "Classic Mint Mojito",
        80,
        true
    ],
    [
        "Mocktail - Mojito Series",
        "emerald-splash",
        "Emerald Splash",
        "Green Mint Mojito",
        80,
        true
    ],
    [
        "Mocktail - Mojito Series",
        "arctic-blue",
        "Arctic Blue",
        "Blue Curacao Mojito",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "ruby-splash",
        "Ruby Splash",
        "Strawberry + Green Apple",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "midnight-jamun",
        "Midnight Jamun",
        "Jamun + Blue Curacao",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "tropical-thunder",
        "Tropical Thunder",
        "Pineapple + Orange",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "ocean-breeze",
        "Ocean Breeze",
        "Blue Curacao + Pineapple",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "kiwi-bliss",
        "Kiwi Bliss",
        "Kiwi + Pineapple",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "sunset-cooler",
        "Sunset Cooler",
        "Strawberry + Orange",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "frozen-emerald",
        "Frozen Emerald",
        "Green Apple + Kiwi + Mint",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "berry-storm",
        "Berry Storm",
        "Strawberry + Kiwi",
        80,
        true
    ],
    [
        "Mocktail - Signature Series",
        "tropic-mirage",
        "Tropic Mirage",
        "Litchi + Pineapple",
        80,
        true
    ]
];
  sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  return JSON.parse(e.postData.contents);
}

function createOrder_(payload) {
  verifyAdmin_(payload.pinHash);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getSpreadsheet_();
    ensureSheets_(ss);
    var orders = ss.getSheetByName(SHEETS.ORDERS);
    var itemsSheet = ss.getSheetByName(SHEETS.ORDER_ITEMS);
    var now = new Date();
    var orderId = String(payload.orderId || ("TCC-" + now.getTime()));
    var items = Array.isArray(payload.items) ? payload.items : [];
    var itemsSummary = payload.itemsText || items.map(function(item) {
      return Number(item.qty || 0) + " x " + String(item.name || "");
    }).join(", ");

    orders.appendRow([
      new Date(payload.date || now),
      orderId,
      String(payload.customerName || ""),
      String(payload.mobile || ""),
      itemsSummary,
      Number(payload.subtotal || 0),
      Number(payload.discount || 0),
      Number(payload.total || 0),
      String(payload.paymentMode || ""),
      asBoolean_(payload.paymentDone),
      asBoolean_(payload.delivered),
      String(payload.notes || ""),
      "Owner",
      now
    ]);

    if (items.length) {
      var itemRows = items.map(function(item) {
        return [
          new Date(payload.date || now),
          orderId,
          String(item.category || ""),
          String(item.id || ""),
          String(item.name || ""),
          Number(item.price || 0),
          Number(item.qty || 0),
          Number(item.lineTotal || 0)
        ];
      });
      itemsSheet.getRange(itemsSheet.getLastRow() + 1, 1, itemRows.length, itemRows[0].length).setValues(itemRows);
    }
    return { orderId: orderId };
  } finally {
    lock.releaseLock();
  }
}

function saveFeedback_(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = getSpreadsheet_();
    ensureSheets_(ss);
    var sheet = ss.getSheetByName(SHEETS.FEEDBACK);
    sheet.appendRow([
      new Date(payload.date || new Date()),
      String(payload.name || ""),
      String(payload.mobile || ""),
      Number(payload.rating || 0),
      String(payload.recommend || ""),
      String(payload.comment || "")
    ]);
    return { saved: true };
  } finally {
    lock.releaseLock();
  }
}

function checkAdmin_(params) {
  verifyAdmin_(params.pinHash);
  return { ok: true };
}

function listOrders_(params) {
  verifyAdmin_(params.pinHash);
  var ss = getSpreadsheet_();
  ensureSheets_(ss);
  var sheet = ss.getSheetByName(SHEETS.ORDERS);
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { ok: true, orders: [] };
  var headers = values[0];
  var map = headerMap_(headers);
  var limit = Math.max(1, Math.min(Number(params.limit || 500), 1000));
  var rows = values.slice(1).filter(function(row) { return row[map["Order ID"]]; });
  rows = rows.slice(Math.max(0, rows.length - limit));
  var orders = rows.map(function(row) {
    return {
      date: toIso_(row[map["Timestamp"]]),
      orderId: String(row[map["Order ID"]] || ""),
      customerName: String(row[map["Customer Name"]] || ""),
      mobile: String(row[map["Mobile"]] || ""),
      itemsText: String(row[map["Items Summary"]] || ""),
      subtotal: Number(row[map["Subtotal"]] || 0),
      discount: Number(row[map["Discount"]] || 0),
      total: Number(row[map["Total"]] || 0),
      paymentMode: String(row[map["Payment Mode"]] || ""),
      paymentDone: asBoolean_(row[map["Payment Done"]]),
      delivered: asBoolean_(row[map["Delivered"]]),
      notes: String(row[map["Notes"]] || "")
    };
  });
  return { ok: true, orders: orders };
}

function updateStatus_(params) {
  verifyAdmin_(params.pinHash);
  var orderId = String(params.orderId || "");
  var field = String(params.field || "");
  if (!orderId) throw new Error("Missing order ID.");
  if (field !== "paymentDone" && field !== "delivered") throw new Error("Invalid status field.");

  var ss = getSpreadsheet_();
  ensureSheets_(ss);
  var sheet = ss.getSheetByName(SHEETS.ORDERS);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var map = headerMap_(headers);
  var orderIdCol = map["Order ID"] + 1;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error("No orders found.");
  var found = sheet.getRange(2, orderIdCol, lastRow - 1, 1).createTextFinder(orderId).matchEntireCell(true).findNext();
  if (!found) throw new Error("Order not found: " + orderId);

  var targetHeader = field === "paymentDone" ? "Payment Done" : "Delivered";
  var targetCol = map[targetHeader] + 1;
  var updatedCol = map["Last Updated"] + 1;
  var row = found.getRow();
  sheet.getRange(row, targetCol).setValue(asBoolean_(params.value));
  sheet.getRange(row, updatedCol).setValue(new Date());
  return { ok: true, orderId: orderId, field: field, value: asBoolean_(params.value) };
}

function listFeedback_(params) {
  verifyAdmin_(params.pinHash);
  var ss = getSpreadsheet_();
  ensureSheets_(ss);
  var sheet = ss.getSheetByName(SHEETS.FEEDBACK);
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return { ok: true, feedback: [] };
  var headers = values[0];
  var map = headerMap_(headers);
  var rows = values.slice(1).filter(function(row) { return row[map["Timestamp"]]; });
  var feedback = rows.map(function(row) {
    return {
      date: toIso_(row[map["Timestamp"]]),
      name: String(row[map["Name"]] || ""),
      mobile: String(row[map["Mobile"]] || ""),
      rating: Number(row[map["Rating"]] || 0),
      recommend: String(row[map["Recommend"]] || ""),
      comment: String(row[map["Comment"]] || "")
    };
  });
  return { ok: true, feedback: feedback };
}

function verifyAdmin_(pinHash) {
  var saved = getAdminPinHash_();
  if (!pinHash || String(pinHash) !== saved) throw new Error("Unauthorized owner action. Check PIN.");
  return true;
}

function getAdminPinHash_() {
  var props = PropertiesService.getScriptProperties();
  var hash = props.getProperty("ADMIN_PIN_HASH");
  if (!hash) {
    hash = sha256Hex_(DEFAULT_ADMIN_PIN);
    props.setProperty("ADMIN_PIN_HASH", hash);
  }
  return hash;
}

function sha256Hex_(value) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value));
  return bytes.map(function(b) {
    var v = b < 0 ? b + 256 : b;
    var hex = v.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function headerMap_(headers) {
  var map = {};
  headers.forEach(function(header, index) { map[String(header)] = index; });
  return map;
}

function asBoolean_(value) {
  if (value === true) return true;
  var text = String(value || "").toLowerCase();
  return text === "true" || text === "yes" || text === "done" || text === "1";
}

function toIso_(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) return value.toISOString();
  var d = new Date(value);
  if (!isNaN(d.getTime())) return d.toISOString();
  return String(value);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function output_(obj, callback) {
  if (callback) {
    var safeCallback = String(callback).replace(/[^A-Za-z0-9_.$]/g, "");
    return ContentService.createTextOutput(safeCallback + "(" + JSON.stringify(obj) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(obj);
}
