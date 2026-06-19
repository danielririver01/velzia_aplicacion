# Stack Tecnológico - Velzia Mobile

---

## 1. Backend (Flask - Adiciones)

### 1.1 JWT Authentication

| Componente | Elección | Alternativas Consideradas | Justificación |
|------------|----------|--------------------------|---------------|
| Librería | `flask-jwt-extended` | `PyJWT`, `flask-jwt` | Mejor integración con Flask, refresh tokens built-in, documentación extensa |
| Token Type | JWT (RS256 o HS256) | Session tokens, API keys | Stateless, escalable, estándar para APIs móviles |
| Expiración Access | 24 horas | 1 hora, 7 días | Balance entre seguridad y UX (no pedir login frecuente) |
| Expiración Refresh | 7 días | 30 días, sin expiración | Ventana razonable para reconexión automática |
| Storage (client) | `expo-secure-store` | AsyncStorage, MMKV | Encriptado a nivel de SO, más seguro para tokens |

### 1.2 Por qué NO cambiar la auth existente

- Las sesiones Flask usan cookies + server-side session store
- La web app tiene 1.3.0 en producción con usuarios activos
- Modificar el sistema de auth existente introduciría riesgo de regresión
- JWT es complementario, no reemplaza sesiones

---

## 2. Mobile (React Native + Expo)

### 2.1 Framework

| Componente | Elección | Alternativas Consideradas | Justificación |
|------------|----------|--------------------------|---------------|
| Framework | Expo SDK | React Native CLI, Flutter | Desarrollo más rápido, OTA updates, ecosistema maduro, mejor DX |
| Routing | Expo Router | React Navigation | File-based routing (como Next.js), type-safe, oficial de Expo |
| Lenguaje | TypeScript | JavaScript | Type safety, autocompletado, menos bugs en producción, mejor maintainability |

### 2.2 State Management

| Componente | Elección | Alternativas Consideradas | Justificación |
|------------|----------|--------------------------|---------------|
| State Global | Zustand | Redux Toolkit, Context API, MobX | API minimalista, sin boilerplate, TypeScript native, ~1KB bundle |
| Server State | React Query (opcional) | Zustand manual, SWR | Caché automático, refetch, deduplicación (evaluar si necesario) |
| Form State | React Hook Form | Formik, controlled components | Performance (uncontrolled), validación integrada, menos re-renders |
| Validation | Zod | Yup, Joi | TypeScript-first, schema inference, tree-shakeable |

### 2.3 UI

| Componente | Elección | Alternativas Consideradas | Justificación |
|------------|----------|--------------------------|---------------|
| Component Library | React Native Paper | NativeBase, UI Kitten, Tamagui | Material Design, componentes completos, theming, accesibilidad |
| Alternativa UI | NativeWind (Tailwind) | Styled Components, StyleSheet | Si el equipo ya conoce Tailwind, curva de aprendizaje cero |
| Icons | React Native Vector Icons | Expo Icons, SVG custom | Amplia colección, fácil integración |
| Navigation UI | Expo Router (built-in) | React Navigation | Ya incluido con Expo Router |

### 2.4 Networking

| Componente | Elección | Alternativas Consideradas | Justificación |
|------------|----------|--------------------------|---------------|
| HTTP Client | Axios | Fetch API, ky | Interceptors (JWT auto-attach), cancelación, timeouts, transformaciones |
| Error Handling | Custom error class | React Query errors | Control total sobre mapping de errores del backend |

### 2.5 Storage

| Componente | Elección | Alternativas Consideradas | Justificación |
|------------|----------|--------------------------|---------------|
| Secure Storage | expo-secure-store | AsyncStorage, react-native-keychain | Encriptado nativo (Keychain/Keystore), API simple |
| Preferences | AsyncStorage | MMKV, expo-sqlite | Simple key-value para prefs no sensibles |
| Cache | React Query cache | Manual, Dexie | Automático, configurable, invalidación inteligente |

---

## 3. Decisiones de Arquitectura

### 3.1 API Design

| Decisión | Elección | Razón |
|----------|----------|-------|
| Response format | `{ success, data, error }` | Consistente, fácil de parsear en mobile |
| Error codes | HTTP standard + custom messages | Estándar, debugging fácil |
| Pagination | `page`, `per_page`, `total`, `pages` | Simple, familiar, compatible con Flask-SQLAlchemy paginate |
| Date format | ISO 8601 UTC | Estándar, timezone-agnostic |
| Currency | Integer (COP cents) | Sin problemas de floating point, consistente con backend |

### 3.2 Por qué React Native sobre Flutter

| Factor | React Native | Flutter |
|--------|-------------|---------|
| Lenguaje del equipo | JavaScript/TypeScript (ya conocido) | Dart (nuevo) |
| Ecosistema | Más paquetes, más comunidad | Creciendo pero menor |
| Hot reload | Sí | Sí |
| Performance | Bueno (JS bridge) | Excelente (compilado nativo) |
| UI nativa | Componentes nativos | Custom rendering engine |
| Curva de aprendizaje | Baja (si sabes React) | Media-Alta |
| Tiempo de desarrollo | Más rápido (equipo familiarizado) | Más lento (aprender Dart) |

**Decisión:** React Native + Expo porque el equipo ya tiene experiencia con JavaScript/TypeScript y el tiempo de desarrollo es menor.

### 3.3 Por qué Expo sobre React Native CLI

| Factor | Expo | React Native CLI |
|--------|------|-----------------|
| Setup | `npx create-expo-app` | Configurar Xcode/Android Studio manualmente |
| OTA Updates | Sí (EAS Update) | No (requiere app store update) |
| Build service | EAS Build (cloud) | Local o CI propio |
| Native modules | Pre-configurados (config plugins) | Manual |
| Dev tools | Expo DevTools, Expo Go | Metro, emuladores |
| Limitaciones | Algunas libs nativas requieren dev config | Sin limitaciones |

**Decisión:** Expo porque acelera el desarrollo significativamente y las limitaciones no aplican para este proyecto.

---

## 4. Infraestructura

### 4.1 Backend Deployment

| Componente | Actual | Para Mobile |
|------------|--------|-------------|
| Server | Flask + Gunicorn | Sin cambios |
| Proxy | Nginx (ProxyFix) | Sin cambios |
| HTTPS | Requerido | **Requerido** (JWT sobre HTTPS) |
| Database | MySQL/MariaDB | Sin cambios |
| Static files | WhiteNoise | Sin cambios |

### 4.2 Mobile Distribution

| Etapa | Método |
|-------|--------|
| Desarrollo | Expo Go app |
| Testing interno | EAS Build → APK directo |
| Producción | Google Play Store (AAB) |
| Updates | EAS Update (OTA, sin re-publicar) |

---

## 5. Versiones Recomendadas

### Backend
```
Flask: 3.1.3 (actual, sin cambio)
flask-jwt-extended: ^4.6.0
Python: 3.10+ (actual)
```

### Mobile
```
Expo SDK: ~52.0.0
React Native: 0.76+
TypeScript: ^5.3.0
React: 18.3+
```

### Dependencias Mobile (package.json estimado)
```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-secure-store": "~14.0.0",
    "expo-status-bar": "~2.0.0",
    "expo-image-picker": "~16.0.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "react-native-paper": "^5.12.0",
    "react-native-vector-icons": "^10.0.0",
    "axios": "^1.7.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.23.0",
    "@tanstack/react-query": "^5.20.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "~18.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 6. Consideraciones de Seguridad

| Aspecto | Implementación |
|---------|---------------|
| JWT Storage | `expo-secure-store` (encriptado nativo) |
| HTTPS | Obligatorio en producción |
| Token Expiry | 24h access + 7d refresh |
| Password Hash | bcrypt/werkzeug (existente, sin cambio) |
| Rate Limiting | Flask-Limiter (existente) + OrderRateLimiter |
| CSRF | Exempt para `/api/*`, activo para web |
| Input Validation | Zod en mobile + validación en backend |
| SQL Injection | SQLAlchemy ORM (protección inherente) |
| XSS | No aplica (mobile, no HTML) |
