import { db } from '../../db/database';
import type { ExperimentSession } from '../../types/models';
export async function createSession(protocolId:string):Promise<ExperimentSession>{
 const now=Date.now();const session:ExperimentSession={id:crypto.randomUUID(),protocolId,status:'in-progress',currentStep:0,completedStepIds:[],createdAt:now,updatedAt:now};await db.sessions.add(session);return session;
}
export async function saveSession(session:ExperimentSession){await db.sessions.put({...session,updatedAt:Date.now()});}
export async function saveNote(sessionId:string,stepId:string,text:string){const id=`${sessionId}:${stepId}`;await db.notes.put({id,sessionId,stepId,text,updatedAt:Date.now()});}
