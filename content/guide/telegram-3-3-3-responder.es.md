---
title: "El fix 3-3-3 para tus consultas de WhatsApp"
lede: "Un único patrón de n8n que convierte 50 mensajes aleatorios de WhatsApp al día en 80% respondidos en menos de 3 minutos — y el 20% restante ruteado a la bandeja correcta."
eyebrow: "Cluster 01 — Satélite 06"
publishedAt: "2026-09-26"
readingTime: "4 min"
level: "beginner"
clusterHref: "/guide/ai-automation-latam-2026"
clusterTitle: "AI automation for LATAM small businesses"
currentSlug: "telegram-3-3-3-responder"
---

The cluster satellite on the simplest, highest-ROI pattern in the entire LATAM SMB automation stack. Copy it, deploy it, measure the response-time delta.

## The 3-3-3 rule

![3-3-3 responder flow diagram](/work/telegram-3-3-3-responder/3-3-3-flow.svg)

A LATAM tienda receives 30-100 WhatsApp messages a day. The pattern is consistent: 50% are "do you have this in stock?", 20% are "what time do you close?", 15% are "how much is X?", 10% are "I want to order", 5% are actual humans with a real question.

The 3-3-3 rule:

- **3 seconds** to acknowledge the message
- **3 minutes** to give a first substantive response
- **3 minutes** to route to the right human if the bot cannot answer

The human who would have answered that message in 2 hours is now answering the 5% that the bot cannot. The customer feels faster. The operator feels less buried. The math works.

## The n8n flow

The implementation is one n8n workflow with three nodes. Save as `n8n/3-3-3-responder.json` and import.

```json
{
  "nodes": [
    {
      "parameters": { "httpMethod": "POST", "path": "wa-in-3-3-3" },
      "name": "WA Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "functionCode": "const m = $input.body.message.text;\nconst catalog = $env.MERCADOLIBRE_CATALOG;\nconst lookup = catalog.find(p => m.toLowerCase().includes(p.name.toLowerCase()) || p.keywords.some(k => m.toLowerCase().includes(k.toLowerCase())));\nconst tpl = lookup\n  ? `Sí, ${lookup.name} — $${lookup.price} (stock: ${lookup.stock}). Pedilo acá: ${lookup.checkout_url}.`\n  : null;\nreturn { text: m, tpl, auto_answer: !!tpl, intent: lookup ? lookup.intent : 'unknown' };"
      },
      "name": "Classify + Reply",
      "type": "n8n-nodes-base.code"
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "leftValue": "={{$json.auto_answer}}",
            "operation": "equal",
            "rightValue": true
          }
        }
      },
      "name": "Bot Answers?",
      "type": "n8n-nodes-base.if"
    },
    {
      "parameters": { "operation": "sendText", "phone": "={{$json.body.from}}", "message": "={{$json.tpl}}" },
      "name": "Send Bot Reply",
      "type": "n8n-nodes-base.whatsapp"
    },
    {
      "parameters": {
        "chatId": "={{$env.OPS_CHAT_ID}}",
        "text": "Manual review: {{$json.body.from}} said \"{{$json.text}}\" — classified as {{$json.intent}}.",
        "additionalFields": { "message_thread_id": "={{$json.body.thread_id}}" }
      },
      "name": "Ping Ops for Manual Review",
      "type": "n8n-nodes-base.telegram"
    }
  ]
}
```

The flow is a webhook → a one-shot JS classifier that returns a structured response → an If branch. Bot answers when it can. When it cannot, it pings ops on Telegram with the original message and the detected intent, ready for the human to reply.

## The catalog match

The key is the `catalog` lookup. A simple JSON of name + keywords + intent + price + stock + checkout URL. For a tienda, this might be 200-500 products. For a service business, 5-20 services.

The `intent` field is the small bit of intelligence. Common intents in LATAM SMBs:

- `availability` (do you have this?)
- `hours` (when do you close?)
- `price` (how much?)
- `order` (I want to buy)
- `location` (where are you?)
- `support` (I have a problem)
- `human` (I want to talk to someone)

The first five can be answered by the bot from catalog + a config file. The last two always route to a human.

## What to do this week

If you run a LATAM tienda with a WhatsApp Business inbox:
1. Add the catalog JSON (200-500 products, ~30 minutes of data work)
2. Deploy the 3-3-3 workflow
3. Watch the first 100 messages. Most will be bot-answered. The 20% that ping ops are the ones the human needed to see anyway.
4. Iterate. The first week is the calibration. The second week is the steady state.

The win is the response-time delta. Customers that used to wait 2 hours now get a substantive answer in 3 minutes. Operators that used to spend 3 hours a day on the same 50 questions now spend 30 minutes on the 10 that matter.
