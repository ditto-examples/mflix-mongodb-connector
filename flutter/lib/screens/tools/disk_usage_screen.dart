import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class DiskUsageScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const DiskUsageScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Disk Usage'),
      ),
      body: dittoProvider.ditto != null
          ? DiskUsageView(ditto: dittoProvider.ditto!)
          : const Center(child: CircularProgressIndicator()),
    );
  }
}
