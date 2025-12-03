# Mobile Quick Start 📱

## Test on Your Phone in 60 Seconds

### 1. Start Server
```bash
npm run dev
```

### 2. Get IP Address
**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### 3. Open on Phone
```
http://YOUR_IP:3000
```
Example: `http://192.168.1.100:3000`

⚠️ **Important:** Phone and computer must be on same WiFi!

---

## Try the AR Feature

1. Navigate to any product
2. Click "Try On with AR"
3. Grant camera permission
4. See yourself with the wig!
5. Drag to reposition (touch and drag)
6. Use sliders to adjust
7. Click "Auto-Fit" for automatic positioning
8. Take a screenshot

---

## What's Mobile-Optimized?

✅ **AR Try-On**
- Portrait mode (9:16 aspect ratio)
- Touch drag to position
- Photo upload from gallery
- Auto-fit feature
- Face guide overlay

✅ **Navigation**
- Hamburger menu
- Touch-friendly links
- Collapsible sections

✅ **Product Browsing**
- Responsive grid (1-2-3 columns)
- Touch-friendly cards
- Mobile filters

✅ **Cart & Checkout**
- Large touch targets
- Mobile-friendly forms
- Guest checkout

---

## Quick Troubleshooting

**Can't access from phone?**
- Check same WiFi network
- Try disabling firewall temporarily
- Use `npx ngrok http 3000` for public URL

**Camera not working?**
- Grant camera permission in browser
- Try photo upload instead
- Ensure HTTPS or localhost

**Touch not working?**
- Refresh page
- Clear browser cache
- Try different browser

---

## Key Mobile Features

### Touch Gestures
- **Drag**: Reposition wig
- **Tap**: Select colors, buttons
- **Swipe**: Navigate (where implemented)

### Camera
- **Front camera**: Default for selfies
- **Photo upload**: From gallery
- **Screenshot**: Save try-on

### Responsive
- **Breakpoints**: 375px, 640px, 768px, 1024px
- **Safe areas**: Notch support
- **Touch targets**: Minimum 44x44px

---

## Performance Tips

- Use WiFi for best experience
- Clear cache if slow
- Update browser to latest version
- Good lighting for AR

---

## More Info

- [Complete Mobile Guide](./MOBILE_FIRST_IMPLEMENTATION_GUIDE.md)
- [Testing Checklist](./MOBILE_TESTING_QUICK_REFERENCE.md)
- [Optimization Details](./MOBILE_FIRST_OPTIMIZATION.md)
- [AR Quick Start](./2D_AR_QUICK_START.md)

---

**Remember:** Most users will use their phone. Test there first! 📱✨
