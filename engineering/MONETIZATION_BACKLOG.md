# Monetization Backlog

Last updated: March 15, 2026

Source docs: [`MONETIZATION_STRATEGY_AUDIT.md`](./MONETIZATION_STRATEGY_AUDIT.md), [`MONETIZATION_IMPLEMENTATION_PLAN.md`](./MONETIZATION_IMPLEMENTATION_PLAN.md)

## P0 Monetization Foundation (Stripe Test Mode First)

- [ ] Finalize Free/Pro packaging (limits, pricing `$9/mo` + `$79/yr`, trial/intro offer).
- [ ] Stripe product setup in test mode (monthly/yearly products + environment price IDs).
- [ ] Secure `createCheckoutSession` endpoint.
- [ ] Secure `createBillingPortalSession` endpoint.
- [ ] `stripeWebhook` processing with signature verification + idempotency.
- [ ] Subscription state sync into `users/{uid}` (`plan`, `planStatus`, `billingCycle`, `currentPeriodEnd`, `trialEndsAt`).
- [ ] `entitlements/{uid}` schema for caps + paid feature flags.
- [ ] `usage/{uid}` schema + monthly reset logic (`lastResetMonth`).
- [ ] Limit guards in create flows (spaces/plants/notes/photo uploads) with upgrade prompts.
- [ ] Settings plan card + usage meter (replace beta-only account status).
- [ ] `/billing` route + upgrade/manage billing navigation.
- [ ] Required legal/policy pages (`/terms`, `/privacy`, `/subscription-terms`, `/refund-policy`).

## P1 Monetization Hardening

- [ ] Firestore/Storage/backend hard-enforcement for over-limit writes.
- [ ] Near-limit UX states (80/90/100% usage).
- [ ] Billing lifecycle UX states (`trialing`, `past_due`, `canceled`, `incomplete`).

## P2 Monetization Optimization

- [ ] Billing funnel analytics (`upgrade`, `paywall`, `checkout`, `portal`, `cancel`, `payment_failed`).
- [ ] Controlled rollout for billing enablement to subset cohorts.
- [ ] Stripe live-mode readiness checklist (post EIN/business verification).
- [ ] Evaluate secondary affiliate layer after subscription conversion stabilizes.

## References

- Backlog index: [`BACKLOG.md`](./BACKLOG.md)
- Strategy audit: [`MONETIZATION_STRATEGY_AUDIT.md`](./MONETIZATION_STRATEGY_AUDIT.md)
- Implementation plan: [`MONETIZATION_IMPLEMENTATION_PLAN.md`](./MONETIZATION_IMPLEMENTATION_PLAN.md)
