package live.ditto.mflix.ui.system

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import androidx.lifecycle.viewModelScope
import live.ditto.mflix.data.DittoRepository

class SystemViewModel(repository: DittoRepository) : ViewModel() {

    val syncStatus = repository.observeSyncStatus()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    val indexes = repository.observeIndexes()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
}
