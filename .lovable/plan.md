
# Fix: Scroll to Top on Page Navigation

## Problem
When clicking a product (from the hero carousel or anywhere else), the browser navigates to the product detail page but keeps the previous scroll position. This causes the visitor to land at the bottom of the page (footer area) instead of the top where the product information is displayed.

## Root Cause
The app is missing a "scroll to top" handler on route changes. React Router does not automatically scroll to the top when navigating between pages.

## Solution
Create a small `ScrollToTop` component that listens for route changes and scrolls the window to the top. Then add it inside the `BrowserRouter` in `App.tsx`.

## Technical Details

**New file: `src/components/ScrollToTop.tsx`**
- Uses `useLocation()` from react-router-dom to detect route changes
- Calls `window.scrollTo(0, 0)` in a `useEffect` whenever the pathname changes
- Returns `null` (renders nothing)

**Edit: `src/App.tsx`**
- Import `ScrollToTop`
- Place `<ScrollToTop />` right inside `<BrowserRouter>` so it fires on every navigation

This is a single, lightweight fix that solves the problem for all page navigations across the entire site.
