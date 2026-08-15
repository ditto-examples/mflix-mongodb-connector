import Combine
import DittoSwift
import Foundation

@Observable class DittoService {
    private var ditto: Ditto?
    private var moviesSubscription: DittoSyncSubscription?
    private var commentsSubscription: DittoSyncSubscription?
    private var moviesObserver: DittoStoreObserver?
    private var syncStatusObserver: DittoStoreObserver?
    private var indexesObserver: DittoStoreObserver?
    var databaseConfig: DatabaseConfig

    var isInitialized = false
    var dittoInstance: Ditto? { ditto }

    // Closure to handle errors without circular reference
    var onError: ((DittoError) -> Void)?

    // Closure handle movies updates without circular reference
    var onMoviesUpdate: (([MovieListing]) -> Void)?

    // Closure to handle sync status updates without circular reference
    var onSyncStatusUpdate: (([SyncStatusInfo]) -> Void)?

    // Closure to handle indexes updates without circular reference
    var onIndexesUpdate: (([IndexInfo]) -> Void)?

    // background queue for doing work
    let backgroundQueue = DispatchQueue(
        label: "com.ditto.mflix.backgroundQueue",
        qos: .background
    )

    init(databaseConfig: DatabaseConfig) {
        self.databaseConfig = databaseConfig
    }

    func initialize() async throws {
        if !isInitialized {
            guard
                !(databaseConfig.databaseID.contains("insert")
                    || databaseConfig.token.contains("insert")
                    || databaseConfig.url.contains("insert"))
            else {
                print(
                    "Ditto configuration is not set up properly in dittoConfig.plist"
                )
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
                            self.onError?(
                                DittoError.general(
                                    "Authentication failed: \(error.localizedDescription)"
                                )
                            )
                        } else {
                            //debug print
                            print("Authentication successful")
                        }
                    }
                }

                // https://docs.ditto.live/sdk/latest/sync/syncing-data#start-sync
                try ditto.sync.start()

                // Register a subscription to the movies collection to only return kid movies
                // https://docs.ditto.live/sdk/latest/sync/syncing-data#subscriptions
                moviesSubscription = try ditto.sync.registerSubscription(
                    query:
                        "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'"
                )

                // Register a subscription to the movies collection to only return kid movies by year
                // Note with observers we can ask for the results to be delivered on a specific queue which
                // can improve performance by doing serializastion on a background queue (thread) and then return
                // to the main UI thread (MainActor) the final results.
                // https://docs.ditto.live/sdk/latest/crud/observing-data-changes
                moviesObserver = try ditto.store.registerObserver(
                    query:
                        "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies WHERE rated = 'G' OR rated = 'PG' ORDER BY year DESC",
                    deliverOn: backgroundQueue
                ) {
                    [weak self] result in
                    let newMovies = result.items.compactMap { item in
                        defer { item.dematerialize() }
                        return MovieListing(item.jsonData())
                    }
                    Task { @MainActor in
                        self?.onMoviesUpdate?(newMovies)
                    }
                }

                // Register a subscription to the comments collection
                commentsSubscription = try ditto.sync.registerSubscription(
                    query: "SELECT * FROM comments"
                )

                // Register observer for sync status monitoring
                // TODO update URL with production URL when published
                // https://docs.ditto.live/sdk/latest/sync/monitoring-sync-status
                syncStatusObserver = try ditto.store.registerObserver(
                    query:
                        "SELECT * FROM system:data_sync_info ORDER BY documents.sync_session_status, documents.last_update_received_time desc",
                    deliverOn: backgroundQueue
                ) { [weak self] result in
                    let syncStatusInfos = result.items.compactMap { item in
                        defer { item.dematerialize() }
                        return SyncStatusInfo(item.jsonData())
                    }
                    Task { @MainActor in
                        self?.onSyncStatusUpdate?(syncStatusInfos)
                    }
                }

                // Register observer for indexes monitoring
                indexesObserver = try ditto.store.registerObserver(
                    query: "SELECT * FROM system:indexes",
                    deliverOn: backgroundQueue
                ) { [weak self] result in
                    let indexInfos = result.items.compactMap { item in
                        defer { item.dematerialize() }
                        return IndexInfo(item.jsonData())
                    }
                    Task { @MainActor in
                        self?.onIndexesUpdate?(indexInfos)
                    }
                }

                // CREATE index on title and year field if it doesn't already exist
                // https://docs.ditto.live/dql/dql
                try await ditto.store.execute(
                    query:
                        "CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title)"
                )
                try await ditto.store.execute(
                    query:
                        "CREATE INDEX IF NOT EXISTS movies_year_idx ON movies(year)"
                )

                try await ditto.store.execute(
                    query:
                        "CREATE INDEX IF NOT EXISTS comments_movie_id_idx ON comments(movie_id)"
                )

                isInitialized = true
            } catch {
                throw DittoError.general(
                    "Failed to initialize Ditto: \(error.localizedDescription)"
                )
            }
        }
    }

    // MARK: - CRUD Operations
    func addComment(_ comment: [String: Any]) async throws -> String? {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }

        //https://docs.ditto.live/sdk/latest/crud/create#creating-documents
        let result = try await ditto.store.execute(
            query: "INSERT INTO comments DOCUMENTS (:newComment)",
            arguments: ["newComment": comment]
        )
        if let mutatedDocumentId =
            (result.mutatedDocumentIDs().first.flatMap { $0.stringValue })
        {
            return mutatedDocumentId
        }
        return "No mutatedDocumentIDs returned"
    }

    func addMovie(_ movie: [String: Any]) async throws -> String? {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }

        //https://docs.ditto.live/sdk/latest/crud/create#creating-documents
        let result = try await ditto.store.execute(
            query: "INSERT INTO movies DOCUMENTS (:newMovie)",
            arguments: ["newMovie": movie]
        )
        if let mutatedDocumentId =
            (result.mutatedDocumentIDs().first.flatMap { $0.stringValue })
        {
            return mutatedDocumentId
        }
        throw DittoError.general("No mutatedDocumentIDs returned")
    }

    func deleteMovie(id: String) async throws -> String? {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }

        //https://docs.ditto.live/sdk/latest/crud/delete
        let result = try await ditto.store.execute(
            query: "DELETE FROM movies WHERE _id = :_id",
            arguments: ["_id": id]
        )
        if let mutatedDocumentId =
            (result.mutatedDocumentIDs().first.flatMap { $0.stringValue })
        {
            return mutatedDocumentId
        }
        throw DittoError.general("No mutatedDocumentIDs returned")
    }

    func getCommentsCount(by movieId: String) async throws -> Int {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }

        let results = try await ditto.store.execute(
            query:
                "SELECT COUNT(*) as commentsCount FROM comments WHERE movie_id = :movieId",
            arguments: ["movieId": movieId]
        )

        // Release every item's materialized value once this call returns, not
        // just the one we read from.
        defer { results.items.forEach { $0.dematerialize() } }

        guard let firstItem = results.items.first,
            let commentsCountValue = firstItem.value["commentsCount"]
        else {
            return 0
        }

        // Handle different possible types for the count
        switch commentsCountValue {
        case let intValue as Int:
            return intValue
        case let doubleValue as Double:
            return Int(doubleValue)
        case let stringValue as String:
            if let intValue = Int(stringValue) {
                return intValue
            }
            return 0
        default:
            return 0
        }
    }

    func getComments(by movieId: String) async throws -> [Comment] {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }
        let results = try await ditto.store.execute(
            query:
                "SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC",
            arguments: ["movieId": movieId]
        )
        return results.items.compactMap { item in
            defer { item.dematerialize() }
            return Comment(item.jsonData())
        }
    }

    func getMovie(by id: String) async throws -> Movie? {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }
        //https://docs.ditto.live/sdk/latest/crud/read
        let results = try await ditto.store.execute(
            query: "SELECT * FROM movies WHERE _id = :_id",
            arguments: ["_id": id]
        )
        // Release every item's materialized value once this call returns, not
        // just the one we read from.
        defer { results.items.forEach { $0.dematerialize() } }

        return results.items.first.flatMap { Movie($0.jsonData()) }
    }

    func updateMovie(_ movie: Movie, updates: [String: Any]) async -> (
        Bool, String?
    ) {
        guard let ditto = ditto else {
            return (false, "Ditto not initialized")
        }
        let editableFields = [
            "countries", "fullplot", "plot", "poster", "title", "year",
        ]
        var updateStatements: [String] = []
        var arguments: [String: Any?] = ["_id": movie.id]
        for (key, value) in updates {
            guard editableFields.contains(key) else { continue }
            switch value {
            case is String, is Int, is [String]:
                updateStatements.append("\(key) = :\(key)")
                arguments[key] = value
            default:
                continue
            }
        }

        guard !updateStatements.isEmpty else {
            return (false, "No valid updates provided")
        }

        //https://docs.ditto.live/sdk/latest/crud/update
        let updateQuery =
            "UPDATE movies SET \(updateStatements.joined(separator: ", ")) WHERE _id = :_id"
        do {
            let results = try await ditto.store.execute(
                query: updateQuery,
                arguments: arguments
            )
            if let mutatedDocumentId =
                (results.mutatedDocumentIDs().first.flatMap { $0.stringValue })
            {
                // Get commit ID from SDK 4.12
                // TODO change this URL once production is fixed
                // https://ditto-248bc0d1-release-4-12-0.mintlify.app/sdk/latest/sync/monitoring-sync-status#using-commit-ids
                let commitIdString =
                    if let commitId = results.commitID {
                        "\(commitId)"
                    } else {
                        "N/A"
                    }
                let successMessage =
                    "Movie updated successfully\nDocument ID: \(mutatedDocumentId)\nCommit ID: \(commitIdString)"
                return (true, successMessage)
            }
        } catch {
            return (
                false, "Failed to update movie: \(error.localizedDescription)"
            )
        }
        return (false, "No mutatedDocumentIDs returned")
    }

    func registerCommentsObserver(
        for movieId: String,
        onCommentsUpdate: @escaping ([Comment]) -> Void
    ) -> DittoStoreObserver? {
        guard let ditto = ditto else {
            return nil
        }

        do {
            let observer = try ditto.store.registerObserver(
                query:
                    "SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC",
                arguments: ["movieId": movieId],
                deliverOn: backgroundQueue
            ) { result in
                let comments = result.items.compactMap { item in
                    defer { item.dematerialize() }
                    return Comment(item.jsonData())
                }
                onCommentsUpdate(comments)
            }
            return observer
        } catch {
            print("Failed to register comments observer: \(error)")
            return nil
        }
    }

    func searchMovies(by title: String) async throws -> [MovieListing] {
        guard let ditto = ditto else {
            throw DittoError.general("Ditto not initialized")
        }

        guard !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        else {
            return []
        }

        let results = try await ditto.store.execute(
            query:
                "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies WHERE title LIKE :searchTerm AND (rated = 'G' OR rated = 'PG') ORDER BY year DESC",
            arguments: ["searchTerm": "%\(title)%"]
        )

        return results.items.compactMap { item in
            defer { item.dematerialize() }
            return MovieListing(item.jsonData())
        }
    }

    deinit {
        moviesSubscription?.cancel()
        moviesObserver?.cancel()
        syncStatusObserver?.cancel()
        indexesObserver?.cancel()

        moviesSubscription = nil
        moviesObserver = nil
        syncStatusObserver = nil
        indexesObserver = nil

        ditto?.sync.stop()
    }
}
