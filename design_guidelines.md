# PetSpeak Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from **Shazam** (primary), **Spotify** (audio visualization), and **Duolingo** (playful engagement), with a mobile-first strategy optimized for quick, one-handed interactions.

**Design Principles**:
- Instant clarity: Users should understand how to record in <3 seconds
- Playful professionalism: Fun and approachable while being accurate
- Motion with purpose: Animations reinforce feedback, not decoration
- Pet-first interface: Design speaks to pet lovers

---

## Typography

**Font Stack**: 
- Primary: Inter (Google Fonts) - clean, modern, highly legible
- Accent: Outfit (Google Fonts) - playful headings for pet-related content

**Hierarchy**:
- Hero/Large Numbers: 4xl-6xl, font-bold (Outfit)
- Section Headers: 2xl-3xl, font-semibold (Outfit)
- Body/Results: base-lg, font-normal (Inter)
- Metadata/Timestamps: sm-xs, font-medium (Inter)
- Buttons/CTAs: base-lg, font-semibold (Inter)

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 8, 12, 16** (e.g., p-4, gap-8, mb-12)

**Container Strategy**:
- Mobile: Full-width with px-4 padding
- Desktop: max-w-6xl centered with px-8
- Admin Dashboard: max-w-7xl for data tables

**Grid Patterns**:
- History cards: Single column mobile, 2-column tablet, 3-column desktop
- Admin metrics: 2x2 grid mobile, 4-column desktop

---

## Component Library

### Main Recording Interface
**Circular Record Button**:
- Large 200px (mobile) / 280px (desktop) circular touchpoint
- Positioned center-screen with ample breathing room (mt-16)
- Pulsing ring animation during recording (scale from 1.0 to 1.1)
- Microphone icon (Heroicons) centered within

**Waveform Visualization**:
- Horizontal animated bars below button (h-32)
- 20-30 vertical bars with staggered heights
- Smooth oscillation animation using CSS keyframes

**Animal Selector**:
- Dropdown with icon-prefix for each animal (positioned above record button)
- Large touch targets (h-12 minimum)
- Icons from Heroicons: dog, cat, bird symbols

### Results Screen
**Card-Based Layout**:
- Large result card with rounded-2xl, shadow-lg
- Top section: Animal emoji + detected need (text-3xl, bold)
- Confidence meter: Circular progress indicator (0-100%)
- Tips section: Bulleted list with checkmark icons
- Action buttons: "Save to History" + "Record Again" (w-full on mobile)

### History Feed
**Timeline Cards**:
- Chronological list with date separators (sticky headers)
- Each card: Animal type badge, timestamp, detected need, confidence %
- Swipe gesture hint for mobile delete action
- Empty state: Friendly illustration placeholder with "No recordings yet"

### Admin Portal
**Dashboard Grid**:
- 4 metric cards at top (Total Recordings, Accuracy, Active Users, Avg Confidence)
- Charts section: 2-column layout (pie chart + line graph)
- Data table: Sortable columns, pagination, search filter

**Training Interface**:
- Drag-and-drop upload zone (dashed border, large target area)
- Audio preview player with waveform
- Tag selector with multi-select chips
- Review queue with approve/reject buttons

---

## Navigation

**Main App**: 
- Bottom tab bar (mobile): Home, History, Profile
- Fixed position with safe-area padding
- Icons: home, clock, user (Heroicons)

**Admin Portal**: 
- Sidebar navigation (desktop): Dashboard, Training, Users, Analytics
- Hamburger menu (mobile) with slide-out drawer
- Logout button prominently placed

---

## Animations

**Recording State**:
- Button scale pulse (0.95 to 1.0) on press
- Waveform bars: randomized height oscillation (100-300ms intervals)
- Circular progress during analysis (indeterminate spinner → determinate %)

**Results Reveal**:
- Slide-up transition from bottom (500ms ease-out)
- Confidence percentage counts up from 0 to final value

**Minimal elsewhere**: Subtle hover states, no scroll-triggered animations

---

## Images

**Hero Section** (Marketing/Landing - if separate landing page):
- Large hero image: Happy pet owner with dog/cat in home setting
- Placement: Full-width, 60vh height, with gradient overlay
- CTA buttons overlaid on image with backdrop-blur-md

**Main App**:
- No large hero images (functional app prioritizes recording UI)
- Animal selector icons: Use emoji or icon fonts, not images
- Empty states: Friendly illustrations (pets waiting for interaction)

**Admin Portal**:
- No decorative images
- User avatars in management section
- Placeholder icons for data visualization

---

## Form Elements

**Input Fields**:
- Rounded-lg borders, h-12 minimum height
- Floating labels on focus
- Clear error states below inputs with exclamation icons

**Buttons**:
- Primary: Rounded-full, px-8, py-4, font-semibold, w-full on mobile
- Secondary: Rounded-full with border, same padding
- Icon buttons: Circular (w-10 h-10) with centered icons

**Selectors**:
- Custom dropdowns with Heroicons chevron-down
- Radio buttons for single-choice (animal categories in training)
- Toggle switches for settings (notification preferences)

---

This design creates a playful, engaging experience for the main app while maintaining professional utility for the admin portal. The mobile-first approach ensures pet owners can quickly record sounds in any situation, with clear visual feedback throughout the interaction flow.