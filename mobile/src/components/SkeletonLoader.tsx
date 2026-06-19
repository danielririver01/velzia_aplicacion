import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
      <Skeleton width="100%" height={12} style={{ marginTop: 12 }} />
    </View>
  );
}

export function SkeletonStat() {
  return (
    <View style={styles.statCard}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <Skeleton width="60%" height={24} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={12} style={{ marginTop: 6 }} />
    </View>
  );
}

export function SkeletonOrder() {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Skeleton width={80} height={16} />
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={12} style={{ marginTop: 12 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 6 }} />
      <View style={styles.orderFooter}>
        <Skeleton width={100} height={20} />
        <Skeleton width={80} height={32} borderRadius={16} />
      </View>
    </View>
  );
}

export function SkeletonProduct() {
  return (
    <View style={styles.productCard}>
      <Skeleton width={64} height={64} borderRadius={12} />
      <View style={styles.productInfo}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function SkeletonCategory() {
  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Skeleton width="60%" height={16} />
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>
      <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
}

export function SkeletonTable() {
  return (
    <View style={styles.tableCard}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <Skeleton width="70%" height={16} style={{ marginTop: 12 }} />
      <Skeleton width={60} height={24} borderRadius={12} style={{ marginTop: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#1e2a4a',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  orderCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  categoryCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
});
