
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { usePlanner } from '../../hooks/usePlanner';
import { Class, Subject, Chapter } from '../../types';
import ChapterDetails from './ChapterDetails';
import Icon from '../shared/Icon';
import Modal from '../shared/Modal';

const AcademicsView: React.FC = () => {
    const { state, addClass, deleteClass, addSubject, deleteSubject, addChapter, updateChapter } = usePlanner();
    const [activeClassId, setActiveClassId] = useState<string | null>(state.classes[0]?.id || null);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'addClass' | 'addSubject' | 'addChapter' | 'editChapter' | null>(null);
    const [modalInput, setModalInput] = useState('');
    const [currentSubjectId, setCurrentSubjectId] = useState<string | null>(null);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setModalInput('');
        setModalMode(null);
        setCurrentSubjectId(null);
        setEditingChapter(null);
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            // Timeout ensures the element is in the DOM and ready for focus
            setTimeout(() => {
                inputRef.current?.focus();
                if (modalMode === 'editChapter') {
                    inputRef.current?.select();
                }
            }, 100);
        }
    }, [isModalOpen, modalMode]);

    const activeClass = state.classes.find(c => c.id === activeClassId);

    const handleAddClass = () => {
        setModalMode('addClass');
        setModalInput('');
        setIsModalOpen(true);
    };

    const handleAddSubject = () => {
        if (!activeClassId) return;
        setModalMode('addSubject');
        setModalInput('');
        setIsModalOpen(true);
    };

    const handleAddChapter = (subjectId: string) => {
        setCurrentSubjectId(subjectId);
        setModalMode('addChapter');
        setModalInput('');
        setIsModalOpen(true);
    };

    const handleEditChapter = (chapter: Chapter, subjectId: string) => {
        setCurrentSubjectId(subjectId);
        setEditingChapter(chapter);
        setModalInput(chapter.title);
        setModalMode('editChapter');
        setIsModalOpen(true);
    };

    const handleDeleteClass = (classId: string) => {
        if (window.confirm("Are you sure you want to delete this class and all its subjects and chapters?")) {
            deleteClass(classId);
            if(activeClassId === classId) {
                setActiveClassId(state.classes[0]?.id || null);
            }
        }
    };
    
    const handleDeleteSubject = (subjectId: string) => {
        if (window.confirm("Are you sure you want to delete this subject and all its chapters?")) {
            if(activeClassId) deleteSubject(activeClassId, subjectId);
        }
    };

    const handleModalSubmit = () => {
        if (!modalInput.trim()) return;

        if (modalMode === 'addClass') addClass(modalInput);
        if (modalMode === 'addSubject' && activeClassId) addSubject(activeClassId, modalInput);
        if (modalMode === 'addChapter' && activeClassId && currentSubjectId) addChapter(activeClassId, currentSubjectId, { title: modalInput });
        if (modalMode === 'editChapter' && activeClassId && currentSubjectId && editingChapter) {
            updateChapter(activeClassId, currentSubjectId, { ...editingChapter, title: modalInput });
        }
        
        handleCloseModal();
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'addClass': return 'Add New Class';
            case 'addSubject': return 'Add New Subject';
            case 'addChapter': return 'Add New Chapter';
            case 'editChapter': return 'Edit Chapter';
            default: return '';
        }
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Classes</h2>
                <div className="flex items-center gap-2 pb-2 overflow-x-auto">
                    {state.classes.map((cls: Class) => (
                         <div key={cls.id} className="relative group">
                            <button
                                onClick={() => setActiveClassId(cls.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${activeClassId === cls.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                {cls.title}
                            </button>
                             <button onClick={() => handleDeleteClass(cls.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Icon name="x" className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                    <button onClick={handleAddClass} className="p-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
                        <Icon name="plus" className="w-5 h-5 text-blue-600"/>
                    </button>
                </div>
            </div>

            {activeClass ? (
                <div className="space-y-8">
                    {activeClass.subjects.map((sub: Subject) => (
                        <div key={sub.id}>
                            <div className="flex items-center gap-4 mb-3">
                                <h3 className="text-lg font-bold">{sub.title}</h3>
                                <button onClick={() => handleDeleteSubject(sub.id)} className="text-gray-400 hover:text-red-500">
                                    <Icon name="delete" className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 pb-2 overflow-x-auto">
                                {sub.chapters.map((chap: Chapter) => (
                                    <ChapterDetails 
                                        key={chap.id} 
                                        classId={activeClass.id} 
                                        subjectId={sub.id} 
                                        chapter={chap} 
                                        onEdit={(c) => handleEditChapter(c, sub.id)}
                                    />
                                ))}
                                <button onClick={() => handleAddChapter(sub.id)} className="p-4 rounded-lg bg-white dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0 self-stretch flex items-center justify-center">
                                    <Icon name="plus" className="w-6 h-6 text-blue-600"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    <div>
                         <button onClick={handleAddSubject} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400">
                            <Icon name="plus" className="w-4 h-4"/>
                            Add Subject
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">No classes found. Add a class to get started.</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()} size="xl">
                <div className="space-y-4">
                    <label htmlFor="modal-textarea" className="sr-only">Enter title</label>
                    <textarea
                        id="modal-textarea"
                        ref={inputRef}
                        value={modalInput}
                        onChange={e => setModalInput(e.target.value)}
                        rows={4}
                        className="w-full resize-y rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        placeholder="Enter title..."
                        onKeyDown={e => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleModalSubmit();
                            }
                        }}
                    />
                    <div className="flex justify-end gap-2">
                        <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                        <button onClick={handleModalSubmit} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Save</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AcademicsView;
