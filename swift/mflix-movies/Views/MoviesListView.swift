import SwiftUI

struct MoviesListView: View {
    @Environment(AppState.self) private var appState
    @State private var showingAddMovie = false
    @State private var searchText = ""

    var body: some View {
        NavigationStack {
            Group {
                if !appState.dittoService.isInitialized {
                    loadingView
                } else if isSearchActive && appState.searchResults.isEmpty && !searchText.isEmpty {
                    searchEmptyStateView
                } else if isSearchActive {
                    searchResultsList
                } else if appState.movies.isEmpty {
                    if (appState.error != nil) {
                        errorStateView
                    } else {
                        emptyStateView
                    }
                } else {
                    moviesList
                }
            }
            .navigationTitle("Kid Movies")
            .searchable(text: $searchText, prompt: "Search movies by title")
            .onSubmit(of: .search) {
                performSearch()
            }
            .onChange(of: searchText) { _, newValue in
                if newValue.isEmpty {
                    appState.clearSearch()
                } else {
                    performSearch()
                }
            }
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddMovie = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
                #else
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showingAddMovie = true }) {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                }
                #endif
            }
            .sheet(isPresented: $showingAddMovie) {
                AddMovieView()
            }
            .alert(
                "Error",
                isPresented: .constant(appState.error?.message != nil)
            ) {
                Button("OK") {
                    appState.error = nil
                }
            } message: {
                if let errorMessage = appState.error?.message {
                    Text(errorMessage)
                }
            }
        }
    }
    
    private var isSearchActive: Bool {
        !searchText.isEmpty
    }
    
    private func performSearch() {
        guard !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            appState.clearSearch()
            return
        }
        
        Task {
            await appState.searchMovies(query: searchText)
        }
    }

    private var loadingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)
            Text(
                "Trying to load movies..."
            )
            .multilineTextAlignment(.center)
            .foregroundColor(.secondary)
            .padding(.horizontal)
        }
    }

    private var emptyStateView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .scaleEffect(1.5)
            Text("No Movies Found - Ensure your config values in the dittoConfig.plist file is correct.")
                .font(.headline)
                .foregroundColor(.secondary)
        }
    }

    private var errorStateView: some View {
        VStack(spacing: 20) {
            ContentUnavailableView(
                "Error",
                systemImage: "exclamationmark.triangle.fill",
                description: Text(appState.error?.message ?? "An unknown error occurred")
            )
        }
    }

    private var moviesList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(appState.movies) { movie in
                    NavigationLink(
                        destination: MovieDetailView(movieId: movie.id)
                    ) {
                        MovieRowView(movie: movie)
                    }
                    .buttonStyle(PlainButtonStyle())
                    .contentShape(Rectangle())
                }
            }
            .padding()
        }
    }
    
    private var searchResultsList: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                ForEach(appState.searchResults) { movie in
                    NavigationLink(
                        destination: MovieDetailView(movieId: movie.id)
                    ) {
                        MovieRowView(movie: movie)
                    }
                    .buttonStyle(PlainButtonStyle())
                    .contentShape(Rectangle())
                }
            }
            .padding()
        }
    }
    
    private var searchEmptyStateView: some View {
        VStack(spacing: 20) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 50))
                .foregroundColor(.gray)
            Text("No movies found")
                .font(.title2)
                .foregroundColor(.secondary)
            Text("Try searching for a different title")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
    }
}

struct MovieRowView: View {
    let movie: MovieListing

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Movie Poster
            AsyncImage(url: URL(string: movie.poster)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(height: 200)
                        .clipped()
                case .failure(_), .empty:
                    Image(systemName: "photo")
                        .font(.system(size: 50))
                        .foregroundColor(.gray)
                        .frame(maxWidth: .infinity)
                        .frame(height: 200)
                        .background(Color.gray.opacity(0.2))
                @unknown default:
                    ProgressView()
                        .frame(height: 200)
                        .frame(maxWidth: .infinity)
                }
            }

            // Movie Details
            VStack(alignment: .leading, spacing: 8) {
                Text(movie.title)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(3)

                Text(movie.year)
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Text(movie.plot)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
                
                // Only show ratings HStack if at least one rating exists
                if let imdbRating = movie.formattedImdbRating, let rottenRating = movie.formattedRottenRating {
                    HStack {
                        Text("IMDB: \(imdbRating)")
                        Text("Rotten Tomatoes: \(rottenRating)")
                    }
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                } else if let imdbRating = movie.formattedImdbRating {
                    Text("IMDB: \(imdbRating)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                } else if let rottenRating = movie.formattedRottenRating {
                    Text("Rotten Tomatoes: \(rottenRating)")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        #if os(iOS)
        .background(Color(UIColor.secondarySystemBackground))
        #else
        .background(Color(NSColor.controlBackgroundColor))
        #endif
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct AddMovieView: View {
    @Environment(\.dismiss) var dismiss
    @Environment(AppState.self) private var appState

    @State private var title = ""
    @State private var plot = ""
    @State private var year = ""
    @State private var poster = ""
    @State private var fullplot = ""
    @State private var countries = ""
    @State private var showingAlert = false
    @State private var alertMessage = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Basic Information") {
                    TextField("Title", text: $title)
                    TextField("Year", text: $year)
                        #if os(iOS)
                        .keyboardType(.numberPad)
                        #endif
                    TextField("Plot", text: $plot, axis: .vertical)
                        .lineLimit(3...6)
                }

                Section("Additional Details") {
                    TextField("Poster URL", text: $poster)
                        #if os(iOS)
                        .keyboardType(.URL)
                        .autocapitalization(.none)
                        #else
                        .disableAutocorrection(true)
                        #endif
                    TextField("Full Plot", text: $fullplot, axis: .vertical)
                        .lineLimit(4...8)
                    TextField("Countries (comma-separated)", text: $countries)
                }
            }
            .navigationTitle("Add Movie")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        Task {
                            await saveMovie()
                        }
                    }
                    .disabled(title.isEmpty || year.isEmpty || plot.isEmpty)
                }
                #else
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await saveMovie()
                        }
                    }
                    .disabled(title.isEmpty || year.isEmpty || plot.isEmpty)
                }
                #endif
            }
            .alert("Add Movie", isPresented: $showingAlert) {
                Button("OK") {
                    if alertMessage.contains("success") {
                        dismiss()
                    }
                }
            } message: {
                Text(alertMessage)
            }
        }
    }

    private func saveMovie() async {
        let movieId = UUID().uuidString
        let countriesList = countries.split(separator: ",").map {
            $0.trimmingCharacters(in: .whitespaces)
        }

        let newMovie: [String: Any] = [
            "_id": movieId,
            "title": title,
            "plot": plot,
            "year": year,
            "poster": poster,
            "fullplot": fullplot.isEmpty ? plot : fullplot,
            "countries": countriesList.isEmpty ? ["Unknown"] : countriesList,
            "rated": "G",
            "genres": ["Family"],
            "runtime": 0,
            "cast": [],
            "languages": ["English"],
            "directors": [],
            "released": ISO8601DateFormatter().string(from: Date()),
        ]
        do {
            if let result = try await appState.dittoService.addMovie(newMovie){
                alertMessage = "Results: \(result)!"
            }
        } catch {
            alertMessage = "Error: \(error.localizedDescription)"
        }
        showingAlert = true
    }
}

#Preview {
    MoviesListView()
}
