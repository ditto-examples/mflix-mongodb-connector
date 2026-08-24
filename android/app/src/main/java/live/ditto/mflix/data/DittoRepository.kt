package live.ditto.mflix.data

import android.util.Log
import com.ditto.kotlin.Ditto
import com.ditto.kotlin.DittoAuthenticationProvider
import com.ditto.kotlin.DittoConfig
import com.ditto.kotlin.DittoFactory
import com.ditto.kotlin.DittoLogLevel
import com.ditto.kotlin.DittoLogger
import com.ditto.kotlin.DittoSyncSubscription
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import live.ditto.mflix.BuildConfig
import java.util.UUID

/**
 * Single entry point for all Ditto access, mirroring `DittoService` in the
 * Swift sample and `DittoProvider` in the Flutter sample.
 *
 * Authentication uses the development token from the root `.env` file with
 * the Ditto Big Peer (DITTO_SERVER_URL). The highlight of the sample is that
 * the kid-friendly filter (`rated = 'G' OR rated = 'PG'`) is enforced by the
 * **sync subscriptions**, not by the UI.
 */
@OptIn(ExperimentalCoroutinesApi::class)
class DittoRepository(private val applicationScope: CoroutineScope) {

    companion object {
        private const val TAG = "DittoRepository"
        val REQUIRED_CONFIG_KEYS = listOf(
            "DITTO_DATABASE_ID",
            "DITTO_DEVELOPMENT_TOKEN",
            "DITTO_SERVER_URL",
        )
    }

    private val _ditto = kotlinx.coroutines.flow.MutableStateFlow<Ditto?>(null)
    val ditto: kotlinx.coroutines.flow.StateFlow<Ditto?> = _ditto

    /** Non-null when initialization failed (invalid credentials, network, ...). */
    val initError = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)

    @Volatile
    private var initStarted = false
    private val subscriptions = mutableListOf<DittoSyncSubscription>()

    val missingConfigKeys: List<String>
        get() = buildList {
            if (BuildConfig.DITTO_DATABASE_ID.isBlank()) add("DITTO_DATABASE_ID")
            if (BuildConfig.DITTO_DEVELOPMENT_TOKEN.isBlank()) add("DITTO_DEVELOPMENT_TOKEN")
            if (BuildConfig.DITTO_SERVER_URL.isBlank()) add("DITTO_SERVER_URL")
        }

    /** Idempotent: safe to call again after process death recreation. */
    fun initialize() {
        synchronized(this) {
            if (initStarted) return
            initStarted = true
        }
        val missing = missingConfigKeys
        if (missing.isNotEmpty()) return

        applicationScope.launch {
            runCatching {
                DittoLogger.isEnabled = true
                DittoLogger.minimumLogLevel = DittoLogLevel.Debug

                val ditto = DittoFactory.create(
                    DittoConfig(
                        databaseId = BuildConfig.DITTO_DATABASE_ID,
                        connect = DittoConfig.Connect.Server(url = BuildConfig.DITTO_SERVER_URL),
                    )
                )

                ditto.auth?.let { auth ->
                    auth.expirationHandler = { instance, _ ->
                        instance.auth?.login(
                            token = BuildConfig.DITTO_DEVELOPMENT_TOKEN,
                            provider = DittoAuthenticationProvider.development(),
                        )
                    }
                }

                createIndexes(ditto)

                subscriptions += ditto.sync.registerSubscription(
                    "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'"
                )
                subscriptions += ditto.sync.registerSubscription("SELECT * FROM comments")

                ditto.sync.start()
                _ditto.value = ditto
            }.onFailure {
                Log.e(TAG, "Failed to initialize Ditto", it)
                initError.value = it.message ?: it::class.simpleName ?: "Unknown Ditto error"
            }
        }
    }

    private suspend fun createIndexes(ditto: Ditto) = runCatching {
        ditto.store.execute("CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title)")
        ditto.store.execute("CREATE INDEX IF NOT EXISTS movies_year_idx ON movies(year)")
        ditto.store.execute("CREATE INDEX IF NOT EXISTS comments_movie_id_idx ON comments(movie_id)")
    }.onFailure { Log.w(TAG, "Index creation failed (non-fatal)", it) }

    private val ready: Flow<Ditto> = _ditto.filterNotNull()

    // ---------- Movies ----------

    private val moviesListQuery =
        "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, " +
            "tomatoes.viewer.rating as rottenRating FROM movies " +
            "WHERE rated = 'G' OR rated = 'PG' ORDER BY year DESC"

    private val moviesSearchQuery =
        "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, " +
            "tomatoes.viewer.rating as rottenRating FROM movies " +
            "WHERE title LIKE :searchTerm AND (rated = 'G' OR rated = 'PG') ORDER BY year DESC"

    fun observeMovies(): Flow<List<MovieListing>> = ready.flatMapLatest { ditto ->
        ditto.store.observe(moviesListQuery, null as Map<String, Any?>?) { result ->
            result.items.mapNotNull { item ->
                runCatching { DittoJson.decodeFromString<MovieListingDto>(item.jsonString()).toModel() }
                    .getOrNull()
            }
        }
    }.flowOn(Dispatchers.Default)

    suspend fun searchMovies(term: String): List<MovieListing> {
        val ditto = _ditto.value ?: return emptyList()
        return withContext(Dispatchers.Default) {
            ditto.store.execute(moviesSearchQuery, mapOf("searchTerm" to "%$term%")) { result ->
                result.items.mapNotNull { item ->
                    runCatching { DittoJson.decodeFromString<MovieListingDto>(item.jsonString()).toModel() }
                        .getOrNull()
                }
            }
        }
    }

    fun observeMovie(movieId: String): Flow<Movie?> = ready.flatMapLatest { ditto ->
        ditto.store.observe(
            "SELECT * FROM movies WHERE _id = :movieId",
            mapOf("movieId" to movieId),
        ) { result ->
            result.items.firstOrNull()?.let { item ->
                runCatching { DittoJson.decodeFromString<MovieDto>(item.jsonString()).toModel() }
                    .getOrNull()
            }
        }
    }.flowOn(Dispatchers.Default)

    suspend fun addMovie(
        title: String,
        year: Int,
        plot: String,
        fullplot: String,
        poster: String,
        countries: List<String>,
    ) {
        val ditto = _ditto.value ?: error("Ditto is not initialized")
        val doc = mapOf(
            "_id" to UUID.randomUUID().toString(),
            "title" to title,
            "year" to year,
            "plot" to plot,
            "fullplot" to fullplot.ifBlank { plot },
            "poster" to poster,
            "countries" to countries.ifEmpty { listOf("Unknown") },
            "rated" to "G", // keeps new movies kid-friendly so the subscription syncs them
            "genres" to listOf("Family"),
            "runtime" to 0,
            "languages" to listOf("English"),
            "cast" to emptyList<String>(),
            "directors" to emptyList<String>(),
            "released" to java.time.Instant.now().toString(),
        )
        withContext(Dispatchers.Default) {
            ditto.store.execute("INSERT INTO movies DOCUMENTS (:newMovie)", mapOf("newMovie" to doc))
        }
    }

    data class UpdateOutcome(val commitId: ULong?, val mutatedDocumentCount: Int)

    /** Partial update of whitelisted fields, like the Swift/Flutter samples. */
    suspend fun updateMovie(movieId: String, changed: Map<String, Any?>): UpdateOutcome {
        require(changed.isNotEmpty()) { "Nothing to update" }
        val ditto = _ditto.value ?: error("Ditto is not initialized")
        val setClause = changed.keys.joinToString(", ") { "$it = :$it" }
        val args = changed + ("movieId" to movieId)
        return withContext(Dispatchers.Default) {
            ditto.store.execute("UPDATE movies SET $setClause WHERE _id = :movieId", args) { result ->
                UpdateOutcome(result.commitId, result.mutatedDocumentIds().size)
            }
        }
    }

    // ---------- Comments ----------

    fun observeComments(movieId: String): Flow<List<Comment>> = ready.flatMapLatest { ditto ->
        ditto.store.observe(
            "SELECT * FROM comments WHERE movie_id = :movieId ORDER BY date DESC",
            mapOf("movieId" to movieId),
        ) { result ->
            result.items.mapNotNull { item ->
                runCatching { DittoJson.decodeFromString<CommentDto>(item.jsonString()).toModel() }
                    .getOrNull()
            }.sortedByDescending { it.date ?: java.time.Instant.EPOCH }
        }
    }.flowOn(Dispatchers.Default)

    suspend fun addComment(movieId: String, text: String) {
        val ditto = _ditto.value ?: error("Ditto is not initialized")
        val doc = mapOf(
            "_id" to UUID.randomUUID().toString(),
            "movie_id" to movieId,
            "name" to "Anonymous",
            "email" to "anonymous@mflix.com",
            "text" to text,
            "date" to java.time.Instant.now().toString(),
        )
        withContext(Dispatchers.Default) {
            ditto.store.execute("INSERT INTO comments DOCUMENTS (:newComment)", mapOf("newComment" to doc))
        }
    }

    // ---------- System ----------

    fun observeSyncStatus(): Flow<List<SyncStatusInfo>> = ready.flatMapLatest { ditto ->
        ditto.store.observe(
            "SELECT * FROM system:data_sync_info " +
                "ORDER BY documents.sync_session_status, documents.last_update_received_time desc",
            null as Map<String, Any?>?,
        ) { result ->
            result.items.mapNotNull { item ->
                runCatching { DittoJson.decodeFromString<SyncStatusDto>(item.jsonString()).toModel() }
                    .getOrNull()
            }.sortedWith(
                compareBy<SyncStatusInfo> { it.status != "Connected" }
                    .thenByDescending { it.lastUpdateReceived ?: java.time.Instant.EPOCH }
            )
        }
    }.flowOn(Dispatchers.Default)

    fun observeIndexes(): Flow<List<IndexInfo>> = ready.flatMapLatest { ditto ->
        ditto.store.observe("SELECT * FROM system:indexes", null as Map<String, Any?>?) { result ->
            result.items.mapNotNull { item ->
                runCatching { DittoJson.decodeFromString<IndexDto>(item.jsonString()).toModel() }
                    .getOrNull()
            }
        }
    }.flowOn(Dispatchers.Default)
}
