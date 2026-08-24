package live.ditto.mflix.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider

/**
 * App theme using Ditto's Anvil color tokens, following the system
 * light/dark setting.
 */
@Composable
fun DittoMoviesTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(
        LocalStatusColors provides if (darkTheme) StatusColorsDark else StatusColorsLight,
    ) {
        MaterialTheme(
            colorScheme = if (darkTheme) DittoDarkColorScheme else DittoLightColorScheme,
            typography = DittoTypography,
            content = content,
        )
    }
}
