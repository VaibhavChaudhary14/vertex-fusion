# GridGuardian AI - Design Guidelines

## Design Approach

**Selected Approach:** Custom Dashboard System inspired by enterprise monitoring platforms (Grafana, Datadog) and Security Operations Centers, optimized for high information density and real-time data visualization.

**Rationale:** As a utility-focused, mission-critical cybersecurity platform requiring operator efficiency, continuous monitoring, and rapid incident response, the design prioritizes clarity, scanability, and dense information presentation over aesthetic experimentation.

**Core Principles:**
1. **Information Hierarchy:** Critical alerts and system health always visible
2. **Scan-First Design:** Users must comprehend system state within 2 seconds
3. **Progressive Disclosure:** Drill-down access to detailed data without cluttering primary views
4. **Operational Stability:** Consistent layout reduces cognitive load during high-stress incidents

---

## Typography System

**Font Stack:** Inter (primary), JetBrains Mono (code/data)

**Hierarchy:**
- **Hero/Marketing Headlines:** text-5xl to text-6xl, font-bold (landing page only)
- **Dashboard Headers:** text-2xl, font-semibold (section titles)
- **Panel Titles:** text-lg, font-medium (card/widget headers)
- **Body/Data:** text-sm, font-normal (primary content, metrics)
- **Labels/Meta:** text-xs, font-medium (timestamps, tags, small labels)
- **Monospace Data:** JetBrains Mono for IP addresses, node IDs, timestamps, code snippets

---

## Layout & Spacing System

**Tailwind Spacing Primitives:** Standardize on 2, 4, 8, 12, 16 units
- **Tight spacing:** p-2, gap-2 (compact data tables, badges)
- **Standard spacing:** p-4, gap-4 (default panel padding, form fields)
- **Section spacing:** p-8, gap-8 (major dashboard sections)
- **Page margins:** p-12 or p-16 (outer page containers)

**Grid System:**
- **Dashboard Layout:** 12-column grid with 4-unit gaps
- **Responsive Breakpoints:** Mobile (1 col), Tablet (2 col), Desktop (3-4 col)
- **Sidebar Width:** Fixed 64 or 256px (collapsed/expanded navigation)

**Container Strategy:**
- **Landing Page:** max-w-7xl centered containers
- **Dashboard:** Full-width w-full with internal max-w constraints per panel
- **Forms/Modals:** max-w-2xl centered

---

## Component Library

### Navigation
- **Top Bar (Global):** Fixed height (h-16), contains logo, global search, user profile, real-time system health indicator
- **Sidebar (Dashboard):** Collapsible left navigation (w-64 expanded, w-16 collapsed), icons + labels, active state highlighting
- **Breadcrumbs:** For deep navigation paths in Virtual Lab and Knowledge Base

### Real-Time Monitoring Components
- **Graph Visualization Panel:** Full-width or 2/3 width main canvas for D3.js cyber-physical topology, controls overlay (zoom, reset, filter), legend panel
- **Alert Stream Card:** Fixed-height scrollable feed (h-96), severity badges (critical/high/medium/low), timestamp + attack type + affected nodes, expandable detail view
- **Metrics Dashboard Grid:** 3-4 column grid of stat cards showing single KPI (Detection Rate, False Alarm Rate, Security Index), with sparkline trend indicators

### Virtual Lab Interface
- **Simulation Control Panel:** Multi-step form layout - Grid topology selector (radio buttons with topology diagrams), Load profile slider (Normal ↔ Stress), Observability toggle (Full/Partial), Attack injection dropdown with description tooltips
- **Simulation Canvas:** Split view - left: control timeline, right: real-time topology with attack propagation visualization
- **Results Display:** Tabbed interface (Detection Results, Performance Metrics, Event Log), exportable data tables

### Data Display
- **Tables:** Striped rows, sortable headers, fixed header on scroll, inline actions (view/download), pagination for large datasets
- **Cards:** Consistent p-4 or p-6 padding, header with title + optional actions, divider, body content, optional footer
- **Charts:** Use Chart.js or D3.js - time series line charts for trends, bar charts for comparisons, heatmaps for correlation matrices

### Forms & Inputs
- **Text Fields:** Standard height (h-10), rounded corners (rounded-md), focus ring, floating labels or inline labels
- **Dropdowns/Selects:** Native styling with custom icons, searchable for long lists
- **Toggle Switches:** For binary options (Observability: Full/Partial)
- **Buttons:** Primary (high contrast), Secondary (medium contrast), Tertiary (text only), sizes: sm, md, lg

### Alerts & Notifications
- **Toast Notifications:** Top-right positioned, auto-dismiss after 5s, severity-coded borders
- **In-Dashboard Alerts:** Banner style for system-wide notifications, dismissible
- **Badge Counters:** On navigation items for unread alerts

### Knowledge Base & Chatbot
- **Article Layout:** Left sidebar (table of contents), center content (max-w-3xl), right sidebar (related articles)
- **Chatbot Widget:** Fixed bottom-right (expandable from icon to full chat window), message bubbles with timestamps, typing indicators
- **Search Bar:** Prominent placement, autocomplete suggestions, recent searches

---

## Page-Specific Layouts

### Landing Page
- **Hero Section:** Full-width banner with large headline "Detect Cyber-Physical Attacks 26% Faster with GNN Fusion", subheadline, two CTA buttons (Sign Up, Request Demo), hero image showing grid topology visualization
- **Features Grid:** 3-column layout on desktop (Real-Time Monitoring, Virtual Lab, AI Threat Intelligence), icon + title + description format
- **Social Proof:** Logos of academic institutions/partners, testimonial quotes
- **Pricing/Plans:** Table comparing tiers (Academic, Analyst, Enterprise)
- **Footer:** Multi-column (Product, Company, Resources, Legal), newsletter signup, social links

### Dashboard (Primary Operational View)
- **Layout:** Top bar + sidebar + main content area
- **Main Area Sections (scrollable):**
  - System Health Banner (sticky, always visible)
  - Interactive Graph Visualization (primary focus, 60% viewport height)
  - Alert Stream (right sidebar or bottom panel, h-64 to h-96)
  - Metrics Grid (4 cards: Detection Rate, False Alarm Rate, System Uptime, Active Simulations)
  - Recent Activity Timeline

### Virtual Lab
- **Three-Column Layout:** Left (simulation config), Center (visualization canvas), Right (event log)
- **Modal Overlays:** For attack injection details, dataset export options

### Profile & Settings
- **Two-Column:** Left navigation (Account, Subscription, API Keys, Preferences), Right content area

---

## Images

**Landing Page Hero:** Abstract visualization of interconnected power grid nodes with cyber overlay elements (glowing connections, security shield iconography), suggest a sense of protection and real-time monitoring. Image should be wide-format (16:9 ratio), with semi-transparent overlay to ensure text readability.

**Feature Section Icons:** Use Heroicons for consistent iconography - Shield for security, Beaker for virtual lab, ChatBubble for AI assistant, ChartBar for analytics.

**Knowledge Base:** Diagrams illustrating attack flow (e.g., FDI attack propagation through grid), GNN architecture visualization, grid topology schematics (IEEE 14-bus, 30-bus diagrams).

---

## Responsive Strategy

- **Desktop (≥1280px):** Full multi-column layouts, sidebar always expanded
- **Tablet (768-1279px):** Collapsible sidebar, 2-column grids reduce to single column for complex components
- **Mobile (<768px):** All grids stack to single column, bottom tab navigation replaces sidebar, simplified graph view with expand-to-fullscreen option, alert stream as primary view

---

## Accessibility & Interaction

- **Focus States:** Visible focus rings on all interactive elements
- **Keyboard Navigation:** Full keyboard support for dashboard controls, graph zoom/pan via keyboard shortcuts
- **Screen Reader Labels:** ARIA labels for data visualizations, real-time alert announcements
- **Contrast:** Ensure text meets WCAG AA standards against dashboard backgrounds
- **Motion:** Respect `prefers-reduced-motion` for graph animations and transitions

---

**Animation Budget:** Minimal and purposeful only
- Smooth transitions for panel expand/collapse (200ms)
- Fade-in for new alerts (300ms)
- Graph node pulsing for active attacks (subtle, 1s loop)
- Loading spinners for data fetch
- No scroll-triggered effects, no decorative animations