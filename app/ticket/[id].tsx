import { theme } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { Ticket } from '@/types/ticket';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useLocalSearchParams } from 'expo-router';
import {
    Calendar,
    CheckCircle2,
    Clock,
    Mail,
    Phone,
    Tag,
    User,
} from 'lucide-react-native';
import React from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_STEPS = ['DIAJUKAN', 'DISETUJUI', 'DIPROSES', 'SELESAI'];

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

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

  const getCurrentStatusIndex = (status: string) => {
    return STATUS_STEPS.indexOf(status);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Memuat detail tiket...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tiket tidak ditemukan</Text>
      </View>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex(ticket.status);

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerCard}>
          <View style={styles.categoryBadgeContainer}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: `${getCategoryColor(ticket.category)}20` },
              ]}
            >
              <Tag size={16} color={getCategoryColor(ticket.category)} />
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(ticket.category) },
                ]}
              >
                {ticket.category}
              </Text>
            </View>
          </View>

          <Text style={styles.subject}>{ticket.subject}</Text>
          <Text style={styles.ticketId}>ID: {ticket.id.slice(0, 8).toUpperCase()}</Text>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Status Tiket</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <View key={step} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineCircle,
                        isActive && styles.timelineCircleActive,
                        isCurrent && { borderWidth: 3 },
                      ]}
                    >
                      {isActive && (
                        <CheckCircle2
                          size={16}
                          color={
                            isCurrent
                              ? getStatusColor(step)
                              : theme.colors.success
                          }
                        />
                      )}
                    </View>
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
                      <View style={styles.currentBadge}>
                        <Clock size={12} color={getStatusColor(step)} />
                        <Text
                          style={[
                            styles.currentBadgeText,
                            { color: getStatusColor(step) },
                          ]}
                        >
                          Saat ini
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informasi Pengaju</Text>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <User size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nama</Text>
                <Text style={styles.infoValue}>{ticket.nama}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Mail size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{ticket.email}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Phone size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nomor HP</Text>
                <Text style={styles.infoValue}>{ticket.hp}</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Calendar size={18} color={theme.colors.primary} />
              </View>
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

        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>Deskripsi Masalah</Text>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>

        {ticket.admin_notes && (
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>Catatan Admin</Text>
            <Text style={styles.notes}>{ticket.admin_notes}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.lavenderLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.lavenderLight,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.lavenderLight,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  categoryBadgeContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subject: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  ticketId: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  timeline: {
    paddingLeft: theme.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  timelineCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.borderLight,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCircleActive: {
    backgroundColor: theme.colors.lavender,
    borderColor: theme.colors.success,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: theme.colors.success,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: theme.spacing.lg,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  timelineStatusActive: {
    color: theme.colors.text,
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  infoList: {
    gap: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  notesCard: {
    backgroundColor: theme.colors.lavender,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  notes: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 24,
  },
});
