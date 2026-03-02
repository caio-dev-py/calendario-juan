import React, { useState } from 'react';
import BusinessHours from '../components/admin/BusinessHours';
import BlockedDates from '../components/admin/BlockedDates';
import { Settings, Clock, CalendarOff } from 'lucide-react';

/**
 * Página de configurações do painel admin.
 */
export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('hours');

    const tabs = [
        { key: 'hours', label: 'Horário Comercial', icon: Clock },
        { key: 'blocked', label: 'Datas Bloqueadas', icon: CalendarOff },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-[-0.01em]">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/[0.12] ring-1 ring-purple-500/20">
                        <Settings size={20} className="text-purple-400" />
                    </div>
                    Configurações
                </h1>
                <p className="text-sm text-gray-500 mt-2.5 ml-[52px]">
                    Configure seu horário de trabalho e gerencie datas bloqueadas.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.05] rounded-xl mb-8 w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-300 ease-out cursor-pointer ${activeTab === tab.key
                                ? 'bg-purple-500/[0.15] text-purple-300 shadow-sm'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                                }`}
                        >
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Conteúdo da tab ativa */}
            <div className="max-w-2xl">
                {activeTab === 'hours' && <BusinessHours />}
                {activeTab === 'blocked' && <BlockedDates />}
            </div>
        </div>
    );
}
