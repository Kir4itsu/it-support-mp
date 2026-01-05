import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import type { Ticket, TicketStatus } from '@/types/ticket';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  Check,
  Edit,
  Filter,
  LogOut,
  Search,
  Trash2,
  X,
  Upload,
  Download,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_OPTIONS: TicketStatus[] = ['DIAJUKAN', 'DISETUJUI', 'DIPROSES', 'SELESAI'];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, loading } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedStatus, setEditedStatus] = useState<TicketStatus>('DIAJUKAN');
  const [adminNotes, setAdminNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/admin/login' as any);
    }
  }, [session, loading, router]);

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Ticket[];
    },
    enabled: !!session,
  });

  // Export CSV Function
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Prepare CSV content
      const headers = [
        'ID',
        'Nama',
        'Email',
        'NIM',
        'Kategori',
        'Subjek',
        'Deskripsi',
        'Status',
        'Catatan Admin',
        'Tanggal Dibuat',
        'Tanggal Diperbarui'
      ];

      const csvRows = [headers.join(',')];

      tickets.forEach(ticket => {
        const row = [
          ticket.id,
          `"${ticket.nama.replace(/"/g, '""')}"`,
          ticket.email,
          ticket.nim,
          ticket.category,
          `"${ticket.subject.replace(/"/g, '""')}"`,
          `"${ticket.description.replace(/"/g, '""')}"`,
          ticket.status,
          ticket.admin_notes ? `"${ticket.admin_notes.replace(/"/g, '""')}"` : '',
          format(new Date(ticket.created_at), 'yyyy-MM-dd HH:mm:ss'),
          format(new Date(ticket.updated_at), 'yyyy-MM-dd HH:mm:ss')
        ];
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');

      // Save to file
      const fileName = `tickets_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Tiket CSV',
          UTI: 'public.comma-separated-values-text',
        });
      } else {
        Alert.alert('Error', 'Sharing tidak tersedia di perangkat ini');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Berhasil', `${tickets.length} tiket berhasil diekspor`);
    } catch (error) {
      console.error('Export error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Gagal mengekspor data');
    } finally {
      setIsExporting(false);
    }
  };

  // Import CSV Function
  const handleImportCSV = async () => {
    try {
      setIsImporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Pick CSV file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/comma-separated-values',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsImporting(false);
        return;
      }

      const fileUri = result.assets[0].uri;

      // Read file content
      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Parse CSV
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      // Validate headers
      const requiredHeaders = ['Nama', 'Email', 'NIM', 'Kategori', 'Subjek', 'Deskripsi', 'Status'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

      if (missingHeaders.length > 0) {
        Alert.alert('Error', `Header CSV tidak lengkap. Missing: ${missingHeaders.join(', ')}`);
        setIsImporting(false);
        return;
      }

      // Confirm import
      Alert.alert(
        'Konfirmasi Import',
        `Ditemukan ${lines.length - 1} baris data. Lanjutkan import?`,
        [
          { text: 'Batal', style: 'cancel', onPress: () => setIsImporting(false) },
          {
            text: 'Import',
            onPress: async () => {
              try {
                let successCount = 0;
                let errorCount = 0;

                for (let i = 1; i < lines.length; i++) {
                  const line = lines[i].trim();
                  if (!line) continue;

                  // Parse CSV row (handle quoted values)
                  const values: string[] = [];
                  let current = '';
                  let inQuotes = false;

                  for (let j = 0; j < line.length; j++) {
                    const char = line[j];
                    if (char === '"') {
                      inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                      values.push(current.trim().replace(/^"|"$/g, ''));
                      current = '';
                    } else {
                      current += char;
                    }
                  }
                  values.push(current.trim().replace(/^"|"$/g, ''));

                  // Create ticket object
                  const ticketData: any = {};
                  headers.forEach((header, index) => {
                    ticketData[header] = values[index] || '';
                  });

                  // Validate required fields
                  if (!ticketData.Nama || !ticketData.Email || !ticketData.Subjek) {
                    errorCount++;
                    continue;
                  }

                  // Insert to database
                  const { error } = await supabase.from('tickets').insert({
                    nama: ticketData.Nama,
                    email: ticketData.Email,
                    nim: ticketData.NIM,
                    category: ticketData.Kategori || 'Lainnya',
                    subject: ticketData.Subjek,
                    description: ticketData.Deskripsi || '',
                    status: (ticketData.Status as TicketStatus) || 'DIAJUKAN',
                    admin_notes: ticketData['Catatan Admin'] || null,
                  });

                  if (error) {
                    console.error('Insert error:', error);
                    errorCount++;
                  } else {
                    successCount++;
                  }
                }

                // Refresh data
                queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  'Import Selesai',
                  `Berhasil: ${successCount} tiket\nGagal: ${errorCount} tiket`
                );
              } catch (error) {
                console.error('Import error:', error);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Error', 'Gagal mengimpor data');
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Import error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Gagal membaca file CSV');
      setIsImporting(false);
    }
  };

  const updateTicketMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: TicketStatus;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('tickets')
        .update({
          status,
          admin_notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setEditModalVisible(false);
      setSelectedTicket(null);
      Alert.alert('Berhasil', 'Tiket berhasil diperbarui');
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Gagal memperbarui tiket');
      console.error('Update ticket error:', error);
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      Alert.alert('Berhasil', 'Tiket berhasil dihapus');
    },
    onError: (error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Gagal menghapus tiket');
      console.error('Delete ticket error:', error);
    },
  });

  const handleLogout = async () => {
    Alert.alert('Logout', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditedStatus(ticket.status);
    setAdminNotes(ticket.admin_notes || '');
    setEditModalVisible(true);
  };

  const handleUpdateTicket = () => {
    if (selectedTicket) {
      updateTicketMutation.mutate({
        id: selectedTicket.id,
        status: editedStatus,
        notes: adminNotes,
      });
    }
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    Alert.alert(
      'Hapus Tiket',
      `Apakah Anda yakin ingin menghapus tiket "${ticket.subject}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => deleteTicketMutation.mutate(ticket.id),
        },
      ]
    );
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'ALL' || ticket.status === filterStatus;

    return matchesSearch && matchesFilter;
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return null;
  }

  const statusCounts = {
    ALL: tickets.length,
    DIAJUKAN: tickets.filter((t) => t.status === 'DIAJUKAN').length,
    DISETUJUI: tickets.filter((t) => t.status === 'DISETUJUI').length,
    DIPROSES: tickets.filter((t) => t.status === 'DIPROSES').length,
    SELESAI: tickets.filter((t) => t.status === 'SELESAI').length,
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>{session.user.email}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleImportCSV}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Upload size={20} color={theme.colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleExportCSV}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.colors.success} />
            ) : (
              <Download size={20} color={theme.colors.success} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari tiket..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textLight}
          />
        </View>
      </View>

      {/* Status Cards Grid */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={[
            styles.statCard,
            filterStatus === 'ALL' && styles.statCardActive,
          ]}
          onPress={() => setFilterStatus('ALL')}
        >
          <View style={styles.statCardContent}>
            <Text style={[
              styles.statCount,
              filterStatus === 'ALL' && styles.statCountActive
            ]}>
              {statusCounts.ALL}
            </Text>
            <Text style={[
              styles.statLabel,
              filterStatus === 'ALL' && styles.statLabelActive
            ]}>
              Semua Tiket
            </Text>
          </View>
          {filterStatus === 'ALL' && (
            <View style={[styles.statIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filterStatus === 'DIAJUKAN' && styles.statCardActive,
          ]}
          onPress={() => setFilterStatus('DIAJUKAN')}
        >
          <View style={styles.statCardContent}>
            <Text style={[
              styles.statCount,
              filterStatus === 'DIAJUKAN' && styles.statCountActive,
              { color: theme.colors.warning }
            ]}>
              {statusCounts.DIAJUKAN}
            </Text>
            <Text style={[
              styles.statLabel,
              filterStatus === 'DIAJUKAN' && styles.statLabelActive
            ]}>
              Diajukan
            </Text>
          </View>
          {filterStatus === 'DIAJUKAN' && (
            <View style={[styles.statIndicator, { backgroundColor: theme.colors.warning }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filterStatus === 'DISETUJUI' && styles.statCardActive,
          ]}
          onPress={() => setFilterStatus('DISETUJUI')}
        >
          <View style={styles.statCardContent}>
            <Text style={[
              styles.statCount,
              filterStatus === 'DISETUJUI' && styles.statCountActive,
              { color: '#3b82f6' }
            ]}>
              {statusCounts.DISETUJUI}
            </Text>
            <Text style={[
              styles.statLabel,
              filterStatus === 'DISETUJUI' && styles.statLabelActive
            ]}>
              Disetujui
            </Text>
          </View>
          {filterStatus === 'DISETUJUI' && (
            <View style={[styles.statIndicator, { backgroundColor: '#3b82f6' }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filterStatus === 'DIPROSES' && styles.statCardActive,
          ]}
          onPress={() => setFilterStatus('DIPROSES')}
        >
          <View style={styles.statCardContent}>
            <Text style={[
              styles.statCount,
              filterStatus === 'DIPROSES' && styles.statCountActive,
              { color: theme.colors.primary }
            ]}>
              {statusCounts.DIPROSES}
            </Text>
            <Text style={[
              styles.statLabel,
              filterStatus === 'DIPROSES' && styles.statLabelActive
            ]}>
              Diproses
            </Text>
          </View>
          {filterStatus === 'DIPROSES' && (
            <View style={[styles.statIndicator, { backgroundColor: theme.colors.primary }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statCard,
            filterStatus === 'SELESAI' && styles.statCardActive,
          ]}
          onPress={() => setFilterStatus('SELESAI')}
        >
          <View style={styles.statCardContent}>
            <Text style={[
              styles.statCount,
              filterStatus === 'SELESAI' && styles.statCountActive,
              { color: theme.colors.success }
            ]}>
              {statusCounts.SELESAI}
            </Text>
            <Text style={[
              styles.statLabel,
              filterStatus === 'SELESAI' && styles.statLabelActive
            ]}>
              Selesai
            </Text>
          </View>
          {filterStatus === 'SELESAI' && (
            <View style={[styles.statIndicator, { backgroundColor: theme.colors.success }]} />
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredTickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Filter size={48} color={theme.colors.textLight} />
          <Text style={styles.emptyText}>Tidak ada tiket ditemukan</Text>
        </View>
      ) : (
        <ScrollView style={styles.ticketList} showsVerticalScrollIndicator={false}>
          <View style={styles.ticketListContent}>
            {filteredTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketCard}>
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketBadges}>
                    <View
                      style={[
                        styles.categoryBadge,
                        { backgroundColor: `${getCategoryColor(ticket.category)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          { color: getCategoryColor(ticket.category) },
                        ]}
                      >
                        {ticket.category}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(ticket.status)}20` },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusColor(ticket.status) },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(ticket.status) },
                        ]}
                      >
                        {ticket.status}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description}
                </Text>

                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketInfoText}>
                    Oleh: <Text style={styles.ticketInfoBold}>{ticket.nama}</Text>
                  </Text>
                  <Text style={styles.ticketInfoText}>
                    {format(new Date(ticket.created_at), 'dd MMM yyyy, HH:mm')}
                  </Text>
                </View>

                <View style={styles.ticketActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditTicket(ticket)}
                  >
                    <Edit size={18} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonDanger]}
                    onPress={() => handleDeleteTicket(ticket)}
                  >
                    <Trash2 size={18} color={theme.colors.error} />
                    <Text style={[styles.actionButtonText, styles.actionButtonDangerText]}>
                      Hapus
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Tiket</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedTicket && (
                <>
                  <Text style={styles.modalSubject}>{selectedTicket.subject}</Text>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View style={styles.statusOptions}>
                      {STATUS_OPTIONS.map((status) => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusOption,
                            editedStatus === status && styles.statusOptionActive,
                          ]}
                          onPress={() => setEditedStatus(status)}
                        >
                          {editedStatus === status && (
                            <Check size={16} color={getStatusColor(status)} />
                          )}
                          <Text
                            style={[
                              styles.statusOptionText,
                              editedStatus === status && {
                                color: getStatusColor(status),
                                fontWeight: '600',
                              },
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Catatan Admin (Opsional)</Text>
                    <TextInput
                      style={styles.modalTextArea}
                      placeholder="Tambahkan catatan untuk mahasiswa..."
                      value={adminNotes}
                      onChangeText={setAdminNotes}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor={theme.colors.textLight}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  updateTicketMutation.isPending && styles.modalButtonDisabled,
                ]}
                onPress={handleUpdateTicket}
                disabled={updateTicketMutation.isPending}
              >
                {updateTicketMutation.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lavenderLight,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lavenderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    padding: theme.spacing.lg,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lavenderLight,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.lavenderLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statCardActive: {
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  statCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCount: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statCountActive: {
    fontSize: 30,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  statLabelActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  statIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  ticketList: {
    flex: 1,
  },
  ticketListContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  ticketHeader: {
    marginBottom: theme.spacing.md,
  },
  ticketBadges: {
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
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    marginBottom: theme.spacing.md,
  },
  ticketInfoText: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  ticketInfoBold: {
    fontWeight: '600',
    color: theme.colors.text,
  },
  ticketActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.lavender,
    gap: theme.spacing.xs,
  },
  actionButtonDanger: {
    backgroundColor: `${theme.colors.error}15`,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionButtonDangerText: {
    color: theme.colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalSubject: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
  },
  modalSection: {
    marginBottom: theme.spacing.xl,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statusOptions: {
    gap: theme.spacing.sm,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.lavenderLight,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: theme.spacing.sm,
  },
  statusOptionActive: {
    backgroundColor: theme.colors.lavender,
    borderColor: theme.colors.primary,
  },
  statusOptionText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  modalTextArea: {
    backgroundColor: theme.colors.lavenderLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: theme.colors.lavenderLight,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
