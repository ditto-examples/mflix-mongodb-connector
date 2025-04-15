import 'package:flutter/material.dart';
import '../providers/ditto_provider.dart';

class AddMovieScreen extends StatefulWidget {
  final DittoProvider dittoProvider;

  const AddMovieScreen({
    super.key,
    required this.dittoProvider,
  });

  @override
  State<AddMovieScreen> createState() => _AddMovieScreenState();
}

class _AddMovieScreenState extends State<AddMovieScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _plotController = TextEditingController();
  final _posterController = TextEditingController();
  final _fullplotController = TextEditingController();
  final _yearController = TextEditingController();
  final _countriesController = TextEditingController();
  bool _isLoading = false;

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
        content: Text('Failed to add movie: $errorMessage'),
        action: SnackBarAction(
          label: 'Show Details',
          onPressed: () {
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Error Details'),
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

  Future<void> _saveMovie() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      if (widget.dittoProvider.ditto != null) {
        var ditto = widget.dittoProvider.ditto!;

        final countries = _countriesController.text
            .split(',')
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();

        String insertQuery ="INSERT INTO movies DOCUMENTS (:newMovie)";
        var args = {
          'newMovie': {
            'title': _titleController.text,
            'year': _yearController.text,
            'plot': _plotController.text,
            'poster':
                _posterController.text.isEmpty ? '' : _posterController.text,
            'fullplot': _fullplotController.text,
            'countries': countries,
            'rated': 'G',
            'genres': ['Animation', 'Family'],
            'runtime': 0,
            'cast': [],
            'languages': ['English'],
            'released': DateTime.now().toIso8601String(),
            'directors': [],
            'awards': {},
            'imdb': {},
            'tomatoes': {}
          }
        };

        try {
          var result = await ditto.store.execute(insertQuery, arguments: args);
          if (!mounted) return;

          if (result.mutatedDocumentIDs.isNotEmpty) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Movie added successfully'),
                duration: Duration(seconds: 3),
                behavior: SnackBarBehavior.floating,
              ),
            );
            Navigator.pop(context);
          } else {
            _showErrorSnackBar(
                'Unknown error - no documents were inserted', insertQuery);
          }
        } catch (e) {
          _showErrorSnackBar(e.toString(), insertQuery);
        }
      }

      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add New Movie'),
        actions: [
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: CircularProgressIndicator(),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.save),
              onPressed: _saveMovie,
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(
                  labelText: 'Title',
                  border: OutlineInputBorder(),
                ),
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Title is required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _yearController,
                decoration: const InputDecoration(
                  labelText: 'Year',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Year is required';
                  }
                  final year = int.tryParse(value!);
                  if (year == null) {
                    return 'Please enter a valid year';
                  }
                  if (year < 1900 || year > DateTime.now().year) {
                    return 'Please enter a year between 1900 and ${DateTime.now().year}';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _plotController,
                decoration: const InputDecoration(
                  labelText: 'Plot',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Plot is required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _posterController,
                decoration: const InputDecoration(
                  labelText: 'Poster URL',
                  border: OutlineInputBorder(),
                ),
                validator: (value) => null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _fullplotController,
                decoration: const InputDecoration(
                  labelText: 'Full Plot',
                  border: OutlineInputBorder(),
                ),
                maxLines: 5,
                validator: (value) =>
                    value?.isEmpty ?? true ? 'Full plot is required' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _countriesController,
                decoration: const InputDecoration(
                  labelText: 'Countries (comma-separated)',
                  border: OutlineInputBorder(),
                  hintText: 'USA, UK, France',
                ),
                validator: (value) => value?.isEmpty ?? true
                    ? 'At least one country is required'
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
