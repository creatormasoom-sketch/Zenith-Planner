
import React, { useState, useEffect, useRef } from 'react';
import Icon from '../shared/Icon';
import { usePlanner } from '../../hooks/usePlanner';

interface HeaderProps {
    currentView: 'planner' | 'academics';
    setCurrentView: (view: 'planner' | 'academics') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const { exportData, importData } = usePlanner();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importData(file);
        }
    };
    
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Zenith Planner</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                             <button
                                onClick={() => setCurrentView('planner')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${currentView === 'planner' ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                Planner
                            </button>
                            <button
                                onClick={() => setCurrentView('academics')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${currentView === 'academics' ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                Academics
                            </button>
                        </div>

                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name={theme === 'light' ? 'moon' : 'sun'} className="h-5 w-5"/>
                        </button>
                        
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <button onClick={handleImportClick} title="Import Data" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name="upload" className="h-5 w-5" />
                        </button>
                        <button onClick={exportData} title="Export Data" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Icon name="download" className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
