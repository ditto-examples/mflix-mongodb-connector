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

  testWidgets('shows the failure reason when Ditto cannot start',
      (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: MoviesErrorView(message: 'invalid database id'),
      ),
    );

    expect(find.text('Could not start Ditto'), findsOneWidget);
    expect(find.text('invalid database id'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(
      find.textContaining('.env'),
      findsOneWidget,
      reason: 'the error should point at the configuration to fix',
    );
  });
}
