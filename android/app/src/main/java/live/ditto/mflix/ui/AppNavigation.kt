package live.ditto.mflix.ui

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable
data object MovieListKey : NavKey

@Serializable
data class MovieDetailKey(val movieId: String) : NavKey
