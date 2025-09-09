import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class SyncStatusScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const SyncStatusScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sync Status'),
      ),
      body: dittoProvider.ditto != null
          ? SyncStatusView(
              ditto: dittoProvider.ditto!,
              subscriptions: [
                if (dittoProvider.moviesSubscription != null)
                  dittoProvider.moviesSubscription!,
                if (dittoProvider.commentsSubscription != null)
                  dittoProvider.commentsSubscription!,
              ],
            )
          : const Center(child: CircularProgressIndicator()),
    );
  }
}