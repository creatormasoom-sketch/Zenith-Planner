
export type GoalType = 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  periodId: string;
  progress: number;
  resourceUrl?: string;
  linkedGoalIds: string[];
  childGoalIds: string[];
  classChapterId?: string;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface Chapter {
  id:string;
  title: string;
  progress: number;
  lecturesCount?: number;
  dppsCount?: number;
  testsCount?: number;
}

export interface Subject {
  id: string;
  title: string;
  chapters: Chapter[];
}

export interface Class {
  id: string;
  title: string;
  subjects: Subject[];
}

export interface PlannerState {
  goals: Goal[];
  classes: Class[];
}
