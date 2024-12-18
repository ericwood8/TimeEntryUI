export interface Project {
    projectId?: number; // Optional for new ones
    name: string;
    isDefault: boolean;
    isActive: boolean;
    tasks: ProjectTask[]
}

export interface ProjectTask {
    projectTaskId?: number; 
    projectId?: number; 
    name: string;
    isDefault: boolean;
    isActive: boolean;
}