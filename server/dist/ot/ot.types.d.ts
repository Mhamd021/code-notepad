import { Operation } from './ot.service';
export interface DocumentState {
    content: string;
    version: number;
    history: Operation[];
}
