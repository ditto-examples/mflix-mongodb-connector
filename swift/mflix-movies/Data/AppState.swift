import Foundation

@Observable class AppState {
    var error: DittoError? = nil
    var movies: [MovieListing] = []
    var searchResults: [MovieListing] = []
    var syncStatusInfos: [SyncStatusInfo] = []
    var indexes: [IndexInfo] = []
    var databaseConfig: DatabaseConfig? = nil
    var dittoService: DittoService

    init(configuration: DatabaseConfig) {
        //cache for showing in the UI like the Quickstart Apps
        self.databaseConfig = configuration

        //create the DittoService with the provided configuration
        self.dittoService = DittoService(databaseConfig: configuration)

        // Set up error handler to avoid circular reference
        dittoService.onError = { [weak self] error in
            Task {
                await self?.setError(error)
            }
        }
        
        // Set up movies observer so if movies change the UI will update dynamically
        dittoService.onMoviesUpdate = { [weak self] movies in
            self?.movies = movies
        }
        
        // Set up sync status observer so if sync status changes the UI will update dynamically
        dittoService.onSyncStatusUpdate = { [weak self] syncStatusInfos in
            self?.syncStatusInfos = syncStatusInfos
        }
        
        // Set up indexes observer so if indexes change the UI will update dynamically
        dittoService.onIndexesUpdate = { [weak self] indexes in
            self?.indexes = indexes
        }
    }
    
    func searchMovies(query: String) async {
        do {
            let results = try await dittoService.searchMovies(by: query)
            searchResults = results
        } catch {
            await setError(DittoError.general("Search failed: \(error.localizedDescription)"))
        }
    }
    
    func clearSearch() {
        searchResults = []
    }

    @MainActor
    func setError(_ error: DittoError?) {
        self.error = error
    }

    func initialize() async {
        do {
            try await dittoService.initialize()
        }
        catch {
            await setError(DittoError.general(error.localizedDescription))
        }
    }
}

enum DittoError: Error {
    case general(String)
    case configError(String)

    var errorDescription: String? {
        switch self {
            case .general(let message),
                 .configError(let message):
                return message
        }
    }

    var message: String {
        return errorDescription ?? "Unknown error"
    }
}
