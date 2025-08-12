import Foundation

struct Comment: Identifiable, Codable {
    let id: String
    let movieId: String
    let name: String
    let text: String
    let date: String
    let email: String?
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case movieId = "movie_id"
        case name
        case text
        case date
        case email
    }
    
    init(id: String, movieId: String, name: String, text: String, date: String, email: String?) {
        self.id = id
        self.movieId = movieId
        self.name = name
        self.text = text
        self.date = date
        self.email = email
    }
    
    init(from dictionary: [String: Any]) {
        self.id = dictionary["_id"] as? String ?? UUID().uuidString
        self.movieId = dictionary["movie_id"] as? String ?? ""
        self.name = dictionary["name"] as? String ?? "Anonymous"
        self.text = dictionary["text"] as? String ?? ""
        self.date = dictionary["date"] as? String ?? ""
        self.email = dictionary["email"] as? String
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
            print("Comment DECODING ERROR:", error.localizedDescription)
            print("📊 Raw data: \(String(data: data, encoding: .utf8) ?? "Unable to convert to string")")
            return nil
        }
    }
    
    var formattedDate: String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let parsedDate = formatter.date(from: date) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
            displayFormatter.doesRelativeDateFormatting = true
            return displayFormatter.string(from: parsedDate)
        }
        
        let alternativeFormatter = ISO8601DateFormatter()
        alternativeFormatter.formatOptions = [.withInternetDateTime]
        if let parsedDate = alternativeFormatter.date(from: date) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateStyle = .medium
            displayFormatter.timeStyle = .short
            displayFormatter.doesRelativeDateFormatting = true
            return displayFormatter.string(from: parsedDate)
        }
        
        return date
    }
}