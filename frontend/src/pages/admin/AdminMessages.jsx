import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search, MessageSquare, Building2, ChevronRight } from 'lucide-react';
import ChatBox from '../../components/ChatBox';

const AdminMessages = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await axios.get("https://mediumturquoise-goshawk-440855.hostingersite.com/api/v1/message/admin/chats", { withCredentials: true });
                if (res.data.success) setCompanies(res.data.companies);
            } catch (error) {
                console.error("Chat list fail");
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    const filtered = companies.filter(c => c.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-500">
            {/* Sidebar Chat List */}
            <div className="w-80 flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search chats..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs focus:bg-white focus:border-indigo-200 outline-none transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest opacity-50">No chats found</div>
                    ) : (
                        filtered.map(company => (
                            <button 
                                key={company.id}
                                onClick={() => setSelectedCompany(company)}
                                className={`w-full p-4 flex items-center gap-3 transition-all border-b border-slate-50 last:border-0 hover:bg-slate-50 ${selectedCompany?.id === company.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600 pl-3' : ''}`}
                            >
                                <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                    {company.logo ? <img src={company.logo} className="w-full h-full object-cover" alt="L"/> : <Building2 size={18} className="text-slate-300"/>}
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-700 truncate">{company.companyName}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Recruiter</p>
                                </div>
                                <ChevronRight size={14} className="text-slate-300" />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1">
                {selectedCompany ? (
                    <ChatBox 
                        otherId={selectedCompany.id} 
                        otherName={selectedCompany.companyName} 
                        otherLogo={selectedCompany.logo} 
                        currentUserRole="admin" 
                    />
                ) : (
                    <div className="h-full bg-white border border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-300 opacity-50">
                        <MessageSquare size={64} className="mb-4" />
                        <p className="text-sm font-bold uppercase tracking-[0.2em]">Select a conversation to start</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
