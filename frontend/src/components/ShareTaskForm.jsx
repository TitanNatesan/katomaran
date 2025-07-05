import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { toast } from 'react-toastify';
import { Share, X, Plus, Trash2 } from 'lucide-react';

const ShareTaskForm = ({ task, onSuccess, onCancel }) => {
    const { shareTask } = useTasks();
    const [loading, setLoading] = useState(false);
    const [emails, setEmails] = useState(['']);

    const addEmailField = () => {
        setEmails([...emails, '']);
    };

    const removeEmailField = (index) => {
        if (emails.length > 1) {
            setEmails(emails.filter((_, i) => i !== index));
        }
    };

    const updateEmail = (index, value) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validEmails = emails.filter(email => email.trim() && email.includes('@'));

        if (validEmails.length === 0) {
            toast.error('Please enter at least one valid email address');
            return;
        }

        setLoading(true);

        try {
            await shareTask(task._id, validEmails);
            onSuccess();
        } catch (error) {
            console.error('Failed to share task:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Share "{task.title}"</h3>
                <p className="text-sm text-gray-600">
                    Enter email addresses of users you want to share this task with.
                </p>
            </div>

            {/* Current shared users */}
            {task.sharedWith && task.sharedWith.length > 0 && (
                <div className="space-y-2">
                    <Label>Currently shared with:</Label>
                    <div className="space-y-1">
                        {task.sharedWith.map((user, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>{user.name} ({user.email})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                    <Label>Share with new users:</Label>
                    {emails.map((email, index) => (
                        <div key={index} className="flex space-x-2">
                            <Input
                                type="email"
                                placeholder="Enter email address"
                                value={email}
                                onChange={(e) => updateEmail(index, e.target.value)}
                                className="flex-1"
                            />
                            {emails.length > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeEmailField(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            {index === emails.length - 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={addEmailField}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Share className="h-4 w-4 mr-2" />
                                Share Task
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ShareTaskForm;
