package live.ditto.mflix

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.ditto.kotlin.transports.DittoSyncPermissions
import live.ditto.mflix.ui.AppRoot
import live.ditto.mflix.ui.theme.DittoMoviesTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            DittoMoviesTheme {
                RequestDittoPermissions()
                AppRoot()
            }
        }
    }
}

/**
 * Requests the Bluetooth/Wi-Fi runtime permissions the Ditto SDK needs for
 * peer-to-peer transports (declared by the SDK manifest via manifest merger).
 */
@Composable
private fun RequestDittoPermissions() {
    val context = LocalContext.current
    val ditto by (context.applicationContext as MFlixApplication)
        .repository.ditto.collectAsStateWithLifecycle()

    val launcher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) {
        ditto?.refreshPermissions()
    }

    LaunchedEffect(Unit) {
        val missing = DittoSyncPermissions(context).missingPermissions()
        if (missing.isNotEmpty()) {
            launcher.launch(missing)
        }
    }
}
