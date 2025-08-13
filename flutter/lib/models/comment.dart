class Comment {
  final String id;
  final String name;
  final String email;
  final String movieId;
  final String text;
  final DateTime date;

  Comment({
    required this.id,
    required this.name,
    required this.email,
    required this.movieId,
    required this.text,
    required this.date,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: _extractId(json['_id']),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      movieId: _extractId(json['movie_id']),
      text: json['text'] ?? '',
      date: _parseDate(json['date']),
    );
  }

  static String _extractId(dynamic id) {
    if (id is String) return id;
    if (id is Map<String, dynamic> && id.containsKey('\$oid')) {
      return id['\$oid'] as String;
    }
    return id?.toString() ?? '';
  }

  static DateTime _parseDate(dynamic date) {
    if (date is String) {
      return DateTime.tryParse(date) ?? DateTime.now();
    }
    if (date is Map<String, dynamic> && date.containsKey('\$date')) {
      final dateInfo = date['\$date'];
      if (dateInfo is Map<String, dynamic> && dateInfo.containsKey('\$numberLong')) {
        final timestamp = int.tryParse(dateInfo['\$numberLong']) ?? 0;
        return DateTime.fromMillisecondsSinceEpoch(timestamp);
      }
    }
    if (date is int) {
      return DateTime.fromMillisecondsSinceEpoch(date);
    }
    return DateTime.now();
  }

  String get displayName => name.isNotEmpty ? name : 'Anonymous';
  
  String get formattedDate {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()} year${difference.inDays > 365 * 2 ? 's' : ''} ago';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} month${difference.inDays > 60 ? 's' : ''} ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
    } else {
      return 'Just now';
    }
  }
  
  String get displayText => text;
  
  bool get hasValidMovieId => movieId.isNotEmpty;
  
  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'email': email,
      'movie_id': movieId,
      'text': text,
      'date': date.millisecondsSinceEpoch,
    };
  }
}