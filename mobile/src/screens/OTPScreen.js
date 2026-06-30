import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OTPScreen = ({ route, navigation }) => {
    const { candidateId } = route.params;
    const [emailOTP, setEmailOTP] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (!emailOTP) {
            Alert.alert("Error", "Please enter the OTP");
            return;
        }

        setLoading(true);
        try {
            // Humara backend emailOTP aur phoneOTP dono maangta hai
            // Filhal phoneOTP "123456" fix hai backend mein register ke waqt
            const res = await apiClient.post('/candidate/verify-otp', {
                candidateId,
                emailOTP,
                phoneOTP: "123456" 
            });

            if (res.data.success) {
                const { token, candidate } = res.data;
                console.log("OTP Success - Received Token:", token ? "YES" : "NO");
                
                if (!token) {
                    Alert.alert("Error", "Server verification succeeded but no token was provided.");
                    setLoading(false);
                    return;
                }

                await AsyncStorage.setItem('candidateToken', token);
                console.log("OTP Success - Waiting for storage sync...");
                
                // 🟢 Force a small delay for storage sync
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const savedToken = await AsyncStorage.getItem('candidateToken');
                console.log("Verify Storage - Token:", !!savedToken);
                
                if (!savedToken) {
                    // Fail-safe: try saving again if sync failed
                    await AsyncStorage.setItem('candidateToken', token || '');
                }

                Alert.alert("Success", "Account verified successfully!");
                
                if ((candidate?.profileCompletion || 0) < 80) {
                    navigation.replace('ProfileSetup');
                } else {
                    navigation.replace('Home');
                }
            }
        } catch (error) {
            Alert.alert("Verification Failed", error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Account</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>

            <TextInput
                style={styles.input}
                placeholder="0 0 0 0 0 0"
                keyboardType="number-pad"
                maxLength={6}
                value={emailOTP}
                onChangeText={setEmailOTP}
                textAlign="center"
                letterSpacing={10}
            />

            <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Continue</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 20 }}>
                <Text style={styles.linkText}>Resend Code</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e1b4b',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#f8fafc',
        width: '100%',
        height: 65,
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#6366f1',
        width: '100%',
        height: 55,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#6366f1',
        fontWeight: '600',
    }
});

export default OTPScreen;
