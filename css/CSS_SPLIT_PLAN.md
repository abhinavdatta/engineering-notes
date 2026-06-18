# CSS Split Plan - common.css

This document outlines how to split common.css (1480 lines) into 4 logical files.

## Current Structure

common.css contains:
- CSS Reset and Base Styles
- Navigation Bar
- Header Styles
- Theme Toggle
- Refresh Button
- Footer
- Buttons
- Tables
- Loading States
- Modals
- Utility Classes
- Card Styles
- Responsive Styles

---

## Proposed Split

### 1. css/base.css (~100-150 lines)
**Purpose**: CSS Reset, base HTML element styles, typography

**Contents**:
- CSS Reset (margin: 0, padding: 0, box-sizing)
- HTML/Base styles (html, body)
- Typography (font family, line height)
- Base HTML element styles (h1-h6, p, a, ul, ol, li, etc.)
- Base form element styles (if any)

**Load Order**: MUST load first (before themes.css sets CSS variables)

---

### 2. css/layout.css (~400-500 lines)
**Purpose**: Page layout structures - navbar, footer, containers, grids

**Contents**:
- Modern Navigation Bar (.navbar and all children)
- Footer Styles (.footer and all children)
- Container classes
- Main content layout
- Breadcrumb styles (.navbar-breadcrumb)
- Department links (.dept-links)
- Ad spaces (.ad-dept-top, .ad-dept-inline)
- Mobile menu overlay styles

**Load Order**: Load after base.css, can load before or after components.css

---

### 3. css/components.css (~500-600 lines)
**Purpose**: Reusable UI components

**Contents**:
- Theme Toggle Styles (.theme-switcher)
- Refresh Button (.refresh-btn)
- Button Styles (.btn, .btn-primary, etc.)
- Table Styles (.department-table)
- Loading and State Styles (.loading, .spinner)
- Modal Styles (.modal, .pdf-modal)
- Unit and Folder Card Styles (.card, .unit-card, .folder-card)
- Contribute Button (.contribute-fab, .email-link)
- File Card Styles (.file-card)
- Badge Styles (.badge, .subject-badge)
- Info Boxes (.info-box, .info-boxes)
- Filter Bar (.filter-bar)

**Load Order**: Load after base.css and layout.css

---

### 4. css/utilities.css (~200-300 lines)
**Purpose**: Helper classes and responsive overrides

**Contents**:
- Utility Classes (.hidden, .flex, .text-center, etc.)
- Spacing utilities (.mt-4, .p-4, etc.)
- Responsive Styles - Tablet (@media max-width: 1024px)
- Responsive Styles - Small Phones (@media max-width: 480px)
- Responsive Styles - Extra Small Phones (@media max-width: 320px)
- Any other responsive overrides

**Load Order**: Load last (after all other CSS files)

---

## Updated Load Order in HTML Files

### Current Order:
```html
<link rel="stylesheet" href="css/themes.css">
<link rel="stylesheet" href="css/common.css">
<link rel="stylesheet" href="css/[page-specific].css">
```

### New Order:
```html
<link rel="stylesheet" href="css/themes.css">
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/layout.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/utilities.css">
<link rel="stylesheet" href="css/[page-specific].css">
```

---

## Benefits of This Split

1. **Better Organization**: Easier to find and modify specific styles
2. **Faster Development**: Smaller files are easier to navigate
3. **Better Caching**: Changes to one component don't invalidate entire common.css cache
4. **Clearer Dependencies**: Load order makes dependencies explicit
5. **Easier Maintenance**: Logical grouping of related styles

---

## Migration Notes

- All existing styles are preserved, just moved to new files
- No style changes required in HTML
- Only need to update the `<link>` tags in all HTML files
- Page-specific CSS files (home.css, notes.css, textbooks.css, calculator.css) are not affected