import SwiftUI
import DittoSwift

@MainActor
class CommentsObserver: ObservableObject {
    @Published var comments: [Comment] = []
    @Published var isLoading = true
    private var observer: DittoStoreObserver?

    func registerObserver(dittoService: DittoService, movieId: String) {
        isLoading = true
        observer = dittoService.registerCommentsObserver(for: movieId) { [weak self] comments in
            Task { @MainActor in
                self?.comments = comments
                self?.isLoading = false
            }
        }
    }

    func cleanup() {
        observer?.cancel()
        observer = nil
    }
}
