import React from 'react';

// Helper for Icons
const Icon = ({ name, className = "" }) => <span className={`material-symbols-outlined ${className}`}>{name}</span>;

export const StatsGrid = ({ stats }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#2a1733] p-6 rounded-2xl border border-[#e1cdea]/50 dark:border-[#4a2e55] shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-primary-light/50 dark:bg-primary/20 rounded-lg text-primary"><Icon name="schedule" /></div>
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">+2h</span>
            </div>
            <div className="mt-4"><p className="text-text-secondary text-sm font-medium">Service Hours</p><h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.serviceHours}h</h3></div>
        </div>
        <div className="bg-white dark:bg-[#2a1733] p-6 rounded-2xl border border-[#e1cdea]/50 dark:border-[#4a2e55] shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><Icon name="groups" /></div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">+5%</span>
            </div>
            <div className="mt-4"><p className="text-text-secondary text-sm font-medium">Attendance Rate</p><h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.attendanceRate}%</h3></div>
        </div>
        <div className="bg-white dark:bg-[#2a1733] p-6 rounded-2xl border border-[#e1cdea]/50 dark:border-[#4a2e55] shadow-sm flex flex-col gap-1">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600"><Icon name="task_alt" /></div>
                <span className="text-xs font-bold text-text-secondary bg-gray-100 px-2 py-1 rounded-full">Goal: {stats.weeklyGoal}</span>
            </div>
            <div className="mt-4"><p className="text-text-secondary text-sm font-medium">Tasks Completed</p><h3 className="text-3xl font-bold text-text-main dark:text-white">{stats.tasksCompleted}</h3></div>
        </div>
    </div>
);

export const ProjectsList = ({ projects }) => (
    <div className="bg-white dark:bg-[#2a1733] rounded-2xl border border-[#e1cdea]/50 dark:border-[#4a2e55] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-main dark:text-white">Assigned Projects</h2>
            <button className="text-primary hover:text-primary-dark text-sm font-bold flex items-center gap-1">View All <Icon name="arrow_forward" className="text-sm" /></button>
        </div>
        <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
                <div key={project.id} className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-background-light dark:bg-[#362041] border border-transparent hover:border-[#e1cdea]/50 transition-all">
                    <div className={`h-12 w-12 rounded-lg ${project.iconBg} ${project.iconColor} flex items-center justify-center flex-shrink-0`}><Icon name={project.icon} /></div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-text-main dark:text-white">{project.title}</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-white/10 rounded border border-gray-100 dark:border-white/10 text-text-secondary dark:text-gray-300">{project.role}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                            <div className={`${project.progressColor || 'bg-primary'} h-1.5 rounded-full`} style={{ width: `${project.progress}%` }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const TaskList = ({ tasks, toggleTask }) => (
    <div className="bg-white dark:bg-[#2a1733] rounded-2xl border border-[#e1cdea]/50 dark:border-[#4a2e55] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-main dark:text-white">My Tasks</h2>
            <button className="h-8 w-8 rounded-full bg-primary-light/30 text-primary flex items-center justify-center"><Icon name="add" className="text-sm" /></button>
        </div>
        <div className="space-y-1">
            {tasks.map((task) => (
                <label key={task.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-background-light dark:hover:bg-[#362041] cursor-pointer transition-colors group">
                    <div className="relative flex items-center mt-0.5">
                        <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:border-primary checked:bg-primary transition-all" />
                        <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none">check</span>
                    </div>
                    <div className="flex-1">
                        <p className={`text-text-main dark:text-white font-medium text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>{task.title}</p>
                        <p className="text-xs text-text-secondary mt-1">{task.category} • <span className={task.priority === 'High Priority' ? 'text-red-500 font-semibold' : ''}>{task.priority}</span></p>
                    </div>
                </label>
            ))}
        </div>
    </div>
);

export const UpcomingEvents = ({ events }) => (
    <div className="bg-white dark:bg-[#2a1733] rounded-2xl border border-[#e1cdea]/50 dark:border-[#4a2e55] shadow-sm p-6 h-full">
        <h2 className="text-xl font-bold text-text-main dark:text-white mb-6">Upcoming Events</h2>
        <div className="relative pl-4 border-l-2 border-gray-100 dark:border-[#4a2e55] space-y-8">
            {events.map((event) => (
                <div key={event.id} className="relative">
                    <div className={`absolute -left-[21px] top-1 h-3 w-3 rounded-full ${event.active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'} ring-4 ring-white dark:ring-[#2a1733]`}></div>
                    <div className="flex flex-col gap-1">
                        <p className={`text-xs font-bold uppercase tracking-wide ${event.active ? 'text-primary' : 'text-gray-400'}`}>{event.date}</p>
                        <h4 className="font-bold text-text-main dark:text-white">{event.title}</h4>
                        <p className="text-sm text-text-secondary">{event.location}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);