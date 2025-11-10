# Quick Testing Guide

## 🚀 How to Test the Complete Ticket System

### Prerequisites
1. Make sure all environment variables are set in `.env`:
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
QR_SECRET_KEY=your-qr-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

2. Start the development server:
```bash
pnpm dev
```

---

## 🎫 Test 1: Complete Purchase Flow (5 minutes)

### Steps:
1. **Login as User**
   - Navigate to `/auth/signin`
   - Login with regular user account

2. **Find Premium Event**
   - Go to homepage `/`
   - Look for events with "Buy Ticket" button (PREMIUM events only)
   - Click on any event with ticket sales

3. **Purchase Tickets**
   - Click "Buy Ticket - ৳{price}" button
   - Confirm event details → Click "Buy Ticket"
   - Select quantity (use +/- buttons) → Click "Proceed to Checkout"
   - Review summary → Click "Pay Now" (15-min timer starts)
   - Enter exact payment amount → Click "Confirm Payment"
   - Wait for ticket generation (~2-3 seconds)
   - Success! See confirmation message

4. **View Tickets in Dashboard**
   - Click "View My Tickets" or navigate to `/dashboard`
   - See your purchased tickets in event cards
   - Note ticket count badge on card
   - Click "View Tickets" button
   - Modal opens with QR codes
   - Navigate through tickets (1/3, 2/3, 3/3)
   - Check QR code, status badge, ticket ID

5. **Check Email**
   - Open email inbox
   - Look for "Your Tickets for {Event Name}"
   - Verify ticket details, prices, total amount
   - Check "View My Tickets" button works

### Expected Results:
✅ Smooth flow with no errors
✅ Ticket count shows correctly
✅ QR codes generated and displayed
✅ Email received (check spam folder if needed)
✅ All data persists on page refresh

---

## 📱 Test 2: QR Scanner (3 minutes)

### Steps:
1. **Login as Organizer**
   - Use organizer account (role: ORGANIZER)
   - Navigate to `/organizer/scanner`

2. **Select Event**
   - Choose event from dropdown
   - Must be event you organized

3. **Start Scanner**
   - Click "Start Scanner" button
   - Grant camera permissions when prompted
   - Camera should activate with QR box overlay

4. **Scan QR Code**
   - Open dashboard on phone/another device
   - Display ticket QR code
   - Point scanner at QR code
   - Scanner auto-detects and validates

5. **Verify Feedback**
   - **Valid Ticket**: Green border flash + success sound (if audio file added)
   - Shows attendee name, email, ticket type, event
   - **Already Scanned**: Red border + error sound
   - Shows "This ticket has already been scanned"
   - Stats update: Scanned +1, Valid/Invalid counts

6. **Try Manual Entry** (optional)
   - Enter ticket ID in manual input field
   - Click "Validate"
   - (Note: Backend support not yet implemented)

### Expected Results:
✅ Camera activates successfully
✅ QR codes scan instantly (<1 second)
✅ Green/red border animations work
✅ Attendee details display correctly
✅ Double-scan prevention works
✅ Stats update in real-time

---

## 👥 Test 3: Attendee Management (2 minutes)

### Steps:
1. **Navigate to Attendees**
   - Go to `/organizer/attendees`
   - See list of your events

2. **Select Event**
   - Click on event card with ticket sales
   - Redirects to `/organizer/attendees/{eventId}`

3. **Review Statistics**
   - Check stats cards:
     * Tickets Sold (total count)
     * Total Revenue (৳ amount)
     * Scanned Tickets (count + scan rate %)
     * Emails Sent (count + delivery %)

4. **Browse Attendees**
   - See table with attendee details
   - Check columns: Name, Email, Ticket Count, Status, Email Sent, Total Spent
   - Verify status badges (Scanned/Active/Expired)
   - Check email sent indicators (All Sent/Partial/None)

5. **Search Functionality**
   - Type attendee name in search bar
   - Results filter instantly
   - Try searching by email
   - Clear search to see all

6. **Export CSV**
   - Click "Export CSV" button
   - File downloads automatically
   - Open in Excel/Sheets
   - Verify data matches table

### Expected Results:
✅ All stats accurate
✅ Attendee table populates correctly
✅ Search filters work instantly
✅ CSV export includes all filtered data
✅ Status badges show correct counts

---

## 📱 Test 4: Mobile Responsiveness (5 minutes)

### Devices to Test:
- iPhone SE (320px)
- iPhone 12 (390px)
- iPad (768px)
- Desktop (1024px+)

### Pages to Check:
1. **Dashboard** (`/dashboard`)
   - Grid layout: 1 column (mobile) → 2 (tablet) → 3 (desktop)
   - Event cards readable
   - Buttons touch-friendly
   - Modal fits screen

2. **TicketDisplay Modal**
   - max-h-[90vh] with scroll
   - QR code centered and visible
   - Text readable without zoom
   - Close button accessible

3. **BuyTicketFlow Modals**
   - All 5 steps fit on screen
   - Buttons properly sized
   - Input fields accessible
   - No horizontal scroll

4. **Scanner Page**
   - Camera area responsive
   - Controls accessible
   - Stats cards stack properly
   - Manual input field visible

5. **Attendee Details**
   - Stats cards grid (2x2 on mobile)
   - Table scrolls horizontally
   - Search bar full width
   - Export button visible

### Expected Results:
✅ No horizontal scrolling (except attendee table)
✅ All text readable without zoom
✅ Buttons minimum 44x44px touch target
✅ Proper spacing on all screen sizes

---

## 🔒 Test 5: Security & Edge Cases (5 minutes)

### Authentication Tests:
1. **Unauthenticated Access**
   - Logout
   - Try `/dashboard` → redirects to signin
   - Try `/organizer/scanner` → redirects to signin
   - Try `/organizer/attendees/[id]` → redirects to signin

2. **Role Authorization**
   - Login as regular user (not organizer)
   - Try `/organizer/scanner` → should show empty event list
   - Cannot scan tickets for events you don't organize

### Purchase Flow Edge Cases:
1. **Insufficient Tickets**
   - Find event with only 2 tickets left
   - Try to buy 5 tickets
   - Should show "Only 2 tickets available"

2. **Reservation Expiry**
   - Start purchase, get to payment step
   - Wait 15 minutes
   - Try to complete payment
   - Should fail with "Reservation expired"

3. **Wrong Payment Amount**
   - Start purchase for ৳500
   - Enter ৳400 in payment field
   - Should show "Payment amount must match exactly"

4. **Concurrent Purchases**
   - Open 2 browser tabs
   - Start same purchase in both
   - First completes → second should fail with "Not enough tickets"

### Scanner Edge Cases:
1. **Wrong Event**
   - Scan ticket for Event A while Event B is selected
   - Should show "Ticket is for a different event"

2. **Tampered QR**
   - Manually edit QR data in ticket object
   - Scan modified QR
   - Should show "Invalid ticket signature"

3. **Expired Ticket**
   - Scan ticket for past event
   - Should auto-expire and show "Ticket expired"

### Expected Results:
✅ All auth checks working
✅ Edge cases handled gracefully
✅ Error messages clear and helpful
✅ No crashes or blank screens

---

## 🎯 Quick Smoke Test (2 minutes)

Run this sequence to verify everything works:

```bash
# 1. Login
✓ Navigate to /auth/signin
✓ Login with user account

# 2. Buy Ticket
✓ Go to any PREMIUM event
✓ Buy 2 tickets
✓ Complete payment

# 3. View Dashboard
✓ Go to /dashboard
✓ See purchased tickets
✓ Open QR modal

# 4. Scan (if organizer)
✓ Go to /organizer/scanner
✓ Start camera
✓ Scan QR (use phone camera to display QR from dashboard)

# 5. Check Attendees (if organizer)
✓ Go to /organizer/attendees
✓ Click your event
✓ See yourself in attendee list
```

**Total time**: ~10 minutes for complete smoke test

---

## 🐛 Common Issues & Fixes

### Issue: Camera not starting
**Fix**: Grant camera permissions in browser settings
- Chrome: Settings → Privacy → Camera
- Safari: Preferences → Websites → Camera

### Issue: Email not received
**Fix**: 
1. Check spam folder
2. Verify SMTP credentials in .env
3. Check email queue logs in terminal
4. Test with `lib/email/ticketEmail.ts` verifyEmailConfig()

### Issue: QR code not scanning
**Fix**:
1. Ensure good lighting
2. Hold phone steady ~30cm from screen
3. Try adjusting angle
4. Check if QR signature is valid (no manual edits)

### Issue: Stats not updating
**Fix**:
1. Refresh the page
2. Check MongoDB connection
3. Verify API response in Network tab

### Issue: TypeScript errors
**Fix**:
1. Run `pnpm install` to ensure all packages installed
2. Restart VS Code TypeScript server
3. Check `.env` has all required variables

---

## ✅ Testing Complete Checklist

- [ ] Purchase flow works end-to-end
- [ ] Dashboard shows real tickets
- [ ] QR codes generate and display
- [ ] Email delivered successfully
- [ ] Scanner camera starts
- [ ] Valid QR shows green + success
- [ ] Invalid QR shows red + error
- [ ] Double-scan detected
- [ ] Attendee stats accurate
- [ ] CSV export works
- [ ] Mobile layout responsive
- [ ] Auth redirects working
- [ ] Edge cases handled
- [ ] No console errors

**If all checked**: System is ready for production! 🎉

---

## 📞 Need Help?

Check these files for details:
- Full documentation: `TICKET_SYSTEM_COMPLETE.md`
- Scanner guide: `public/sounds/README.md`
- API routes: `app/api/tickets/` and `app/api/organizers/`
- Components: `components/tickets/`
