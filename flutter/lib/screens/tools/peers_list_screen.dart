import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class PeersListScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const PeersListScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Peers List'),
      ),
      body: dittoProvider.ditto != null
          ? PeerListView(ditto: dittoProvider.ditto!)
          : const Center(child: CircularProgressIndicator()),
    );
  }
}