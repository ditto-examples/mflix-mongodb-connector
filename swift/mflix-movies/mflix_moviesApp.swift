import SwiftUI

@main
struct mflix_moviesApp: App {
    @State private var errorMessage: String?
    @StateObject private var appState: AppState = {
        let config = loadDatabaseConfig()
        return AppState(configuration: config)
    }()
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
        }
    }

    init () {
        errorMessage = nil
    }

    /// Read the dittoConfig.plist file and store the appId, endpointUrl, and authToken to use elsewhere.
    static func loadDatabaseConfig() -> DatabaseConfig {
        guard let path = Bundle.main.path(forResource: "dittoConfig", ofType: "plist") else {
            fatalError("Could not load dittoConfig.plist file!")
        }

        // Any errors here indicate that the dittoConfig.plist file has not been formatted properly.
        // Expected key/values:
        //      "url": "your BigPeer Cloud URL Endpoint"
        //      "databaseId": "your BigPeer DatabaseID (used to be called appId)"
        //      "token": "your Server Authentication Token (used to be called online playground authentication token)"
        let data = NSData(contentsOfFile: path)! as Data
        let dittoConfigPropertyList = try! PropertyListSerialization.propertyList(from: data, format: nil) as! [String: Any]
        let url = dittoConfigPropertyList["url"]! as! String
        let databaseID = dittoConfigPropertyList["databaseID"]! as! String
        let token = dittoConfigPropertyList["token"]! as! String

        return DatabaseConfig(
            databaseID: databaseID,
            token: token,
            url: url,
        )
    }
}
