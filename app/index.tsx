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
  Info,
  Plus,
  Search,
  Settings,
  Ticket as TicketIcon,
  TrendingUp,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
        return '#f59e0b';
      case 'DISETUJUI':
        return '#3b82f6';
      case 'DIPROSES':
        return '#8b5cf6';
      case 'SELESAI':
        return '#10b981';
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
        return Clock;
      case 'DISETUJUI':
        return CheckCircle2;
      case 'DIPROSES':
        return Zap;
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
      {/* Enhanced Header with Gradient */}
      <LinearGradient
        colors={['#7c3aed', '#6d28d9', '#5b21b6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            {/* Header Top */}
            <View style={styles.headerTop}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.welcomeText}>Selamat Datang 👋</Text>
                <Text style={styles.userName}>{userIdentity?.nama || 'Mahasiswa'}</Text>
                <Text style={styles.userSubtext}>Mari kelola tiket IT Anda</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={styles.infoButton}
                  onPress={() => router.push('/system-info')}
                  activeOpacity={0.7}
                >
                  <Info size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.adminButton}
                  onPress={() => router.push('/admin/login')}
                  activeOpacity={0.7}
                >
                  <Settings size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Enhanced Quick Stats */}
            <View style={styles.quickStatsContainer}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.quickStats}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.quickStatItem}>
                  <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                    <TicketIcon size={20} color="#fff" />
                  </View>
                  <View style={styles.quickStatText}>
                    <Text style={styles.quickStatNumber}>{tickets.length}</Text>
                    <Text style={styles.quickStatLabel}>Total Tiket</Text>
                  </View>
                </View>
                
                <View style={styles.quickStatDivider} />
                
                <View style={styles.quickStatItem}>
                  <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(251, 191, 36, 0.35)' }]}>
                    <Clock size={20} color="#fbbf24" />
                  </View>
                  <View style={styles.quickStatText}>
                    <Text style={styles.quickStatNumber}>{activeTickets}</Text>
                    <Text style={styles.quickStatLabel}>Sedang Aktif</Text>
                  </View>
                </View>
                
                <View style={styles.quickStatDivider} />
                
                <View style={styles.quickStatItem}>
                  <View style={[styles.quickStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.35)' }]}>
                    <CheckCircle2 size={20} color="#10b981" />
                  </View>
                  <View style={styles.quickStatText}>
                    <Text style={styles.quickStatNumber}>{completedTickets}</Text>
                    <Text style={styles.quickStatLabel}>Selesai</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentPadding}>
          {/* Enhanced Create Ticket Button */}
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/create-ticket')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#7c3aed', '#6d28d9']}
              style={styles.createButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.createButtonLeft}>
                <View style={styles.createButtonIcon}>
                  <Plus size={26} color="#fff" strokeWidth={2.5} />
                </View>
                <View style={styles.createButtonTextContainer}>
                  <Text style={styles.createButtonText}>Buat Tiket Baru</Text>
                  <Text style={styles.createButtonSubtext}>Laporkan masalah IT Anda</Text>
                </View>
              </View>
              <View style={styles.createButtonArrow}>
                <ChevronRight size={24} color="rgba(255, 255, 255, 0.9)" strokeWidth={2.5} />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* System Info Button */}
          <TouchableOpacity 
            style={styles.systemInfoButton}
            onPress={() => router.push('/system-info')}
            activeOpacity={0.85}
          >
            <View style={styles.systemInfoContent}>
              <View style={styles.systemInfoLeft}>
                <View style={styles.systemInfoIcon}>
                  <Info size={22} color="#7c3aed" strokeWidth={2.5} />
                </View>
                <View style={styles.systemInfoTextContainer}>
                  <Text style={styles.systemInfoText}>Tentang Sistem</Text>
                  <Text style={styles.systemInfoSubtext}>Pelajari cara kerja sistem tiket</Text>
                </View>
              </View>
              <ChevronRight size={22} color="#7c3aed" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* Enhanced Search and Filter */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchWrapper}>
              <View style={styles.searchContainer}>
                <Search size={20} color="#9ca3af" strokeWidth={2} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari tiket atau kategori..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.filterChipsScroll}
              contentContainerStyle={styles.filterChips}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === 'ALL' && styles.filterChipActive
                ]}
                onPress={() => setFilterStatus('ALL')}
                activeOpacity={0.7}
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
                activeOpacity={0.7}
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
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterChipText,
                  filterStatus === 'COMPLETED' && styles.filterChipTextActive
                ]}>
                  Selesai ({completedTickets})
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionTitle}>Riwayat Tiket</Text>
              {filteredTickets.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{filteredTickets.length}</Text>
                </View>
              )}
            </View>
            {filteredTickets.length > 0 && (
              <TrendingUp size={20} color="#7c3aed" strokeWidth={2} />
            )}
          </View>

          {/* Enhanced Content States */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIconContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
              </View>
              <Text style={styles.loadingText}>Memuat data tiket...</Text>
              <Text style={styles.loadingSubtext}>Mohon tunggu sebentar</Text>
            </View>
          ) : filteredTickets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <LinearGradient
                colors={['#f3e8ff', '#ede9fe']}
                style={styles.emptyIconContainer}
              >
                <TicketIcon size={56} color="#7c3aed" strokeWidth={1.5} />
              </LinearGradient>
              <Text style={styles.emptyTitle}>
                {searchQuery || filterStatus !== 'ALL' ? 'Tidak ada tiket ditemukan' : 'Belum ada tiket'}
              </Text>
              <Text style={styles.emptyDescription}>
                {searchQuery || filterStatus !== 'ALL' 
                  ? 'Coba ubah filter atau kata kunci pencarian Anda'
                  : 'Buat tiket pertama Anda untuk mendapatkan bantuan IT dengan cepat'}
              </Text>
              {!searchQuery && filterStatus === 'ALL' && (
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/create-ticket')}
                  activeOpacity={0.8}
                >
                  <Plus size={18} color="#7c3aed" strokeWidth={2.5} />
                  <Text style={styles.emptyButtonText}>Buat Tiket Sekarang</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.ticketList}>
              {filteredTickets.map((ticket, index) => {
                const StatusIcon = getStatusIcon(ticket.status);
                return (
                  <TouchableOpacity
                    key={ticket.id}
                    style={[
                      styles.ticketCard,
                      { 
                        transform: [{ scale: 1 }],
                      }
                    ]}
                    onPress={() => router.push(`/ticket/${ticket.id}`)}
                    activeOpacity={0.8}
                  >
                    {/* Card Header with Category and Status */}
                    <View style={styles.ticketCardHeader}>
                      <View style={styles.ticketCardLeft}>
                        <LinearGradient
                          colors={[
                            `${getCategoryColor(ticket.category)}25`,
                            `${getCategoryColor(ticket.category)}15`
                          ]}
                          style={styles.categoryBadge}
                        >
                          <Text 
                            style={[
                              styles.categoryText, 
                              { color: getCategoryColor(ticket.category) }
                            ]}
                          >
                            {ticket.category}
                          </Text>
                        </LinearGradient>
                      </View>
                      <View 
                        style={[
                          styles.statusBadgeNew,
                          { backgroundColor: `${getStatusColor(ticket.status)}15` }
                        ]}
                      >
                        <StatusIcon 
                          size={14} 
                          color={getStatusColor(ticket.status)}
                          strokeWidth={2.5}
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

                    {/* Card Content */}
                    <Text style={styles.ticketSubject} numberOfLines={2}>
                      {ticket.subject}
                    </Text>
                    <Text style={styles.ticketDescription} numberOfLines={2}>
                      {ticket.description}
                    </Text>

                    {/* Card Footer */}
                    <View style={styles.ticketFooter}>
                      <View style={styles.ticketFooterLeft}>
                        <Clock size={15} color="#9ca3af" strokeWidth={2} />
                        <Text style={styles.ticketDate}>
                          {format(new Date(ticket.created_at), 'dd MMM yyyy, HH:mm')}
                        </Text>
                      </View>
                      <View style={styles.ticketFooterRight}>
                        <Text style={styles.viewDetailsText}>Lihat Detail</Text>
                        <ChevronRight size={18} color="#7c3aed" strokeWidth={2.5} />
                      </View>
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
    backgroundColor: '#faf5ff',
  },
  header: {
    paddingBottom: 28,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  adminButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quickStatsContainer: {
    marginTop: 8,
  },
  quickStats: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  quickStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatText: {
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    marginTop: -16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentPadding: {
    padding: 20,
  },
  createButton: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  createButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  createButtonIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createButtonTextContainer: {
    flex: 1,
  },
  createButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  createButtonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  createButtonArrow: {
    marginLeft: 12,
  },
  systemInfoButton: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  systemInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  systemInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  systemInfoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  systemInfoTextContainer: {
    flex: 1,
  },
  systemInfoText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  systemInfoSubtext: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  searchFilterContainer: {
    marginBottom: 24,
  },
  searchWrapper: {
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  filterChipsScroll: {
    flexGrow: 0,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  filterChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6b7280',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7c3aed',
  },
  ticketList: {
    gap: 16,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  ticketCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  ticketCardLeft: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusBadgeNew: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusTextNew: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  ticketSubject: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  ticketDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 16,
    fontWeight: '500',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3e8ff',
  },
  ticketFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ticketDate: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  ticketFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7c3aed',
  },
  bottomSpacer: {
    height: 32,
  },
});
