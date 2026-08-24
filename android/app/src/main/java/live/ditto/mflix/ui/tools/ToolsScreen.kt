package live.ditto.mflix.ui.tools

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import live.ditto.mflix.MFlixApplication
import live.ditto.mflix.ui.components.LoadingView
import com.ditto.tools.toolsviewer.DittoToolsViewer

/**
 * Wraps the official Ditto diagnostic tools (peers list, presence viewer,
 * data browser, disk usage, log viewer, health, ...) — the same toolkit
 * PowerSync-style samples ship on other platforms.
 */
@Composable
fun ToolsScreen() {
    val app = LocalContext.current.applicationContext as MFlixApplication
    val ditto by app.repository.ditto.collectAsStateWithLifecycle()

    val instance = ditto ?: run {
        LoadingView("Waiting for Ditto...")
        return
    }
    DittoToolsViewer(ditto = instance, modifier = Modifier.fillMaxSize())
}
