# Mobile Testing Quick Reference 📱

## Test on Your Phone in 3 Steps

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Get Your IP Address
**Windows:**
```bash
ipconfig
# Look for "IPv4 Address"
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Or: hostname -I
```

### Step 3: Access from Phone
```
http://YOUR_IP:3000
```
Example: `http://192.168.1.100:3000`

**Make sure your phone and computer are on the same WiFi network!**

---

## Quick Mobile Test Checklist ✅

### AR Try-On (Most Important!)
- [ ] Open any product page
- [ ] Click "Try On with AR"
- [ ] Grant camera permission
- [ ] See yourself in the camera
- [ ] Wig appears on your head
- [ ] Drag wig to reposition (touch and drag)
- [ ] Use sliders to adjust size/position
- [ ] Click "Auto-Fit" button
- [ ] Take a screenshot
- [ ] Upload a photo instead of camera

### Navigation
- [ ] Tap hamburger menu (☰)
- [ ] Menu opens smoothly
- [ ] All links are easy to tap
- [ ] Cart badge shows item count
- [ ] Menu closes when you tap a link

### Product Browsing
- [ ] Products display in grid (1-2 columns on phone)
- [ ] Images load properly
- [ ] Tap a product card
- [ ] Product detail page loads
- [ ] "Add to Cart" button is easy to tap

### Cart & Checkout
- [ ] Add item to cart
- [ ] Cart icon updates
- [ ] Open cart page
- [ ] Quantity +/- buttons work
- [ ] Remove item works
- [ ] "Checkout" button is prominent
- [ ] Checkout form is mobile-friendly

---

## Common Issues & Quick Fixes

### Camera Not Working?
1. **Check permissions:** Settings > Safari/Chrome > Camera
2. **Use HTTPS:** Camera requires secure connection
3. **Try photo upload:** Works without camera permission

### Can't Access from Phone?
1. **Same WiFi?** Phone and computer must be on same network
2. **Firewall?** Temporarily disable firewall
3. **Use ngrok:** `npx ngrok http 3000` for public URL

### Touch Not Working?
1. **Refresh page:** Sometimes helps
2. **Clear cache:** Settings > Clear browsing data
3. **Try different browser:** Chrome, Safari, Firefox

### Page Looks Weird?
1. **Zoom level:** Pinch to reset zoom
2. **Rotate device:** Try portrait and landscape
3. **Refresh:** Pull down to refresh

---

## Device Testing Priority

### Must Test (High Priority)
1. **Your personal phone** - Most important!
2. **iPhone (any model)** - iOS Safari
3. **Android phone** - Chrome

### Should Test (Medium Priority)
4. **Tablet (iPad or Android)** - Larger screen
5. **Different browsers** - Safari, Chrome, Firefox

### Nice to Test (Low Priority)
6. **Older devices** - Performance check
7. **Different screen sizes** - Various phones

---

## Browser DevTools Testing

### Chrome DevTools
1. Press `F12` or `Ctrl+Shift+I`
2. Click device icon (📱) or press `Ctrl+Shift+M`
3. Select device: iPhone 12 Pro, Galaxy S20, etc.
4. Refresh page
5. Test features

### Responsive Breakpoints to Test
- **375px** - iPhone SE (smallest)
- **390px** - iPhone 12/13/14
- **430px** - iPhone 14 Pro Max
- **768px** - iPad
- **1024px** - Desktop

---

## AR Try-On Mobile Features

### Touch Gestures (Already Implemented!)
- **Drag:** Touch and drag to move wig
- **Sliders:** Adjust size, position, opacity
- **Buttons:** Auto-fit, reset, screenshot

### Camera Features
- **Front camera:** Default for selfies
- **Photo upload:** Alternative to live camera
- **Screenshot:** Save your try-on

### Controls
- **Size slider:** Make wig bigger/smaller
- **Vertical position:** Move wig up/down
- **Horizontal position:** Move wig left/right
- **Opacity:** Make wig more/less transparent
- **Auto-fit:** Automatic positioning

---

## Performance Check

### Page Load
- [ ] Page loads in < 3 seconds
- [ ] Images appear quickly
- [ ] No layout shifts

### Interactions
- [ ] Buttons respond immediately
- [ ] Scrolling is smooth
- [ ] Animations are smooth
- [ ] No lag when typing

### AR Performance
- [ ] Camera starts in < 2 seconds
- [ ] Wig renders smoothly
- [ ] No frame drops when moving
- [ ] Controls respond instantly

---

## Screenshot Your Tests

Take screenshots of:
1. Home page on mobile
2. Product grid on mobile
3. AR try-on with wig
4. Cart page on mobile
5. Checkout form on mobile
6. Any issues you find

---

## Report Issues

If you find problems, note:
- **Device:** iPhone 12, Samsung S21, etc.
- **Browser:** Safari, Chrome, Firefox
- **Issue:** What went wrong?
- **Steps:** How to reproduce?
- **Screenshot:** Visual proof

---

## Quick Tips

### For Best AR Experience
1. **Good lighting:** Face a window or light
2. **Steady hand:** Hold phone still
3. **Face camera:** Look directly at camera
4. **Center yourself:** Keep head in frame
5. **Use auto-fit:** Let it position automatically

### For Best Shopping Experience
1. **Portrait mode:** Hold phone vertically
2. **WiFi connection:** Faster than mobile data
3. **Updated browser:** Latest version
4. **Clear cache:** If things look broken

---

## Success Criteria

Your mobile experience is good if:
- ✅ AR try-on works with phone camera
- ✅ All pages are easy to navigate
- ✅ Buttons are easy to tap
- ✅ Text is readable without zooming
- ✅ Images load quickly
- ✅ No horizontal scrolling
- ✅ Forms are easy to fill
- ✅ Checkout process is smooth

---

## Need Help?

1. Check [Mobile Implementation Guide](./MOBILE_FIRST_IMPLEMENTATION_GUIDE.md)
2. Review [Mobile Optimization Doc](./MOBILE_FIRST_OPTIMIZATION.md)
3. See [AR Quick Start](./2D_AR_QUICK_START.md)
4. Check [Troubleshooting Guide](./2D_AR_TROUBLESHOOTING.md)

---

**Remember:** Most users will use your app on their phone. Test on real devices! 📱✨
