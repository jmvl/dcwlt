---
phase: quick-004
plan: 001
type: execute
wave: 1
depends_on: []
files_modified: [merchant/public/index.html]
autonomous: true

must_haves:
  truths:
    - "All interactive elements have visible focus states for keyboard navigation"
    - "Product selection controls are proper button elements (not divs)"
    - "All interactive elements have appropriate ARIA labels"
    - "Color contrast meets WCAG AA standards (4.5:1 for normal text)"
  artifacts:
    - path: "merchant/public/index.html"
      provides: "Accessible merchant terminal interface"
      contains: "button.product-button", "[aria-label]", ":focus-visible"
  key_links:
    - from: "button.product-button"
      to: "keyboard navigation"
      via: "focus-visible styles"
      pattern: "\\:focus-visible.*outline"
    - from: "interactive elements"
      to: "screen readers"
      via: "aria-label attributes"
      pattern: "aria-label="
---

<objective>
Improve merchant terminal accessibility by adding keyboard navigation support, proper semantic HTML, and ARIA labels.

Purpose: Ensure the merchant terminal is usable by keyboard-only users and screen reader users, meeting WCAG 2.1 AA standards.
Output: An accessible merchant terminal with focus states, semantic buttons, and ARIA labels.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

@merchant/public/index.html
</context>

<tasks>

<task type="auto">
  <name>Convert product buttons to semantic elements and add accessibility attributes</name>
  <files>merchant/public/index.html</files>
  <action>
    Make the following changes to merchant/public/index.html:

    1. **Change product buttons from div to button** (lines 214-229):
       - Replace `<div class="product-button" data-amount="5" data-product="🍺 Beer">`
       - With `<button type="button" class="product-button" data-amount="5" data-product="🍺 Beer" aria-label="Select Beer, 5 EVT">`
       - Apply to all 4 product buttons (Beer, Pizza Slice, Burger, Event Ticket)
       - Close with `</button>` instead of `</div>`

    2. **Add ARIA labels to interactive elements**:
       - Add `aria-label="Generate payment QR code"` to the product buttons
       - Add `aria-label="Start new transaction"` to the reset button (line 241)
       - Add `aria-live="polite"` to qrContainer div (line 232)
       - Add `aria-live="assertive"` to error-container (line 211)
       - Add `role="status"` to the status paragraph (line 238)
       - Add `aria-label="Payment QR code"` to qr-image img element (line 282 in script)

    3. **Add keyboard navigation styles** to the CSS section (before @media queries):
       ```css
       /* Keyboard focus styles */
       .product-button:focus-visible,
       .reset-button:focus-visible {
         outline: 3px solid #9945FF;
         outline-offset: 2px;
       }

       .qr-image:focus-visible {
         outline: 3px solid #9945FF;
         outline-offset: 4px;
       }
       ```

    4. **Fix color contrast** for the product-price class (lines 87-91):
       - Change `color: #9945FF;` to `color: #7B2CBF;` (darker purple, passes WCAG AA on white)
       - This improves contrast from 3.8:1 to ~4.7:1

    5. **Update JavaScript selectors** to handle button elements (line 249):
       - The existing `querySelectorAll('.product-button')` will still work with button elements
       - No changes needed to the JavaScript logic
  </action>
  <verify>
    Open merchant/public/index.html in a browser and verify:
    - Tab key navigates through product buttons in order
    - Focus state shows 3px solid purple outline with 2px offset
    - Screen reader announces button labels correctly (test with VoiceOver or NVDA)
    - Color contrast of product price text is readable (use browser devtools contrast checker)
    - All interactive elements are focusable via keyboard
  </verify>
  <done>
    - Product selection controls are proper button elements with type="button"
    - All buttons have visible focus states (3px solid #9945FF outline with 2px offset)
    - All interactive elements have appropriate ARIA labels
    - Product price color (#7B2CBF) meets WCAG AA contrast requirements (4.5:1)
    - Keyboard navigation works through entire interface
  </done>
</task>

</tasks>

<verification>
1. Open merchant terminal in browser
2. Press Tab repeatedly - focus should move through product buttons, then reset button
3. Verify each focused element shows purple outline with offset
4. Use screen reader (VoiceOver/NVDA) to confirm ARIA labels are announced
5. Check color contrast with browser DevTools Lighthouse audit
6. Run: `npm run dev` in merchant directory and test full keyboard flow
</verification>

<success_criteria>
- All product buttons are semantic button elements with type="button"
- Focus visible state adds 3px solid #9945FF outline with 2px offset
- All interactive elements have descriptive aria-label attributes
- Product price text color (#7B2CBF) meets WCAG AA contrast (≥4.5:1)
- Entire interface is navigable using only Tab and Enter keys
- Screen reader announces all interactive elements clearly
</success_criteria>

<output>
After completion, create `.planning/quick/004-improve-merchant-terminal-accessibility/004-001-SUMMARY.md`
</output>
