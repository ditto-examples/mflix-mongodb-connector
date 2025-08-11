import Combine
import DittoSwift
import Foundation

@MainActor
class DittoService: ObservableObject {
    private var ditto: Ditto?
    private var moviesSubscription: DittoSyncSubscription?
    private var moviesObserver: DittoStoreObserver?
    var databaseConfig: DatabaseConfig
    
    // Closure to handle errors without circular reference
    var onError: ((DittoError) -> Void)?
    
    // Closure handle movies updates without circular reference
    var onMoviesUpdate: (([MovieListing]) -> Void)?

    @Published var isInitialized = false

    init(databaseConfig: DatabaseConfig) {
        self.databaseConfig = databaseConfig
    }

    func initialize() async throws {
        if !isInitialized {
            guard
                !databaseConfig.databaseID.contains("insert")
                    || !databaseConfig.token.contains("insert")
                    || !databaseConfig.url.contains("insert")
            else {
                throw DittoError.configError(
                    "Please configure your Ditto credentials in dittoConfig.plist"
                )
            }
            DittoLogger.isEnabled = true
            DittoLogger.minimumLogLevel = .debug

            //setup logging level
            let isPreview: Bool =
                ProcessInfo.processInfo.environment[
                    "XCODE_RUNNING_FOR_PREVIEWS"
                ]
                == "1"
            if !isPreview {
                DittoLogger.minimumLogLevel = .debug
            }

            do {
                // MARK: initialization of Ditto
                // https://docs.ditto.live/sdk/latest/install-guides/swift#integrating-and-initializing-sync
                guard let portalUrl = URL(string: databaseConfig.url)
                else {
                    throw DittoError.configError(
                        "Invalid Ditto URL: \(databaseConfig.url)"
                    )
                }
                let config = DittoConfig(
                    databaseID: databaseConfig.databaseID,
                    connect: .server(url: portalUrl)
                )
                ditto = try await Ditto.open(config: config)
                guard let ditto = ditto else {
                    throw DittoError.configError(
                        "Ditto not initialized properly, please check dittoConfig.plist to make sure you have values set correctly"
                    )
                }

                // Set up authentication expiration handler (required for server connections)
                let token = databaseConfig.token
                ditto.auth?.expirationHandler = {
                    [weak self] ditto, secondsRemaining in
                    guard let self = self else { return }
                    // Authenticate when token is expiring
                    ditto.auth?.login(
                        // token for development use
                        token: token,
                        // Use .development if you are using portal token or set real provider if you are using a real authentication provider
                        provider: .development
                    ) { clientInfo, error in
                        if let error = error {
                            self.onError?(DittoError.general(
                                "Authentication failed: \(error.localizedDescription)"
                            ))
                        } else {
                            //debug print
                            print("Authentication successful")
                        }
                    }
                }

                // Configure transport
                // https://docs.ditto.live/sdk/latest/sync/customizing-transport-configurations
                ditto.updateTransportConfig { config in
                    config.connect.webSocketURLs.insert(
                        databaseConfig.url
                    )
                }

                //Disable sync with v3 peers, required for DQL
                try ditto.disableSyncWithV3()

                // Disable DQL strict mode so that collection definitions are not required in DQL queries
                // https://docs.ditto.live/dql/strict-mode#introduction
                try await ditto.store.execute(
                    query: "ALTER SYSTEM SET DQL_STRICT_MODE = false"
                )

                // https://docs.ditto.live/sdk/latest/sync/syncing-data#start-sync
                try ditto.sync.start()

                // Register a subscription to the movies collection to only return kid movies
                // https://docs.ditto.live/sdk/latest/sync/syncing-data#subscriptions
                moviesSubscription = try ditto.sync.registerSubscription(
                    query: "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'"
                )

                // Register a subscription to the movies collection to only return kid movies by year
                // https://docs.ditto.live/sdk/latest/crud/observing-data-changes
                moviesObserver = try ditto.store.registerObserver(
                    query: "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG' ORDER BY year DESC"
                ) {
                    [weak self] result in
                    let newMovies = result.items.compactMap { item in
                        return MovieListing(item.jsonData())
                    }
                    self?.onMoviesUpdate?(newMovies)
                }
                isInitialized = true
            } catch {
                throw DittoError.general(
                    "Failed to initialize Ditto: \(error.localizedDescription)"
                )
            }
        }
    }

    // MARK: - CRUD Operations
    func addMovie(_ movie: [String: Any]) async throws -> (Bool, String?){
        guard let ditto = ditto else {
            return (false, "Ditto not initialized")
        }
        let insertQuery = "INSERT INTO movies DOCUMENTS (:newMovie)"
        let result = try await ditto.store.execute(
            query: insertQuery,
            arguments: ["newMovie": movie]
        )
        if let mutatedDocumentId =
            (result.mutatedDocumentIDs().first.flatMap { $0.stringValue })
        {
            return (true, mutatedDocumentId)
        }
        return (false, "No mutatedDocumentIDs returned")
    }

    func getMovie(by id: String) async throws -> Movie? {
        guard let ditto = ditto else {
            return nil
        }
        let query = "SELECT * FROM movies WHERE _id = '\(id)'"
        let results = try await ditto.store.execute(query: query)
        return results.items.first.flatMap { Movie($0.jsonData()) }
    }

    func updateMovie(_ movie: Movie, updates: [String: Any]) async -> (Bool, String?) {
        guard let ditto = ditto else {
            return (false, "Ditto not initialized")
        }
        var updateStatements: [String] = []
        for (key, value) in updates {
            switch value {
            case let stringValue as String:
                updateStatements.append(
                    "\(key) = '\(stringValue.replacingOccurrences(of: "'", with: "''"))'"
                )
            case let intValue as Int:
                updateStatements.append("\(key) = \(intValue)")
            case let arrayValue as [String]:
                let formattedArray = arrayValue.map {
                    "'\($0.replacingOccurrences(of: "'", with: "''"))'"
                }.joined(separator: ", ")
                updateStatements.append("\(key) = [\(formattedArray)]")
            default:
                continue
            }
        }

        guard !updateStatements.isEmpty else {
            return (false, "No valid updates provided")
        }

        let updateQuery = "UPDATE movies SET \(updateStatements.joined(separator: ", ")) WHERE _id = '\(movie.id)'"
        do {
            let results = try await ditto.store.execute(query: updateQuery)
            if let mutatedDocumentId = (results.mutatedDocumentIDs().first.flatMap { $0.stringValue }) {
                return (true, mutatedDocumentId)
            }
        } catch {
            return (false, "Failed to update movie: \(error.localizedDescription)")
        }
        return (false, "No mutatedDocumentIDs returned")
    }

    func deleteMovie(id: String) async throws -> (Bool, String?) {
        guard let ditto = ditto else {
            return (false, "Ditto not initialized")
        }

        let deleteQuery = "DELETE FROM movies WHERE _id = '\(id)'"
        let result = try await ditto.store.execute(query: deleteQuery)
        if let mutatedDocumentId =
            (result.mutatedDocumentIDs().first.flatMap { $0.stringValue }) {
            return (true, mutatedDocumentId)
        }
        return (false, "No mutatedDocumentIDs returned")
    }

    deinit {
        moviesSubscription?.cancel()
        moviesObserver?.cancel()

        moviesSubscription = nil
        moviesObserver = nil

        ditto?.sync.stop()
    }
}
