import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Search, Filter, LogOut, User } from 'lucide-react';
import dayjs from 'dayjs';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const { tasks, filters, setFilters, loading } = useTasks();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters({ search: searchTerm, page: 1 });
    };

    const handleFilterChange = (filterType, value) => {
        setFilters({ [filterType]: value, page: 1 });
    };

    const getTaskStats = () => {
        const today = dayjs().format('YYYY-MM-DD');
        const stats = {
            total: tasks.length,
            completed: tasks.filter(task => task.status === 'completed').length,
            pending: tasks.filter(task => task.status === 'pending').length,
            overdue: tasks.filter(task =>
                task.dueDate && dayjs(task.dueDate).isBefore(today) && task.status !== 'completed'
            ).length,
            dueToday: tasks.filter(task =>
                task.dueDate && dayjs(task.dueDate).format('YYYY-MM-DD') === today
            ).length,
        };
        return stats;
    };

    const stats = getTaskStats();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
                            <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Task
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Create New Task</DialogTitle>
                                    </DialogHeader>
                                    <TaskForm
                                        onSuccess={() => setIsCreateModalOpen(false)}
                                        onCancel={() => setIsCreateModalOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Button variant="outline" onClick={logout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total Tasks</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                            <div className="text-sm text-gray-600">Pending</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                            <div className="text-sm text-gray-600">Overdue</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600">{stats.dueToday}</div>
                            <div className="text-sm text-gray-600">Due Today</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </form>

                            {/* Status Filter */}
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>

                            {/* Priority Filter */}
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>

                            {/* Clear Filters */}
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilters({ status: '', priority: '', search: '', page: 1 });
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Task List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Tasks</CardTitle>
                        <CardDescription>
                            Manage and track your tasks efficiently
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2">Loading tasks...</span>
                            </div>
                        ) : (
                            <TaskList tasks={tasks} />
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
};

export default Dashboard;
