import 'package:flutter/material.dart';
import 'package:ditto_flutter_tools/ditto_flutter_tools.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class QueryEditorScreen extends StatelessWidget {
  final DittoProvider dittoProvider;

  const QueryEditorScreen({super.key, required this.dittoProvider});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Query Editor'),
      ),
      body: dittoProvider.ditto != null
          ? QueryEditorView(ditto: dittoProvider.ditto!)
          : const Center(child: CircularProgressIndicator()),
    );
  }
}
