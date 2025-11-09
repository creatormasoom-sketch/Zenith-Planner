
import React from 'react';
import { Chapter } from '../../types';
import { usePlanner } from '../../hooks/usePlanner';
import Icon from '../shared/Icon';

interface ChapterDetailsProps {
    classId: string;
    subjectId: string;
    chapter: Chapter;
    onEdit: (chapter: Chapter) => void;
}

const ChapterDetails: React.FC<ChapterDetailsProps> = ({ classId, subjectId, chapter, onEdit }) => {
    const { deleteChapter, incrementChapterCount, decrementChapterCount } = usePlanner();

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete chapter: "${chapter.title}"?`)) {
            deleteChapter(classId, subjectId, chapter.id);
        }
    };

    const countTypes: ('lectures' | 'dpps' | 'tests')[] = ['lectures', 'dpps', 'tests'];

    return (
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-lg shadow-sm w-64 flex-shrink-0">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-md flex-1 break-words">{chapter.title}</h4>
                <div className="flex items-center space-x-1 ml-2">
                    <button onClick={() => onEdit(chapter)} className="p-1 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="edit" className="h-4 w-4" />
                    </button>
                    <button onClick={handleDelete} className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Icon name="delete" className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                {countTypes.map(type => (
                    <div key={type} className="flex justify-between items-center text-sm">
                        <span className="capitalize text-gray-600 dark:text-gray-400">{type}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => decrementChapterCount(classId, subjectId, chapter.id, type)} className="px-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">-</button>
                            <span>{chapter[`${type}Count`] || 0}</span>
                            <button onClick={() => incrementChapterCount(classId, subjectId, chapter.id, type)} className="px-2 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">+</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChapterDetails;
