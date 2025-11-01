import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Dimensions, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '@/config/theme';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Input } from '@/components/ui/Input';
import { useJob } from '@/lib/hooks/useJobs';
import { useApply, useApplicationStatus } from '@/lib/hooks/useApplications';
import { useAuthContext } from '@/lib/auth/AuthProvider';

const { width: screenWidth } = Dimensions.get('window');

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [applicationNote, setApplicationNote] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [applicationPhone, setApplicationPhone] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const { job, loading } = useJob(id as string);
  const { apply, loading: applying } = useApply();
  const { status: applicationStatus, loading: checkingApplication } = useApplicationStatus(id as string);
  const { user } = useAuthContext();

  const goToPrevious = () => {
    if (!job?.images || currentImageIndex <= 0) return;
    const newIndex = currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
  };

  const goToNext = () => {
    if (!job?.images || currentImageIndex >= job.images.length - 1) return;
    const newIndex = currentImageIndex + 1;
    setCurrentImageIndex(newIndex);
    scrollViewRef.current?.scrollTo({ x: newIndex * screenWidth, animated: true });
  };

  const renderImageCarousel = () => {
    if (!job?.images || job.images.length === 0) return null;

    return (
      <View style={styles.imageCarousel}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(newIndex);
          }}
        >
          {job.images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image }}
                style={styles.carouselImage}
              />
              {job.images!.length > 1 && (
                <>
                  <TouchableOpacity
                    style={styles.touchLeft}
                    onPress={goToPrevious}
                    activeOpacity={1}
                  />
                  <TouchableOpacity
                    style={styles.touchRight}
                    onPress={goToNext}
                    activeOpacity={1}
                  />
                </>
              )}
            </View>
          ))}
        </ScrollView>

        {job.images.length > 1 && (
          <View style={styles.imageIndicators}>
            {job.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentImageIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleApply = async () => {
    if (applicationStatus) {
      console.log('ℹ️ User already applied for this position');
      return;
    }

    if (!showApplicationForm) {
      setShowApplicationForm(true);
      return;
    }

    if (!id) return;

    try {
      await apply(
        id,
        applicationNote.trim() || undefined,
        applicationEmail.trim(),
        applicationPhone.trim()
      );
      console.log('✅ Application submitted successfully! Redirecting to student dashboard...');
      setShowApplicationForm(false);
      setApplicationNote('');
      setApplicationEmail('');
      setApplicationPhone('');

      // Navigate back to student dashboard
      router.replace('/student');
    } catch (error: any) {
      console.error('❌ Application submission failed:', error.message);
    }
  };

  if (loading || !job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/student')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {renderImageCarousel()}

        <View style={styles.content}>
          <Card style={styles.jobCard}>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.company}>{job.companies?.name}</Text>

            {job.location && (
              <Text style={styles.location}>📍 {job.location}</Text>
            )}

            <View style={styles.paymentInfo}>
              <Tag
                label={job.is_paid
                  ? (job.stipend_amount ? `$${job.stipend_amount}` : 'Paid Position')
                  : 'Internship'
                }
                variant={job.is_paid ? 'success' : 'primary'}
              />
            </View>

            <View style={styles.tags}>
              {job.tags?.map((tag, index) => (
                <Tag key={index} label={tag} />
              ))}
            </View>
          </Card>

          <Card style={styles.descriptionCard}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.description}>{job.description}</Text>
          </Card>

          <Card style={styles.companyCard}>
            <Text style={styles.sectionTitle}>About {job.companies?.name}</Text>
            <Text style={styles.companyDescription}>{job.companies?.description}</Text>
            {job.companies?.location && (
              <Text style={styles.companyLocation}>📍 {job.companies.location}</Text>
            )}
          </Card>

          <Card style={styles.applicationCard}>
            <Text style={styles.sectionTitle}>
              {job.is_paid ? 'Apply for this Position' : 'Apply as an Intern'}
            </Text>

            {showApplicationForm ? (
              <View style={styles.applicationForm}>
                <Input
                  label="Email Address"
                  value={applicationEmail}
                  onChangeText={setApplicationEmail}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Input
                  label="Phone Number (Optional)"
                  value={applicationPhone}
                  onChangeText={setApplicationPhone}
                  placeholder=""
                  keyboardType="phone-pad"
                />

                <Input
                  label="Cover Note (Optional)"
                  value={applicationNote}
                  onChangeText={setApplicationNote}
                  multiline
                  placeholder="Tell the employer why you're interested in this position..."
                />

                <View style={styles.applicationActions}>
                  <Button
                    title={job.is_paid ? "Submit Application" : "Apply as Intern"}
                    onPress={handleApply}
                    loading={applying}
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setShowApplicationForm(false)}
                    variant="outline"
                  />
                </View>
              </View>
            ) : (
              <Button
                title={
                  applicationStatus === 'accepted'
                    ? "Application Accepted"
                    : applicationStatus === 'rejected'
                    ? "Application Declined"
                    : applicationStatus === 'submitted'
                    ? "Application Submitted"
                    : (job.is_paid ? "Apply Now" : "Apply as an Intern")
                }
                onPress={handleApply}
                style={[
                  styles.applyButton,
                  applicationStatus === 'accepted' && styles.acceptedButton,
                  applicationStatus === 'rejected' && styles.rejectedButton,
                  applicationStatus === 'submitted' && styles.appliedButton
                ]}
                disabled={applicationStatus !== null || checkingApplication}
              />
            )}
          </Card>

          <Card style={styles.contactCard}>
            <Text style={styles.sectionTitle}>Contact Employer</Text>
            <Text style={styles.contactDescription}>
              Have questions about this {job.is_paid ? 'position' : 'internship'}?
              Contact the employer directly.
            </Text>

            <View style={styles.contactButtonsContainer}>
              <Button
                title="📧 Email"
                onPress={() => {
                  const email = job?.companies?.email || 'contact@company.com';
                  const subject = `Question about ${job?.title}`;
                  const body = `Hi,\n\nI'm interested in the ${job?.title} position and have some questions.\n\nBest regards`;
                  Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
                variant="outline"
                style={styles.contactButton}
              />

              <Button
                title="💬 WhatsApp"
                onPress={() => {
                  const phone = job?.companies?.phone || '';
                  if (!phone) {
                    console.log('ℹ️ WhatsApp contact not available for this employer');
                    return;
                  }
                  const message = `Hi! I'm interested in the ${job?.title} position.`;
                  Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
                }}
                variant="outline"
                style={styles.contactButton}
              />
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  imageCarousel: {
    position: 'relative',
  },
  imageContainer: {
    position: 'relative',
    width: screenWidth,
    height: 250,
  },
  carouselImage: {
    width: screenWidth,
    height: 250,
  },
  touchLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: screenWidth / 2,
    height: 250,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  touchRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: screenWidth / 2,
    height: 250,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: 0,
  },
  backButton: {
    padding: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.bodyMedium,
  },
  content: {
    padding: theme.spacing.lg,
  },
  jobCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontFamily: theme.fontFamily.titleBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  company: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  location: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  paymentInfo: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  descriptionCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  companyCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  applicationCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontFamily: theme.fontFamily.titleMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  companyDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
  },
  companyLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  applicationForm: {
    gap: theme.spacing.md,
  },
  applicationActions: {
    gap: theme.spacing.sm,
  },
  applyButton: {
    marginTop: theme.spacing.sm,
  },
  appliedButton: {
    backgroundColor: theme.colors.secondary,
    opacity: 0.7,
  },
  acceptedButton: {
    backgroundColor: theme.colors.success,
    opacity: 0.9,
  },
  rejectedButton: {
    backgroundColor: theme.colors.error,
    opacity: 0.7,
  },
  contactCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  contactDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  contactButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    marginTop: theme.spacing.sm,
  },
});