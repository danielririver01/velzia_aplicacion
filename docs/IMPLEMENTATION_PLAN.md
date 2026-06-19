# Plan de Implementación - Velzia Mobile

---

## Fase 1: Backend API Layer

### 1.1 Setup JWT Authentication (4 horas)

#### Archivos nuevos
- `app/utils/jwt_auth.py` - Decoradores JWT

#### Cambios existentes
- `requirements.txt` - Agregar `flask-jwt-extended`
- `settings.py` - Agregar configuración JWT
- `app/__init__.py` - Inicializar JWT, registrar nuevos blueprints, CSRF exempt para `/api/*`

#### Tareas
- [ ] Instalar `flask-jwt-extended`
- [ ] Configurar `JWT_SECRET_KEY` y `JWT_ACCESS_TOKEN_EXPIRES` en settings
- [ ] Crear `jwt_required_jwt` decorator (paralelo a `login_required`)
- [ ] Crear `active_required_jwt` decorator (paralelo a `active_required`)
- [ ] Configurar CSRF exempt para `/api/*` routes
- [ ] Registrar JWT extension en `create_app()`

---

### 1.2 Auth APIs (8 horas)

#### Archivo nuevo
- `app/routes/api_auth.py`

#### Endpoints
- [ ] `POST /api/auth/login` - Email + password → JWT token
- [ ] `POST /api/auth/register` - Email + plan → temp token + OTP
- [ ] `POST /api/auth/setup-account` - Completar registro con OTP
- [ ] `POST /api/auth/forgot-password` - Enviar email de recuperación
- [ ] `POST /api/auth/reset-password` - Resetear con token
- [ ] `POST /api/auth/logout` - Invalidar token (client-side)
- [ ] `GET /api/auth/plans` - Listar planes y features

#### Dependencias
- Reutilizar lógica de `app/routes/auth.py` (sin modificarla)
- Reutilizar `app/utils/subscription.py` para plan info
- Reutilizar `app/utils/image_handler.py` si aplica

---

### 1.3 Dashboard APIs (4 horas)

#### Archivo nuevo
- `app/routes/api_dashboard.py`

#### Endpoints
- [ ] `GET /api/dashboard/overview` - Stats del día + restaurant info
- [ ] `GET /api/dashboard/settings` - Profile + subscription info
- [ ] `GET /api/dashboard/subscription` - Plan details + usage
- [ ] `PUT /api/dashboard/profile` - Update restaurant + user profile
- [ ] `POST /api/dashboard/change-password` - Ya existe con JSON support

#### Notas
- `GET /dashboard/api/check-orders` ya existe → exponer como `/api/dashboard/check-orders`
- `GET /dashboard/api/stats` ya existe → exponer como `/api/dashboard/stats`
- `POST /dashboard/toggle-status` ya existe → exponer como `/api/dashboard/toggle-status`

---

### 1.4 Categories APIs (4 horas)

#### Archivo nuevo
- `app/routes/api_categories.py`

#### Endpoints
- [ ] `GET /api/categories` - List all categories with product counts
- [ ] `POST /api/categories` - Create category (multipart/form-data)
- [ ] `PUT /api/categories/<id>` - Update category (multipart/form-data)
- [ ] `DELETE /api/categories/<id>` - Delete (validate no products)

#### Notas
- Ya existen: toggle, reorder, status → reutilizar o exponer bajo `/api/`
- Reutilizar `save_image()` de `app/utils/image_handler.py`

---

### 1.5 Products APIs (8 horas)

#### Archivo nuevo
- `app/routes/api_products.py`

#### Endpoints
- [ ] `GET /api/products` - List products (paginated, filterable)
- [ ] `GET /api/products/<id>` - Product detail with modifiers
- [ ] `POST /api/products` - Create product (multipart, plan limit check)
- [ ] `PUT /api/products/<id>` - Update product (multipart)
- [ ] `DELETE /api/products/<id>` - Delete product
- [ ] `GET /api/products/<id>/modifiers` - List modifiers
- [ ] `POST /api/products/<id>/modifiers` - Create modifier (Elite check)
- [ ] `DELETE /api/products/modifiers/<id>` - Delete modifier

#### Notas
- Ya existen: toggle, status → reutilizar
- Plan limit check via `check_product_limit()` de `app/utils/subscription.py`
- `save_image()` para uploads

---

### 1.6 Orders APIs (6 horas)

#### Archivo nuevo
- `app/routes/api_orders.py`

#### Endpoints
- [ ] `GET /api/orders` - List today's orders (filterable by status)
- [ ] `GET /api/orders/<id>` - Order detail with items
- [ ] `POST /api/orders` - Create order from dashboard
- [ ] `PATCH /api/orders/<id>/status` - Ya existe → exponer bajo `/api/`
- [ ] `POST /api/orders/<id>/cancel` - Cancel order
- [ ] `GET /api/orders/<id>/receipt` - Receipt data
- [ ] `DELETE /api/orders/<id>` - Delete cancelled order

#### Notas
- Reutilizar lógica de `app/routes/orders.py`
- Order creation necesita validación de items y cálculo de total

---

### 1.7 Public Menu APIs (4 horas)

#### Archivo nuevo
- `app/routes/api_public.py`

#### Endpoints
- [ ] `GET /api/public/menu/<slug>` - Full menu (restaurant + categories + products)
- [ ] `GET /api/public/menu/<slug>/categoria/<id>` - Category products
- [ ] `GET /api/public/menu/<slug>/novedades` - New products (paginated)

#### Notas
- `POST /menu/api/order` ya existe → exponer como `/api/public/order`
- No requieren autenticación
- Rate limiting aplica

---

### 1.8 Tables APIs (2 horas)

#### Archivo nuevo
- `app/routes/api_tables.py`

#### Endpoints
- [ ] `GET /api/tables` - List tables
- [ ] `POST /api/tables` - Create table (Table QR plan check)
- [ ] `DELETE /api/tables/<id>` - Delete table

#### Notas
- Feature-gated por `@feature_required('table_qr')`

---

### 1.9 Bug Fixes + Testing (4 horas)

- [ ] Fix `app/routes/menu.py` missing `request` import
- [ ] Test all endpoints con Postman
- [ ] Verificar que web routes no se afectan
- [ ] Verificar CSRF exempt solo para `/api/*`
- [ ] Verificar rate limiting funciona correctamente

---

## Fase 2: Mobile App (React Native + Expo)

### 2.1 Setup Project (4 horas)

- [ ] Crear proyecto Expo con TypeScript: `npx create-expo-app velzia-mobile --template expo-template-blank-typescript`
- [ ] Instalar dependencias:
  - `expo-router`, `expo-secure-store`, `axios`
  - `zustand`, `react-hook-form`, `zod`
  - `react-native-paper` o `nativewind`
- [ ] Configurar estructura de carpetas
- [ ] Configurar variables de entorno (`.env`)
- [ ] Setup ESLint + Prettier

---

### 2.2 Auth Flow (8 horas)

- [ ] Login screen
- [ ] Register screen (email → OTP → setup)
- [ ] Forgot password screen
- [ ] JWT storage en `expo-secure-store`
- [ ] Axios interceptors (attach JWT, handle 401)
- [ ] Auth context/provider
- [ ] Protected route wrapper
- [ ] Logout functionality

---

### 2.3 Dashboard (6 horas)

- [ ] Dashboard screen con stats
- [ ] Toggle abrir/cerrar restaurante
- [ ] Polling para nuevas órdenes
- [ ] Navigation header con restaurant name
- [ ] Quick actions (nueva orden, ver productos)

---

### 2.4 Orders (12 horas)

- [ ] Orders list screen (filter by status)
- [ ] Order detail screen
- [ ] Change order status (swipe or buttons)
- [ ] Cancel order flow
- [ ] Receipt view
- [ ] Delete cancelled order
- [ ] Real-time updates (polling)
- [ ] Empty states

---

### 2.5 Products (12 horas)

- [ ] Products list screen (grouped by category)
- [ ] Product detail screen
- [ ] Create product form (with image upload)
- [ ] Edit product form
- [ ] Delete product confirmation
- [ ] Toggle product active/inactive
- [ ] Modifiers list
- [ ] Create/delete modifiers
- [ ] Plan limit warnings

---

### 2.6 Categories (6 horas)

- [ ] Categories list screen
- [ ] Create category form (with image upload)
- [ ] Edit category form
- [ ] Delete category (with validation)
- [ ] Toggle active/inactive
- [ ] Reorder (drag & drop o up/down buttons)

---

### 2.7 Settings (4 horas)

- [ ] Settings screen
- [ ] Profile edit (restaurant name, phone, username)
- [ ] Subscription info screen
- [ ] Change password
- [ ] Delete account (with confirmation)
- [ ] App version display

---

### 2.8 Polish (4 horas)

- [ ] Loading states (spinners, skeletons)
- [ ] Error handling (toast notifications)
- [ ] Pull-to-refresh
- [ ] Offline detection
- [ ] App icon + splash screen
- [ ] Navigation polish

---

## Fase 3: Testing + Deploy

### 3.1 API Testing (4 horas)

- [ ] Postman collection completa
- [ ] Test auth flow completo
- [ ] Test CRUD operations
- [ ] Test plan limits
- [ ] Test error responses
- [ ] Test rate limiting

### 3.2 Mobile Testing (4 horas)

- [ ] Test en emulador Android
- [ ] Test en dispositivo físico
- [ ] Test auth flow
- [ ] Test offline behavior
- [ ] Test image upload
- [ ] Test en diferentes tamaños de pantalla

### 3.3 Build + Deploy (4 horas)

- [ ] Configurar EAS Build
- [ ] Build APK para testing
- [ ] Deploy backend a producción
- [ ] Configurar HTTPS
- [ ] Verificar producción

### 3.4 Documentation (4 horas)

- [ ] API documentation final
- [ ] User guide para restaurantes
- [ ] Release notes
- [ ] README update

---

## Timeline Estimado

```
Semana 1: Fase 1 completa (Backend API Layer)
  Lunes-Martes: JWT setup + Auth APIs
  Miércoles: Dashboard + Categories APIs
  Jueves-Viernes: Products + Orders APIs

Semana 2: Fase 2 inicio (Mobile App)
  Lunes: Setup + Auth flow
  Martes-Miércoles: Dashboard + Orders
  Jueves-Viernes: Products + Categories

Semana 3: Fase 2 fin + Fase 3
  Lunes: Settings + Polish
  Martes-Miércoles: Testing
  Jueves: Build + Deploy
  Viernes: Documentation + Buffer
```

---

## Dependencias entre Tareas

```
JWT Setup ──► Auth APIs ──► Mobile Auth Flow
                │
                ▼
        Dashboard APIs ──► Mobile Dashboard
                │
                ▼
        Categories APIs ──► Mobile Categories
                │
                ▼
        Products APIs ──► Mobile Products
                │
                ▼
        Orders APIs ──► Mobile Orders
                │
                ▼
        Testing ──► Build ──► Deploy
```
