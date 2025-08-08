import Foundation
import DittoSwift
import Combine

class DittoService: ObservableObject {
    static let shared = DittoService()
    
    private var ditto: Ditto?
    private var moviesSubscription: DittoSubscription?
    private var moviesObserver: DittoLiveQueryFetchEvent?
    
    @Published var movies: [Movie] = []
    @Published var isInitialized = false
    @Published var errorMessage: String?
    
    private let appId = "insert Ditto Portal App ID here"
    private let token = "insert Ditto Portal Online Playground Authentication Token here"
    private let authUrl = "insert Ditto Portal Auth URL here"
    private let websocketUrl = "insert Ditto Portal Websocket URL here"
    
    private init() {}
    
    func initialize() {
        guard !appId.contains("insert") && !token.contains("insert") else {
            errorMessage = "Please configure your Ditto credentials in DittoService.swift"
            return
        }
        
        do {
            let identity = DittoIdentity.onlinePlayground(
                appID: appId,
                token: token
            )
            
            ditto = Ditto(identity: identity)
            
            // Configure transport
            ditto?.transportConfig = DittoTransportConfig()
            ditto?.transportConfig?.enableAllPeerToPeer()
            
            // Configure sync endpoints if custom URLs are provided
            if !authUrl.contains("insert") && !websocketUrl.contains("insert") {
                // Custom sync configuration would go here
            }
            
            try ditto?.startSync()
            isInitialized = true
            errorMessage = nil
            
            // Start observing movies
            startObservingMovies()
            
        } catch {
            errorMessage = "Failed to initialize Ditto: \(error.localizedDescription)"
            print("Ditto initialization error: \(error)")
        }
    }
    
    private func startObservingMovies() {
        guard let ditto = ditto else { return }
        
        // Subscribe to G-rated movies
        let subscriptionQuery = "SELECT * FROM movies WHERE rated = 'G'"
        moviesSubscription = ditto.store.registerSubscription(subscriptionQuery)
        
        // Observe movies ordered by year
        let observationQuery = "SELECT * FROM movies WHERE rated = 'G' ORDER BY year DESC"
        ditto.store.registerObserver(observationQuery) { [weak self] result in
            DispatchQueue.main.async {
                switch result {
                case .success(let queryResult):
                    self?.movies = queryResult.items.compactMap { item in
                        guard let dict = item.value as? [String: Any] else { return nil }
                        return Movie(from: dict)
                    }
                case .failure(let error):
                    self?.errorMessage = "Failed to fetch movies: \(error.localizedDescription)"
                }
            }
        }
    }
    
    // MARK: - CRUD Operations
    
    func getMovie(by id: String, completion: @escaping (Movie?) -> Void) {
        guard let ditto = ditto else {
            completion(nil)
            return
        }
        
        let query = "SELECT * FROM movies WHERE _id = '\(id)'"
        ditto.store.execute(query) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let queryResult):
                    if let item = queryResult.items.first,
                       let dict = item.value as? [String: Any] {
                        completion(Movie(from: dict))
                    } else {
                        completion(nil)
                    }
                case .failure(let error):
                    print("Failed to fetch movie: \(error)")
                    completion(nil)
                }
            }
        }
    }
    
    func updateMovie(_ movie: Movie, updates: [String: Any], completion: @escaping (Bool, String?) -> Void) {
        guard let ditto = ditto else {
            completion(false, "Ditto not initialized")
            return
        }
        
        var updateStatements: [String] = []
        
        for (key, value) in updates {
            switch value {
            case let stringValue as String:
                updateStatements.append("\(key) = '\(stringValue.replacingOccurrences(of: "'", with: "''"))'")
            case let intValue as Int:
                updateStatements.append("\(key) = \(intValue)")
            case let arrayValue as [String]:
                let formattedArray = arrayValue.map { "'\($0.replacingOccurrences(of: "'", with: "''"))'" }.joined(separator: ", ")
                updateStatements.append("\(key) = [\(formattedArray)]")
            default:
                continue
            }
        }
        
        guard !updateStatements.isEmpty else {
            completion(false, "No valid updates provided")
            return
        }
        
        let updateQuery = "UPDATE movies SET \(updateStatements.joined(separator: ", ")) WHERE _id = '\(movie.id)'"
        
        ditto.store.execute(updateQuery) { result in
            DispatchQueue.main.async {
                switch result {
                case .success(let queryResult):
                    let success = !queryResult.mutatedDocumentIDs.isEmpty
                    completion(success, success ? nil : "No documents were updated")
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            }
        }
    }
    
    func addMovie(_ movie: [String: Any], completion: @escaping (Bool, String?) -> Void) {
        guard let ditto = ditto else {
            completion(false, "Ditto not initialized")
            return
        }
        
        var insertValues: [String] = []
        var insertColumns: [String] = []
        
        for (key, value) in movie {
            insertColumns.append(key)
            switch value {
            case let stringValue as String:
                insertValues.append("'\(stringValue.replacingOccurrences(of: "'", with: "''"))'")
            case let intValue as Int:
                insertValues.append("\(intValue)")
            case let arrayValue as [String]:
                let formattedArray = arrayValue.map { "'\($0.replacingOccurrences(of: "'", with: "''"))'" }.joined(separator: ", ")
                insertValues.append("[\(formattedArray)]")
            default:
                if let jsonData = try? JSONSerialization.data(withJSONObject: value),
                   let jsonString = String(data: jsonData, encoding: .utf8) {
                    insertValues.append("'\(jsonString.replacingOccurrences(of: "'", with: "''"))'")
                }
            }
        }
        
        let insertQuery = "INSERT INTO movies (\(insertColumns.joined(separator: ", "))) VALUES (\(insertValues.joined(separator: ", ")))"
        
        ditto.store.execute(insertQuery) { result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    completion(true, nil)
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            }
        }
    }
    
    func deleteMovie(id: String, completion: @escaping (Bool, String?) -> Void) {
        guard let ditto = ditto else {
            completion(false, "Ditto not initialized")
            return
        }
        
        let deleteQuery = "DELETE FROM movies WHERE _id = '\(id)'"
        
        ditto.store.execute(deleteQuery) { result in
            DispatchQueue.main.async {
                switch result {
                case .success:
                    completion(true, nil)
                case .failure(let error):
                    completion(false, error.localizedDescription)
                }
            }
        }
    }
    
    deinit {
        moviesSubscription?.cancel()
        ditto?.stopSync()
    }
}