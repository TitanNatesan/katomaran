import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import TaskForm from './TaskForm';
import ShareTaskForm from './ShareTaskForm';
import { Edit, Trash2, Share, Calendar, Flag, User, Users } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const TaskList = ({ tasks }) => {
    const { deleteTask } = useTasks();
    const [editingTask, setEditingTask] = useState(null);
    const [sharingTask, setSharingTask] = useState(null);

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'in progress':
                return 'text-blue-600 bg-blue-100';
            case 'pending':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const isOverdue = (dueDate, status) => {
        return dueDate && dayjs(dueDate).isBefore(dayjs()) && status !== 'completed';
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(taskId);
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                    <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-600">Create your first task to get started!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                    <Card
                        key={task._id}
                        className={`transition-shadow hover:shadow-md ${isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''
                            }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg">{task.title}</CardTitle>
                                <div className="flex space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingTask(task)}
                                        className="h-8 w-8"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSharingTask(task)}
                                        className="h-8 w-8"
                                    >
                                        <Share className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(task._id)}
                                        className="h-8 w-8 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {task.description && (
                                <CardDescription className="text-sm">
                                    {task.description}
                                </CardDescription>
                            )}
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {/* Status and Priority */}
                                <div className="flex space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                        <Flag className="h-3 w-3 mr-1" />
                                        {task.priority}
                                    </span>
                                </div>

                                {/* Due Date */}
                                {task.dueDate && (
                                    <div className={`flex items-center text-sm ${isOverdue(task.dueDate, task.status) ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>
                                            Due {dayjs(task.dueDate).fromNow()}
                                            {isOverdue(task.dueDate, task.status) && ' (Overdue)'}
                                        </span>
                                    </div>
                                )}

                                {/* Creator and Shared Users */}
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-1" />
                                        <span>{task.creator?.name || 'Unknown'}</span>
                                    </div>

                                    {task.sharedWith && task.sharedWith.length > 0 && (
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-1" />
                                            <span>{task.sharedWith.length} shared</span>
                                        </div>
                                    )}
                                </div>

                                {/* Timestamps */}
                                <div className="text-xs text-gray-500">
                                    Created {dayjs(task.createdAt).fromNow()}
                                    {task.updatedAt !== task.createdAt && (
                                        <span> • Updated {dayjs(task.updatedAt).fromNow()}</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Task Modal */}
            <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    {editingTask && (
                        <TaskForm
                            task={editingTask}
                            onSuccess={() => setEditingTask(null)}
                            onCancel={() => setEditingTask(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Share Task Modal */}
            <Dialog open={!!sharingTask} onOpenChange={() => setSharingTask(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Task</DialogTitle>
                    </DialogHeader>
                    {sharingTask && (
                        <ShareTaskForm
                            task={sharingTask}
                            onSuccess={() => setSharingTask(null)}
                            onCancel={() => setSharingTask(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default TaskList;
