package live.ditto.mflix.ui.theme

import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

/**
 * Material 3 color schemes built from Ditto's Anvil design tokens
 * (`anvil/android/anvil-cmp/DittoColorScheme.kt`).
 *
 * Ditto's brand color is "citrus" (chartreuse) with the signature
 * black-on-citrus primary. Violet is the promo/tertiary accent and red is
 * the critical/error color.
 */

// ---- Anvil palette values (light tier) ----
private val Citrus400 = Color(0xFFECF238)
private val Citrus800 = Color(0xFF6C7000)

private val Neutral50 = Color(0xFFFAFAFA)
private val Neutral100 = Color(0xFFF5F5F5)
private val Neutral200 = Color(0xFFE5E5E5)
private val Neutral300 = Color(0xFFD4D4D4)
private val Neutral500 = Color(0xFF737373)
private val Neutral900 = Color(0xFF171717)
private val Neutral950 = Color(0xFF0A0A0A)

private val Violet500 = Color(0xFF8E51FF)
private val Violet100 = Color(0xFFEDE9FE)
private val Violet900 = Color(0xFF4D179A)

private val Red200 = Color(0xFFFFE2E2)
private val Red600 = Color(0xFFE7000B)
private val Red900 = Color(0xFF82181A)

// ---- Anvil dark tier values ----
private val DarkCitrus600 = Color(0xFFE7EE00)
private val DarkCitrus50 = Color(0xFFFCFCDD)
private val DarkCitrus800 = Color(0xFFF3F78F)
private val DarkViolet500 = Color(0xFFA684FF)
private val DarkViolet900 = Color(0xFF2F0D68)
private val DarkRed50 = Color(0xFF450A0A)
private val DarkRed600 = Color(0xFFFF6467)
private val DarkRed900 = Color(0xFFFB2C36)

val DittoLightColorScheme = lightColorScheme(
    primary = Citrus800,
    onPrimary = Color.Black,
    primaryContainer = Citrus400,
    onPrimaryContainer = Neutral950,
    secondary = Neutral950,
    onSecondary = Color.White,
    secondaryContainer = Neutral200,
    onSecondaryContainer = Neutral950,
    tertiary = Violet500,
    onTertiary = Color.White,
    tertiaryContainer = Violet100,
    onTertiaryContainer = Violet900,
    error = Red600,
    onError = Color.White,
    errorContainer = Red200,
    onErrorContainer = Red900,
    background = Neutral50,
    onBackground = Neutral950,
    surface = Color.White,
    onSurface = Neutral950,
    surfaceVariant = Neutral200,
    onSurfaceVariant = Neutral500,
    surfaceTint = Citrus800,
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Neutral100,
    surfaceContainer = Neutral100,
    surfaceContainerHigh = Neutral200,
    surfaceContainerHighest = Neutral200,
    surfaceDim = Neutral200,
    surfaceBright = Color.White,
    inverseSurface = Neutral950,
    inverseOnSurface = Color.White,
    inversePrimary = Citrus400,
    outline = Neutral500,
    outlineVariant = Neutral300,
    scrim = Color.Black,
)

val DittoDarkColorScheme = darkColorScheme(
    primary = Citrus400,
    onPrimary = Color.Black,
    primaryContainer = Neutral950,
    onPrimaryContainer = DarkCitrus600,
    secondary = Neutral50,
    onSecondary = Color.Black,
    secondaryContainer = Color(0xFF404040),
    onSecondaryContainer = Neutral50,
    tertiary = DarkViolet500,
    onTertiary = Color.Black,
    tertiaryContainer = DarkViolet900,
    onTertiaryContainer = Violet500,
    error = DarkRed600,
    onError = Color.Black,
    errorContainer = DarkRed50,
    onErrorContainer = DarkRed900,
    background = Neutral900,
    onBackground = Neutral50,
    surface = Color(0xFF262626),
    onSurface = Neutral50,
    surfaceVariant = Color(0xFF404040),
    onSurfaceVariant = Neutral300,
    surfaceTint = Citrus400,
    surfaceContainerLowest = Neutral950,
    surfaceContainerLow = Neutral900,
    surfaceContainer = Color(0xFF262626),
    surfaceContainerHigh = Color(0xFF404040),
    surfaceContainerHighest = Color(0xFF525252),
    surfaceDim = Neutral950,
    surfaceBright = Color(0xFF404040),
    inverseSurface = Neutral50,
    inverseOnSurface = Color.Black,
    inversePrimary = DarkCitrus800,
    outline = Neutral500,
    outlineVariant = Color(0xFF404040),
    scrim = Color.Black,
)

/** Brand citrus accent used for prominent fills (black content). */
val DittoCitrus = Color(0xFFD0D600)
