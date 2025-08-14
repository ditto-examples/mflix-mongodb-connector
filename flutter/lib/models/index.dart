class Index {
  final String id;
  final String collection;
  final List<String> fields;

  Index({
    required this.id,
    required this.collection,
    required this.fields,
  });

  factory Index.fromJson(Map<String, dynamic> json) {
    return Index(
      id: json['_id'] ?? '',
      collection: json['collection'] ?? '',
      fields: List<String>.from(json['fields'] ?? []),
    );
  }

  String get displayName => id;
  
  String get fieldsDisplay => fields.join(', ');
  
  bool get hasFields => fields.isNotEmpty;
}