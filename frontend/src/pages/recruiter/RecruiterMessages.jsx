import React from 'react';
import ChatBox from '../../components/ChatBox';
import { MessageSquare, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const RecruiterMessages = () => {
    const { isSupportEnabled } = useSelector(store => store.auth);
    const adminId = '00000000-0000-0000-0000-000000000000'; 

    if (!isSupportEnabled) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
                <AlertCircle size={48} className="mx-auto text-amber-500 opacity-50" />
                <h2 className="text-xl font-bold text-slate-800">Support System Offline</h2>
                <p className="text-sm text-slate-500">The platform messaging system is currently disabled by administrators.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                        <MessageSquare className="text-indigo-600" /> Platform Support
                    </h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Direct communication channel with JobPortal Administrators.</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                    <ShieldCheck size={14}/> Verified Connection
                </div>
            </div>

            <div className="bg-slate-50 rounded-[32px] p-1 shadow-inner">
                <ChatBox 
                    otherId={adminId} 
                    otherName="JobPortal Support" 
                    otherLogo={null} 
                    currentUserRole="company" 
                />
            </div>
        </div>
    );
};

export default RecruiterMessages;
