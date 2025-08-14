import 'package:ditto_live/ditto_live.dart';
import 'package:flutter/material.dart';

class DqlObserverSubscriptionBuilder extends StatefulWidget {
  final Ditto ditto;
  final String subscriptionQuery;
  final Map<String, dynamic>? subscriptionQueryArgs;
  final String observationQuery;
  final Map<String, dynamic>? observationQueryArgs;
  final Widget Function(BuildContext, QueryResult) builder;
  final Widget? loading;

  const DqlObserverSubscriptionBuilder({
    super.key,
    required this.ditto,
    required this.subscriptionQuery,
    this.subscriptionQueryArgs,
    required this.observationQuery,
    this.observationQueryArgs,
    required this.builder,
    this.loading,
  });

  @override
  State<DqlObserverSubscriptionBuilder> createState() => _DqlObserverSubscriptionBuilderState();
}

class _DqlObserverSubscriptionBuilderState extends State<DqlObserverSubscriptionBuilder> {
  // https://docs.ditto.live/sdk/latest/crud/observing-data-changes
  StoreObserver? _observer;

  // https://docs.ditto.live/sdk/latest/sync/syncing-data
  SyncSubscription? _subscription;

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

    //https://docs.ditto.live/sdk/latest/sync/syncing-data#creating-subscriptions
    final subscription = widget.ditto.sync.registerSubscription(
      widget.subscriptionQuery,
      arguments: widget.subscriptionQueryArgs ?? {},
    );

    setState(() {
      _observer = observer;
      _subscription = subscription;
    });
  }

  @override
  void didUpdateWidget(covariant DqlObserverSubscriptionBuilder oldWidget) {
    super.didUpdateWidget(oldWidget);

    final isSame = widget.subscriptionQuery == oldWidget.subscriptionQuery &&
        widget.subscriptionQueryArgs == oldWidget.subscriptionQueryArgs &&
        widget.observationQuery == oldWidget.observationQuery &&
        widget.observationQueryArgs == oldWidget.observationQueryArgs;

    if (!isSame) {
      _observer?.cancel();
      _subscription?.cancel();

      setupState();
    }
  }

  @override
  void dispose() {
    _observer?.cancel();
    _subscription?.cancel();
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