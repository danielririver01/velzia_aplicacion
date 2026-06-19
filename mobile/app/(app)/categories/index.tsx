import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity, Modal, TextInput as RNTextInput, Switch } from 'react-native';
import { useCategoriesStore } from '../../../src/stores';
import { SkeletonCategory } from '../../../src/components/SkeletonLoader';
import type { Category } from '../../../src/types';

export default function CategoriesScreen() {
  const { categories, isLoading, fetchCategories, createCategory, toggleCategory, deleteCategory } = useCategoriesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchCategories(); setRefreshing(false); };

  const handleCreate = async () => {
    if (!name.trim()) return;
    const success = await createCategory({ name, description: description || undefined });
    if (success) { setShowModal(false); setName(''); setDescription(''); }
  };

  const handleToggle = async (id: number) => { await toggleCategory(id); };
  const handleDelete = async (id: number) => { await deleteCategory(id); };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        {isLoading && categories.length === 0 ? (
          <View>
            <SkeletonCategory />
            <SkeletonCategory />
            <SkeletonCategory />
          </View>
        ) : categories.length > 0 ? (
          categories.map((category: Category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.description ? (
                    <Text style={styles.categoryDescription} numberOfLines={2}>{category.description}</Text>
                  ) : null}
                </View>
                <Switch
                  value={category.is_active}
                  onValueChange={() => handleToggle(category.id)}
                  trackColor={{ false: '#334155', true: '#065f46' }}
                  thumbColor={category.is_active ? '#4ade80' : '#64748b'}
                />
              </View>

              <View style={styles.categoryFooter}>
                <Text style={styles.categoryDate}>{formatDate(category.created_at)}</Text>
                <TouchableOpacity onPress={() => handleDelete(category.id)}>
                  <Text style={styles.deleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>Sin categorias</Text>
            <Text style={styles.emptyText}>Crea tu primera categoria con el boton +</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nueva categoria</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <RNTextInput
                placeholder="Nombre de la categoria"
                value={name}
                onChangeText={setName}
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

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createButton, !name.trim() && styles.createButtonDisabled]}
                onPress={handleCreate}
                disabled={!name.trim()}
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
  categoryCard: {
    backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  categoryInfo: { flex: 1, marginRight: 12 },
  categoryName: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  categoryDescription: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  categoryFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155',
  },
  categoryDate: { fontSize: 12, color: '#64748b' },
  deleteText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },
  fab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#ff6b00', justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: '#ff6b00', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#f8fafc', marginBottom: 24, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#94a3b8', marginBottom: 8 },
  input: {
    backgroundColor: '#0f172a', borderRadius: 12, borderWidth: 1, borderColor: '#334155',
    color: '#f8fafc', fontSize: 16, paddingVertical: 14, paddingHorizontal: 16,
  },
  textArea: { height: 60, textAlignVertical: 'top' },
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
