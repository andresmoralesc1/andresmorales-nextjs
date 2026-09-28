## Qué significa realmente "automatización con IA" en una PyME de LATAM

La mayoría de los posts de LinkedIn sobre "automatización con IA" están escritos por gente que nunca ha enviado uno a un negocio real. Venden el sueño. Esta guía vende el trabajo.

Cuando entrego una automatización a una tienda, un hotel o un distribuidor, el objetivo es estrecho y medible: reemplazar 5-20 horas a la semana de copy-paste, resumen y ruteo humano con software que hace lo mismo sin olvidar, sin almorzar, y sin facturar por hora.

He enviado 12 automatizaciones de producción en 2025-2026. No son mágicas. Son cuidadosas. Están probadas. Tienen alertas de error. Tienen checkpoints humanos. Y se pagan solas en 3-6 meses en un build de $20-80k.

Esta guía es para el fundador u operador de una pequeña o mediana empresa de LATAM que ya está corriendo, ya tiene equipo, y está preguntando "¿por dónde empiezo?".

## Las 5 categorías que rinden más rápido

Cuando audito un negocio, casi toda ganancia cae en uno de estos cinco baldes. Usá esta lista como tu propio framework de scoring.

### 1. Captura y ruteo de leads

Todo negocio de LATAM que audito tiene un balde con fuga al inicio del funnel. Un formulario de contacto que le llega por email a un humano. Una bandeja de WhatsApp Business que una persona mira de 9 a 5. Una landing page que va a Mailchimp y se queda ahí. La solución es la misma en todos los casos: captura → enriquece con la intención del visitante (qué página, qué campaña, qué país) → rutea a la bandeja correcta o a la etapa correcta del CRM. 40-80 horas/año ahorradas en un equipo chico. La herramienta limpia para construir esto es n8n, Make, o un SaaS como Whautomate si no querés mantenerlo.

### 2. Secuencia de seguimiento de leads

Después de que el lead entra al CRM, la siguiente fuga es el seguimiento. Día 1, Día 3, Día 7, Día 14 — la mayoría de los negocios de LATAM mandan un solo seguimiento o ninguno. La IA puede redactar el mensaje por-lead en el idioma y contexto del lead (de qué página vino, qué preguntó), y un humano revisa antes de enviar. La suba de conversión en una secuencia de 14 días es real: 1.5-3x en los negocios que medí, porque el cuello de botella siempre fue el humano, no la oferta.

### 3. Triage de soporte al cliente

Esta es la categoría más subestimada. Cada tienda, cada hotel, cada distribuidor que audito tiene la misma forma: 50-150 mensajes de WhatsApp al día, 5-8 de ellos que vale la pena responder con cuidado, el resto son "¿tenés esto en rojo?" "¿está en stock?" "¿a qué hora cerrás?". Un LLM con un catálogo de productos estructurado + historial de pedidos + una plantilla de respuesta de una línea maneja el 80% bajo automáticamente. El humano lee el 20% superior. Ahorrá 20-40 horas/mes de un operador.

### 4. Sincronización de catálogo y precios

Si tenés 2-3 canales de venta (una tienda física, un Instagram shop, un listing en MercadoLibre, un Shopify para exportar), estás gastando 5-15 horas/semana manteniéndolos en sync. La IA más un feed estructurado de productos más un job programado puede hacerlo en menos de 30 minutos. La trampa es hacerlo sin pensar source-of-truth: elegí un sistema como autoritativo, push a los otros. Esto es el mismo trabajo que existe hace una década; la parte nueva es que el LLM puede mapear nombres de campos entre esquemas que no comparten vocabulario.

### 5. Resúmenes operativos internos

La categoría más sub-amada. La IA escribe tu business review de los lunes a la mañana desde tu Stripe, tu Shopify, tu sistema de reservas y tu Google Sheets. El dueño lo lee en 3 minutos y entra al día sabiendo qué está pasando realmente. Es el tipo de cosa que te paga en claridad, no en horas — y la claridad es la restricción en la que la mayoría de los fundadores de LATAM con los que trabajo realmente están cortos.

## Build vs buy: una calculadora de una página

La mayoría de los fundadores de LATAM con los que trabajo ya fueron contactados por vendors de SaaS. El pitch siempre es el mismo: "estamos integrados con WhatsApp / MercadoLibre / Shopify, cobramos $200/mes, manejamos todo." Antes de firmar, corré estos cuatro números.

- **Horas que esta automatización ahorrararía por semana** — sé honesto, contá solo los pasos que realmente dejarías de hacer.
- **Costo horario completamente cargado del humano que lo haría** — completamente cargado significa salario + beneficios + facilities + recruiting. En LATAM PyMEs esto es $8-22/hora.
- **Ahorro anual** — horas × costo horario × 50 semanas (vacaciones + sick days).
- **Costo de build** — conseguí un quote real. Si un vendor quiere $200/mes × 12 = $2400/año, ese es el precio de buy. Si construyes con un consultor, el número one-time es el costo de build.

Si el buy es más barato por dos años, comprá. Si el build se paga en menos de seis meses, construí. La trampa es no hacer ninguno y ver las horas escaparse.

## Eligiendo el primer workflow

No empieces con el que se ve más cool. Empezá con el que:

1. **Alto volumen** — hacés esto al menos 20 veces a la semana.
2. **Bajo juicio** — la respuesta es un template + un lookup, no una decisión humana.
3. **Tiene output medible** — podés contar cuántos hiciste este mes vs el mes pasado.

Un primer automation perfecto: un bot de WhatsApp que responde a "¿está en stock?" con un lookup de inventario en tiempo real + una respuesta de una línea. Quizás 30-60 segundos para construir. Ahorra una hora al día. Ese es el patrón que compone.

Un primer automation terrible: un "asistente inteligente que sabe todo sobre mi negocio" — ese es de seis meses y $15k. Saltealo hasta que tengas una operación real en su lugar.

## Cuánto cuesta en 2026

Rangos honestos para una PyME de LATAM. Estos están calibrados contra datos de mercado 2025-2026 para consultores senior independientes de IA en US y EU. Están 40-60% por debajo de lo que cobran firmas boutique en San Francisco, Londres o Berlín.

- **AI Kickstart**: $4,500 — $7,500 — un workflow, una integración, una a dos semanas.
- **Automation Build**: $12,000 — $25,000 — tres a seis workflows, integraciones custom, eval de producción, tres a seis semanas.
- **AI Platform**: $40,000 — $80,000 — sistema multi-agent con integraciones custom, SSO, eval, observability stack, dos a cuatro meses.

Después del launch hay un **retainer de optimización continua** a $3,500 — $8,000 por mes para monitoring, eval, iteración de prompts, updates de modelos, y rollout de nuevos workflows. Compromiso mínimo de 3 meses. Después, cancelás cuando quieras.

Lo más caro de todo en estos engagements es el handover, no el build. Planificá el retainer desde el día uno o vas a re-pagar un impuesto de knowledge-debt en el año dos.

## Tres trampas que veo cada mes

### Trampa 1: "Necesitamos un inbox unificado"

No. Necesitás una capa de triage. WhatsApp Business API + una sola llamada LLM que clasifica los mensajes entrantes y los rutea a la bandeja humana correcta. El inbox unificado es una feature de un SaaS de $200/mes que existe. La capa de triage es una tarde.

### Trampa 2: "Empecemos con un chatbot en el website"

Los chatbots de website convierten al 1-3% en sitios de PyMEs de LATAM — ese es el baseline de la industria. Funcionan, pero no son el primer movimiento de mayor ROI. El primer movimiento de mayor ROI es casi siempre la secuencia de seguimiento por WhatsApp o email sobre los leads que ya tenés, porque el inventario de leads tibios está sentado en el CRM y los estás perdiendo por el tiempo.

### Trampa 3: "La IA va a reemplazar esta parte de mi equipo"

No lo va a hacer. La IA reemplaza el 60% aburrido de un rol y libera al humano para el 40% que necesita juicio. Si staffás para el 60% aburrido, construiste un equipo que no aprende. Si staffás para el 40% y usás IA para el 60%, tenés un equipo que escala.

## Operando el sistema después del launch

El modo de falla más grande que veo es "enviamos la automatización y nos olvidamos." Tres meses después, la API cambió, el prompt driftó, y el bot viene mintiéndole a los clientes con confianza.

Cada automatización que envío tiene tres cosas:

1. **Un dashboard** — en algún lugar, una página donde podés ver qué hizo el sistema hoy.
2. **Un path de alertas** — Slack o email, para que un humano vea cuando el sistema no se está comportando.
3. **Una review mensual** — una reunión de 30 minutos donde mirás el dashboard, las alertas, y la próxima cosa a enviar.

Esto no es glamoroso. Es la diferencia entre un sistema que compone por años y uno que se pudre.

## Qué hacer esta semana

Si sos dueño de una PyME de LATAM leyendo esto, la respuesta no es "contratar un consultor" o "comprar un SaaS." La respuesta es:

1. Listá los tres workflows que más horas se comen en tu negocio.
2. Elegí el que es alto volumen, bajo juicio, y medible.
3. Escribí un brief de un párrafo: qué hace el sistema, con quién habla, qué devuelve.
4. Mandáselo a un consultor con un portfolio de trabajo similar (estás leyendo esto en el portfolio de uno de ellos).

Ese es todo el playbook. El resto de esta guía es sobre hacerlo sin las 3 trampas.
