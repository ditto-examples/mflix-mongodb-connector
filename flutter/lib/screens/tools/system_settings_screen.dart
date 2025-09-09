import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class SystemSettingsScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const SystemSettingsScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Settings'),
      ),
      body: dittoProvider.ditto != null
          ? SystemSettingsView(ditto: dittoProvider.ditto!)
          : const Center(child: CircularProgressIndicator()),
    );
  }
}