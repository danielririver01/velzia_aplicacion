# Velzia App - Agent Instructions

## Project Overview
This is the mobile app project for **Velzia** (Orderfox), a multi-tenant restaurant management platform. The backend is a Flask web application located at `Desktop/Orderfox`. This project (`velzia-app`) contains:
1. **Backend API layer** - New REST API endpoints added to the existing Flask app
2. **Mobile app** - React Native + Expo client application

## Critical Rules

### Backend (Orderfox)
- **NEVER modify existing web routes** - All current Flask routes that render HTML templates must remain untouched
- **All new API routes** must be prefixed with `/api/` and placed in new blueprint files under `app/routes/api_*.py`
- **Never change `models.py`** - The database schema is stable and shared with the web app
- **Never change existing utility files** unless explicitly adding new functions (e.g., `jwt_auth.py` is new, don't modify `auth.py`)
- **CSRF must be exempt** for all `/api/*` endpoints
- **JWT authentication** is separate from Flask session auth - create parallel decorators, don't modify existing ones

### Mobile (velzia-app/mobile)
- Use **Expo SDK** with **Expo Router** (file-based routing)
- Use **TypeScript** throughout
- API base URL comes from environment variable
- JWT tokens stored in `expo-secure-store`
- Follow existing code conventions established in this project

## Project Structure
```
velzia-app/
├── AGENTS.md              # This file
├── README.md              # Project overview
├── docs/
│   ├── PROPOSAL.md        # Team review proposal document
│   ├── API_SPEC.md        # Complete API specification
│   ├── ARCHITECTURE.md    # System architecture diagrams
│   ├── IMPLEMENTATION_PLAN.md  # Phased implementation plan
│   └── TECH_STACK.md      # Technology decisions and rationale
├── backend/               # New API files to add to Orderfox
│   └── (api_*.py files)
└── mobile/                # React Native + Expo app
    └── (Expo project files)
```

## Key Dependencies
### Backend additions
- `flask-jwt-extended` - JWT authentication for mobile API
- No changes to existing dependencies

### Mobile stack
- Expo SDK + Expo Router
- Zustand (state management)
- Axios (HTTP client)
- React Native Paper or NativeWind (UI)
- expo-secure-store (token storage)
- React Hook Form + Zod (forms + validation)

## Communication
- When asked about the backend, reference `Desktop/Orderfox` as the source
- When creating new API endpoints, always add them as new blueprints
- When building mobile screens, match the existing Velzia branding and UX patterns
