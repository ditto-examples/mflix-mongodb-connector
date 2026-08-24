package live.ditto.mflix.ui.movies

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import java.time.Year

/** Form used by the add-movie bottom sheet, mirroring the Swift/Flutter fields. */
@Composable
fun AddMovieForm(
    onSave: (title: String, year: Int, plot: String, fullplot: String, poster: String, countries: List<String>) -> Unit,
    onCancel: () -> Unit,
) {
    var title by rememberSaveable { mutableStateOf("") }
    var year by rememberSaveable { mutableStateOf("") }
    var plot by rememberSaveable { mutableStateOf("") }
    var fullplot by rememberSaveable { mutableStateOf("") }
    var poster by rememberSaveable { mutableStateOf("") }
    var countries by rememberSaveable { mutableStateOf("") }

    val yearInt = year.toIntOrNull()
    val yearValid = yearInt != null && yearInt in 1900..(Year.now().value + 5)
    val formValid = title.isNotBlank() && plot.isNotBlank() && yearValid

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp)
            .padding(bottom = 24.dp)
            .imePadding(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Add Movie", style = MaterialTheme.typography.titleLarge)

        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("Title *") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = year,
            onValueChange = { year = it.filter(Char::isDigit).take(4) },
            label = { Text("Year *") },
            isError = year.isNotBlank() && !yearValid,
            supportingText = {
                if (year.isNotBlank() && !yearValid) Text("Enter a valid year")
            },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = plot,
            onValueChange = { plot = it },
            label = { Text("Plot *") },
            minLines = 3,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = fullplot,
            onValueChange = { fullplot = it },
            label = { Text("Full Plot") },
            minLines = 4,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = poster,
            onValueChange = { poster = it },
            label = { Text("Poster URL") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = countries,
            onValueChange = { countries = it },
            label = { Text("Countries (comma-separated)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )

        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            TextButton(onClick = onCancel, modifier = Modifier.weight(1f)) {
                Text("Cancel")
            }
            Button(
                onClick = {
                    onSave(
                        title.trim(),
                        year.toInt(),
                        plot.trim(),
                        fullplot.trim(),
                        poster.trim(),
                        countries.split(",").map { it.trim() }.filter { it.isNotEmpty() },
                    )
                },
                enabled = formValid,
                modifier = Modifier.weight(1f),
            ) {
                Text("Save")
            }
        }
    }
}
