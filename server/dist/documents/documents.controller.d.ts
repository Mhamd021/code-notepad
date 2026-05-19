import { DocumentsService } from './documents.service';
export declare class DocumentsController {
    private service;
    constructor(service: DocumentsService);
    create(language?: string): Promise<{
        roomId: string;
        language: string;
        url: string;
    }>;
    findOne(roomId: string): Promise<{
        roomId: string;
        content: string;
        language: string;
    }>;
}
