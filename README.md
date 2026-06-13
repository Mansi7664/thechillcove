# The Chill Cove - Clickable Menu, Feedback, Owner Orders

This package now uses the exact menu PNGs you provided for the client:

- Cold Coco menu: Classic Series, Flavour Series, Royale Mix Series, The Cove Monster, and Extra Toppings.
- Mocktail menu: Crush Series, Mojito Series, and Signature Series.

## Website flow

- Public customers can view the original PNG menu design.
- Public customers can tap directly on items in the menu image to build a selection preview and see the total. The list-based menu picker has been removed.
- Public customers still cannot place an online order.
- Public customers can submit feedback.
- Owner/client logs in with a PIN, taps items from the same photo menu, creates the real order, enters customer name and optional mobile number, and saves it.
- Owner/client can later mark each saved order as:
  - Payment done / unpaid
  - Delivered / not delivered
- Orders, feedback, and menu item names/prices can sync to a private Google Sheet through `google-apps-script.js`, so all devices reflect the same list.

## Files

- `index.html` - complete website.
- `assets/cold-coco-menu.png` - exact Cold Coco PNG menu.
- `assets/mocktail-menu.png` - exact Mocktail PNG menu.
- `google-apps-script.js` - Google Sheet backend script with the updated menu list.
- `menu-items-template.csv` - full menu item list in CSV format.
- `the-chill-cove-orders-template.xlsx` - Excel-style workbook template with the updated Menu Items sheet.

## Menu items included

Total menu items configured: 44.

- Cold Coco: 23 items including toppings.
- Mocktails: 21 items.

The item list in `index.html`, `google-apps-script.js`, `menu-items-template.csv`, and the workbook template has been updated to match the provided menu.

## Connecting the private Google Sheet backend

1. Create a new Google Sheet in the owner/client Google account.
2. Share the Google Sheet only with the limited owner/client accounts.
3. In the Sheet, open Extensions > Apps Script.
4. Paste the contents of `google-apps-script.js` into `Code.gs`.
5. Change these lines before going live:

```js
var DEFAULT_ADMIN_PIN = "1234";
var ADMIN_RESET_EMAIL = "owner@example.com";
```

`ADMIN_RESET_EMAIL` receives the 6-digit OTP used by the owner PIN reset flow.

6. Run `setupChillCove` once from the Apps Script editor and authorize it.
7. Deploy as a Web app.
8. Copy the Web App URL.
9. Open `index.html` and paste the URL here:

```js
const CONFIG = {
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  LOCAL_DEMO_PIN: "1234"
};
```

## Hosting

Upload the project to any static HTTPS host, such as Vercel, Netlify, or GitHub Pages. The site is static; only the order/feedback storage needs Google Apps Script.

## Owner daily usage

1. Customer scans QR and views the menu.
2. Customer tells the owner the order, or shows the copied selection.
3. Owner opens Owner login.
4. Owner selects the same items by tapping the photo menu in the owner dashboard.
5. Owner enters customer name and optional mobile number.
6. Owner saves the order.
7. Later, owner clicks `Mark paid` and/or `Mark delivered`.

## Public customer usage

1. Scan QR.
2. Tap items on the menu image.
3. Check selection total.
4. Copy/show the selection to the owner.
5. Submit feedback.
