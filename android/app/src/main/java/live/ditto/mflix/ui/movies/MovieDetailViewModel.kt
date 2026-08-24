package live.ditto.mflix.ui.movies

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import live.ditto.mflix.data.DittoRepository

class MovieDetailViewModel(
    private val repository: DittoRepository,
    movieId: String,
) : ViewModel() {

    /** Stays null until the observer emits; the movie always exists in practice. */
    val movie = repository.observeMovie(movieId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val comments = repository.observeComments(movieId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _events = MutableSharedFlow<String>(extraBufferCapacity = 8)
    val events = _events.asSharedFlow()

    fun saveChanges(movieId: String, changed: Map<String, Any?>) {
        if (changed.isEmpty()) {
            _events.tryEmit("No changes to save")
            return
        }
        viewModelScope.launch {
            runCatching { repository.updateMovie(movieId, changed) }
                .onSuccess { outcome ->
                    _events.tryEmit(
                        "Updated ${outcome.mutatedDocumentCount} document(s), commit ${outcome.commitId}"
                    )
                }
                .onFailure { _events.tryEmit("Failed to update movie: ${it.message}") }
        }
    }

    fun addComment(movieId: String, text: String) {
        viewModelScope.launch {
            runCatching { repository.addComment(movieId, text) }
                .onSuccess { _events.tryEmit("Comment added") }
                .onFailure { _events.tryEmit("Failed to add comment: ${it.message}") }
        }
    }
}
