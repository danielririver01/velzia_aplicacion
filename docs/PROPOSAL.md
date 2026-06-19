# Propuesta: Velzia App - Extensión Móvil Nativa

**Fecha:** 7 de Mayo, 2026  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo Velzia  
**Estado:** En revisión con el equipo

---

## 1. Resumen Ejecutivo

Velzia (Orderfox) es una plataforma web de gestión de restaurantes que actualmente funciona como aplicación web Flask. Esta propuesta detalla el plan para extender la plataforma con una **aplicación móvil nativa** (Android/iOS) sin modificar la estructura web existente.

### Objetivo Principal
Crear una app móvil nativa que permita a los dueños de restaurantes gestionar sus negocios desde cualquier lugar, manteniendo el backend Flask actual como fuente única de verdad.

### Enfoque Técnico
- **Backend:** Añadir una capa de API REST JSON al Flask existente (coexiste con la web)
- **Frontend Móvil:** React Native + Expo para app nativa multiplataforma
- **Autenticación:** JWT tokens paralelos a las sesiones Flask existentes
- **Base de Datos:** Sin cambios - misma MySQL compartida

---

## 2. Problema que Resuelve

### Situación Actual
- Los restaurantes solo pueden gestionar su negocio desde un navegador web
- No hay acceso nativo a notificaciones push de nuevos pedidos
- La experiencia móvil web es limitada comparada con una app nativa
- No hay presencia en Google Play Store / App Store

### Solución
Una app nativa que ofrece:
- Gestión completa del restaurante desde el móvil
- Notificaciones push de nuevos pedidos en tiempo real
- Experiencia de usuario optimizada para móvil
- Presencia en tiendas de aplicaciones

---

## 3. Alcance del MVP

### Funcionalidades Incluidas

| Módulo | Funcionalidades |
|--------|----------------|
| **Autenticación** | Login email/password, registro completo, recuperación de contraseña, logout |
| **Dashboard** | Vista general, estadísticas del día, toggle abrir/cerrar restaurante |
| **Órdenes** | Lista de órdenes del día, detalle, cambio de estado, cancelar, ver recibo |
| **Productos** | Lista por categoría, crear, editar, eliminar, modifiers (plan Elite) |
| **Categorías** | Lista, crear, editar, eliminar, reordenar |
| **Configuración** | Perfil del restaurante, info de suscripción, cambiar contraseña |
| **Menú Público** | Ver menú público del restaurante (para preview) |

### Funcionalidades NO incluidas en MVP

| Módulo | Razón |
|--------|-------|
| Mesas QR | Feature de planes superiores, baja prioridad |
| Scanner IA | Integración compleja, requiere app separada |
| Tokens AI | Gestión ya disponible vía web, uso principal es Scanner IA |
| Notificaciones Push | Requiere infraestructura adicional (Firebase), fase 2 |
| Modo offline | Complejidad alta, fase 2 |
| iOS | Android primero, iOS en fase posterior |

---

## 4. Arquitectura Propuesta

### Diagrama de Alto Nivel

```
                    ┌─────────────────────────────────────┐
                    │         Flask Backend               │
                    │       (Orderfox existente)          │
                    │                                     │
  ┌──────────┐      │  ┌─────────────┐  ┌──────────────┐ │
  │   Web    │─────►│  │  Rutas Web  │  │  Modelos DB  │ │
  │ Browser  │      │  │  (/* → HTML)│  │  (sin cambio)│ │
  └──────────┘      │  └─────────────┘  └──────┬───────┘ │
                    │                           │         │
  ┌──────────┐      │  ┌─────────────┐  ┌──────▼───────┐ │
  │   App    │ JWT  │  │  Nuevas     │  │    MySQL     │ │
  │  Móvil   │◄────►│  │  Rutas API  │  │  (sin cambio)│ │
  │          │REST  │  │  (/api/* →  │  └──────────────┘ │
  └──────────┘      │  │   JSON)     │                   │
                    │  └─────────────┘                   │
                    │                                     │
                    │  Auth: Sesión + JWT (paralelos)    │
                    └─────────────────────────────────────┘
```

### Principios de Diseño

1. **Cero impacto en la web existente** - Las rutas web no se modifican
2. **APIs coexisten** - Nuevas rutas `/api/*` operan en paralelo
3. **Auth separada** - JWT para móvil, sesiones para web
4. **Misma base de datos** - Sin migraciones, sin cambios de schema
5. **Reutilización máxima** - Mismos modelos, mismos utils (extendidos, no modificados)

---

## 5. Stack Tecnológico

### Backend (adiciones al Flask existente)

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| JWT Auth | `flask-jwt-extended` | Estándar de la industria, fácil integración con Flask |
| Image Upload | Cloudinary (existente) | Ya configurado, solo adaptar para multipart directo |
| Rate Limiting | Flask-Limiter (existente) | Ya activo, se aplica a APIs también |
| CSRF | Flask-WTF (existente) | Exempt para `/api/*`, activo para web |

### Mobile (nuevo proyecto)

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| Framework | Expo SDK | Desarrollo rápido, OTA updates, ecosistema maduro |
| Routing | Expo Router | File-based routing, similar a Next.js |
| Lenguaje | TypeScript | Type safety, mejor DX, menos bugs en producción |
| State | Zustand | Ligero, simple, mejor DX que Redux |
| HTTP | Axios | Interceptors JWT, cancelación, timeouts |
| UI | React Native Paper | Material Design, componentes listos para producción |
| Storage | expo-secure-store | Almacenamiento seguro para JWT tokens |
| Forms | React Hook Form + Zod | Performance, validación type-safe |

---

## 6. Estimación de Esfuerzo

### Fase 1: Backend API Layer (~40 horas)

| Tarea | Horas | Complejidad |
|-------|-------|-------------|
| Setup JWT + decoradores | 4h | Media |
| Auth APIs (login, register, etc.) | 8h | Alta |
| Dashboard APIs | 4h | Baja |
| Categories APIs (CRUD) | 4h | Baja |
| Products APIs (CRUD + modifiers) | 8h | Media |
| Orders APIs (CRUD + status) | 6h | Media |
| Public Menu APIs | 4h | Baja |
| Tables APIs | 2h | Baja |
| Testing + bug fixes | 4h | - |

### Fase 2: Mobile App (~60 horas)

| Tarea | Horas | Complejidad |
|-------|-------|-------------|
| Setup Expo + estructura | 4h | Baja |
| Auth flow (login, register, JWT) | 8h | Media |
| Dashboard screen + stats | 6h | Media |
| Orders screens (list + detail + actions) | 12h | Alta |
| Products screens (list + CRUD + modifiers) | 12h | Alta |
| Categories screens (CRUD) | 6h | Media |
| Settings screens | 4h | Baja |
| Error handling + loading states | 4h | Baja |
| Testing + polish | 4h | - |

### Fase 3: Testing + Deploy (~16 horas)

| Tarea | Horas |
|-------|-------|
| API testing (Postman) | 4h |
| Mobile testing (dispositivos) | 4h |
| Build APK + signing | 2h |
| Deploy backend a producción | 2h |
| Documentación final | 4h |

### Total Estimado: ~116 horas (~3 semanas con 1 desarrollador full-time)

---

## 7. Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Conflicto entre auth de sesión y JWT | Baja | Alto | Decoradores separados, namespaces diferentes |
| CSRF bloqueando APIs | Baja | Medio | Exempt explícito para `/api/*` |
| Rate limiting afectando app | Media | Medio | Exempt para usuarios autenticados (ya implementado) |
| Image upload desde móvil falla | Media | Bajo | Adaptar `save_image()` para multipart directo |
| Schema DB necesita cambios | Baja | Alto | Evaluar caso por caso, migraciones con Flask-Migrate |
| Performance de APIs en datos grandes | Media | Medio | Paginación, índices DB existentes |

---

## 8. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| APIs funcionales | 100% de endpoints documentados operativos |
| Compatibilidad web | 0 regresiones en la app web existente |
| App funcional | CRUD completo de órdenes, productos, categorías |
| Performance API | < 500ms respuesta promedio |
| App size | < 25MB APK |
| Test coverage APIs | > 80% |

---

## 9. Próximos Pasos

1. **Revisión con equipo** - Presentar esta propuesta, recoger feedback
2. **Aprobación** - Confirmar alcance y timeline
3. **Fase 1** - Iniciar desarrollo de API layer en Flask
4. **Review intermedio** - Verificar APIs con Postman antes de empezar móvil
5. **Fase 2** - Desarrollo de app móvil
6. **Testing + Deploy** - QA, build APK, deploy

---

## 10. Documentos de Referencia

- [Especificación API](./API_SPEC.md) - Detalle técnico de todos los endpoints
- [Arquitectura](./ARCHITECTURE.md) - Diagramas y flujos de datos
- [Plan de Implementación](./IMPLEMENTATION_PLAN.md) - Tarea por tarea con código
- [Stack Tecnológico](./TECH_STACK.md) - Decisiones técnicas detalladas
