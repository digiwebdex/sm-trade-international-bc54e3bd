

## Mobile CTA Button Improvements

The hero section's CTA buttons currently use the same sizing on all screens. On mobile, they need to be more thumb-friendly and better spaced.

### Changes (single file: `src/components/HeroSection.tsx`)

1. Make both CTA buttons full-width on mobile (`w-full sm:w-auto`)
2. Increase tap target size on mobile with larger padding (`py-7 sm:py-6`)
3. Increase font size slightly on mobile for better readability (`text-lg sm:text-base`)
4. Adjust gap between buttons for mobile (`gap-3 sm:gap-4`)
5. Ensure the button container stacks vertically on mobile (already `flex-col sm:flex-row` -- just refine spacing)

These are minor class tweaks to the existing button elements to ensure they look great and are easy to tap on smaller screens.

