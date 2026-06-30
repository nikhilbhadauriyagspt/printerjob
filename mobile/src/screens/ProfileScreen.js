import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView, Image, Platform } from 'react-native';
import { ArrowLeft, Edit3, MapPin, Mail, Phone, Briefcase, GraduationCap, FileText, CheckCircle2, Award, LogOut } from 'lucide-react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await apiClient.get('/candidate/me');
            if (res.data.success) {
                setUser(res.data.candidate);
            }
        } catch (error) {
            console.error("Profile fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('candidateToken');
        navigation.replace('Login');
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Unable to load profile.</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={fetchProfile}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')} style={styles.editBtn}>
                    <Edit3 size={20} color="#4f46e5" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Top Section */}
                <View style={styles.topCard}>
                    <Image 
                        source={{ uri: user.profilePhoto || 'https://via.placeholder.com/150' }} 
                        style={styles.profileImage} 
                    />
                    <Text style={styles.userName}>{user.fullName || 'User Name'}</Text>
                    <Text style={styles.headline}>{user.headline || user.designation || 'Add a professional headline'}</Text>
                    
                    <View style={styles.quickInfo}>
                        {user.currentLocation && (
                            <View style={styles.infoBadge}>
                                <MapPin size={12} color="#64748b" />
                                <Text style={styles.infoText}>{user.currentLocation}</Text>
                            </View>
                        )}
                        <View style={styles.infoBadge}>
                            <Briefcase size={12} color="#64748b" />
                            <Text style={styles.infoText}>{user.experienceYears || 0} Years Exp.</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <View style={styles.contactRow}>
                        <Mail size={18} color="#94a3b8" />
                        <Text style={styles.contactText}>{user.email}</Text>
                        {user.isEmailVerified && <CheckCircle2 size={16} color="#10b981" style={{marginLeft: 'auto'}}/>}
                    </View>
                    <View style={styles.contactRow}>
                        <Phone size={18} color="#94a3b8" />
                        <Text style={styles.contactText}>{user.phoneNumber || 'Not provided'}</Text>
                        {user.isPhoneVerified && <CheckCircle2 size={16} color="#10b981" style={{marginLeft: 'auto'}}/>}
                    </View>
                </View>

                {/* About */}
                {user.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About Me</Text>
                        <Text style={styles.bioText}>{user.bio}</Text>
                    </View>
                )}

                {/* Skills */}
                {user.skills && user.skills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Top Skills</Text>
                        <View style={styles.skillWrap}>
                            {user.skills.map((skill, i) => (
                                <View key={i} style={styles.skillBadge}>
                                    <Text style={styles.skillBadgeText}>
                                        {typeof skill === 'object' ? skill.name : skill}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Experience */}
                {user.experienceData && user.experienceData.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Experience</Text>
                        {user.experienceData.map((exp, i) => (
                            <View key={i} style={styles.historyCard}>
                                <View style={styles.historyIcon}><Briefcase size={18} color="#4f46e5" /></View>
                                <View style={styles.historyContent}>
                                    <Text style={styles.historyTitle}>{exp.role}</Text>
                                    <Text style={styles.historySub}>{exp.company}</Text>
                                    <Text style={styles.historyDate}>{exp.fromMonth} {exp.fromYear} - {exp.isCurrent ? 'Present' : `${exp.toMonth} ${exp.toYear}`}</Text>
                                    {exp.description && <Text style={styles.historyDesc}>{exp.description}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {user.educationData && user.educationData.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {user.educationData.map((edu, i) => (
                            <View key={i} style={styles.historyCard}>
                                <View style={styles.historyIcon}><GraduationCap size={18} color="#4f46e5" /></View>
                                <View style={styles.historyContent}>
                                    <Text style={styles.historyTitle}>{edu.degree}</Text>
                                    <Text style={styles.historySub}>{edu.school}</Text>
                                    <Text style={styles.historyDate}>{edu.fromYear} - {edu.toYear || 'Present'}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Resume */}
                {user.resumeUrl && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Resume</Text>
                        <TouchableOpacity style={styles.resumeCard}>
                            <FileText size={24} color="#ef4444" />
                            <Text style={styles.resumeText}>resume.pdf</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { padding: 5 },
    editBtn: { padding: 8, backgroundColor: '#eef2ff', borderRadius: 10 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    content: { padding: 20 },
    topCard: { backgroundColor: '#fff', borderRadius: 24, padding: 25, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, borderWidth: 3, borderColor: '#eef2ff' },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
    headline: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 15, paddingHorizontal: 20 },
    quickInfo: { flexDirection: 'row', gap: 10 },
    infoBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    infoText: { fontSize: 12, fontWeight: '600', color: '#475569', marginLeft: 6 },
    section: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
    contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    contactText: { fontSize: 14, fontWeight: '600', color: '#334155', marginLeft: 12, flex: 1 },
    bioText: { fontSize: 14, color: '#475569', lineHeight: 22 },
    skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    skillBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    skillBadgeText: { color: '#4f46e5', fontWeight: 'bold', fontSize: 12 },
    historyCard: { flexDirection: 'row', marginBottom: 20 },
    historyIcon: { width: 40, height: 40, backgroundColor: '#eef2ff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    historyContent: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 15 },
    historyTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },
    historySub: { fontSize: 13, fontWeight: '600', color: '#4f46e5', marginTop: 2 },
    historyDate: { fontSize: 11, fontWeight: '700', color: '#94a3b8', marginTop: 4, textTransform: 'uppercase' },
    historyDesc: { fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 20 },
    resumeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2' },
    resumeText: { flex: 1, fontSize: 14, fontWeight: 'bold', color: '#991b1b', marginLeft: 12 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', paddingVertical: 15, borderRadius: 16, marginTop: 10 },
    logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    errorText: { color: '#64748b', fontSize: 16, marginBottom: 15 },
    retryBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    retryText: { color: '#fff', fontWeight: 'bold' }
});

export default ProfileScreen;
