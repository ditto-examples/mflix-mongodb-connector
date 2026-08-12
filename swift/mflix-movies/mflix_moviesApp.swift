import SwiftUI

@main
struct mflix_moviesApp: App {
    @State private var errorMessage: String?
    @State private var appState: AppState = {
        let config = loadDatabaseConfig()
        return AppState(configuration: config)
    }()
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
        }
    }

    init () {
        errorMessage = nil
    }

    /// Read the Ditto values generated from the root .env file.
    static func loadDatabaseConfig() -> DatabaseConfig {
        let databaseID = Env.DITTO_DATABASE_ID
        let token = Env.DITTO_DEVELOPMENT_TOKEN
        let serverURL = Env.DITTO_SERVER_URL

        guard !databaseID.isEmpty, !token.isEmpty, !serverURL.isEmpty else {
            fatalError(
                "Missing Ditto configuration. Copy .env.template to .env at the repository root and set the Ditto development credentials."
            )
        }

        return DatabaseConfig(
            databaseID: databaseID,
            token: token,
            url: serverURL
        )
    }
}
