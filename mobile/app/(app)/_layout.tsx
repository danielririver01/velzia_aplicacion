import { Redirect, Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores';
import { View, StyleSheet } from 'react-native';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#ffb690',
        tabBarInactiveTintColor: '#71717a',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="dashboard"
              size={24}
              color={color}
              style={focused ? { opacity: 1 } : { opacity: 0.6 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/index"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="receipt-long"
              size={24}
              color={color}
              style={focused ? { opacity: 1 } : { opacity: 0.6 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders/create"
        options={{
          title: 'Nuevo Pedido',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="add-shopping-cart"
              size={24}
              color={color}
              style={focused ? { opacity: 1 } : { opacity: 0.6 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons
              name="fastfood"
              size={24}
              color={color}
              style={focused ? { opacity: 1 } : { opacity: 0.6 }}
            />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="categories" options={{ href: null }} />
      <Tabs.Screen name="menu" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="tables" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#291d16',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarLabel: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tabBarItem: {
    gap: 4,
  },
});