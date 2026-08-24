package live.ditto.mflix.data

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.longOrNull
import java.time.Instant

/**
 * The mflix dataset synced through the Ditto MongoDB connector mixes types
 * across documents (e.g. `year` can be a number or a string, comment `date`
 * can be an ISO string, epoch millis, or Mongo extended JSON). DTOs therefore
 * keep such fields as [JsonElement] and expose parsed accessors on the UI
 * models below.
 */
val DittoJson = Json {
    ignoreUnknownKeys = true
    isLenient = true
    coerceInputValues = true
}

// ---------- JSON element helpers ----------

fun JsonElement?.asDisplayString(): String? = when (this) {
    is JsonPrimitive -> if (isString) content else content
    else -> null
}

fun JsonElement?.asDouble(): Double? = (this as? JsonPrimitive)?.doubleOrNull
    ?: (this as? JsonPrimitive)?.contentOrNull?.toDoubleOrNull()

fun JsonElement?.asLong(): Long? = (this as? JsonPrimitive)?.longOrNull
    ?: (this as? JsonPrimitive)?.contentOrNull?.toLongOrNull()

fun JsonElement?.asStringList(): List<String> = when (this) {
    is JsonArray -> mapNotNull { (it as? JsonPrimitive)?.contentOrNull }
    is JsonPrimitive -> contentOrNull?.let { listOf(it) } ?: emptyList()
    else -> emptyList()
}

/** Parses ISO-8601 strings, epoch millis numbers, and Mongo `$date` extended JSON. */
fun JsonElement?.asInstant(): Instant? {
    when (this) {
        is JsonObject -> get("\$date")?.asInstant()?.let { return it }
        is JsonPrimitive -> {
            if (isString) {
                content.toLongOrNull()?.let { return Instant.ofEpochMilli(it) }
                runCatching { Instant.parse(content) }.getOrNull()?.let { return it }
                // e.g. "2000-01-01T00:00:00" without an offset
                runCatching { java.time.OffsetDateTime.parse(content) }
                    .getOrNull()?.let { return it.toInstant() }
            } else {
                contentOrNull?.toLongOrNull()?.let { return Instant.ofEpochMilli(it) }
                asDouble()?.let { return Instant.ofEpochMilli(it.toLong()) }
            }
        }
        else -> Unit
    }
    return null
}

// ---------- Listings ----------

@Serializable
data class MovieListingDto(
    val _id: String,
    val title: String = "",
    val year: JsonElement? = null,
    val plot: String? = null,
    val poster: String? = null,
    val imdbRating: JsonElement? = null,
    val rottenRating: JsonElement? = null,
)

data class MovieListing(
    val id: String,
    val title: String,
    val year: String,
    val plot: String,
    val poster: String?,
    val imdbRating: Double?,
    val rottenRating: Double?,
) {
    val hasRatings: Boolean get() = imdbRating != null || rottenRating != null
}

fun MovieListingDto.toModel() = MovieListing(
    id = _id,
    title = title.ifBlank { "Untitled" },
    year = year.asDisplayString() ?: "",
    plot = plot ?: "",
    poster = poster?.takeIf { it.isNotBlank() },
    imdbRating = imdbRating.asDouble(),
    rottenRating = rottenRating.asDouble(),
)

// ---------- Full movie ----------

@Serializable
data class RatingsDto(
    val rating: JsonElement? = null,
    val votes: JsonElement? = null,
)

@Serializable
data class TomatoesViewerDto(
    val rating: JsonElement? = null,
)

@Serializable
data class TomatoesDto(
    val viewer: TomatoesViewerDto? = null,
)

@Serializable
data class MovieDto(
    val _id: String,
    val title: String = "",
    val year: JsonElement? = null,
    val plot: String? = null,
    val fullplot: String? = null,
    val poster: String? = null,
    val rated: String? = null,
    val genres: List<String> = emptyList(),
    val runtime: JsonElement? = null,
    val cast: List<String> = emptyList(),
    val languages: List<String> = emptyList(),
    val directors: List<String> = emptyList(),
    val countries: List<String> = emptyList(),
    val released: JsonElement? = null,
    val imdb: RatingsDto? = null,
    val tomatoes: TomatoesDto? = null,
)

data class Movie(
    val id: String,
    val title: String,
    val year: String,
    val plot: String,
    val fullplot: String,
    val poster: String?,
    val rated: String,
    val genres: List<String>,
    val runtime: String,
    val cast: List<String>,
    val languages: List<String>,
    val directors: List<String>,
    val countries: List<String>,
    val released: Instant?,
    val imdbRating: Double?,
    val imdbVotes: Long?,
    val rottenRating: Double?,
)

fun MovieDto.toModel() = Movie(
    id = _id,
    title = title.ifBlank { "Untitled" },
    year = year.asDisplayString() ?: "",
    plot = plot ?: "",
    fullplot = fullplot ?: "",
    poster = poster?.takeIf { it.isNotBlank() },
    rated = rated ?: "Not rated",
    genres = genres,
    runtime = runtime.asLong()?.let { "$it minutes" } ?: "",
    cast = cast,
    languages = languages,
    directors = directors,
    countries = countries,
    released = released.asInstant(),
    imdbRating = imdb?.rating.asDouble(),
    imdbVotes = imdb?.votes.asLong(),
    rottenRating = tomatoes?.viewer?.rating.asDouble(),
)

// ---------- Comments ----------

@Serializable
data class CommentDto(
    val _id: String,
    val movie_id: String = "",
    val name: String = "Anonymous",
    val text: String = "",
    val date: JsonElement? = null,
)

data class Comment(
    val id: String,
    val movieId: String,
    val name: String,
    val text: String,
    val date: Instant?,
)

fun CommentDto.toModel() = Comment(
    id = _id,
    movieId = movie_id,
    name = name,
    text = text,
    date = date.asInstant(),
)

// ---------- system:data_sync_info ----------

@Serializable
data class SyncStatusDocumentsDto(
    val sync_session_status: String? = null,
    val synced_up_to_local_commit_id: JsonElement? = null,
    val last_update_received_time: JsonElement? = null,
)

@Serializable
data class SyncStatusDto(
    val _id: String,
    val is_ditto_server: Boolean = false,
    val documents: SyncStatusDocumentsDto? = null,
)

data class SyncStatusInfo(
    val id: String,
    val peerType: String,
    val status: String,
    val syncedUpToLocalCommitId: Long?,
    val lastUpdateReceived: Instant?,
)

fun SyncStatusDto.toModel() = SyncStatusInfo(
    id = _id,
    peerType = if (is_ditto_server) "Cloud Server" else "Peer Device",
    status = documents?.sync_session_status ?: "Unknown",
    syncedUpToLocalCommitId = documents?.synced_up_to_local_commit_id.asLong(),
    lastUpdateReceived = documents?.last_update_received_time.asInstant(),
)

// ---------- system:indexes ----------

@Serializable
data class IndexDto(
    val _id: String,
    val collection: String = "",
    val fields: List<String> = emptyList(),
)

data class IndexInfo(val id: String, val collection: String, val fields: List<String>)

fun IndexDto.toModel() = IndexInfo(_id, collection, fields)
