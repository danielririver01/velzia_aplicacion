import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { useProductsStore, useCategoriesStore, useOrdersStore } from '../../../src/stores';
import type { Product, Category } from '../../../src/types';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CreateOrderScreen() {
  const { products, fetchProducts, isLoading: productsLoading } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { createOrder, isLoading: creating } = useOrdersStore();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setRefreshing(false);
  };

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.product.id !== productId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerName('');
    setNotes('');
  }, []);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    const success = await createOrder({
      customer_name: customerName.trim() || undefined,
      notes: notes.trim() || undefined,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
    });
    if (success) {
      setSuccess(true);
      clearCart();
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory && p.is_active)
    : products.filter((p) => p.is_active);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {categories.filter((c) => c.is_active).map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        {/* Products grid */}
        {filteredProducts.length > 0 ? (
          <View style={styles.productsGrid}>
            {filteredProducts.map((product) => {
              const inCart = cart.find((item) => item.product.id === product.id);
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, inCart && styles.productCardInCart]}
                  onPress={() => addToCart(product)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.productEmoji}>🍕</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                  {inCart ? (
                    <View style={styles.qtyControls}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart(product.id)}>
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{inCart.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart(product)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.addButton}>
                      <Text style={styles.addButtonText}>+</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🍕</Text>
            <Text style={styles.emptyTitle}>Sin productos</Text>
            <Text style={styles.emptyText}>Agrega productos desde la sección Productos</Text>
          </View>
        )}

        {/* Customer info */}
        {cartCount > 0 && (
          <View style={styles.customerSection}>
            <Text style={styles.sectionTitle}>Datos del pedido</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del cliente (opcional)"
              placeholderTextColor="#4a5568"
              value={customerName}
              onChangeText={setCustomerName}
            />
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notas (opcional)"
              placeholderTextColor="#4a5568"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
            />
          </View>
        )}
      </ScrollView>

      {/* Cart bar */}
      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <View style={styles.cartInfo}>
            <Text style={styles.cartCount}>{cartCount} producto{cartCount !== 1 ? 's' : ''}</Text>
            <Text style={styles.cartTotal}>{formatCurrency(cartTotal)}</Text>
          </View>
          <View style={styles.cartActions}>
            <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearButtonText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, creating && styles.confirmButtonDisabled]}
              onPress={handleSubmit}
              disabled={creating}
            >
              <Text style={styles.confirmButtonText}>{creating ? 'CREANDO...' : 'CONFIRMAR PEDIDO'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {success && (
        <View style={styles.successToast}>
          <Text style={styles.successText}>✅ Pedido creado exitosamente</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  categoryScroll: { maxHeight: 52 },
  categoryContent: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#1e293b', marginRight: 8 },
  categoryChipActive: { backgroundColor: '#ff6b00' },
  categoryChipText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  scrollView: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 140 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: {
    width: '47%', backgroundColor: '#1e293b', borderRadius: 16, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'transparent',
  },
  productCardInCart: { borderColor: '#ff6b00', backgroundColor: '#1a1f35' },
  productEmoji: { fontSize: 32, marginBottom: 8 },
  productName: { fontSize: 14, fontWeight: '700', color: '#f8fafc', textAlign: 'center', marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: '#ff6b00', marginBottom: 8 },
  addButton: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#ff6b00',
    justifyContent: 'center', alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: -1 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  qtyValue: { color: '#ffb690', fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  customerSection: { marginTop: 24, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  input: {
    backgroundColor: '#1e293b', borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    color: '#f8fafc', fontSize: 14, paddingVertical: 12, paddingHorizontal: 16,
  },
  notesInput: { height: 60, textAlignVertical: 'top' },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#1e293b', borderTopWidth: 1, borderTopColor: '#334155',
    paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 30,
    gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
  },
  cartInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartCount: { color: '#94a3b8', fontSize: 14 },
  cartTotal: { color: '#ffb690', fontSize: 18, fontWeight: '700' },
  cartActions: { flexDirection: 'row', gap: 12 },
  clearButton: {
    flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    alignItems: 'center', justifyContent: 'center',
  },
  clearButtonText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  confirmButton: {
    flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: '#ff6b00',
    alignItems: 'center', justifyContent: 'center',
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  successToast: {
    position: 'absolute', top: 60, left: 20, right: 20,
    backgroundColor: '#065f46', borderRadius: 12, padding: 14, alignItems: 'center',
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  successText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  emptyCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});