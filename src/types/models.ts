export type SessionStatus = 'in-progress' | 'paused' | 'completed';
export interface ProtocolStep { id:string; title:string; description:string; materials:string[]; instructions:string[]; estimatedMinutes?:number }
export interface Protocol { id:string; title:string; description:string; objective:string; materials:string[]; expectedResults:string; duration:string; steps:ProtocolStep[]; sourcePdf?:Blob; sourcePdfName?:string }
export interface ExperimentSession { id:string; protocolId:string; status:SessionStatus; currentStep:number; completedStepIds:string[]; createdAt:number; updatedAt:number }
export interface ExperimentNote { id:string; sessionId:string; stepId:string; text:string; updatedAt:number }
export type TimerStatus='idle'|'running'|'paused'|'finished';
export interface LabTimer { id:string; sessionId:string; stepId:string; durationMs:number; remainingMs:number; endsAt:number|null; status:TimerStatus; updatedAt:number }
