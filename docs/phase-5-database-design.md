# ComEat Phase 5 Database Design

## Purpose

PostgreSQL will be ComEat's operational source of truth. Prisma will provide the application data layer.

The database will own:

- menu products, prices, sizes, modifiers, and availability;
- customer and administrator identities;
- saved customer addresses;
- orders and immutable order-line snapshots;
- payment references and payment state;
- order-status history;
- catering and contact inquiries;
- administrator audit records;
- configurable ordering and delivery rules.

Sanity is not required for operational data. It may be introduced later for marketing-only content such as homepage copy and FAQs.

## Core decisions

1. Store money as integer cents, never floating-point values.
2. Use USD as the initial currency, stored on every order and payment record.
3. Generate private database IDs and a separate readable public order reference.
4. Create orders with `PENDING_PAYMENT`; payment completion must come from a verified Stripe webhook.
5. Keep payment state separate from kitchen and delivery state.
6. Snapshot product names, options, prices, customer details, and delivery details on each order.
7. Deactivate products and options rather than deleting data referenced by an order.
8. Validate product availability, variants, modifier combinations, and prices on the server during checkout.
9. Keep visible menu classification optional. Internal categories may still support administration and sorting without appearing on the customer menu.
10. Record administrator changes to sensitive operational data in an audit log.

## Relationship overview

```text
User ───────────────< Address
  │
  ├────────────────< Order ───────────────< OrderItem ─────────< OrderItemModifier
  │                    │
  │                    ├──────────────────< Payment
  │                    └──────────────────< OrderStatusHistory
  │
  └──────────────────< AdminAuditLog

Category ───────────< Product ─────────────< ProductVariant
                         │                         │
                         └──< ModifierGroup       └──< VariantOptionPrice
                                  │                         >── ModifierOption
                                  └───────────────< ModifierOption

CateringInquiry
ContactMessage
OperationalSetting
```

## Identity and access models

### User

- `id`
- `email` (unique)
- `firstName`
- `lastName`
- `phone`
- `role`: `CUSTOMER` or `ADMIN`
- `active`
- `createdAt`
- `updatedAt`

Authentication-provider account and session tables will be added in Phase 6 after the provider is confirmed.

### Address

- `id`
- `userId`
- `label`
- `recipientName`
- `phone`
- `streetLine1`
- `streetLine2`
- `city`
- `state`
- `postalCode`
- `countryCode`
- `isDefault`
- timestamps

Saved addresses improve checkout, but completed orders keep their own address snapshots.

## Menu models

### Category

- `id`
- `slug` (unique)
- `name`
- `internalNote`
- `sortOrder`
- `active`

Categories remain an internal organizational tool unless the customer-facing classification is restored later.

### Product

- `id`
- `slug` (unique)
- `name`
- `description`
- `imageUrl`
- `priceNote`
- `allergenNote`
- `categoryId` (optional)
- `active`
- `featured`
- `pricePending`
- `sortOrder`
- timestamps

### ProductVariant

Represents an orderable size such as `2L`, `12-inch tray`, `24-inch tray`, or `12 pieces`.

- `id`
- `productId`
- `code`
- `label`
- `basePriceCents` (nullable while pricing is unconfirmed)
- `active`
- `sortOrder`
- unique `(productId, code)`

### ModifierGroup

Represents a configurable question such as rice type, protein, pepper tolerance, or an add-on.

- `id`
- `productId`
- `code`
- `name`
- `kind`: `GRAIN`, `PROTEIN`, `PEPPER`, or `ADD_ON`
- `selectionType`: `SINGLE` or `MULTIPLE`
- `required`
- `minimumSelections`
- `maximumSelections`
- `sortOrder`
- unique `(productId, code)`

### ModifierOption

- `id`
- `modifierGroupId`
- `code`
- `label`
- `defaultPriceAdjustmentCents`
- `active`
- `sortOrder`
- unique `(modifierGroupId, code)`

Pepper tolerance is represented by five options, with labels from mild to very hot.

### VariantOptionPrice

Allows an option's price adjustment to change with the selected size. For example, goat meat can add $30 to a 12-inch Pepper Soup tray and $60 to a 24-inch tray.

- `id`
- `productVariantId`
- `modifierOptionId`
- `priceAdjustmentCents`
- unique `(productVariantId, modifierOptionId)`

## Order models

### Order

- `id`
- `publicReference` (unique and non-sequential)
- `userId` (nullable for guest checkout)
- `status`
- customer name, email, and phone snapshots
- fulfillment method
- requested delivery date
- delivery-window snapshots
- complete delivery-address snapshots
- delivery notes
- allergy status and notes
- cross-contact acknowledgement
- `subtotalCents`
- `deliveryFeeCents`
- `taxCents`
- `totalCents`
- `currency`
- timestamps

Initial operational statuses:

```text
PENDING_PAYMENT
PAID
PREPARING
READY
OUT_FOR_DELIVERY
COMPLETED
CANCELLED
REFUNDED
```

### OrderItem

- `id`
- `orderId`
- `productId` (nullable historical reference)
- `productVariantId` (nullable historical reference)
- product-name snapshot
- product-image snapshot
- variant-label snapshot
- `unitPriceCents`
- `quantity`
- `lineTotalCents`

### OrderItemModifier

- `id`
- `orderItemId`
- optional modifier and option references
- modifier-name snapshot
- option-label snapshot
- `priceAdjustmentCents`

### OrderStatusHistory

- `id`
- `orderId`
- previous status
- new status
- administrator actor (nullable for automated events)
- optional note
- `createdAt`

## Payment model

### Payment

- `id`
- `orderId`
- `provider`: initially `STRIPE`
- provider payment-intent ID (unique)
- status: `PENDING`, `SUCCEEDED`, `FAILED`, `REFUNDED`, or `PARTIALLY_REFUNDED`
- payment-method type
- `amountCents`
- `currency`
- failure code and message where appropriate
- paid and refunded timestamps
- created and updated timestamps

An order can have more than one payment attempt. No card number, CVC, or raw payment credential will be stored.

## Inquiry models

### CateringInquiry

- customer name, email, and phone
- event type and date
- guest count
- venue or location
- message
- status: `NEW`, `IN_REVIEW`, `CONTACTED`, or `CLOSED`
- assigned administrator
- internal note
- timestamps

### ContactMessage

- customer name and email
- optional phone
- subject
- message
- status
- assigned administrator
- internal note
- timestamps

## Administration models

### AdminAuditLog

- `id`
- administrator user ID
- action
- entity type and entity ID
- before and after JSON snapshots where appropriate
- `createdAt`

Audit logs will cover price, availability, order-status, inquiry-status, and settings changes.

### OperationalSetting

- unique setting key
- JSON value
- optional description
- updated-by administrator
- timestamps

Initial settings will include:

- minimum advance-order hours;
- local delivery window;
- allowed out-of-state shipping days;
- weekly shipping cut-off;
- ordering availability;
- default currency.

## Server-side checkout contract

The browser will send only identifiers, selections, quantities, customer details, and delivery details. The server will:

1. load active products, variants, and modifier options;
2. reject unavailable or invalid combinations;
3. calculate authoritative prices in cents;
4. validate the delivery date and shipping rules;
5. validate the required allergy acknowledgement;
6. create an order and immutable snapshots inside a transaction;
7. assign `PENDING_PAYMENT`;
8. pass the server-calculated total to Stripe in Phase 10.

## Phase 5 boundaries

Phase 5 will create the database structure, migration, seed data, and server data layer. It will not yet:

- authenticate customers or administrators;
- replace the menu UI's static data source;
- create checkout orders;
- process Stripe payments;
- expose admin mutation screens.

Those connections will be introduced in their dedicated phases after the database foundation is verified.
