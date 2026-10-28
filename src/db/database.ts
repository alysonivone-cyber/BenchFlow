import Dexie, {type Table} from 'dexie';
import type {ExperimentSession,ExperimentNote,LabTimer,Protocol} from '../types/models';
class BenchFlowDatabase extends Dexie {
 sessions!:Table<ExperimentSession,string>;
 notes!:Table<ExperimentNote,string>;
 timers!:Table<LabTimer,string>;
 customProtocols!:Table<Protocol,string>;
 constructor(){super('benchflow-v1');
  this.version(1).stores({sessions:'id,protocolId,updatedAt',notes:'id,[sessionId+stepId],sessionId',timers:'id,[sessionId+stepId],sessionId'});
  this.version(2).stores({sessions:'id,protocolId,updatedAt',notes:'id,[sessionId+stepId],sessionId',timers:'id,[sessionId+stepId],sessionId',customProtocols:'id,title'});
 }
}
export const db=new BenchFlowDatabase();
