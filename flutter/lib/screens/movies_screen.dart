import 'dart:async';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mflix_app/models/movie_listing.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/screens/add_movie_screen.dart';
import 'package:mflix_app/screens/movie_detail_screen.dart';

class MoviesScreen extends StatefulWidget {
  final DittoProvider dittoProvider;

  const MoviesScreen({super.key, required this.dittoProvider});

  @override
  State<MoviesScreen> createState() => _MoviesScreenState();
}

class _MoviesScreenState extends State<MoviesScreen>
    with AutomaticKeepAliveClientMixin {
  final ScrollController _scrollController = ScrollController();
  final TextEditingController _searchController = TextEditingController();
  
  // Search state
  bool _isSearching = false;
  bool _isLoadingSearch = false;
  List<MovieListing>? _searchResults;
  Timer? _debounceTimer;

  @override
  bool get wantKeepAlive => true; // Keep state alive when switching tabs

  @override
  void initState() {
    super.initState();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    // Cancel previous timer
    _debounceTimer?.cancel();
    
    final searchTerm = _searchController.text.trim();
    
    // If search is empty, return to observer stream
    if (searchTerm.isEmpty) {
      setState(() {
        _isSearching = false;
        _searchResults = null;
        _isLoadingSearch = false;
      });
      return;
    }
    
    // Set searching state
    if (!_isSearching) {
      setState(() {
        _isSearching = true;
        _isLoadingSearch = true;
      });
    }
    
    // Debounce the search
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _performSearch(searchTerm);
    });
  }

  Future<void> _performSearch(String searchTerm) async {
    if (!mounted) return;
    
    setState(() {
      _isLoadingSearch = true;
    });
    
    try {
      final ditto = widget.dittoProvider.ditto;
      if (ditto != null) {
        final query = "SELECT _id, plot, poster, title, year, imdb.rating AS imdbRating, tomatoes.viewer.rating as rottenRating FROM movies WHERE title LIKE :searchTerm AND (rated = 'G' OR rated = 'PG') ORDER BY year DESC";
        final result = await ditto.store.execute(
          query,
          arguments: {'searchTerm': '%$searchTerm%'},
        );
        
        if (mounted) {
          // Deserialize search results in background
          final rawData = result.items.map((r) => r.value).toList();
          final movies = await compute(_deserializeSearchResults, rawData);
          
          setState(() {
            _searchResults = movies;
            _isLoadingSearch = false;
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoadingSearch = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Search failed: $e'),
            duration: const Duration(seconds: 2),
          ),
        );
      }
    }
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() {
      _isSearching = false;
      _searchResults = null;
      _isLoadingSearch = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
    return Scaffold(
      floatingActionButton: FloatingActionButton(
        onPressed: () => _addMovie(context),
        child: const Icon(Icons.add_circle),
      ),
      body: Column(
        children: [
          // Search bar
          Container(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search movies by title...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: _clearSearch,
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
              ),
            ),
          ),
          // Movie list
          Expanded(
            child: _isSearching
                ? _buildSearchResults()
                : _buildMovieList(context),
          ),
        ],
      ),
    );
  }

  Future<void> _addMovie(BuildContext context) async {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            AddMovieScreen(dittoProvider: widget.dittoProvider),
      ),
    );
  }

  Widget _buildSearchResults() {
    if (_isLoadingSearch) {
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

    if (_searchResults == null) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_searchResults!.isEmpty) {
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
              'No movies found for "${_searchController.text}"',
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

    return _buildMovieListView(_searchResults!);
  }

  Widget _buildMovieList(BuildContext context) {
    return StreamBuilder<List<MovieListing>>(
      stream: widget.dittoProvider.moviesStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    "Trying to load movies - first data sync can take a while...",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
          );
        }

        final movies = snapshot.data!;

        if (movies.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const CircularProgressIndicator(),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text(
                    "Trying to load movies - first data sync can take a while...",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ],
            ),
          );
        }

        return _buildMovieListView(movies);
      },
    );
  }

  Widget _buildMovieListView(List<MovieListing> movies) {
    return ListView.builder(
      controller: _scrollController,
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
            onTap: () async {
              // Show loading dialog immediately
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
                        movieId: movie.id,
                        dittoProvider: widget.dittoProvider),
                  ),
                );

                // Dismiss loading dialog after navigation
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
                                color:
                                    Theme.of(context).colorScheme.primary,
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
  }

}

// Function for background deserialization of search results
List<MovieListing> _deserializeSearchResults(List<Map<String, dynamic>> data) {
  return data.map((item) => MovieListing.fromJson(item)).toList();
}