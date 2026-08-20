import React, { useState, useEffect } from 'react';
import Sidebar from '../../Components/MemberComponent/SideBarComponent';
import { StatsGrid, ProjectsList, TaskList, UpcomingEvents } from '../../Components/MemberComponent/DashboardWidgets';

const MemberDashboard = () => {
    // State for data
    const [user, setUser] = useState({ name: "Loading...", role: "", avatar: "" });
    const [stats, setStats] = useState({ serviceHours: 0, attendanceRate: 0, tasksCompleted: 0, weeklyGoal: 0 });
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [events, setEvents] = useState([]);

    // Fetch data (Simulated for now, connect to MongoDB later)
    useEffect(() => {
        setUser({ name: "Alex Morgan", role: "Member", avatar: "https://via.placeholder.com/150" });
        setStats({ serviceHours: 24, attendanceRate: 85, tasksCompleted: 12, weeklyGoal: 15 });

        setProjects([
            { id: 1, title: "Community Clean-up Drive", role: "Lead Coordinator", dueDate: "Oct 15", progress: 75, icon: "park", iconBg: "bg-green-100", iconColor: "text-green-600" },
            { id: 2, title: "Fundraiser Gala 2024", role: "Logistics", dueDate: "Nov 20", progress: 40, icon: "local_activity", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", progressColor: "bg-yellow-500" }
        ]);

        setTasks([
            { id: 1, title: "Prepare agenda for board meeting", category: "Due Today", priority: "High Priority", completed: false },
            { id: 2, title: "Call venue for Gala reservation", category: "Fundraiser Gala", priority: "Medium", completed: true },
            { id: 3, title: "Draft monthly newsletter content", category: "Communication", priority: "Low", completed: false },
        ]);

        setEvents([
            { id: 1, title: "Board Meeting", date: "Tomorrow, 10:00 AM", location: "Conference Room A", active: true },
            { id: 2, title: "Weekly Club Assembly", date: "Oct 24, 6:00 PM", location: "Community Hall", active: false },
            { id: 3, title: "Charity Run Setup", date: "Oct 28, 9:00 AM", location: "Central Park", active: false }
        ]);
    }, []);

    const toggleTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col overflow-hidden text-text-main">
            <div className="flex h-screen w-full overflow-hidden">

                {/* Sidebar Component */}
                <Sidebar user={user} />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                    <div className="container mx-auto max-w-7xl p-4 md:p-8 lg:p-10 flex flex-col gap-8">

                        {/* Header Section */}
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">
                                    Welcome back, {user.name.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-text-secondary dark:text-gray-400 text-base">Here's what's happening with your club activities today.</p>
                            </div>

                            <div className="flex items-center gap-4 bg-white dark:bg-[#2a1733] p-2 rounded-xl shadow-sm border border-[#e1cdea]/50 dark:border-[#4a2e55]">
                                <div className="flex items-center gap-2 px-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <span className="text-sm font-bold text-text-main dark:text-white">Available</span>
                                </div>
                            </div>
                        </header>

                        {/* Dashboard Widgets */}
                        <StatsGrid stats={stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <ProjectsList projects={projects} />
                                <TaskList tasks={tasks} toggleTask={toggleTask} />
                            </div>
                            <div className="flex flex-col gap-6">
                                <UpcomingEvents events={events} />
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default MemberDashboard;