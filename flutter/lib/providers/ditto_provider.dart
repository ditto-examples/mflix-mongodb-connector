import 'package:flutter/foundation.dart';
import 'dart:async';

import 'package:ditto_live/ditto_live.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:mflix_app/models/movie_listing.dart';
import 'package:mflix_app/models/comment.dart';

class DittoProvider with ChangeNotifier {
  Ditto? _ditto;
  
  // Subscriptions
  SyncSubscription? _commentsSubscription;
  SyncSubscription? _moviesSubscription;
  
  // Observers  
  StoreObserver? _moviesObserver;
  StoreObserver? _commentsObserver;
  StoreObserver? _syncStatusObserver;
  
  // Stream controllers with replay capability - now return actual objects
  final _moviesStreamController = StreamController<List<MovieListing>>.broadcast();
  final _commentsStreamController = StreamController<List<Comment>>.broadcast(); 
  final _syncStatusStreamController = StreamController<QueryResult>.broadcast();
  
  // Cache the latest results for immediate access
  List<MovieListing>? _latestMoviesList;
  List<Comment>? _latestCommentsList;
  QueryResult? _latestSyncStatusResult;

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
  
  /// Stream of sync status information with immediate cache
  Stream<QueryResult> get syncStatusStream async* {
    // Immediately yield cached result if available
    if (_latestSyncStatusResult != null) {
      yield _latestSyncStatusResult!;
    }
    // Then yield all future updates
    yield* _syncStatusStreamController.stream;
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
      return comments
          .where((comment) => comment.movieId == movieId)
          .toList()
        ..sort((a, b) => b.date.compareTo(a.date));
    });
  }

  /// Initializes the Ditto instance with necessary permissions and configuration.
  /// https://docs.ditto.live/sdk/latest/install-guides/flutter#step-3-import-and-initialize-the-ditto-sdk
  ///
  /// This function:
  /// 1. Requests required Bluetooth and WiFi permissions on non-web platforms
  /// 2. Initializes the Ditto SDK
  /// 3. Sets up online playground identity with the provided app ID and token
  /// 4. Enables peer-to-peer communication on non-web platforms
  /// 5. Configures WebSocket connection to Ditto cloud
  /// 6. Starts sync and updates the app state with the configured Ditto instance
  Future<void> initialize(
      String appId, String token, String authUrl, String websocketUrl) async {
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

    final identity = OnlinePlaygroundIdentity(
        appID: appId,
        token: token,
        customAuthUrl: authUrl,
        enableDittoCloudSync: false);
    _ditto = await Ditto.open(identity: identity);

    _ditto?.updateTransportConfig((config) {
      // Note: this will not enable peer-to-peer sync on the web platform
      config.setAllPeerToPeerEnabled(true);
      config.connect.webSocketUrls.add(websocketUrl);
    });

    // Disable DQL strict mode so that collection definitions are not required in DQL queries
    // https://docs.ditto.live/dql/strict-mode#introduction
    _ditto?.store.execute("ALTER SYSTEM SET DQL_STRICT_MODE = false");

    // CREATE index on title and year field if it doesn't already exist
    // https://docs.ditto.live/dql/dql
    if (platform != SupportedPlatform.web) {
        _ditto?.store.execute(
          "CREATE INDEX IF NOT EXISTS movies_title_idx ON movies(title)");
        _ditto?.store.execute(
          "CREATE INDEX IF NOT EXISTS movies_year_idx ON movies(year)");
    }

    // Set up subscriptions for app lifecycle
    _commentsSubscription = _ditto?.sync.registerSubscription("SELECT * FROM comments");
    _moviesSubscription = _ditto?.sync.registerSubscription("SELECT * FROM movies WHERE rated = 'G' OR rated = 'PG'");

    // Set up observers that will run for the app lifecycle
    _setupObservers();

    _ditto?.startSync();
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
        compute(_deserializeMovieListings, result.items.map((item) => item.value).toList())
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
        compute(_deserializeComments, result.items.map((item) => item.value).toList())
          .then((comments) {
            _latestCommentsList = comments; // Cache the deserialized result
            if (!_commentsStreamController.isClosed) {
              _commentsStreamController.add(comments);
            }
          });
      });

      // Sync status observer - for the system tab
      _syncStatusObserver = _ditto!.store.registerObserver(
        "SELECT * FROM system:data_sync_info ORDER BY documents.sync_session_status, documents.last_update_received_time DESC",
      );
      
      _syncStatusObserver!.changes.listen((result) {
        _latestSyncStatusResult = result; // Cache the result
        if (!_syncStatusStreamController.isClosed) {
          _syncStatusStreamController.add(result);
        }
      });
      
    } catch (e) {
      if (kDebugMode) {
        print('Error setting up observers: $e');
      }
    }
  }

  @override
  void dispose() {
    // Cancel subscriptions
    _commentsSubscription?.cancel();
    _moviesSubscription?.cancel();
    
    // Cancel observers 
    _moviesObserver?.cancel();
    _commentsObserver?.cancel();
    _syncStatusObserver?.cancel();
    
    // Close stream controllers
    _moviesStreamController.close();
    _commentsStreamController.close();
    _syncStatusStreamController.close();
    
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
