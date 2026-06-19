import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useOrdersStore } from '../../../src/stores';
import { SkeletonOrder } from '../../../src/components/SkeletonLoader';
import type { Order } from '../../../src/types';

const STATUS_OPTIONS = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'En curso', value: 'confirmed' },
  { label: 'Listos', value: 'ready' },
  { label: 'Entregados', value: 'delivered' },
];

export default function OrdersScreen() {
  const { orders, isLoading, fetchOrders, updateOrderStatus, cancelOrder } = useOrdersStore();
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders(statusFilter === 'all' ? undefined : statusFilter);
  }, [statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(statusFilter === 'all' ? undefined : statusFilter);
    setRefreshing(false);
  };

  const getNextStatus = (current: string): string | null => {
    const flow: Record<string, string> = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' };
    return flow[current] || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'delivered': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente', confirmed: 'Confirmado', preparing: 'Preparando',
      ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString('es');
  };

  const canCancel = (status: string) => !['delivered', 'cancelled'].includes(status);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.filterChip, statusFilter === opt.value && styles.filterChipActive]}
            onPress={() => setStatusFilter(opt.value)}
          >
            <Text style={[styles.filterChipText, statusFilter === opt.value && styles.filterChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff6b00" />}
      >
        {isLoading && orders.length === 0 ? (
          <View>
            <SkeletonOrder /><SkeletonOrder /><SkeletonOrder />
          </View>
        ) : orders.length > 0 ? (
          orders.map((order: Order) => {
            const nextStatus = getNextStatus(order.status);
            const isExpanded = expandedId === order.id;
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => setExpandedId(isExpanded ? null : order.id)}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderNumber}>#{order.order_number}</Text>
                    <Text style={styles.orderMeta}>
                      {order.table_name ? `Mesa ${order.table_name}` : 'Para llevar'}
                      {order.customer_name ? ` • ${order.customer_name}` : ''}
                    </Text>
                  </View>
                  <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                    <View style={[styles.orderStatusDot, { backgroundColor: getStatusColor(order.status) }]} />
                    <Text style={[styles.orderStatusText, { color: getStatusColor(order.status) }]}>
                      {getStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemsContainer}>
                  {(isExpanded && order.items ? order.items : (order.items || []).slice(0, 3)).map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemQty}>{item.quantity}x</Text>
                      <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
                      <Text style={styles.itemPrice}>{formatCurrency((item.subtotal || item.product_price || 0) * item.quantity)}</Text>
                    </View>
                  ))}
                  {!isExpanded && (order.items?.length || 0) > 3 && (
                    <Text style={styles.moreItems}>+{order.items!.length - 3} más — toca para ver todo</Text>
                  )}
                </View>

                {order.notes ? (
                  <Text style={styles.orderNotes} numberOfLines={isExpanded ? undefined : 1}>📝 {order.notes}</Text>
                ) : null}

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>{formatCurrency(order.total)}</Text>
                  <View style={styles.orderFooterRight}>
                    <Text style={styles.orderTime}>{formatTimeAgo(order.created_at)}</Text>
                    {canCancel(order.status) && (
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => cancelOrder(order.id)}
                      >
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                    {nextStatus && (
                      <TouchableOpacity
                        style={[styles.advanceButton, { backgroundColor: getStatusColor(nextStatus) + '20' }]}
                        onPress={() => updateOrderStatus(order.id, nextStatus)}
                      >
                        <Text style={[styles.advanceButtonText, { color: getStatusColor(nextStatus) }]}>
                          → {getStatusLabel(nextStatus)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Sin pedidos</Text>
            <Text style={styles.emptyText}>
              {statusFilter === 'all'
                ? 'Los pedidos aparecerán aquí cuando lleguen'
                : `No hay pedidos con estado "${STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}"`
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  filterContainer: { maxHeight: 56 },
  filterContent: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e293b', marginRight: 8 },
  filterChipActive: { backgroundColor: '#ff6b00' },
  filterChipText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
  filterChipTextActive: { color: '#ffffff' },
  scrollView: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 40 },
  orderCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderInfo: { flex: 1 },
  orderNumber: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  orderMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
  orderStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  orderStatusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  orderStatusText: { fontSize: 12, fontWeight: '600' },
  itemsContainer: { backgroundColor: '#0f172a', borderRadius: 12, padding: 12, marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  itemQty: { fontSize: 14, fontWeight: '700', color: '#ff6b00', width: 28 },
  itemName: { flex: 1, fontSize: 14, color: '#e2e8f0' },
  itemPrice: { fontSize: 14, color: '#94a3b8', marginLeft: 8 },
  moreItems: { fontSize: 12, color: '#64748b', marginTop: 4, textAlign: 'center' },
  orderNotes: { fontSize: 13, color: '#f59e0b', marginBottom: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  orderFooterRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  orderTime: { fontSize: 12, color: '#64748b' },
  advanceButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  advanceButtonText: { fontSize: 12, fontWeight: '600' },
  cancelButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.15)' },
  cancelButtonText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  emptyCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 32, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
});