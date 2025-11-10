# Payment Integration - Development Notes

## Current Status: MOCK PAYMENT

The payment flow is currently using a **mock/simplified implementation** for development and testing purposes.

### Why No Transactions?

MongoDB transactions require a **replica set** configuration. Most development environments use standalone MongoDB instances, which don't support transactions. 

The current implementation:
- ✅ Creates orders and tickets sequentially
- ✅ Updates event statistics
- ✅ Handles reservation confirmations
- ❌ Does NOT use atomic transactions (not available in standalone MongoDB)

### What This Means

**For Development**: Everything works fine. The simplified flow handles ticket generation correctly.

**For Production**: Consider either:
1. Use MongoDB Atlas (which provides replica sets by default)
2. Set up a local MongoDB replica set
3. Keep simplified approach (acceptable risk for MVP)

---

## Mock Payment Flow

Current flow in `/app/api/tickets/confirm/route.ts`:

```
1. User enters payment amount
2. System validates amount matches reservation
3. Creates order with status "PAID"
4. Generates tickets with QR codes
5. Updates event statistics (ticketsSold, revenue)
6. Confirms reservation
7. Queues email notification
```

**Payment Gateway**: Set to `"MOCK"`
**Transaction ID**: Auto-generated as `TXN-{timestamp}-{random}`

---

## Future: Real Payment Gateway Integration

When you're ready to integrate Stripe, PayPal, or other payment gateways:

### Steps to Integrate Real Payment

1. **Choose Payment Provider**
   - Stripe (recommended)
   - PayPal
   - Razorpay
   - SSLCommerz (Bangladesh)

2. **Update Payment Flow**
   ```typescript
   // In BuyTicketFlow.tsx
   - Remove mock payment input
   + Add Stripe Elements or payment provider SDK
   
   // In /app/api/tickets/confirm/route.ts
   - Remove mock payment verification
   + Verify payment via provider webhook
   + Check payment intent status
   ```

3. **Add Webhook Handler**
   ```typescript
   // New file: /app/api/webhooks/stripe/route.ts
   export async function POST(req: Request) {
     const signature = req.headers.get('stripe-signature');
     const event = stripe.webhooks.constructEvent(body, signature, secret);
     
     if (event.type === 'payment_intent.succeeded') {
       // Call ticket confirmation logic
     }
   }
   ```

4. **Update Reservation Flow**
   - Extend reservation expiry to 30 minutes (payment flow takes longer)
   - Add payment intent ID to reservation
   - Handle payment failures gracefully

5. **MongoDB Replica Set** (optional but recommended)
   - Use MongoDB Atlas (automatically replica set)
   - Or set up local replica set:
     ```bash
     # Start MongoDB replica set
     mongod --replSet rs0 --port 27017
     
     # Initialize replica set
     mongo --eval "rs.initiate()"
     ```

---

## Stripe Integration Example

### 1. Install Stripe SDK
```bash
pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Create Payment Intent API
```typescript
// app/api/payment/create-intent/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { amount, reservationId } = await req.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: 'bdt', // Bangladesh Taka
    metadata: { reservationId },
  });
  
  return Response.json({ clientSecret: paymentIntent.client_secret });
}
```

### 3. Update BuyTicketFlow Component
```tsx
// In payment step
import { Elements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Replace mock input with Stripe Elements
<Elements stripe={stripePromise} options={{ clientSecret }}>
  <PaymentElement />
  <button onClick={handleStripePayment}>Pay Now</button>
</Elements>
```

### 4. Create Webhook Handler
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const reservationId = paymentIntent.metadata.reservationId;
    
    // Call existing ticket confirmation logic
    // (move core logic to a service function)
    await confirmTicketPurchase(reservationId);
  }
  
  return Response.json({ received: true });
}
```

### 5. Environment Variables
```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Testing Payment Integration

### Test Cards (Stripe Test Mode)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

### Webhook Testing
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

---

## Cost Considerations

### Stripe Fees (Bangladesh)
- 2.9% + ৳3 per successful transaction
- No setup fees, no monthly fees
- Only pay for successful transactions

### Example:
- Ticket Price: ৳500
- Stripe Fee: ৳17.50 (2.9% + ৳3)
- You Receive: ৳482.50

---

## Security Checklist

When integrating real payment:

- [ ] Never store credit card details
- [ ] Always use HTTPS in production
- [ ] Validate webhook signatures
- [ ] Use environment variables for API keys
- [ ] Implement rate limiting on payment endpoints
- [ ] Add fraud detection (Stripe Radar)
- [ ] Log all payment attempts
- [ ] Handle payment failures gracefully
- [ ] Implement refund logic
- [ ] Add payment dispute handling

---

## Current Mock Payment - Works For

✅ Development and testing
✅ Demo and MVP presentations
✅ User flow validation
✅ Frontend integration testing
✅ QR code generation testing
✅ Email notification testing

## Not Suitable For

❌ Production use with real customers
❌ Processing actual payments
❌ Compliance requirements (PCI-DSS)
❌ Financial auditing

---

## Questions?

- **Why mock payment?**: Focus on core features first, payment later
- **When to integrate real payment?**: Before production launch
- **Which provider?**: Stripe recommended for Bangladesh
- **Transaction safety?**: Acceptable for MVP, use replica set for production

---

**Last Updated**: November 8, 2025
**Status**: Mock implementation - works for development
**Next Step**: Choose payment provider when ready for production
