
export interface Task {
  day: number;
  title: string;
  hook: string;
  description: string;
  keywords: string;
  growthTip: string;
  isCompleted: boolean;
}

export interface Project {
  id: string;
  channelName: string;
  niche: string;
  targetAudience: string;
  contentType: string;
  tasks: Task[];
  createdAt: string;
  isActive: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
