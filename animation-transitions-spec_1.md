# Animation & Transition Spec — Food Ordering Website

## Context
This is a food ordering website built with **Next.js** (App Router, cart + checkout flow). The goal is a modern, premium feel — animations should guide attention and reinforce interactions, not decorate for its own sake. Implement using **Framer Motion** (aliased as `motion` from the `framer-motion` package — fully compatible with Next.js, but note the constraints below). Keep the codebase clean: reusable animation variants over one-off inline animations.

## Next.js-Specific Setup Notes
- **Client components required**: any component using Framer Motion (`motion.div`, `AnimatePresence`, hooks like `useScroll`) must have `"use client"` at the top of the file. Keep these as small, isolated client components — don't mark entire pages as client components just to animate one element; wrap only the interactive/animated piece.
- **Route transitions in App Router**: App Router does not support page-level exit animations out of the box (no built-in equivalent to Pages Router's `_app.js` transition wrapper). To animate between routes:
  - Use a template.js file per route segment (re-mounts on navigation, unlike layout.js) combined with a client-side `AnimatePresence` wrapper, OR
  - Use a library like `next-view-transitions` (wraps the native View Transitions API) for simpler cross-route animation, OR
  - Accept that full route-exit animations are non-trivial in App Router and prioritize in-page transitions (modals, drawers, tab/category switches) which don't have this limitation.
- **Shared layout animations (`layoutId`) across routes**: Framer Motion's `layoutId` shared-element trick works within a single client component tree. If the menu item and its detail view are on two different routes (not a modal/overlay on the same page), the shared-element morph won't work across a full navigation — keep the item detail as a modal/overlay on the same page rather than a separate route if you want that morph effect.
- **Hydration**: avoid animating based on `window`/viewport measurements during initial render — measure inside `useEffect` to avoid SSR/client mismatch.
- **Image component**: use `next/image` for all dish photos (menu cards, hero, cart fly animation clone) for optimization — Framer Motion animations apply fine on top of it via wrapping in a `motion.div`.

## Global Rules
- **Easing**: use ease-out curves everywhere (fast start, slow settle). Default curve: `cubic-bezier(0.16, 1, 0.3, 1)` ("ease-out-expo"). Never use linear or bounce/elastic easing on food-related UI — it feels playful/childish, not appetizing.
- **Durations**: hover/tap micro-interactions 150–250ms. Page/route transitions 300–400ms. Nothing should run longer than ~500ms except deliberate celebratory moments (order success).
- **Stagger**: when animating groups (menu cards, list items), stagger children by 30–50ms instead of animating all at once.
- **Accessibility**: respect `prefers-reduced-motion` — wrap animations so they're disabled/reduced when this is set. Use Framer Motion's `useReducedMotion()` hook.
- **Performance**: only animate `transform` and `opacity` (GPU-accelerated). Avoid animating `width`, `height`, `top`, `left`, box-shadow spread directly — use transform-based alternatives or accept the cost only for small/rare elements.

---

## 1. Hero / Landing Section
- **Staggered load-in**: logo → headline → subtext → CTA button, each element fades in + translateY(20px → 0), 100–150ms stagger between them.
- **Parallax hero image**: dish image in hero scrolls at a slower rate than the page (e.g. `translateY` tied to scroll offset at ~0.5x speed). Use `useScroll` + `useTransform` from Framer Motion.
- **Magnetic CTA button**: "Order Now" button subtly shifts toward cursor position within ~10-15px radius when hovered, springs back on mouse leave. Implement via `onMouseMove` calculating offset + `useSpring`.
- **Optional ambient detail**: subtle floating particles (steam/spice flecks) behind hero text via lightweight CSS keyframe animation — low opacity, slow drift, do not let it distract from text legibility.

## 2. Menu Browsing
- **Card hover**: on hover, card lifts via `translateY(-6px)` + shadow increases; the image *inside* the card scales to `1.05` (clip-path/overflow hidden on the container so only the image scales, not the whole card).
- **Category filter switch**: when switching category tabs, current items fade+scale out (`opacity 0, scale 0.95`), new items fade+scale in with ~40ms stagger per card. Use Framer Motion's `AnimatePresence` with `mode="popLayout"` for smooth reflow.
- **Image loading**: use shimmer/skeleton placeholders (animated gradient sweep) while images load — not spinners.
- **Item detail modal (shared element)**: when a menu item is clicked, its image should morph/expand into the detail modal using Framer Motion's `layoutId` (shared layout animation) rather than a hard modal pop-in.

## 3. Cart Interactions
- **Add-to-cart "fly" animation**: on "Add to Cart" click, clone a small version of the item image and animate it flying from the card's position to the cart icon's position (calculate via `getBoundingClientRect()` on both elements, animate a fixed-position clone along that path, fade out on arrival).
- **Cart icon feedback**: cart icon does a quick scale-bounce (`scale: [1, 1.2, 1]`) when the flying item "lands."
- **Cart badge count**: quantity number animates with a scale-pop (`scale: [1, 1.3, 1]`) on increment, not an instant text swap.
- **Cart drawer**: opens as a slide-in panel from the right edge, `translateX(100% → 0)`, ease-out-expo curve, ~350ms.
- **Quantity stepper (+/-)**: buttons scale down slightly on tap (`scale: 0.9`) then spring back — gives tactile feedback.

## 4. Checkout Flow
- **Progress stepper**: horizontal step indicator (Delivery → Payment → Confirm) with an animated fill line that grows as the user advances steps.
- **Step transitions**: each checkout step fades+slides horizontally (~20px) when moving forward/back, direction-aware (forward = slide from right, back = slide from left).
- **Order success state**: this is the emotional payoff — invest here.
  - Checkmark icon draws itself via SVG `stroke-dashoffset` animation (path draws from 0 to full length).
  - Optional: a subtle, brief confetti burst (small particle count, short duration, don't overdo it).
  - Order summary card fades/scales in after the checkmark completes.

## 5. Page / Route Transitions
- Fade + slight upward slide (`opacity 0→1`, `translateY(10px→0)`) between route changes, ~300ms.
- In App Router, implement via a `template.tsx` in the relevant route segment wrapping children in a `motion.div` with the enter animation (template.js remounts on every navigation, so the enter animation replays each time — exit animations need `next-view-transitions` or the View Transitions API since `AnimatePresence` alone can't hook into App Router's unmount timing across routes).
- Avoid hard cuts between pages; avoid full-page loaders/spinners for route changes — keep it fast, especially for mobile ordering flows.

## 6. Scroll Effects
Implement these three layered scroll effects. Keep them subtle — the goal is depth and polish, not spectacle.

1. **Fade-up reveal on scroll** — apply to menu sections, testimonials, "how it works" steps, and any content block below the fold. As each element enters the viewport, animate `opacity 0→1` and `translateY(30px→0)`, duration ~500ms, ease-out-expo curve. Fire once per element (don't re-trigger on scroll back up).
   ```jsx
   <motion.div
     initial={{ opacity: 0, y: 30 }}
     whileInView={{ opacity: 1, y: 0 }}
     viewport={{ once: true, amount: 0.3 }}
     transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
   >
   ```
   Build this as a small reusable wrapper component (e.g. `<ScrollReveal>`) rather than repeating the props on every element.

2. **Subtle hero parallax** — the hero dish image should move at roughly 30–50% of scroll speed as the user scrolls past the hero section, creating a sense of depth. Implement with `useScroll` + `useTransform`:
   ```jsx
   const { scrollY } = useScroll();
   const y = useTransform(scrollY, [0, 500], [0, 150]);
   ```
   Keep the movement subtle — do not let the image drift far enough to feel like a separate scroll-jacked section. This must be in a client component and should not run any viewport/window logic until after mount (avoid SSR/hydration mismatches).

3. **Sticky category navigation** — as the user scrolls through the menu, the category tabs (Rice, Soups, Sides, etc.) should stick to the top of the viewport (`position: sticky; top: 0`) and the currently active category should highlight based on which menu section is in view. Use `IntersectionObserver` on each category section to track visibility and update the active tab state — do not use a scroll-position math approach, it's less reliable. This is a functional UX effect, not decorative — prioritize correctness (right tab highlighted at the right scroll position) over animation flourish.

### Explicitly avoid
- **Scroll-jacking** (hijacking native scroll to drive custom scripted animations) — breaks on mobile, hurts usability, do not implement anywhere in the ordering flow.
- **Horizontal scroll sections** for browsing the menu — frustrating for an ordering flow, do not use.
- **Scroll-linked 3D/rotation/tilt effects** — disorienting and out of place for food content, do not use.

---

## Implementation Notes
- Centralize animation variants in a shared file (e.g. `animations/variants.js`) so hover/tap/stagger patterns are reused consistently instead of redefined per component.
- Use Framer Motion's `whileHover`, `whileTap`, and `layout` props for the majority of the interactions above — they cover most of this spec with minimal custom code.
- Test all animations on mobile — reduce or simplify parallax/particle effects on smaller viewports for performance.
- Confirm `prefers-reduced-motion` handling is applied globally, not just on a few components.

## Priority Order (if implementing incrementally)
1. Card hover + menu filter transitions (biggest visible impact, low effort)
2. Cart drawer slide-in + add-to-cart fly animation (highest "wow" factor)
3. Checkout success state (emotional payoff moment)
4. Hero staggered load-in + parallax
5. Shared element modal transition (highest effort, polish item)
