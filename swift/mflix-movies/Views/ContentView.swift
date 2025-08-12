import SwiftUI

struct ContentView: View {
    @Environment(AppState.self) private var appState
    @State private var isInitializing = true
    
    var body: some View {
        Group {
            if isInitializing {
                VStack(spacing: 20) {
                    ProgressView()
                        .scaleEffect(1.5)
                    Text("Initializing Ditto...")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
                .onAppear {
                    Task {
                        await appState.initialize()
                        isInitializing = false
                    }
                }
            } else {
                TabView {
                    NavigationStack {
                        MoviesListView()
                    }
                    .tabItem {
                        Image(systemName: "movieclapper")
                            .fontWeight(.light)
                        Text("Movies")
                    }
                    .tag(0)
                    
                    NavigationStack {
                        SystemView()
                    }
                    .tabItem {
                        Image(systemName: "gear")
                            .fontWeight(.light)
                        Text("System")
                    }
                    .tag(1)
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
