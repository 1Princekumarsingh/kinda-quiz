# Design Document: Desktop and Tablet Responsive Layout Improvements

## Overview

This design extends the existing mobile-first responsive design to properly support tablet (768px-1024px) and desktop (1024px+) viewports. The approach maximizes reuse of existing components from the ui-ux-mobile-improvements spec, focusing on Tailwind CSS class adjustments and responsive breakpoint configurations rather than creating new components.

### Design Goals

1. **Maximum Component Reuse**: Leverage all existing components from ui-ux-mobile-improvements spec
2. **CSS-First Approach**: Use Tailwind responsive classes (md:, lg:, xl:) for layout adjustments
3. **Minimal New Code**: Focus on configuration and styling changes, not new component creation
4. **Progressive Enhancement**: Build on the solid mobile foundation with tablet/desktop optimizations
5. **Practical Implementation**: Simple, straightforward solutions without complex architecture

### Key Principles

- Reuse over rebuild: Every existing component will be adapted, not recreated
- CSS over JavaScript: Use CSS Grid and Flexbox via Tailwind utilities
- Configuration over code: Extend existing component props rather than adding new logic
- Incremental enhancement: Add responsive classes to existing components

## Architecture

### Existing Components to Reuse

From ui-ux-mobile-improvements spec, we will reuse and extend:

**Layout Components**:
- `Container` - Add desktop max-width configurations
- `ResponsiveGrid` - Add desktop column configurations
- `Header` - Add desktop horizontal navigation layout
- `MobileMenu` - Conditional rendering based on viewport
- `DesktopNav` - Already exists, ensure visibility on desktop

**Card Components**:
- `Card` - Add desktop hover states
- `SubjectCard` - Add desktop horizontal layout classes
- `ChapterCard` - Add desktop horizontal layout classes
- `QuestionCard` - Adjust max-width for desktop readability

**UI Components**:
- `Modal` - Add desktop centered sizing
- `Button` - Already responsive, no changes needed
- `Input` - Already responsive, no changes needed
- `Spinner`, `SkeletonLoader`, `EmptyState`, `ErrorState` - Already responsive

### Responsive Strategy

**Breakpoint Usage**:
- Mobile: Default (no prefix) - Already implemented
- Tablet: `md:` prefix (768px+) - New additions
- Desktop: `lg:` prefix (1024px+) - New additions  
- Wide Desktop: `xl:` prefix (1280px+) - New additions

**Layout Approach**:
```
Mobile (existing) → Add md: classes → Add lg: classes → Add xl: classes
```

## Components and Interfaces

### 1. Container Component (Enhancement)

**Existing Interface** (no changes):
```typescript
interface ContainerProps {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}
```

**Tailwind Class Additions**:
```tsx
// Current mobile classes (keep as-is):
// className="px-4 w-full overflow-x-hidden"

// Add responsive classes:
className={cn(
  "px-4 w-full overflow-x-hidden",
  "md:px-6",              // 24px padding on tablet
  "lg:px-8",              // 32px padding on desktop
  "lg:mx-auto",           // Center on desktop
  size === 'sm' && "lg:max-w-[640px]",
  size === 'md' && "lg:max-w-[768px]",
  size === 'lg' && "lg:max-w-[1024px]",
  size === 'xl' && "lg:max-w-[1280px]",
  size === 'full' && "lg:max-w-none"
)}
```

**Implementation Notes**:
- No new props needed
- Only add responsive Tailwind classes
- Existing mobile behavior unchanged

### 2. ResponsiveGrid Component (Enhancement)

**Existing Interface** (extend columns prop):
```typescript
interface ResponsiveGridProps {
  children: ReactNode
  columns?: {
    mobile?: 1
    tablet?: 1 | 2          // Add tablet option
    desktop?: 1 | 2 | 3 | 4  // Add desktop option
  }
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}
```

**Tailwind Class Additions**:
```tsx
// Current mobile classes (keep as-is):
// className="grid grid-cols-1 gap-4"

// Add responsive classes:
const gridCols = {
  mobile: columns?.mobile || 1,
  tablet: columns?.tablet || 2,
  desktop: columns?.desktop || 3,
}

const gapClasses = {
  sm: "gap-4 md:gap-5 lg:gap-6",      // 16px/20px/24px
  md: "gap-6 md:gap-7 lg:gap-8",      // 24px/28px/32px
  lg: "gap-8 md:gap-9 lg:gap-10",     // 32px/36px/40px
}

className={cn(
  "grid",
  `grid-cols-${gridCols.mobile}`,
  `md:grid-cols-${gridCols.tablet}`,
  `lg:grid-cols-${gridCols.desktop}`,
  `xl:grid-cols-${Math.min(gridCols.desktop + 1, 4)}`, // +1 column on xl
  gapClasses[gap || 'md']
)}
```

**Implementation Notes**:
- Extend columns prop to include tablet and desktop
- Add responsive gap sizing
- Default: 1 col mobile, 2 col tablet, 3 col desktop, 4 col wide desktop

**Usage Examples**:
```tsx
// Subject cards: 1 → 2 → 3 → 4 columns
<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
  {subjects.map(s => <SubjectCard key={s.id} {...s} />)}
</ResponsiveGrid>

// Chapter cards: 1 → 2 → 3 → 4 columns
<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
  {chapters.map(c => <ChapterCard key={c.id} {...c} />)}
</ResponsiveGrid>

// Question cards: Stay single column for readability
<ResponsiveGrid columns={{ mobile: 1, tablet: 1, desktop: 1 }} gap="sm">
  {questions.map(q => <QuestionCard key={q.id} {...q} />)}
</ResponsiveGrid>
```

### 3. Header Component (Enhancement)

**Existing Interface** (no changes):
```typescript
interface HeaderProps {
  user: User | null
  onLogout: () => void
}
```

**Tailwind Class Additions**:
```tsx
// Current mobile structure (keep):
// <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">

// Add responsive height:
<header className={cn(
  "fixed top-0 left-0 right-0 bg-white shadow-sm z-50",
  "h-14",           // 56px mobile
  "lg:h-16"         // 64px desktop
)}>
  {/* Mobile: Hamburger + Title + User */}
  <div className="lg:hidden flex items-center justify-between px-4 h-full">
    <button onClick={openMenu}>☰</button>
    <h1>RecallX</h1>
    <UserMenu />
  </div>
  
  {/* Desktop: Logo + Nav + User */}
  <div className="hidden lg:flex items-center justify-between px-8 h-full">
    <Logo />
    <DesktopNav items={navItems} currentPath={currentPath} />
    <UserMenu />
  </div>
</header>
```

**Implementation Notes**:
- Use existing DesktopNav component on lg: breakpoint
- Hide hamburger menu on desktop with `lg:hidden`
- Show horizontal nav with `hidden lg:flex`
- Increase height from 56px to 64px on desktop

### 4. DesktopNav Component (Already Exists)

**Existing Interface** (no changes needed):
```typescript
interface DesktopNavProps {
  navigationItems: NavigationItem[]
  currentPath: string
}
```

**Verification Only**:
- Component already exists from mobile spec
- Ensure it has proper hover states
- Ensure active link highlighting works
- No modifications needed

### 5. Card Component (Enhancement)

**Existing Interface** (no changes):
```typescript
interface CardProps {
  children: ReactNode
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  onClick?: () => void
  className?: string
}
```

**Tailwind Class Additions**:
```tsx
// Add desktop-only hover effects:
className={cn(
  "bg-white rounded-lg transition-all duration-150",
  variant === 'elevated' && "shadow-md",
  variant === 'outlined' && "border border-gray-200",
  padding === 'sm' && "p-3 md:p-4",
  padding === 'md' && "p-4 md:p-5 lg:p-4",  // Medium on desktop
  padding === 'lg' && "p-6 md:p-7 lg:p-6",
  hoverable && [
    "cursor-pointer",
    "lg:hover:scale-[1.02]",           // Desktop-only hover scale
    "lg:hover:shadow-elevated-hover",  // Desktop-only hover shadow
  ]
)}
```

**Implementation Notes**:
- Prefix hover states with `lg:` to disable on mobile/tablet
- Adjust padding for desktop density
- Existing mobile behavior unchanged

### 6. SubjectCard Component (Enhancement)

**Existing Interface** (no changes):
```typescript
interface SubjectCardProps {
  subject: {
    id: string
    name: string
    chapter_count: number
    question_count: number
    completion_percentage: number
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
}
```

**Layout Adjustment** (Tailwind classes only):
```tsx
<Card hoverable onClick={() => onNavigate(subject.id)}>
  {/* Mobile: Vertical stack (existing) */}
  <div className="lg:hidden flex flex-col gap-3">
    <h3>{subject.name}</h3>
    <div className="flex flex-col gap-2">
      <Stat label="Chapters" value={subject.chapter_count} />
      <Stat label="Questions" value={subject.question_count} />
      <ProgressBar percentage={subject.completion_percentage} />
    </div>
    <div className="flex gap-2 mt-2">
      <Button fullWidth onClick={onEdit}>Edit</Button>
      <Button fullWidth variant="danger" onClick={onDelete}>Delete</Button>
    </div>
  </div>
  
  {/* Desktop: Horizontal layout (new) */}
  <div className="hidden lg:flex items-center justify-between">
    <div className="flex-1">
      <h3>{subject.name}</h3>
      <div className="flex gap-6 mt-2 text-sm text-gray-600">
        <Stat label="Chapters" value={subject.chapter_count} />
        <Stat label="Questions" value={subject.question_count} />
      </div>
    </div>
    <div className="flex-shrink-0 w-48">
      <ProgressBar percentage={subject.completion_percentage} />
    </div>
    <div className="flex gap-2 ml-4">
      <Button icon={<EditIcon />} onClick={onEdit} aria-label="Edit" />
      <Button icon={<TrashIcon />} variant="danger" onClick={onDelete} aria-label="Delete" />
    </div>
  </div>
</Card>
```

**Implementation Notes**:
- Two layouts: mobile (existing) and desktop (new)
- Use `lg:hidden` and `hidden lg:flex` for conditional rendering
- Icon-only buttons on desktop to save space
- Horizontal metadata layout on desktop

### 7. ChapterCard Component (Enhancement)

**Existing Interface** (no changes):
```typescript
interface ChapterCardProps {
  chapter: {
    id: string
    name: string
    question_count: number
    accuracy: number
    status_breakdown: {
      NEW: number
      MASTERED: number
      REVIEW: number
      ERROR: number
      ALMOST_FORGOT: number
    }
  }
  onStartPractice: (id: string) => void
  onContinue: (id: string) => void
  onImport: (id: string) => void
}
```

**Layout Adjustment** (Tailwind classes only):
```tsx
<Card>
  <div className="flex flex-col gap-4">
    <h3>{chapter.name}</h3>
    
    {/* Status badges: vertical on mobile, horizontal on desktop */}
    <div className={cn(
      "flex flex-wrap gap-2",
      "lg:flex-row"  // Horizontal on desktop (already flex-wrap)
    )}>
      {Object.entries(chapter.status_breakdown).map(([status, count]) => (
        <StatusBadge key={status} status={status} count={count} />
      ))}
    </div>
    
    {/* Action buttons */}
    <div className={cn(
      "flex flex-col gap-2",
      "md:flex-row"  // Horizontal on tablet+
    )}>
      <Button fullWidth onClick={onStartPractice}>Start Practice</Button>
      <Button fullWidth variant="secondary" onClick={onImport}>Import</Button>
    </div>
  </div>
</Card>
```

**Implementation Notes**:
- Minimal changes: status badges already use flex-wrap
- Make buttons horizontal on tablet with `md:flex-row`
- No separate desktop layout needed (badges wrap naturally)

### 8. Modal Component (Enhancement)

**Existing Interface** (no changes):
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  preventClose?: boolean
  showCloseButton?: boolean
}
```

**Tailwind Class Additions**:
```tsx
// Backdrop (no changes needed):
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />

// Modal container:
<div className={cn(
  // Mobile: Full screen (existing)
  "fixed inset-0 bg-white z-50",
  "flex flex-col",
  
  // Tablet: 90% width, centered
  "md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2",
  "md:w-[90%] md:rounded-lg md:shadow-xl md:max-h-[90vh]",
  
  // Desktop: Fixed width, centered
  "lg:w-auto",
  size === 'sm' && "lg:max-w-[400px]",
  size === 'md' && "lg:max-w-[600px]",
  size === 'lg' && "lg:max-w-[800px]",
  
  // Animation
  "animate-scale-in"
)}>
  {/* Modal content */}
</div>
```

**Implementation Notes**:
- Full screen on mobile (existing behavior)
- 90% width on tablet
- Fixed max-width on desktop
- Use existing animation classes

### 9. Form Layout Pattern (New Pattern)

**No New Component**: Use existing Container + Grid

**Two-Column Form Pattern** (Desktop Only):
```tsx
<Container size="md" className="lg:max-w-[600px]">
  <form>
    {/* Single column on mobile/tablet, two columns on desktop for related fields */}
    <div className={cn(
      "grid gap-4",
      "lg:grid-cols-2"  // Two columns on desktop for related fields
    )}>
      <Input label="First Name" />
      <Input label="Last Name" />
    </div>
    
    {/* Always single column for unrelated fields */}
    <Input label="Email" className="mt-4" />
    <Input label="Password" type="password" className="mt-4" />
    
    <Button type="submit" className="mt-6">Submit</Button>
  </form>
</Container>
```

**Implementation Notes**:
- Use CSS Grid with `lg:grid-cols-2` for related fields only
- Keep unrelated fields in single column
- Max-width 600px on desktop for form readability
- No new component needed

### 10. Typography Scaling (Tailwind Config)

**Extend tailwind.config.js** with responsive font sizes:
```javascript
module.exports = {
  theme: {
    extend: {
      fontSize: {
        // Mobile sizes (existing):
        'xs': '12px',
        'sm': '14px',
        'base': '14px',  // Body text mobile
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        
        // Add responsive variants (no new names, use with breakpoints):
        // Usage: text-base lg:text-lg (14px mobile, 16px desktop)
      }
    }
  }
}
```

**Typography Usage Pattern**:
```tsx
// Heading 1: 24px mobile → 30px tablet → 36px desktop
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">

// Heading 2: 20px mobile → 24px tablet → 30px desktop  
<h2 className="text-xl md:text-2xl lg:text-3xl font-semibold">

// Body text: 14px mobile → 14px tablet → 16px desktop
<p className="text-base lg:text-lg">

// Small text: 12px mobile → 12px tablet → 14px desktop
<span className="text-xs lg:text-sm">
```

**Implementation Notes**:
- No new font-size values needed
- Combine existing sizes with responsive prefixes
- Maintain 1.5 line-height for body, 1.2 for headings

## Data Models

No data model changes required. All existing interfaces and API contracts remain unchanged.

## Error Handling

No new error handling patterns needed. Existing error handling from ui-ux-mobile-improvements spec applies to desktop/tablet layouts:

- Form validation: Existing patterns work across all viewports
- Network errors: Existing ErrorState component works across all viewports  
- Empty states: Existing EmptyState component works across all viewports

## Testing Strategy

### Unit Testing Approach

Since this spec focuses on CSS/layout improvements rather than business logic, testing will focus on:

1. **Responsive Behavior Tests**: Verify correct classes are applied at each breakpoint
2. **Component Render Tests**: Ensure components render without errors on all viewports
3. **Accessibility Tests**: Verify touch targets and keyboard navigation work properly

### Test Examples

```typescript
// ResponsiveGrid: Verify column classes
describe('ResponsiveGrid', () => {
  it('should apply correct grid columns for desktop', () => {
    render(<ResponsiveGrid columns={{ desktop: 3 }}>Content</ResponsiveGrid>)
    const grid = screen.getByRole('grid')
    expect(grid).toHaveClass('lg:grid-cols-3')
  })
  
  it('should apply 4 columns on extra-large viewports', () => {
    render(<ResponsiveGrid columns={{ desktop: 3 }}>Content</ResponsiveGrid>)
    const grid = screen.getByRole('grid')
    expect(grid).toHaveClass('xl:grid-cols-4')
  })
})

// Container: Verify max-width classes
describe('Container', () => {
  it('should apply desktop max-width for large size', () => {
    render(<Container size="lg">Content</Container>)
    const container = screen.getByRole('main')
    expect(container).toHaveClass('lg:max-w-[1024px]')
  })
  
  it('should center content on desktop', () => {
    render(<Container>Content</Container>)
    const container = screen.getByRole('main')
    expect(container).toHaveClass('lg:mx-auto')
  })
})

// Modal: Verify responsive sizing
describe('Modal', () => {
  it('should be full-screen on mobile', () => {
    render(<Modal isOpen size="md">Content</Modal>)
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('fixed', 'inset-0')
  })
  
  it('should have fixed width on desktop', () => {
    render(<Modal isOpen size="md">Content</Modal>)
    const modal = screen.getByRole('dialog')
    expect(modal).toHaveClass('lg:max-w-[600px]')
  })
})

// SubjectCard: Verify layout switching
describe('SubjectCard', () => {
  it('should show mobile layout by default', () => {
    render(<SubjectCard subject={mockSubject} />)
    const mobileLayout = screen.getByTestId('mobile-layout')
    expect(mobileLayout).toHaveClass('lg:hidden')
  })
  
  it('should show desktop layout on large screens', () => {
    render(<SubjectCard subject={mockSubject} />)
    const desktopLayout = screen.getByTestId('desktop-layout')
    expect(desktopLayout).toHaveClass('hidden', 'lg:flex')
  })
})

// Touch targets: Verify minimum sizes
describe('Touch Target Compliance', () => {
  it('should meet minimum size on tablet viewports', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ minHeight: '44px' })
  })
  
  it('should have proper spacing between adjacent targets', () => {
    render(
      <div className="flex gap-2">
        <Button>First</Button>
        <Button>Second</Button>
      </div>
    )
    const container = screen.getByRole('group')
    expect(container).toHaveClass('gap-2')
  })
})
```

### Visual Regression Testing

Recommended (but not required for MVP):
- Use Storybook with viewport addons to preview all breakpoints
- Capture screenshots at key breakpoints: 375px, 768px, 1024px, 1280px
- Verify layouts match design specifications

### Manual Testing Checklist

Test on actual devices and browsers:

**Tablet Testing** (768px - 1024px):
- [ ] iPad (portrait 768px, landscape 1024px)
- [ ] Android tablet (various sizes)
- [ ] 2-column grids render correctly
- [ ] Touch targets meet 44px minimum
- [ ] Navigation adapts to orientation changes

**Desktop Testing** (1024px+):
- [ ] Laptop (1366x768, 1440x900, 1920x1080)
- [ ] Desktop monitor (1920x1080, 2560x1440)
- [ ] Content max-width applies correctly
- [ ] 3-4 column grids render correctly
- [ ] Horizontal navigation displays properly
- [ ] Hover states work on cards
- [ ] Modals are centered with appropriate sizing

**Browser Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Why No Property-Based Testing

Property-based testing is not applicable for this spec because:

1. **Layout/CSS Focus**: This spec modifies presentation (CSS classes), not business logic
2. **No Universal Properties**: Responsive breakpoints are discrete states, not continuous properties
3. **Visual Verification Needed**: Layout correctness requires visual inspection, not property assertions
4. **No Data Transformations**: No functions that transform inputs to outputs to test

Testing will focus on:
- Unit tests for component rendering
- Manual visual testing across viewports
- Accessibility compliance testing

## Implementation Checklist

### Phase 1: Core Layout (Container & Grid)

- [ ] Extend Container component with responsive padding classes (md:px-6, lg:px-8)
- [ ] Add Container desktop max-width classes (lg:max-w-[...])
- [ ] Extend ResponsiveGrid columns prop to include tablet and desktop
- [ ] Add responsive grid-cols classes (md:grid-cols-2, lg:grid-cols-3, xl:grid-cols-4)
- [ ] Add responsive gap classes (md:gap-7, lg:gap-8)
- [ ] Test Container and ResponsiveGrid on different viewports

### Phase 2: Navigation

- [ ] Add responsive height classes to Header (lg:h-16)
- [ ] Add desktop layout to Header with logo + horizontal nav + user menu
- [ ] Hide hamburger menu on desktop (lg:hidden)
- [ ] Show DesktopNav on desktop (hidden lg:flex)
- [ ] Verify DesktopNav hover and active states work
- [ ] Test navigation on tablet portrait vs landscape

### Phase 3: Cards

- [ ] Add desktop-only hover classes to Card (lg:hover:scale-[1.02], lg:hover:shadow-elevated-hover)
- [ ] Add desktop horizontal layout to SubjectCard (hidden lg:flex)
- [ ] Convert SubjectCard action buttons to icon-only on desktop
- [ ] Adjust ChapterCard status badges to horizontal layout (already flex-wrap)
- [ ] Make ChapterCard buttons horizontal on tablet (md:flex-row)
- [ ] Test card hover states on desktop (should not trigger on mobile/tablet)

### Phase 4: Modals & Forms

- [ ] Add tablet responsive classes to Modal (md:inset-auto, md:w-[90%], md:rounded-lg)
- [ ] Add desktop max-width classes to Modal (lg:max-w-[400px/600px/800px])
- [ ] Add desktop centering to Modal (md:top-1/2, md:left-1/2, transform)
- [ ] Document two-column form pattern using lg:grid-cols-2
- [ ] Test modals on mobile (full-screen), tablet (90% width), desktop (fixed width)

### Phase 5: Typography & Density

- [ ] Apply responsive typography classes to headings (text-2xl md:text-3xl lg:text-4xl)
- [ ] Apply responsive body text classes (text-base lg:text-lg)
- [ ] Adjust card padding for desktop density (lg:p-4 instead of lg:p-6)
- [ ] Review spacing and adjust gaps for desktop (reduce by 25%)
- [ ] Test readability and information density on desktop

### Phase 6: Testing & Refinement

- [ ] Write unit tests for responsive class application
- [ ] Test on iPad (portrait and landscape)
- [ ] Test on various laptop sizes (1366px, 1440px, 1920px)
- [ ] Verify touch targets on tablet (44px minimum)
- [ ] Test modal animations and transitions
- [ ] Verify hover states only trigger on desktop
- [ ] Test form layouts on desktop
- [ ] Verify accessibility (keyboard navigation, focus indicators)

## Desktop Layout Examples

### Subject List Page Layout

**Mobile** (existing):
```
┌─────────────────┐
│    Header       │
├─────────────────┤
│  Subject Card   │
│  [Full Width]   │
├─────────────────┤
│  Subject Card   │
│  [Full Width]   │
├─────────────────┤
│  Subject Card   │
│  [Full Width]   │
└─────────────────┘
```

**Tablet** (768px-1024px):
```
┌────────────────────────────────┐
│          Header                │
├────────────────────────────────┤
│  Subject Card  │ Subject Card  │
│  [50% width]   │ [50% width]   │
├────────────────────────────────┤
│  Subject Card  │ Subject Card  │
│  [50% width]   │ [50% width]   │
└────────────────────────────────┘
```

**Desktop** (1024px+):
```
┌──────────────────────────────────────────┐
│              Header                      │
├──────────────────────────────────────────┤
│  Subject  │  Subject  │  Subject        │
│  Card     │  Card     │  Card           │
│  [33%]    │  [33%]    │  [33%]          │
├──────────────────────────────────────────┤
│  Subject  │  Subject  │  Subject        │
│  Card     │  Card     │  Card           │
│  [33%]    │  [33%]    │  [33%]          │
└──────────────────────────────────────────┘
```

### Quiz Interface Layout

**Mobile** (existing):
```
┌─────────────────┐
│  Progress Bar   │
├─────────────────┤
│                 │
│  Question Text  │
│                 │
├─────────────────┤
│  Option A       │
│  [Full Width]   │
├─────────────────┤
│  Option B       │
│  [Full Width]   │
├─────────────────┤
│  Option C       │
│  [Full Width]   │
├─────────────────┤
│  Option D       │
│  [Full Width]   │
├─────────────────┤
│  [Previous]     │
│  [Next]         │
└─────────────────┘
```

**Desktop** (1024px+):
```
┌────────────────────────────────────────┐
│         Progress Bar (Fixed Top)        │
├────────────────────────────────────────┤
│                                        │
│        Question Text (Centered)         │
│           [Max-width 800px]             │
│                                        │
│          Option A (Centered)            │
│          Option B (Centered)            │
│          Option C (Centered)            │
│          Option D (Centered)            │
│                                        │
│       [Previous]    [Next]              │
│                                        │
└────────────────────────────────────────┘
```

## Summary

This design document provides a practical, implementation-focused approach to extending the mobile-first responsive design to tablet and desktop viewports. By maximizing component reuse and focusing on Tailwind CSS class adjustments, we avoid unnecessary complexity while delivering a polished multi-viewport experience.

**Key Takeaways**:
1. **Reuse everything**: All components from ui-ux-mobile-improvements are reused
2. **CSS-first**: Changes are primarily Tailwind class additions
3. **Minimal code**: No new components needed, only configuration
4. **Progressive enhancement**: Build on solid mobile foundation
5. **Practical approach**: Simple solutions, no over-engineering
