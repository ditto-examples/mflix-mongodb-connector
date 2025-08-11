//
//  ContentView.swift
//  mflix-movies
//
//  Created by Aaron LaBeau on 8/8/25.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var appState: AppState
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
                MoviesListView()
            }
        }
    }
}

#Preview {
    ContentView()
}
