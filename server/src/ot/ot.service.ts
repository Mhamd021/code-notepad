import { Injectable } from '@nestjs/common';

export type OperationType = 'insert' | 'delete';

export interface Operation {
  type: OperationType;
  position: number;
  char?: string;  
  clientId: string;
  version: number;  
}

@Injectable()
export class OTService {

  applyOperation(content: string, op: Operation): string {
    if (op.type === 'insert') {
      return (
        content.slice(0, op.position) +
        op.char +
        content.slice(op.position)
      );
    }

    if (op.type === 'delete') {
      if (op.position >= content.length) return content;

      return (
        content.slice(0, op.position) +
        content.slice(op.position + 1)
      );
    }

    return content;
  }

  transform(op: Operation, against: Operation): Operation {
  
    const result = { ...op };

    if (op.type === 'insert' && against.type === 'insert') {
     
      if (op.position > against.position) {
       
        result.position = op.position + 1;
      }
    }

    else if (op.type === 'insert' && against.type === 'delete') {
   
      if (op.position > against.position) {
        result.position = op.position - 1;
      }
    }

    else if (op.type === 'delete' && against.type === 'insert') {

      if (op.position >= against.position) {
      
        result.position = op.position + 1;
      }
    }

    else if (op.type === 'delete' && against.type === 'delete') {
      
      if (op.position === against.position) {
        result.position = -1;
      } else if (op.position > against.position) {
        result.position = op.position - 1;
      }
    }

    return result;
  }

  transformAgainstMany(op: Operation, ops: Operation[]): Operation {
    let result = op;
    for (const against of ops) {
      result = this.transform(result, against);
      if (result.position === -1) break;
    }
    return result;
  }
}