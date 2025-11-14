import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mflix_app/models/movie_listing.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/screens/movie_detail_screen.dart';

class MovieSearchDelegate extends SearchDelegate<MovieListing?> {
  final DittoProvider dittoProvider;

  // Search state
  Timer? _debounceTimer;
  String _lastQuery = '';
  Future<List<MovieListing>>? _searchFuture;

  MovieSearchDelegate(this.dittoProvider);

  @override
  ThemeData appBarTheme(BuildContext context) {
    // Use app's theme for consistency
    final theme = Theme.of(context);
    return theme.copyWith(
      appBarTheme: theme.appBarTheme.copyWith(
        elevation: 0,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        border: InputBorder.none,
        hintStyle: TextStyle(
          fontSize: 18,
        ),
      ),
    );
  }

  @override
  List<Widget> buildActions(BuildContext context) {
    // Clear button
    return [
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
            _searchFuture = null;
            _lastQuery = '';
          },
        ),
    ];
  }

  @override
  Widget buildLeading(BuildContext context) {
    // Back button
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => close(context, null),
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    // Perform search when user submits
    if (query.trim().isEmpty) {
      return _buildEmptyState();
    }

    // Create new search future for results
    final searchFuture = _performSearch(query);
    return _buildSearchResultsView(context, searchFuture);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    // Show suggestions/results as user types
    if (query.isEmpty) {
      _lastQuery = '';
      _searchFuture = null;
      return _buildEmptyState();
    }

    // Only create new search future if query changed
    if (query != _lastQuery) {
      _lastQuery = query;
      _debounceTimer?.cancel();

      // Create a completer for debounced search
      final completer = Completer<List<MovieListing>>();
      _searchFuture = completer.future;

      _debounceTimer = Timer(const Duration(milliseconds: 500), () {
        _performSearch(query).then((results) {
          if (!completer.isCompleted) {
            completer.complete(results);
          }
        }).catchError((error) {
          if (!completer.isCompleted) {
            completer.completeError(error);
          }
        });
      });
    }

    return _buildSearchResultsView(context, _searchFuture!);
  }

  Future<List<MovieListing>> _performSearch(String searchTerm) async {
    try {
      final ditto = dittoProvider.ditto;
      if (ditto != null) {
        final queryStr = "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies WHERE title LIKE :searchTerm AND (rated = 'G' OR rated = 'PG') ORDER BY year DESC";
        final result = await ditto.store.execute(
          queryStr,
          arguments: {'searchTerm': '%$searchTerm%'},
        );

        // Deserialize search results in background
        final rawData = result.items.map((r) => r.value).toList();
        final movies = await compute(_deserializeSearchResults, rawData);

        return movies;
      } else {
        return [];
      }
    } catch (e) {
      // Return empty list on error, UI will handle it
      return [];
    }
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search,
            size: 64,
            color: Colors.grey.shade400,
          ),
          const SizedBox(height: 16),
          Text(
            'Search for kid-friendly movies',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Start typing a movie title...',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchResultsView(BuildContext context, Future<List<MovieListing>> searchFuture) {
    return FutureBuilder<List<MovieListing>>(
      future: searchFuture,
      builder: (context, snapshot) {
        // Loading state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text(
                  'Searching movies...',
                  style: TextStyle(fontSize: 16),
                ),
              ],
            ),
          );
        }

        // Error state
        if (snapshot.hasError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red,
                ),
                const SizedBox(height: 16),
                Text(
                  'Search failed: ${snapshot.error}',
                  style: const TextStyle(fontSize: 16),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        // No data
        if (!snapshot.hasData) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        final searchResults = snapshot.data!;

        // Empty results
        if (searchResults.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.search_off,
                  size: 64,
                  color: Colors.grey,
                ),
                const SizedBox(height: 16),
                Text(
                  'No movies found for "$query"',
                  style: const TextStyle(fontSize: 16),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Try a different search term',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ],
            ),
          );
        }

        // Display results
        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 16),
          itemCount: searchResults.length,
          itemBuilder: (context, index) {
            final movie = searchResults[index];
        return Card(
          elevation: 4,
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () async {
              // Show loading dialog
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext dialogContext) {
                  return const PopScope(
                    canPop: false,
                    child: Center(
                      child: Card(
                        elevation: 8,
                        child: Padding(
                          padding: EdgeInsets.all(32.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(),
                              SizedBox(height: 16),
                              Text(
                                'Loading movie...',
                                style: TextStyle(fontSize: 16),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                },
              );

              // Small delay to ensure dialog is visible
              await Future.delayed(const Duration(milliseconds: 100));

              // Navigate to movie detail screen
              if (context.mounted) {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MovieDetailScreen(
                        movieId: movie.id, dittoProvider: dittoProvider),
                  ),
                );

                // Dismiss loading dialog
                if (context.mounted) {
                  Navigator.of(context).pop();
                }
              }
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
                      placeholder: (context, url) => Image.asset(
                        'assets/default.png',
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
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
                      if (movie.hasRatings) ...[
                        const SizedBox(height: 8),
                        Text(
                          movie.ratingsDisplay,
                          style: Theme.of(context)
                              .textTheme
                              .bodySmall
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}

// Function for background deserialization of search results
List<MovieListing> _deserializeSearchResults(List<Map<String, dynamic>> data) {
  return data.map((item) => MovieListing.fromJson(item)).toList();
}
