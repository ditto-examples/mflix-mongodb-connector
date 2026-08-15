import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mflix_app/screens/movies_screen.dart';
import 'package:mflix_app/screens/ditto_tools_screen.dart';

import 'providers/ditto_provider.dart';

// Supplied by the root .env file, which Flutter reads via
// `--dart-define-from-file=../.env`. Missing values are reported in the UI by
// [MoviesErrorView] rather than thrown, so the app can explain what to fix.
const _databaseId = String.fromEnvironment('DITTO_DATABASE_ID');
const _token = String.fromEnvironment('DITTO_DEVELOPMENT_TOKEN');
const _serverUrl = String.fromEnvironment('DITTO_SERVER_URL');

const _missingConfigMessage =
    'Missing Ditto configuration. Copy .env.template to .env at the '
    'repository root, fill in the Ditto Portal values, and run Flutter with '
    '--dart-define-from-file=../.env';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const MyMovieApp());
}

class MyMovieApp extends StatelessWidget {
  const MyMovieApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kid Movies',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.system,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),
        cardTheme: CardThemeData(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blueGrey,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),
        cardTheme: CardThemeData(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      home: const MoviesExample(),
    );
  }
}

class MoviesExample extends StatefulWidget {
  const MoviesExample({super.key});
  @override
  State<MoviesExample> createState() => _MoviesExampleState();
}

class _MoviesExampleState extends State<MoviesExample> {
  DittoProvider? _dittoProvider;
  String? _initError;
  String? _pendingErrorMessage;
  int _selectedIndex = 0;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _selectedIndex);
    _initDitto();
  }

  @override
  void dispose() {
    _dittoProvider?.dispose();
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _initDitto() async {
    if (_databaseId.isEmpty || _token.isEmpty || _serverUrl.isEmpty) {
      setState(() => _initError = _missingConfigMessage);
      return;
    }

    final dittoProvider = DittoProvider();
    // Report failures that happen after startup, such as a token that can no
    // longer be refreshed, instead of leaving the app silently out of sync.
    dittoProvider.onError = _handleDittoError;
    try {
      await dittoProvider.initialize(_databaseId, _token, _serverUrl);
      if (!mounted) return;
      setState(() => _dittoProvider = dittoProvider);
      _flushPendingError();
    } catch (e) {
      // Ditto could not be opened at all, so there is nothing to show but the
      // reason why.
      if (!mounted) return;
      setState(() => _initError = e.toString());
    }
  }

  /// Handles failures reported after `initialize` returned. Ditto still works
  /// offline in that case, so the app stays usable and the error is shown as a
  /// snack bar rather than replacing the UI.
  void _handleDittoError(Object error) {
    if (!mounted) return;
    if (_dittoProvider == null) {
      // Startup is still in flight - hold the message until there is a
      // Scaffold to show it in.
      _pendingErrorMessage = error.toString();
      return;
    }
    _showError(error.toString());
  }

  void _flushPendingError() {
    final message = _pendingErrorMessage;
    if (message == null) return;
    _pendingErrorMessage = null;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _showError(message);
    });
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Theme.of(context).colorScheme.error,
        duration: const Duration(seconds: 8),
      ),
    );
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_initError != null) {
      return MoviesErrorView(message: _initError!);
    }

    if (_dittoProvider == null) {
      return const MoviesLoadingView();
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedIndex == 0 ? "Kid Movies" : "Ditto Tools"),
      ),
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        children: [
          // Use keys to maintain widget state
          MoviesScreen(
            key: const PageStorageKey('movies'),
            dittoProvider: _dittoProvider!,
          ),
          DittoToolsScreen(
            key: const PageStorageKey('ditto_tools'),
            dittoProvider: _dittoProvider!,
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.movie), label: 'Movies'),
          BottomNavigationBarItem(
            icon: Icon(Icons.build),
            label: 'Ditto Tools',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}

class MoviesLoadingView extends StatelessWidget {
  const MoviesLoadingView({super.key});

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text("Kid Movies")),
        body: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "Trying to retrieve data - if this is first data sync this can take a while",
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      );
}

/// Shown when Ditto cannot be started, most commonly because the root .env
/// file is missing values or was not passed to Flutter.
class MoviesErrorView extends StatelessWidget {
  const MoviesErrorView({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: AppBar(title: const Text("Kid Movies")),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 48,
                color: Theme.of(context).colorScheme.error,
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 16.0),
                child: Text(
                  "Could not start Ditto",
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ),
              Text(message, textAlign: TextAlign.center),
              const Padding(
                padding: EdgeInsets.only(top: 16.0),
                child: Text(
                  "Check DITTO_DATABASE_ID, DITTO_DEVELOPMENT_TOKEN, and "
                  "DITTO_SERVER_URL in the .env file at the repository root "
                  "against your Ditto Portal connection details, then restart "
                  "the app.",
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      );
}
