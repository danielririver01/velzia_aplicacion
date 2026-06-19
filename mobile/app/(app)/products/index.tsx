import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Modal, TextInput as RNTextInput, Image, Switch } from 'react-native';
import { useProductsStore, useCategoriesStore } from '../../../src/stores';
import { SkeletonProduct } from '../../../src/components/SkeletonLoader';
import type { Product, Category } from '../../../src/types';

export default function ProductsScreen() {
  const { products, isLoading, fetchProducts, createProduct, toggleProduct, deleteProduct } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isNovedad, setIsNovedad] = useState(false);

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProducts(), fetchCategories()]);
    setRefreshing(false);
  };

  const handleCreate = async () => {
    if (!name || !price || !categoryId) return;
    const success = await createProduct({
      name,
      price: parseFloat(price),
      category_id: parseInt(categoryId),
      description: description || undefined,
      is_novedad: isNovedad,
    });
    if (success) {
      setShowModal(false);
      setName(''); setPrice(''); setCategoryId(''); setDescription(''); setIsNovedad(false);
    }
  };

  const handleToggle = async (id: number) => { await toggleProduct(id); };

  const handleDelete = async (id: number) => {
    await deleteProduct(id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find((c: Category) => c.id === categoryId)?.name || 'Sin categoria';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        {isLoading && products.length === 0 ? (
          <View>
            <SkeletonProduct />
            <SkeletonProduct />
            <SkeletonProduct />
            <SkeletonProduct />
          </View>
        ) : products.length > 0 ? (
          products.map((product: Product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {product.image_url ? (
                  <Image source={{ uri: product.image_url }} style={styles.productImage} />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Text style={styles.productImagePlaceholderText}>🍕</Text>
                  </View>
                )}
              </View>

              <View style={styles.productInfo}>
                <View style={styles.productHeader}>
                  <View style={styles.productTitleContainer}>
                    <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.productCategory}>{getCategoryName(product.category_id)}</Text>
                  </View>
                  {product.is_novedad && (
                    <View style={styles.novedadBadge}>
                      <Text style={styles.novedadText}>Nuevo</Text>
                    </View>
                  )}
                </View>

                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{formatCurrency(product.price)}</Text>
                  <View style={styles.productActions}>
                    <Switch
                      value={product.is_active}
                      onValueChange={() => handleToggle(product.id)}
                      trackColor={{ false: '#334155', true: '#065f46' }}
                      thumbColor={product.is_active ? '#4ade80' : '#64748b'}
                    />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(product.id)}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🍕</Text>
            <Text style={styles.emptyTitle}>Sin productos</Text>
            <Text style={styles.emptyText}>Agrega tu primer producto con el boton +</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo producto</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <RNTextInput
                placeholder="Nombre del producto"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#4a5568"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Precio</Text>
              <RNTextInput
                placeholder="0"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#4a5568"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descripcion (opcional)</Text>
              <RNTextInput
                placeholder="Descripcion breve"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                style={[styles.input, styles.textArea]}
                placeholderTextColor="#4a5568"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {categories.map((cat: Category) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, categoryId === String(cat.id) && styles.catChipActive]}
                    onPress={() => setCategoryId(String(cat.id))}
                  >
                    <Text style={[styles.catChipText, categoryId === String(cat.id) && styles.catChipTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Marcar como novedad</Text>
              <Switch
                value={isNovedad}
                onValueChange={setIsNovedad}
                trackColor={{ false: '#334155', true: '#065f46' }}
                thumbColor={isNovedad ? '#4ade80' : '#64748b'}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, (!name || !price || !categoryId) && styles.createButtonDisabled]}
                onPress={handleCreate}
                disabled={!name || !price || !categoryId}
              >
                <Text style={styles.createButtonText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollView: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 100 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  productImageContainer: { marginRight: 12 },
  productImage: { width: 72, height: 72, borderRadius: 12 },
  productImagePlaceholder: {
    width: 72, height: 72, borderRadius: 12,
    backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center',
  },
  productImagePlaceholderText: { fontSize: 28 },
  productInfo: { flex: 1 },
  productHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  productTitleContainer: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  productCategory: { fontSize: 12, color: '#64748b', marginTop: 2 },
  novedadBadge: {
    backgroundColor: '#f59e0b', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8,
  },
  novedadText: { color: '#000', fontSize: 10, fontWeight: '700' },
  productFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8,
  },
  productPrice: { fontSize: 16, fontWeight: '700', color: '#ff6b00' },
  productActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteButton: { paddingHorizontal: 8, paddingVertical: 4 },
  deleteButtonText: { color: '#ef4444', fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#ff6b00', justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#ff6b00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '85%',
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#f8fafc', marginBottom: 24, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8 },
  input: {
    backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    color: '#f8fafc', fontSize: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  textArea: { height: 60, textAlignVertical: 'top' },
  categoriesScroll: { marginBottom: 8 },
  catChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: '#334155', marginRight: 8,
  },
  catChipActive: { backgroundColor: '#ff6b00' },
  catChipText: { color: '#94a3b8', fontSize: 14 },
  catChipTextActive: { color: '#fff', fontWeight: '600' },
  switchRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0f172a', borderRadius: 12, padding: 16, marginBottom: 16,
  },
  switchLabel: { color: '#e2e8f0', fontSize: 14 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelButton: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#334155', alignItems: 'center',
  },
  cancelButtonText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  createButton: {
    flex: 1, paddingVertical: 16, borderRadius: 12,
    backgroundColor: '#ff6b00', alignItems: 'center',
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  emptyCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});
