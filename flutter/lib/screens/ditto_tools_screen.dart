import 'package:flutter/material.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/screens/tools/peers_list_screen.dart';
import 'package:mflix_app/screens/tools/sync_status_screen.dart';
import 'package:mflix_app/screens/tools/query_editor_screen.dart';
import 'package:mflix_app/screens/tools/permissions_health_screen.dart';
import 'package:mflix_app/screens/tools/disk_usage_screen.dart';
import 'package:mflix_app/screens/tools/system_settings_screen.dart';
import 'package:mflix_app/screens/tools/peers_sync_status_screen.dart';

class DittoToolsScreen extends StatefulWidget {
  final DittoProvider dittoProvider;

  const DittoToolsScreen({super.key, required this.dittoProvider});

  @override
  State<DittoToolsScreen> createState() => _DittoToolsScreenState();
}

class _DittoToolsScreenState extends State<DittoToolsScreen>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return ListView(
      children: [
        _buildSectionHeader('NETWORK'),
        _buildMenuItem(
          icon: Icons.group,
          iconColor: Colors.blue,
          title: 'Peers List',
          onTap: () => _navigateToScreen(
            context,
            PeersListScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        _buildMenuItem(
          icon: Icons.sync,
          iconColor: Colors.green,
          title: 'Sync Status',
          onTap: () => _navigateToScreen(
            context,
            SyncStatusScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        _buildMenuItem(
          icon: Icons.sync,
          iconColor: Colors.redAccent,
          title: 'Peer Sync Status',
          onTap: () => _navigateToScreen(
            context,
            PeersSyncStatusScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        const SizedBox(height: 16),
        _buildSectionHeader('DITTO STORE'),
        _buildMenuItem(
          icon: Icons.code,
          iconColor: Colors.orange,
          title: 'Query Editor',
          onTap: () => _navigateToScreen(
            context,
            QueryEditorScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        const SizedBox(height: 16),
        _buildSectionHeader('SYSTEM'),
        _buildMenuItem(
          icon: Icons.security,
          iconColor: Colors.purple,
          title: 'Permissions Health',
          onTap: () => _navigateToScreen(
            context,
            PermissionsHealthScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        _buildMenuItem(
          icon: Icons.storage,
          iconColor: Colors.blueGrey,
          title: 'Disk Usage',
          onTap: () => _navigateToScreen(
            context,
            DiskUsageScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        _buildMenuItem(
          icon: Icons.settings,
          iconColor: Colors.orange,
          title: 'System Settings',
          onTap: () => _navigateToScreen(
            context,
            SystemSettingsScreen(dittoProvider: widget.dittoProvider),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Colors.grey[600],
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: iconColor.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          color: iconColor,
          size: 24,
        ),
      ),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.chevron_right,
        color: Colors.grey,
      ),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    );
  }

  void _navigateToScreen(BuildContext context, Widget screen) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => screen),
    );
  }
}