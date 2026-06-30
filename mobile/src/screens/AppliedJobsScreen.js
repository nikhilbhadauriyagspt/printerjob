import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { ArrowLeft, Briefcase, MapPin, CircleDollarSign, Clock, CheckCircle2, XCircle, Clock4 } from 'lucide-react-native';
import apiClient from '../api/apiClient';

const AppliedJobsScreen = ({ navigation }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppliedJobs();
    }, []);

    const fetchAppliedJobs = async () => {
        try {
            const res = await apiClient.get('/candidate/applied-jobs');
            if (res.data.success) {
                setJobs(res.data.appliedJobs || []);
            }
        } catch (error) {
            console.error(error);
            // Don't alert here to avoid loop, just log
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'accepted': return '#10b981';
            case 'rejected': return '#ef4444';
            default: return '#f59e0b';
        }
    };

    const getStatusIcon = (status) => {
        switch(status?.toLowerCase()) {
            case 'accepted': return <CheckCircle2 size={16} color="#10b981" />;
            case 'rejected': return <XCircle size={16} color="#ef4444" />;
            default: return <Clock4 size={16} color="#f59e0b" />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Applied Jobs</Text>
                <View style={{width: 24}} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4f46e5" />
                </View>
            ) : jobs.length === 0 ? (
                <View style={styles.center}>
                    <Briefcase size={64} color="#e2e8f0" />
                    <Text style={styles.emptyText}>No applications yet.</Text>
                    <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.browseText}>Browse Jobs</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.list}>
                    {jobs.map((item, index) => (
                        <View key={item.id || index} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.jobInfo}>
                                    <Text style={styles.jobTitle}>{item.job?.title || 'Unknown Job'}</Text>
                                    <Text style={styles.companyName}>{item.job?.company?.companyName || 'Unknown Company'}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15', borderColor: getStatusColor(item.status) + '30' }]}>
                                    {getStatusIcon(item.status)}
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {item.status || 'Pending'}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.metaRow}>
                                <View style={styles.metaItem}>
                                    <MapPin size={14} color="#64748b" />
                                    <Text style={styles.metaText}>{item.job?.location || 'N/A'}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <CircleDollarSign size={14} color="#64748b" />
                                    <Text style={styles.metaText}>{item.job?.salary || 'N/A'}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Clock size={14} color="#64748b" />
                                    <Text style={styles.metaText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { fontSize: 16, color: '#64748b', marginTop: 15, marginBottom: 25 },
    browseBtn: { backgroundColor: '#4f46e5', paddingHorizontal: 25, paddingVertical: 12, borderRadius: 12 },
    browseText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    list: { padding: 15 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    jobInfo: { flex: 1, marginRight: 10 },
    jobTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
    companyName: { fontSize: 13, color: '#64748b', fontWeight: '600' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
    statusText: { fontSize: 11, fontWeight: '800', marginLeft: 4, textTransform: 'uppercase' },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginTop: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    metaItem: { flexDirection: 'row', alignItems: 'center' },
    metaText: { fontSize: 12, color: '#64748b', marginLeft: 4, fontWeight: '500' }
});

export default AppliedJobsScreen;
