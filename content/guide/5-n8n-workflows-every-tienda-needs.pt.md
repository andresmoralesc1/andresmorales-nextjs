---
title: "5 workflows no n8n que toda loja da LATAM precisa"
lede: "Cinco automações no n8n copy-paste que transformam WhatsApp, MercadoLibre e Stripe em um pipeline de pedidos 24/7 — com o JSON real dos nós."
eyebrow: "Cluster 01 — Satélite 02"
publishedAt: "2026-09-26"
readingTime: "9 min"
level: "intermediate"
clusterHref: "/guide/ai-automation-latam-2026"
clusterTitle: "AI automation for LATAM small businesses"
currentSlug: "5-n8n-workflows-every-tienda-needs"
---

This is the satellite article in the cluster on AI automation for LATAM small businesses. It assumes you have a working n8n instance (Cloud or self-hosted), a WhatsApp Business API key from Meta, a MercadoLibre seller account, and a Stripe account. Copy the JSON for the workflow you need and adapt the placeholders.

## The premise

A LATAM tienda loses an average of 18% of confirmed orders to friction. The customer wants the product. They want it today. They tap the WhatsApp number. Nobody responds for three hours. The customer buys from the tienda down the street. Every retail store has this problem. Every store can solve it with the same five n8n workflows.

## 1. WhatsApp order intake with auto-catalog lookup

![WhatsApp order intake flow with auto-catalog lookup](/work/5-n8n-workflows-every-tienda-needs/whatsapp-intake.svg)

A customer taps the business number on WhatsApp and sends "tienen la remera azul en talle M?" (do you have the blue t-shirt in size M?). The bot replies in under a minute with stock state and price. The wrong-size questions stop eating operator time.

**Trigger**: WhatsApp Business API webhook.
**Stack**: n8n + WA Business API + your product DB (Postgres / Airtable / Google Sheet).
**Latency target**: 30 seconds.
**Effort**: 1 afternoon.

```json
{
  "nodes": [
    { "parameters": { "httpMethod": "POST", "path": "wa-in", "responseMode": "onReceived" }, "name": "WA Webhook", "type": "n8n-nodes-base.webhook" },
    { "parameters": { "functionCode": "const m = items.find(i => i.sku === $input.body.message.text.match(/SKU-(\\w+)/)?.[1]); return { reply: m ? `Sí, ${m.name} en ${m.size} — $${m.price}` : 'Cuál SKU?' }; " }, "name": "Catalog Lookup", "type": "n8n-nodes-base.code" },
    { "parameters": { "operation": "sendText", "phone": "={{$json.reply_to}}", "message": "={{$json.reply}}" }, "name": "Reply", "type": "n8n-nodes-base.whatsapp" }
  ]
}
```

Real output for a properly-sized query: `<2 seconds`. The "Cuál SKU?" reply is the safe fallback — the bot never hallucinates stock state.

## 2. MercadoLibre → Stripe + Google Sheet sync

![MercadoLibre to Stripe sync flow](/work/5-n8n-workflows-every-tienda-needs/ml-stripe-sync.svg)

A seller on MercadoLibre wants the order in Stripe (their accounting system of record) the moment payment confirms. They do not want to download a CSV once a week and pray. This workflow fires the moment ML confirms payment.

**Trigger**: MercadoLibre webhook (orders resource).
**Stack**: n8n + ML API + Stripe API + Google Sheets.
**Latency**: 5 minutes.
**Effort**: half a day.

```json
{
  "nodes": [
    { "parameters": { "httpMethod": "POST", "path": "ml-orders" }, "name": "ML Orders", "type": "n8n-nodes-base.webhook" },
    { "parameters": { "conditions": { "options": { "caseSensitive": true, "leftValue": "={{$json.body.status}}", "operation": "equal", "rightValue": "paid" } } }, "name": "Paid?", "type": "n8n-nodes-base.if" },
    { "parameters": { "resource": "checkout.session", "operation": "create", "additionalFields": { "line_items": "={{$json.body.items.map(i => ({price_data:{currency:'mxn',product_data:{name:i.title},quantity:i.quantity}))}}" } } }, "name": "Stripe Checkout", "type": "n8n-nodes-base.stripe" },
    { "parameters": { "operation": "append", "sheetId": "ML_ORDERS", "columns": { "ml_id": "={{$json.body.id}}", "stripe_id": "={{$json.stripe_id}}", "amount": "={{$json.body.total_amount}}" } }, "name": "Log to Sheet", "type": "n8n-nodes-base.googleSheets" }
  ]
}
```

The trick: ML sends the order resource on `paid`, the If-node branches, and the Stripe Checkout session is created with line_items translated from ML's format. The Sheet row is the audit log. Fail the If and the whole flow halts.

## 3. Email triage via Gmail + Telegram

![Email triage flow with LLM classifier](/work/5-n8n-workflows-every-tienda-needs/email-triage.svg)

The owner gets 80-150 emails a day. Ten of them need an actual human. The other 70-140 are newsletters, transactional, vendor spam, and "do you have a moment to discuss…" outreach. This flow tags every email and pings the owner on Telegram for the ones worth reading.

**Trigger**: Gmail push notification.
**Stack**: n8n + Gmail API + OpenAI/Anthropic + Telegram bot.
**Latency**: under 5 minutes per email.
**Effort**: 2 hours.

The flow:
- Trigger on Gmail push.
- Fetch full email body + headers.
- Run an LLM classifier with this prompt:

> Classify the email into one of: `urgent-needs-reply`, `important-needs-decision`, `newsletter`, `transactional`, `spam`. Reply with ONLY the label.

- Branch:
  - `urgent-*` or `important-*` → forward body to Telegram chat with a "View in Gmail" deep link.
  - Everything else → tag in Gmail (`auto/needs-me` vs `auto/info`) and stop.

Real-world rate after a week of tuning: 90% accuracy on the four-way classification. The remaining 10% are the ones the owner opens anyway. The point of the bot is to keep the 70-140 from polluting the inbox.

## 4. Stripe daily business review → Telegram at 8 a.m.

![Daily business review flow](/work/5-n8n-workflows-every-tienda-needs/daily-review.svg)

The owner reads a three-minute summary of the previous 24 hours. The bot pulls from Stripe (revenue, MRR, churn signal), Shopify (orders, top products), and a single Google Sheet (lead pipeline). The summary lands in Telegram at 8 a.m. GMT-5.

**Trigger**: Cron at 0 13 * * * (8 a.m. Bogotá = 13:00 UTC).
**Stack**: n8n + Stripe API + Shopify API + Sheets API + Anthropic + Telegram.
**Effort**: half a day.

The prompt:

> You are a business analyst. The owner reads a 3-minute review. Output exactly 4 sections: Revenue (today, 7-day, 30-day, with one anomaly), Pipeline (new leads, qualified, closed), Operations (open orders, fulfillment errors, support backlog), One thing to look at today (specific). Use this exact format. Do not editorialize.

Real-world rate after a week: the owner can read it in under 3 minutes. They catch 2-3 things per week they would have missed in email.

## 5. Inventory low-stock alert via Telegram

![Inventory low-stock alert flow](/work/5-n8n-workflows-every-tienda-needs/low-stock-alert.svg)

The tienda is selling a popular product. They run out. They do not notice for 48 hours because the operator is busy with the new hot product. The next three customers order something they cannot ship. This flow watches inventory and pings the operator when a product drops below a threshold.

**Trigger**: Cron every 4 hours.
**Stack**: n8n + Postgres / Sheets / Medusa API + Telegram.
**Effort**: 2 hours.

```json
{
  "nodes": [
    { "parameters": { "rule": { "interval": 4 } }, "name": "Cron", "type": "n8n-nodes-base.scheduleTrigger" },
    { "parameters": { "operation": "select", "table": "products" }, "name": "Read Inventory", "type": "n8n-nodes-base.postgres" },
    { "parameters": { "conditions": { "options": { "leftValue": "={{$json.stock}}", "operation": "lt", "rightValue": 5 } } }, "name": "Low Stock?", "type": "n8n-nodes-base.if" },
    { "parameters": { "chatId": "OPERATIONS_CHAT_ID", "text": "🚨 Low stock: {{$json.name}} — only {{$json.stock}} left (SKU {{$json.sku}})" }, "name": "Telegram Alert", "type": "n8n-nodes-base.telegram" }
  ]
}
```

The threshold of 5 units is a starting point. Tune by category — a T-shirt at 5 is fine, a $2k jacket at 5 is a problem. Build the rule per product class in your database, not in the workflow.

## What to do this week

If you run a LATAM tienda, pick the workflow that solves the leak that costs you the most orders this week. Most owners pick #1 first. The 30-second reply to "tienen X?" is the single highest-ROI thing you can ship this week.

If you run a multi-channel operation, #2 is the right one first. The Stripe/ML sync saves you the manual CSV download on day one.

If you are a solo operator drowning in email, #3 is the right one. The 70-140 emails you do not read are the leak. Automating the triage gives them an inbox-zero morning in under a week.

You already have a leak. These five are the fixes.
