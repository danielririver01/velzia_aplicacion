# Velzia App - Mobile Application

> Transformando Orderfox en una experiencia móvil nativa

## Descripción

Velzia App es el proyecto de extensión móvil para la plataforma **Velzia** (Orderfox), un sistema de gestión de restaurantes multi-tenant. Este proyecto añade una capa de API REST al backend Flask existente y una aplicación móvil nativa construida con React Native + Expo.

## Arquitectura

```
┌──────────────────────┐         ┌──────────────────────────┐
│   App Móvil          │  JWT    │   Flask Backend          │
│   (React Native)     │◄───────►│   (Orderfox existente)   │
│                      │  REST   │                          │
│   • Dashboard        │  API    │   /api/* → JSON (nuevo)  │
│   • Órdenes          │         │   /* → HTML (web, intacto)│
│   • Productos        │         │                          │
│   • Categorías       │         │   MySQL (sin cambios)    │
│   • Configuración    │         │                          │
└──────────────────────┘         └──────────────────────────┘
```

## Estructura del Proyecto

```
velzia-app/
├── AGENTS.md                    # Instrucciones para agentes IA
├── README.md                    # Este archivo
├── docs/
│   ├── PROPOSAL.md              # Documento de propuesta para revisión con equipo
│   ├── API_SPEC.md              # Especificación completa de APIs
│   ├── ARCHITECTURE.md          # Diagramas de arquitectura del sistema
│   ├── IMPLEMENTATION_PLAN.md   # Plan de implementación por fases
│   └── TECH_STACK.md            # Decisiones tecnológicas y justificación
├── backend/                     # Nuevos archivos API para agregar a Orderfox
└── mobile/                      # Aplicación React Native + Expo
```

## Estado Actual

| Componente | Estado |
|------------|--------|
| Backend Flask (web) | Producción - v1.3.0 |
| API Layer (nuevo) | En desarrollo |
| App Móvil (nuevo) | En desarrollo |

## Documentación para Equipo

Los documentos de revisión con el equipo están en la carpeta `docs/`:

1. **[PROPOSAL.md](./docs/PROPOSAL.md)** - Propuesta general del proyecto, alcance y objetivos
2. **[API_SPEC.md](./docs/API_SPEC.md)** - Especificación técnica de todos los endpoints API
3. **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Arquitectura del sistema, flujos de datos
4. **[IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)** - Plan detallado por fases con estimaciones
5. **[TECH_STACK.md](./docs/TECH_STACK.md)** - Stack tecnológico y decisiones de diseño

## Backend Flask existente

El proyecto base está en `Desktop/Orderfox`:
- Flask 3.1.3 + SQLAlchemy + MySQL
- Multi-tenant (restaurantes)
- Auth dual (sesión Flask + Clerk SSO)
- Pagos con Mercado Pago
- Cloudinary para imágenes
- Rate limiting + anti-bot

## Tecnologías Móvil

| Capa | Tecnología |
|------|------------|
| Framework | Expo SDK + Expo Router |
| Lenguaje | TypeScript |
| State | Zustand |
| HTTP | Axios + interceptores JWT |
| UI | React Native Paper / NativeWind |
| Storage | expo-secure-store |
| Forms | React Hook Form + Zod |

## Comandos Útiles

### Backend (desde Orderfox/)
```bash
# Instalar nueva dependencia
pip install flask-jwt-extended

# Ejecutar en desarrollo
python run.py
```

### Mobile (desde mobile/)
```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npx expo start

# Build APK
eas build --platform android --profile preview
```
