import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class PeersSyncStatusScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const PeersSyncStatusScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Peers Sync Status'),
      ),
      body: dittoProvider.ditto != null
          ? PeerSyncStatusView(ditto: dittoProvider.ditto!)
          : const Center(child: CircularProgressIndicator()),
    );
  }
}
