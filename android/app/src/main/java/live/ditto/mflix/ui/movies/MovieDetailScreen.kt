package live.ditto.mflix.ui.movies

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi
import androidx.compose.material3.adaptive.currentWindowAdaptiveInfo
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.window.core.layout.WindowSizeClass
import live.ditto.mflix.MFlixApplication
import live.ditto.mflix.data.Comment
import live.ditto.mflix.data.Movie
import live.ditto.mflix.ui.components.EmptyStateView
import live.ditto.mflix.ui.components.LoadingView
import live.ditto.mflix.ui.components.formatRating
import live.ditto.mflix.ui.components.longDate
import live.ditto.mflix.ui.components.relativeTime
import androidx.compose.material.icons.outlined.ChatBubbleOutline

private enum class DetailTab { Details, Comments }

@OptIn(ExperimentalMaterial3Api::class, ExperimentalMaterial3AdaptiveApi::class)
@Composable
fun MovieDetailScreen(movieId: String, onBack: () -> Unit) {
    val app = LocalContext.current.applicationContext as MFlixApplication
    val viewModel: MovieDetailViewModel = viewModel(key = "detail-$movieId") {
        MovieDetailViewModel(app.repository, movieId)
    }

    val movie by viewModel.movie.collectAsStateWithLifecycle()
    val comments by viewModel.comments.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(Unit) {
        viewModel.events.collect { snackbarHostState.showSnackbar(it) }
    }

    var selectedTab by rememberSaveable { mutableStateOf(DetailTab.Details.name) }
    var isEditing by rememberSaveable { mutableStateOf(false) }
    var showAddComment by rememberSaveable { mutableStateOf(false) }

    // In a two-pane list-detail layout the detail pane must not show a back
    // arrow; the pane never goes away there.
    val isTwoPane = currentWindowAdaptiveInfo().windowSizeClass
        .isWidthAtLeastBreakpoint(WindowSizeClass.WIDTH_DP_MEDIUM_LOWER_BOUND)

    val currentMovie = movie

    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    if (!isTwoPane) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    }
                },
                actions = {
                    if (currentMovie != null && DetailTab.valueOf(selectedTab) == DetailTab.Details) {
                        if (isEditing) {
                            IconButton(onClick = { isEditing = false }) {
                                Icon(Icons.Filled.Close, contentDescription = "Cancel editing")
                            }
                        } else {
                            IconButton(onClick = { isEditing = true }) {
                                Icon(Icons.Filled.Edit, contentDescription = "Edit movie")
                            }
                        }
                    }
                },
            )
        },
        floatingActionButton = {
            if (DetailTab.valueOf(selectedTab) == DetailTab.Comments) {
                FloatingActionButton(onClick = { showAddComment = true }) {
                    Icon(Icons.Filled.Add, contentDescription = "Add comment")
                }
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        if (currentMovie == null) {
            LoadingView("Loading movie details...", modifier = Modifier.padding(padding))
            return@Scaffold
        }

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            Column(
                modifier = Modifier.padding(horizontal = 16.dp),
            ) {
                MoviePosterImage(
                    poster = currentMovie.poster,
                    contentDescription = currentMovie.title,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp),
                )
                Text(
                    currentMovie.title,
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(top = 12.dp),
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.padding(top = 8.dp),
                ) {
                    if (currentMovie.year.isNotBlank()) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Filled.DateRange,
                                contentDescription = null,
                                modifier = Modifier.height(18.dp),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                            Spacer(Modifier.width(4.dp))
                            Text(currentMovie.year, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Filled.Star,
                            contentDescription = null,
                            modifier = Modifier.height(18.dp),
                            tint = androidx.compose.ui.graphics.Color(0xFFF5A623),
                        )
                        Spacer(Modifier.width(4.dp))
                        Text(currentMovie.rated, style = MaterialTheme.typography.bodyMedium)
                    }
                }
                if (currentMovie.genres.isNotEmpty()) {
                    Text(
                        "Genres: ${currentMovie.genres.joinToString()}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }

                SingleChoiceSegmentedButtonRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                ) {
                    SegmentedButton(
                        selected = DetailTab.valueOf(selectedTab) == DetailTab.Details,
                        onClick = { selectedTab = DetailTab.Details.name },
                        shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2),
                    ) { Text("Details") }
                    SegmentedButton(
                        selected = DetailTab.valueOf(selectedTab) == DetailTab.Comments,
                        onClick = {
                            selectedTab = DetailTab.Comments.name
                            isEditing = false
                        },
                        shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2),
                    ) { Text("Comments (${comments.size})") }
                }
            }

            when (DetailTab.valueOf(selectedTab)) {
                DetailTab.Details -> MovieDetailsTab(
                    movie = currentMovie,
                    isEditing = isEditing,
                    onSave = { changed ->
                        viewModel.saveChanges(currentMovie.id, changed)
                        if (changed.isNotEmpty()) isEditing = false
                    },
                )
                DetailTab.Comments -> CommentsTab(comments = comments)
            }
        }
    }

    if (showAddComment) {
        AddCommentDialog(
            onDismiss = { showAddComment = false },
            onSubmit = { text ->
                viewModel.addComment(movieId, text)
                showAddComment = false
            },
        )
    }
}

@Composable
private fun MovieDetailsTab(
    movie: Movie,
    isEditing: Boolean,
    onSave: (Map<String, Any?>) -> Unit,
) {
    var title by rememberSaveable(movie.id) { mutableStateOf(movie.title) }
    var year by rememberSaveable(movie.id) { mutableStateOf(movie.year) }
    var poster by rememberSaveable(movie.id) { mutableStateOf(movie.poster ?: "") }
    var plot by rememberSaveable(movie.id) { mutableStateOf(movie.plot) }
    var fullplot by rememberSaveable(movie.id) { mutableStateOf(movie.fullplot) }
    var countries by rememberSaveable(movie.id) { mutableStateOf(movie.countries.joinToString(", ")) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp)
            .padding(bottom = 32.dp),
    ) {
        if (isEditing) {
            EditableField("Title", title, singleLine = true) { title = it }
            EditableField("Year", year, singleLine = true, numeric = true) { year = it }
            EditableField("Poster URL", poster, singleLine = true) { poster = it }
            EditableField("Plot", plot, minLines = 3) { plot = it }
            EditableField("Full Plot", fullplot, minLines = 4) { fullplot = it }
            EditableField("Countries (comma-separated)", countries, singleLine = true) { countries = it }
            androidx.compose.material3.Button(
                onClick = {
                    val changed = buildMap<String, Any?> {
                        if (title != movie.title) put("title", title)
                        if (year != movie.year) put("year", year.toIntOrNull() ?: year)
                        if (poster != (movie.poster ?: "")) put("poster", poster)
                        if (plot != movie.plot) put("plot", plot)
                        if (fullplot != movie.fullplot) put("fullplot", fullplot)
                        val newCountries = countries.split(",").map { it.trim() }.filter { it.isNotEmpty() }
                        if (newCountries != movie.countries) put("countries", newCountries)
                    }
                    onSave(changed)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
            ) { Text("Save Changes") }
        } else {
            if (movie.plot.isNotBlank()) {
                SectionHeader("Plot")
                Text(movie.plot, style = MaterialTheme.typography.bodyMedium)
            }
            if (movie.fullplot.isNotBlank() && movie.fullplot != movie.plot) {
                SectionHeader("Full Plot")
                Text(movie.fullplot, style = MaterialTheme.typography.bodyMedium)
            }
            Spacer(Modifier.height(16.dp))
            DetailRow("Directors", movie.directors.joinToString())
            if (movie.cast.isNotEmpty()) {
                DetailRow("Cast", movie.cast.take(5).joinToString())
            }
            DetailRow("Languages", movie.languages.joinToString())
            DetailRow("Countries", movie.countries.joinToString())
            if (movie.runtime.isNotBlank()) DetailRow("Runtime", movie.runtime)
            DetailRow("Released", longDate(movie.released))
            movie.imdbRating?.let {
                val votes = movie.imdbVotes?.let { v -> " ($v votes)" } ?: ""
                DetailRow("IMDB Rating", formatRating(it) + votes)
            }
            movie.rottenRating?.let { DetailRow("Rotten Tomatoes", formatRating(it)) }
        }
    }
}

@Composable
private fun EditableField(
    label: String,
    value: String,
    singleLine: Boolean = false,
    minLines: Int = 1,
    numeric: Boolean = false,
    onChange: (String) -> Unit,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        label = { Text(label) },
        singleLine = singleLine,
        minLines = minLines,
        keyboardOptions = if (numeric) KeyboardOptions(keyboardType = KeyboardType.Number)
        else KeyboardOptions.Default,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
    )
}

@Composable
private fun SectionHeader(title: String) {
    Text(
        title,
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.padding(top = 16.dp, bottom = 4.dp),
    )
}

@Composable
private fun DetailRow(label: String, value: String) {
    if (value.isBlank()) return
    Row(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(
            label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.width(120.dp),
        )
        Text(value, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun CommentsTab(comments: List<Comment>) {
    if (comments.isEmpty()) {
        EmptyStateView(
            icon = Icons.Outlined.ChatBubbleOutline,
            title = "No comments yet",
            subtitle = "Be the first to add a comment!",
        )
        return
    }
    LazyColumn(
        contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.fillMaxSize(),
    ) {
        items(comments, key = { it.id }) { comment ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        MaterialTheme.colorScheme.surfaceContainerHigh,
                        RoundedCornerShape(12.dp),
                    )
                    .padding(12.dp),
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        comment.name,
                        style = MaterialTheme.typography.titleSmall,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        relativeTime(comment.date),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Spacer(Modifier.height(4.dp))
                Text(comment.text, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

@Composable
private fun AddCommentDialog(onDismiss: () -> Unit, onSubmit: (String) -> Unit) {
    var text by rememberSaveable { mutableStateOf("") }
    val maxLength = 500

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Comment") },
        text = {
            Column {
                OutlinedTextField(
                    value = text,
                    onValueChange = { if (it.length <= maxLength) text = it },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 4,
                    placeholder = { Text("Share your thoughts...") },
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "${text.length} / $maxLength",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        },
        confirmButton = {
            TextButton(onClick = { onSubmit(text.trim()) }, enabled = text.isNotBlank()) {
                Text("Post")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
