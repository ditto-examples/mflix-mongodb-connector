package live.ditto.mflix.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Status colors for sync/connectivity, matching the other sample apps
 * (green = connected, orange = connecting, red = disconnected, gray = unknown)
 * using Anvil's emerald/orange/red ramps for light and dark tiers.
 */
@Immutable
data class StatusColors(
    val connected: Color,
    val connecting: Color,
    val disconnected: Color,
    val unknown: Color,
)

val StatusColorsLight = StatusColors(
    connected = Color(0xFF009966),      // emerald-600
    connecting = Color(0xFFF54900),     // orange-600
    disconnected = Color(0xFFE7000B),   // red-600
    unknown = Color(0xFF737373),        // neutral-500
)

val StatusColorsDark = StatusColors(
    connected = Color(0xFF00D492),      // dark emerald-600
    connecting = Color(0xFFFF8904),     // dark orange-600
    disconnected = Color(0xFFFF6467),   // dark red-600
    unknown = Color(0xFF737373),        // neutral-500
)

val LocalStatusColors = staticCompositionLocalOf { StatusColorsLight }

val statusColors: StatusColors
    @Composable get() = if (isSystemInDarkTheme()) StatusColorsDark else StatusColorsLight
