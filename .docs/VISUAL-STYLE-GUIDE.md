# ClipForge Visual Style Guide

## Color Palette

### Background Colors
```
Primary Background:   bg-editor-bg (gray-950)     #0a0a0a
Panel Background:     bg-editor-panel (gray-800)  #1f2937
Hover Background:     bg-editor-hover (gray-700)  #374151
Border Color:         border-editor-border        #4b5563
```

### Accent Colors
```
Primary Accent:       Blue #3b82f6   (Import, Links, Primary Actions)
Success:              Green #10b981  (Status, Success States)
Warning:              Yellow #f59e0b (Warnings, Alerts)
Danger:               Red #ef4444    (Delete, Record, Errors)
Info:                 Purple #8b5cf6 (System Info, Metadata)
```

### Text Colors
```
Primary Text:         text-white / text-gray-200
Secondary Text:       text-gray-400
Tertiary Text:        text-gray-500
Disabled Text:        text-gray-600
```

---

## Typography

### Font Sizes
```
Heading 1:    text-2xl (24px)    - Page titles
Heading 2:    text-xl (20px)     - Section headers
Heading 3:    text-lg (18px)     - Subsection headers
Body:         text-sm (14px)     - Default text
Small:        text-xs (12px)     - Labels, metadata
Tiny:         text-[10px]        - Timestamps, badges
```

### Font Weights
```
Bold:         font-bold (700)    - Titles, emphasis
Semibold:     font-semibold (600) - Headers, labels
Medium:       font-medium (500)  - Body text emphasis
Regular:      font-normal (400)  - Body text
```

### Special Fonts
```
Monospace:    font-mono          - Code, timestamps, technical info
```

---

## Spacing System

### Padding Scale (based on 4px)
```
p-2:  8px     - Tight internal spacing
p-3:  12px    - Default card padding
p-4:  16px    - Standard container padding
p-5:  20px    - Large card padding
p-6:  24px    - Panel padding
```

### Gap/Margin Scale
```
gap-2:  8px   - Tight element spacing
gap-3:  12px  - Default grid gaps
gap-4:  16px  - Standard gaps
gap-6:  24px  - Section spacing
```

### Vertical Rhythm
```
space-y-2:  8px    - Tight lists
space-y-3:  12px   - Default lists
space-y-4:  16px   - Sections
space-y-6:  24px   - Major sections
```

---

## Border Styles

### Border Widths
```
border:       1px     - Default borders
border-2:     2px     - Emphasis borders, selection
border-4:     4px     - Strong emphasis
```

### Border Styles
```
Solid:        border-solid       - Default
Dashed:       border-dashed      - Drop zones, empty states
```

### Border Radius
```
rounded:      4px     - Small elements
rounded-lg:   8px     - Cards, buttons, panels
rounded-xl:   12px    - Large containers
rounded-full: 50%     - Circles, badges
```

---

## Shadow System

### Shadow Depths
```
shadow-sm:    Subtle hover hint
shadow-md:    Default hover state
shadow-lg:    Active cards, buttons
shadow-xl:    Modal overlays
shadow-2xl:   Video player, hero elements
```

### Custom Shadows
```
Blue Glow:    shadow-blue-500/20    - Selection, focus
Drop Shadow:  drop-shadow(...)      - SVG elements
Box Shadow:   Custom RGBA shadows   - Neon effects
```

---

## Interactive States

### Button States
```css
/* Primary Button */
.btn-primary {
  @apply px-4 py-2.5 
         bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
         rounded-lg text-sm font-medium 
         transition-all duration-150 ease-out 
         shadow-md hover:shadow-lg
         focus-visible:outline-none focus-visible:ring-2 
         focus-visible:ring-blue-500 focus-visible:ring-offset-2 
         focus-visible:ring-offset-gray-900;
}

/* Danger Button */
.btn-danger {
  @apply px-4 py-2.5 
         bg-red-600 hover:bg-red-700 active:bg-red-800 
         rounded-lg text-sm font-medium 
         transition-all duration-150 ease-out 
         shadow-md hover:shadow-lg
         focus-visible:outline-none focus-visible:ring-2 
         focus-visible:ring-red-500 focus-visible:ring-offset-2 
         focus-visible:ring-offset-gray-900;
}

/* Success Button */
.btn-success {
  @apply px-4 py-2.5 
         bg-green-600 hover:bg-green-700 active:bg-green-800 
         rounded-lg text-sm font-medium 
         transition-all duration-150 ease-out 
         shadow-md hover:shadow-lg
         focus-visible:outline-none focus-visible:ring-2 
         focus-visible:ring-green-500 focus-visible:ring-offset-2 
         focus-visible:ring-offset-gray-900;
}

/* Disabled State */
.btn-disabled {
  @apply disabled:bg-gray-600 
         disabled:cursor-not-allowed 
         disabled:opacity-50;
}
```

### Card States
```css
.card {
  @apply bg-gray-800 border border-gray-700 
         rounded-lg p-5 shadow-lg
         transition-all duration-150 ease-out;
}

.card-hover {
  @apply hover:bg-gray-700 hover:border-gray-600 
         hover:shadow-xl;
}

.card-selected {
  @apply ring-2 ring-blue-500 
         bg-gray-700 shadow-lg shadow-blue-500/20;
}
```

### Media Item States
```css
.media-item {
  @apply cursor-grab active:cursor-grabbing 
         bg-editor-panel border border-editor-border 
         rounded-lg overflow-hidden
         transition-all duration-150 ease-out;
}

.media-item-hover {
  @apply hover:bg-editor-hover hover:border-gray-600 
         hover:shadow-md;
}

.media-item-selected {
  @apply ring-2 ring-blue-500 bg-editor-hover 
         shadow-lg shadow-blue-500/20;
}
```

---

## Animation Guidelines

### Duration Standards
```
Ultra Fast:   75ms    - Micro-interactions
Fast:         150ms   - Button states, hovers
Standard:     200ms   - Default transitions
Slow:         300ms   - Page transitions
```

### Timing Functions
```
ease-out:     Preferred for most interactions
ease-in:      For element exits
ease-in-out:  For continuous loops
linear:       For loading spinners
```

### Common Animations
```css
/* Pulse (for indicators) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin (for loading) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade In */
.fade-in {
  @apply animate-in fade-in duration-150;
}
```

---

## Layout Patterns

### 3-Column Grid
```
grid-cols-12
├─ col-span-3  (Media Library - 25%)
├─ col-span-6  (Center Panel - 50%)
└─ col-span-3  (Right Panel - 25%)
```

### Center Panel Split (Vertical)
```
flex flex-col
├─ h-3/5  (Video Preview - 60%)
└─ h-2/5  (Timeline - 40%)
```

### Card Layout
```html
<div class="bg-gray-800 border border-gray-700 rounded-lg p-5 shadow-lg">
  <h2 class="text-lg font-semibold mb-4 text-gray-200">
    <!-- Header -->
  </h2>
  <div class="space-y-3">
    <!-- Content -->
  </div>
</div>
```

---

## Component Patterns

### Status Badge
```html
<span class="px-2.5 py-1 rounded-full text-xs font-semibold 
             bg-green-600/20 text-green-400 border border-green-600/40">
  ACTIVE
</span>
```

### Info Row
```html
<div class="flex items-center justify-between p-2 
            bg-gray-900 rounded border border-gray-700">
  <span class="text-gray-400 font-medium">Label:</span>
  <span class="font-mono text-blue-400 font-semibold">Value</span>
</div>
```

### Empty State
```html
<div class="flex items-center justify-center h-full">
  <div class="text-center">
    <div class="text-5xl mb-3 opacity-40">🎬</div>
    <p class="text-lg font-medium text-gray-300 mb-1">Primary Message</p>
    <p class="text-sm text-gray-500">Secondary Message</p>
  </div>
</div>
```

### Loading Spinner
```html
<div class="w-3 h-3 border-2 border-blue-400 border-t-transparent 
            rounded-full animate-spin"></div>
```

---

## Accessibility Standards

### Focus Indicators
```
All interactive elements MUST have:
- focus-visible:outline-none
- focus-visible:ring-2
- focus-visible:ring-[color]-500
- focus-visible:ring-offset-2
- focus-visible:ring-offset-gray-900
```

### Color Contrast Ratios (WCAG AA)
```
Normal Text (< 18px):     4.5:1 minimum
Large Text (≥ 18px):      3:1 minimum
UI Components:            3:1 minimum
```

### Keyboard Navigation
```
- All interactive elements have tabIndex
- Clear focus order (top to bottom, left to right)
- Escape closes modals/dialogs
- Enter/Space activates buttons
- Arrow keys for lists/grids
```

### ARIA Labels
```html
<!-- Example -->
<button 
  aria-label="Import video files"
  aria-pressed="false"
  role="button"
  tabIndex={0}>
  Import
</button>
```

---

## Responsive Breakpoints

### Tailwind Defaults
```
sm:   640px   (Small tablets, large phones landscape)
md:   768px   (Tablets)
lg:   1024px  (Small laptops)
xl:   1280px  (Desktops)
2xl:  1536px  (Large desktops)
```

### Usage Guidelines
```
- Design for desktop-first (1920x1080 primary)
- Test at 1366x768 (common laptop)
- Ensure usability at 1280x720 (minimum)
- Use relative units (rem, %) where possible
- Media grid adjusts columns at breakpoints
```

---

## Icon Usage

### Size Guidelines
```
text-xs:    Icons in small badges
text-sm:    Icons in buttons/labels
text-base:  Icons in cards
text-2xl:   Icons in empty states
text-4xl:   Hero icons
```

### Emoji vs SVG
```
Emojis:     Quick prototyping, friendly tone
SVG Icons:  Production, precise styling

Current Usage:
- 🎬 (clapper): Video/media related
- 🔗 (link): Connections, IPC
- ✅ (check): Success, complete
- 🔴 (red circle): Recording, live
- ⏱️ (stopwatch): Timeline, time
```

---

## Z-Index System

### Layer Stack
```
z-0:     Base layer (default)
z-1:     Empty state overlays
z-10:    Fixed headers, rulers
z-20:    Debug info overlays
z-50:    Tooltips, popovers
z-99:    Drop zone glow effects
z-100:   Drop zone highlights
z-101:   Drop indicators
z-[999]: Modals, dialogs
```

---

## Best Practices

### DO
- Use consistent spacing (multiples of 4px)
- Apply focus-visible to ALL interactive elements
- Use semantic HTML (header, nav, main, section)
- Keep animations under 200ms
- Test with keyboard-only navigation
- Maintain WCAG AA contrast ratios
- Use Tailwind utility classes

### DON'T
- Use arbitrary values unless absolutely necessary
- Mix spacing systems (stick to Tailwind scale)
- Forget hover states on clickable elements
- Use color alone to convey information
- Create animations longer than 300ms
- Ignore focus indicators
- Hardcode pixel values

---

## Testing Checklist

### Visual
- [ ] All text is readable against backgrounds
- [ ] Borders are visible but not overwhelming
- [ ] Shadows add depth without muddiness
- [ ] Colors are consistent across components
- [ ] Spacing creates clear visual hierarchy

### Interactive
- [ ] All buttons have hover/active/focus states
- [ ] Cursors change appropriately (pointer, grab, etc.)
- [ ] Transitions feel snappy (< 200ms)
- [ ] Loading states are clear
- [ ] Disabled states are obvious

### Accessibility
- [ ] Keyboard navigation works everywhere
- [ ] Focus indicators are visible
- [ ] ARIA labels are present
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested

---

## Version History

### v1.0 - October 28, 2025
- Initial style guide based on UX refinement
- Established color palette and spacing system
- Defined component patterns and states
- Documented accessibility standards

