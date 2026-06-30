import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🟢 UPDATED IP: 192.168.10.118
const BASE_URL = 'http://192.168.10.118:8000/api/v1'; 

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

// Automatically add token to every request if available
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('candidateToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
