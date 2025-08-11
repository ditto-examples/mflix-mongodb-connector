import SwiftUI

struct MovieDetailView: View {
    let movieId: String
    @EnvironmentObject private var appState: AppState
    @State private var movie: Movie?
    @State private var isEditMode = false
    @State private var isLoading = true

    // Edit mode state
    @State private var editTitle = ""
    @State private var editPlot = ""
    @State private var editYear = ""
    @State private var editPoster = ""
    @State private var editFullplot = ""
    @State private var editCountries = ""

    @State private var showingSaveAlert = false
    @State private var saveAlertMessage = ""

    var body: some View {
        ScrollView {
            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.top, 100)
            } else if let movie = movie {
                VStack(alignment: .leading, spacing: 0) {
                    // Movie Poster
                    AsyncImage(url: URL(string: isEditMode ? editPoster : movie.poster)) { phase in
                        switch phase {
                            case .success(let image):
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                                    .frame(height: 400)
                                    .clipped()
                            case .failure(_), .empty:
                                Image(systemName: "photo")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 400)
                                    .background(Color.gray.opacity(0.2))
                            @unknown default:
                                ProgressView()
                                    .frame(height: 400)
                                    .frame(maxWidth: .infinity)
                        }
                    }

                    // Movie Details
                    VStack(alignment: .leading, spacing: 16) {
                        if isEditMode {
                            editModeView
                        } else {
                            readOnlyView
                        }
                    }
                    .padding()
                }
            } else {
                VStack(spacing: 20) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 50))
                        .foregroundColor(.orange)
                    Text("Movie not found")
                        .font(.title2)
                        .fontWeight(.semibold)
                }
                .padding(.top, 100)
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                if movie != nil {
                    Button(action: toggleEditMode) {
                        Image(systemName: isEditMode ? "xmark.circle" : "pencil")
                            .font(.body)
                    }
                }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                if isEditMode {
                    Button("Save") {
                        Task {
                            await saveChanges()
                        }
                    }
                    .fontWeight(.semibold)
                }
            }
        }
        .task {
            do {
                try await loadMovie()
            } catch {
                print("Error loading movie: \(error)")
            }
        }
        .alert("Update Movie", isPresented: $showingSaveAlert) {
            Button("OK") { }
        } message: {
            Text(saveAlertMessage)
        }
    }

    private var readOnlyView: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Title and Year
            Text(movie?.title ?? "")
                .font(.largeTitle)
                .fontWeight(.bold)

            HStack {
                Label(movie?.year ?? "", systemImage: "calendar")
                Spacer()
                Label(movie?.rated ?? "", systemImage: "star.fill")
                    .foregroundColor(.orange)
            }
            .font(.subheadline)
            .foregroundColor(.secondary)

            // Genres
            if let genres = movie?.genres, !genres.isEmpty {
                Text("Genres: \(genres.joined(separator: ", "))")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }

            Divider()

            // Plot
            VStack(alignment: .leading, spacing: 8) {
                Text("Plot")
                    .font(.headline)
                Text(movie?.plot ?? "")
                    .font(.body)
            }

            // Full Plot
            if let fullplot = movie?.fullplot, !fullplot.isEmpty, fullplot != movie?.plot {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Full Plot")
                        .font(.headline)
                    Text(fullplot)
                        .font(.body)
                }
            }

            Divider()

            // Additional Details
            VStack(alignment: .leading, spacing: 12) {
                if let languages = movie?.languages, !languages.isEmpty {
                    DetailRow(label: "Languages", value: languages.joined(separator: ", "))
                }

                if let released = movie?.released {
                    DetailRow(label: "Released", value: DateFormatter.movieDate.string(from: released))
                }

                if let directors = movie?.directors, !directors.isEmpty {
                    DetailRow(label: "Directors", value: directors.joined(separator: ", "))
                }

                if let countries = movie?.countries, !countries.isEmpty {
                    DetailRow(label: "Countries", value: countries.joined(separator: ", "))
                }

                // IMDB Rating
                if let imdb = movie?.imdb,
                   let rating = imdb["rating"] as? Double,
                   let votes = imdb["votes"] as? Int {
                    DetailRow(label: "IMDB Rating", value: "\(rating) (\(votes) votes)")
                }

                // Rotten Tomatoes
                if let tomatoes = movie?.tomatoes,
                   let viewer = tomatoes["viewer"] as? [String: Any],
                   let rating = viewer["rating"] as? Double {
                    DetailRow(label: "Rotten Tomatoes", value: "\(rating)")
                }
            }
        }
    }

    private var editModeView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Group {
                TextField("Title", text: $editTitle)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .font(.title3)

                TextField("Year", text: $editYear)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.numberPad)

                VStack(alignment: .leading) {
                    Text("Plot")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    TextEditor(text: $editPlot)
                        .frame(minHeight: 80)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )
                }

                TextField("Poster URL", text: $editPoster)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .keyboardType(.URL)
                    .autocapitalization(.none)

                VStack(alignment: .leading) {
                    Text("Full Plot")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    TextEditor(text: $editFullplot)
                        .frame(minHeight: 120)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                        )
                }

                TextField("Countries (comma-separated)", text: $editCountries)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
            }
        }
    }

    private func loadMovie() async throws {
        isLoading = true
        self.movie = try await appState.dittoService.getMovie(by: movieId)
        self.isLoading = false
    }

    private func toggleEditMode() {
        // Always populate fields with current movie data
        if let movie = movie {
            editTitle = movie.title
            editPlot = movie.plot
            editYear = movie.year
            editPoster = movie.poster
            editFullplot = movie.fullplot
            editCountries = movie.countries.joined(separator: ", ")
        }
        isEditMode.toggle()
    }

    private func saveChanges() async {
        guard let movie = movie else { return }

        var updates: [String: Any] = [:]

        if editTitle != movie.title {
            updates["title"] = editTitle
        }
        if editYear != movie.year {
            updates["year"] = editYear
        }
        if editPlot != movie.plot {
            updates["plot"] = editPlot
        }
        if editPoster != movie.poster {
            updates["poster"] = editPoster
        }
        if editFullplot != movie.fullplot {
            updates["fullplot"] = editFullplot
        }

        let newCountries = editCountries
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }

        if newCountries != movie.countries {
            updates["countries"] = newCountries
        }

        if !updates.isEmpty {
           let (success, error) = await appState.dittoService.updateMovie(movie, updates: updates)
                if success {
                    saveAlertMessage = "Movie updated successfully"
                    isEditMode = false
                    do {
                        try await loadMovie() // Reload to get updated data
                    } catch {
                        appState.setError(DittoError.general("Failed to reload movie after update: \(error)"))
                    }
                } else {
                    saveAlertMessage = error ?? "Failed to update movie"
                }
                showingSaveAlert = true


        } else {
            isEditMode = false
        }
    }
}

struct DetailRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .top) {
            Text(label + ":")
                .font(.subheadline)
                .fontWeight(.semibold)
                .frame(width: 120, alignment: .leading)
            Text(value)
                .font(.subheadline)
                .foregroundColor(.secondary)
            Spacer()
        }
    }
}

extension DateFormatter {
    static let movieDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .long
        formatter.timeStyle = .none
        return formatter
    }()
}

#Preview {
    NavigationStack {
        MovieDetailView(movieId: "sample-id")
    }
}
