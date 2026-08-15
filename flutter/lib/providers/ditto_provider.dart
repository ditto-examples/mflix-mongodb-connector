import 'package:flutter/foundation.dart';
import 'dart:async';

import 'package:ditto_live/ditto_live.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:mflix_app/models/movie_listing.dart';
import 'package:mflix_app/models/comment.dart';

class DittoProvider with ChangeNotifier {
  Ditto? _ditto;

  SyncSubscription? _commentsSubscription;
  SyncSubscription? _moviesSubscription;

  // Observers
  StoreObserver? _moviesObserver;
  StoreObserver? _commentsObserver;

  // Stream controllers with replay capability - now return actual objects
  final _moviesStreamController =
      StreamController<List<MovieListing>>.broadcast();
  final _commentsStreamController = StreamController<List<Comment>>.broadcast();

  // Cache the latest results for immediate access
  List<MovieListing>? _latestMoviesList;
  List<Comment>? _latestCommentsList;

  /// The Ditto instance used for database operations
  Ditto? get ditto => _ditto;

  /// Stream of movie listings (G/PG rated movies) with immediate cache
  Stream<List<MovieListing>> get moviesStream async* {
    // Immediately yield cached result if available
    if (_latestMoviesList != null) {
      yield _latestMoviesList!;
    }
    // Then yield all future updates
    yield* _moviesStreamController.stream;
  }

  /// Stream of all comments with immediate cache
  Stream<List<Comment>> get commentsStream async* {
    // Immediately yield cached result if available
    if (_latestCommentsList != null) {
      yield _latestCommentsList!;
    }
    // Then yield all future updates
    yield* _commentsStreamController.stream;
  }

  /// Get comments for a specific movie by filtering the global comments stream
  Stream<List<Comment>> getCommentsForMovie(String movieId) async* {
    // Immediately yield cached filtered comments if available
    if (_latestCommentsList != null) {
      final filteredComments = _latestCommentsList!
          .where((comment) => comment.movieId == movieId)
          .toList()
        ..sort((a, b) => b.date.compareTo(a.date));
      yield filteredComments;
    }

    // Then yield all future filtered updates
    yield* commentsStream.map((comments) {
      return comments.where((comment) => comment.movieId == movieId).toList()
        ..sort((a, b) => b.date.compareTo(a.date));
    });
  }

  /// Called when Ditto reports a failure that happens outside of a method call,
  /// such as a failed token refresh. Set this before calling [initialize] so
  /// that background authentication failures can be surfaced to the user.
  void Function(Object error)? onError;

  /// Initializes the Ditto instance with necessary permissions and configuration.
  /// https://docs.ditto.live/sdk/latest/install-guides/flutter#step-3-import-and-initialize-the-ditto-sdk
  ///
  /// This function:
  /// 1. Requests required Bluetooth and WiFi permissions on non-web platforms
  /// 2. Initializes the Ditto SDK
  /// 3. Configures the database and server connection
  /// 4. Authenticates with the online playground token
  /// 5. Starts sync and updates the app state with the configured Ditto instance
  ///
  /// Throws if Ditto cannot be opened or sync cannot be started. Callers are
  /// expected to catch and show the failure - see `_initDitto` in main.dart.
  Future<void> initialize(
      String databaseId, String token, String serverUrl) async {
    //request permissions - required if you aren't in web to use P2P
    final platform = Ditto.currentPlatform;
    // Note: macOS handles Bluetooth permissions differently via entitlements
    if (platform case SupportedPlatform.android || SupportedPlatform.ios) {
      await [
        Permission.bluetoothConnect,
        Permission.bluetoothAdvertise,
        Permission.nearbyWifiDevices,
        Permission.bluetoothScan
      ].request();
    }
    // Initialize Ditto first
    await Ditto.init();

    final config = DittoConfig(
      databaseID: databaseId,
      connect: DittoConfigConnectServer(url: serverUrl),
    );
    final ditto = await Ditto.open(config);
    _ditto = ditto;

    // The expiration handler is how a server connection authenticates: it runs
    // once at startup and again whenever the token is close to expiring.
    // https://docs.ditto.live/sdk/latest/auth-and-authorization/cloud-authentication
    //
    // Note the handler signature is `void Function(...)`, so anything thrown
    // here becomes an unhandled async error that no caller can catch. Login
    // failures are reported through [onError] instead of being rethrown.
    await ditto.auth.setExpirationHandler((ditto, timeUntilExpiration) async {
      try {
        final response = await ditto.auth.login(
          token: token,
          provider: Authenticator.developmentProvider,
        );
        if (response.exception != null) {
          _reportError(
            'Ditto authentication failed with '
            '${timeUntilExpiration.inSeconds}s until expiration: '
            '${response.exception}',
          );
        }
      } catch (e) {
        _reportError('Ditto authentication failed: $e');
      }
    });

    // CREATE index on title and year field if it doesn't already exist
    // https://docs.ditto.live/dql/dql
    if (platform != SupportedPlatform.web) {
      await ditto.store.execute(
          "CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title)");
      await ditto.store.execute(
          "CREATE INDEX IF NOT EXISTS movies_year_idx ON movies(year)");
    }

    // Set up subscriptions for app lifecycle
    _commentsSubscription =
        ditto.sync.registerSubscription("SELECT * FROM comments");
    _moviesSubscription = ditto.sync.registerSubscription(
        "SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'");

    // Set up observers that will run for the app lifecycle
    _setupObservers();

    ditto.sync.start();
  }

  /// Set up all observers for the app lifecycle
  void _setupObservers() {
    if (_ditto == null) return;

    try {
      // Movies observer - for the movies screen
      _moviesObserver = _ditto!.store.registerObserver(
        "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies WHERE rated = 'G' OR rated = 'PG' ORDER BY year DESC",
      );

      _moviesObserver!.changes.listen((result) {
        // Deserialize in background using compute
        compute(_deserializeMovieListings,
                result.items.map((item) => item.value).toList())
            .then((movies) {
          _latestMoviesList = movies; // Cache the deserialized result
          if (!_moviesStreamController.isClosed) {
            _moviesStreamController.add(movies);
          }
        });
      });

      // Comments observer - for global comment tracking
      _commentsObserver = _ditto!.store.registerObserver(
        "SELECT * FROM comments ORDER BY date DESC",
      );

      _commentsObserver!.changes.listen((result) {
        // Deserialize in background using compute
        compute(_deserializeComments,
                result.items.map((item) => item.value).toList())
            .then((comments) {
          _latestCommentsList = comments; // Cache the deserialized result
          if (!_commentsStreamController.isClosed) {
            _commentsStreamController.add(comments);
          }
        });
      });
    } catch (e) {
      _reportError('Error setting up observers: $e');
    }
  }

  /// Logs an error and forwards it to [onError] so the UI can react to
  /// failures that happen after `initialize` has returned.
  void _reportError(Object error) {
    if (kDebugMode) {
      print(error);
    }
    onError?.call(error);
  }

  @override
  void dispose() {
    _commentsSubscription?.cancel();
    _moviesSubscription?.cancel();

    // Cancel observers
    _moviesObserver?.cancel();
    _commentsObserver?.cancel();

    // Close stream controllers
    _moviesStreamController.close();
    _commentsStreamController.close();

    super.dispose();
  }
}

// Static functions for background deserialization
List<MovieListing> _deserializeMovieListings(List<Map<String, dynamic>> data) {
  return data.map((item) => MovieListing.fromJson(item)).toList();
}

List<Comment> _deserializeComments(List<Map<String, dynamic>> data) {
  return data.map((item) => Comment.fromJson(item)).toList();
}
