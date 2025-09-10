// resources/js/components/ui/notification-toast.tsx

import { Button } from '@/components/ui/button';
import { usePage, router } from '@inertiajs/react';
import { CheckCircle, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FlashMessage {
    title: string;
    message: string;
}

interface PagePropsWithFlash {
    flash: {
        success?: FlashMessage;
        error?: FlashMessage;
    };
    [key: string]: unknown;
}

interface NotificationItem extends FlashMessage {
    type: 'success' | 'error';
    id: string;
}

export default function NotificationToast() {
    const { flash } = usePage<PagePropsWithFlash>().props;
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    // Function to clear flash data
    const clearFlashData = () => {
        router.reload({
            only: [],
            // preserveState: true,
            // preserveScroll: true,
        });
    };

    useEffect(() => {
        const newNotifications: NotificationItem[] = [];
        
        // Periksa apakah flash dan properti success/error ada
        if (flash?.success) {
            newNotifications.push({
                ...flash.success,
                type: 'success',
                id: `success-${Date.now()}`,
            });
        }
        
        if (flash?.error) {
            newNotifications.push({
                ...flash.error,
                type: 'error',
                id: `error-${Date.now()}`,
            });
        }

        if (newNotifications.length > 0) {
            setNotifications(prev => [...prev, ...newNotifications]);

            // Auto dismiss after 3 seconds dan clear flash data
            newNotifications.forEach(notification => {
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== notification.id));
                    
                    // Clear flash data setelah notification hilang
                    setTimeout(() => {
                        clearFlashData();
                    }, 100); // Delay kecil untuk memastikan state sudah terupdate
                }, 3000);
            });
        }
    }, [flash]);

    const dismissNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Clear flash data ketika notification di-close manual
        setTimeout(() => {
            clearFlashData();
        }, 100);
    };

    if (notifications.length === 0) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 left-4 sm:left-auto space-y-2 z-50 pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`w-full sm:w-96 p-3 sm:p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out pointer-events-auto ${
                        notification.type === 'success'
                            ? 'border-l-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                            : 'border-l-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
                    } border`}
                    role="alert"
                >
                    <div className="flex items-start justify-between w-full">
                        <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                            {notification.type === 'success' ? (
                                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 dark:text-green-400 shrink-0" />
                            ) : (
                                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-0.5 dark:text-red-400 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs sm:text-sm font-medium mb-1 ${
                                    notification.type === 'success' 
                                        ? 'text-green-800 dark:text-green-200' 
                                        : 'text-red-800 dark:text-red-200'
                                }`}>
                                    {notification.title}
                                </div>
                                {notification.message && (
                                    <div className={`text-xs sm:text-sm ${
                                        notification.type === 'success' 
                                            ? 'text-green-700 dark:text-green-300' 
                                            : 'text-red-700 dark:text-red-300'
                                    }`}>
                                        {notification.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissNotification(notification.id)}
                            className={`h-5 w-5 sm:h-6 sm:w-6 p-0 ml-1 sm:ml-2 shrink-0 hover:bg-transparent ${
                                notification.type === 'success' 
                                    ? 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200' 
                                    : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200'
                            }`}
                        >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}