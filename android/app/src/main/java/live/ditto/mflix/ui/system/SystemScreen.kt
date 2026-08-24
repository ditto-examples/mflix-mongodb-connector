package live.ditto.mflix.ui.system

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.outlined.Dns
import androidx.compose.material.icons.outlined.Sync
import androidx.compose.material.icons.outlined.Tag
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import live.ditto.mflix.MFlixApplication
import live.ditto.mflix.data.IndexInfo
import live.ditto.mflix.data.SyncStatusInfo
import live.ditto.mflix.ui.components.EmptyStateView
import live.ditto.mflix.ui.components.LoadingView
import live.ditto.mflix.ui.components.relativeTime
import live.ditto.mflix.ui.theme.LocalStatusColors
import live.ditto.mflix.ui.theme.PlexMonoFontFamily

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SystemScreen() {
    val app = LocalContext.current.applicationContext as MFlixApplication
    val viewModel: SystemViewModel = viewModel(key = "system") {
        SystemViewModel(app.repository)
    }

    val syncStatus by viewModel.syncStatus.collectAsStateWithLifecycle()
    val indexes by viewModel.indexes.collectAsStateWithLifecycle()

    var tab by rememberSaveable { mutableStateOf(0) }

    Scaffold(
        topBar = { TopAppBar(title = { Text("System") }) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            SingleChoiceSegmentedButtonRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
            ) {
                SegmentedButton(
                    selected = tab == 0,
                    onClick = { tab = 0 },
                    shape = SegmentedButtonDefaults.itemShape(index = 0, count = 2),
                ) { Text("Sync Status") }
                SegmentedButton(
                    selected = tab == 1,
                    onClick = { tab = 1 },
                    shape = SegmentedButtonDefaults.itemShape(index = 1, count = 2),
                ) { Text("Indexes") }
            }

            when (tab) {
                0 -> SyncStatusList(syncStatus)
                else -> IndexesList(indexes)
            }
        }
    }
}

@Composable
private fun SyncStatusList(statuses: List<SyncStatusInfo>?) {
    when {
        statuses == null -> LoadingView("Checking sync status...")
        statuses.isEmpty() -> EmptyStateView(
            icon = Icons.Outlined.Sync,
            title = "No connected peers",
            subtitle = "Peers appear here once the device syncs with the Ditto " +
                "Big Peer or other devices nearby.",
        )
        else -> LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize(),
        ) {
            items(statuses, key = { it.id }) { status -> SyncStatusRow(status) }
        }
    }
}

@Composable
private fun SyncStatusRow(status: SyncStatusInfo) {
    val statusColors = LocalStatusColors.current
    val statusColor = when (status.status.lowercase()) {
        "connected" -> statusColors.connected
        "connecting" -> statusColors.connecting
        "disconnected", "not connected" -> statusColors.disconnected
        else -> statusColors.unknown
    }

    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                status.peerType,
                style = MaterialTheme.typography.titleMedium,
            )
            Text(
                status.id,
                style = MaterialTheme.typography.bodySmall.copy(fontFamily = PlexMonoFontFamily),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                androidx.compose.foundation.Canvas(modifier = Modifier.size(12.dp)) {
                    drawCircle(color = statusColor)
                }
                Spacer(Modifier.width(8.dp))
                Text(status.status, style = MaterialTheme.typography.bodyMedium, color = statusColor)
            }
            status.syncedUpToLocalCommitId?.let { commit ->
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 4.dp),
                ) {
                    Icon(
                        Icons.Filled.CheckCircle,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = statusColors.connected,
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        "Synced to local database commit: $commit",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(top = 4.dp),
            ) {
                Icon(
                    Icons.Filled.DateRange,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    "Last update: ${relativeTime(status.lastUpdateReceived)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun IndexesList(indexes: List<IndexInfo>?) {
    when {
        indexes == null -> LoadingView("Loading indexes...")
        indexes.isEmpty() -> EmptyStateView(
            icon = Icons.Outlined.Dns,
            title = "No indexes",
            subtitle = "Database indexes will appear here after the first sync.",
        )
        else -> LazyColumn(
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize(),
        ) {
            items(indexes, key = { it.id }) { index ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(index.id, style = MaterialTheme.typography.titleSmall)
                        Text(
                            "Collection: ${index.collection}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        if (index.fields.isNotEmpty()) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(top = 4.dp),
                            ) {
                                Icon(
                                    Icons.Outlined.Tag,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp),
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                                Spacer(Modifier.width(4.dp))
                                Text(
                                    "Fields: ${index.fields.joinToString()}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
