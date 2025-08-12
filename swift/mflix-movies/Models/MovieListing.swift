import Foundation

struct MovieListing: Identifiable, Codable {
    let id: String
    let title: String
    let plot: String
    let poster: String
    let year: String
    let imdbRating: Double?
    let rottenRating: Double?

    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title
        case plot
        case poster
        case year
        case imdbRating
        case rottenRating
    }

    init(from dictionary: [String: Any]) {
        self.id = dictionary["_id"] as? String ?? UUID().uuidString
        self.title = dictionary["title"] as? String ?? ""
        self.plot = dictionary["plot"] as? String ?? ""
        self.poster = dictionary["poster"] as? String ?? ""
        self.imdbRating = dictionary["imdbRating"] as? Double
        self.rottenRating = dictionary["rottenRating"] as? Double

        // Handle mixed year types (Int or String)
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
    }

    init?(_ data: Data) {
        do {
            // First try to decode as a dictionary to handle mixed types
            if let jsonObject = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                self.init(from: jsonObject)
            } else {
                // Fallback to standard JSON decoding
                self = try JSONDecoder().decode(Self.self, from: data)
            }
        } catch {
            print("DECODING ERROR:", error.localizedDescription)
            print("📊 Raw data: \(String(data: data, encoding: .utf8) ?? "Unable to convert to string")")
            return nil
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(String.self, forKey: .id)
        title = try container.decode(String.self, forKey: .title)
        plot = try container.decode(String.self, forKey: .plot)
        poster = try container.decode(String.self, forKey: .poster)
        year = try container.decode(String.self, forKey: .year)
        imdbRating = try container.decodeIfPresent(Double.self, forKey: .imdbRating)
        rottenRating = try container.decodeIfPresent(Double.self, forKey: .rottenRating)
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(title, forKey: .title)
        try container.encode(plot, forKey: .plot)
        try container.encode(year, forKey: .year)
        try container.encodeIfPresent(imdbRating, forKey: .imdbRating)
        try container.encodeIfPresent(rottenRating, forKey: .rottenRating)
    }
}

extension MovieListing {
    // Computed properties for formatted ratings with 1 decimal place
    var formattedImdbRating: String? {
        guard let rating = imdbRating else { return nil }
        return String(format: "%.1f", rating)
    }
    
    var formattedRottenRating: String? {
        guard let rating = rottenRating else { return nil }
        return String(format: "%.1f", rating)
    }
    
    static var sample: MovieListing {
        MovieListing(from: [
            "_id": "sample-id",
            "title": "Sample Movie",
            "plot": "This is a sample movie plot.",
            "poster": "",
            "year": "2024",
            "imdbRating": 7.40000000004,
            "rottenRating": 7.599999
        ])
    }
}

