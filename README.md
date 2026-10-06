# Quick Copy Invoice Generator

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)


![Made for Quick Copy](https://img.shields.io/badge/Made_for-Quick_Copy-FB5130?style=for-the-badge)

A fast, simple invoice maker for a Xerox / photocopy shop. Type a quantity next to each service, check the live A4 preview, and print.

It runs entirely in the browser: no server, no database, no login.

---

## Features

- **All services listed up front.** Type a quantity next to a service and it joins the invoice. Services with no quantity are left off the invoice and the printout.
- **Automatic maths.** Amount = quantity × rate. Subtotal, discount, and grand total update instantly, with the amount in words.
- **Default rates, editable per invoice.** Changing a rate on one invoice never changes the defaults.
- **Other services.** "Add Other Service" adds a custom row where you type any service name.
- **Discount in ₹ or %.** Switch with the small ₹ | % toggle. The discount can never be more than the subtotal (or more than 100%).
- **Payment method.** Cash, UPI, Card, or Other, chosen from a custom dropdown.
- **Optional customer details.** Name and mobile number, shown on the invoice only if filled in.
- **Live A4 preview.** Updates as you type and always fits the screen height.
- **Print Invoice, Print & New Invoice, New Invoice.** "Print & New Invoice" clears the form only after the print dialog closes, with an **Undo** if you need the invoice back.
- **Draft is saved automatically** in the browser, so a refresh does not lose the invoice you are working on.
- **Keyboard friendly** (see below), responsive on tablet and phone, light theme only.

---

## Getting started

You need [Node.js](https://nodejs.org) installed (the LTS version is fine).

```bash
npm install        # install the packages (first time only)
npm run dev        # start the app while you work on it
```

Then open the address shown in the terminal (usually `http://localhost:5173`).

Other commands:

```bash
npm run lint       # check the code for mistakes
npm run build      # create the finished app in the "dist" folder
npm run preview    # try the finished app locally
```

---

## Using it every day

1. Type a **quantity** next to each service the customer wants. The rate is already filled in and can be changed.
2. Optionally enter a discount (₹ or %), choose the payment method, and add the customer's details.
3. Check the preview on the right.
4. Click **Print & New Invoice**. The invoice prints and a fresh one is ready for the next customer.

### Keyboard shortcuts

| Key                                       | What it does                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| **Enter** in a quantity or rate box       | Jumps to the next service's quantity (after the last one, to Discount) |
| **Tab**                                   | Moves quantity → rate → next field as usual                            |
| **Ctrl + P** (Cmd + P on Mac)             | Prints, after checking the invoice is valid                            |
| **↑ ↓ Enter Esc** in the payment dropdown | Choose a payment method; typing a letter jumps to it                   |

On a computer, the cursor is placed in the first quantity box when the app opens and after every new invoice.

---

## Changing the shop's details

Everything you will want to change is in a few small files.

| To change                           | Edit                                                          |
| ----------------------------------- | ------------------------------------------------------------- |
| Shop name, address, logo, watermark | `src/constants/shop.js`                                       |
| Services and their default prices   | `src/constants/services.js`                                   |
| Payment methods                     | `src/constants/paymentMethods.js`                             |
| The logo picture                    | Replace `public/logo/shop-logo.png` (keep the same file name) |
| Colors, sizes, and the invoice look | `src/index.css`                                               |

Tips:

- In `shop.js`, a line break in the address is written as `\n`, for example `"Shop No. 5, Main Road\nSatara"`.
- Set `watermark: ""` in `shop.js` to turn the background watermark off.
- To add a service, add one line to `services.js` with a unique `id`, a `name`, and a `defaultRate`.
- After changing any file, refresh the page (Ctrl + Shift + R).

---

## Printing

The invoice is built for **A4, portrait**. Use the app's own buttons or **Ctrl + P**.

In the browser's print dialog:

- Set **Paper size** to A4 and **Scale** to 100% (or Default).
- The page margins are handled by the app, so you do not need to change them.
- The grey boxes always print.
- The faint background watermark prints only if **Background graphics** is ticked.

Only the invoice is printed. The form, buttons, and everything else are hidden.

---

## Project structure

```
public/
  logo/shop-logo.png           The shop logo (header and watermark)
  favicon.svg                  Browser tab icon

src/
  components/
    invoice/
      InvoiceForm.jsx          The left side: services, discount and payment, customer
      InvoiceItems.jsx         The list of service rows
      InvoiceItemRow.jsx       One service row (quantity, rate, amount)
      InvoiceSummary.jsx       Discount (₹ or %), payment method, totals
      InvoicePreview.jsx       The right side: scales the A4 sheet to fit the screen
      InvoicePaper.jsx         The A4 invoice sheet itself
      InvoiceHeader.jsx        Logo, address, invoice number, date and time
      InvoiceFooter.jsx        Thank-you message
      InvoiceWatermark.jsx     Faint logo behind the invoice
    layout/AppLayout.jsx       Top bar and page frame
    ui/                        Button, Input, and the custom dropdown (Select)
  constants/                   Shop details, services, payment methods
  hooks/useInvoice.js          The invoice data and every action on it
  utils/
    calculations.js            All the money maths
    currency.js                ₹ formatting and amount in words
    invoice.js                 Invoice number, date and time, validation
    inputProps.js              Shared settings for number boxes
  App.jsx                      Puts everything together, handles printing
  main.jsx                     Starts the app
  index.css                    All styling, including the print rules
```

The calculations live in `utils/`, the invoice data in `hooks/`, and the screens only display things. This keeps the project easy to extend later.

---

## Built with

React, Vite, Tailwind CSS v4, custom CSS, and `lucide-react` icons. Plain JavaScript (no TypeScript), with browser-native printing.

---

## Putting it online

Run `npm run build`, then upload the **`dist`** folder to any static host. The simplest free option is **Netlify Drop** (drag the `dist` folder onto app.netlify.com/drop). Cloudflare Pages and Vercel work as well.

Note: the saved draft lives in each browser for each web address, so the shop computer keeps its own data.

To update the live app after changing the code, run `npm run build` again and upload the new `dist` folder.

---

## Good to know

- The invoice size is A4 only.
- No GST fields, by design.
- Invoices are not stored after printing. Only the current draft is kept in the browser.
- The app uses Google Fonts. Without an internet connection it falls back to the computer's normal font.
- The right-click menu is switched off on purpose (see `src/main.jsx`).

---

## Ideas for later

Invoice history with a daily sales total, editing prices inside the app, a running invoice number per day, a UPI QR code on the invoice, quick +1 / +5 / +10 quantity buttons, and installing the app like a normal program.
