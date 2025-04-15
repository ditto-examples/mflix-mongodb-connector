import 'package:ditto_live/ditto_live.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class CollectionItemBuilder extends StatefulWidget {
  final Ditto ditto;
  final String collectionName;
  final String documentId;
  final Widget Function(BuildContext, QueryResult) builder;
  final Widget? loading;

  const CollectionItemBuilder({
    super.key,
    required this.ditto,
    required this.collectionName,
    required this.documentId,
    required this.builder,
    this.loading,
  });

  @override
  State<CollectionItemBuilder> createState() => _CollectionItemBuilderState();
}

class _CollectionItemBuilderState extends State<CollectionItemBuilder> {
  QueryResult? _queryResult;
  String _message = '';
  bool _isError = false;
  bool _showNoData = false;

  @override
  void initState() {
    super.initState();
    _fetchDocument();
  }

  @override
  void didUpdateWidget(covariant CollectionItemBuilder oldWidget) {
    super.didUpdateWidget(oldWidget);

    final isSame = widget.collectionName == oldWidget.collectionName &&
        widget.documentId == oldWidget.documentId;

    if (!isSame) {
      _fetchDocument();
    }
  }

  Future<void> _fetchDocument() async {
    try {
      //read the movie from the database
      //https://docs.ditto.live/sdk/latest/crud/read#using-args-to-query-dynamic-values
      final argument = {'id': widget.documentId};
      final query = "SELECT * FROM ${widget.collectionName} WHERE _id = :id";
      final results =
          await widget.ditto.store.execute(query, arguments: argument);
      if (results.items.isNotEmpty) {
        setState(() {
          _queryResult = results;
          _message = '';
          _isError = false;
          _showNoData = false;
        });
      } else {
        setState(() {
          _queryResult = null;
          _message = 'Document not found';
          _isError = false;
          _showNoData = true;
        });
      }
    } catch (e) {
      if (kDebugMode) {
        setState(() {
          _queryResult = null;
          _message = 'Error fetching document: $e';
          _isError = true;
          _showNoData = false;
        });
        print('Error fetching document: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final placeholder = widget.loading ?? _defaultLoading;
    if (_isError || _showNoData) return _warningMessage;
    if (_queryResult == null) return placeholder;
    return widget.builder(context, _queryResult!);
  }

  Widget get _warningMessage => Scaffold(
        appBar: AppBar(title: const Text("Movie")),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center, // Center vertically
            crossAxisAlignment:
                CrossAxisAlignment.center, // Center horizontally
            children: [
              Text(_message),
            ],
          ),
        ),
      );
}

const _defaultLoading = Center(child: CircularProgressIndicator());
