export class IndexInfo {
    id: string;
    collection: string;
    fields: string[];

    constructor(data: any) {
        console.log('IndexInfo constructor received:', data);
        
        // Handle different possible data structures
        this.id = data._id || data.id || data.name || '';
        this.collection = data.collection || data.collectionName || 'Unknown';
        
        // Fields might be an array or need to be extracted differently
        if (Array.isArray(data.fields)) {
            this.fields = data.fields;
        } else if (data.field) {
            this.fields = [data.field];
        } else if (data.indexFields) {
            this.fields = data.indexFields;
        } else {
            this.fields = [];
        }
        
        console.log('IndexInfo created:', { id: this.id, collection: this.collection, fields: this.fields });
    }

    static fromJson(json: any): IndexInfo {
        return new IndexInfo(json);
    }

    get formattedFields(): string {
        return this.fields.join(', ');
    }
}