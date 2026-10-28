import { db } from '../../db/database';
import type { LabTimer } from '../../types/models';
export function remainingTime(timer:LabTimer,now=Date.now()):number{return timer.status==='running'&&timer.endsAt!==null?Math.max(0,timer.endsAt-now):timer.remainingMs;}
export function reconcileTimer(timer:LabTimer,now=Date.now()):LabTimer {if(timer.status==='running'&&remainingTime(timer,now)===0)return {...timer,status:'finished',remainingMs:0,endsAt:null,updatedAt:now};return timer;}
export async function setTimer(timer:LabTimer){await db.timers.put(timer);}
export async function ensureTimer(sessionId:string,stepId:string):Promise<LabTimer>{const id=`${sessionId}:${stepId}`;const existing=await db.timers.get(id);if(existing)return existing;const timer:LabTimer={id,sessionId,stepId,durationMs:30000,remainingMs:30000,endsAt:null,status:'idle',updatedAt:Date.now()};await db.timers.add(timer);return timer;}
export function updateTimer(timer:LabTimer,action:'start'|'pause'|'reset',now=Date.now()):LabTimer{
 if(action==='reset')return {...timer,status:'idle',remainingMs:timer.durationMs,endsAt:null,updatedAt:now};
 if(action==='pause')return {...timer,status:'paused',remainingMs:remainingTime(timer,now),endsAt:null,updatedAt:now};
 const remaining=timer.status==='finished'?timer.durationMs:remainingTime(timer,now);
 return {...timer,status:'running',remainingMs:remaining,endsAt:now+remaining,updatedAt:now};
}
