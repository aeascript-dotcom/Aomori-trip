# 🎬 makeAclip - Design Specification

## Overview
A cute, fresh, and colorful web app for creating slide-based video clips from images and text.

---

## 🎨 Design System

### Color Palette
```
Primary Gradient: linear-gradient(135deg, #FFB6D9 0%, #B4E7F5 50%, #D4B5FF 100%)
Background: #FAFBFC
Card Background: #FFFFFF
Text Primary: #2D3748
Text Secondary: #718096
Border: #E2E8F0

Status Colors:
- Standby: #CBD5E0
- Ready/Active: #48BB78
- Error: #FC8181

Button Primary: #667EEA
Button Primary Hover: #5A67D8
```

### Typography
```
Primary Font: 'Prompt', sans-serif (Thai supported)
Fallback Fonts:
- Sarabun
- Anuphan
- Kodchasan

Font Sizes:
- H1 (App Title): 32px (2rem)
- H2 (Subtitle): 16px (1rem)
- Section Label: 14px (0.875rem)
- Body/Input: 15px (0.9375rem)
- Small: 13px (0.8125rem)
```

### Spacing System (8px Base)
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### Border Radius
```
Small: 8px
Medium: 12px
Large: 16px
XLarge: 20px
```

### Shadows
```
Soft: 0 2px 8px rgba(0, 0, 0, 0.06)
Medium: 0 4px 12px rgba(0, 0, 0, 0.08)
Strong: 0 8px 24px rgba(0, 0, 0, 0.12)
```

---

## 📐 Layout Structure

### 1. Header Section
**Height**: Auto (flexible)
**Background**: Pastel gradient (pink → mint → lavender)
**Padding**: 32px 24px
**Border Radius**: 0 0 20px 20px

**Elements**:
- **App Name**: "makeAclip ✨"
  - Font: 32px, bold
  - Color: White with subtle text shadow
- **Subtitle**: "สร้างคลิปสไลด์จากภาพและข้อความของคุณ"
  - Font: 16px, regular
  - Color: rgba(255, 255, 255, 0.95)

---

### 2. Image Input List (Core Area)

**Container**:
- Max width: 900px
- Center aligned
- Padding: 24px
- Gap between blocks: 16px

**Image Block Component** (Repeatable):

```
┌─────────────────────────────────────────────┐
│  Image Slot          Text Input             │
│  [Preview Box]       [Textarea]             │
│  [Upload Button]     "ใส่ข้อความ..."       │
│                      [Status: Stand By]      │
└─────────────────────────────────────────────┘
```

**Specifications**:

**Image Slot**:
- Size: 200px × 200px (desktop), 120px × 120px (mobile)
- Background: #F7FAFC
- Border: 2px dashed #CBD5E0
- Border Radius: 12px
- Placeholder icon: Image icon (📷) or upload icon
- Hover state: Border color → #667EEA

**Upload Button**:
- Text: "อัปโหลดรูป"
- Size: Small (padding 8px 16px)
- Border Radius: 8px
- Background: #EDF2F7
- Hover: #E2E8F0

**Text Input**:
- Width: Flexible (fills remaining space)
- Min height: 100px
- Border: 1px solid #E2E8F0
- Border Radius: 12px
- Padding: 12px
- Font: 15px
- Line height: 1.6
- Placeholder color: #A0AEC0

**Status Button**:
- Size: Small (padding 6px 12px)
- Border Radius: 20px (pill shape)
- Font: 13px, medium weight
- States:
  - Standby: Background #CBD5E0, Text #4A5568
  - Ready: Background #48BB78, Text white
- Icon: Dot indicator (•) before text

---

### 3. Global Controls Panel

**Position**: Sticky bottom OR separate section above export
**Background**: White card with soft shadow
**Padding**: 24px
**Border Radius**: 16px (top only if sticky)

**Layout**: Horizontal on desktop, vertical on mobile

**Controls**:

**Transition Selector**:
- Label: "Transition"
- Type: Segmented control (radio buttons styled as buttons)
- Options:
  - 🔄 Slide In
  - ✨ Dissolve
- Selected state: Background #667EEA, Text white
- Unselected: Background #F7FAFC, Text #4A5568

**Font Selector**:
- Label: "Font"
- Type: Dropdown (select)
- Width: 200px
- Options:
  - Sarabun
  - Prompt ⭐
  - Anuphan
  - Kodchasan
- Helper text: "Fonts from Google Fonts"

**Resolution Selector**:
- Label: "Resolution"
- Type: Dropdown
- Options:
  - 1080p
  - 2K (2560px) ⭐ [default]

---

### 4. Export Section

**Container**:
- Max width: 600px
- Center aligned
- Padding: 32px
- Text align: center

**Export Button** (Default State):
- Text: "🎬 Export Video"
- Size: Large (padding 16px 48px)
- Font: 16px, bold
- Background: Linear gradient (#667EEA → #764BA2)
- Color: White
- Border Radius: 16px
- Box Shadow: 0 4px 12px rgba(102, 126, 234, 0.3)
- Hover: Transform scale(1.02), stronger shadow

**Loading State**:
- Progress bar:
  - Height: 8px
  - Border Radius: 4px
  - Background: #E2E8F0
  - Fill: Gradient (animated)
- Text: "กำลังสร้างคลิป..." (below progress)

**Success State**:
- Icon: ✅ (large, animated scale-in)
- Heading: "สร้างคลิปเรียบร้อยแล้ว"
  - Font: 20px, bold
  - Color: #48BB78
- Info text: "คลิปจะถูกบันทึกลงใน Photos ของ iOS โดยอัตโนมัติ"
  - Font: 14px
  - Color: #718096
  - Background: #F0FFF4 (light green)
  - Padding: 12px
  - Border Radius: 8px

---

## 📱 Responsive Breakpoints

```css
Desktop: 1024px and up
Tablet: 768px - 1023px
Mobile: 320px - 767px
```

**Responsive Adjustments**:

**Desktop** (1024px+):
- Image blocks: 2-column grid (image left, text right)
- Controls panel: Horizontal layout
- Max content width: 900px

**Tablet** (768px - 1023px):
- Image blocks: Single column (image on top, text below)
- Image size: 160px × 160px
- Controls panel: Horizontal (wrapped)

**Mobile** (320px - 767px):
- Image blocks: Stack vertically
- Image size: 120px × 120px (centered)
- Controls panel: Vertical stack
- Sticky controls: Full width bottom sheet
- Reduced padding throughout

---

## 🧩 Component Library

### Reusable Components

**1. ImageSlideBlock**
- Props:
  - `index`: Number
  - `imagePreview`: String (URL)
  - `text`: String
  - `status`: 'standby' | 'ready'

**2. PrimaryButton**
- Variants:
  - Default
  - Loading
  - Success
  - Disabled

**3. SegmentedControl**
- Props:
  - `options`: Array
  - `selectedIndex`: Number

**4. DropdownSelect**
- Props:
  - `label`: String
  - `options`: Array
  - `defaultValue`: String

---

## 🔧 Developer Implementation Notes

### HTML Structure
```
body
├── header (gradient section)
├── main
│   ├── image-list-container
│   │   └── image-slide-block × 15 (max)
│   ├── controls-panel
│   │   ├── transition-selector
│   │   ├── font-selector
│   │   └── resolution-selector
│   └── export-section
│       ├── export-button
│       ├── loading-state (hidden)
│       └── success-state (hidden)
└── footer
```

### CSS Guidelines
- Use CSS Grid for image block layout (desktop)
- Use Flexbox for controls panel
- Use CSS custom properties for theming
- Use `clamp()` for responsive typography
- Use `gap` property for spacing (grid/flex)
- Avoid absolute positioning where possible
- Use `rem` for font sizes, `px` for borders
- Smooth transitions: `transition: all 0.2s ease`

### JavaScript Structure
```javascript
// State management
const appState = {
  slides: [], // Array of 15 slide objects
  transition: 'slideIn',
  font: 'Prompt',
  resolution: '2K'
};

// Core functions
- handleImageUpload(index)
- updateSlideText(index, text)
- updateSlideStatus(index)
- selectTransition(type)
- selectFont(fontName)
- exportVideo() // Mock for now
```

### Accessibility
- All images: `alt` attributes
- Inputs: Proper `label` associations
- Buttons: Clear focus states (outline)
- Color contrast: WCAG AA minimum
- Keyboard navigation: Tab order logical
- Screen reader: ARIA labels where needed

---

## 🎯 Future Enhancements (Not in MVP)
- Drag to reorder slides
- Slide duration control per image
- Background music selection
- Custom font upload
- Template presets
- Real-time preview

---

## ✅ Design Deliverables Checklist

- [x] Color system defined
- [x] Typography hierarchy
- [x] Spacing system (8px base)
- [x] Component specifications
- [x] Responsive breakpoints
- [x] Button states defined
- [x] Interaction states
- [x] Developer implementation notes
- [x] Accessibility guidelines

---

**Design Date**: December 16, 2025
**Version**: 1.0
**Designer**: Senior Product Designer
