import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types/ticket';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Tag,
  User,
  AlertCircle,
  FileText,
  MessageSquare,
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

const STATUS_STEPS = ['DIAJUKAN', 'DISETUJUI', 'DIPROSES', 'SELESAI'];

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Ticket;
    },
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
        return '#9ca3af';
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
        return '#7c3aed';
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

  const getCurrentStatusIndex = (status: string) => {
    return STATUS_STEPS.indexOf(status);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#7c3aed', '#6d28d9']}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Tiket</Text>
              <View style={styles.headerSpacer} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
          <Text style={styles.loadingText}>Memuat detail tiket...</Text>
          <Text style={styles.loadingSubtext}>Mohon tunggu sebentar</Text>
        </View>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#7c3aed', '#6d28d9']}
          style={styles.header}
        >
          <SafeAreaView edges={['top']}>
            <View style={styles.headerContent}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detail Tiket</Text>
              <View style={styles.headerSpacer} />
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <AlertCircle size={64} color="#ef4444" strokeWidth={1.5} />
          </View>
          <Text style={styles.errorTitle}>Tiket Tidak Ditemukan</Text>
          <Text style={styles.errorText}>
            Tiket yang Anda cari tidak dapat ditemukan atau sudah dihapus
          </Text>
        </View>
      </View>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(ticket.status);
  const StatusIconComponent = getStatusIcon(ticket.status);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#7c3aed', '#6d28d9']}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Detail Tiket</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Ticket Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <LinearGradient
              colors={[`${getCategoryColor(ticket.category)}25`, `${getCategoryColor(ticket.category)}15`]}
              style={styles.categoryBadge}
            >
              <Tag size={16} color={getCategoryColor(ticket.category)} strokeWidth={2.5} />
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(ticket.category) },
                ]}
              >
                {ticket.category}
              </Text>
            </LinearGradient>

            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ticket.status)}15` }]}>
              <StatusIconComponent 
                size={16} 
                color={getStatusColor(ticket.status)} 
                strokeWidth={2.5}
              />
              <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                {ticket.status}
              </Text>
            </View>
          </View>

          <Text style={styles.subject}>{ticket.subject}</Text>
          <View style={styles.ticketIdContainer}>
            <Text style={styles.ticketIdLabel}>ID Tiket:</Text>
            <Text style={styles.ticketId}>{ticket.id.slice(0, 8).toUpperCase()}</Text>
          </View>
        </View>

        {/* Status Timeline Card */}
        <View style={styles.timelineCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <Clock size={20} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.cardTitle}>Alur Status Tiket</Text>
          </View>
          
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const StepIcon = getStatusIcon(step);

              return (
                <View key={step} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <LinearGradient
                      colors={
                        isActive
                          ? [`${getStatusColor(step)}25`, `${getStatusColor(step)}15`]
                          : ['#f3f4f6', '#f9fafb']
                      }
                      style={[
                        styles.timelineCircle,
                        isCurrent && styles.timelineCircleCurrent,
                      ]}
                    >
                      <StepIcon
                        size={20}
                        color={isActive ? getStatusColor(step) : '#9ca3af'}
                        strokeWidth={2.5}
                      />
                    </LinearGradient>
                    {index < STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          isActive && styles.timelineLineActive,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.timelineRight}>
                    <Text
                      style={[
                        styles.timelineStatus,
                        isActive && styles.timelineStatusActive,
                        isCurrent && { color: getStatusColor(step) },
                      ]}
                    >
                      {step}
                    </Text>
                    {isCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: `${getStatusColor(step)}15` }]}>
                        <View style={[styles.currentBadgeDot, { backgroundColor: getStatusColor(step) }]} />
                        <Text
                          style={[
                            styles.currentBadgeText,
                            { color: getStatusColor(step) },
                          ]}
                        >
                          Status Saat Ini
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <User size={20} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.cardTitle}>Informasi Pengaju</Text>
          </View>
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#f3e8ff', '#faf5ff']}
                style={styles.infoIcon}
              >
                <User size={20} color="#7c3aed" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nama</Text>
                <Text style={styles.infoValue}>{ticket.nama}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#f3e8ff', '#faf5ff']}
                style={styles.infoIcon}
              >
                <Mail size={20} color="#7c3aed" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{ticket.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#f3e8ff', '#faf5ff']}
                style={styles.infoIcon}
              >
                <Phone size={20} color="#7c3aed" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nomor HP</Text>
                <Text style={styles.infoValue}>{ticket.hp}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <LinearGradient
                colors={['#f3e8ff', '#faf5ff']}
                style={styles.infoIcon}
              >
                <Calendar size={20} color="#7c3aed" strokeWidth={2.5} />
              </LinearGradient>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tanggal Dibuat</Text>
                <Text style={styles.infoValue}>
                  {format(new Date(ticket.created_at), 'dd MMMM yyyy, HH:mm', {
                    locale: localeId,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIcon}>
              <FileText size={20} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.cardTitle}>Deskripsi Masalah</Text>
          </View>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>

        {/* Admin Notes Card */}
        {ticket.admin_notes && (
          <View style={styles.notesCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderIcon}>
                <MessageSquare size={20} color="#7c3aed" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardTitle}>Catatan Admin</Text>
            </View>
            <View style={styles.notesContent}>
              <Text style={styles.notes}>{ticket.admin_notes}</Text>
            </View>
          </View>
        )}

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
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subject: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  ticketIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketIdLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 13,
    color: '#7c3aed',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.3,
    flex: 1,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timelineCircleCurrent: {
    borderColor: '#e9d5ff',
    borderWidth: 3,
  },
  timelineLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 6,
    borderRadius: 2,
  },
  timelineLineActive: {
    backgroundColor: '#c4b5fd',
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 8,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  timelineStatusActive: {
    color: '#1f2937',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  currentBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  infoList: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
    paddingTop: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: -0.2,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  notesContent: {
    backgroundColor: '#faf5ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  notes: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 20,
  },
});
