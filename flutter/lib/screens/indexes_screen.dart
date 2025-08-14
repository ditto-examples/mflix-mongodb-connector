import 'package:flutter/material.dart';
import 'package:mflix_app/models/index.dart';
import 'package:mflix_app/providers/ditto_provider.dart';

class IndexesScreen extends StatefulWidget {
  final DittoProvider dittoProvider;

  const IndexesScreen({super.key, required this.dittoProvider});

  @override
  State<IndexesScreen> createState() => _IndexesScreenState();
}

class _IndexesScreenState extends State<IndexesScreen> {
  List<Index> _indexes = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadIndexes();
  }

  Future<void> _loadIndexes() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final ditto = widget.dittoProvider.ditto;
      if (ditto == null) {
        throw Exception('Ditto not initialized');
      }

      final result = await ditto.store.execute('SELECT * FROM system:indexes');
      final indexes = result.items
          .map((item) => Index.fromJson(item.value))
          .toList();

      setState(() {
        _indexes = indexes;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Local Database Indexes',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                  color: Colors.grey,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.refresh),
                onPressed: _loadIndexes,
                tooltip: 'Refresh indexes',
              ),
            ],
          ),
        ),
        Expanded(
          child: _buildContent(),
        ),
      ],
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Theme.of(context).colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading indexes',
              style: TextStyle(
                fontSize: 18,
                color: Theme.of(context).colorScheme.error,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error.withOpacity(180 / 255),
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadIndexes,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_indexes.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 48,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No indexes found',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      itemCount: _indexes.length,
      itemBuilder: (context, index) {
        final indexData = _indexes[index];
        return _buildIndexCard(indexData);
      },
    );
  }

  Widget _buildIndexCard(Index index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    index.displayName,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Collection: ${index.collection}',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                  if (index.hasFields) ...[
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.check_circle,
                          size: 16,
                          color: Colors.green[600],
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Fields: ${index.fieldsDisplay}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.list_alt,
                size: 24,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}