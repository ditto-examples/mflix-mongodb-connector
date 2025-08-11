import Foundation

@MainActor
class AppState : ObservableObject {
    @Published var error: DittoError? = nil
    @Published var movies: [MovieListing] = []
    var dittoService: DittoService

    init(configuration: DatabaseConfig) {
        self.dittoService = DittoService(databaseConfig: configuration)

        // Set up error handler to avoid circular reference
        dittoService.onError = { [weak self] error in
            self?.setError(error)
        }
        
        // Set up movies sync
        dittoService.onMoviesUpdate = { [weak self] movies in
            self?.movies = movies
        }
    }

    func setError(_ error: DittoError?) {
        self.error = error
    }

    func initialize() async {
        do {
            try await dittoService.initialize()
        }
        catch {
            setError(DittoError.general(error.localizedDescription))
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
