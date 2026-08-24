package live.ditto.mflix.ui.movies

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import live.ditto.mflix.data.DittoRepository
import live.ditto.mflix.data.MovieListing

/** ViewModel backing the Movies list pane (grid + search + add movie). */
@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
class MoviesViewModel(private val repository: DittoRepository) : ViewModel() {

    /** null while the first observer event hasn't arrived yet. */
    val movies = repository.observeMovies()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val searchText = MutableStateFlow("")

    /** null = not searching; the subscription observer list is shown instead. */
    private val _searchResults = MutableStateFlow<List<MovieListing>?>(null)
    val searchResults = _searchResults.asStateFlow()

    private val _isSearching = MutableStateFlow(false)
    val isSearching = _isSearching.asStateFlow()

    /** One-off user messages surfaced as snackbars ("Movie added", "Error: ..."). */
    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 8)
    val events = _events.asSharedFlow()

    init {
        viewModelScope.launch {
            searchText
                .debounce(500)
                .distinctUntilChanged()
                .collectLatest { query ->
                    if (query.isBlank()) {
                        _searchResults.value = null
                        _isSearching.value = false
                    } else {
                        _isSearching.value = true
                        _searchResults.value = runCatching { repository.searchMovies(query) }
                            .getOrElse {
                                _events.tryEmit("Search failed: ${it.message}")
                                emptyList()
                            }
                        _isSearching.value = false
                    }
                }
        }
    }

    fun addMovie(
        title: String,
        year: Int,
        plot: String,
        fullplot: String,
        poster: String,
        countries: List<String>,
        onComplete: () -> Unit,
    ) {
        viewModelScope.launch {
            runCatching { repository.addMovie(title, year, plot, fullplot, poster, countries) }
                .onSuccess {
                    _events.tryEmit("Movie added – it will sync to MongoDB automatically")
                    onComplete()
                }
                .onFailure { _events.tryEmit("Failed to add movie: ${it.message}") }
        }
    }
}
