# ComEat — Codex Implementation Specification

## 1. Project Overview

**Project name:** ComEat  
**Business type:** Nigerian / African food brand based in the United States  
**Primary goals:**  
- Sell food online
- Promote catering services
- Present ComEat as a premium, modern African food brand
- Provide a strong mobile-first ordering experience

**Brand direction:** Modern African luxury / editorial food experience

**Core visual identity:**  
- Black / near-black
- Gold
- Orange
- Warm white / cream for contrast

**Primary user actions:**  
1. View menu
2. Configure a food item
3. Add to cart
4. Checkout and pay
5. Submit catering inquiry
6. Contact the business

---

# 2. Important Rules for Codex

1. Do not invent missing business information.
2. Use placeholders or TODO comments for any client information marked TBD.
3. Keep components reusable and modular.
4. Use TypeScript throughout.
5. Make the site mobile-first and fully responsive.
6. Prioritize accessibility, performance, and clean architecture.
7. Avoid generic AI-generated visual patterns:
   - no random gradient blobs
   - no unnecessary glassmorphism
   - no excessive rounded cards
   - no excessive animation
   - no overcrowded layouts
8. Use the supplied ComEat brand colors consistently.
9. Use real food photography when available; placeholders may be used during development.
10. Do not assume every food item has the same modifiers.
11. Never trust prices or payment totals from the browser.
12. Never store raw card details.
13. Do not hard-code business rules that should be configurable unless explicitly stated.

---

# 3. Confirmed Website Menu

## Rice & Mains

- Jollof Rice
- Fried Rice
- Local Rice
- Asaro
- Ikokore
- Imoyo

## Soups & Sauces

- Egusi
- Efo Riro
- Ayamase
- Ata Dindin
- Pepper Soup
- Spaghetti Bolognese

## Sides & Snacks

- Asun
- Naija Buns
- Puff-Puff
- Moi-Moi
- Ewa Agoyin

Total confirmed food items: **17**

Do not add additional dishes unless the client later approves them.

---

# 4. Client Information Still TBD

Do not invent these values:

- Final prices
- Exact business city/state
- Delivery area
- Pickup availability
- Delivery fees
- Portion / tray sizes
- Protein options
- Pepper options per dish
- Catering pricing and packages
- Tax rules
- Business email
- Social media handles
- Domain name
- Business opening hours
- Final public phone number confirmation
- Food descriptions
- Final food images
- Delivery schedule
- Out-of-state shipping rules

---

# 5. Provisional Business Rules Requiring Client Confirmation

The previous food-ordering material supplied for reference includes the following rules.

Treat these as **provisional** until the ComEat client confirms them:

- Minimum 48-hour advance ordering
- Pepper tolerance level from 1–5
- Product options may include:
  - tray / portion size
  - protein
  - pepper level
- Delivery details are collected before order fulfillment
- Order confirmation should only happen after successful payment

These rules must be implemented in a configurable way where possible.

---

# 6. Recommended Technology Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Motion
- Next/Image

## State Management

- Zustand

Use Zustand primarily for:
- cart state
- cart totals
- quantity updates
- local cart persistence

Use localStorage persistence for guest carts.

## Forms and Validation

- React Hook Form
- Zod

Use Zod schemas on both client and server where practical.

## CMS

- Sanity

Use Sanity for:
- menu items
- food descriptions
- food images
- category content
- featured dishes
- homepage content
- FAQ
- availability
- optional modifiers
- catering page content

## Backend

Use Next.js server-side capabilities:
- Route Handlers
- Server Actions where appropriate

Do not introduce Express unless a future requirement makes it necessary.

## Database

- PostgreSQL
- Prisma ORM

Recommended managed options:
- Neon
- Supabase PostgreSQL

## Payments

- Stripe

Required customer payment methods:
- Cash App Pay
- Visa
- Mastercard
- Discover
- American Express

Use Stripe Payment Element or another Stripe-supported secure checkout implementation.

Do not build custom card-entry infrastructure.

## Email

- Resend

## Hosting

- Vercel

## DNS / Security

- Cloudflare

## Analytics

- Google Analytics 4
- Google Search Console

---

# 7. Website Routes

Recommended routes:

```text
/
 /menu
 /catering
 /about
 /contact
 /faq
 /cart
 /checkout
 /order-success
```

Optional future routes:

```text
/privacy
/terms
/allergens
/order/[id]
```

The MVP does not need user accounts unless the client specifically requests them.

Guest checkout is preferred for version 1.

---

# 8. Visual Design Direction

## Style

Modern African luxury / editorial.

The interface should feel:
- premium
- warm
- food-first
- elegant
- modern
- culturally respectful

Avoid visual clichés such as excessive African-pattern decoration.

## Brand Color Tokens

Initial working palette:

```css
:root {
  --background: #050505;
  --surface: #111111;
  --surface-elevated: #171717;

  --foreground: #F7F3EA;
  --muted: #A7A29A;

  --gold: #E6A51A;
  --gold-light: #FFC83D;

  --orange: #F26A00;

  --border: #292929;
}
```

These colors can be refined after exact logo color sampling.

## Color Usage

Suggested visual ratio:
- ~70% black / near-black
- ~15% warm white
- ~10% gold
- ~5% orange

Gold and orange should be accents, not used everywhere.

## Typography

Recommended:

```text
Display / Editorial Headings:
Instrument Serif

Body / Navigation / UI:
Manrope
```

## General Layout Style

Prefer:
- large editorial typography
- full-width food imagery
- asymmetric layouts
- strong whitespace
- subtle borders
- restrained use of cards
- minimal radius
- visually rich photography

Avoid:
- dashboard-like homepage cards
- heavy gradients
- excessive shadows
- excessive rounded containers

---

# 9. Responsive Design Requirements

Design mobile-first.

Target breakpoints should support at minimum:

```text
Mobile: ~390px
Tablet: ~768px
Desktop: ~1440px
```

The UI should scale smoothly between breakpoints.

## Mobile priorities

- menu access must be obvious
- cart must be easily reachable
- product configuration must be touch-friendly
- checkout must be simple
- sticky CTA may be used

Example mobile sticky action:

```text
VIEW ORDER • 3     $XX
```

Use a mobile bottom sheet for product customization where appropriate.

Use a right-side drawer or modal on desktop.

---

# 10. Homepage Structure

Build the homepage in this order.

## 10.1 Navbar

Desktop:

```text
ComEat    Menu    Catering    About    Contact    ORDER NOW    Cart
```

Mobile:
- logo
- menu button
- cart icon

The full circular logo may be used in larger brand sections, but the navbar should ideally use a simplified wordmark if available.

## 10.2 Hero

Dark full-width / full-screen section.

Suggested copy direction:

```text
A TASTE
THAT FEELS
LIKE HOME.
```

Supporting text:

```text
Authentic Nigerian food,
made to bring people together.
```

Primary CTA:
- Order Now

Secondary CTA:
- Explore Menu

Use large food photography or a short muted hero video if suitable media is available.

## 10.3 Featured Dishes

Show 3–4 highlighted foods.

Recommended initial placeholders:
- Jollof Rice
- Egusi
- Asun

Use large images rather than generic small cards.

## 10.4 Brand Story Section

Suggested heading style:

```text
NIGERIAN FOOD.
NO SHORTCUTS.
```

Support with:
- origin / authenticity statement
- food image
- optional kitchen image

## 10.5 Menu Preview

Show all three confirmed menu categories:

1. Rice & Mains
2. Soups & Sauces
3. Sides & Snacks

Each section should list dish names and link to `/menu`.

## 10.6 Catering

Large image-driven section.

Purpose:
- weddings
- birthdays
- corporate events
- family events
- private gatherings

CTA:
- Explore Catering
or
- Request Catering

## 10.7 How Ordering Works

Suggested 4-step structure:

1. Choose your food
2. Customize your order
3. Enter delivery details
4. Enjoy

Keep the explanation simple for customers.

## 10.8 Food Gallery / Mosaic

Use a visually editorial grid.

Potential food placeholders:
- Jollof
- Asun
- Egusi
- Puff-Puff

## 10.9 Testimonials

Only use real testimonials before production launch.

Do not generate fake customer reviews.

## 10.10 Final CTA

Suggested direction:

```text
HUNGRY YET?
```

CTA:
- Order Now

## 10.11 Footer

Include:

```text
ComEat

Menu
Catering
About
Contact
FAQ
Delivery
Allergens
Privacy
Terms

Instagram
TikTok
Facebook
```

Only display social links when real URLs are available.

---

# 11. Menu Page UX

Do not create a giant repetitive 17-card grid unless testing proves it is necessary.

Prefer an editorial menu.

Suggested structure:

```text
OUR MENU

Food made to be shared.

RICE & MAINS
[large image]
Jollof Rice
Fried Rice
Local Rice
Asaro
Ikokore
Imoyo

SOUPS & SAUCES
...

SIDES & SNACKS
...
```

Each food item should be selectable.

On interaction:
- desktop: open product drawer / modal
- mobile: open product bottom sheet

Provide category navigation at the top.

Example:

```text
All | Rice & Mains | Soups & Sauces | Sides & Snacks
```

---

# 12. Product Data Model

Do not hardcode product configuration directly into JSX.

Suggested TypeScript type:

```ts
type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  description?: string;
  image?: string;
  basePrice?: number;
  available: boolean;
  featured?: boolean;
  modifiers?: ProductModifier[];
};
```

Suggested modifier model:

```ts
type ProductModifier = {
  id: string;
  name: string;
  required: boolean;
  selectionType: "single" | "multiple";
  options: {
    id: string;
    label: string;
    priceAdjustment?: number;
    available: boolean;
  }[];
};
```

This allows different foods to have different modifier sets.

Examples:

```text
Jollof Rice:
- size
- protein
- pepper level

Puff-Puff:
- pack size
- quantity

Egusi:
- size
- protein
- pepper level

A dish may have no modifiers.
```

Do not assume all products support:
- protein
- pepper level
- tray size

---

# 13. Product Drawer / Bottom Sheet

The product customization UI should support:

- image
- name
- description
- price
- available modifiers
- quantity
- allergen information link
- Add to Order button

Example:

```text
JOLLOF RICE

[food image]

Description

SELECT SIZE
○ Small
○ Large

PROTEIN
○ Chicken
○ Beef
○ Goat

PEPPER LEVEL
1  2  3  4  5

Quantity
-  1  +

$XX

ADD TO ORDER
```

Only show modifier groups that exist for that product.

If pepper level is confirmed as a ComEat feature, labels should clarify the scale.

Example:

```text
1 = Mild
5 = Very Hot
```

---

# 14. Cart

Use Zustand.

Cart functions:

```ts
addItem()
removeItem()
updateQuantity()
clearCart()
calculateSubtotal()
```

Persist guest cart locally.

Suggested cart item structure:

```ts
type CartItem = {
  cartItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  selectedModifiers: {
    modifierId: string;
    optionId: string;
    label: string;
  }[];
};
```

Do not rely on the browser-stored price for checkout.

The server must retrieve and validate authoritative pricing.

Cart screen should include:

- product
- selected options
- quantity
- remove
- subtotal
- delivery TBD
- tax TBD
- estimated total
- checkout CTA

---

# 15. Checkout Flow

Recommended multi-step checkout:

```text
ORDER
→ DETAILS
→ DELIVERY
→ PAYMENT
→ CONFIRMATION
```

## Customer Details

Fields:

- first name
- last name
- email
- phone

## Delivery Details

Fields:

- street address
- apartment / suite
- city
- state
- ZIP code
- requested delivery date
- delivery notes

Delivery fields must be adapted after the client confirms:
- pickup availability
- delivery range
- shipping
- available states

## Allergy / Dietary Information

Include a clearly visible field:

```text
Allergies or dietary requirements
```

Add an informational warning that customers should notify ComEat of allergies.

## Order Date Rules

If the client confirms the 48-hour rule:
- disable invalid dates in the UI
- validate the date again server-side
- make the lead time configurable

Do not rely on disabled frontend dates alone.

---

# 16. Payment System

Use Stripe.

Supported payment experience should include:

## Cards

- Visa
- Mastercard
- Discover
- American Express

## Cash App

- Cash App Pay

Use Stripe-supported secure components.

Recommended approach:
- Stripe Payment Element
- PaymentIntent
- Webhooks

Do not:
- store card number
- store CVC
- build custom card-processing infrastructure
- trust a client-reported payment result

---

# 17. Payment Flow

Recommended flow:

```text
Customer clicks Pay
        ↓
Server receives cart item IDs + selected modifiers
        ↓
Server loads authoritative product prices
        ↓
Server validates modifiers
        ↓
Server calculates subtotal
        ↓
Server calculates tax / delivery if configured
        ↓
Server creates pending order
        ↓
Server creates Stripe PaymentIntent
        ↓
Stripe Payment Element handles payment
        ↓
Stripe webhook receives payment result
        ↓
Webhook verifies event signature
        ↓
Order becomes PAID
        ↓
Confirmation email sent
        ↓
Customer redirected to order-success
```

The webhook is the authoritative source for successful payment.

---

# 18. Order Statuses

Use a controlled enum.

Recommended:

```text
PENDING
PAYMENT_PENDING
PAID
CONFIRMED
PREPARING
READY
DISPATCHED
COMPLETED
CANCELLED
REFUNDED
```

Not every status must appear in the UI immediately.

---

# 19. Order Reference

Generate a readable order reference.

Example format:

```text
COM-20260825-A82F
```

Do not expose a sequential database ID publicly.

---

# 20. Recommended Database Models

Initial Prisma model concepts:

## ProductReference

Only create a local Product table if needed.

If Sanity is the authoritative product source, store Sanity product IDs in order items.

## Order

Fields may include:

```text
id
publicReference
status
customerFirstName
customerLastName
email
phone
subtotal
deliveryFee
tax
total
currency
stripePaymentIntentId
paymentMethodType
deliveryDate
deliveryAddress
deliveryNotes
allergyNotes
createdAt
updatedAt
```

## OrderItem

```text
id
orderId
productExternalId
productNameSnapshot
unitPriceSnapshot
quantity
lineTotal
```

## OrderItemModifier

```text
id
orderItemId
modifierNameSnapshot
optionNameSnapshot
priceAdjustmentSnapshot
```

Use snapshots of product names and prices in historical orders so later menu edits do not change old receipts.

## CateringInquiry

```text
id
name
email
phone
eventType
eventDate
guestCount
message
status
createdAt
```

---

# 21. CMS Structure

Sanity schemas should support:

## Product

- name
- slug
- category
- image
- gallery
- description
- base price
- availability
- featured
- modifiers
- dietary / allergen notes
- sort order

## Category

- name
- slug
- description
- hero image
- sort order

## Site Settings

- business name
- logo
- phone
- email
- address
- social links
- ordering rules
- minimum advance-order hours
- delivery notes
- SEO defaults

## Homepage Content

- hero copy
- hero image/video
- featured foods
- brand statement
- catering image/copy
- CTA copy

## FAQ

- question
- answer
- sort order

---

# 22. Catering Page

Include:

- strong hero
- event photography
- catering use cases
- simple process
- inquiry form

Suggested inquiry fields:

```text
Name
Email
Phone
Event type
Event date
Guest count
Location
Message
```

Do not display package pricing unless the client provides it.

---

# 23. Contact Page

Include:

- phone
- email
- business location
- opening hours
- contact form
- social media
- map if appropriate

All values are TBD until confirmed.

---

# 24. FAQ Page

Suggested categories:

- Ordering
- Delivery
- Catering
- Allergies
- Payments
- Food preparation

Only publish confirmed policies.

---

# 25. Motion / Animation Guidelines

Use Motion sparingly.

Allowed ideas:
- subtle text reveal
- image reveal on scroll
- gentle image scale on hover
- cart drawer transition
- product drawer transition
- subtle section fade
- reduced-motion support

Avoid:
- bouncing buttons
- excessive parallax
- spinning UI
- decorative animation overload
- animation that delays ordering

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 26. Accessibility Requirements

Aim for WCAG-conscious implementation.

Requirements:

- semantic HTML
- proper heading hierarchy
- keyboard navigation
- visible focus states
- sufficient color contrast
- accessible form labels
- descriptive validation errors
- alt text for meaningful images
- aria labels where necessary
- modal focus trapping
- Escape closes modals
- no information conveyed by color alone
- reduced-motion support

Checkout must be fully keyboard accessible.

---

# 27. Performance Requirements

Target good Core Web Vitals.

Use:

- Next/Image
- WebP / AVIF
- responsive image sizes
- lazy loading
- optimized fonts
- dynamic imports for noncritical features
- compressed video
- poster frames for video
- server rendering where appropriate
- minimal client-side JavaScript

Aim for Lighthouse:

```text
Performance: 90+
Accessibility: 95+
Best Practices: 95+
SEO: 95+
```

These are targets, not reasons to compromise usability.

---

# 28. SEO

Implement:

- Next.js Metadata API
- title templates
- meta descriptions
- canonical URLs
- sitemap
- robots.txt
- Open Graph
- Twitter card metadata
- LocalBusiness / Restaurant structured data where accurate
- relevant menu structured data where appropriate

Do not generate city-specific SEO copy until the exact city/state is confirmed.

Potential future search targets once location is known:

```text
Nigerian food [city]
African food [city]
Nigerian catering [city]
Jollof rice catering [city]
```

---

# 29. Analytics

Integrate:

- GA4
- Google Search Console

Suggested events:

```text
menu_view
product_view
add_to_cart
remove_from_cart
begin_checkout
payment_method_selected
purchase
catering_form_submit
contact_form_submit
call_click
```

Do not include sensitive customer information in analytics payloads.

---

# 30. Email Notifications

Use Resend.

Customer emails:

1. Order received
2. Payment confirmed
3. Order confirmed
4. Order ready / dispatched if used

Business emails:

1. New paid order
2. New catering inquiry
3. New contact inquiry

Do not send "payment successful" email based solely on frontend state.

Trigger it after verified server payment confirmation.

---

# 31. Security Requirements

- validate all incoming server requests
- verify Stripe webhook signatures
- never expose secret keys
- sanitize user input
- use environment variables
- rate-limit sensitive endpoints if needed
- protect admin functionality
- calculate totals server-side
- do not trust product prices from the client
- avoid storing unnecessary personal data
- use HTTPS in production
- validate delivery date server-side
- validate modifiers server-side

---

# 32. Environment Variables

Example `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=

NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_API_TOKEN=

DATABASE_URL=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

RESEND_API_KEY=
ORDER_NOTIFICATION_EMAIL=

NEXT_PUBLIC_GA_ID=
```

Never commit `.env.local`.

Create `.env.example` with blank values.

---

# 33. Suggested Folder Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   ├── catering/
│   │   └── contact/
│   │
│   ├── menu/
│   ├── catering/
│   ├── about/
│   ├── contact/
│   ├── faq/
│   ├── cart/
│   ├── checkout/
│   ├── order-success/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   │
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── FeaturedDishes.tsx
│   │   ├── BrandStory.tsx
│   │   ├── MenuPreview.tsx
│   │   ├── CateringSection.tsx
│   │   ├── OrderingSteps.tsx
│   │   ├── FoodGallery.tsx
│   │   ├── Testimonials.tsx
│   │   └── FinalCTA.tsx
│   │
│   ├── menu/
│   │   ├── MenuCategoryNav.tsx
│   │   ├── MenuSection.tsx
│   │   ├── MenuItem.tsx
│   │   ├── ProductDrawer.tsx
│   │   └── ProductModifierGroup.tsx
│   │
│   ├── cart/
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   │
│   ├── checkout/
│   │   ├── CustomerDetailsForm.tsx
│   │   ├── DeliveryForm.tsx
│   │   ├── AllergyNotes.tsx
│   │   ├── PaymentSection.tsx
│   │   └── OrderSummary.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Container.tsx
│       ├── SectionHeading.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Modal.tsx
│       └── Spinner.tsx
│
├── lib/
│   ├── sanity/
│   ├── stripe/
│   ├── prisma/
│   ├── resend/
│   ├── validators/
│   └── utils/
│
├── store/
│   └── cart-store.ts
│
├── types/
│   ├── product.ts
│   ├── cart.ts
│   └── order.ts
│
└── styles/
```

Keep naming consistent.

---

# 34. Implementation Phases

Codex should build the project in phases.

Do not attempt the full site in one giant change.

## Phase 1 — Project Foundation

Tasks:

1. Create Next.js app
2. Enable TypeScript
3. Configure Tailwind
4. Add fonts
5. Add global CSS variables
6. Create folder structure
7. Create base layout
8. Create reusable Container and Button
9. Add ESLint / formatting setup
10. Create `.env.example`

Acceptance criteria:

- app runs locally
- TypeScript has no errors
- global theme renders correctly
- responsive container works
- fonts load correctly
- no secret values committed

---

# 35. Phase 2 — Homepage UI

Build:

1. Navbar
2. Hero
3. Featured Dishes
4. Brand Story
5. Menu Preview
6. Catering Section
7. Ordering Steps
8. Food Gallery
9. Testimonials placeholder structure
10. Final CTA
11. Footer

Acceptance criteria:

- homepage works on mobile/tablet/desktop
- follows brand palette
- no unnecessary visual clutter
- all CTA links point to valid routes
- all sections use reusable layout patterns
- page is keyboard accessible

---

# 36. Phase 3 — Menu UI

Build:

1. menu route
2. confirmed categories
3. confirmed 17 menu items
4. temporary placeholder descriptions
5. placeholder prices marked TBD
6. category nav
7. product drawer / bottom sheet
8. modifier UI architecture

Acceptance criteria:

- all 17 confirmed products exist
- no unapproved menu items
- products can open customization UI
- mobile sheet works
- desktop drawer/modal works
- modifier groups are data-driven

---

# 37. Phase 4 — Cart

Build Zustand cart.

Acceptance criteria:

- add item works
- duplicate configurations are handled intentionally
- quantity update works
- remove works
- cart survives page refresh
- empty cart state exists
- cart opens from navbar
- no authoritative price assumptions are made for backend payment yet

---

# 38. Phase 5 — CMS Integration

Set up Sanity.

Create schemas:

- category
- product
- FAQ
- homepage settings
- site settings

Seed the confirmed menu items.

Acceptance criteria:

- menu content is fetched from Sanity
- availability can be toggled
- featured products can be selected
- product modifiers are configurable
- frontend has sensible loading/error states

---

# 39. Phase 6 — Database

Set up PostgreSQL + Prisma.

Implement:

- Order
- OrderItem
- OrderItemModifier
- CateringInquiry

Acceptance criteria:

- migrations run successfully
- order draft can be created server-side
- historical line-item snapshots are supported
- no raw payment credentials exist in database

---

# 40. Phase 7 — Checkout UI

Build:

1. customer details
2. delivery details
3. requested date
4. allergy notes
5. order summary
6. validation
7. responsive payment area placeholder

Acceptance criteria:

- form validation works
- errors are accessible
- cart summary matches selections
- invalid empty checkout cannot proceed
- delivery date logic is configurable
- no hardcoded 48-hour rule unless client confirms it

---

# 41. Phase 8 — Stripe

Integrate Stripe.

Required payment methods:

- Cash App Pay
- cards:
  - Visa
  - Mastercard
  - Discover
  - American Express

Acceptance criteria:

- PaymentIntent created server-side
- authoritative totals calculated server-side
- Stripe Payment Element loads
- cards work in test mode
- Cash App Pay is enabled when eligible in the Stripe account
- failed payments do not mark orders paid
- webhook verifies signature
- successful webhook marks order paid
- duplicate webhook delivery does not create duplicate orders

---

# 42. Phase 9 — Email

Integrate Resend.

Acceptance criteria:

- paid order triggers customer email
- paid order triggers business notification
- catering inquiry triggers business email
- email failures do not corrupt order payment state
- emails contain order reference

---

# 43. Phase 10 — Catering + Contact

Build:
- catering form
- contact form

Acceptance criteria:

- validated fields
- success state
- error state
- submission saved or emailed as designed
- no fake client information

---

# 44. Phase 11 — SEO + Analytics

Implement:
- metadata
- sitemap
- robots
- structured data
- GA4
- Search Console readiness

Acceptance criteria:

- unique metadata for primary routes
- no placeholder location keywords in production
- structured data only includes confirmed business facts

---

# 45. Phase 12 — Testing

Test at minimum:

## Browsers

- Chrome desktop
- Edge desktop
- Safari desktop where available
- iPhone Safari
- Android Chrome

## Flows

- menu browsing
- product configuration
- cart
- cart persistence
- checkout validation
- payment success
- payment failure
- webhook handling
- confirmation email
- catering submission
- mobile navigation
- keyboard navigation

## Edge cases

- empty cart
- unavailable product
- price change after item added
- invalid modifier
- duplicate webhook
- invalid delivery date
- network error
- email provider error

---

# 46. Phase 13 — Deployment

Recommended infrastructure:

```text
Next.js app
→ Vercel

DNS / domain
→ Cloudflare

Content
→ Sanity

Orders
→ PostgreSQL

Payments
→ Stripe

Email
→ Resend
```

Deployment checklist:

- production env variables
- Stripe live keys
- Stripe webhook production endpoint
- verified sending domain for email
- custom domain
- HTTPS
- analytics
- Search Console
- Sanity production dataset
- database backups
- error monitoring if added

---

# 47. Development Order Summary

Follow this sequence:

```text
1. Foundation
2. Homepage
3. Menu
4. Product drawer
5. Cart
6. CMS
7. Database
8. Checkout UI
9. Stripe
10. Webhooks
11. Email
12. Catering
13. Contact
14. SEO
15. Analytics
16. Accessibility
17. Performance
18. Testing
19. Client review
20. Production launch
```

---

# 48. Initial Tasks for Codex

When starting the repository, Codex should first:

1. Inspect the existing repository.
2. Do not delete existing user work.
3. Report the current structure.
4. Identify whether Next.js is already installed.
5. Identify whether Tailwind is configured.
6. Identify package manager from lockfile.
7. Create or update the project in small commits / logical patches.
8. Start with Phase 1 only.
9. Do not install backend/payment/CMS dependencies until the relevant phase.
10. After each phase, summarize:
   - files added
   - files changed
   - commands run
   - tests performed
   - remaining TODOs

---

# 49. Visual Quality Checklist

Before considering any page complete, verify:

- Does it look like ComEat, not a generic template?
- Is food photography the main visual focus?
- Is gold being used as an accent instead of everywhere?
- Is orange reserved for intentional emphasis?
- Is typography strong and editorial?
- Is there enough spacing?
- Are cards being used only when they improve UX?
- Is the mobile design as polished as desktop?
- Are CTAs easy to find?
- Is ordering friction low?
- Are animations restrained?

---

# 50. Definition of Done for MVP

The MVP is complete when:

- all primary pages are live
- all 17 confirmed menu items are represented
- menu content is manageable
- products support configurable modifiers
- cart works
- checkout works
- Stripe card payments work
- Cash App Pay is available where supported
- payment webhooks confirm orders
- order data is saved
- confirmation emails are sent
- catering inquiry works
- mobile UX is polished
- accessibility basics are complete
- performance is strong
- metadata and sitemap exist
- no sensitive secrets are exposed
- no unconfirmed business details are invented
- client has reviewed production-ready staging

---

# 51. Final Instruction to Codex

Build ComEat as a premium, modern, mobile-first Nigerian food ordering experience.

Prioritize:
1. usability
2. visual quality
3. ordering simplicity
4. maintainable architecture
5. secure payment handling
6. performance
7. accessibility

Do not over-engineer.

Do not implement future features before the current phase is stable.

When information is missing, add a clearly labeled TODO and continue with a safe placeholder instead of inventing client details.
