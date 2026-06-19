import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDashboardStore, useAuthStore } from '../../../src/stores';
import { SkeletonStat } from '../../../src/components/SkeletonLoader';

export default function DashboardScreen() {
  const { overview, isLoading, fetchOverview, toggleStatus } = useDashboardStore();
  const { user, logout } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOverview();
    setRefreshing(false);
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    const ok = await toggleStatus();
    if (ok) await fetchOverview();
    setToggling(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(amount);
  };

  const isOpen = overview?.restaurant?.is_open;
  const stats = overview?.stats;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffb690" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, {user?.username || 'usuario'}</Text>
            <Text style={styles.restoName}>{overview?.restaurant?.name || 'Restaurante'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.statusBadge, { borderColor: isOpen ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }]}
              onPress={handleToggleStatus}
              disabled={toggling}
            >
              <View style={[styles.statusDot, { backgroundColor: isOpen ? '#10b981' : '#ef4444' }]} />
              <Text style={styles.statusText}>{isOpen ? 'ABIERTO' : 'CERRADO'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <MaterialIcons name="logout" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Metrics */}
        <Text style={styles.sectionTitle}>Hoy</Text>
        <View style={styles.metricsGrid}>
          {isLoading && !overview ? (
            <><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
          ) : (
            <>
              <View style={[styles.metricCard, (stats?.pending || 0) > 0 && styles.metricCardHighlight]}>
                <Text style={[styles.metricValue, (stats?.pending || 0) > 0 && styles.metricValueHighlight]}>
                  {stats?.pending || 0}
                </Text>
                <Text style={styles.metricLabel}>PENDIENTES</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{stats?.delivered || 0}</Text>
                <Text style={styles.metricLabel}>ENTREGADOS</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={[styles.metricValue, { color: '#10b981' }]}>
                  {formatCurrency(stats?.today_sales_cop || 0).replace('$', '').replace(/\s/g, '')}
                </Text>
                <Text style={styles.metricLabel}>VENTAS</Text>
              </View>
            </>
          )}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/orders/create')}>
            <LinearGradient colors={['#f2460d', '#f97316']} style={styles.actionGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <MaterialIcons name="add-shopping-cart" size={28} color="#fff" />
            </LinearGradient>
            <Text style={styles.actionText}>Nuevo Pedido</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/orders')}>
            <View style={[styles.actionIconBg, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <MaterialIcons name="receipt-long" size={28} color="#3b82f6" />
            </View>
            <Text style={styles.actionText}>Ver Pedidos</Text>
          </TouchableOpacity>
        </View>

        {/* Performance status */}
        <LinearGradient
          colors={['#141414', '#1c110b']}
          style={styles.performanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.performanceContent}>
            <MaterialIcons
              name={isOpen ? (stats?.pending ? 'notifications-active' : 'check-circle') : 'store'}
              size={28}
              color="#ffb690"
            />
            <View style={styles.performanceText}>
              <Text style={styles.performanceTitle}>
                {!isOpen ? 'Restaurante cerrado'
                  : stats?.pending ? `${stats.pending} pedido${stats.pending > 1 ? 's' : ''} pendiente${stats.pending > 1 ? 's' : ''}`
                  : 'Todo al día'}
              </Text>
              <Text style={styles.performanceSubtitle}>
                {!isOpen ? 'Abre el restaurante para recibir pedidos'
                  : stats?.pending ? 'Revisa los pedidos pendientes'
                  : 'Sin pedidos pendientes'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  greeting: { fontFamily: 'Inter', fontSize: 14, fontWeight: '600', color: '#71717a' },
  restoName: { fontFamily: 'Outfit', fontSize: 24, fontWeight: '900', letterSpacing: -1.2, color: '#f6ded3', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#141414', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: 'Inter', fontSize: 9, fontWeight: '900', letterSpacing: 2, color: '#f6ded3' },
  logoutButton: { padding: 8 },
  sectionTitle: { fontFamily: 'Outfit', fontSize: 20, fontWeight: '700', color: '#f6ded3', marginBottom: 16, marginTop: 8 },
  metricsGrid: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  metricCard: {
    flex: 1, backgroundColor: 'rgba(28,17,11,0.4)', borderRadius: 12, padding: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  metricCardHighlight: {
    borderColor: 'rgba(249,115,22,0.3)', shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
  },
  metricValue: { fontFamily: 'Outfit', fontSize: 26, fontWeight: '900', letterSpacing: -1.5, color: '#f6ded3', marginBottom: 4 },
  metricValueHighlight: { color: '#ffb690', textShadowColor: 'rgba(249,115,22,0.3)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  metricLabel: { fontFamily: 'Inter', fontSize: 9, fontWeight: '900', letterSpacing: 2.5, color: '#e0c0b1' },
  actionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  actionCard: {
    flex: 1, backgroundColor: 'rgba(28,17,11,0.4)', borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  actionGradient: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionIconBg: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  actionText: { fontFamily: 'Inter', fontSize: 11, fontWeight: '700', color: '#e0c0b1', textAlign: 'center' },
  performanceCard: { borderRadius: 12, padding: 20, borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', overflow: 'hidden' },
  performanceContent: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  performanceText: { flex: 1, gap: 4 },
  performanceTitle: { fontFamily: 'Outfit', fontSize: 16, fontWeight: '900', color: '#f6ded3' },
  performanceSubtitle: { fontFamily: 'Inter', fontSize: 13, fontWeight: '500', color: '#e0c0b1', lineHeight: 18 },
});