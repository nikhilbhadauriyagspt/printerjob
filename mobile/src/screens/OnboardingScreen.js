import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Dimensions, Animated, SafeAreaView, Platform } from 'react-native';
import { Briefcase, Zap, ShieldCheck, ChevronRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        title: 'Find Your Dream Job',
        description: 'Explore thousands of job opportunities tailored to your skills and preferences.',
        icon: Briefcase,
        color: '#4f46e5'
    },
    {
        id: '2',
        title: 'Quick Application',
        description: 'Apply to jobs with just one click and track your application status in real-time.',
        icon: Zap,
        color: '#06b6d4'
    },
    {
        id: '3',
        title: 'Verified Recruiters',
        description: 'Connect directly with verified hiring managers from top-tier companies.',
        icon: ShieldCheck,
        color: '#8b5cf6'
    }
];

const OnboardingScreen = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
        } else {
            navigation.replace('Home');
        }
    };

    const skip = () => {
        navigation.replace('Home');
    };

    const Paginator = ({ data, scrollX }) => {
        return (
            <View style={{ flexDirection: 'row', height: 64 }}>
                {data.map((_, i) => {
                    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 20, 10],
                        extrapolate: 'clamp'
                    });
                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp'
                    });
                    return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i.toString()} />;
                })}
            </View>
        );
    };

    const OnboardingItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <View style={styles.itemContainer}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                    <Icon size={100} color={item.color} strokeWidth={1.5} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 3 }}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false
                    })}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View style={styles.footer}>
                <Paginator data={slides} scrollX={scrollX} />
                
                <View style={styles.buttonRow}>
                    <TouchableOpacity onPress={skip}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.nextBtn} onPress={scrollToNext}>
                        <Text style={styles.nextBtnText}>
                            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <ChevronRight size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    itemContainer: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    iconContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 15,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        alignItems: 'center',
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4f46e5',
        marginHorizontal: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#94a3b8',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 25,
        paddingVertical: 15,
        borderRadius: 20,
    },
    nextBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    }
});

export default OnboardingScreen;
