import { AlertCircle, CheckCircle, Clock, Search } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../supabaseClient';

const STATUS_COLORS = {
  DIAJUKAN: '#f59e0b',
  DISETUJUI: '#3b82f6',
  DIPROSES: '#8b5cf6',
  SELESAI: '#10b981',
  DITOLAK: '#ef4444'
};

export default function TrackTicket({ route }) {
  const [ticketNumber, setTicketNumber] = useState(route?.params?.ticketNumber || '');
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  const searchTicket = async () => {
    if (!ticketNumber.trim()) {
      setError('Masukkan nomor tiket');
      return;
    }

    setLoading(true);
    setError('');
    setTicket(null);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_number', ticketNumber.trim())
        .single();

      if (error) throw error;

      if (data) {
        setTicket(data);
      } else {
        setError('Tiket tidak ditemukan');
      }
    } catch (err) {
      setError('Tiket tidak ditemukan. Periksa kembali nomor tiket Anda.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusIcon = ({ status }) => {
    const icons = {
      DIAJUKAN: Clock,
      DISETUJUI: CheckCircle,
      DIPROSES: AlertCircle,
      SELESAI: CheckCircle,
      DITOLAK: AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon color={STATUS_COLORS[status]} size={24} />;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lacak Tiket</Text>
        <Text style={styles.headerSubtitle}>
          Masukkan nomor tiket untuk cek status
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Contoh: TKT-20250101-0001"
            value={ticketNumber}
            onChangeText={setTicketNumber}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={searchTicket}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Search color="#fff" size={20} />
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {ticket && (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View>
                <Text style={styles.ticketNumber}>{ticket.ticket_number}</Text>
                <Text style={styles.ticketDate}>{formatDate(ticket.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[ticket.status] }]}>
                <StatusIcon status={ticket.status} />
                <Text style={styles.statusText}>{ticket.status}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Pengaju</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nama:</Text>
                <Text style={styles.infoValue}>{ticket.student_name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{ticket.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>HP:</Text>
                <Text style={styles.infoValue}>{ticket.phone}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detail Masalah</Text>
              <Text style={styles.subject}>{ticket.subject}</Text>
              <View style={styles.metaRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ticket.category}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ticket.device_type}</Text>
                </View>
              </View>
              <Text style={styles.description}>{ticket.description}</Text>
            </View>

            {ticket.technician_notes && (
              <View style={styles.notesBox}>
                <Text style={styles.notesTitle}>💬 Catatan Teknisi</Text>
                <Text style={styles.notesText}>{ticket.technician_notes}</Text>
              </View>
            )}

            <View style={styles.timeline}>
              <Text style={styles.timelineTitle}>Timeline Status</Text>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.timelineText}>Tiket Diajukan</Text>
              </View>
              {['DISETUJUI', 'DIPROSES', 'SELESAI'].includes(ticket.status) && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#3b82f6' }]} />
                  <Text style={styles.timelineText}>Tiket Disetujui</Text>
                </View>
              )}
              {['DIPROSES', 'SELESAI'].includes(ticket.status) && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#8b5cf6' }]} />
                  <Text style={styles.timelineText}>Sedang Diproses</Text>
                </View>
              )}
              {ticket.status === 'SELESAI' && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#10b981' }]} />
                  <Text style={styles.timelineText}>Selesai</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {!ticket && !error && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Cari Tiket Anda</Text>
            <Text style={styles.emptyText}>
              Masukkan nomor tiket yang Anda terima setelah submit untuk melacak statusnya
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fc'
  },
  header: {
    backgroundColor: '#7c3aed',
    padding: 24,
    paddingTop: 60
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e9d5ff'
  },
  content: {
    padding: 20
  },
  searchBox: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16
  },
  searchBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 56
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  ticketNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4
  },
  ticketDate: {
    fontSize: 12,
    color: '#94a3b8'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 60
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    fontWeight: '500'
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  badge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed'
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  notesBox: {
    backgroundColor: '#faf5ff',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 8
  },
  notesText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  timeline: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12
  },
  timelineText: {
    fontSize: 14,
    color: '#64748b'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40
  }
});