import React from 'react';

const Sidebar = ({ user }) => {
    const menuItems = [
        { icon: "dashboard", label: "Dashboard", active: true },
        { icon: "work", label: "Projects", active: false },
        { icon: "check_box", label: "Tasks", active: false },
        { icon: "calendar_month", label: "Events", active: false },
        { icon: "person", label: "My Profile", active: false },
        { icon: "settings", label: "Settings", active: false },
    ];

    return (
        <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-[#2a1733] border-r border-[#e1cdea] dark:border-[#4a2e55] h-full p-6 justify-between flex-shrink-0">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3 px-2">
                    <div className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shadow-sm bg-primary" style={{ backgroundImage: 'url("https://via.placeholder.com/40")' }}></div>
                    <div className="flex flex-col">
                        <h1 className="text-text-main dark:text-white text-lg font-bold leading-tight">Rotaract Portal</h1>
                        <p className="text-text-secondary dark:text-[#c48be3] text-xs font-medium">Member System</p>
                    </div>
                </div>
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item, index) => (
                        <a key={index} href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${item.active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-text-main dark:text-gray-200 hover:bg-primary-light/50 dark:hover:bg-primary/20"}`}>
                            <span className={`material-symbols-outlined ${item.active ? "text-white" : "group-hover:text-primary"}`} style={{ fontVariationSettings: `'FILL' ${item.active ? 1 : 0}` }}>{item.icon}</span>
                            <p className={`text-sm font-medium ${item.active ? "font-semibold" : ""}`}>{item.label}</p>
                        </a>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-3 p-3 bg-background-light dark:bg-[#362041] rounded-xl border border-transparent dark:border-[#4a2e55]">
                <div className="h-10 w-10 rounded-full bg-gray-200 bg-center bg-cover" style={{ backgroundImage: `url(${user.avatar || 'https://via.placeholder.com/40'})` }}></div>
                <div className="flex flex-col overflow-hidden">
                    <p className="text-sm font-bold truncate text-text-main dark:text-white">{user.name}</p>
                    <p className="text-xs text-text-secondary truncate">{user.role}</p>
                </div>
                <button className="ml-auto text-text-secondary hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;