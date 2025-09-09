import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class PermissionsHealthScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const PermissionsHealthScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Permissions Health'),
      ),
      body: dittoProvider.ditto != null
          ? PermissionsHealthView()
          : const Center(child: CircularProgressIndicator()),
    );
  }
}