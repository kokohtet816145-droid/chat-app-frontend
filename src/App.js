import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <h1>Error caught!</h1>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <div>
        <h1>Test Error Boundary</h1>
        <p>If you see this, Error Boundary works.</p>
      </div>
    </ErrorBoundary>
  );
}

export default App;
