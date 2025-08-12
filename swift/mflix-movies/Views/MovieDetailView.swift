import SwiftUI
import DittoSwift

struct MovieDetailView: View {
    let movieId: String
    @Environment(AppState.self) private var appState
    @State private var commentsObserver = CommentsObserver()
    @State private var movie: Movie?
    @State private var isEditMode = false
    @State private var isLoading = true
    @State private var isDataReady = false
    @State private var selectedTab = 0
    @State private var showingAddComment = false
    @State private var newCommentText = ""

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
        ZStack {
            if isLoading || !isDataReady {
                VStack {
                    Spacer()
                    ProgressView()
                        .scaleEffect(2.0)
                    Spacer()
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollView {
                    if let movie = movie {
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
                            
                            // Movie Header Info (always visible)
                            VStack(alignment: .leading, spacing: 16) {
                                // Title and Year
                                Text(movie.title)
                                    .font(.largeTitle)
                                    .fontWeight(.bold)
                                
                                HStack {
                                    Label(movie.year, systemImage: "calendar")
                                    Spacer()
                                    Label(movie.rated, systemImage: "star.fill")
                                        .foregroundColor(.orange)
                                }
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                                
                                // Genres
                                if !movie.genres.isEmpty {
                                    Text("Genres: \(movie.genres.joined(separator: ", "))")
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                
                                // Segmented Control
                                Picker("View", selection: $selectedTab) {
                                    Text("Details").tag(0)
                                    Text("Comments (\(commentsObserver.comments.count))").tag(1)
                                }
                                .pickerStyle(SegmentedPickerStyle())
                                .padding(.top, 8)
                                
                                // Tab Content
                                if selectedTab == 0 {
                                    // Movie Details
                                    if isEditMode {
                                        editModeView
                                    } else {
                                        detailsView
                                    }
                                } else {
                                    // Comments Section
                                    CommentsInlineView(
                                        movieId: movieId,
                                        comments: commentsObserver.comments,
                                        isLoading: commentsObserver.isLoading,
                                        showingAddComment: $showingAddComment,
                                        newCommentText: $newCommentText,
                                        onAddComment: addComment
                                    )
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
            }
        }
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            #if os(iOS)
            ToolbarItem(placement: .navigationBarTrailing) {
                if movie != nil && selectedTab == 0 {
                    Button(action: toggleEditMode) {
                        Image(systemName: isEditMode ? "xmark.circle" : "pencil")
                            .font(.body)
                    }
                }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                if isEditMode && selectedTab == 0 {
                    Button("Save") {
                        Task {
                            await saveChanges()
                        }
                    }
                    .fontWeight(.semibold)
                }
            }
            ToolbarItem(placement: .navigationBarTrailing) {
                if selectedTab == 1 {
                    Button(action: { showingAddComment = true }) {
                        Image(systemName: "plus.circle")
                            .font(.body)
                    }
                }
            }
            #else
            ToolbarItem(placement: .primaryAction) {
                if movie != nil && selectedTab == 0 {
                    Button(action: toggleEditMode) {
                        Image(systemName: isEditMode ? "xmark.circle" : "pencil")
                            .font(.body)
                    }
                }
            }
            ToolbarItem(placement: .confirmationAction) {
                if isEditMode && selectedTab == 0 {
                    Button("Save") {
                        Task {
                            await saveChanges()
                        }
                    }
                    .fontWeight(.semibold)
                }
            }
            ToolbarItem(placement: .primaryAction) {
                if selectedTab == 1 {
                    Button(action: { showingAddComment = true }) {
                        Image(systemName: "plus.circle")
                            .font(.body)
                    }
                }
            }
            #endif
        }
        .task {
            do {
                // Load movie and register comments observer
                try await loadMovie()
                commentsObserver.registerObserver(dittoService: appState.dittoService, movieId: movieId)
                
                // Mark data as ready
                isDataReady = true
            } catch {
                print("Error loading data: \(error)")
                isDataReady = true // Show error state
            }
        }
        .alert("Update Movie", isPresented: $showingSaveAlert) {
            Button("OK") { }
        } message: {
            Text(saveAlertMessage)
        }
        .sheet(isPresented: $showingAddComment) {
            AddCommentView(
                commentText: $newCommentText,
                onCancel: {
                    showingAddComment = false
                    newCommentText = ""
                },
                onSubmit: {
                    Task {
                        await addComment()
                    }
                }
            )
        }
        .onDisappear {
            commentsObserver.cleanup()
        }
    }
    
    private var detailsView: some View {
        VStack(alignment: .leading, spacing: 16) {
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
                    #if os(iOS)
                    .keyboardType(.numberPad)
                    #endif
                
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
                    #if os(iOS)
                    .keyboardType(.URL)
                    .autocapitalization(.none)
                    #else
                    .disableAutocorrection(true)
                    #endif
                
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
        self.movie = try await appState.dittoService.getMovie(by: movieId)
        isLoading = false
    }
    
    
    private func addComment() async {
        guard !newCommentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }
        
        let newComment: [String: Any] = [
            "_id": UUID().uuidString,
            "movie_id": movieId,
            "name": "Anonymous",
            "text": newCommentText,
            "date": ISO8601DateFormatter().string(from: Date()),
            "email": "anonymous@mflix.com"
        ]
        
        do {
            let (success, _) = try await appState.dittoService.addComment(newComment)
            if success {
                showingAddComment = false
                newCommentText = ""
                // Observer will automatically update the comments
            }
        } catch {
            print("Failed to add comment: \(error)")
        }
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
           let (success, message) = await appState.dittoService.updateMovie(movie, updates: updates)
                if success {
                    saveAlertMessage = message ?? "Movie updated successfully"
                    isEditMode = false
                    do {
                        isDataReady = false
                        try await loadMovie() // Reload to get updated data
                        isDataReady = true
                    } catch {
                        appState.setError(DittoError.general("Failed to reload movie after update: \(error)"))
                        isDataReady = true
                    }
                } else {
                    saveAlertMessage = message ?? "Failed to update movie"
                }
                showingSaveAlert = true
                
                
        } else {
            isEditMode = false
        }
    }
}

// MARK: UI Components

// Comments List View (Inline)
struct CommentsInlineView: View {
    let movieId: String
    let comments: [Comment]
    let isLoading: Bool
    @Binding var showingAddComment: Bool
    @Binding var newCommentText: String
    let onAddComment: () async -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            if isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.5)
                    Text("Loading comments...")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
            } else if comments.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "bubble.left.and.bubble.right")
                        .font(.system(size: 40))
                        .foregroundColor(.gray)
                    Text("No comments found")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Text("Be the first to add a comment!")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 20)
            } else {
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(comments) { comment in
                        CommentRowView(comment: comment)
                    }
                }
            }
        }
    }
}

// Individual Comment Row
struct CommentRowView: View {
    let comment: Comment
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(comment.name)
                    .font(.headline)
                Spacer()
                Text(comment.formattedDate)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(comment.text)
                .font(.body)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

// Add Comment Sheet
struct AddCommentView: View {
    @Binding var commentText: String
    let onCancel: () -> Void
    let onSubmit: () -> Void
    
    var body: some View {
        NavigationView {
            VStack {
                Form {
                    Section(header: Text("Your Comment")) {
                        TextEditor(text: $commentText)
                            .frame(minHeight: 150)
                    }
                }
            }
            .navigationTitle("Add Comment")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                #if os(iOS)
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Submit") {
                        onSubmit()
                    }
                    .fontWeight(.semibold)
                    .disabled(commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                #else
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        onCancel()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Submit") {
                        onSubmit()
                    }
                    .fontWeight(.semibold)
                    .disabled(commentText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                #endif
            }
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

// MARK: Helper functions

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
