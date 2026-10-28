import { describe,it,expect } from 'vitest';
import {calculateDilution,convertVolume} from './calculations';
describe('Scientific Calculator',()=>{it('calculates a dilution',()=>expect(calculateDilution(1,0.1,10)).toBe(1));it('rejects impossible dilutions',()=>expect(()=>calculateDilution(1,2,10)).toThrow());it('converts µL to mL',()=>expect(convertVolume(500,'µL','mL')).toBe(0.5));it('converts mL to µL',()=>expect(convertVolume(1.5,'mL','µL')).toBe(1500));});
