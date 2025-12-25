import { CheckCircle } from 'lucide-react-native';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['Wifi', 'Account', 'Hardware', 'Software', 'Network', 'Email', 'Lainnya'];
const DEVICE_TYPES = ['Laptop', 'PC', 'Smartphone', 'Tablet', 'Printer', 'Lainnya'];

export default function StudentTicketForm({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    deviceType: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone.replace(/[\s-]/g, ''));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = 'Nama mahasiswa harus diisi';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor HP harus diisi';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Nomor HP harus 10-15 digit';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subjek harus diisi';
    }
    
    if (!formData.category) {
      newErrors.category = 'Kategori harus dipilih';
    }
    
    if (!formData.deviceType) {
      newErrors.deviceType = 'Jenis perangkat harus dipilih';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi harus diisi';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Deskripsi minimal 20 karakter';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validasi Gagal', 'Mohon lengkapi semua field dengan benar');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([
          {
            student_name: formData.studentName.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            subject: formData.subject.trim(),
            category: formData.category,
            device_type: formData.deviceType,
            description: formData.description.trim(),
            status: 'DIAJUKAN',
            priority: 'Medium'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Success
      setTicketNumber(data.ticket_number);
      setSuccessModal(true);
      
      // Reset form
      setFormData({
        studentName: '',
        email: '',
        phone: '',
        subject: '',
        category: '',
        deviceType: '',
        description: ''
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Terjadi kesalahan saat submit tiket');
    } finally {
      setLoading(false);
    }
  };

  const CategoryButton = ({ value, label }) => (
    <TouchableOpacity
      style={[
        styles.optionBtn,
        formData.category === value && styles.optionBtnActive
      ]}
      onPress={() => setFormData({ ...formData, category: value })}
    >
      <Text style={[
        styles.optionText,
        formData.category === value && styles.optionTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const DeviceButton = ({ value, label }) => (
    <TouchableOpacity
      style={[
        styles.optionBtn,
        formData.deviceType === value && styles.optionBtnActive
      ]}
      onPress={() => setFormData({ ...formData, deviceType: value })}
    >
      <Text style={[
        styles.optionText,
        formData.deviceType === value && styles.optionTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajukan Tiket IT Support</Text>
          <Text style={styles.headerSubtitle}>
            Laporkan masalah IT Anda, tim kami siap membantu
          </Text>
        </View>

        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              📌 Anda tidak perlu login. Cukup isi form di bawah dan Anda akan mendapatkan nomor tiket untuk tracking.
            </Text>
          </View>

          {/* Student Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Mahasiswa *</Text>
            <TextInput
              style={[styles.input, errors.studentName && styles.inputError]}
              placeholder="Contoh: Budi Santoso"
              value={formData.studentName}
              onChangeText={(text) => setFormData({ ...formData, studentName: text })}
            />
            {errors.studentName && <Text style={styles.errorText}>{errors.studentName}</Text>}
          </View>

          {/* Email */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Contoh: budi@student.ac.id"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nomor HP *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Contoh: 081234567890"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Subject */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subjek Masalah *</Text>
            <TextInput
              style={[styles.input, errors.subject && styles.inputError]}
              placeholder="Contoh: Tidak bisa login ke WiFi kampus"
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
            />
            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
          </View>

          {/* Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Kategori Masalah *</Text>
            <View style={styles.optionsGrid}>
              {CATEGORIES.map((cat) => (
                <CategoryButton key={cat} value={cat} label={cat} />
              ))}
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>

          {/* Device Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Jenis Perangkat *</Text>
            <View style={styles.optionsGrid}>
              {DEVICE_TYPES.map((device) => (
                <DeviceButton key={device} value={device} label={device} />
              ))}
            </View>
            {errors.deviceType && <Text style={styles.errorText}>{errors.deviceType}</Text>}
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Deskripsi Detail Masalah *</Text>
            <TextInput
              style={[styles.textarea, errors.description && styles.inputError]}
              placeholder="Jelaskan masalah Anda secara detail (minimal 20 karakter)..."
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {formData.description.length} karakter
            </Text>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Kirim Tiket</Text>
            )}
          </TouchableOpacity>

          {/* Track Ticket Button */}
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => navigation.navigate('TrackTicket')}
          >
            <Text style={styles.trackText}>Cek Status Tiket</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModal}
        onRequestClose={() => setSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <CheckCircle color="#10b981" size={64} />
            </View>
            
            <Text style={styles.successTitle}>Tiket Berhasil Dibuat!</Text>
            
            <View style={styles.ticketBox}>
              <Text style={styles.ticketLabel}>Nomor Tiket Anda:</Text>
              <Text style={styles.ticketNumberLarge}>{ticketNumber}</Text>
            </View>
            
            <Text style={styles.successMessage}>
              Simpan nomor tiket ini untuk melacak status pengajuan Anda. Tim IT Support kami akan segera memproses tiket Anda.
            </Text>
            
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setSuccessModal(false);
                navigation.navigate('TrackTicket', { ticketNumber });
              }}
            >
              <Text style={styles.modalBtnText}>Lacak Tiket Sekarang</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => setSuccessModal(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Buat Tiket Baru</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  infoCard: {
    backgroundColor: '#faf5ff',
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24
  },
  infoText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20
  },
  formGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b'
  },
  inputError: {
    borderColor: '#ef4444'
  },
  textarea: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 120
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 6,
    textAlign: 'right'
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 6
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  optionBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  optionBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b'
  },
  optionTextActive: {
    color: '#fff'
  },
  submitBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  trackBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12
  },
  trackText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },
  successIcon: {
    marginBottom: 20
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center'
  },
  ticketBox: {
    backgroundColor: '#faf5ff',
    borderWidth: 2,
    borderColor: '#7c3aed',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center'
  },
  ticketLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8
  },
  ticketNumberLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7c3aed',
    letterSpacing: 1
  },
  successMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24
  },
  modalBtn: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalBtnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center'
  },
  modalBtnSecondaryText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600'
  }
});