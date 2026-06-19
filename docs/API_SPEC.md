# Especificación de API - Velzia Mobile

**Versión:** 1.0  
**Base URL:** `https://tu-dominio.com/api` (producción) / `http://localhost:5000/api` (desarrollo)  
**Autenticación:** Bearer JWT Token  
**Content-Type:** `application/json`

---

## Autenticación

### Headers requeridos (endpoints protegidos)
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Respuestas de error estándar

| Código | Significado |
|--------|------------|
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o ausente |
| 403 | Forbidden - Plan insuficiente |
| 404 | Not Found - Recurso no existe |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

---

## 1. AUTH

### 1.1 Login
```
POST /api/auth/login
```

**Body:**
```json
{
  "email": "usuario@restaurante.com",
  "password": "MiPassword123"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "usuario@restaurante.com",
      "restaurant_id": 1
    },
    "restaurant": {
      "id": 1,
      "name": "Mi Restaurante",
      "slug": "mi-restaurante",
      "plan_type": "crecimiento",
      "is_open": true,
      "is_active": true
    }
  }
}
```

**Respuesta 401:**
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

---

### 1.2 Register (email inicial)
```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "nuevo@restaurante.com",
  "plan_type": "emprendedor"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "message": "Se ha enviado un código de verificación a tu email",
    "temp_token": "eyJ..."
  }
}
```

---

### 1.3 Setup Account (completar registro)
```
POST /api/auth/setup-account
```

**Headers:** `Authorization: Bearer <temp_token>`

**Body:**
```json
{
  "restaurant_name": "Mi Restaurante",
  "whatsapp_phone": "+573001234567",
  "username": "admin",
  "password": "MiPassword123",
  "otp_code": "123456"
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJ...",
    "user": { "id": 2, "username": "admin", "email": "nuevo@restaurante.com" },
    "restaurant": { "id": 2, "name": "Mi Restaurante", "slug": "mi-restaurante" }
  }
}
```

---

### 1.4 Forgot Password
```
POST /api/auth/forgot-password
```

**Body:**
```json
{
  "email": "usuario@restaurante.com"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Se ha enviado un enlace de recuperación a tu email"
}
```

---

### 1.5 Reset Password
```
POST /api/auth/reset-password
```

**Body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NuevoPassword123"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### 1.6 Logout
```
POST /api/auth/logout
```

**Headers:** `Authorization: Bearer <jwt_token>`

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### 1.7 Get Plans
```
GET /api/auth/plans
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "type": "trial",
        "name": "Prueba Gratuita Premium",
        "price_cop": 0,
        "duration_days": 10,
        "features": {
          "max_products": "ilimitado",
          "has_qr": true,
          "has_table_qr": true,
          "has_modifiers": true,
          "has_status_management": true,
          "ai_tokens": 10
        }
      },
      {
        "type": "emprendedor",
        "name": "Emprendedor",
        "price_cop": 30000,
        "duration_days": 30,
        "features": {
          "max_products": 25,
          "has_qr": true,
          "has_table_qr": false,
          "has_modifiers": false,
          "has_status_management": false,
          "ai_tokens": 150
        }
      },
      {
        "type": "crecimiento",
        "name": "Crecimiento",
        "price_cop": 40000,
        "duration_days": 30,
        "features": {
          "max_products": 100,
          "has_qr": true,
          "has_table_qr": true,
          "has_modifiers": false,
          "has_status_management": true,
          "ai_tokens": 500
        }
      },
      {
        "type": "elite",
        "name": "Élite",
        "price_cop": 50000,
        "duration_days": 30,
        "features": {
          "max_products": "ilimitado",
          "has_qr": true,
          "has_table_qr": true,
          "has_modifiers": true,
          "has_status_management": true,
          "ai_tokens": 3000
        }
      }
    ],
    "top_up_packs": [
      { "id": "5k", "label": "Pack Básico", "price_cop": 5000, "tokens": 15 },
      { "id": "10k", "label": "Pack Pro", "price_cop": 10000, "tokens": 35 }
    ]
  }
}
```

---

### 1.8 Initiate Payment
```
POST /api/auth/payment/initiate
```

**Headers:** `Authorization: Bearer <jwt_token>`

**Body:**
```json
{
  "plan_type": "crecimiento"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://mpago.la/xyz123",
    "preference_id": "12345678-1234-1234-1234-123456789012"
  }
}
```

---

## 2. DASHBOARD

### 2.1 Overview
```
GET /api/dashboard/overview
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "name": "Mi Restaurante",
      "slug": "mi-restaurante",
      "is_open": true,
      "plan_type": "crecimiento"
    },
    "stats": {
      "today_orders": 12,
      "pending": 3,
      "confirmed": 2,
      "preparing": 4,
      "delivered": 3,
      "cancelled": 0,
      "today_sales_cop": 450000
    },
    "menu_url": "https://velzia.com/menu/mi-restaurante"
  }
}
```

---

### 2.2 Toggle Restaurant Status
```
POST /api/dashboard/toggle-status
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "is_open": false
  }
}
```

---

### 2.3 Check Orders (polling)
```
GET /api/dashboard/check-orders
```

**Query params:** `last_check` (ISO timestamp)

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "has_new_orders": true,
    "orders": [
      { "id": 45, "order_number": "ORD-045", "customer_name": "Juan Pérez", "total": 35000, "status": "pending", "created_at": "2026-05-07T18:30:00Z" }
    ]
  }
}
```

---

### 2.4 Stats
```
GET /api/dashboard/stats
```

**Query params:** `period` (today, week, month), `start_date`, `end_date`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "total_orders": 45,
    "total_sales_cop": 1800000,
    "avg_order_value_cop": 40000,
    "orders_by_status": {
      "pending": 3,
      "confirmed": 5,
      "preparing": 8,
      "delivered": 25,
      "cancelled": 4
    },
    "top_products": [
      { "name": "Hamburguesa Clásica", "quantity": 15, "revenue_cop": 300000 }
    ]
  }
}
```

---

### 2.5 Settings
```
GET /api/dashboard/settings
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Mi Restaurante",
      "slug": "mi-restaurante",
      "whatsapp_phone": "+573001234567",
      "plan_type": "crecimiento",
      "subscription_expires_at": "2026-06-07T00:00:00Z",
      "is_active": true,
      "is_open": true,
      "created_at": "2026-01-15T00:00:00Z"
    },
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@restaurante.com"
    },
    "subscription": {
      "is_active": true,
      "status": "active",
      "days_remaining": 31,
      "plan_name": "Crecimiento",
      "expires_at": "2026-06-07T00:00:00Z"
    }
  }
}
```

---

### 2.6 Update Profile
```
PUT /api/dashboard/profile
```

**Body:**
```json
{
  "restaurant_name": "Nuevo Nombre",
  "whatsapp_phone": "+573009876543",
  "username": "nuevo_admin"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "restaurant": { "name": "Nuevo Nombre", "whatsapp_phone": "+573009876543" },
    "user": { "username": "nuevo_admin" }
  }
}
```

---

### 2.7 Subscription Info
```
GET /api/dashboard/subscription
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "plan": {
      "type": "crecimiento",
      "name": "Crecimiento",
      "price_cop": 40000,
      "features": {
        "max_products": 100,
        "has_qr": true,
        "has_table_qr": true,
        "has_modifiers": false,
        "has_status_management": true,
        "ai_tokens": 500
      }
    },
    "usage": {
      "products_used": 23,
      "products_limit": 100,
      "ai_tokens_used": 120,
      "ai_tokens_limit": 500
    },
    "subscription": {
      "is_active": true,
      "status": "active",
      "days_remaining": 31,
      "expires_at": "2026-06-07T00:00:00Z",
      "grace_period_days": 10
    }
  }
}
```

---

### 2.8 Change Password
```
POST /api/dashboard/change-password
```

**Body:**
```json
{
  "current_password": "ViejoPassword123",
  "new_password": "NuevoPassword456"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### 2.9 Delete Account
```
POST /api/dashboard/delete-account
```

**Body:**
```json
{
  "confirmation": "ELIMINAR"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Cuenta eliminada permanentemente"
}
```

---

## 3. CATEGORIES

### 3.1 List Categories
```
GET /api/categories
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Hamburguesas",
        "description": "Las mejores hamburguesas",
        "sort_order": 0,
        "is_active": true,
        "image_url": "https://res.cloudinary.com/...",
        "product_count": 5,
        "created_at": "2026-01-15T00:00:00Z"
      }
    ]
  }
}
```

---

### 3.2 Create Category
```
POST /api/categories
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: "Postres"
description: "Dulces y postres"
image: <file>
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Postres",
    "description": "Dulces y postres",
    "image_url": "https://res.cloudinary.com/...",
    "is_active": true,
    "sort_order": 1
  }
}
```

---

### 3.3 Update Category
```
PUT /api/categories/<id>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: "Postres Actualizados"
description: "Nuevos postres"
image: <file> (opcional)
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Postres Actualizados",
    "description": "Nuevos postres",
    "image_url": "https://res.cloudinary.com/..."
  }
}
```

---

### 3.4 Delete Category
```
DELETE /api/categories/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Categoría eliminada exitosamente"
}
```

**Respuesta 400 (tiene productos):**
```json
{
  "success": false,
  "error": "No se puede eliminar la categoría porque tiene productos asociados"
}
```

---

### 3.5 Toggle Category Status
```
PATCH /api/categories/<id>/toggle
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_active": false
  }
}
```

---

### 3.6 Reorder Category
```
PATCH /api/categories/<id>/reorder
```

**Body:**
```json
{
  "sort_order": 2
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "sort_order": 2
  }
}
```

---

## 4. PRODUCTS

### 4.1 List Products
```
GET /api/products
```

**Query params:** `category_id` (filter), `active_only` (true/false), `page`, `per_page`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Hamburguesa Clásica",
        "description": "Carne 150g, queso, lechuga, tomate",
        "price": 20000,
        "is_active": true,
        "is_highlighted": true,
        "image_url": "https://res.cloudinary.com/...",
        "category_id": 1,
        "category_name": "Hamburguesas",
        "modifiers_count": 3,
        "created_at": "2026-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 23,
      "pages": 2
    }
  }
}
```

---

### 4.2 Get Product Detail
```
GET /api/products/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Hamburguesa Clásica",
    "description": "Carne 150g, queso, lechuga, tomate",
    "price": 20000,
    "is_active": true,
    "is_highlighted": true,
    "image_url": "https://res.cloudinary.com/...",
    "category_id": 1,
    "category_name": "Hamburguesas",
    "modifiers": [
      { "id": 1, "name": "Queso extra", "extra_price": 3000, "is_active": true },
      { "id": 2, "name": "Tocineta", "extra_price": 5000, "is_active": true }
    ]
  }
}
```

---

### 4.3 Create Product
```
POST /api/products
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: "Hamburguesa Doble"
description: "Doble carne 300g"
price: 30000
category_id: 1
is_highlighted: true
image: <file>
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "id": 24,
    "name": "Hamburguesa Doble",
    "price": 30000,
    "category_id": 1,
    "is_active": true,
    "is_highlighted": true,
    "image_url": "https://res.cloudinary.com/..."
  }
}
```

**Respuesta 400 (límite de plan):**
```json
{
  "success": false,
  "error": "Has alcanzado el límite de 25 productos activos de tu plan Emprendedor."
}
```

---

### 4.4 Update Product
```
PUT /api/products/<id>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
name: "Hamburguesa Doble Premium"
description: "Doble carne premium 300g"
price: 35000
category_id: 1
is_highlighted: true
image: <file> (opcional)
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 24,
    "name": "Hamburguesa Doble Premium",
    "price": 35000
  }
}
```

---

### 4.5 Delete Product
```
DELETE /api/products/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

### 4.6 Toggle Product Status
```
PATCH /api/products/<id>/toggle
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_active": false
  }
}
```

---

### 4.7 List Modifiers
```
GET /api/products/<id>/modifiers
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "modifiers": [
      { "id": 1, "name": "Queso extra", "extra_price": 3000, "is_active": true },
      { "id": 2, "name": "Tocineta", "extra_price": 5000, "is_active": true }
    ]
  }
}
```

---

### 4.8 Create Modifier
```
POST /api/products/<id>/modifiers
```

**Body:**
```json
{
  "name": "Aguacate",
  "extra_price": 4000
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Aguacate",
    "extra_price": 4000,
    "is_active": true
  }
}
```

**Respuesta 403 (plan insuficiente):**
```json
{
  "success": false,
  "error": "Plan insuficiente",
  "message": "Tu plan actual no incluye la función: modifiers"
}
```

---

### 4.9 Delete Modifier
```
DELETE /api/products/modifiers/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Modifier eliminado exitosamente"
}
```

---

## 5. ORDERS

### 5.1 List Orders
```
GET /api/orders
```

**Query params:** `status` (filter: pending, confirmed, preparing, delivered, cancelled), `date` (YYYY-MM-DD), `page`, `per_page`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 45,
        "order_number": "ORD-045",
        "customer_name": "Juan Pérez",
        "customer_phone": "+573001234567",
        "status": "pending",
        "total": 35000,
        "notes": "Sin cebolla",
        "table_id": 3,
        "table_name": "Mesa 3",
        "items_count": 2,
        "created_at": "2026-05-07T18:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 12,
      "pages": 1
    }
  }
}
```

---

### 5.2 Get Order Detail
```
GET /api/orders/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "order_number": "ORD-045",
    "customer_name": "Juan Pérez",
    "customer_phone": "+573001234567",
    "status": "pending",
    "total": 35000,
    "notes": "Sin cebolla",
    "table": { "id": 3, "name": "Mesa 3" },
    "items": [
      {
        "id": 100,
        "product_name": "Hamburguesa Clásica",
        "product_price": 20000,
        "quantity": 1,
        "modifiers_snapshot": "Queso extra",
        "subtotal": 23000
      },
      {
        "id": 101,
        "product_name": "Papas Fritas",
        "product_price": 12000,
        "quantity": 1,
        "modifiers_snapshot": null,
        "subtotal": 12000
      }
    ],
    "created_at": "2026-05-07T18:30:00Z",
    "updated_at": "2026-05-07T18:30:00Z"
  }
}
```

---

### 5.3 Create Order (from dashboard)
```
POST /api/orders
```

**Body:**
```json
{
  "customer_name": "María García",
  "customer_phone": "+573009876543",
  "table_id": 5,
  "notes": "Para llevar",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "modifier_ids": [1, 2]
    },
    {
      "product_id": 5,
      "quantity": 1,
      "modifier_ids": []
    }
  ]
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "id": 46,
    "order_number": "ORD-046",
    "total": 73000,
    "status": "pending"
  }
}
```

---

### 5.4 Update Order Status
```
PATCH /api/orders/<id>/status
```

**Body:**
```json
{
  "status": "confirmed"
}
```

**Status válidos:** `pending`, `confirmed`, `preparing`, `ready`, `delivered`, `cancelled`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "status": "confirmed",
    "updated_at": "2026-05-07T18:35:00Z"
  }
}
```

---

### 5.5 Cancel Order
```
POST /api/orders/<id>/cancel
```

**Body:**
```json
{
  "reason": "Cliente canceló"
}
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "status": "cancelled"
  }
}
```

---

### 5.6 Get Receipt
```
GET /api/orders/<id>/receipt
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "order_number": "ORD-045",
    "restaurant_name": "Mi Restaurante",
    "customer_name": "Juan Pérez",
    "status": "delivered",
    "items": [
      { "product_name": "Hamburguesa Clásica", "quantity": 1, "price": 20000, "modifiers": "Queso extra", "subtotal": 23000 },
      { "product_name": "Papas Fritas", "quantity": 1, "price": 12000, "modifiers": null, "subtotal": 12000 }
    ],
    "total": 35000,
    "created_at": "2026-05-07T18:30:00Z"
  }
}
```

---

### 5.7 Delete Order (cancelled only)
```
DELETE /api/orders/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Orden eliminada exitosamente"
}
```

**Respuesta 400 (no cancelada):**
```json
{
  "success": false,
  "error": "Solo se pueden eliminar órdenes canceladas"
}
```

---

## 6. PUBLIC MENU

### 6.1 Get Full Menu
```
GET /api/public/menu/<slug>
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "name": "Mi Restaurante",
      "slug": "mi-restaurante",
      "whatsapp_phone": "+573001234567",
      "is_open": true,
      "logo_url": null
    },
    "categories": [
      {
        "id": 1,
        "name": "Hamburguesas",
        "image_url": "https://res.cloudinary.com/...",
        "products": [
          {
            "id": 1,
            "name": "Hamburguesa Clásica",
            "description": "Carne 150g, queso, lechuga, tomate",
            "price": 20000,
            "image_url": "https://res.cloudinary.com/...",
            "is_highlighted": true,
            "modifiers": [
              { "id": 1, "name": "Queso extra", "extra_price": 3000 }
            ]
          }
        ]
      }
    ],
    "highlighted": [
      { "id": 1, "name": "Hamburguesa Clásica", "price": 20000, "image_url": "..." }
    ]
  }
}
```

---

### 6.2 Get Category Products
```
GET /api/public/menu/<slug>/categoria/<category_id>
```

**Respuesta 200:** (similar a 6.1 pero solo productos de esa categoría)

---

### 6.3 Get New Products (Novedades)
```
GET /api/public/menu/<slug>/novedades
```

**Query params:** `page`, `per_page`

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "products": [
      { "id": 24, "name": "Hamburguesa Doble", "price": 30000, "image_url": "...", "created_at": "2026-05-05T00:00:00Z" }
    ],
    "pagination": { "page": 1, "per_page": 10, "total": 3, "pages": 1 }
  }
}
```

---

## 7. TABLES

### 7.1 List Tables
```
GET /api/tables
```

**Respuesta 200:**
```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "id": 1,
        "name": "Mesa 1",
        "qr_code": "table-1-abc123",
        "is_active": true,
        "active_orders_count": 0
      }
    ]
  }
}
```

---

### 7.2 Create Table
```
POST /api/tables
```

**Body:**
```json
{
  "name": "Mesa 10"
}
```

**Respuesta 201:**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "name": "Mesa 10",
    "qr_code": "table-10-xyz789",
    "is_active": true
  }
}
```

**Respuesta 403 (plan insuficiente):**
```json
{
  "success": false,
  "error": "Plan insuficiente",
  "message": "Tu plan actual no incluye la función: table_qr"
}
```

---

### 7.3 Delete Table
```
DELETE /api/tables/<id>
```

**Respuesta 200:**
```json
{
  "success": true,
  "message": "Mesa eliminada exitosamente"
}
```

---

## 8. TOKENS (ya existente)

### 8.1 Token Status
```
GET /api/tokens/status
```

### 8.2 Initiate Token Top-Up
```
POST /api/tokens/topup/initiate
```

*(Estos endpoints ya existen y funcionan con JWT de Clerk o API key)*
