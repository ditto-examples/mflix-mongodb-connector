package live.ditto.mflix.ui.movies

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddCircle
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.input.nestedscroll.nestedScroll
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import live.ditto.mflix.MFlixApplication
import live.ditto.mflix.ui.components.EmptyStateView
import live.ditto.mflix.ui.components.LoadingView
import live.ditto.mflix.ui.components.UiIcons

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoviesScreen(onMovieClick: (String) -> Unit) {
    val app = LocalContext.current.applicationContext as MFlixApplication
    val viewModel: MoviesViewModel = viewModel(key = "movies") {
        MoviesViewModel(app.repository)
    }

    val movies by viewModel.movies.collectAsStateWithLifecycle()
    val searchText by viewModel.searchText.collectAsStateWithLifecycle()
    val searchResults by viewModel.searchResults.collectAsStateWithLifecycle()
    val isSearching by viewModel.isSearching.collectAsStateWithLifecycle()

    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(Unit) {
        viewModel.events.collect { snackbarHostState.showSnackbar(it) }
    }

    var showAddMovie by rememberSaveable { mutableStateOf(false) }
    val scrollBehavior = TopAppBarDefaults.enterAlwaysScrollBehavior()

    Scaffold(
        modifier = Modifier.nestedScroll(scrollBehavior.nestedScrollConnection),
        topBar = {
            TopAppBar(
                title = { Text("Kid Movies") },
                scrollBehavior = scrollBehavior,
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showAddMovie = true }) {
                Icon(Icons.Filled.AddCircle, contentDescription = "Add movie")
            }
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        val isSearchActive = searchText.isNotBlank()

        androidx.compose.foundation.layout.Column(
            modifier = Modifier.fillMaxSize().padding(padding)
        ) {
            OutlinedTextField(
                value = searchText,
                onValueChange = { viewModel.searchText.value = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search movies by title...") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                trailingIcon = {
                    if (searchText.isNotEmpty()) {
                        IconButton(onClick = { viewModel.searchText.value = "" }) {
                            Icon(Icons.Filled.Clear, contentDescription = "Clear search")
                        }
                    }
                },
                singleLine = true,
                shape = MaterialTheme.shapes.extraLarge,
            )
            if (isSearching) {
                LinearProgressIndicator(modifier = Modifier.fillMaxWidth())
            }

            when {
                isSearchActive -> {
                    val results = searchResults
                    when {
                        results == null && isSearching -> LoadingView("Searching movies...")
                        results.isNullOrEmpty() && searchText.isNotBlank() ->
                            EmptyStateView(
                                icon = UiIcons.NoSearchResults,
                                title = "No movies found",
                                subtitle = "Try searching for a different title.",
                            )
                        else -> MovieGrid(
                            movies = results.orEmpty(),
                            onMovieClick = onMovieClick,
                        )
                    }
                }

                movies == null -> LoadingView(
                    "Trying to load movies – the first data sync can take a while"
                )

                movies.orEmpty().isEmpty() -> EmptyStateView(
                    icon = UiIcons.NoMovies,
                    title = "No movies found",
                    subtitle = "Ensure the values in the root .env file are correct and the " +
                        "MongoDB connector has synced.",
                )

                else -> MovieGrid(movies = movies.orEmpty(), onMovieClick = onMovieClick)
            }
        }
    }

    if (showAddMovie) {
        ModalBottomSheet(
            onDismissRequest = { showAddMovie = false },
            sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        ) {
            AddMovieForm(
                onSave = { title, year, plot, fullplot, poster, countries ->
                    viewModel.addMovie(title, year, plot, fullplot, poster, countries) {
                        showAddMovie = false
                    }
                },
                onCancel = { showAddMovie = false },
            )
        }
    }
}

@Composable
private fun MovieGrid(
    movies: List<live.ditto.mflix.data.MovieListing>,
    onMovieClick: (String) -> Unit,
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 300.dp),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        modifier = Modifier.fillMaxSize(),
    ) {
        items(movies, key = { it.id }) { movie ->
            MovieCard(movie = movie, onClick = { onMovieClick(movie.id) })
        }
    }
}
