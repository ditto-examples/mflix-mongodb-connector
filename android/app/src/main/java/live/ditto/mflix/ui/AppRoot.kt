package live.ditto.mflix.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.adaptive.ExperimentalMaterial3AdaptiveApi
import androidx.compose.material3.adaptive.navigation3.ListDetailSceneStrategy
import androidx.compose.material3.adaptive.navigation3.rememberListDetailSceneStrategy
import androidx.compose.material3.adaptive.navigationsuite.NavigationSuiteScaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import live.ditto.mflix.MFlixApplication
import live.ditto.mflix.ui.components.EmptyStateView
import live.ditto.mflix.ui.components.LoadingView
import live.ditto.mflix.ui.components.MissingConfigScreen
import live.ditto.mflix.ui.movies.MovieDetailScreen
import live.ditto.mflix.ui.movies.MoviesScreen
import live.ditto.mflix.ui.system.SystemScreen
import live.ditto.mflix.ui.tools.ToolsScreen

private enum class TopLevelDestination(val label: String, val icon: ImageVector) {
    Movies("Movies", Icons.Filled.Movie),
    System("System", Icons.Filled.Settings),
    Tools("Tools", Icons.Filled.Build),
}

/**
 * App shell: bottom navigation bar on phones and a navigation rail on tablets
 * (via [NavigationSuiteScaffold]), with the Movies tab rendered as an
 * adaptive list-detail layout (via the Navigation 3 [ListDetailSceneStrategy]).
 */
@OptIn(ExperimentalMaterial3AdaptiveApi::class)
@Composable
fun AppRoot() {
    val app = LocalContext.current.applicationContext as MFlixApplication
    val repository = app.repository

    val missingKeys = repository.missingConfigKeys
    if (missingKeys.isNotEmpty()) {
        MissingConfigScreen(missingKeys)
        return
    }

    val ditto by repository.ditto.collectAsStateWithLifecycle()
    val initError by repository.initError.collectAsStateWithLifecycle()
    if (ditto == null) {
        LoadingView(
            message = initError
                ?: "Trying to retrieve data – if this is the first data sync this can take a while"
        )
        return
    }

    var destination by rememberSaveable { mutableStateOf(TopLevelDestination.Movies.name) }

    // Hoisted above the tab switch so the Movies back stack (and the selected
    // movie in the detail pane) survives switching to System/Tools and back.
    val moviesBackStack = rememberNavBackStack(MovieListKey)
    val listDetailStrategy = rememberListDetailSceneStrategy<NavKey>()

    NavigationSuiteScaffold(
        navigationSuiteItems = {
            TopLevelDestination.entries.forEach { item ->
                item(
                    selected = destination == item.name,
                    onClick = { destination = item.name },
                    icon = { Icon(item.icon, contentDescription = item.label) },
                    label = { Text(item.label) },
                )
            }
        },
        modifier = Modifier.fillMaxSize(),
    ) {
        when (TopLevelDestination.valueOf(destination)) {
            TopLevelDestination.Movies -> NavDisplay(
                backStack = moviesBackStack,
                onBack = { moviesBackStack.removeLastOrNull() },
                sceneStrategies = listOf(listDetailStrategy),
                entryProvider = entryProvider {
                    entry<MovieListKey>(
                        metadata = ListDetailSceneStrategy.listPane(
                            detailPlaceholder = {
                                MovieDetailPlaceholder()
                            }
                        )
                    ) {
                        MoviesScreen(
                            onMovieClick = { movieId ->
                                if (moviesBackStack.lastOrNull() != MovieDetailKey(movieId)) {
                                    moviesBackStack.add(MovieDetailKey(movieId))
                                }
                            }
                        )
                    }
                    entry<MovieDetailKey>(
                        metadata = ListDetailSceneStrategy.detailPane()
                    ) { key ->
                        MovieDetailScreen(
                            movieId = key.movieId,
                            onBack = { moviesBackStack.removeLastOrNull() },
                        )
                    }
                }
            )

            TopLevelDestination.System -> SystemScreen()
            TopLevelDestination.Tools -> ToolsScreen()
        }
    }
}

@Composable
private fun MovieDetailPlaceholder() {
    EmptyStateView(
        icon = Icons.Filled.Movie,
        title = "Select a movie",
        subtitle = "Choose a movie from the list to see its details and comments.",
    )
}
