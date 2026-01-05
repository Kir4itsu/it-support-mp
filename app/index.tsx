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
    ChevronRight,
    AlertCircle,
    Search,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const router = useRouter();
  const { userIdentity } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [activeTab, setActiveTab] = useState<'home' | 'info' | 'profile'>('home');
  const [infoModalVisible, setInfoModalVisible] = useState(false);

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

  // Render Home Tab
  const renderHomeContent = () => (
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
                const statusColor = getStatusColor(ticket.status);
                const category
            </View>
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );

  // Render Info Tab
  const renderInfoContent = () => (
    <ScrollView 
      style={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentPadding}>
        <View style={styles.infoHeader}>
          <View style={styles.infoHeaderIcon}>
            <Book size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.infoHeaderTitle}>Panduan Penggunaan</Text>
          <Text style={styles.infoHeaderSubtitle}>
            Pelajari cara menggunakan aplikasi IT Support Kampus
          </Text>
        </View>

        {/* Step by Step Guide */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.infoCardTitle}>Membuat Tiket Baru</Text>
          </View>
          <Text style={styles.infoCardDescription}>
            Tap tombol "Buat Tiket Baru" di halaman utama untuk melaporkan masalah IT Anda.
          </Text>
          <View style={styles.infoSteps}>
            <Text style={styles.infoStep}>• Pilih kategori masalah (Wifi, Account, Hardware, Software)</Text>
            <Text style={styles.infoStep}>• Isi data pribadi (Nama, Email, No HP)</Text>
            <Text style={styles.infoStep}>• Tulis judul dan deskripsi masalah dengan jelas</Text>
            <Text style={styles.infoStep}>• Klik "Kirim Tiket"</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.infoCardTitle}>Melacak Status Tiket</Text>
          </View>
          <Text style={styles.infoCardDescription}>
            Pantau progress tiket Anda melalui status yang tersedia:
          </Text>
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusName}>DIAJUKAN</Text>
                <Text style={styles.statusDesc}>Tiket baru dibuat, menunggu persetujuan</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: '#3b82f6' }]} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusName}>DISETUJUI</Text>
                <Text style={styles.statusDesc}>Tiket disetujui, akan segera diproses</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusName}>DIPROSES</Text>
                <Text style={styles.statusDesc}>Tim IT sedang menangani masalah</Text>
              </View>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
              <View style={styles.statusInfo}>
                <Text style={styles.statusName}>SELESAI</Text>
                <Text style={styles.statusDesc}>Masalah telah diselesaikan</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.infoCardTitle}>Filter & Pencarian</Text>
          </View>
          <Text style={styles.infoCardDescription}>
            Gunakan fitur filter dan pencarian untuk menemukan tiket dengan cepat:
          </Text>
          <View style={styles.infoSteps}>
            <Text style={styles.infoStep}>• Filter "Semua" menampilkan semua tiket</Text>
            <Text style={styles.infoStep}>• Filter "Aktif" menampilkan tiket yang sedang berjalan</Text>
            <Text style={styles.infoStep}>• Filter "Selesai" menampilkan tiket yang sudah selesai</Text>
            <Text style={styles.infoStep}>• Gunakan search bar untuk mencari berdasarkan judul atau kategori</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.infoCardTitle}>Tips Penting</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <CheckCircle2 size={20} color={theme.colors.success} />
              <Text style={styles.tipText}>Jelaskan masalah dengan detail dan jelas</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle2 size={20} color={theme.colors.success} />
              <Text style={styles.tipText}>Pilih kategori yang sesuai dengan masalah</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle2 size={20} color={theme.colors.success} />
              <Text style={styles.tipText}>Pastikan data kontak yang diisi benar</Text>
            </View>
            <View style={styles.tipItem}>
              <CheckCircle2 size={20} color={theme.colors.success} />
              <Text style={styles.tipText}>Cek status tiket secara berkala</Text>
            </View>
          </View>
        </View>

        <View style={styles.contactCard}>
          <HelpCircle size={28} color={theme.colors.primary} />
          <Text style={styles.contactTitle}>Butuh Bantuan Lebih?</Text>
          <Text style={styles.contactDescription}>
            Hubungi tim IT kami melalui admin dashboard atau kontak langsung
          </Text>
        </View>
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  // Render Profile Tab
  const renderProfileContent = () => (
    <ScrollView 
      style={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentPadding}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <User size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.profileName}>{userIdentity?.nama || 'Mahasiswa'}</Text>
          <Text style={styles.profileEmail}>{userIdentity?.email || 'email@example.com'}</Text>
        </View>

        <View style={styles.profileStats}>
          <View style={styles.profileStatCard}>
            <TicketIcon size={24} color={theme.colors.primary} />
            <Text style={styles.profileStatNumber}>{tickets.length}</Text>
            <Text style={styles.profileStatLabel}>Total Tiket</Text>
          </View>
          <View style={styles.profileStatCard}>
            <Clock size={24} color={theme.colors.warning} />
            <Text style={styles.profileStatNumber}>{activeTickets}</Text>
            <Text style={styles.profileStatLabel}>Sedang Aktif</Text>
          </View>
          <View style={styles.profileStatCard}>
            <CheckCircle2 size={24} color={theme.colors.success} />
            <Text style={styles.profileStatNumber}>{completedTickets}</Text>
            <Text style={styles.profileStatLabel}>Selesai</Text>
          </View>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Pengaturan</Text>
          
          <TouchableOpacity 
            style={styles.profileMenuItem}
            onPress={() => router.push('/admin/login')}
          >
            <View style={styles.profileMenuIcon}>
              <Settings size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.profileMenuText}>Admin Dashboard</Text>
            <ChevronRight size={20} color={theme.colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.profileMenuItem}
            onPress={() => setActiveTab('info')}
          >
            <View style={styles.profileMenuIcon}>
              <HelpCircle size={20} color={theme.colors.primary} />
            </View>
            <Text style={styles.profileMenuText}>Panduan Penggunaan</Text>
            <ChevronRight size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Smartphone size={20} color={theme.colors.textLight} />
          <Text style={styles.appInfoText}>IT Support Kampus v1.0</Text>
        </View>
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

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
                <Text style={styles.welcomeText}>
                  {activeTab === 'home' && '👋 Selamat Datang'}
                  {activeTab === 'info' && '📚 Panduan'}
                  {activeTab === 'profile' && '👤 Profil'}
                </Text>
                <Text style={styles.userName}>
                  {activeTab === 'home' && (userIdentity?.nama || 'Mahasiswa')}
                  {activeTab === 'info' && 'Cara Penggunaan'}
                  {activeTab === 'profile' && 'Informasi Akun'}
                </Text>
              </View>
              {activeTab === 'home' && (
                <TouchableOpacity 
                  style={styles.adminButton}
                  onPress={() => router.push('/admin/login')}
                >
                  <Settings size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            
            {/* Quick Stats - only show on home */}
            {activeTab === 'home' && (
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
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab Content */}
      {activeTab === 'home' && renderHomeContent()}
      {activeTab === 'info' && renderInfoContent()}
      {activeTab === 'profile' && renderProfileContent()}

      {/* Bottom Navigation */}
      <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <Home 
            size={24} 
            color={activeTab === 'home' ? theme.colors.primary : theme.colors.textLight}
            fill={activeTab === 'home' ? theme.colors.primary : 'none'}
          />
          <Text style={[
            styles.navLabel,
            activeTab === 'home' && styles.navLabelActive
          ]}>
            Beranda
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push('/create-ticket')}
        >
          <View style={styles.navCreateButton}>
            <Plus size={28} color="#fff" />
          </View>
          <Text style={styles.navLabel}>Buat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('info')}
        >
          <Info 
            size={24} 
            color={activeTab === 'info' ? theme.colors.primary : theme.colors.textLight}
            fill={activeTab === 'info' ? theme.colors.primary : 'none'}
          />
          <Text style={[
            styles.navLabel,
            activeTab === 'info' && styles.navLabelActive
          ]}>
            Info
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
        >
          <User 
            size={24} 
            color={activeTab === 'profile' ? theme.colors.primary : theme.colors.textLight}
            fill={activeTab === 'profile' ? theme.colors.primary : 'none'}
          />
          <Text style={[
            styles.navLabel,
            activeTab === 'profile' && styles.navLabelActive
          ]}>
            Profil
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
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
  // Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    ...theme.shadows.lg,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  navLabel: {
    fontSize: 11,
    color: theme.colors.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  navCreateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    ...theme.shadows.lg,
  },
  // Info Tab Styles
  infoHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  infoHeaderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  infoHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoHeaderSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  infoCardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  infoSteps: {
    gap: theme.spacing.sm,
  },
  infoStep: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    paddingLeft: theme.spacing.sm,
  },
  statusList: {
    gap: theme.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statusDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  tipsList: {
    gap: theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: theme.colors.lavender,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  contactDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Profile Tab Styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  profileStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  profileStatCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  profileStatNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginVertical: theme.spacing.sm,
  },
  profileStatLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  profileMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMenuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
  },
  appInfoText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
});
