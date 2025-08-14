import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mflix_app/screens/movies_screen.dart';
import 'package:mflix_app/screens/settings_screen.dart';

import 'providers/ditto_provider.dart';

//
//Get these values from the Ditto Portal
//https://docs.ditto.live/cloud/portal/getting-sdk-connection-details
//https://docs.ditto.live/sdk/latest/install-guides/flutter
//
const _appId = 'insert Ditto Portal App ID here';
const _token = 'insert Ditto Portal Online Playground Authentication Token here';
const _authUrl = 'insert Ditto Portal Auth URL here';
const _websocketUrl = 'insert Ditto Portal Websocket URL here';

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
        cardTheme: CardTheme(
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
        cardTheme: CardTheme(
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
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _initDitto() async {
    final dittoProvider = DittoProvider();
    await dittoProvider.initialize(_appId, _token, _authUrl, _websocketUrl);
    setState(() => _dittoProvider = dittoProvider);
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
    if (_dittoProvider == null) {
      return _warningMessage;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_selectedIndex == 0 ? "Kid Movies" : "System"),
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
              dittoProvider: _dittoProvider!),
          SettingsScreen(
              key: const PageStorageKey('settings'),
              dittoProvider: _dittoProvider!),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.movie),
            label: 'Movies',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'System',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }

  Widget get _warningMessage => Scaffold(
        appBar: AppBar(title: const Text("Kid Movies")),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const Padding(
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
