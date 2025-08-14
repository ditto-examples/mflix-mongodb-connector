import 'dart:async';
import 'dart:math';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:mflix_app/models/comment.dart';
import 'package:mflix_app/models/movie.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/widgets/collection_item_builder.dart';

class MovieDetailScreen extends StatefulWidget {
  final String movieId;
  final DittoProvider dittoProvider;
  final bool isEditMode;

  const MovieDetailScreen({
    super.key,
    required this.movieId,
    required this.dittoProvider,
    this.isEditMode = false,
  });

  @override
  State<MovieDetailScreen> createState() => _MovieDetailScreenState();
}

class _MovieDetailScreenState extends State<MovieDetailScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _plotController = TextEditingController();
  final _posterController = TextEditingController();
  final _fullPlotController = TextEditingController();
  final _yearController = TextEditingController();
  final _countriesController = TextEditingController();
  late bool _isEditMode;
  DittoProvider? _dittoProvider;
  int _rebuildKey = 0;

  // Segmented control state
  Set<String> _selectedView = {'details'};

  // Comment form controllers
  final _commentController = TextEditingController();
  final _commentFormKey = GlobalKey<FormState>();

  // Cached comment data for performance
  List<Comment> _cachedComments = [];
  int _commentCount = 0;
  StreamSubscription? _commentsSubscription;

  @override
  void initState() {
    super.initState();
    _isEditMode = widget.isEditMode;
    setState(() => _dittoProvider = widget.dittoProvider);
    _subscribeToComments();
  }

  void _subscribeToComments() {
    // Subscribe to the provider's comments stream for this specific movie
    _commentsSubscription = widget.dittoProvider
        .getCommentsForMovie(widget.movieId)
        .listen((comments) {
      if (mounted) {
        setState(() {
          _cachedComments = comments;
          _commentCount = comments.length;
        });
      }
    }, onError: (error) {
      if (kDebugMode) {
        print('Error in comments subscription: $error');
      }
    });
  }

  @override
  void dispose() {
    // Cancel subscription to prevent any callbacks during disposal
    _commentsSubscription?.cancel();
    _commentsSubscription = null;

    // Dispose controllers
    _titleController.dispose();
    _plotController.dispose();
    _posterController.dispose();
    _fullPlotController.dispose();
    _yearController.dispose();
    _countriesController.dispose();
    _commentController.dispose();

    super.dispose();
  }

  void _showErrorSnackBar(String errorMessage, String query) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Failed to update movie: $errorMessage'),
        action: SnackBarAction(
          label: 'Show Details',
          onPressed: () {
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Update Error Details'),
                content: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text('Error: $errorMessage'),
                      const SizedBox(height: 16),
                      const Text('Query:'),
                      Text(query),
                    ],
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ],
              ),
            );
          },
        ),
        duration: const Duration(seconds: 6),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _saveChanges(Movie movie) async {
    if (_formKey.currentState!.validate()) {
      if (_dittoProvider?.ditto != null) {
        var ditto = _dittoProvider!.ditto!;
        List<String> updates = [];

        // Compare and add changed fields
        if (_titleController.text != movie.title) {
          updates.add("title = '${_titleController.text}'");
        }
        if (_yearController.text != movie.year) {
          updates.add("year = '${_yearController.text}'");
        }
        if (_plotController.text != movie.plot) {
          updates.add("plot = '${_plotController.text}'");
        }
        if (_posterController.text != movie.poster) {
          updates.add("poster = '${_posterController.text}'");
        }
        if (_fullPlotController.text != movie.fullplot) {
          updates.add("fullplot = '${_fullPlotController.text}'");
        }

        final newCountries = _countriesController.text
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();
        if (!listEquals(newCountries, movie.countries)) {
          final countriesString = newCountries.map((c) => "'$c'").join(',');
          updates.add('countries = [$countriesString]');
        }

        if (updates.isNotEmpty) {
          String updateQuery =
              "UPDATE movies SET ${updates.join(', ')} WHERE _id = '${movie.id}'";
          try {
            var result = await ditto.store.execute(updateQuery);
            if (!mounted) return;
            if (result.mutatedDocumentIDs.isNotEmpty) {
              setState(() {
                _isEditMode = false;
                _rebuildKey++;
              });

              // Extract commitID and mutatedDocumentIDs for user feedback
              final commitId = result.commitID ?? 'Unknown';
              final mutatedIds = result.mutatedDocumentIDs.join(', ');

              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Movie updated successfully\n'
                      'Commit ID: $commitId\n'
                      'Document IDs: $mutatedIds'),
                  duration: const Duration(seconds: 5),
                  behavior: SnackBarBehavior.floating,
                ),
              );
            } else {
              _showErrorSnackBar(
                  'Unknown error - no documents were updated', updateQuery);
            }
          } catch (e) {
            _showErrorSnackBar(e.toString(), updateQuery);
          }
        }
      }
    }
  }

  void _toggleEditMode() {
    setState(() {
      _isEditMode = !_isEditMode;
    });
  }

  void _initializeControllers(Movie movie) {
    _titleController.text = movie.title;
    _plotController.text = movie.plot;
    _posterController.text = movie.poster;
    _fullPlotController.text = movie.fullplot;
    _yearController.text = movie.year;
    _countriesController.text = movie.countries.join(", ");
  }

  Future<void> _addComment() async {
    if (_commentFormKey.currentState!.validate()) {
      final ditto = widget.dittoProvider.ditto;
      if (ditto != null) {
        final commentId =
            'comment_${DateTime.now().millisecondsSinceEpoch}_${Random().nextInt(1000)}';
        final comment = {
          '_id': commentId,
          'name': 'Anonymous',
          'email': 'anonymous@example.com',
          'movie_id': widget.movieId,
          'text': _commentController.text.trim(),
          'date': DateTime.now().millisecondsSinceEpoch,
        };

        try {
          await ditto.store.execute(
            'INSERT INTO comments DOCUMENTS (:comment)',
            arguments: {'comment': comment},
          );

          _commentController.clear();

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Comment added successfully'),
                duration: Duration(seconds: 2),
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Failed to add comment: $e'),
                duration: const Duration(seconds: 3),
              ),
            );
          }
        }
      }
    }
  }

  void _showAddCommentDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Comment'),
        content: Form(
          key: _commentFormKey,
          child: TextFormField(
            controller: _commentController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Write your comment...',
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Please enter a comment';
              }
              return null;
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              _addComment();
              Navigator.pop(context);
            },
            child: const Text('Add Comment'),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingScreen() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Loading...'),
        backgroundColor: Colors.transparent,
      ),
      body: SizedBox(
        width: double.infinity,
        height: double.infinity,
        child: Column(
          children: [
            // Loading movie poster placeholder
            Container(
              width: double.infinity,
              height: 300,
              color: Colors.grey[300],
              child: Center(
                child: Icon(
                  Icons.movie,
                  size: 80,
                  color: Colors.grey[500],
                ),
              ),
            ),

            // Loading content area
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    // Animated loading dots for movie title
                    const SizedBox(height: 16),
                    _buildShimmerPlaceholder(height: 32, width: 250),
                    const SizedBox(height: 8),
                    _buildShimmerPlaceholder(height: 20, width: 120),
                    const SizedBox(height: 24),

                    // Loading spinner with message
                    const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    Text(
                      'Loading movie details...',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),

                    // Placeholder content
                    const SizedBox(height: 32),
                    _buildShimmerPlaceholder(
                        height: 16, width: double.infinity),
                    const SizedBox(height: 8),
                    _buildShimmerPlaceholder(
                        height: 16, width: double.infinity),
                    const SizedBox(height: 8),
                    _buildShimmerPlaceholder(height: 16, width: 200),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerPlaceholder(
      {required double height, required double width}) {
    return Container(
      height: height,
      width: width,
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(4),
      ),
      child: TweenAnimationBuilder<double>(
        duration: const Duration(milliseconds: 1200),
        tween: Tween(begin: 0.0, end: 1.0),
        onEnd: () {
          // This will cause the animation to rebuild and restart
          if (mounted) {
            setState(() {});
          }
        },
        builder: (context, value, child) {
          return Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(4),
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                stops: [
                  value - 0.3,
                  value,
                  value + 0.3,
                ].map((stop) => stop.clamp(0.0, 1.0)).toList(),
                colors: [
                  Colors.transparent,
                  Colors.white.withOpacity(0.4),
                  Colors.transparent,
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return _movieViewer;
  }

  Widget get _movieViewer => CollectionItemBuilder(
      key: ValueKey(_rebuildKey),
      ditto: widget.dittoProvider.ditto!,
      collectionName: "movies",
      documentId: widget.movieId,
      loading: _buildLoadingScreen(),
      builder: (context, movie) {

        if (!_isEditMode) {
          _initializeControllers(movie);
        }

        return Scaffold(
          appBar: AppBar(
            title: Text(movie.title),
            actions: [
              if (_selectedView.contains('details')) ...[
                IconButton(
                  icon: Icon(_isEditMode ? Icons.cancel : Icons.edit),
                  onPressed: _toggleEditMode,
                ),
                if (_isEditMode)
                  IconButton(
                    icon: const Icon(Icons.save),
                    onPressed: () => _saveChanges(movie),
                  ),
              ],
            ],
          ),
          floatingActionButton:
              _selectedView.contains('comments') && !_isEditMode
                  ? FloatingActionButton(
                      onPressed: _showAddCommentDialog,
                      child: const Icon(Icons.add),
                    )
                  : null,
          body: Column(
            children: [
              // Movie poster section
              CachedNetworkImage(
                imageUrl: movie.poster,
                width: double.infinity,
                height: 300,
                fit: BoxFit.cover,
                placeholder: (context, url) => Image.asset(
                  'assets/default.png',
                  height: 300,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
                errorWidget: (context, url, error) => Image.asset(
                  'assets/default.png',
                  height: 300,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),

              // Movie title and info
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      movie.title,
                      style:
                          Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          size: 16,
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withValues(alpha: 0.6),
                        ),
                        const SizedBox(width: 4),
                        Text(movie.year,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSurface
                                      .withOpacity(0.6),
                                )),
                        const SizedBox(width: 16),
                        Icon(Icons.star, size: 16, color: Colors.orange),
                        const SizedBox(width: 4),
                        Text(
                          movie.rated,
                          style:
                              Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context)
                                        .colorScheme
                                        .onSurface
                                        .withOpacity(0.6),
                                  ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Genres: ${movie.genres.join(", ")}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.6),
                          ),
                    ),
                  ],
                ),
              ),

              // Fast Segmented Control with cached data
              Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: SegmentedButton<String>(
                  segments: [
                    const ButtonSegment<String>(
                      value: 'details',
                      label: Text('Details'),
                    ),
                    ButtonSegment<String>(
                      value: 'comments',
                      label: Text('Comments ($_commentCount)'),
                    ),
                  ],
                  selected: _selectedView,
                  onSelectionChanged: (Set<String> newSelection) {
                    setState(() {
                      _selectedView = newSelection;
                      if (_selectedView.contains('comments')) {
                        _isEditMode =
                            false; // Exit edit mode when switching to comments
                      }
                    });
                  },
                ),
              ),

              // Fast Content switching with cached data
              Expanded(
                child: _selectedView.contains('details')
                    ? _buildDetailsView(movie)
                    : _buildCommentsViewCached(),
              ),
            ],
          ),
        );
      });

  Widget _buildDetailsView(Movie movie) {
    return SingleChildScrollView(
      key: const PageStorageKey('details_scroll'), // Maintain scroll position
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_isEditMode) ...[
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Title'),
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _yearController,
                decoration: const InputDecoration(labelText: 'Year'),
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _plotController,
                decoration: const InputDecoration(labelText: 'Plot'),
                maxLines: 3,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _posterController,
                decoration: const InputDecoration(labelText: 'Poster URL'),
                validator: (value) => null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _fullPlotController,
                decoration: const InputDecoration(labelText: 'Full Plot'),
                maxLines: 5,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _countriesController,
                decoration: const InputDecoration(
                  labelText: 'Countries (comma-separated)',
                ),
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Required' : null,
              ),
            ] else ...[
              Text(
                'Plot',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                movie.plot,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              Text(
                'Full Plot',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 8),
              Text(
                movie.fullplot,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: 16),
              Text(
                'Languages: ${movie.languages.join(", ")}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Released: ${movie.released.toString().split(" ")[0]}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Directors: ${movie.directors.join(", ")}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'IMDB Rating: ${movie.imdb['rating']} (${movie.imdb['votes']} votes)',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              if (movie.tomatoes.isNotEmpty)
                Text(
                  'Rotten Tomatoes: ${movie.tomatoes['viewer']?['rating'] ?? 'N/A'}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              const SizedBox(height: 8),
              Text(
                'Countries: ${movie.countries.join(", ")}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCommentsViewCached() {
    if (_cachedComments.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.comment_outlined,
              size: 48,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'No comments yet',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Be the first to add a comment!',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      key: const PageStorageKey('comments_list'), // Maintain scroll position
      padding: const EdgeInsets.all(16),
      itemCount: _cachedComments.length,
      itemBuilder: (context, index) {
        final comment = _cachedComments[index];
        return _buildCommentCard(context, comment);
      },
    );
  }

  Widget _buildCommentCard(BuildContext context, Comment comment) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  comment.displayName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  comment.formattedDate,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              comment.displayText,
              style: const TextStyle(
                fontSize: 14,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
