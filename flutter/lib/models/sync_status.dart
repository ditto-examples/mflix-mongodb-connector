class SyncStatus {
  final String id;
  final bool isDittoServer;
  final String syncSessionStatus;
  final int? syncedUpToLocalCommitId;
  final int? lastUpdateReceivedTime;

  SyncStatus({
    required this.id,
    required this.isDittoServer,
    required this.syncSessionStatus,
    this.syncedUpToLocalCommitId,
    this.lastUpdateReceivedTime,
  });

  factory SyncStatus.fromJson(Map<String, dynamic> json) {
    final documents = json['documents'] as Map<String, dynamic>? ?? {};
    
    return SyncStatus(
      id: json['_id'] ?? '',
      isDittoServer: json['is_ditto_server'] ?? false,
      syncSessionStatus: documents['sync_session_status'] ?? '',
      syncedUpToLocalCommitId: (documents['synced_up_to_local_commit_id'] as num?)?.toInt(),
      lastUpdateReceivedTime: (documents['last_update_received_time'] as num?)?.toInt(),
    );
  }

  bool get isConnected => syncSessionStatus == 'Connected';
  
  String get peerType => isDittoServer ? 'Cloud Server' : 'Peer Device';
  
  bool get hasSyncedCommit => syncedUpToLocalCommitId != null;
  
  bool get hasLastUpdateTime => lastUpdateReceivedTime != null;
}