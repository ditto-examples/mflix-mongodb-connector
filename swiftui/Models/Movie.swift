import Foundation

struct Movie: Identifiable, Codable {
    let id: String
    let title: String
    let plot: String
    let genres: [String]
    let runtime: Int
    let cast: [String]
    let poster: String
    let fullplot: String
    let languages: [String]
    let released: Date?
    let directors: [String]
    let rated: String
    let awards: [String: Any]?
    let year: String
    let imdb: [String: Any]?
    let tomatoes: [String: Any]?
    let countries: [String]
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title
        case plot
        case genres
        case runtime
        case cast
        case poster
        case fullplot
        case languages
        case released
        case directors
        case rated
        case awards
        case year
        case imdb
        case tomatoes
        case countries
    }
    
    init(from dictionary: [String: Any]) {
        self.id = dictionary["_id"] as? String ?? UUID().uuidString
        self.title = dictionary["title"] as? String ?? ""
        self.plot = dictionary["plot"] as? String ?? ""
        self.genres = dictionary["genres"] as? [String] ?? []
        self.runtime = dictionary["runtime"] as? Int ?? 0
        self.cast = dictionary["cast"] as? [String] ?? []
        self.poster = dictionary["poster"] as? String ?? ""
        self.fullplot = dictionary["fullplot"] as? String ?? ""
        self.languages = dictionary["languages"] as? [String] ?? []
        
        if let releasedString = dictionary["released"] as? String {
            let formatter = ISO8601DateFormatter()
            self.released = formatter.date(from: releasedString)
        } else {
            self.released = nil
        }
        
        self.directors = dictionary["directors"] as? [String] ?? []
        self.rated = dictionary["rated"] as? String ?? ""
        self.awards = dictionary["awards"] as? [String: Any]
        
        if let yearValue = dictionary["year"] {
            if let yearInt = yearValue as? Int {
                self.year = String(yearInt)
            } else if let yearString = yearValue as? String {
                self.year = yearString
            } else {
                self.year = ""
            }
        } else {
            self.year = ""
        }
        
        self.imdb = dictionary["imdb"] as? [String: Any]
        self.tomatoes = dictionary["tomatoes"] as? [String: Any]
        self.countries = dictionary["countries"] as? [String] ?? []
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        plot = try container.decode(String.self, forKey: .plot)
        genres = try container.decode([String].self, forKey: .genres)
        runtime = try container.decode(Int.self, forKey: .runtime)
        cast = try container.decode([String].self, forKey: .cast)
        poster = try container.decode(String.self, forKey: .poster)
        fullplot = try container.decode(String.self, forKey: .fullplot)
        languages = try container.decode([String].self, forKey: .languages)
        released = try container.decodeIfPresent(Date.self, forKey: .released)
        directors = try container.decode([String].self, forKey: .directors)
        rated = try container.decode(String.self, forKey: .rated)
        awards = nil
        year = try container.decode(String.self, forKey: .year)
        imdb = nil
        tomatoes = nil
        countries = try container.decode([String].self, forKey: .countries)
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(title, forKey: .title)
        try container.encode(plot, forKey: .plot)
        try container.encode(genres, forKey: .genres)
        try container.encode(runtime, forKey: .runtime)
        try container.encode(cast, forKey: .cast)
        try container.encode(poster, forKey: .poster)
        try container.encode(fullplot, forKey: .fullplot)
        try container.encode(languages, forKey: .languages)
        try container.encodeIfPresent(released, forKey: .released)
        try container.encode(directors, forKey: .directors)
        try container.encode(rated, forKey: .rated)
        try container.encode(year, forKey: .year)
        try container.encode(countries, forKey: .countries)
    }
}

extension Movie {
    static var sample: Movie {
        Movie(from: [
            "_id": "sample-id",
            "title": "Sample Movie",
            "plot": "This is a sample movie plot.",
            "genres": ["Adventure", "Family"],
            "runtime": 120,
            "cast": ["Actor 1", "Actor 2"],
            "poster": "",
            "fullplot": "This is a longer description of the sample movie plot.",
            "languages": ["English"],
            "released": "2024-01-01T00:00:00.000Z",
            "directors": ["Director Name"],
            "rated": "G",
            "year": "2024",
            "countries": ["USA"]
        ])
    }
}