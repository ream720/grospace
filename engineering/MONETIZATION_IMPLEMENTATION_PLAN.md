# Grospace Monetization Implementation Plan

Date: March 1, 2026
Status: Draft v1
Primary model: Freemium + Subscription (Stripe)

## 1) Goals

- Launch monetization without ads using a **Free + Pro subscription** model.
- Implement Stripe billing with secure entitlement enforcement.
- Roll out legally required policy pages before live billing.
- Minimize disruption to current product adoption and retention.

## 2) Scope (MVP Monetization)

In scope for MVP:

- Free and Pro plans with usage-based limits.
- Stripe Checkout + Billing Portal integration.
- Entitlements + usage tracking in Firebase.
- Upgrade/paywall UX in app.
- Policy pages and site-wide links:
  - Terms of Service
  - Privacy Policy
  - Subscription Terms
  - Refund Policy

Out of scope for MVP:

- Team/collaboration billing tier (future Studio plan).
- Affiliate marketplace rollout.
- Complex seat-based billing.

## 3) Dependencies and Constraints

- You are currently working on EIN/business setup for Stripe live activation.
- Build should proceed in **Stripe test mode** now, then switch to live mode after Stripe account readiness.
- Legal policies should be drafted/reviewed before enabling live checkout.

## 4) Recommended Plans and Limits (MVP)

### Free (Hobby)

- 1 grow space
- 10 active plants
- 100 notes total
- 10 photo uploads/month

### Pro

- Suggested pricing: `$9/month` or `$79/year`
- 5 grow spaces
- 100 active plants
- Unlimited notes
- 200 photo uploads/month
- Access to advanced insights/export (when shipped)

## 5) Architecture Decisions

### 5.1 Billing source of truth

- Stripe is the billing source of truth for plan/payment state.
- Firebase stores synchronized subscription snapshot + entitlements for runtime checks.

### 5.2 Data model additions (Firestore)

`users/{uid}`

- `plan: 'free' | 'pro'`
- `planStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'`
- `billingCycle: 'monthly' | 'yearly' | null`
- `stripeCustomerId: string | null`
- `currentPeriodEnd: Timestamp | null`
- `trialEndsAt: Timestamp | null`

`entitlements/{uid}`

- `maxSpaces: number`
- `maxActivePlants: number`
- `maxNotes: number`
- `maxPhotoUploadsPerMonth: number`
- `features: { advancedInsights: boolean, export: boolean }`

`usage/{uid}`

- `spacesCount: number`
- `activePlantsCount: number`
- `notesCount: number`
- `photoUploadsThisMonth: number`
- `lastResetMonth: string` (e.g. `2026-03`)

### 5.3 Backend components

- Cloud Functions (or equivalent server runtime):
  - `createCheckoutSession`
  - `createBillingPortalSession`
  - `stripeWebhook`
- Webhook events to handle:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
  - `invoice.paid`

### 5.4 Frontend components

- New billing route (ex: `/billing`) and Settings integration.
- Usage/plan UI in existing `Account Status` panel in [`app/routes/settings.tsx`](../app/routes/settings.tsx).
- Upgrade CTA and limit messaging across create flows:
  - Spaces
  - Plants
  - Notes/photo upload

### 5.5 Enforcement strategy

- Phase A: soft limits in UI with clear upgrade prompts.
- Phase B: hard write enforcement in Firestore/Storage rules and backend checks.

## 6) Implementation Workstreams

## 6.1 Workstream A: Billing + Stripe

Tasks:

1. Create Stripe products/prices (monthly + yearly Pro) in test mode.
2. Add env vars for Stripe keys + price IDs.
3. Implement secure checkout session endpoint.
4. Implement billing portal endpoint.
5. Implement webhook signature verification + idempotent processing.
6. Sync Stripe subscription state to Firestore user/entitlement docs.

Acceptance criteria:

- User can start Pro checkout and return with active plan state.
- User can manage/cancel via billing portal.
- Subscription status changes propagate to app within minutes.

## 6.2 Workstream B: Entitlements + Usage Metering

Tasks:

1. Create entitlement resolver by plan.
2. Add usage counters and monthly reset job/logic.
3. Add guards for create actions (space, plant, note, photo).
4. Add near-limit warnings at 80/90/100% usage.

Acceptance criteria:

- Limits are consistent across UI and backend.
- Over-limit operations are blocked with deterministic error messages.

## 6.3 Workstream C: Product UX + Paywalls

Tasks:

1. Replace beta-only account status with plan card + upgrade button.
2. Add paywall modal/sheet for blocked actions.
3. Add billing nav entry and upgrade funnel from Dashboard/Settings.
4. Add trial/period-end/billing-failure notices.

Acceptance criteria:

- User always knows current plan and remaining quota.
- Upgrade path is reachable in <=2 clicks from major surfaces.

## 6.4 Workstream D: Legal/Compliance (Required Before Live)

Tasks:

1. Draft Terms of Service.
2. Draft Privacy Policy.
3. Draft Subscription Terms (billing cadence, renewal, cancellation).
4. Draft Refund Policy.
5. Publish pages and add footer links site-wide.
6. Add links in checkout-relevant surfaces and account/billing pages.
7. Add explicit acknowledgment UX where needed.

Suggested routes:

- `/terms`
- `/privacy`
- `/subscription-terms`
- `/refund-policy`

Acceptance criteria:

- All four policy pages are publicly accessible.
- Links exist in footer and checkout-adjacent views.
- Policies are versioned with effective date.

Note: This is product/engineering planning, not legal advice. Final policy language should be reviewed by counsel.

## 6.5 Workstream E: Analytics + Experimentation

Events to track:

- `upgrade_cta_clicked`
- `checkout_started`
- `checkout_completed`
- `billing_portal_opened`
- `paywall_shown`
- `paywall_converted`
- `subscription_canceled`
- `payment_failed`

KPIs:

- Free -> paid conversion
- Trial -> paid conversion
- Monthly churn
- ARPU / MRR
- PQL rate (users at >=80% quota)

Acceptance criteria:

- Dashboard/report can answer funnel conversion and churn questions weekly.

## 7) Phased Timeline

### Phase 0 (Week 1): Planning + Schema + Legal Draft Start

- Finalize free/pro limits.
- Add Firestore schema docs and migration approach.
- Start policy drafts (ToS, Privacy, Subscription, Refund).

### Phase 1 (Weeks 2-3): Stripe Test Integration

- Implement checkout, portal, webhooks in test mode.
- Build subscription sync and entitlement generation.
- Add billing status to settings.

### Phase 2 (Weeks 4-5): Usage Enforcement + UX

- Implement usage counters and quota checks.
- Add paywalls and upgrade CTAs.
- Add basic analytics events.

### Phase 3 (Week 6): Policy Publishing + Live Readiness

- Publish legal pages and footer links.
- Stripe live-mode checklist once EIN/account setup is complete.
- Run end-to-end live-readiness QA.

### Phase 4 (Weeks 7-8): Controlled Launch + Optimization

- Roll out to a subset of users first.
- Tune copy, limits, and annual-vs-monthly pricing presentation.
- Monitor failures/churn and iterate.

## 8) Stripe Live-Mode Readiness Checklist

- Stripe account activated for live charges.
- Business verification complete (including EIN-related steps).
- Live API keys and webhook secrets configured.
- Production webhook endpoint validated.
- Tax settings configured as needed.
- Refund workflow operationalized in support process.
- Test purchases + cancellation + reactivation verified in production-safe flow.

## 9) Engineering Backlog (Prioritized)

P0:

1. Stripe checkout endpoint + webhook processing.
2. Subscription sync to `users/{uid}` + `entitlements/{uid}`.
3. Usage tracking for spaces/plants/notes/photos.
4. Plan/usage UI in Settings.
5. Legal pages + footer links.

P1:

1. Hard enforcement in Firestore/Storage rules.
2. Billing page and self-serve management improvements.
3. Paywall UX polish + richer analytics.

P2:

1. Trial/coupon experiments.
2. Annual plan optimization tests.
3. Advanced lifecycle messaging (dunning, win-back).

## 10) Definition of Done (MVP Monetization)

- User can subscribe to Pro via Stripe Checkout (test + live).
- Subscription state reliably updates entitlements in app.
- Free limits are enforced for key resources.
- Upgrade/paywall UX is visible and understandable.
- Terms, Privacy, Subscription Terms, and Refund Policy are published and linked.
- Core billing funnel analytics are live.

## 11) Immediate Next Actions

1. Confirm final Free/Pro limits and pricing.
2. Decide Stripe implementation surface (Firebase Functions recommended).
3. Create policy page stubs/routes now so legal can iterate in parallel.
4. Start Stripe test-mode integration while EIN/business setup finalizes.
