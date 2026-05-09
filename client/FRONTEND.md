# Frontend Development Guide

> Single source of truth for styling, component standards, architecture patterns, and development conventions in this Next.js + Tailwind CSS codebase.

---

## Table of Contents

1. [Design Token Reference](#1-design-token-reference)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Border Radius](#4-border-radius)
5. [Shadows & Elevation](#5-shadows--elevation)
6. [Z-Index Layers](#6-z-index-layers)
7. [Component Standards](#7-component-standards)
8. [Component Architecture](#8-component-architecture)
9. [Accessibility](#9-accessibility)
10. [File Structure](#10-file-structure)
11. [Naming Conventions](#11-naming-conventions)
12. [Styling Rules](#12-styling-rules)
13. [Do / Don't](#13-do--dont)

---

## 1. Design Token Reference

All tokens are defined in `app/globals.css` inside the `@theme inline` block.  
Tailwind reads them at build time and generates corresponding utility classes.

### How tokens become classes

```
--color-primary-600  →  bg-primary-600 / text-primary-600 / border-primary-600
--color-ink-soft     →  text-ink-soft / bg-ink-soft
--color-border       →  border-border
--radius-md          →  rounded-md
--shadow-card        →  shadow-card
--z-modal            →  z-modal
```

**Rule:** always use a token class. Never hardcode `text-gray-700`, `bg-indigo-600`, or `z-[1300]`.

---

## 2. Color System

### 2.1 Palettes

Six semantic palettes. Each runs 50–950 (or 50–900).  
Use the palette scale directly when you need a specific shade.  
Use semantic aliases (section 2.2) for structural UI decisions.

| Palette     | CSS prefix          | Tailwind prefix      | Purpose                                    |
|-------------|---------------------|----------------------|--------------------------------------------|
| Primary     | `--color-primary-*` | `primary-*`          | Brand actions, CTAs, links, focus rings    |
| Secondary   | `--color-secondary-*` | `secondary-*`      | Supporting actions, less prominent UI      |
| Neutral     | `--color-neutral-*` | `neutral-*`          | Text, borders, backgrounds, icons          |
| Success     | `--color-success-*` | `success-*`          | Order confirm, in-stock, success toasts    |
| Warning     | `--color-warning-*` | `warning-*`          | Low-stock, pending, caution banners        |
| Error       | `--color-error-*`   | `error-*`            | Validation, payment fail, delete actions   |

#### Usage scale guide

| Shade | Typical role                               |
|-------|--------------------------------------------|
| 50    | Tinted background (badge bg, alert bg)     |
| 100   | Focus ring color, hovered tinted bg        |
| 200   | Border in tinted context                   |
| 400   | Icon color in tinted context               |
| 500   | Icon color on white, ring color            |
| 600   | **Primary fill** — buttons, solid badges   |
| 700   | Hover state of 600                         |
| 800   | Active/pressed state of 600                |
| 900   | Text on white in high-contrast contexts    |

### 2.2 Semantic Aliases

Always prefer these over raw palette shades for structural UI.  
They communicate **intent**, not just a color stop.

#### Surface / Canvas

| Token                     | Tailwind class        | Value     | Use                                   |
|---------------------------|-----------------------|-----------|---------------------------------------|
| `--color-canvas`          | `bg-canvas`           | `#f9fafb` | Page background                       |
| `--color-surface`         | `bg-surface`          | `#ffffff`  | Cards, modals, inputs, sidebars       |
| `--color-surface-overlay` | `bg-surface-overlay`  | `rgba(0,0,0,0.5)` | Modal/drawer backdrop          |

#### Ink (Text)

| Token                   | Tailwind class      | Value     | Use                                      |
|-------------------------|---------------------|-----------|------------------------------------------|
| `--color-ink`           | `text-ink`          | `#111827` | Headings, prices, primary labels         |
| `--color-ink-soft`      | `text-ink-soft`     | `#374151` | Body text, secondary labels              |
| `--color-ink-muted`     | `text-ink-muted`    | `#6b7280` | Hints, captions, placeholders            |
| `--color-ink-disabled`  | `text-ink-disabled` | `#9ca3af` | Disabled inputs and text                 |
| `--color-ink-inverse`   | `text-ink-inverse`  | `#ffffff` | Text on filled (dark) backgrounds        |

#### Border

| Token                    | Tailwind class       | Value     | Use                          |
|--------------------------|----------------------|-----------|------------------------------|
| `--color-border`         | `border-border`      | `#e5e7eb` | Default input/card border    |
| `--color-border-strong`  | `border-border-strong` | `#d1d5db` | Emphasized dividers         |
| `--color-border-focus`   | `border-border-focus`  | `#4f46e5` | Focus ring (= primary-600)  |

### 2.3 Do / Don't — Colors

```tsx
// ✅ DO — semantic token for text
<p className="text-ink-soft">Secondary label</p>

// ❌ DON'T — hardcoded palette shade
<p className="text-gray-700">Secondary label</p>


// ✅ DO — palette shade for component fill
<span className="bg-success-50 text-success-700">In stock</span>

// ❌ DON'T — wrong shade for fill context
<span className="bg-success-600 text-success-600">In stock</span>


// ✅ DO — use primary-* for brand actions
<button className="bg-primary-600 hover:bg-primary-700">Buy now</button>

// ❌ DON'T — mix indigo and blue for the brand
<button className="bg-blue-600">Buy now</button>
```

---

## 3. Typography

Typography uses Tailwind's built-in scale. No custom font-size tokens needed.  
Geist Sans is the app font, configured as `--font-sans` in globals.css.

### 3.1 Font Families

| Token          | Tailwind class | Use                               |
|----------------|----------------|-----------------------------------|
| `--font-sans`  | `font-sans`    | All UI text (default)             |
| `--font-mono`  | `font-mono`    | Code, SKUs, order IDs, prices     |

### 3.2 Type Scale

| Class      | Size  | Use                                              |
|------------|-------|--------------------------------------------------|
| `text-xs`  | 12px  | Error messages, badges, helper text, timestamps  |
| `text-sm`  | 14px  | Body text, form labels, nav links, table cells   |
| `text-base`| 16px  | Default body, descriptions                       |
| `text-lg`  | 18px  | Card titles, prominent labels                    |
| `text-xl`  | 20px  | Section headings                                 |
| `text-2xl` | 24px  | Page headings                                    |
| `text-3xl` | 30px  | Hero headings                                    |
| `text-4xl` | 36px  | Display / marketing headings                     |

### 3.3 Font Weights

| Class           | Weight | Use                                    |
|-----------------|--------|----------------------------------------|
| `font-normal`   | 400    | Body text, descriptions                |
| `font-medium`   | 500    | Labels, nav links, data values         |
| `font-semibold` | 600    | Buttons, card titles, emphasized data  |
| `font-bold`     | 700    | Headings, prices, section titles       |

### 3.4 Line Heights

| Class            | Value | Use                          |
|------------------|-------|------------------------------|
| `leading-none`   | 1     | Display headings             |
| `leading-tight`  | 1.25  | Headings, compact UI         |
| `leading-normal` | 1.5   | Body text (default)          |
| `leading-relaxed`| 1.625 | Long-form descriptions       |

### 3.5 Letter Spacing

| Class              | Value      | Use                              |
|--------------------|------------|----------------------------------|
| `tracking-tight`   | -0.025em   | Large display headings           |
| `tracking-normal`  | 0em        | Body text (default)              |
| `tracking-wide`    | 0.025em    | UI badges, small labels          |
| `tracking-wider`   | 0.05em     | Uppercase category labels        |
| `tracking-widest`  | 0.1em      | All-caps overlines               |

### 3.6 Standard Combinations

```tsx
// Page heading
<h1 className="text-2xl font-bold leading-tight text-ink">Title</h1>

// Section heading
<h2 className="text-xl font-bold text-ink">Section</h2>

// Body text
<p className="text-sm leading-relaxed text-ink-soft">Description...</p>

// Helper / hint text
<p className="text-xs text-ink-muted">Must be at least 8 characters</p>

// Price
<p className="text-2xl font-bold font-mono text-ink">$29.99</p>

// Category label (badge)
<span className="text-xs font-medium tracking-wide uppercase text-primary-600">
  Electronics
</span>
```

---

## 4. Border Radius

Defined in `globals.css` as `--radius-*`. Maps directly to `rounded-*` Tailwind classes.

| Token          | Class         | Size  | Use                                     |
|----------------|---------------|-------|-----------------------------------------|
| `--radius-sm`  | `rounded-sm`  | 4px   | Tags, badges, tooltips, chips           |
| `--radius-md`  | `rounded-md`  | 8px   | **Buttons, inputs, dropdowns**          |
| `--radius-lg`  | `rounded-lg`  | 12px  | **Cards, panels, popovers**             |
| `--radius-xl`  | `rounded-xl`  | 16px  | Modals, sheets, bottom drawers          |
| `--radius-full`| `rounded-full`| 9999px| Avatars, pill badges, icon buttons      |

### Radius Do / Don't

```tsx
// ✅ DO — button uses rounded-md (8px)
<button className="rounded-md px-4 py-2">Add to Cart</button>

// ❌ DON'T — rounded-xl on a button is too large
<button className="rounded-xl px-4 py-2">Add to Cart</button>


// ✅ DO — card uses rounded-lg (12px)
<div className="rounded-lg border border-border bg-surface p-4">...</div>

// ❌ DON'T — rounded-md makes cards look like inputs
<div className="rounded-md border border-border bg-surface p-4">...</div>
```

---

## 5. Shadows & Elevation

Elevation communicates hierarchy. Higher = more prominent.

### 5.1 Elevation Levels

| Token            | Class           | Use                                         |
|------------------|-----------------|---------------------------------------------|
| `--shadow-sm`    | `shadow-sm`     | Subtle: default card state, input on focus  |
| `--shadow-md`    | `shadow-md`     | Lifted: card hover, floating action button  |
| `--shadow-lg`    | `shadow-lg`     | Elevated: dropdowns, popovers, tooltips     |

### 5.2 Semantic Shadow Aliases

| Token              | Class             | Mapped to    | Use                         |
|--------------------|-------------------|--------------|-----------------------------|
| `--shadow-card`    | `shadow-card`     | `shadow-sm`  | Product cards (resting)     |
| `--shadow-dropdown`| `shadow-dropdown` | `shadow-lg`  | Nav dropdown, select menus  |
| `--shadow-modal`   | `shadow-modal`    | custom deep  | Dialogs, sheets             |

### 5.3 Elevation Rules

- **Never** add shadows to already-elevated surfaces (don't put `shadow-modal` on a card inside a modal).
- Use hover transitions: `shadow-card hover:shadow-md transition-shadow`.
- Flat surfaces (page-level containers, table rows) have **no shadow**.

```tsx
// ✅ Card with elevation on hover
<div className="rounded-lg bg-surface shadow-card hover:shadow-md transition-shadow">
  ...
</div>

// ✅ Dropdown
<div className="absolute rounded-lg bg-surface shadow-dropdown z-dropdown">
  ...
</div>

// ❌ DON'T stack shadows
<div className="shadow-modal">
  <div className="shadow-card">...</div>  {/* redundant */}
</div>
```

---

## 6. Z-Index Layers

All z-index values are named tokens. **Never** use `z-[1300]` or `z-50`.

| Token          | Class        | Value | Use                               |
|----------------|--------------|-------|-----------------------------------|
| `--z-base`     | `z-base`     | 0     | Normal document flow              |
| `--z-raised`   | `z-raised`   | 10    | Sticky table headers, avatars     |
| `--z-dropdown` | `z-dropdown` | 1000  | Nav dropdowns, select menus       |
| `--z-sticky`   | `z-sticky`   | 1100  | Sticky navbar, sticky sidebars    |
| `--z-overlay`  | `z-overlay`  | 1200  | Modal backdrop / dimmer           |
| `--z-modal`    | `z-modal`    | 1300  | Modal dialogs, drawers, sheets    |
| `--z-tooltip`  | `z-tooltip`  | 1400  | Tooltips (must float above modal) |
| `--z-toast`    | `z-toast`    | 1500  | Notifications (always on top)     |

```tsx
// ✅ Navbar with correct sticky z-index
<nav className="sticky top-0 z-sticky bg-surface border-b border-border">

// ✅ Modal backdrop + dialog layering
<div className="fixed inset-0 bg-surface-overlay z-overlay" />
<div className="fixed inset-0 flex items-center justify-center z-modal">
  <div className="bg-surface rounded-xl shadow-modal p-6">...</div>
</div>

// ❌ DON'T hardcode z-index
<nav className="z-50">         {/* unclear, conflicts later */}
<div className="z-[1300]">    {/* bypasses the naming system */}
```

---

## 7. Component Standards

Every component must define: **variants**, **states**, **sizes**, and accept a `className` escape hatch.

### 7.1 Button

**File:** `components/ui/Button.tsx`

#### Variants

| Variant       | When to use                                           |
|---------------|-------------------------------------------------------|
| `primary`     | The single primary action on a page (submit, buy)     |
| `secondary`   | Alternative / less important actions                  |
| `danger`      | Destructive actions (delete, cancel order)            |
| `ghost`       | Toolbar actions, icon buttons in dense UI             |
| `link`        | Inline navigation links styled as text               |

> **One primary per view.** Never render two `primary` buttons side-by-side.

#### States

All states are handled by the component automatically. Pass props — don't recreate them.

| State      | Prop / CSS           | Notes                                        |
|------------|----------------------|----------------------------------------------|
| Default    | —                    | Base appearance                              |
| Hover      | `hover:` (automatic) | Slight darkening of fill                     |
| Active     | `active:` (automatic)| Pressed feel, darker fill                    |
| Focus      | `focus:` (automatic) | 2px ring, offset 2px — always visible        |
| Disabled   | `disabled={true}`    | 50% opacity, no pointer                      |
| Loading    | `loading={true}`     | Spinner replaces content, button is disabled |

#### Sizes

| Size | Class | Padding       | Text     | Use                         |
|------|-------|---------------|----------|-----------------------------|
| `sm` | —     | px-3 py-1.5   | 12px     | Compact tables, filter chips|
| `md` | —     | px-4 py-2.5   | 14px     | **Default** — most cases    |
| `lg` | —     | px-6 py-3     | 16px     | Hero CTAs, product page     |

#### Props

| Prop          | Type                                              | Default        | Description                          |
|---------------|---------------------------------------------------|----------------|--------------------------------------|
| `variant`     | `primary \| secondary \| danger \| ghost \| link` | `primary`      | Visual style                         |
| `size`        | `sm \| md \| lg`                                  | `md`           | Padding + font size                  |
| `loading`     | `boolean`                                         | `false`        | Shows spinner, disables the button   |
| `loadingText` | `string`                                          | `"Please wait…"` | Text shown next to spinner         |
| `leftIcon`    | `ReactNode`                                       | —              | Icon before label                    |
| `rightIcon`   | `ReactNode`                                       | —              | Icon after label                     |
| `iconOnly`    | `boolean`                                         | `false`        | Square padding for icon-only buttons |
| `fullWidth`   | `boolean`                                         | `false`        | Stretch to container width           |
| `className`   | `string`                                          | —              | Escape hatch for one-off overrides   |
| `...rest`     | `ButtonHTMLAttributes`                            | —              | All native button props              |

#### Code Examples

```tsx
// Primary submit
<Button type="submit" loading={loading} loadingText="Saving…" fullWidth>
  Save Changes
</Button>

// Secondary with icon
<Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
  Export CSV
</Button>

// Danger (destructive)
<Button variant="danger" size="sm">
  Delete Order
</Button>

// Icon-only button
<Button variant="ghost" iconOnly aria-label="Edit product">
  <Pencil className="w-4 h-4" />
</Button>

// Link variant (inline)
<p className="text-sm text-ink-soft">
  Don't have an account?{" "}
  <Button variant="link" onClick={openRegister}>Create one</Button>
</p>
```

#### Accessibility Notes

- Icon-only buttons **must** have `aria-label`.
- Use `type="submit"` on form submit buttons and `type="button"` on everything else inside a `<form>`.
- The `loading` state automatically disables the button — never manually handle both.
- Focus ring is always visible (2px primary ring). **Never remove it.**

---

### 7.2 Input

**File:** `components/ui/Input.tsx`

#### Variants

Input has a single base style with two visual states driven by data, not props:

| State   | Appearance                          | Triggered by     |
|---------|-------------------------------------|------------------|
| Default | Gray border, primary focus ring     | No error         |
| Error   | Red border, red focus ring          | `error` prop set |

#### States

| State      | How it appears                                         |
|------------|--------------------------------------------------------|
| Default    | `border-border`, `text-ink`                            |
| Focus      | Primary-colored ring (error → error-colored ring)      |
| Disabled   | Light gray background, muted text, no pointer          |
| Error      | Red border + ring + error message below                |
| With hint  | Gray helper text below (only shown when no error)      |
| Password   | Eye toggle appears automatically for `type="password"` |

#### Sizes

| Size | Padding          | Text  | Use                               |
|------|------------------|-------|-----------------------------------|
| `sm` | px-3 py-1.5      | 12px  | Compact filter inputs             |
| `md` | px-3.5 py-2.5    | 14px  | **Default** — all form fields     |
| `lg` | px-4 py-3        | 16px  | Search bar, prominent inputs      |

#### Props

| Prop        | Type                    | Default | Description                            |
|-------------|-------------------------|---------|----------------------------------------|
| `label`     | `string`                | —       | Label above the input (optional)       |
| `hint`      | `string`                | —       | Helper text below (hidden if error)    |
| `error`     | `string`                | —       | Error message; triggers error state    |
| `size`      | `sm \| md \| lg`        | `md`    | Controls padding and font size         |
| `leftIcon`  | `ReactNode`             | —       | Icon pinned inside left edge           |
| `rightIcon` | `ReactNode`             | —       | Icon pinned inside right edge          |
| `fullWidth` | `boolean`               | `true`  | Stretches wrapper to container width   |
| `className` | `string`                | —       | Escape hatch for the `<input>` element |
| `...rest`   | `InputHTMLAttributes`   | —       | All native input props                 |

> `type="password"` automatically adds the Eye/EyeOff toggle. No extra prop needed.

#### Code Examples

```tsx
// Basic labeled input
<Input
  name="email"
  type="email"
  label="Email address"
  placeholder="you@example.com"
  hint="We'll never share your email"
/>

// With validation error
<Input
  name="email"
  type="email"
  label="Email address"
  error={errors.email}
/>

// Password (toggle built in)
<Input
  name="password"
  type="password"
  label="Password"
  hint="Minimum 8 characters"
  error={errors.password}
/>

// Search bar with icon
import { Search } from "lucide-react";
<Input
  type="search"
  placeholder="Search products..."
  leftIcon={<Search className="w-4 h-4" />}
  size="lg"
/>

// Disabled state
<Input
  label="Email"
  value={user.email}
  disabled
  hint="Contact support to change your email"
/>
```

#### Accessibility Notes

- `id` is auto-generated via `useId()` if not provided — `label[htmlFor]` always links correctly.
- Error messages are wired to `aria-describedby` and `aria-invalid` automatically.
- Password toggle has `tabIndex={-1}` — keyboard users can't accidentally focus it.
- Always provide a `label` or an `aria-label` on standalone inputs (e.g. search bar).

---

## 8. Component Architecture

### 8.1 Atomic Design Layers

| Layer      | What goes here                                      | Examples                          |
|------------|-----------------------------------------------------|-----------------------------------|
| Atoms      | Smallest, single-purpose, no business logic         | `Button`, `Input`, `Badge`, `Spinner`, `Avatar` |
| Molecules  | Combination of atoms, one clear responsibility      | `FormField`, `SearchBar`, `PriceTag`, `ProductImage` |
| Organisms  | Full UI sections, may have state                    | `LoginForm`, `ProductCard`, `Navbar`, `CartDrawer` |
| Templates  | Page layouts without real data                      | `AuthLayout`, `ShopLayout`, `AdminLayout` |
| Pages      | Next.js page components — wire data to templates    | `app/page.tsx`, `app/login/page.tsx` |

**Rules:**
- Atoms have no knowledge of the app domain. `Button` doesn't know it's a "buy" button.
- Molecules/organisms can import atoms, never the reverse.
- Pages are thin. Their job is to fetch data and pass it to organisms.

### 8.2 Compound Components

Use compound components when a component has multiple cooperating parts that share context but need layout flexibility at the call site.

```tsx
// Single-prop approach — rigid, hard to extend
<ProductCard
  title="Widget"
  price={29.99}
  badge="In Stock"
  actions={<Button>Buy</Button>}
/>

// Compound approach — flexible, readable
<ProductCard>
  <ProductCard.Image src={img} alt="Widget" />
  <ProductCard.Body>
    <ProductCard.Badge variant="success">In Stock</ProductCard.Badge>
    <ProductCard.Title>Widget</ProductCard.Title>
    <ProductCard.Price value={29.99} />
  </ProductCard.Body>
  <ProductCard.Footer>
    <Button fullWidth>Add to Cart</Button>
  </ProductCard.Footer>
</ProductCard>
```

Use compound components for: Cards, Modals, Tabs, Accordions, Dropdowns.  
Don't over-engineer atoms (Button, Input) into compounds — they're simple enough.

### 8.3 Configuration Pattern

Components are **pre-configured with sensible defaults** so the common case requires zero props:

```tsx
// Works perfectly out of the box
<Button>Add to Cart</Button>

// Full control when needed
<Button variant="danger" size="sm" loading={deleting} loadingText="Deleting…">
  Delete Order
</Button>
```

Rules for defaults:
- Default variant = the most-used variant.
- Default size = `md` for every component.
- Boolean props default to `false`.
- `fullWidth` defaults to `false` for Button, `true` for Input (form context assumption).

### 8.4 Escape Hatch Pattern

Every component accepts `className` as a last-resort override. Internal classes always come first; `className` comes last so it wins on conflict.

```tsx
// Stretch a button to fill a grid cell
<Button className="col-span-2">Checkout</Button>

// One-off margin on an Input
<Input label="Name" className="mt-4" />
```

`className` should override layout/spacing, not color or shape (those belong in variants).

---

## 9. Accessibility

### 9.1 Focus Management

- **Never remove focus rings.** The design system's focus ring is 2px primary with 2px offset — always visible, high contrast.
- When a modal opens, move focus to the first interactive element inside it.
- When a modal closes, return focus to the trigger element.

### 9.2 ARIA Patterns

```tsx
// Error-connected input (done automatically by Input component)
<input aria-invalid={true} aria-describedby="email-error" />
<p id="email-error">Email is required</p>

// Icon-only button
<button aria-label="Remove item from cart">
  <X className="w-4 h-4" />
</button>

// Live region for async feedback (toasts, order status)
<div aria-live="polite" aria-atomic="true">
  {toastMessage}
</div>

// Loading state
<button aria-busy={loading} disabled={loading}>
  {loading ? "Processing…" : "Place Order"}
</button>
```

### 9.3 Keyboard Navigation

- All interactive elements must be reachable via Tab.
- Dropdowns: arrow keys navigate, Escape closes, Enter/Space selects.
- Modals: Tab cycles within the modal (trap focus). Escape closes.
- Password toggle: `tabIndex={-1}` keeps it out of tab flow (handled by Input).

### 9.4 Color Contrast

| Pairing                              | Ratio   | Status |
|--------------------------------------|---------|--------|
| `text-ink` on `bg-surface`           | 16.1:1  | ✅ AAA |
| `text-ink-soft` on `bg-surface`      | 9.4:1   | ✅ AAA |
| `text-ink-muted` on `bg-surface`     | 4.7:1   | ✅ AA  |
| `text-ink-inverse` on `bg-primary-600`| 4.6:1  | ✅ AA  |
| `text-ink-disabled` on `bg-surface`  | 2.9:1   | ⚠️ Intentional — disabled text is meant to be unreadable |

**Rule:** Never use `text-ink-muted` for important information — it only passes AA, not AAA.

---

## 10. File Structure

```
client/
├── app/                        # Next.js App Router pages
│   ├── globals.css             # ← Design tokens live here
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── login/page.tsx
│   ├── search/page.tsx
│   ├── products/[id]/page.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── login/page.tsx
│   │   ├── orders/page.tsx
│   │   └── products/page.tsx
│   └── api/                    # Route handlers
│
├── components/
│   ├── ui/                     # ← Atoms (design system components)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── ...                 # Badge, Avatar, Spinner, etc.
│   ├── layout/                 # Organisms used in layout
│   │   └── Navbar.tsx
│   └── [feature]/              # Feature-specific organisms
│       └── ProductCard.tsx
│
├── lib/                        # Utilities, auth config
│   └── auth.ts
│
├── types/                      # TypeScript declarations
│   └── next-auth.d.ts
│
└── FRONTEND.md                 # ← You are here
```

---

## 11. Naming Conventions

### Files

| Type               | Convention         | Example                        |
|--------------------|--------------------|--------------------------------|
| Components         | PascalCase         | `ProductCard.tsx`              |
| Pages              | `page.tsx`         | `app/login/page.tsx`           |
| Utilities / hooks  | camelCase          | `useCart.ts`, `formatPrice.ts` |
| Types              | camelCase or PascalCase | `next-auth.d.ts`          |

### Components

- Name matches filename: `ProductCard.tsx` exports `ProductCard`.
- Always use named exports for utilities; default export for page components and UI components.
- Set `displayName` on `forwardRef` components: `Input.displayName = "Input"`.

### Props

- Boolean props: no prefix unless it aids clarity — `loading`, `disabled`, `fullWidth`.
- Event props: `on` + PascalCase — `onClick`, `onSubmit`, `onQuantityChange`.
- Render props: `render` + PascalCase — `renderItem`, `renderEmpty`.
- Avoid abbreviations in prop names: `errorMessage` not `errMsg`.

### CSS / Tailwind

- Use token classes in order: **layout → spacing → typography → color → border → shadow → animation**.
- Group related utilities on the same line; break at logical boundaries for long class strings.
- Use `clsx()` for conditional classes — never string concatenation.

```tsx
// ✅ Ordered, grouped
<div className="flex items-center gap-3 px-4 py-2 text-sm text-ink-soft bg-surface border border-border rounded-md shadow-sm">

// ❌ Random order, hard to scan
<div className="border-border text-sm flex bg-surface shadow-sm rounded-md py-2 text-ink-soft items-center px-4 gap-3 border">
```

---

## 12. Styling Rules

### 12.1 Tailwind First

Use Tailwind utility classes for **everything**. Reach for `globals.css` only for:
- Design token definitions (`@theme`)
- Global resets or base styles (`body`, `*`)
- Third-party overrides you can't scope otherwise

```tsx
// ✅ Tailwind utility
<div className="flex items-center gap-2">

// ❌ Custom CSS for layout
// .card-container { display: flex; align-items: center; gap: 8px; }
```

### 12.2 Class Merging with clsx

Always use `clsx` for conditional or composed class names.

```tsx
import clsx from "clsx";

// ✅ Clean conditionals
<div className={clsx(
  "rounded-lg border bg-surface p-4",
  isActive && "border-primary-500 shadow-md",
  isDisabled && "opacity-50 pointer-events-none",
  className,   // always last — lets callers override
)}>

// ❌ String concatenation — brittle, hard to read
<div className={"rounded-lg border bg-surface p-4" + (isActive ? " border-primary-500 shadow-md" : "")}>
```

### 12.3 No Inline Styles

```tsx
// ✅ Tailwind arbitrary value (rare, justified)
<div className="w-[72px]">    {/* specific design requirement */}

// ❌ Inline style
<div style={{ width: "72px" }}>
```

Exception: truly dynamic values (e.g. progress bar width from percentage, chart dimensions).

### 12.4 Responsive Design

Mobile-first. Base styles are mobile; layer up with breakpoints.

```tsx
// ✅ Mobile-first
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ Desktop-first (adds unnecessary specificity)
<div className="grid grid-cols-3 lg:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
```

Standard breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

### 12.5 Server vs Client Components

- Default to **Server Components**. Only add `"use client"` when you need:
  - `useState`, `useEffect`, `useRef`, or any other hook
  - Browser-only APIs
  - Event listeners
- `Input` is a client component (needs `useState` for password toggle).
- `Button` is a server component — no hooks needed.

---

## 13. Do / Don't

### Colors

```tsx
// ✅ Use semantic ink token for text
<label className="text-sm font-medium text-ink-soft">Email</label>

// ❌ Hardcode a gray shade
<label className="text-sm font-medium text-gray-700">Email</label>
```

```tsx
// ✅ Use primary tokens for brand color
<a className="text-primary-600 hover:text-primary-700">View order</a>

// ❌ Mix indigo and blue for the same intent
<a className="text-blue-600 hover:text-indigo-700">View order</a>
```

### Buttons

```tsx
// ✅ One primary action per view
<div className="flex gap-3">
  <Button variant="secondary">Cancel</Button>
  <Button variant="primary">Confirm Order</Button>
</div>

// ❌ Two primary buttons compete for attention
<div className="flex gap-3">
  <Button variant="primary">Cancel</Button>
  <Button variant="primary">Confirm</Button>
</div>
```

```tsx
// ✅ Use the Button component
<Button loading={submitting} fullWidth type="submit">Place Order</Button>

// ❌ Rebuild button styles from scratch
<button
  className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2.5
             hover:bg-indigo-700 disabled:opacity-50"
  disabled={submitting}
>
  Place Order
</button>
```

### Z-Index

```tsx
// ✅ Named layer
<div className="fixed inset-0 z-overlay bg-surface-overlay" />

// ❌ Magic number
<div className="fixed inset-0 z-[1200] bg-black/50" />
```

### Component Design

```tsx
// ✅ Escape hatch for layout, not appearance
<Button className="w-full sm:w-auto">Checkout</Button>

// ❌ Override colors via className — breaks consistency
<Button className="bg-green-500 hover:bg-green-600">Checkout</Button>
// → Add a "success" variant to Button instead
```

```tsx
// ✅ Accept and spread ...rest props for flexibility
function Badge({ children, className, ...props }) {
  return <span className={clsx("...", className)} {...props}>{children}</span>;
}

// ❌ Swallow extra props silently
function Badge({ children }) {
  return <span className="...">{children}</span>;
}
```

### Typography

```tsx
// ✅ Semantic combination
<h1 className="text-2xl font-bold leading-tight text-ink">Product Title</h1>
<p  className="text-sm leading-relaxed text-ink-soft mt-1">Description</p>

// ❌ Ad-hoc sizing
<h1 className="text-[22px] font-[750] text-[#111]">Product Title</h1>
```

### Forms

```tsx
// ✅ Always use Input component — validation + a11y are built in
<Input
  name="email"
  type="email"
  label="Email"
  error={errors.email}
  hint="We'll send the receipt here"
/>

// ❌ Raw input — manual wiring, no consistency
<div>
  <label className="text-sm text-gray-700">Email</label>
  <input className="border border-gray-300 rounded-lg px-3 py-2 w-full" />
  {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
</div>
```
