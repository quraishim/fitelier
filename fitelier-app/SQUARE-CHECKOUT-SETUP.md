# Fitelier — Square hosted checkout setup

The suits catalogue, shopping bag and checkout review screens are built into the Fitelier frontend.

## Important: Square payment collection is not yet live

The frontend has no Square credentials and collects no card data. It checks `GET /api/square-status`. Until a configured server returns `{"ready":true}`, the button is disabled and buyers are invited to contact Fitelier instead.

The secure checkout handler is implemented in `src/worker.js` as `POST /api/square-checkout` using Square's Checkout API (CreatePaymentLink). It accepts the selected suit SKU, jacket/trouser EU sizes, and quantity. The server validates the options, rebuilds the order, and sets the fixed price at CAD $895 per suit. It returns a Square-hosted payment URL.

### Production configuration (server environment only)

Do not commit tokens, store them in JavaScript, or send them in chat. Add these **server-side** environment variables only after reviewing the checkout, tax, shipping and alterations policies:

- `SQUARE_ACCESS_TOKEN` — Square production access token with Orders read/write and Payments write permissions.
- `SQUARE_LOCATION_ID` — Canadian merchant Square location ID.
- `SQUARE_ENVIRONMENT=production` — or `sandbox` for Square sandbox verification.
- `SQUARE_TAX_CONFIGURED=true` — **only after** tax rules, including `applies_to_custom_amounts`, have been configured and tested in Square.
- `SQUARE_SHIPPING_CONFIGURED=true` — **only after** fulfillment areas, delivery pricing, addresses and customer expectations have been confirmed and tested.
- `SQUARE_CHECKOUT_ENABLED=true` — final manual activation switch, set last.

The secure handler requests the customer's shipping address from Square. The exact tax and fulfillment configurations must be tested with the merchant's actual account before accepting live orders. The website shows prices **before** taxes and any applicable delivery charges.

### Hosting detail: Render

If the existing `fitelier.onrender.com` service is a **static site**, the server-side `src/worker.js` code is not executed by Render. The frontend will still work, but `/api/square-status` will not be active, so payments remain disabled. An actual server runtime must be deployed and connected to the same-origin `/api/` routes (or the front-end adapted to a dedicated API hostname).

The repository also includes a Worker build target under `dist/server/index.js` for a hosting platform that supports Fetch-style Workers. Do **not** add the Square access token to the public assets or a static Render site's environment variables expecting it to reach the browser.

### Verification before enabling

1. In Square Sandbox, make a test order for **one charcoal suit** with different EU jacket and trouser sizes. Confirm both appear correctly in Square order details.
2. Test a two-suit cart and confirm Square's server-side total is correct: CAD $1,790 before taxes/delivery.
3. Verify Canadian sales taxes and shipping in the **actual Square checkout**, including the customer's address.
4. Confirm the final-sale disclosures and Edmonton alterations policy with the business before accepting orders.
5. Verify fulfillment, payment notifications and refund handling from the Square Dashboard.
6. Activate the environment switches only after successful checks. `GET /api/square-status` should then return `{"ready":true}`.

There is **no automatic order-fulfillment or payment-confirmation webhook** in this implementation; a successful redirect to Square is not proof of a paid order. Monitor orders and payments in Square Dashboard. The shopping bag is not cleared merely because a customer returns to the site.

Square API docs: https://developer.squareup.com/reference/square/checkout/create-payment-link
Square tax documentation: https://developer.squareup.com/docs/orders-api/apply-taxes-and-discounts/auto-apply-taxes
