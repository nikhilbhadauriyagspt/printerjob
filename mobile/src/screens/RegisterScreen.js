import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import apiClient from '../api/apiClient';
import { User, Mail, Phone, Lock, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const InputField = ({ label, icon: Icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputBox}>
            <Icon size={20} color="#94a3b8" />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
            />
        </View>
    </View>
);

const RegisterScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const handleRegister = async () => {
        const { fullName, email, phoneNumber, password, confirmPassword } = formData;
        
        if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
            Alert.alert("Required", "Please fill all fields to continue");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Mismatch", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/candidate/register', formData);
            if (res.data.success) {
                Alert.alert("Verify Email", "An OTP has been sent to your email address.");
                navigation.navigate('OTP', { candidateId: res.data.candidateId });
            }
        } catch (error) {
            Alert.alert("Registration Failed", error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
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
                            <UserPlus size={20} color="#fff" />
                        </View>
                        <Text style={styles.brandName}>Job<Text style={{color: '#818cf8'}}>Portal</Text></Text>
                    </View>
                    
                    <Text style={styles.welcomeTitle}>Start your <Text style={{color: '#818cf8'}}>journey</Text> with us today.</Text>
                    
                    <View style={styles.featureList}>
                        {["Apply to 1000+ jobs", "Direct chat"].map((item, index) => (
                            <View key={index} style={styles.featureItem}>
                                <CheckCircle2 size={14} color="#818cf8" />
                                <Text style={styles.featureText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Form Container */}
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Candidate Registration</Text>
                    <Text style={styles.formSubtitle}>Please fill in your details to create an account.</Text>

                    <InputField 
                        label="Full Name"
                        icon={User} 
                        placeholder="John Doe" 
                        value={formData.fullName} 
                        onChangeText={(val) => setFormData({...formData, fullName: val})} 
                    />

                    <InputField 
                        label="Email Address"
                        icon={Mail} 
                        placeholder="john@example.com" 
                        keyboardType="email-address"
                        value={formData.email} 
                        onChangeText={(val) => setFormData({...formData, email: val})} 
                    />

                    <InputField 
                        label="Phone Number"
                        icon={Phone} 
                        placeholder="+91 9876543210" 
                        keyboardType="phone-pad"
                        value={formData.phoneNumber} 
                        onChangeText={(val) => setFormData({...formData, phoneNumber: val})} 
                    />

                    <InputField 
                        label="Password"
                        icon={Lock} 
                        placeholder="••••••••" 
                        secureTextEntry 
                        value={formData.password} 
                        onChangeText={(val) => setFormData({...formData, password: val})} 
                    />

                    <InputField 
                        label="Confirm Password"
                        icon={Lock} 
                        placeholder="••••••••" 
                        secureTextEntry 
                        value={formData.confirmPassword} 
                        onChangeText={(val) => setFormData({...formData, confirmPassword: val})} 
                    />

                    <TouchableOpacity 
                        style={styles.registerButton} 
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View style={styles.btnContent}>
                                <Text style={styles.registerText}>Create Account</Text>
                                <ArrowRight size={20} color="#fff" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
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
        padding: 25,
        paddingTop: 50,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    logoBox: {
        width: 32,
        height: 32,
        backgroundColor: '#4f46e5',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    brandName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    welcomeTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        lineHeight: 32,
        marginBottom: 15,
    },
    featureList: {
        flexDirection: 'row',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'rgba(79, 70, 229, 0.2)',
    },
    featureText: {
        color: '#cbd5e1',
        fontSize: 11,
        fontWeight: '600',
        marginLeft: 5,
    },
    formContainer: {
        padding: 25,
        paddingTop: 25,
    },
    formTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: -0.5,
    },
    formSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 4,
        marginBottom: 25,
    },
    inputWrapper: {
        marginBottom: 18,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 54,
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
    registerButton: {
        backgroundColor: '#0f172a',
        height: 58,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    registerText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    footerText: {
        color: '#64748b',
        fontSize: 14,
        fontWeight: '500',
    },
    loginLink: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: '800',
    }
});

export default RegisterScreen;
