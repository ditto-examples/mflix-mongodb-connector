package live.ditto.mflix.ui.components

import java.time.Duration
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale

private val dateFormatter: DateTimeFormatter =
    DateTimeFormatter.ofLocalizedDate(FormatStyle.LONG).withZone(ZoneId.systemDefault())

private val timeFormatter: DateTimeFormatter =
    DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT).withZone(ZoneId.systemDefault())

/** "Just now", "5 minutes ago", "3 hours ago", "2 days ago", then a long date. */
fun relativeTime(instant: Instant?): String {
    if (instant == null || instant.toEpochMilli() <= 0) return "Never"
    val age = Duration.between(instant, Instant.now())
    return when {
        age.isNegative || age.toMinutes() < 1 -> "Just now"
        age.toHours() < 1 -> "${age.toMinutes()} ${if (age.toMinutes() == 1L) "minute" else "minutes"} ago"
        age.toDays() < 1 -> "${age.toHours()} ${if (age.toHours() == 1L) "hour" else "hours"} ago"
        age.toDays() < 7 -> "${age.toDays()} ${if (age.toDays() == 1L) "day" else "days"} ago"
        else -> dateFormatter.format(instant)
    }
}

fun longDate(instant: Instant?): String =
    instant?.let { dateFormatter.format(it) } ?: "Unknown"

fun shortTime(instant: Instant?): String =
    instant?.let { timeFormatter.format(it) } ?: "Unknown"

fun formatRating(value: Double?): String =
    value?.let { String.format(Locale.US, "%.1f", it) } ?: ""
