import SwiftUI
import DittoSwift

@Observable class CommentsObserver {
    var comments: [Comment] = []
    var isLoading = true
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
