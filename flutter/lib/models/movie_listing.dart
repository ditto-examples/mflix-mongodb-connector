class MovieListing {
  final String id;
  final String plot;
  final String poster;
  final String title;
  final String year;
  final double? imdbRating;
  final double? rottenRating;

  MovieListing({
    required this.id,
    required this.plot,
    required this.poster,
    required this.title,
    required this.year,
    this.imdbRating,
    this.rottenRating,
  });

  factory MovieListing.fromJson(Map<String, dynamic> json) {
    return MovieListing(
      id: json['_id'] ?? '',
      plot: json['plot'] ?? '',
      poster: json['poster'] ?? '',
      title: json['title'] ?? '',
      year: json['year']?.toString() ?? '',
      imdbRating: json['imdbRating']?.toDouble(),
      rottenRating: json['rottenRating']?.toDouble(),
    );
  }

  String get displayYear => year;
  
  String get displayPlot => plot;
  
  String get displayTitle => title;
  
  bool get hasPoster => poster.isNotEmpty;
  
  bool get hasImdbRating => imdbRating != null;
  
  bool get hasRottenRating => rottenRating != null;
  
  bool get hasRatings => hasImdbRating || hasRottenRating;
  
  String get ratingsDisplay {
    final ratings = <String>[];
    
    if (hasImdbRating) {
      ratings.add('IMDB: ${imdbRating!.toStringAsFixed(1)}');
    }
    
    if (hasRottenRating) {
      ratings.add('Rotten Tomatoes: ${rottenRating!.toStringAsFixed(1)}');
    }
    
    return ratings.join(' ');
  }
}