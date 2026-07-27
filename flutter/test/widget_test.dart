import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:mflix_app/main.dart';

void main() {
  testWidgets('shows the initial loading state', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: MoviesLoadingView()),
    );

    expect(find.text('Kid Movies'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(
      find.text(
        'Trying to retrieve data - if this is first data sync this can take a while',
      ),
      findsOneWidget,
    );
  });
}
