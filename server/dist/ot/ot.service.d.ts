export type OperationType = 'insert' | 'delete';
export interface Operation {
    type: OperationType;
    position: number;
    char?: string;
    clientId: string;
    version: number;
}
export declare class OTService {
    applyOperation(content: string, op: Operation): string;
    transform(op: Operation, against: Operation): Operation;
    transformAgainstMany(op: Operation, ops: Operation[]): Operation;
}
