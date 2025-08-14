import 'package:flutter/material.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/models/sync_status.dart';
import 'package:intl/intl.dart';

class SyncStatusView extends StatelessWidget {
  final DittoProvider dittoProvider;

  const SyncStatusView({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder(
      stream: dittoProvider.syncStatusStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading sync status...'),
              ],
            ),
          );
        }

        final result = snapshot.data!;
        if (result.items.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Loading sync status...'),
              ],
            ),
          );
        }

        final syncStatuses = result.items
            .map((item) => SyncStatus.fromJson(item.value))
            .toList();

        final connectedPeers = syncStatuses
            .where((status) => status.isConnected)
            .toList();

        final notConnectedPeers = syncStatuses
            .where((status) => !status.isConnected)
            .toList();

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (connectedPeers.isNotEmpty) ...[
              _buildSectionHeader('Connected Peers', context),
              Text(
                'Last updated: ${_formatLastUpdate(connectedPeers.first.lastUpdateReceivedTime)}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 16),
              ...connectedPeers.map((peer) => _buildPeerCard(peer, context)),
            ],
            if (notConnectedPeers.isNotEmpty) ...[
              if (connectedPeers.isNotEmpty) const SizedBox(height: 24),
              _buildSectionHeader('Not Connected', context),
              const SizedBox(height: 16),
              ...notConnectedPeers.map((peer) => _buildPeerCard(peer, context)),
            ],
          ],
        );
      },
    );
  }

  Widget _buildSectionHeader(String title, BuildContext context) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleLarge?.copyWith(
        fontWeight: FontWeight.bold,
      ),
    );
  }

  Widget _buildPeerCard(SyncStatus syncStatus, BuildContext context) {

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: Theme.of(context).brightness == Brightness.dark
          ? Colors.grey[900]
          : Colors.grey[100],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        syncStatus.peerType,
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        syncStatus.id,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: Colors.grey,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                Row(
                  children: [
                    Icon(
                      Icons.circle,
                      size: 10,
                      color: syncStatus.isConnected ? Colors.green : Colors.grey,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      syncStatus.isConnected ? 'Connected' : 'Not Connected',
                      style: TextStyle(
                        color: syncStatus.isConnected ? Colors.green : Colors.grey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            if (syncStatus.hasSyncedCommit) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Icon(
                    Icons.check_circle,
                    size: 16,
                    color: Colors.green,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Synced to local database commit: ${syncStatus.syncedUpToLocalCommitId}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
            ],
            if (syncStatus.hasLastUpdateTime) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.access_time,
                    size: 16,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.blue[300]
                        : Colors.blue[700],
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Last update: ${_formatTimestamp(syncStatus.lastUpdateReceivedTime!)}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatTimestamp(int timestamp) {
    // timestamp is already in milliseconds according to Ditto documentation
    final date = DateTime.fromMillisecondsSinceEpoch(timestamp);
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final dateToCheck = DateTime(date.year, date.month, date.day);
    
    if (dateToCheck == today) {
      return 'Today, ${DateFormat.jm().format(date)}';
    } else if (dateToCheck == today.subtract(const Duration(days: 1))) {
      return 'Yesterday, ${DateFormat.jm().format(date)}';
    } else {
      return DateFormat('MMM d, y h:mm a').format(date);
    }
  }

  String _formatLastUpdate(int? timestamp) {
    if (timestamp == null) return 'Unknown';
    return _formatTimestamp(timestamp);
  }
}