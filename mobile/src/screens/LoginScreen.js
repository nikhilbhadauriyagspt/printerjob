import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert("Required", "Please enter your credentials");
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/candidate/login', formData);
            if (res.data.success) {
                const { token, candidate } = res.data;
                console.log("Login Success - Received Token:", token ? "YES (Length: " + token.length + ")" : "NO/UNDEFINED");
                
                if (!token) {
                    Alert.alert("Error", "Server did not provide a token. Please contact support.");
                    setLoading(false);
                    return;
                }

                await AsyncStorage.setItem('candidateToken', token);
                console.log("Login Success - Waiting for storage sync...");
                
                // 🟢 Force a small delay for storage sync
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const savedToken = await AsyncStorage.getItem('candidateToken');
                console.log("Verify Storage - Token:", !!savedToken);
                
                if (!savedToken) {
                    // Fail-safe: try saving again if sync failed
                    await AsyncStorage.setItem('candidateToken', token || '');
                }

                // Web logic: Redirect to setup if completion < 80%
                if ((candidate?.profileCompletion || 0) < 80) {
                    navigation.replace('ProfileSetup');
                } else {
                    navigation.replace('Home');
                }
            }
        } catch (error) {
            Alert.alert("Login Failed", error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        // Simulation for preview
        setTimeout(() => {
            setLoading(false);
            Alert.alert("Google Login", "Proceeding to Home for preview.", [
                { text: "Continue", onPress: () => navigation.replace('Home') }
            ]);
        }, 1000);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Visual Header */}
                <View style={styles.visualHeader}>
                    <View style={styles.brandContainer}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>J</Text>
                        </View>
                        <Text style={styles.brandName}>Job<Text style={{color: '#818cf8'}}>Portal</Text></Text>
                    </View>
                    
                    <Text style={styles.welcomeTitle}>Welcome back to{"\n"}<Text style={{color: '#818cf8'}}>your future.</Text></Text>
                    
                    <View style={styles.featureList}>
                        {["Real-time status", "Tailored alerts"].map((item, index) => (
                            <View key={index} style={styles.featureItem}>
                                <CheckCircle2 size={16} color="#818cf8" />
                                <Text style={styles.featureText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Login Form */}
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Candidate Sign In</Text>
                    <Text style={styles.formSubtitle}>Please enter your credentials to continue.</Text>

                    {/* Google Button */}
                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={loading}>
                        <View style={styles.googleIconPlaceholder} />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR USE EMAIL</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputWrapper}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputBox}>
                            <Mail size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.input}
                                placeholder="name@email.com"
                                value={formData.email}
                                onChangeText={(text) => setFormData({...formData, email: text})}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.labelRow}>
                            <Text style={styles.label}>Password</Text>
                            <TouchableOpacity><Text style={styles.forgotLink}>Forgot?</Text></TouchableOpacity>
                        </View>
                        <View style={styles.inputBox}>
                            <Lock size={20} color="#94a3b8" />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={formData.password}
                                onChangeText={(text) => setFormData({...formData, password: text})}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sign In Button */}
                    <TouchableOpacity 
                        style={styles.signInButton} 
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnContent}>
                                <Text style={styles.signInText}>Sign In</Text>
                                <ArrowRight size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>New to JobPortal? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Create account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    visualHeader: {
        backgroundColor: '#0f172a',
        padding: 30,
        paddingTop: 60,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    logoBox: {
        width: 36,
        height: 36,
        backgroundColor: '#4f46e5',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    logoText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    brandName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 38,
        marginBottom: 20,
    },
    featureList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
    },
    featureText: {
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    formContainer: {
        padding: 25,
        paddingTop: 30,
    },
    formTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    formSubtitle: {
        fontSize: 15,
        color: '#64748b',
        marginTop: 6,
        marginBottom: 30,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    googleIconPlaceholder: {
        width: 20,
        height: 20,
        backgroundColor: '#4285F4', 
        borderRadius: 4,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#f1f5f9',
    },
    dividerText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#cbd5e1',
        marginHorizontal: 15,
        letterSpacing: 1,
    },
    inputWrapper: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        marginLeft: 4,
    },
    forgotLink: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4f46e5',
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
    },
    signInButton: {
        backgroundColor: '#0f172a',
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signInText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 35,
        marginBottom: 20,
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    registerLink: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: '800',
    }
});

export default LoginScreen;
