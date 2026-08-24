package live.ditto.mflix.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import live.ditto.mflix.R

/** Anvil's UI font is Inter; IBM Plex Mono is used for code/identifiers. */
val InterFontFamily = FontFamily(
    Font(R.font.inter_regular, FontWeight.Normal),
    Font(R.font.inter_medium, FontWeight.Medium),
    Font(R.font.inter_semibold, FontWeight.SemiBold),
    Font(R.font.inter_bold, FontWeight.Bold),
)

val PlexMonoFontFamily = FontFamily(
    Font(R.font.ibm_plex_mono_regular, FontWeight.Normal),
    Font(R.font.ibm_plex_mono_bold, FontWeight.Bold),
)

private val baseline = Typography()

val DittoTypography = Typography(
    displayLarge = baseline.displayLarge.copy(fontFamily = InterFontFamily),
    displayMedium = baseline.displayMedium.copy(fontFamily = InterFontFamily),
    displaySmall = baseline.displaySmall.copy(fontFamily = InterFontFamily),
    headlineLarge = baseline.headlineLarge.copy(fontFamily = InterFontFamily),
    headlineMedium = baseline.headlineMedium.copy(fontFamily = InterFontFamily),
    headlineSmall = baseline.headlineSmall.copy(fontFamily = InterFontFamily),
    titleLarge = baseline.titleLarge.copy(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.SemiBold,
    ),
    titleMedium = baseline.titleMedium.copy(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.SemiBold,
    ),
    titleSmall = baseline.titleSmall.copy(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Medium,
    ),
    bodyLarge = baseline.bodyLarge.copy(fontFamily = InterFontFamily),
    bodyMedium = baseline.bodyMedium.copy(fontFamily = InterFontFamily),
    bodySmall = baseline.bodySmall.copy(fontFamily = InterFontFamily),
    labelLarge = baseline.labelLarge.copy(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Medium,
    ),
    labelMedium = baseline.labelMedium.copy(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Medium,
    ),
    labelSmall = baseline.labelSmall.copy(
        fontFamily = InterFontFamily,
        fontWeight = FontWeight.Medium,
    ),
)
