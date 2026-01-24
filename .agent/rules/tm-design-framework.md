# TM OPERATION APP - DESIGN FRAMEWORK RULES (V8)

ALL web/frontend development for the TM Operation App MUST follow these core design principles to ensure visual and functional consistency.

## 1. HEADER ARCHITECTURE (STANDARD V8)
- Every page must have a **Stable Header** using `bg-blue-600` (system-wide) or `currentTheme` (store-specific).
- Header must include a **Glassy Back Button**: Circular, `bg-white/20`, `backdrop-blur-md`, `border-white/30`.
- **Standard Typography**:
  - Title: `text-xl font-black uppercase tracking-tight`
  - Subtitle: `text-[10px] font-bold tracking-widest uppercase opacity-80`
- **Floating Icon Protocol**: A 3D-effect icon in a `bg-white rounded-3xl shadow-xl` box must overlap the bottom-left of the header.

## 2. CONTENT CONTAINER PROTOCOL
- Background color for all pages: `bg-slate-50`.
- Main content must be wrapped in **Standard Large Cards**:
  - Border: `border-slate-100` or `border-white` (if using glassmorphism).
  - Corner Radius: `rounded-[32px]`.
  - Shadow: `shadow-sm` or `shadow-xl` (for floating elements).
- Use `animate-in fade-in slide-in-from-bottom-4` for all page entry animations.

## 3. COMPONENT STYLING
- **Tabs**: Glassy effect `bg-white/80 backdrop-blur-xl`, `rounded-3xl`.
- **Insight Cards**: Use `lining-nums` for numerals and `font-black` for emphasis.
- **Buttons**: Rounded-xl or Rounded-2xl only.
- **Status Indicators**: Use pulsing dots `●` for realtime status.

## 4. TYPOGRAPHY HIERARCHY
- Heading 1: `font-black uppercase tracking-tight`.
- Secondary Labels: `text-[10px] font-bold uppercase tracking-widest`.
- Primary Numerals: `font-black text-2xl`.

## 5. MINIMALISM & COLORS
- Primary Brand: Blue 600.
- Neutral: Slate 50 (Background), Slate 800 (Text).
- Avoid unnecessary gradients. Focus on shadows and transparency (glassmorphism) for depth.
