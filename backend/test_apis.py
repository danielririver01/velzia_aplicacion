"""
Velzia API Test Script
======================
Prueba todos los endpoints de la API movil de Velzia.

Uso:
    cd Desktop/Orderfox
    .venv/Scripts/python.exe ../velzia-app/backend/test_apis.py

Requisitos:
    - Flask app corriendo en http://localhost:5000
    - Un usuario existente con restaurante activo
"""

import requests
import json
import sys
import os

BASE_URL = "http://localhost:5000"

TEST_USER = {
    "email": os.environ.get("TEST_EMAIL", "test@velzia.com"),
    "password": os.environ.get("TEST_PASSWORD", "Test1234")
}

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
BOLD = "\033[1m"
RESET = "\033[0m"

results = {"passed": 0, "failed": 0, "skipped": 0}
state = {"token": None, "data": {}}


def print_header(text):
    print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")
    print(f"{BOLD}{BLUE}  {text}{RESET}")
    print(f"{BOLD}{BLUE}{'='*60}{RESET}\n")


def print_test(name, method, url):
    print(f"  {BOLD}{method:<6}{RESET} {url:<55} {YELLOW}{name}{RESET}")


def print_result(success, status_code, data=None, message=""):
    if success:
        results["passed"] += 1
        icon = f"{GREEN}PASS{RESET}"
    else:
        results["failed"] += 1
        icon = f"{RED}FAIL{RESET}"
    detail = ""
    if data and isinstance(data, dict):
        keys = list(data.keys())[:3]
        detail = f" keys={keys}"
    if message:
        detail = f" {message}"
    print(f"         {icon} [{status_code}]{detail}")
    return success


def auth_headers():
    return {"Authorization": f"Bearer {state['token']}"} if state["token"] else {}


def check_server():
    print_header("Verificando servidor Flask")
    try:
        resp = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"  {GREEN}Servidor corriendo en {BASE_URL} (status: {resp.status_code}){RESET}")
        return True
    except requests.ConnectionError:
        print(f"  {RED}ERROR: No se puede conectar a {BASE_URL}{RESET}")
        print(f"  {YELLOW}Inicia el servidor: cd Orderfox && .venv\\Scripts\\Activate.ps1 && python run.py{RESET}")
        return False


def test_auth():
    print_header("1. AUTH ENDPOINTS")

    print_test("Listar planes", "GET", "/api/auth/plans")
    resp = requests.get(f"{BASE_URL}/api/auth/plans")
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Login", "POST", "/api/auth/login")
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_USER["email"], "password": TEST_USER["password"]}
    )
    data = resp.json()
    ok = print_result(resp.status_code == 200, resp.status_code, data)

    if ok and data.get("success"):
        state["token"] = data["data"]["access_token"]
        state["data"]["user"] = data["data"].get("user", {})
        state["data"]["restaurant"] = data["data"].get("restaurant", {})
        print(f"         {GREEN}Token JWT obtenido{RESET}")
    else:
        print(f"         {RED}No se pudo obtener token. Configura TEST_EMAIL y TEST_PASSWORD.{RESET}")
        return False

    print_test("Forgot password", "POST", "/api/auth/forgot-password")
    resp = requests.post(
        f"{BASE_URL}/api/auth/forgot-password",
        json={"email": TEST_USER["email"]}
    )
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Logout", "POST", "/api/auth/logout")
    resp = requests.post(f"{BASE_URL}/api/auth/logout")
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    return True


def test_dashboard():
    print_header("2. DASHBOARD ENDPOINTS")
    h = auth_headers()

    print_test("Overview", "GET", "/api/dashboard/overview")
    resp = requests.get(f"{BASE_URL}/api/dashboard/overview", headers=h)
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Stats", "GET", "/api/dashboard/stats")
    resp = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=h)
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Check orders", "GET", "/api/dashboard/check-orders")
    resp = requests.get(f"{BASE_URL}/api/dashboard/check-orders", headers=h)
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Settings", "GET", "/api/dashboard/settings")
    resp = requests.get(f"{BASE_URL}/api/dashboard/settings", headers=h)
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Subscription", "GET", "/api/dashboard/subscription")
    resp = requests.get(f"{BASE_URL}/api/dashboard/subscription", headers=h)
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Update profile", "PUT", "/api/dashboard/profile")
    resp = requests.put(
        f"{BASE_URL}/api/dashboard/profile",
        headers=h,
        json={"restaurant_name": state["data"].get("restaurant", {}).get("name", "Test"), "username": "test_api"}
    )
    print_result(resp.status_code == 200, resp.status_code, resp.json())

    print_test("Change password (expect fail)", "POST", "/api/dashboard/change-password")
    resp = requests.post(
        f"{BASE_URL}/api/dashboard/change-password",
        headers=h,
        json={"current_password": "wrong", "new_password": "NewPass1", "confirm_password": "NewPass1"}
    )
    print_result(resp.status_code == 400, resp.status_code, resp.json(), "Expected 400")

    print_test("Toggle status", "POST", "/api/dashboard/toggle-status")
    resp = requests.post(
        f"{BASE_URL}/api/dashboard/toggle-status",
        headers=h,
        json={"is_open": True}
    )
    print_result(resp.status_code in [200, 403], resp.status_code, resp.json())


def test_categories():
    print_header("3. CATEGORIES ENDPOINTS")
    h = auth_headers()

    print_test("List categories", "GET", "/api/categories")
    resp = requests.get(f"{BASE_URL}/api/categories", headers=h)
    data = resp.json()
    ok = print_result(resp.status_code == 200, resp.status_code, data)
    if ok and data.get("data", {}).get("categories"):
        state["data"]["category_id"] = data["data"]["categories"][0]["id"]

    print_test("Create category", "POST", "/api/categories")
    resp = requests.post(
        f"{BASE_URL}/api/categories",
        headers=h,
        data={"name": "Test API Category", "description": "Creada por script", "is_active": "true"}
    )
    data = resp.json()
    ok = print_result(resp.status_code == 201, resp.status_code, data)
    if ok and data.get("success"):
        state["data"]["new_category_id"] = data["data"]["id"]

    cat_id = state["data"].get("new_category_id") or state["data"].get("category_id")
    if cat_id:
        print_test("Get category", "GET", f"/api/categories/{cat_id}")
        resp = requests.get(f"{BASE_URL}/api/categories/{cat_id}", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Update category", "PUT", f"/api/categories/{cat_id}")
        resp = requests.put(
            f"{BASE_URL}/api/categories/{cat_id}",
            headers=h,
            data={"name": "Test API Category Updated"}
        )
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Toggle category", "PATCH", f"/api/categories/{cat_id}/toggle")
        resp = requests.patch(
            f"{BASE_URL}/api/categories/{cat_id}/toggle",
            headers=h,
            json={"is_active": False}
        )
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Reorder category", "PATCH", f"/api/categories/{cat_id}/reorder")
        resp = requests.patch(
            f"{BASE_URL}/api/categories/{cat_id}/reorder",
            headers=h,
            json={"sort_order": 99}
        )
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Delete category", "DELETE", f"/api/categories/{cat_id}")
        resp = requests.delete(f"{BASE_URL}/api/categories/{cat_id}", headers=h)
        print_result(resp.status_code in [200, 400], resp.status_code, resp.json())


def test_products():
    print_header("4. PRODUCTS ENDPOINTS")
    h = auth_headers()

    print_test("List products", "GET", "/api/products")
    resp = requests.get(f"{BASE_URL}/api/products", headers=h)
    data = resp.json()
    ok = print_result(resp.status_code == 200, resp.status_code, data)
    if ok and data.get("data", {}).get("products"):
        state["data"]["product_id"] = data["data"]["products"][0]["id"]

    print_test("Create category for product", "POST", "/api/categories")
    resp = requests.post(
        f"{BASE_URL}/api/categories",
        headers=h,
        data={"name": "Test Products Cat", "description": "Para productos", "is_active": "true"}
    )
    if resp.status_code == 201:
        cat_id = resp.json()["data"]["id"]
        state["data"]["product_category_id"] = cat_id

        print_test("Create product", "POST", "/api/products")
        resp = requests.post(
            f"{BASE_URL}/api/products",
            headers=h,
            data={"name": "Test API Product", "price": "25000", "category_id": str(cat_id), "description": "Producto de prueba"}
        )
        data = resp.json()
        ok = print_result(resp.status_code == 201, resp.status_code, data)
        if ok and data.get("success"):
            state["data"]["new_product_id"] = data["data"]["id"]

    prod_id = state["data"].get("new_product_id") or state["data"].get("product_id")
    if prod_id:
        print_test("Get product", "GET", f"/api/products/{prod_id}")
        resp = requests.get(f"{BASE_URL}/api/products/{prod_id}", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Toggle product", "PATCH", f"/api/products/{prod_id}/toggle")
        resp = requests.patch(
            f"{BASE_URL}/api/products/{prod_id}/toggle",
            headers=h,
            json={"is_active": False}
        )
        print_result(resp.status_code in [200, 400], resp.status_code, resp.json())

        print_test("Create modifier (may be 403)", "POST", f"/api/products/{prod_id}/modifiers")
        resp = requests.post(
            f"{BASE_URL}/api/products/{prod_id}/modifiers",
            headers=h,
            json={"name": "Extra cheese", "extra_price": 3000}
        )
        data = resp.json()
        ok = print_result(resp.status_code in [201, 403], resp.status_code, data)
        if ok and resp.status_code == 201 and data.get("success"):
            state["data"]["modifier_id"] = data["data"]["id"]

        print_test("List modifiers", "GET", f"/api/products/{prod_id}/modifiers")
        resp = requests.get(f"{BASE_URL}/api/products/{prod_id}/modifiers", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        mod_id = state["data"].get("modifier_id")
        if mod_id:
            print_test("Delete modifier", "DELETE", f"/api/products/modifiers/{mod_id}")
            resp = requests.delete(f"{BASE_URL}/api/products/modifiers/{mod_id}", headers=h)
            print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Delete product", "DELETE", f"/api/products/{prod_id}")
        resp = requests.delete(f"{BASE_URL}/api/products/{prod_id}", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())


def test_orders():
    print_header("5. ORDERS ENDPOINTS")
    h = auth_headers()

    print_test("List orders", "GET", "/api/orders")
    resp = requests.get(f"{BASE_URL}/api/orders", headers=h)
    data = resp.json()
    ok = print_result(resp.status_code == 200, resp.status_code, data)
    if ok and data.get("data", {}).get("orders"):
        state["data"]["order_id"] = data["data"]["orders"][0]["id"]

    order_id = state["data"].get("order_id")
    if order_id:
        print_test("Get order detail", "GET", f"/api/orders/{order_id}")
        resp = requests.get(f"{BASE_URL}/api/orders/{order_id}", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Change order status", "PATCH", f"/api/orders/{order_id}/status")
        resp = requests.patch(
            f"{BASE_URL}/api/orders/{order_id}/status",
            headers=h,
            json={"status": "confirmed"}
        )
        print_result(resp.status_code in [200, 400, 403], resp.status_code, resp.json())

        print_test("Get receipt", "GET", f"/api/orders/{order_id}/receipt")
        resp = requests.get(f"{BASE_URL}/api/orders/{order_id}/receipt", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())

        print_test("Cancel order", "POST", f"/api/orders/{order_id}/cancel")
        resp = requests.post(f"{BASE_URL}/api/orders/{order_id}/cancel", headers=h)
        print_result(resp.status_code in [200, 400], resp.status_code, resp.json())

        print_test("Delete order", "DELETE", f"/api/orders/{order_id}")
        resp = requests.delete(f"{BASE_URL}/api/orders/{order_id}", headers=h)
        print_result(resp.status_code in [200, 400], resp.status_code, resp.json())


def test_public():
    print_header("6. PUBLIC MENU ENDPOINTS")
    slug = state["data"].get("restaurant", {}).get("slug")
    if not slug:
        print(f"  {YELLOW}No hay slug disponible, saltando{RESET}")
        results["skipped"] += 2
        return

    print_test("Get full menu", "GET", f"/api/public/menu/{slug}")
    resp = requests.get(f"{BASE_URL}/api/public/menu/{slug}")
    print_result(resp.status_code in [200, 403], resp.status_code, resp.json())

    print_test("Get novedades", "GET", f"/api/public/menu/{slug}/novedades")
    resp = requests.get(f"{BASE_URL}/api/public/menu/{slug}/novedades")
    print_result(resp.status_code in [200, 404], resp.status_code, resp.json())


def test_tables():
    print_header("7. TABLES ENDPOINTS")
    h = auth_headers()

    print_test("List tables", "GET", "/api/tables")
    resp = requests.get(f"{BASE_URL}/api/tables", headers=h)
    print_result(resp.status_code in [200, 403], resp.status_code, resp.json())

    print_test("Create table (may be 403)", "POST", "/api/tables")
    resp = requests.post(
        f"{BASE_URL}/api/tables",
        headers=h,
        json={"name": "Mesa Test API"}
    )
    data = resp.json()
    ok = print_result(resp.status_code in [201, 403], resp.status_code, data)
    if ok and resp.status_code == 201 and data.get("success"):
        table_id = data["data"]["id"]
        print_test("Delete table", "DELETE", f"/api/tables/{table_id}")
        resp = requests.delete(f"{BASE_URL}/api/tables/{table_id}", headers=h)
        print_result(resp.status_code == 200, resp.status_code, resp.json())


def test_auth_edge_cases():
    print_header("8. AUTH EDGE CASES")

    print_test("Login invalido", "POST", "/api/auth/login")
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": "fake@email.com", "password": "wrong"}
    )
    print_result(resp.status_code == 401, resp.status_code, resp.json(), "Expected 401")

    print_test("Sin token", "GET", "/api/dashboard/overview")
    resp = requests.get(f"{BASE_URL}/api/dashboard/overview")
    print_result(resp.status_code == 401, resp.status_code, resp.json(), "Expected 401")

    print_test("Token invalido", "GET", "/api/dashboard/overview")
    resp = requests.get(
        f"{BASE_URL}/api/dashboard/overview",
        headers={"Authorization": "Bearer invalid_token"}
    )
    print_result(resp.status_code == 401, resp.status_code, resp.json(), "Expected 401")

    print_test("Refresh token (fake)", "POST", "/api/auth/refresh")
    resp = requests.post(
        f"{BASE_URL}/api/auth/refresh",
        json={"refresh_token": "fake_refresh"}
    )
    print_result(resp.status_code == 401, resp.status_code, resp.json(), "Expected 401")


def main():
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  VELZIA API TEST SUITE{RESET}")
    print(f"{BOLD}  Base URL: {BASE_URL}{RESET}")
    print(f"{'='*60}{RESET}")

    if not check_server():
        sys.exit(1)

    if not test_auth():
        print(f"\n{RED}No se pudo autenticar. Configura TEST_EMAIL y TEST_PASSWORD.{RESET}")
        print(f"{YELLOW}Ejemplo:{RESET}")
        print(f"  $env:TEST_EMAIL=\"test@velzia.com\"")
        print(f"  $env:TEST_PASSWORD=\"Test1234\"")
        print(f"  python test_apis.py")
        sys.exit(1)

    test_dashboard()
    test_categories()
    test_products()
    test_orders()
    test_public()
    test_tables()
    test_auth_edge_cases()

    total = results["passed"] + results["failed"] + results["skipped"]
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  RESULTADOS{RESET}")
    print(f"{'='*60}{RESET}")
    print(f"  {GREEN}Pasaron:   {results['passed']}{RESET}")
    print(f"  {RED}Fallaron:  {results['failed']}{RESET}")
    print(f"  {YELLOW}Saltaron:  {results['skipped']}{RESET}")
    print(f"  Total:    {total}")
    print(f"{'='*60}\n")

    if results["failed"] > 0:
        sys.exit(1)
    else:
        print(f"{GREEN}Todas las pruebas pasaron!{RESET}\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
