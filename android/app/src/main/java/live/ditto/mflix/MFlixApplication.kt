package live.ditto.mflix

import android.app.Application
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import live.ditto.mflix.data.DittoRepository

class MFlixApplication : Application() {

    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    /** Ditto must outlive any Activity, so the singleton lives here. */
    lateinit var repository: DittoRepository
        private set

    override fun onCreate() {
        super.onCreate()
        repository = DittoRepository(applicationScope)
        repository.initialize()
    }
}
