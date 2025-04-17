interface Awards {
    [key: string]: any;
}

interface IMDB {
    [key: string]: any;
}

interface Tomatoes {
    [key: string]: any;
}

export class Movie {
    constructor(
        public id: string,
        public title: string,
        public plot: string,
        public genres: string[],
        public runtime: number,
        public cast: string[],
        public poster: string,
        public fullplot: string,
        public languages: string[],
        public released: Date,
        public directors: string[],
        public rated: string,
        public awards: Awards,
        public year: string,
        public imdb: IMDB,
        public tomatoes: Tomatoes,
        public countries: string[]
    ) {}

    static fromJson(json: any): Movie {
        return new Movie(
            json._id || '',
            json.title || '',
            json.plot || '',
            (json.genres || []) as string[],
            json.runtime || 0,
            (json.cast || []) as string[],
            json.poster || '',
            json.fullplot || '',
            (json.languages || []) as string[],
            new Date(json.released || new Date().toISOString()),
            (json.directors || []) as string[],
            json.rated || '',
            json.awards || {},
            json.year?.toString() || '',
            json.imdb || {},
            json.tomatoes || {},
            (json.countries || []) as string[]
        );
    }
}
