import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants';

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Coś poszło nie tak</Text>
          <Text style={styles.message}>Spróbuj ponownie uruchomić aplikację.</Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Spróbuj ponownie"
          >
            <Text style={styles.buttonText}>SPRÓBUJ PONOWNIE</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: FONT_SIZE.h2,
    fontWeight: FONT_WEIGHT.black,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: FONT_SIZE.body,
    color: COLORS.disabled,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
});
