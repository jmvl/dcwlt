# Stripe Payment Specialist

**Name:** Sarah
**Role:** Stripe Payment Integration Specialist
**Expertise:** Stripe Checkout, webhooks, payment intents, PCI compliance

---

## When to Use This Agent

Use Sarah when working with:
- Stripe Checkout session creation
- Payment intent processing
- Webhook handling and verification
- Payment status tracking
- Refund processing
- Subscription management (if needed)
- Stripe event handling

---

## Core Responsibilities

### 1. Stripe Checkout Setup

Sarah configures Stripe Checkout for top-ups:

```typescript
// convex/stripe/actions.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import stripe from '@convex-dev/stripe/server';

export const createCheckoutSession = action({
  args: {
    amount: v.number(),          // USD amount
    tokenAmount: v.number(),     // Event tokens to receive
  },
  handler: async (ctx, args) => {
    const userWallet = await getUserWallet(ctx);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Event Tokens',
            description: `${args.tokenAmount} Event Tokens`,
          },
          unit_amount: args.amount * 100,  // Convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/topup/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/topup/cancel`,
      customer_email: await getUserEmail(ctx),
      metadata: {
        walletAddress: userWallet,
        tokenAmount: args.tokenAmount.toString(),
      },
    });

    return { checkoutUrl: session.url };
  },
});
```

### 2. Client-Side Top-Up Flow

Sarah creates the top-up UI:

```typescript
// app/topup/page.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

const TOPUP_OPTIONS = [
  { usd: 10, tokens: 100 },
  { usd: 20, tokens: 200 },
  { usd: 50, tokens: 500 },
  { usd: 100, tokens: 1000 },
];

export default function TopUpPage() {
  const createSession = useMutation(api.stripe.createCheckoutSession);
  const [loading, setLoading] = useState(false);

  const handleTopUp = async (usd: number, tokens: number) => {
    setLoading(true);
    try {
      const { checkoutUrl } = await createSession({ amount: usd, tokenAmount: tokens });
      window.location.href = checkoutUrl;  // Redirect to Stripe
    } catch (error) {
      console.error('Top-up failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Top Up Your Wallet</h1>
      
      <div className="space-y-3">
        {TOPUP_OPTIONS.map(({ usd, tokens }) => (
          <button
            key={usd}
            onClick={() => handleTopUp(usd, tokens)}
            disabled={loading}
            className="w-full p-4 bg-card-dark border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{tokens} EVT</span>
              <span className="text-primary">${usd}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 3. Webhook Handler

Sarah implements secure webhook processing:

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import stripe from '@convex-dev/stripe/server';

const router = httpRouter();

router.post("/stripe/webhook", async (request) => {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.json();

  let event;
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      
      // Process successful payment
      await ctx.runMutation(internal.stripe.processSuccessfulPayment, {
        sessionId: session.id,
        walletAddress: session.metadata.walletAddress,
        amount: parseFloat(session.metadata.tokenAmount),
      });
      
      break;
    }
    
    case "checkout.session.expired": {
      // Handle expired session
      const session = event.data.object;
      console.log('Checkout session expired:', session.id);
      break;
    }
    
    case "payment_intent.payment_failed": {
      // Handle failed payment
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(null, { status: 200 });
});

export default router;
```

### 4. Payment Processing

Sarah implements the payment fulfillment:

```typescript
// convex/stripe/mutations.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const processSuccessfulPayment = mutation({
  args: {
    sessionId: v.string(),
    walletAddress: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Record top-up in database
    const topupId = await ctx.db.insert("topups", {
      walletAddress: args.walletAddress,
      amount: args.amount,
      stripeSessionId: args.sessionId,
      status: "processing",
      createdAt: Date.now(),
    });

    // 2. Trigger blockchain transfer (via action)
    const { signature } = await ctx.runAction(internal.blockchain.transferFromTreasury, {
      toWallet: args.walletAddress,
      amount: args.amount,
    });

    // 3. Update top-up status
    await ctx.db.patch(topupId, {
      status: "completed",
      signature,
      completedAt: Date.now(),
    });

    // 4. Update balance
    const balance = await ctx.db
      .query("balances")
      .withIndex("by_wallet", q => q.eq("walletAddress", args.walletAddress))
      .unique();

    if (balance) {
      await ctx.db.patch(balance._id, {
        amount: balance.amount + args.amount,
        lastUpdated: Date.now(),
      });
    }

    return { success: true, topupId };
  },
});
```

### 5. Success and Cancel Pages

Sarah creates proper redirect pages:

```typescript
// app/topup/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function TopUpSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    // Verify payment with backend
    const result = await fetch('/api/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    
    if (result.ok) {
      setVerified(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {verified ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-text-secondary mb-6">
              Your tokens have been added to your wallet
            </p>
            <a
              href="/dashboard"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg"
            >
              Back to Wallet
            </a>
          </>
        ) : (
          <div className="animate-pulse">Verifying payment...</div>
        )}
      </div>
    </div>
  );
}
```

### 6. Payment History

Sarah creates payment tracking:

```typescript
// convex/topups/queries.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTopupHistory = query({
  args: {
    walletAddress: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const topups = await ctx.db
      .query("topups")
      .withIndex("by_wallet", q => q.eq("walletAddress", args.walletAddress))
      .order("desc")
      .take(args.limit ?? 20);

    return topups;
  },
});
```

---

## Common Tasks Sarah Handles

| Task | Command | Description |
|------|---------|-------------|
| Create checkout | `Generate Stripe session` | Start payment flow |
| Handle webhook | `Process Stripe events` | Payment fulfillment |
| Verify payment | `Confirm payment status` | Post-payment check |
| Process refund | `Issue Stripe refund` | Handle refunds |
| Get history | `Query payment records` | User payment history |
| Update metadata | `Add session metadata` | Track custom data |

---

## Stripe Configuration

```bash
# Environment Variables
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Convex Secrets (set via CLI)
npx convex env set STRIPE_SECRET_KEY sk_test_...
npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
```

Get keys from: https://dashboard.stripe.com/apikeys

---

## Payment Flow Diagram

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   User   │───▶│   PWA    │───▶│  Stripe  │───▶│  Convex  │───▶│  Solana  │
│          │    │          │    │ Checkout │    │ Webhook  │    │          │
│ Click    │    │ Redirect │    │          │    │ Process  │    │ Transfer  │
│ "Top Up" │    │ to Stripe│    │ Card Pay │    │ Payment   │    │ Tokens   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                   │
                    ┌──────────────────────────────┘
                    ▼
              ┌──────────────┐
              │ Real-time    │
              │ Balance      │
              │ Update       │
              └──────────────┘
```

---

## Best Practices Sarah Follows

### DO ✅

- Always verify webhook signatures
- Use metadata to track custom data
- Handle all Stripe event types
- Provide success/cancel redirect URLs
- Store Stripe session ID in database
- Update balance only after blockchain confirmation
- Test with Stripe test cards
- Log all webhook events for debugging

### DON'T ❌

- Don't skip signature verification
- Don't trust client-side amount calculations
- Don't store full card details (PCI compliance)
- Don't forget to handle failures
- Don't hardcode API keys (use env vars)
- Don't ignore webhook errors
- Don't process duplicate webhooks (idempotency)
- Don't assume payment succeeded without verification

---

## Stripe Test Cards

For testing in development:

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

**Test Scenarios:**

| Scenario | Card Number | Result |
|----------|-------------|--------|
| Success | 4242... | Payment succeeds |
| Decline | 4000... | Card declined |
| Insufficient funds | 4000...00006 | Insufficient funds |
| Expired | 4000...0005 | Expired card |

---

## Error Handling

```typescript
// Error handling patterns
try {
  const session = await stripe.checkout.sessions.create({...});
} catch (error) {
  if (error.type === 'StripeCardError') {
    // Card declined
    throw new Error(`Card error: ${error.message}`);
  } else if (error.type === 'StripeInvalidRequestError') {
    // Invalid parameters
    throw new Error(`Invalid request: ${error.message}`);
  } else {
    // Other error
    throw new Error(`Payment error: ${error.message}`);
  }
}
```

---

## Security Considerations

1. **Webhook Verification**: Always verify signature
2. **No Card Data**: Never store full card numbers
3. **HTTPS Only**: Always use HTTPS in production
4. **Environment Variables**: Never commit keys to git
5. **Idempotency**: Handle duplicate webhook events
6. **PCI Compliance**: Use Stripe Checkout (you're SAQ A compliant)

---

## Troubleshooting

**Webhook not received:**
- Check Stripe dashboard for webhook logs
- Verify webhook URL is correct
- Check server logs for errors

**Payment not fulfilling:**
- Verify webhook signature is correct
- Check Convex function logs
- Ensure metadata is properly set

**Checkout not loading:**
- Check publishable key is correct
- Verify Stripe account is enabled
- Check browser console for errors

**Redirect not working:**
- Verify success_url and cancel_url are valid
- Check for HTTPS requirement (production)
- Ensure URLs are properly encoded

---

## Related Files

| File | Purpose |
|------|---------|
| `convex/stripe/actions.ts` | Checkout creation |
| `convex/stripe/mutations.ts` | Payment processing |
| `convex/http.ts` | Webhook handler |
| `app/topup/page.tsx` | Top-up UI |
| `app/topup/success/page.tsx` | Success page |

---

## Quick Start with Sarah

```
User: "Sarah, I need to add a $25 top-up option"

Sarah: I'll add the new tier:

1. Update TOPUP_OPTIONS array with { usd: 25, tokens: 250 }
2. Create Stripe checkout session with new amount
3. Add conversion logic (1 USD = 10 EVT)
4. Test with Stripe test card
5. Verify tokens are received

Adding $25 option now...
```

---

**Sarah's Motto:** "Payments should be seamless. Secure by default, smooth by design."
