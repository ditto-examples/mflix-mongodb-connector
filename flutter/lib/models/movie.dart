class Movie {
  final String id;
  final String title;
  final String plot;
  final List<String> genres;
  final int runtime;
  final List<String> cast;
  final String poster;
  final String fullplot;
  final List<String> languages;
  final DateTime released;
  final List<String> directors;
  final String rated;
  final Map<String, dynamic> awards;
  final String year;
  final Map<String, dynamic> imdb;
  final Map<String, dynamic> tomatoes;
  final List<String> countries;

  Movie({
    required this.id,
    required this.title,
    required this.plot,
    required this.genres,
    required this.runtime,
    required this.cast,
    required this.poster,
    required this.fullplot,
    required this.languages,
    required this.released,
    required this.directors,
    required this.rated,
    required this.awards,
    required this.year,
    required this.imdb,
    required this.tomatoes,
    required this.countries,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    return Movie(
      id: json['_id'],
      title: json['title'] ?? '',
      plot: json['plot'] ?? '',
      genres: List<String>.from(json['genres'] ?? []),
      runtime: json['runtime'] ?? 0,
      cast: List<String>.from(json['cast'] ?? []),
      poster: json['poster'] ?? '',
      fullplot: json['fullplot'] ?? '',
      languages: List<String>.from(json['languages'] ?? []),
      released:
          DateTime.parse(json['released'] ?? DateTime.now().toIso8601String()),
      directors: List<String>.from(json['directors'] ?? []),
      rated: json['rated'] ?? '',
      awards: json['awards'] ?? {},
      year: json['year']?.toString() ?? '',
      imdb: json['imdb'] ?? {},
      tomatoes: json['tomatoes'] ?? {},
      countries: List<String>.from(json['countries'] ?? []),
    );
  }
}
