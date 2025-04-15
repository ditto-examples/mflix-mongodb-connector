import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:mflix_app/screens/movie_detail_screen.dart';
import 'package:mflix_app/screens/add_movie_screen.dart';
import 'package:mflix_app/widgets/dql_observer_builder.dart';
import 'package:flutter/services.dart';
import 'models/movie.dart';
import 'providers/ditto_provider.dart';

//
//Get these values from the Ditto Portal
//https://docs.ditto.live/cloud/portal/getting-sdk-connection-details
//https://docs.ditto.live/sdk/latest/install-guides/flutter
//
const _appId = 'insert Ditto Portal App ID here';
const _token = 'insert Ditto Portal Online Playground Authenticaton Token here';
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

  @override
  void initState() {
    super.initState();
    _initDitto();
  }

  Future<void> _initDitto() async {
    final dittoProvider = DittoProvider();
    await dittoProvider.initialize(_appId, _token, _authUrl, _websocketUrl);
    setState(() => _dittoProvider = dittoProvider);
  }

  @override
  Widget build(BuildContext context) {
    if (_dittoProvider == null) {
      return _warningMessage;
    }
    return Scaffold(
      appBar: AppBar(
        title: const Text("Kid Movies"),
      ),
      floatingActionButton: _fab,
      body: Column(
        children: [
          Expanded(child: _movieList),
        ],
      ),
    );
  }

  Future<void> _addMovie() async {
    if (!mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddMovieScreen(dittoProvider: _dittoProvider!),
      ),
    );
  }

  Widget get _warningMessage => Scaffold(
        appBar: AppBar(title: const Text("Children Movies")),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  "No Data - Ensure your App ID, Online Playground Authentication Token, Auth URL, and Websocket Url in the DittoProvider are correct",
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      );

  Widget get _fab => FloatingActionButton(
        onPressed: _addMovie,
        child: const Icon(Icons.add_circle),
      );

  Widget get _movieList => DqlObserverBuilder(
      ditto: _dittoProvider!.ditto!,
      subscriptionQuery: "SELECT * FROM movies WHERE rated = 'G'",
      observationQuery: "SELECT * FROM movies ORDER BY year DESC",
      builder: (context, result) {
        final movies =
            result.items.map((r) => r.value).map(Movie.fromJson).toList();

        if (result.items.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    "Trying to load movies...",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 16),
          itemCount: movies.length,
          itemBuilder: (context, index) {
            final movie = movies[index];
            return Card(
              elevation: 4,
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: InkWell(
                borderRadius: BorderRadius.circular(16),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => MovieDetailScreen(
                          movieId: movie.id, dittoProvider: _dittoProvider!),
                    ),
                  );
                },
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (movie.poster.isNotEmpty)
                      ClipRRect(
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                        child: CachedNetworkImage(
                          imageUrl: movie.poster,
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => const Center(
                            child: CircularProgressIndicator(),
                          ),
                          errorWidget: (context, url, error) => Image.asset(
                            'assets/default.png',
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                      )
                    else
                      ClipRRect(
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                        child: Image.asset(
                          'assets/default.png',
                          height: 200,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            movie.title,
                            style: Theme.of(context).textTheme.titleLarge,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            movie.year.toString(),
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            movie.plot,
                            style: Theme.of(context).textTheme.bodyMedium,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      });
}
