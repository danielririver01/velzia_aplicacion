# Arquitectura del Sistema - Velzia Mobile

---

## 1. Arquitectura General

### Vista de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUARIOS                                    │
│                                                                     │
│   ┌──────────────┐                          ┌──────────────┐        │
│   │   Web App    │                          │   Mobile App │        │
│   │   (Browser)  │                          │   (Android)  │        │
│   └──────┬───────┘                          └──────┬───────┘        │
│          │ HTML/Session                            │ REST/JWT        │
└──────────┼─────────────────────────────────────────┼────────────────┘
           │                                         │
           ▼                                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        FLASK BACKEND (Orderfox)                      │
│                                                                      │
│  ┌────────────────────┐              ┌────────────────────────────┐  │
│  │   Web Routes       │              │   New API Routes           │  │
│  │   (Blueprints)     │              │   (New Blueprints)         │  │
│  │                    │              │                            │  │
│  │  auth.py           │              │  api_auth.py               │  │
│  │  dashboard.py      │              │  api_dashboard.py          │  │
│  │  categories.py     │              │  api_categories.py         │  │
│  │  products.py       │              │  api_products.py           │  │
│  │  orders.py         │              │  api_orders.py             │  │
│  │  public.py         │              │  api_public.py             │  │
│  │  menu.py           │              │  api_tables.py             │  │
│  │  tables.py         │              │                            │  │
│  │  tokens.py         │              │  tokens.py (existing)      │  │
│  └────────┬───────────┘              └────────────┬───────────────┘  │
│           │                                       │                  │
│           └───────────────┬───────────────────────┘                  │
│                           │                                          │
│  ┌────────────────────────▼────────────────────────────────────┐    │
│  │                    SHARED LAYER                             │    │
│  │                                                             │    │
│  │  Models (models.py) - SQLAlchemy ORM                        │    │
│  │  Utils (utils/) - Auth, Subscription, Image, Rate Limiter   │    │
│  │  Extensions (extensions.py) - Mail, Scheduler, CSRF, Limiter│    │
│  └────────────────────────┬────────────────────────────────────┘    │
│                           │                                          │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│                                                                      │
│   ┌──────────────────┐    ┌──────────────────┐                      │
│   │     MySQL        │    │   Cloudinary     │                      │
│   │   (Database)     │    │   (Images)       │                      │
│   └──────────────────┘    └──────────────────┘                      │
│                                                                      │
│   ┌──────────────────┐    ┌──────────────────┐                      │
│   │  Mercado Pago    │    │     Clerk        │                      │
│   │  (Payments)      │    │   (SSO/Auth)     │                      │
│   └──────────────────┘    └──────────────────┘                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Flujo de Autenticación

### 2.1 Web (existente - no se modifica)

```
Browser ──POST /login──► Flask ──verify password──► Set session['user_id']
                         │
                         └──► redirect('/dashboard')
```

### 2.2 Mobile (nuevo)

```
Mobile App ──POST /api/auth/login──► Flask ──verify password──► Generate JWT
                     │
                     └──► Return { access_token, refresh_token }

Mobile App ──Store JWT in expo-secure-store──► Use for all subsequent requests

Mobile App ──GET /api/orders──► Flask ──Verify JWT header──► Return JSON
  Header: Authorization: Bearer <jwt_token>
```

### 2.3 JWT Token Structure

```json
{
  "sub": 1,
  "user_id": 1,
  "restaurant_id": 1,
  "email": "admin@restaurante.com",
  "iat": 1715112000,
  "exp": 1715198400
}
```

- `sub`: Subject (user ID)
- `exp`: Expiration (24h default)
- `refresh_token`: 7 days expiration

---

## 3. Flujo de Datos - Órdenes

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│  Cliente    │                    │   Mobile App │                    │   Backend   │
│  (Browser)  │                    │  (Restaurante)│                    │   (Flask)   │
└──────┬──────┘                    └──────┬───────┘                    └──────┬──────┘
       │                                  │                                  │
       │ POST /menu/api/order             │                                  │
       │ (crear orden)                    │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │                                  │  GET /api/orders (polling)       │
       │                                  │<─────────────────────────────────│
       │                                  │                                  │
       │                                  │  { orders: [..., new_order] }    │
       │                                  │◄─────────────────────────────────│
       │                                  │                                  │
       │                                  │  PATCH /api/orders/45/status     │
       │                                  │  { status: "confirmed" }         │
       │                                  │─────────────────────────────────>│
       │                                  │                                  │
       │                                  │  { success: true }               │
       │                                  │◄─────────────────────────────────│
       │                                  │                                  │
       │  (Cliente ve actualización)      │                                  │
       │◄─────────────────────────────────│                                  │
       │                                  │                                  │
```

---

## 4. Flujo de Datos - Productos

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│  Mobile App │                    │   Backend    │                    │ Cloudinary  │
│ (Restaurante)│                    │   (Flask)    │                    │  (Images)   │
└──────┬──────┘                    └──────┬───────┘                    └──────┬──────┘
       │                                  │                                  │
       │ POST /api/products               │                                  │
       │ multipart/form-data              │                                  │
       │ { name, price, category_id,      │                                  │
       │   image: <file> }                │                                  │
       │─────────────────────────────────>│                                  │
       │                                  │                                  │
       │                                  │  Check plan limits               │
       │                                  │  Upload image to Cloudinary      │
       │                                  │─────────────────────────────────>│
       │                                  │                                  │
       │                                  │  Return image URL                │
       │                                  │◄─────────────────────────────────│
       │                                  │                                  │
       │                                  │  Save product to MySQL           │
       │                                  │                                  │
       │  { success: true, data: {...} }  │                                  │
       │◄─────────────────────────────────│                                  │
       │                                  │                                  │
```

---

## 5. Arquitectura Mobile (React Native)

```
┌──────────────────────────────────────────────────────────────────────┐
│                        VELZIA MOBILE APP                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     PRESENTATION LAYER                         │  │
│  │                                                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │  │
│  │  │  Auth    │ │Dashboard │ │  Orders  │ │ Products │  ...    │  │
│  │  │ Screens  │ │  Screen  │ │ Screens  │ │ Screens  │         │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │  │
│  │                                                                │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │                  UI Components                           │  │  │
│  │  │  Button, Card, Input, Modal, List, Header, Loading...    │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     BUSINESS LOGIC LAYER                       │  │
│  │                                                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │  Zustand     │  │  React Hook  │  │   Custom     │        │  │
│  │  │  Stores      │  │  Forms + Zod │  │   Hooks      │        │  │
│  │  │              │  │              │  │              │        │  │
│  │  │ authStore    │  │ loginForm    │  │ useAuth      │        │  │
│  │  │ orderStore   │  │ productForm  │  │ useOrders    │        │  │
│  │  │ productStore │  │ categoryForm │  │ useProducts  │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                     DATA LAYER                                 │  │
│  │                                                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │
│  │  │   API Client │  │   API        │  │   Storage    │        │  │
│  │  │   (Axios)    │  │   Services   │  │   (Secure)   │        │  │
│  │  │              │  │              │  │              │        │  │
│  │  │ Interceptors │  │ auth.ts      │  │ JWT tokens   │        │  │
│  │  │ Error handle │  │ orders.ts    │  │ User prefs   │        │  │
│  │  │ Base URL     │  │ products.ts  │  │              │        │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 6. Seguridad

### 6.1 Autenticación Paralela

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION                           │
│                                                             │
│  Web (existing)              Mobile (new)                   │
│  ┌─────────────────┐         ┌─────────────────────────┐   │
│  │ Flask Session   │         │ JWT Bearer Token        │   │
│  │                 │         │                         │   │
│  │ session['user'] │         │ Authorization header    │   │
│  │ Cookie-based    │         │ Stateless               │   │
│  │ CSRF protected  │         │ CSRF exempt             │   │
│  └─────────────────┘         └─────────────────────────┘   │
│                                                             │
│  Both use:                                                  │
│  - Same User model                                          │
│  - Same password hashing (werkzeug)                         │
│  - Same @login_required logic (different decorators)        │
│  - Same @active_required logic                              │
│  - Same @feature_required logic                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Rate Limiting

```
┌─────────────────────────────────────────────────────────────┐
│                    RATE LIMITING                            │
│                                                             │
│  Web: 200/day, 50/hour (per IP)                            │
│  Authenticated users: EXEMPT (already implemented)          │
│                                                             │
│  Mobile API: Same limits apply                              │
│  - JWT identifies user → exempt from rate limiting          │
│  - Unauthenticated endpoints (public menu): IP-based        │
│  - Order creation: Custom OrderRateLimiter (anti-bot)       │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 CSRF

```
┌─────────────────────────────────────────────────────────────┐
│                    CSRF PROTECTION                          │
│                                                             │
│  Web routes (/*):     CSRF ACTIVE (Flask-WTF tokens)        │
│  API routes (/api/*): CSRF EXEMPT (JWT replaces CSRF)       │
│                                                             │
│  Implementation:                                            │
│  - app/__init__.py: CORS already configured for /api/*      │
│  - New blueprints: @csrf.exempt decorator                   │
│  - Existing web CSRF: untouched                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Subscription & Plan Enforcement

```
┌─────────────────────────────────────────────────────────────┐
│                  PLAN ENFORCEMENT                           │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Request    │───>│  Check Plan  │───>│  Allow/Deny   │  │
│  │  arrives    │    │  Limits      │    │               │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│                          │                                 │
│                     ┌────▼─────┐                            │
│                     │ Plan     │                            │
│                     │ Type     │                            │
│                     └────┬─────┘                            │
│                          │                                  │
│              ┌───────────┼───────────┐                     │
│              ▼           ▼           ▼                     │
│         Emprendedor  Crecimiento   Elite                   │
│         25 products  100 products  Unlimited               │
│         No modifiers No modifiers  Modifiers               │
│         No table QR  Table QR     All features            │
│                                                             │
│  Grace Period: 10 days after expiration (read-only)        │
│  CRUD blocked when subscription expired                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     PRODUCTION                               │
│                                                              │
│  ┌────────────────────┐                                      │
│  │   Google Play      │                                      │
│  │   Store            │                                      │
│  │   (APK/AAB)        │                                      │
│  └─────────┬──────────┘                                      │
│            │                                                 │
│            │ HTTPS                                           │
│            ▼                                                 │
│  ┌────────────────────┐    ┌──────────────────────────────┐  │
│  │   Reverse Proxy    │    │   Flask App (Gunicorn)       │  │
│  │   (Nginx)          │───>│   - Web routes (HTML)        │  │
│  │                    │    │   - API routes (JSON)        │  │
│  └─────────┬──────────┘    └──────────────┬───────────────┘  │
│            │                              │                  │
│            ▼                              ▼                  │
│  ┌────────────────────┐    ┌──────────────────────────────┐  │
│  │   MySQL Database   │    │   External Services          │  │
│  │   (orderfox)       │    │   - Cloudinary (images)      │  │
│  │                    │    │   - Mercado Pago (payments)  │  │
│  └────────────────────┘    │   - Clerk (SSO)              │  │
│                            │   - Gmail (emails)           │  │
│                            └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Bug Conocido

### `app/routes/menu.py` - Missing `request` import

```python
# Line 65 references request.args but request is not imported
# Fix needed: Add `from flask import request` to imports
```

Este bug debe ser corregido antes de que las APIs públicas funcionen correctamente.
