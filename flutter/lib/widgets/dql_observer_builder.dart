import 'package:ditto_live/ditto_live.dart';
import 'package:flutter/material.dart';

class DqlObserverBuilder extends StatefulWidget {
  final Ditto ditto;
  final String observationQuery;
  final Map<String, dynamic>? observationQueryArgs;
  final Widget Function(BuildContext, QueryResult) builder;
  final Widget? loading;

  const DqlObserverBuilder({
    super.key,
    required this.ditto,
    required this.observationQuery,
    this.observationQueryArgs,
    required this.builder,
    this.loading,
  });

  @override
  State<DqlObserverBuilder> createState() => _DqlObserverBuilderState();
}

class _DqlObserverBuilderState extends State<DqlObserverBuilder> {
  // https://docs.ditto.live/sdk/latest/crud/observing-data-changes
  StoreObserver? _observer;

  @override
  void initState() {
    super.initState();
    setupState();
  }

  void setupState() {
     //https://docs.ditto.live/sdk/latest/crud/observing-data-changes#store-observer-with-query-arguments
     final observer = widget.ditto.store.registerObserver(
      widget.observationQuery,
      arguments: widget.observationQueryArgs ?? {},
    );

    setState(() {
      _observer = observer;
    });
  }

  @override
  void didUpdateWidget(covariant DqlObserverBuilder oldWidget) {
    super.didUpdateWidget(oldWidget);

    final isSame = widget.observationQuery == oldWidget.observationQuery &&
        widget.observationQueryArgs == oldWidget.observationQueryArgs;

    if (!isSame) {
      _observer?.cancel();
      setupState();
    }
  }

  @override
  void dispose() {
    _observer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final placeholder = widget.loading ?? _defaultLoading;
    final stream = _observer?.changes;
    if (stream == null) return placeholder;

    return StreamBuilder(
        stream: stream,
        builder: (context, snapshot) {
          final response = snapshot.data;
          if (response == null) return widget.loading ?? _defaultLoading;
          return widget.builder(context, response);
        });
  }
}

const _defaultLoading = Center(child: CircularProgressIndicator());
