import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, SafeAreaView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { User, Briefcase, GraduationCap, Upload, ChevronRight, ArrowLeft, Camera, MapPin, CheckCircle2, X, Plus, Search, Pencil, Trash2, Calendar, School, Globe, Info } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const StepIndicator = ({ step, progress }) => (
    <View style={styles.stepHeader}>
        <View style={styles.progressRow}>
            <Text style={styles.stepText}>Step {step} of 5</Text>
            <Text style={styles.progressPercent}>{progress}% Complete</Text>
        </View>
        <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
    </View>
);

const ProfileSetupScreen = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [parsing, setParsing] = useState(false);
    
    const [activeExpIndex, setActiveExpIndex] = useState(null);
    const [activeEduIndex, setActiveEduIndex] = useState(null);
    
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeField, setActiveField] = useState(null);

    const commonSkills = ["React", "Node.js", "JavaScript", "Python", "Java", "HTML", "CSS", "SQL", "MongoDB", "Express", "Angular", "Vue", "AWS", "Docker", "Kubernetes", "C++", "C#", "PHP", "Laravel", "Swift", "Flutter", "React Native", "Tailwind CSS", "TypeScript", "Next.js", "Redux", "PostgreSQL", "Firebase", "Git", "GitHub"];

    const [formData, setFormData] = useState({
        profilePhoto: null,
        bio: '',
        headline: '',
        industry: '',
        designation: '',
        experienceLevel: 'fresher',
        experienceData: [],
        educationData: [],
        skills: [], // Array of { name, level }
        currentLocation: '',
        preferredLocations: [],
        currentSalary: '',
        expectedSalary: '',
        socialLinks: { linkedin: '', github: '' },
        resume: null
    });

    // 🟢 Dynamic Progress Calculation
    useEffect(() => {
        let score = 0;
        if (formData.profilePhoto) score += 10;
        if (formData.bio) score += 10;
        if (formData.headline) score += 10;
        if (formData.experienceLevel === 'fresher' || (formData.experienceData && formData.experienceData.length > 0)) score += 20;
        if (formData.educationData && formData.educationData.length > 0) score += 20;
        if (formData.skills && formData.skills.length > 0) score += 20;
        if (formData.socialLinks && (formData.socialLinks.linkedin || formData.socialLinks.github)) score += 10;
        setProgress(Math.min(score, 100));
    }, [formData]);

    const fetchSuggestions = async (type, query) => {
        if (!query || query.length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
        const q = query.toLowerCase();

        if (type === 'university') {
            try {
                const res = await fetch(`http://universities.hipolabs.com/search?name=${query}`);
                const data = await res.json();
                if (Array.isArray(data)) { setSuggestions(data.slice(0, 10).map(u => ({ name: u.name }))); setShowSuggestions(true); }
                return;
            } catch (err) { console.error(err); }
        }

        if (type === 'company') {
            try {
                const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${query}`);
                const data = await res.json();
                if (Array.isArray(data)) { setSuggestions(data.map(c => ({ name: c.name, logo: c.logo }))); setShowSuggestions(true); }
                return;
            } catch (err) { console.error(err); }
        }

        let baseList = (type === 'skill') ? commonSkills : (type === 'location' ? ["Noida, UP", "Delhi, NCR", "Gurgaon, Haryana", "Mumbai, Maharashtra", "Bangalore, Karnataka", "Hyderabad, Telangana", "Pune, Maharashtra", "Chennai, Tamil Nadu"] : (type === 'degree' ? ["B.Tech", "BCA", "MCA", "MBA", "B.Com"] : []));

        try {
            const apiType = type === 'jobtitle' || type.includes('role') ? 'jobtitle' : (type === 'skill' ? 'skill' : 'industry');
            const res = await apiClient.get(`/admin/suggestions?type=${apiType}`);
            let dbItems = res.data.success ? res.data.suggestions : [];
            const combined = [...new Set([...dbItems, ...baseList])];
            const filtered = combined.filter(item => item.toLowerCase().includes(q))
                .sort((a, b) => (a.toLowerCase().startsWith(q) && !b.toLowerCase().startsWith(q) ? -1 : 1));
            setSuggestions(filtered.map(s => ({ name: s })));
            setShowSuggestions(true);
        } catch (err) { console.error(err); }
    };

    const handleSkillAdd = (skillName) => {
        if (!formData.skills.some(s => s.name === skillName)) {
            setFormData({ ...formData, skills: [...formData.skills, { name: skillName, level: 'Intermediate' }] });
        }
        setShowSuggestions(false);
        setActiveField(null);
    };

    const handleSkillLevelChange = (skillName, level) => {
        const newSkills = formData.skills.map(s => s.name === skillName ? { ...s, level } : s);
        setFormData({ ...formData, skills: newSkills });
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
        if (!result.canceled) setFormData({ ...formData, profilePhoto: result.assets[0] });
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf'], copyToCacheDirectory: true });
            if (!result.canceled) handleResumeUpload(result.assets[0]);
        } catch (err) { Alert.alert("Error", "Failed to pick document"); }
    };

    const handleResumeUpload = async (file) => {
        setParsing(true);
        const data = new FormData();
        data.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/pdf' });
        try {
            const res = await apiClient.post('/candidate/parse-resume', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                const p = res.data.data;
                setFormData(prev => ({ ...prev, resume: file, skills: (p.skills || []).map(s => ({ name: s, level: 'Intermediate' })), industry: p.industry || prev.industry, designation: p.designation || prev.designation, experienceLevel: p.experienceLevel || prev.experienceLevel, bio: p.bio || prev.bio }));
                Alert.alert("AI Success", "Profile pre-filled!");
                setStep(2);
            }
        } catch (err) { setFormData(prev => ({ ...prev, resume: file })); setStep(2); } finally { setParsing(false); }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            if (formData.profilePhoto) data.append('profilePhoto', { uri: formData.profilePhoto.uri, name: 'profile.jpg', type: 'image/jpeg' });
            Object.keys(formData).forEach(key => {
                if (key !== 'profilePhoto' && key !== 'resume') {
                    const val = formData[key];
                    data.append(key, (typeof val === 'object' || Array.isArray(val)) ? JSON.stringify(val) : val);
                }
            });
            const res = await apiClient.put('/candidate/update-profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) { Alert.alert("Success", "Profile Activated!"); navigation.replace('Home'); }
        } catch (error) { Alert.alert("Error", error.response?.data?.message || "Submission failed"); } finally { setLoading(false); }
    };

    const renderSuggestions = (field) => {
        if (!showSuggestions || suggestions.length === 0 || activeField !== field) return null;
        return (
            <View style={styles.suggestionsBox}>
                <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="always" nestedScrollEnabled={true}>
                    {suggestions.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => {
                            if (field === 'skills') handleSkillAdd(item.name);
                            else if (field === 'preferredLocations') { if(!formData.preferredLocations.includes(item.name)) setFormData({...formData, preferredLocations: [...formData.preferredLocations, item.name]}); setShowSuggestions(false); }
                            else if (field.startsWith('exp_role_')) { const idx = parseInt(field.split('_')[2]); const n = [...formData.experienceData]; n[idx].role = item.name; setFormData({...formData, experienceData: n}); setShowSuggestions(false); }
                            else if (field.startsWith('exp_comp_')) { const idx = parseInt(field.split('_')[2]); const n = [...formData.experienceData]; n[idx].company = item.name; setFormData({...formData, experienceData: n}); setShowSuggestions(false); }
                            else if (field.startsWith('edu_sch_')) { const idx = parseInt(field.split('_')[2]); const n = [...formData.educationData]; n[idx].school = item.name; setFormData({...formData, educationData: n}); setShowSuggestions(false); }
                            else if (field.startsWith('edu_deg_')) { const idx = parseInt(field.split('_')[2]); const n = [...formData.educationData]; n[idx].degree = item.name; setFormData({...formData, educationData: n}); setShowSuggestions(false); }
                            else { setFormData({...formData, [field]: item.name}); setShowSuggestions(false); }
                            setActiveField(null);
                        }}>
                            <Text style={styles.suggestionText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <View style={styles.iconCircle}>{parsing ? <ActivityIndicator color="#6366f1" /> : <Upload size={32} color="#6366f1" />}</View>
                        <Text style={styles.stepTitle}>Quick Start with Resume</Text>
                        <Text style={styles.stepSub}>Upload your resume and our AI will pre-fill your profile for you.</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickDocument} disabled={parsing}>
                            {formData.resume ? (
                                <><CheckCircle2 size={30} color="#10b981" /><Text style={[styles.uploadText, {color: '#10b981'}]}>{formData.resume.name}</Text><Text style={styles.uploadLimit}>Click to change</Text></>
                            ) : (
                                <><Briefcase size={30} color="#94a3b8" /><Text style={styles.uploadText}>Select PDF or DOC</Text><Text style={styles.uploadLimit}>Max size 5MB</Text></>
                            )}
                        </TouchableOpacity>
                        <View style={styles.dividerRow}><View style={styles.divider} /><Text style={styles.dividerText}>OR FILL MANUALLY</Text><View style={styles.divider} /></View>
                        <View style={styles.skillBadgeRow}>
                            {formData.skills.map((s, i) => (
                                <View key={i} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{typeof s === 'object' ? s.name : s}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                );
            case 2:
                return (
                    <ScrollView style={styles.stepContainer} keyboardShouldPersistTaps="always">
                        <View style={styles.photoSection}>
                            <TouchableOpacity style={styles.photoCircle} onPress={pickImage}>
                                {formData.profilePhoto ? <Image source={{ uri: formData.profilePhoto.uri }} style={styles.profileImg} /> : <User size={40} color="#94a3b8" />}
                                <View style={styles.cameraBtn}><Camera size={14} color="#fff" /></View>
                            </TouchableOpacity>
                            <Text style={styles.photoTitle}>Profile Photo</Text>
                        </View>
                        <View style={[styles.inputWrapper, { zIndex: 100 }]}>
                            <Text style={styles.label}>Profile Headline</Text>
                            <TextInput style={styles.input} placeholder="e.g. Senior Full Stack Developer" value={formData.headline} onChangeText={(val) => { setFormData({...formData, headline: val}); setActiveField('headline'); fetchSuggestions('jobtitle', val); }} onFocus={() => setActiveField('headline')} />
                            {renderSuggestions('headline')}
                        </View>
                        <View style={[styles.inputWrapper, { zIndex: 95 }]}>
                            <Text style={styles.label}>Current Location</Text>
                            <View style={styles.inputWithIcon}><MapPin size={18} color="#94a3b8" /><TextInput style={styles.flexInput} placeholder="e.g. Noida, UP" value={formData.currentLocation} onChangeText={(val) => { setFormData({...formData, currentLocation: val}); setActiveField('currentLocation'); fetchSuggestions('location', val); }} onFocus={() => setActiveField('currentLocation')} /></View>
                            {renderSuggestions('currentLocation')}
                        </View>
                        <View style={[styles.inputWrapper, { zIndex: 90 }]}>
                            <Text style={styles.label}>Industry</Text>
                            <TextInput style={styles.input} placeholder="e.g. IT, Healthcare" value={formData.industry} onChangeText={(val) => { setFormData({...formData, industry: val}); setActiveField('industry'); fetchSuggestions('industry', val); }} onFocus={() => setActiveField('industry')} />
                            {renderSuggestions('industry')}
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Professional Bio</Text>
                            <TextInput style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: 15 }]} placeholder="About yourself..." multiline value={formData.bio} onChangeText={(val) => setFormData({...formData, bio: val})} />
                        </View>
                        <View style={{height: 200}} />
                    </ScrollView>
                );
            case 3:
                return (
                    <ScrollView style={styles.stepContainer} keyboardShouldPersistTaps="always">
                        <Text style={styles.stepTitle}>Work Experience</Text>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity style={[styles.tab, formData.experienceLevel === 'fresher' && styles.activeTab]} onPress={() => setFormData({...formData, experienceLevel: 'fresher'})}><Text style={[styles.tabText, formData.experienceLevel === 'fresher' && styles.activeTabText]}>FRESHER</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.tab, formData.experienceLevel === 'experienced' && styles.activeTab]} onPress={() => setFormData({...formData, experienceLevel: 'experienced'})}><Text style={[styles.tabText, formData.experienceLevel === 'experienced' && styles.activeTabText]}>EXPERIENCED</Text></TouchableOpacity>
                        </View>
                        {formData.experienceLevel === 'experienced' && (
                            <View>
                                {formData.experienceData.map((exp, i) => (
                                    <View key={i} style={{ zIndex: activeExpIndex === i ? 100 : 1 }}>
                                        {activeExpIndex === i ? (
                                            <View style={styles.editCard}>
                                                <View style={{ zIndex: 110 }}><TextInput style={styles.cardInput} placeholder="Company" value={exp.company} onChangeText={(val) => { const n = [...formData.experienceData]; n[i].company = val; setFormData({...formData, experienceData: n}); setActiveField(`exp_comp_${i}`); fetchSuggestions('company', val); }} onFocus={() => setActiveField(`exp_comp_${i}`)} />{renderSuggestions(`exp_comp_${i}`)}</View>
                                                <View style={{ zIndex: 105 }}><TextInput style={styles.cardInput} placeholder="Role" value={exp.role} onChangeText={(val) => { const n = [...formData.experienceData]; n[i].role = val; setFormData({...formData, experienceData: n}); setActiveField(`exp_role_${i}`); fetchSuggestions('jobtitle', val); }} onFocus={() => setActiveField(`exp_role_${i}`)} />{renderSuggestions(`exp_role_${i}`)}</View>
                                                <View style={styles.dateRow}>
                                                    <View style={{flex: 1}}><Text style={styles.microLabel}>START DATE</Text>
                                                        <View style={styles.selectRow}>
                                                            <TextInput style={styles.miniInput} placeholder="MM" value={exp.fromMonth} onChangeText={(v) => { const n = [...formData.experienceData]; n[i].fromMonth = v; setFormData({...formData, experienceData: n}); }} />
                                                            <TextInput style={styles.miniInput} placeholder="YYYY" keyboardType="numeric" value={exp.fromYear} onChangeText={(v) => { const n = [...formData.experienceData]; n[i].fromYear = v; setFormData({...formData, experienceData: n}); }} />
                                                        </View>
                                                    </View>
                                                    <View style={{flex: 1, marginLeft: 10}}><Text style={styles.microLabel}>END DATE</Text>
                                                        <TouchableOpacity onPress={() => { const n = [...formData.experienceData]; n[i].isCurrent = !n[i].isCurrent; setFormData({...formData, experienceData: n}); }} style={styles.checkRow}><View style={[styles.checkbox, exp.isCurrent && styles.checked]} /><Text style={styles.checkText}>PRESENT</Text></TouchableOpacity>
                                                        {!exp.isCurrent && (
                                                            <View style={styles.selectRow}>
                                                                <TextInput style={styles.miniInput} placeholder="MM" value={exp.toMonth} onChangeText={(v) => { const n = [...formData.experienceData]; n[i].toMonth = v; setFormData({...formData, experienceData: n}); }} />
                                                                <TextInput style={styles.miniInput} placeholder="YYYY" keyboardType="numeric" value={exp.toYear} onChangeText={(v) => { const n = [...formData.experienceData]; n[i].toYear = v; setFormData({...formData, experienceData: n}); }} />
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                                <TextInput style={[styles.cardInput, {height: 60}]} multiline placeholder="Description..." value={exp.description} onChangeText={(v) => { const n = [...formData.experienceData]; n[i].description = v; setFormData({...formData, experienceData: n}); }} />
                                                <TouchableOpacity style={styles.doneBtn} onPress={() => setActiveExpIndex(null)}><Text style={styles.doneBtnText}>DONE</Text></TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={styles.summaryCard}><View style={styles.summaryInfo}><View style={styles.summaryIcon}><Briefcase size={20} color="#6366f1" /></View><View><Text style={styles.summaryTitle}>{exp.role || 'Role'} @ {exp.company || 'Company'}</Text><Text style={styles.summarySub}>{exp.fromMonth}/{exp.fromYear} - {exp.isCurrent ? 'Present' : `${exp.toMonth}/${exp.toYear}`}</Text></View></View><View style={styles.actionRow}><TouchableOpacity onPress={() => setActiveExpIndex(i)} style={styles.iconBtn}><Pencil size={16} color="#4f46e5" /></TouchableOpacity><TouchableOpacity onPress={() => setFormData({...formData, experienceData: formData.experienceData.filter((_, idx) => idx !== i)})} style={styles.iconBtn}><Trash2 size={16} color="#ef4444" /></TouchableOpacity></View></View>
                                        )}
                                    </View>
                                ))}
                                <TouchableOpacity style={styles.addBtn} onPress={() => { setFormData({...formData, experienceData: [...formData.experienceData, { company: '', role: '', fromMonth: '', fromYear: '', toMonth: '', toYear: '', isCurrent: false, description: '' }]}); setActiveExpIndex(formData.experienceData.length); }}><Plus size={18} color="#4f46e5" /><Text style={styles.addBtnText}>ADD EXPERIENCE</Text></TouchableOpacity>
                            </View>
                        )}
                        <View style={{height: 200}} />
                    </ScrollView>
                );
            case 4:
                return (
                    <ScrollView style={styles.stepContainer} keyboardShouldPersistTaps="always">
                        <Text style={styles.stepTitle}>Education Details</Text>
                        <View>
                            {formData.educationData.map((edu, i) => (
                                <View key={i} style={{ zIndex: activeEduIndex === i ? 100 : 1 }}>
                                    {activeEduIndex === i ? (
                                        <View style={styles.editCard}>
                                            <TextInput style={styles.cardInput} placeholder="University" value={edu.school} onChangeText={(val) => { const n = [...formData.educationData]; n[i].school = val; setFormData({...formData, educationData: n}); setActiveField(`edu_sch_${i}`); fetchSuggestions('university', val); }} onFocus={() => setActiveField(`edu_sch_${i}`)} />{renderSuggestions(`edu_sch_${i}`)}
                                            <TextInput style={styles.cardInput} placeholder="Degree" value={edu.degree} onChangeText={(val) => { const n = [...formData.educationData]; n[i].degree = val; setFormData({...formData, educationData: n}); setActiveField(`edu_deg_${i}`); fetchSuggestions('degree', val); }} onFocus={() => setActiveField(`edu_deg_${i}`)} />{renderSuggestions(`edu_deg_${i}`)}
                                            <TextInput style={styles.cardInput} placeholder="Field of Study" value={edu.field} onChangeText={(val) => { const n = [...formData.educationData]; n[i].field = val; setFormData({...formData, educationData: n}); }} />
                                            <View style={styles.dateRow}>
                                                <View style={{flex: 1}}><Text style={styles.microLabel}>YEAR</Text><TextInput style={styles.cardInput} placeholder="YYYY" keyboardType="numeric" value={edu.year} onChangeText={(v) => { const n = [...formData.educationData]; n[i].year = v; setFormData({...formData, educationData: n}); }} /></View>
                                                <View style={{flex: 1, marginLeft: 10}}><Text style={styles.microLabel}>STATUS</Text><TouchableOpacity onPress={() => { const n = [...formData.educationData]; n[i].isCurrent = !n[i].isCurrent; setFormData({...formData, educationData: n}); }} style={styles.checkRow}><View style={[styles.checkbox, edu.isCurrent && styles.checked]} /><Text style={styles.checkText}>PURSUING</Text></TouchableOpacity></View>
                                            </View>
                                            <TouchableOpacity style={styles.doneBtn} onPress={() => setActiveEduIndex(null)}><Text style={styles.doneBtnText}>DONE</Text></TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.summaryCard}><View style={styles.summaryInfo}><View style={styles.summaryIcon}><GraduationCap size={20} color="#6366f1" /></View><View><Text style={styles.summaryTitle}>{edu.degree} in {edu.field}</Text><Text style={styles.summarySub}>{edu.school} | {edu.isCurrent ? 'Pursuing' : edu.year}</Text></View></View><View style={styles.actionRow}><TouchableOpacity onPress={() => setActiveEduIndex(i)} style={styles.iconBtn}><Pencil size={16} color="#4f46e5" /></TouchableOpacity><TouchableOpacity onPress={() => setFormData({...formData, educationData: formData.educationData.filter((_, idx) => idx !== i)})} style={styles.iconBtn}><Trash2 size={16} color="#ef4444" /></TouchableOpacity></View></View>
                                    )}
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addBtn} onPress={() => { setFormData({...formData, educationData: [...formData.educationData, { degree: '', school: '', field: '', year: '', isCurrent: false }]}); setActiveEduIndex(formData.educationData.length); }}><Plus size={18} color="#4f46e5" /><Text style={styles.addBtnText}>ADD EDUCATION</Text></TouchableOpacity>
                        </View>
                        <View style={{height: 200}} />
                    </ScrollView>
                );
            case 5:
                return (
                    <ScrollView style={styles.stepContainer} keyboardShouldPersistTaps="always">
                        <Text style={styles.stepTitle}>Skills & Levels</Text>
                        <View style={[styles.inputWrapper, { zIndex: 100 }]}>
                            <View style={styles.inputWithIcon}><Search size={18} color="#94a3b8" /><TextInput style={styles.flexInput} placeholder="Search skills..." onChangeText={(val) => { setActiveField('skills'); fetchSuggestions('skill', val); }} onFocus={() => setActiveField('skills')} /></View>
                            {renderSuggestions('skills')}
                        </View>
                        <View style={styles.skillList}>
                            {formData.skills.map((s, i) => (
                                <View key={i} style={styles.skillRow}>
                                    <View style={styles.skillInfo}><Text style={styles.skillName}>{s.name}</Text><TouchableOpacity onPress={() => setFormData({...formData, skills: formData.skills.filter(sk => sk.name !== s.name)})}><X size={14} color="#ef4444" /></TouchableOpacity></View>
                                    <View style={styles.levelRow}>
                                        {['Beginner', 'Intermediate', 'Expert'].map(l => (<TouchableOpacity key={l} style={[styles.levelBtn, s.level === l && styles.levelActive]} onPress={() => handleSkillLevelChange(s.name, l)}><Text style={[styles.levelText, s.level === l && styles.levelTextActive]}>{l}</Text></TouchableOpacity>))}
                                    </View>
                                </View>
                            ))}
                        </View>
                        <Text style={[styles.sectionTitle, {marginTop: 20}]}>Locations & Salary</Text>
                        <View style={[styles.inputWrapper, { zIndex: 90 }]}>
                            <View style={styles.inputWithIcon}><MapPin size={18} color="#94a3b8" /><TextInput style={styles.flexInput} placeholder="Add preferred cities..." onChangeText={(val) => { setActiveField('preferredLocations'); fetchSuggestions('location', val); }} onFocus={() => setActiveField('preferredLocations')} /></View>
                            {renderSuggestions('preferredLocations')}
                        </View>
                        <View style={styles.skillBadgeRow}>{formData.preferredLocations.map((l, i) => (<View key={i} style={styles.skillBadge}>
                            <Text style={styles.skillText}>{typeof l === 'object' ? l.name : l}</Text>
                            <TouchableOpacity onPress={() => setFormData({...formData, preferredLocations: formData.preferredLocations.filter(loc => loc !== l)})}><X size={12} color="#4f46e5" style={{marginLeft: 5}}/></TouchableOpacity>
                        </View>))}</View>
                        <View style={styles.row}>
                            <View style={{flex: 1, marginRight: 10}}><Text style={styles.label}>Current Salary</Text><TextInput style={styles.input} placeholder="LPA" keyboardType="numeric" value={formData.currentSalary} onChangeText={(v) => setFormData({...formData, currentSalary: v})}/></View>
                            <View style={{flex: 1}}><Text style={styles.label}>Expected Salary</Text><TextInput style={styles.input} placeholder="LPA" keyboardType="numeric" value={formData.expectedSalary} onChangeText={(v) => setFormData({...formData, expectedSalary: v})}/></View>
                        </View>
                        <Text style={[styles.sectionTitle, {marginTop: 20}]}>Social Links</Text>
                        <View style={styles.socialRow}><Globe size={20} color="#0077b5" /><TextInput style={styles.socialInput} placeholder="LinkedIn URL" value={formData.socialLinks.linkedin} onChangeText={(v) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: v}})}/></View>
                        <View style={styles.socialRow}><User size={20} color="#333" /><TextInput style={styles.socialInput} placeholder="GitHub URL" value={formData.socialLinks.github} onChangeText={(v) => setFormData({...formData, socialLinks: {...formData.socialLinks, github: v}})}/></View>
                        <View style={{height: 100}} />
                    </ScrollView>
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StepIndicator step={step} progress={progress} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>{renderStepContent()}</KeyboardAvoidingView>
            <View style={styles.footer}>
                <TouchableOpacity style={[styles.backBtn, step === 1 && { opacity: 0 }]} onPress={() => setStep(step - 1)} disabled={step === 1}><ArrowLeft size={20} color="#64748b" /><Text style={styles.backBtnText}>BACK</Text></TouchableOpacity>
                <TouchableOpacity style={styles.nextBtn} onPress={step === 5 ? handleSubmit : () => setStep(step + 1)} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <><Text style={styles.nextBtnText}>{step === 5 ? 'ACTIVATE' : 'NEXT'}</Text><ChevronRight size={20} color="#fff" /></>}</TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    stepHeader: { padding: 25, paddingTop: 50 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    stepText: { fontSize: 13, fontWeight: '800', color: '#6366f1', textTransform: 'uppercase' },
    progressPercent: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
    progressBarBg: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: '#6366f1' },
    stepContainer: { padding: 25, flex: 1 },
    photoSection: { alignItems: 'center', marginBottom: 30 },
    photoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    profileImg: { width: 100, height: 100, borderRadius: 50 },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6366f1', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    photoTitle: { marginTop: 10, fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    iconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#eef2ff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    stepTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginBottom: 15 },
    stepSub: { fontSize: 14, color: '#64748b', lineHeight: 22, marginBottom: 30 },
    uploadBox: { height: 120, borderWidth: 2, borderStyle: 'dashed', borderColor: '#e2e8f0', borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    uploadText: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 10 },
    uploadLimit: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    divider: { flex: 1, height: 1, backgroundColor: '#f1f5f9' },
    dividerText: { fontSize: 10, fontWeight: '800', color: '#cbd5e1', marginHorizontal: 15 },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 8, textTransform: 'uppercase' },
    input: { height: 55, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 15, fontWeight: '600', color: '#0f172a', borderWidth: 1, borderColor: '#f1f5f9' },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', height: 55, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#f1f5f9' },
    flexInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600' },
    suggestionsBox: { position: 'absolute', top: 60, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#e2e8f0', elevation: 10, zIndex: 9999, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, overflow: 'hidden' },
    suggestionItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    suggestionText: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 25 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: '#fff', elevation: 2 },
    tabText: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8' },
    activeTabText: { color: '#4f46e5' },
    summaryCard: { padding: 15, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    summaryIcon: { width: 36, height: 36, backgroundColor: '#f8fafc', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    summaryTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    summarySub: { fontSize: 11, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
    actionRow: { flexDirection: 'row' },
    iconBtn: { backgroundColor: '#f8fafc', borderRadius: 8, padding: 8, marginLeft: 5 },
    editCard: { padding: 20, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
    cardInput: { height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, fontSize: 14, fontWeight: '600', marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    doneBtn: { backgroundColor: '#0f172a', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    doneBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
    addBtnText: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5', marginLeft: 8 },
    dateRow: { flexDirection: 'row', marginBottom: 12 },
    selectRow: { flexDirection: 'row', gap: 5 },
    miniInput: { flex: 1, height: 40, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', textAlign: 'center', fontSize: 12, fontWeight: '600' },
    microLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    checkbox: { width: 14, height: 14, borderRadius: 4, borderWidth: 1, borderColor: '#6366f1', marginRight: 8 },
    checked: { backgroundColor: '#6366f1' },
    checkText: { fontSize: 10, fontWeight: '800', color: '#6366f1' },
    skillList: { marginTop: 10 },
    skillRow: { backgroundColor: '#fff', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 12 },
    skillInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    skillName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a' },
    levelRow: { flexDirection: 'row', gap: 8 },
    levelBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#f1f5f9' },
    levelActive: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
    levelText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' },
    levelTextActive: { color: '#fff' },
    sectionTitle: { fontSize: 14, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 },
    skillBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    skillBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    skillText: { fontSize: 12, fontWeight: 'bold', color: '#4f46e5' },
    row: { flexDirection: 'row', marginTop: 15 },
    socialRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 15, height: 55, marginTop: 12, borderWidth: 1, borderColor: '#f1f5f9' },
    socialInput: { flex: 1, marginLeft: 12, fontSize: 13, fontWeight: '600' },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    backBtn: { flexDirection: 'row', alignItems: 'center' },
    backBtnText: { marginLeft: 8, fontSize: 14, fontWeight: '800', color: '#64748b' },
    nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4f46e5', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 16, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', marginRight: 10, letterSpacing: 1 }
});

export default ProfileSetupScreen;
