import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types/ticket';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    CheckCircle2,
    Clock,
    Plus,
    Settings,
    Ticket as TicketIcon,
} from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StudentDashboard() {
  const router = useRouter();
  const { userIdentity } = useApp();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-tickets', userIdentity?.email],
    queryFn: async () => {
      if (!userIdentity?.email) return [];
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('email', userIdentity.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!userIdentity?.email,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DIAJUKAN':
        return theme.colors.warning;
      case 'DISETUJUI':
        return '#3b82f6';
      case 'DIPROSES':
        return theme.colors.primary;
      case 'SELESAI':
        return theme.colors.success;
      default:
        return theme.colors.textLight;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Wifi':
        return '#ec4899';
      case 'Account':
        return '#8b5cf6';
      case 'Hardware':
        return '#f59e0b';
      case 'Software':
        return '#06b6d4';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.welcomeText}>Selamat Datang</Text>
                <Text style={styles.headerTitle}>IT Support Kampus</Text>
              </View>
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => router.push('/admin/login')}
              >
                <Settings size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <TicketIcon size={20} color={theme.colors.primary} />
                </View>
                <Text style={styles.statNumber}>{tickets.length}</Text>
                <Text style={styles.statLabel}>Total Tiket</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Clock size={20} color={theme.colors.warning} />
                </View>
                <Text style={styles.statNumber}>
                  {tickets.filter(t => t.status !== 'SELESAI').length}
                </Text>
                <Text style={styles.statLabel}>Dalam Proses</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <CheckCircle2 size={20} color={theme.colors.success} />
                </View>
                <Text style={styles.statNumber}>
                  {tickets.filter(t => t.status === 'SELESAI').length}
                </Text>
                <Text style={styles.statLabel}>Selesai</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentPadding}>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/create-ticket')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={24} color="#fff" />
              <Text style={styles.createButtonText}>Buat Tiket Baru</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Tiket</Text>
            {tickets.length > 0 && (
              <Text style={styles.sectionSubtitle}>
                {tickets.length} tiket ditemukan
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
          ) : tickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <TicketIcon size={48} color={theme.colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>Belum ada tiket</Text>
              <Text style={styles.emptyDescription}>
                Buat tiket pertama Anda untuk mendapatkan bantuan IT
              </Text>
            </View>
          ) : (
            <View style={styles.ticketList}>
              {tickets.map((ticket) => (
                <TouchableOpacity
                  key={ticket.id}
                  style={styles.ticketCard}
                  onPress={() => router.push(`/ticket/${ticket.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketHeaderLeft}>
                      <View 
                        style={[
                          styles.categoryBadge, 
                          { backgroundColor: `${getCategoryColor(ticket.category)}20` }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.categoryText, 
                            { color: getCategoryColor(ticket.category) }
                          ]}
                        >
                          {ticket.category}
                        </Text>
                      </View>
                      <View 
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(ticket.status)}20` }
                        ]}
                      >
                        <View 
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(ticket.status) }
                          ]}
                        />
                        <Text 
                          style={[
                            styles.statusText,
                            { color: getStatusColor(ticket.status) }
                          ]}
                        >
                          {ticket.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.ticketSubject} numberOfLines={1}>
                    {ticket.subject}
                  </Text>
                  <Text style={styles.ticketDescription} numberOfLines={2}>
                    {ticket.description}
                  </Text>

                  <View style={styles.ticketFooter}>
                    <Text style={styles.ticketDate}>
                      {format(new Date(ticket.created_at), 'dd MMM yyyy, HH:mm')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lavenderLight,
  },
  header: {
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  adminButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    padding: theme.spacing.lg,
  },
  createButton: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ticketList: {
    gap: theme.spacing.md,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ticketHeaderLeft: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  ticketDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  ticketFooter: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
  },
  ticketDate: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});
