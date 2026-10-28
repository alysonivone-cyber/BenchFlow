export type DilutionVariable = 'c1'|'v1'|'c2'|'v2';
export type VolumeUnit = 'µL'|'mL';
export type ConcentrationUnit = 'mg/mL'|'µg/mL'|'g/L';
const concentrationFactor: Record<ConcentrationUnit,number> = {'mg/mL':1,'µg/mL':0.001,'g/L':1};
const volumeFactor: Record<VolumeUnit,number> = {'µL':0.001,'mL':1};
export function solveDilution(target:DilutionVariable, inputs:Record<DilutionVariable,number>, units:{c1:ConcentrationUnit,c2:ConcentrationUnit,v1:VolumeUnit,v2:VolumeUnit}):number {
 const n={c1:inputs.c1*concentrationFactor[units.c1],c2:inputs.c2*concentrationFactor[units.c2],v1:inputs.v1*volumeFactor[units.v1],v2:inputs.v2*volumeFactor[units.v2]};
 for(const k of ['c1','c2','v1','v2'] as DilutionVariable[]){if(k!==target&&(!Number.isFinite(n[k])||n[k]<=0))throw new Error('Enter three positive, valid values.');}
 let value:number;
 switch(target){case 'c1':value=n.c2*n.v2/n.v1;break;case 'v1':value=n.c2*n.v2/n.c1;break;case 'c2':value=n.c1*n.v1/n.v2;break;case 'v2':value=n.c1*n.v1/n.c2;break;}
 n[target]=value;
 if(n.c2>n.c1+1e-10)throw new Error('A simple dilution cannot increase concentration (C₂ > C₁).');
 if(n.v1>n.v2+1e-10)throw new Error('Stock volume V₁ cannot exceed final volume V₂.');
 return value/(target.startsWith('c')?concentrationFactor[units[target as 'c1'|'c2']]:volumeFactor[units[target as 'v1'|'v2']]);
}
export function calculateDilution(c1:number,c2:number,v2:number):number {return solveDilution('v1',{c1,c2,v2,v1:0},{c1:'mg/mL',c2:'mg/mL',v1:'mL',v2:'mL'});}
export function convertVolume(value:number,from:VolumeUnit,to:VolumeUnit):number {if(!Number.isFinite(value)||value<0)throw new Error('Enter a valid, non-negative volume.');return value*volumeFactor[from]/volumeFactor[to];}
