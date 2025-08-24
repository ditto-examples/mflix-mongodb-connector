export class MovieListing {
    constructor(
        public id: string,
        public title: string,
        public plot: string,
        public poster: string,
        public year: string,
    ) {}

    static fromJson(json: any): MovieListing {
        return new MovieListing(
            json._id || '',
            json.title || '',
            json.plot || '',
            json.poster || '',
            json.year?.toString() || ''
        );
    }
}
