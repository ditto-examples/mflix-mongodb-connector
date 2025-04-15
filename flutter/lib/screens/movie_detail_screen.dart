import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:mflix_app/providers/ditto_provider.dart';
import 'package:mflix_app/widgets/collection_item_builder.dart';
import 'package:mflix_app/models/movie.dart';
import 'package:flutter/foundation.dart';

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
  final _fullplotController = TextEditingController();
  final _yearController = TextEditingController();
  final _countriesController = TextEditingController();
  late bool _isEditMode;
  DittoProvider? _dittoProvider;
  int _rebuildKey = 0;

  @override
  void initState() {
    super.initState();
    _isEditMode = widget.isEditMode;
    setState(() => _dittoProvider = widget.dittoProvider);
  }

  @override
  void dispose() {
    _titleController.dispose();
    _plotController.dispose();
    _posterController.dispose();
    _fullplotController.dispose();
    _yearController.dispose();
    _countriesController.dispose();
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
        if (_fullplotController.text != movie.fullplot) {
          updates.add("fullplot = '${_fullplotController.text}'");
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
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Movie updated successfully'),
                  duration: Duration(seconds: 3),
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
    _fullplotController.text = movie.fullplot;
    _yearController.text = movie.year;
    _countriesController.text = movie.countries.join(", ");
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
      builder: (context, result) {
        if (result.items.isEmpty) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('Movie Not Found'),
            ),
            body: const Center(
              child: Text('Movie not found'),
            ),
          );
        }

        final movie =
            result.items.map((r) => r.value).map(Movie.fromJson).first;

        if (!_isEditMode) {
          _initializeControllers(movie);
        }

        return Scaffold(
          appBar: AppBar(
            title: Text(movie.title),
            actions: [
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
          ),
          body: SafeArea(
            bottom: true,
            child: SingleChildScrollView(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).padding.bottom + 16,
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CachedNetworkImage(
                      imageUrl: movie.poster,
                      width: double.infinity,
                      height: 600,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(),
                      ),
                      errorWidget: (context, url, error) => Image.asset(
                        'assets/default.png',
                        height: 600,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_isEditMode) ...[
                            TextFormField(
                              controller: _titleController,
                              decoration:
                                  const InputDecoration(labelText: 'Title'),
                              validator: (value) =>
                                  value?.isEmpty ?? true ? 'Required' : null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _yearController,
                              decoration:
                                  const InputDecoration(labelText: 'Year'),
                              validator: (value) =>
                                  value?.isEmpty ?? true ? 'Required' : null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _plotController,
                              decoration:
                                  const InputDecoration(labelText: 'Plot'),
                              maxLines: 3,
                              validator: (value) =>
                                  value?.isEmpty ?? true ? 'Required' : null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _posterController,
                              decoration: const InputDecoration(
                                  labelText: 'Poster URL'),
                              validator: (value) => null,
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _fullplotController,
                              decoration:
                                  const InputDecoration(labelText: 'Full Plot'),
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
                              movie.title,
                              style: Theme.of(context).textTheme.headlineMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Year: ${movie.year}',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Rated: ${movie.rated}',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Genres: ${movie.genres.join(", ")}',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Plot:',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              movie.plot,
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Full Plot:',
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
                  ],
                ),
              ),
            ),
          ),
        );
      });
}
