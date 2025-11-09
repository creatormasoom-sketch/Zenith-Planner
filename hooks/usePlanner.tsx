import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlannerState, Goal, GoalType, Class, Subject, Chapter } from '../types';
import { storageService } from '../services/storageService';
import { getParentPeriodId } from '../utils/dateUtils';

const initialState: PlannerState = {
  goals: [],
  classes: [],
};

interface PlannerContextType {
  state: PlannerState;
  addGoal: (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'linkedGoalIds' | 'childGoalIds' | 'order'>) => void;
  updateGoal: (updatedGoal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  updateGoalOrder: (goals: Goal[]) => void;
  linkGoals: (childGoalId: string, parentGoalId: string) => void;
  unlinkGoals: (childGoalId: string, parentGoalId: string) => void;
  getLinkableParentGoals: (childGoal: Goal) => Goal[];
  addClass: (classTitle: string) => void;
  updateClass: (updatedClass: Class) => void;
  deleteClass: (classId: string) => void;
  addSubject: (classId: string, subjectTitle: string) => void;
  updateSubject: (classId: string, updatedSubject: Subject) => void;
  deleteSubject: (classId: string, subjectId: string) => void;
  addChapter: (classId: string, subjectId: string, chapterData: Omit<Chapter, 'id' | 'progress'>) => void;
  updateChapter: (classId: string, subjectId: string, updatedChapter: Chapter) => void;
  deleteChapter: (classId: string, subjectId: string, chapterId: string) => void;
  incrementChapterCount: (classId: string, subjectId: string, chapterId: string, type: 'lectures' | 'dpps' | 'tests') => void;
  decrementChapterCount: (classId: string, subjectId: string, chapterId: string, type: 'lectures' | 'dpps' | 'tests') => void;
  exportData: () => void;
  importData: (file: File) => void;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// FIX: Changed component signature to React.FC to resolve a TypeScript error where `children` prop was reported as missing.
export const PlannerProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<PlannerState>(() => {
    const loadedState = storageService.loadState();
    return loadedState || initialState;
  });

  useEffect(() => {
    storageService.saveState(state);
  }, [state]);

  const recalculateParentProgress = useCallback((parentGoalId: string, currentState: PlannerState): PlannerState => {
    let newState = { ...currentState };
    let parentGoal = newState.goals.find(g => g.id === parentGoalId);
    
    if (!parentGoal) return currentState;

    const childGoals = parentGoal.childGoalIds.map(id => newState.goals.find(g => g.id === id)).filter(Boolean) as Goal[];
    
    if (childGoals.length > 0) {
      const totalProgress = childGoals.reduce((sum, child) => sum + child.progress, 0);
      const newProgress = Math.round(totalProgress / childGoals.length);
      
      if(parentGoal.progress !== newProgress) {
        parentGoal = { ...parentGoal, progress: newProgress, updatedAt: new Date().toISOString() };
        newState.goals = newState.goals.map(g => g.id === parentGoalId ? parentGoal : g);
        
        // Recurse for grandparents
        parentGoal.linkedGoalIds.forEach(grandparentId => {
          newState = recalculateParentProgress(grandparentId, newState);
        });
      }
    }
    return newState;
  }, []);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progress' | 'linkedGoalIds' | 'childGoalIds' | 'order'>) => {
    setState(prevState => {
      const newGoal: Goal = {
        ...goalData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: 0,
        linkedGoalIds: [],
        childGoalIds: [],
        order: prevState.goals.length,
      };
      return { ...prevState, goals: [...prevState.goals, newGoal] };
    });
  };

  const updateGoal = (updatedGoal: Goal) => {
    setState(prevState => {
      let newState = { ...prevState };
      const originalGoal = prevState.goals.find(g => g.id === updatedGoal.id);
      
      newState.goals = prevState.goals.map(goal =>
        goal.id === updatedGoal.id ? { ...updatedGoal, updatedAt: new Date().toISOString() } : goal
      );
      
      if (originalGoal && originalGoal.progress !== updatedGoal.progress) {
          updatedGoal.linkedGoalIds.forEach(parentId => {
            newState = recalculateParentProgress(parentId, newState);
        });
      }
      return newState;
    });
  };

  const deleteGoal = (goalId: string) => {
    setState(prevState => {
      const goalToDelete = prevState.goals.find(g => g.id === goalId);
      if (!goalToDelete) return prevState;

      let newState = { ...prevState };

      // Remove from goals list
      newState.goals = prevState.goals.filter(g => g.id !== goalId);

      // Unlink from parents
      goalToDelete.linkedGoalIds.forEach(parentId => {
        const parent = newState.goals.find(g => g.id === parentId);
        if (parent) {
          parent.childGoalIds = parent.childGoalIds.filter(id => id !== goalId);
        }
      });

      // Unlink from children
      goalToDelete.childGoalIds.forEach(childId => {
        const child = newState.goals.find(g => g.id === childId);
        if (child) {
          child.linkedGoalIds = child.linkedGoalIds.filter(id => id !== goalId);
        }
      });
      
      // Recalculate progress for affected parents
      goalToDelete.linkedGoalIds.forEach(parentId => {
          newState = recalculateParentProgress(parentId, newState);
      });

      return newState;
    });
  };

  const updateGoalOrder = (updatedGoals: Goal[]) => {
    setState(prevState => {
      const goalMap = new Map(updatedGoals.map((goal, index) => [goal.id, { ...goal, order: index }]));
      const newGoals = prevState.goals.map(goal => goalMap.has(goal.id) ? goalMap.get(goal.id)! : goal);
      return { ...prevState, goals: newGoals };
    });
  };
  
  const linkGoals = (childGoalId: string, parentGoalId: string) => {
    setState(prevState => {
      let newState = { ...prevState };
      const childGoal = newState.goals.find(g => g.id === childGoalId);
      const parentGoal = newState.goals.find(g => g.id === parentGoalId);

      if (!childGoal || !parentGoal) return prevState;
      
      // Add links
      childGoal.linkedGoalIds = [...new Set([...childGoal.linkedGoalIds, parentGoalId])];
      parentGoal.childGoalIds = [...new Set([...parentGoal.childGoalIds, childGoalId])];

      // Update goals in state
      newState.goals = newState.goals.map(g => {
        if (g.id === childGoalId) return { ...childGoal, updatedAt: new Date().toISOString() };
        if (g.id === parentGoalId) return { ...parentGoal, updatedAt: new Date().toISOString() };
        return g;
      });

      // Recalculate parent progress
      return recalculateParentProgress(parentGoalId, newState);
    });
  };
  
  const unlinkGoals = (childGoalId: string, parentGoalId: string) => {
    setState(prevState => {
      let newState = { ...prevState };
      const childGoal = newState.goals.find(g => g.id === childGoalId);
      const parentGoal = newState.goals.find(g => g.id === parentGoalId);

      if (!childGoal || !parentGoal) return prevState;

      // Remove links
      childGoal.linkedGoalIds = childGoal.linkedGoalIds.filter(id => id !== parentGoalId);
      parentGoal.childGoalIds = parentGoal.childGoalIds.filter(id => id !== childGoalId);

      // Update goals in state
      newState.goals = newState.goals.map(g => {
        if (g.id === childGoalId) return { ...childGoal, updatedAt: new Date().toISOString() };
        if (g.id === parentGoalId) return { ...parentGoal, updatedAt: new Date().toISOString() };
        return g;
      });

      // Recalculate parent progress
      return recalculateParentProgress(parentGoalId, newState);
    });
  };

  const getLinkableParentGoals = (childGoal: Goal): Goal[] => {
    const parentPeriodId = getParentPeriodId(childGoal);
    if (!parentPeriodId) return [];

    const parentType: GoalType | null = childGoal.type === 'daily' ? 'weekly' : childGoal.type === 'weekly' ? 'monthly' : null;
    if (!parentType) return [];

    return state.goals.filter(g => g.type === parentType && g.periodId === parentPeriodId);
  };
  
  // Academics
  const addClass = (classTitle: string) => {
    setState(prevState => ({
      ...prevState,
      classes: [...prevState.classes, { id: crypto.randomUUID(), title: classTitle, subjects: [] }]
    }));
  };

  const updateClass = (updatedClass: Class) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c => c.id === updatedClass.id ? updatedClass : c)
    }));
  };

  const deleteClass = (classId: string) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.filter(c => c.id !== classId)
    }));
  };

  const addSubject = (classId: string, subjectTitle: string) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c =>
        c.id === classId
          ? { ...c, subjects: [...c.subjects, { id: crypto.randomUUID(), title: subjectTitle, chapters: [] }] }
          : c
      )
    }));
  };

  const updateSubject = (classId: string, updatedSubject: Subject) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c =>
        c.id === classId
          ? { ...c, subjects: c.subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s) }
          : c
      )
    }));
  };
  
  const deleteSubject = (classId: string, subjectId: string) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c =>
        c.id === classId
          ? { ...c, subjects: c.subjects.filter(s => s.id !== subjectId) }
          : c
      )
    }));
  };
  
  const addChapter = (classId: string, subjectId: string, chapterData: Omit<Chapter, 'id' | 'progress'>) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c =>
        c.id === classId
          ? {
              ...c,
              subjects: c.subjects.map(s =>
                s.id === subjectId
                  ? { ...s, chapters: [...s.chapters, { ...chapterData, id: crypto.randomUUID(), progress: 0 }] }
                  : s
              )
            }
          : c
      )
    }));
  };

  const updateChapter = (classId: string, subjectId: string, updatedChapter: Chapter) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c =>
        c.id === classId
          ? {
              ...c,
              subjects: c.subjects.map(s =>
                s.id === subjectId
                  ? { ...s, chapters: s.chapters.map(ch => ch.id === updatedChapter.id ? updatedChapter : ch) }
                  : s
              )
            }
          : c
      )
    }));
  };

  const deleteChapter = (classId: string, subjectId: string, chapterId: string) => {
    setState(prevState => ({
      ...prevState,
      classes: prevState.classes.map(c =>
        c.id === classId
          ? {
              ...c,
              subjects: c.subjects.map(s =>
                s.id === subjectId
                  ? { ...s, chapters: s.chapters.filter(ch => ch.id !== chapterId) }
                  : s
              )
            }
          : c
      )
    }));
  };
  
  const incrementChapterCount = (classId: string, subjectId: string, chapterId: string, type: 'lectures' | 'dpps' | 'tests') => {
    updateChapterCount(classId, subjectId, chapterId, type, 1);
  };
  
  const decrementChapterCount = (classId: string, subjectId: string, chapterId: string, type: 'lectures' | 'dpps' | 'tests') => {
    updateChapterCount(classId, subjectId, chapterId, type, -1);
  };

  const updateChapterCount = (classId: string, subjectId: string, chapterId: string, type: 'lectures' | 'dpps' | 'tests', delta: number) => {
    setState(prevState => {
        const newClasses = JSON.parse(JSON.stringify(prevState.classes));
        const classToUpdate = newClasses.find((c: Class) => c.id === classId);
        if (classToUpdate) {
            const subjectToUpdate = classToUpdate.subjects.find((s: Subject) => s.id === subjectId);
            if (subjectToUpdate) {
                const chapterToUpdate = subjectToUpdate.chapters.find((ch: Chapter) => ch.id === chapterId);
                if (chapterToUpdate) {
                    const key = `${type}Count` as keyof Chapter;
                    chapterToUpdate[key] = (chapterToUpdate[key] || 0) as number + delta;
                    if((chapterToUpdate[key] as number) < 0) chapterToUpdate[key] = 0;
                }
            }
        }
        return { ...prevState, classes: newClasses };
    });
  };

  // Import/Export
  const exportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(state, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    link.download = `zenith-planner-${timestamp}.json`;
    link.click();
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') throw new Error("Invalid file content");
        const newState = JSON.parse(text);
        // Basic validation
        if (newState && Array.isArray(newState.goals) && Array.isArray(newState.classes)) {
          setState(newState);
          alert("Data imported successfully!");
        } else {
          throw new Error("Invalid data structure");
        }
      } catch (error) {
        console.error("Failed to import data:", error);
        alert("Failed to import data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <PlannerContext.Provider value={{ 
      state, addGoal, updateGoal, deleteGoal, updateGoalOrder, linkGoals, unlinkGoals, getLinkableParentGoals,
      addClass, updateClass, deleteClass, addSubject, updateSubject, deleteSubject, addChapter, updateChapter, deleteChapter,
      incrementChapterCount, decrementChapterCount, exportData, importData
    }}>
      {children}
    </PlannerContext.Provider>
  );
};

export const usePlanner = (): PlannerContextType => {
  const context = useContext(PlannerContext);
  if (context === undefined) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
};