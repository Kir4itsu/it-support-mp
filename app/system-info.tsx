import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  Wifi,
  User,
  Laptop,
  Code,
  ArrowRight,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SystemInfo() {
  const router = useRouter();

  const categories = [
    { name: 'Wifi', icon: Wifi, color: '#ec4899', description: 'Masalah koneksi internet dan jaringan kampus' },
    { name: 'Account', icon: User, color: '#8b5cf6', description: 'Akun tidak bisa diakses atau lupa password' },
    { name: 'Hardware', icon: Laptop, color: '#f59e0b', description: 'Kerusakan perangkat keras seperti PC atau printer' },
    { name: 'Software', icon: Code, color: '#06b6d4', description: 'Instalasi atau error pada aplikasi' },
  ];

  const statusFlow = [
    { 
      status: 'DIAJUKAN', 
      icon: Clock, 
      color: '#f59e0b',
      description: 'Tiket Anda telah diterima dan menunggu review dari admin'
    },
    { 
      status: 'DISETUJUI', 
      icon: CheckCircle, 
      color: '#3b82f6',
      description: 'Admin telah menyetujui tiket dan akan segera ditindaklanjuti'
    },
    { 
      status: 'DIPROSES', 
      icon: Clock, 
      color: '#8b5cf6',
      description: 'Tim IT sedang menangani masalah Anda'
    },
    { 
      status: 'SELESAI', 
      icon: CheckCircle, 
      color: '#10b981',
      description: 'Masalah telah selesai ditangani'
    },
  ];

  const tips = [
    'Gunakan judul yang jelas dan spesifik',
    'Jelaskan masalah secara detail dengan langkah-langkah yang sudah Anda coba',
    'Sertakan screenshot atau foto jika memungkinkan',
    'Pastikan informasi kontak Anda benar agar mudah dihubungi',
    'Pilih kategori yang sesuai dengan masalah Anda',
  ];

  return (
    <View style={styles.container}>
      {/* Hide default header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
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
            <Text style={styles.headerTitle}>Tentang Sistem</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Info size={24} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Apa itu Sistem Tiket IT?</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Sistem Tiket IT adalah platform digital yang memudahkan mahasiswa untuk melaporkan 
              dan mengelola masalah IT di kampus. Dengan sistem ini, setiap masalah akan tercatat 
              dengan baik dan dapat dilacak statusnya secara real-time.
            </Text>
          </View>
        </View>

        {/* How to Create Ticket */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <FileText size={24} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Cara Membuat Tiket</Text>
          </View>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Pilih Kategori Layanan</Text>
                <Text style={styles.stepDescription}>
                  Pilih kategori yang sesuai dengan masalah Anda: Wifi, Account, Hardware, atau Software
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Isi Informasi Pribadi</Text>
                <Text style={styles.stepDescription}>
                  Masukkan nama lengkap, email, dan nomor HP yang bisa dihubungi
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Jelaskan Masalah</Text>
                <Text style={styles.stepDescription}>
                  Tulis judul masalah dan deskripsi lengkap tentang masalah yang Anda alami
                </Text>
              </View>
            </View>

            <View style={styles.stepConnector} />

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Kirim Tiket</Text>
                <Text style={styles.stepDescription}>
                  Klik tombol "Kirim Tiket" dan tunggu konfirmasi dari admin
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Status Flow */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <ArrowRight size={24} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Alur Status Tiket</Text>
          </View>
          
          <View style={styles.statusFlowContainer}>
            {statusFlow.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <View key={item.status}>
                  <View style={styles.statusItem}>
                    <LinearGradient
                      colors={[`${item.color}25`, `${item.color}15`]}
                      style={styles.statusIconContainer}
                    >
                      <IconComponent size={28} color={item.color} strokeWidth={2.5} />
                    </LinearGradient>
                    <View style={styles.statusContent}>
                      <View style={styles.statusHeader}>
                        <Text style={[styles.statusTitle, { color: item.color }]}>
                          {item.status}
                        </Text>
                        {index === statusFlow.length - 1 && (
                          <View style={[styles.currentBadge, { backgroundColor: `${item.color}20` }]}>
                            <Text style={[styles.currentBadgeText, { color: item.color }]}>
                              Status Akhir
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.statusDescription}>{item.description}</Text>
                    </View>
                  </View>
                  {index < statusFlow.length - 1 && (
                    <View style={styles.statusConnector} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <HelpCircle size={24} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Kategori Layanan</Text>
          </View>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <View key={category.name} style={styles.categoryCard}>
                  <LinearGradient
                    colors={[`${category.color}25`, `${category.color}15`]}
                    style={styles.categoryIconContainer}
                  >
                    <IconComponent size={28} color={category.color} strokeWidth={2} />
                  </LinearGradient>
                  <Text style={[styles.categoryName, { color: category.color }]}>
                    {category.name}
                  </Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Lightbulb size={24} color="#7c3aed" strokeWidth={2.5} />
            </View>
            <Text style={styles.sectionTitle}>Tips Membuat Tiket</Text>
          </View>
          
          <View style={styles.tipsContainer}>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <View style={styles.tipBulletDot} />
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => router.push('/create-ticket')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#7c3aed', '#6d28d9']}
            style={styles.ctaButtonGradient}
          >
            <Text style={styles.ctaButtonText}>Buat Tiket Sekarang</Text>
            <ArrowRight size={20} color="#fff" strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>

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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e9d5ff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
    letterSpacing: -0.5,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    fontWeight: '500',
  },
  stepsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  stepItem: {
    flexDirection: 'row',
    gap: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b7280',
    fontWeight: '500',
  },
  stepConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#e9d5ff',
    marginLeft: 17,
    marginVertical: 4,
  },
  statusFlowContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  statusItem: {
    flexDirection: 'row',
    gap: 16,
  },
  statusIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContent: {
    flex: 1,
    paddingTop: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  currentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b7280',
    fontWeight: '500',
  },
  statusConnector: {
    width: 2,
    height: 32,
    backgroundColor: '#e9d5ff',
    marginLeft: 27,
    marginVertical: 8,
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  categoryDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#6b7280',
    fontWeight: '500',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3e8ff',
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tipBulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#4b5563',
    fontWeight: '500',
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});
