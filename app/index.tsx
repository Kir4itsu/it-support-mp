import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types/ticket';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Plus,
  Search,
  Settings,
  Ticket as TicketIcon,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const router = useRouter();
  const { userIdentity } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DIAJUKAN':
        return AlertCircle;
      case 'DISETUJUI':
        return CheckCircle2;
      case 'DIPROSES':
        return Clock;
      case 'SELESAI':
        return CheckCircle2;
      default:
        return AlertCircle;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && ticket.status !== 'SELESAI') ||
      (filterStatus === 'COMPLETED' && ticket.status === 'SELESAI');

    return matchesSearch && matchesFilter;
  });

  const activeTickets = tickets.filter(t => t.status !== 'SELESAI').length;
  const completedTickets = tickets.filter(t => t.status === 'SELESAI').length;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.welcomeText}>Selamat Datang 👋</Text>
                <Text style={styles.userName}>{userIdentity?.nama || 'Mahasiswa'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => router.push('/admin/login')}
              >
                <Settings size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <TicketIcon size={18} color="#fff" />
                </View>
                <View style={styles.quickStatText}>
                  <Text style={styles.quickStatNumber}>{tickets.length}</Text>
                  <Text style={styles.quickStatLabel}>Total</Text>
                </View>
              </View>
              
              <View style={styles.quickStatDivider} />
              
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(251, 191, 36, 0.3)' }]}>
                  <Clock size={18} color="#fbbf24" />
                </View>
                <View style={styles.quickStatText}>
                  <Text style={styles.quickStatNumber}>{activeTickets}</Text>
                  <Text style={styles.quickStatLabel}>Aktif</Text>
                </View>
              </View>
              
              <View style={styles.quickStatDivider} />
              
              <View style={styles.quickStatItem}>
                <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(34, 197, 94, 0.3)' }]}>
                  <CheckCircle2 size={18} color="#22c55e" />
                </View>
                <View style={styles.quickStatText}>
                  <Text style={styles.quickStatNumber}>{completedTickets}</Text>
                  <Text style={styles.quickStatLabel}>Selesai</Text>
                </View>
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
          {/* Create Ticket Button */}
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
              <View style={styles.createButtonIcon}>
                <Plus size={24} color="#fff" />
              </View>
              <View style={styles.createButtonTextContainer}>
                <Text style={styles.createButtonText}>Buat Tiket Baru</Text>
                <Text style={styles.createButtonSubtext}>Laporkan masalah IT Anda</Text>
              </View>
              <ChevronRight size={24} color="rgba(255, 255, 255, 0.8)" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Search and Filter */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchContainer}>
              <Search size={18} color={theme.colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Cari tiket atau kategori..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.colors.textLight}
              />
            </View>

            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === 'ALL' && styles.filterChipActive
                ]}
                onPress={() => setFilterStatus('ALL')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'ALL' && styles.filterChipTextActive
                ]}>
                  Semua
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === 'ACTIVE' && styles.filterChipActive
                ]}
                onPress={() => setFilterStatus('ACTIVE')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'ACTIVE' && styles.filterChipTextActive
                ]}>
                  Aktif ({activeTickets})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === 'COMPLETED' && styles.filterChipActive
                ]}
                onPress={() => setFilterStatus('COMPLETED')}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'COMPLETED' && styles.filterChipTextActive
                ]}>
                  Selesai ({completedTickets})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tickets List */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Tiket</Text>
            {filteredTickets.length > 0 && (
              <Text style={styles.sectionSubtitle}>
                {filteredTickets.length} tiket ditemukan
              </Text>
            )}
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Memuat data...</Text>
            </View>
          ) : filteredTickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <TicketIcon size={48} color={theme.colors.textLight} />
              </View>
              <Text style={styles.emptyTitle}>
                {searchQuery || filterStatus !== 'ALL' ? 'Tidak ada tiket ditemukan' : 'Belum ada tiket'}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery || filterStatus !== 'ALL' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Buat tiket pertama Anda untuk mendapatkan bantuan IT'}
              </Text>
            </View>
          ) : (
            <View style={styles.ticketList}>
              {filteredTickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status);
                return (
                  <TouchableOpacity
                    key={ticket.id}
                    style={styles.ticketCard}
                    onPress={() => router.push(`/ticket/${ticket.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ticketCardHeader}>
                      <View style={styles.ticketCardLeft}>
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
                      </View>
                      <View style={styles.ticketCardRight}>
                        <View 
                          style={[
                            styles.statusBadgeNew,
                            { backgroundColor: `${getStatusColor(ticket.status)}15` }
                          ]}
                        >
                          <StatusIcon 
                            size={14} 
                            color={getStatusColor(ticket.status)}
                            style={styles.statusIcon}
                          />
                          <Text 
                            style={[
                              styles.statusTextNew,
                              { color: getStatusColor(ticket.status) }
                            ]}
                          >
                            {ticket.status}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.ticketSubject} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                    <Text style={styles.ticketDescription} numberOfLines={2}>
                      {ticket.description}
                    </Text>

                    <View style={styles.ticketFooter}>
                      <View style={styles.ticketFooterLeft}>
                        <Clock size={14} color={theme.colors.textLight} />
                        <Text style={styles.ticketDate}>
                          {format(new Date(ticket.created_at), 'dd MMM yyyy, HH:mm')}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={theme.colors.textLight} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
        <View style={styles.bottomSpacer} />
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
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    backdropFilter: 'blur(10px)',
  },
  quickStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  quickStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatText: {
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: theme.spacing.xs,
  },
  content: {
    flex: 1,
    marginTop: -theme.spacing.lg,
  },
  contentPadding: {
    padding: theme.spacing.lg,
  },
  createButton: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  createButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonTextContainer: {
    flex: 1,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  createButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchFilterContainer: {
    marginBottom: theme.spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  filterChips: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
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
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  ticketCardLeft: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flex: 1,
  },
  ticketCardRight: {
    marginLeft: theme.spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusTextNew: {
    fontSize: 11,
    fontWeight: '700',
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  ticketDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  ticketFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketDate: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});
