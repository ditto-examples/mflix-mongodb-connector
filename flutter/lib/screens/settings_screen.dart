import 'package:flutter/material.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/screens/sync_status_view.dart';
import 'package:mflix_app/screens/indexes_screen.dart';

enum SystemView { syncStatus, indexes }

class SettingsScreen extends StatefulWidget {
  final DittoProvider dittoProvider;
  
  const SettingsScreen({super.key, required this.dittoProvider});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> with AutomaticKeepAliveClientMixin {
  Set<SystemView> _selectedView = {SystemView.syncStatus};

  @override
  bool get wantKeepAlive => true; // Keep state alive when switching tabs

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: SegmentedButton<SystemView>(
            segments: const <ButtonSegment<SystemView>>[
              ButtonSegment<SystemView>(
                value: SystemView.syncStatus,
                label: Text('Sync Status'),
              ),
              ButtonSegment<SystemView>(
                value: SystemView.indexes,
                label: Text('Indexes'),
              ),
            ],
            selected: _selectedView,
            onSelectionChanged: (Set<SystemView> newSelection) {
              setState(() {
                _selectedView = newSelection;
              });
            },
          ),
        ),
        Expanded(
          child: _buildSelectedView(),
        ),
      ],
    );
  }

  Widget _buildSelectedView() {
    if (_selectedView.contains(SystemView.syncStatus)) {
      return SyncStatusView(dittoProvider: widget.dittoProvider);
    } else {
      return IndexesScreen(dittoProvider: widget.dittoProvider);
    }
  }
}