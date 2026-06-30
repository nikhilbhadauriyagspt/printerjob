import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import { Search, MapPin, Briefcase, Bell, User, Filter, ChevronRight } from 'lucide-react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);

    const categories = ["Remote", "Full-Time", "Design", "Tech", "Marketing"];

    useFocusEffect(
        React.useCallback(() => {
            checkLoginStatus();
            fetchJobs();
        }, [])
    );

    const checkLoginStatus = async () => {
        try {
            // 🟢 Add a small delay to ensure AsyncStorage is ready
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const token = await AsyncStorage.getItem('candidateToken');
            console.log("Check Auth - Token found:", !!token);
            
            if (!token) {
                setIsLoggedIn(false);
                setUserData(null);
                return;
            }

            // Immediately set logged in if token exists to allow button clicks
            setIsLoggedIn(true);
            
            // Then verify with server in background
            const res = await apiClient.get('/candidate/me');
            if (res.data.success) {
                setUserData(res.data.candidate);
                console.log("Check Auth - User verified:", res.data.candidate.fullName);
            }
        } catch (error) {
            console.log("Check Auth - Error:", error.message);
            // If it's a network error, keep logged in as true if we have a token
            // only logout if it's a 401/Unauthorized
            if (error.response?.status === 401) {
                setIsLoggedIn(false);
                await AsyncStorage.removeItem('candidateToken');
            }
        }
    };

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/job/all?keyword=&location=');
            if (res.data.success) {
                setJobs(res.data.jobs);
            }
        } catch (error) {
            console.error("Fetch jobs error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (screen) => {
        if (!isLoggedIn) {
            Alert.alert("Login Required", "Please login to access this feature.", [
                { text: "Cancel", style: "cancel" },
                { text: "Login", onPress: () => navigation.navigate('Login') }
            ]);
        } else {
            if (screen === 'Profile') {
                // Smart Redirection
                if ((userData?.profileCompletion || 0) < 80) {
                    navigation.navigate('ProfileSetup');
                } else {
                    navigation.navigate('Profile');
                }
            } else {
                navigation.navigate(screen);
            }
        }
    };

    const JobCard = ({ item }) => (
        <TouchableOpacity style={styles.jobCard}>
            <View style={styles.jobHeader}>
                <View style={styles.companyLogo}>
                    <Briefcase size={20} color="#6366f1" />
                </View>
                <View style={styles.jobInfo}>
                    <Text style={styles.jobTitle}>{item.title || "Software Engineer"}</Text>
                    <Text style={styles.companyName}>{item.company?.companyName || "Tech Solutions"}</Text>
                </View>
                <TouchableOpacity>
                    <ChevronRight size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.jobTags}>
                <View style={styles.tag}><MapPin size={12} color="#64748b" /><Text style={styles.tagText}>{item.location || "Bangalore"}</Text></View>
                <View style={styles.tag}><Briefcase size={12} color="#64748b" /><Text style={styles.tagText}>{item.jobType || "Full-time"}</Text></View>
                <Text style={styles.salaryText}>{item.salary ? `₹${item.salary}LPA` : "Not specified"}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.welcomeText}>Hello, Nikhil!</Text>
                    <Text style={styles.subWelcome}>Find your dream job today</Text>
                </View>
                <TouchableOpacity style={styles.iconBtn}>
                    <Bell size={24} color="#1e293b" />
                    <View style={styles.badge} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Search size={20} color="#94a3b8" />
                    <Text style={styles.searchText}>Search for jobs...</Text>
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={{paddingRight: 20}}>
                    {categories.map((cat, i) => (
                        <TouchableOpacity key={i} style={[styles.catBtn, i === 0 && styles.activeCat]}>
                            <Text style={[styles.catText, i === 0 && styles.activeCatText]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recent Jobs Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recent Jobs</Text>
                    <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
                </View>

                {/* Actual List of Jobs */}
                {jobs.length > 0 ? (
                    jobs.map((job, i) => (
                        <JobCard key={job.id || i} item={job} />
                    ))
                ) : (
                    loading ? (
                        <ActivityIndicator color="#6366f1" style={{ marginTop: 20 }} />
                    ) : (
                        <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>No jobs found</Text>
                    )
                )}
                <View style={{height: 100}} />
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                    <Search size={24} color="#6366f1" />
                    <Text style={styles.navTextActive}>Jobs</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleAction('AppliedJobs')}>
                    <Briefcase size={24} color="#94a3b8" />
                    <Text style={styles.navText}>Applied</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleAction('Profile')}>
                    <User size={24} color="#94a3b8" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    welcomeText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subWelcome: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    iconBtn: {
        width: 45,
        height: 45,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 2,
        borderColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        marginTop: 20,
        marginBottom: 20,
    },
    searchBox: {
        flex: 1,
        height: 55,
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchText: {
        marginLeft: 10,
        color: '#94a3b8',
        fontSize: 15,
    },
    filterBtn: {
        width: 55,
        height: 55,
        backgroundColor: '#0f172a',
        borderRadius: 16,
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catScroll: {
        paddingLeft: 25,
        marginBottom: 25,
    },
    catBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    activeCat: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    catText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    activeCatText: {
        color: '#fff',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    seeAll: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '600',
    },
    jobCard: {
        backgroundColor: '#fff',
        marginHorizontal: 25,
        marginBottom: 15,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    companyLogo: {
        width: 45,
        height: 45,
        backgroundColor: '#eef2ff',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobInfo: {
        flex: 1,
        marginLeft: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    companyName: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },
    jobTags: {
        flexDirection: 'row',
        marginTop: 15,
        alignItems: 'center',
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 10,
    },
    tagText: {
        fontSize: 11,
        color: '#64748b',
        marginLeft: 4,
        fontWeight: '600',
    },
    salaryText: {
        marginLeft: 'auto',
        fontSize: 14,
        fontWeight: 'bold',
        color: '#059669',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        justifyContent: 'space-around',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 4,
        fontWeight: '600',
    },
    navTextActive: {
        fontSize: 10,
        color: '#6366f1',
        marginTop: 4,
        fontWeight: 'bold',
    }
});

export default HomeScreen;
