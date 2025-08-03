// Polyfill for findDOMNode to make React-Quill work with React 19

// Create a polyfill for ReactDOM.findDOMNode
if (typeof window !== 'undefined') {
  // Import ReactDOM dynamically
  import('react-dom').then((ReactDOM) => {
    // Add findDOMNode polyfill if it doesn't exist
    if (!(ReactDOM as any).findDOMNode) {
      (ReactDOM as any).findDOMNode = (instance: any) => {
        // For React 19, try to get the DOM node from the instance
        if (instance?._reactInternalFiber?.stateNode) {
          return instance._reactInternalFiber.stateNode;
        }
        if (instance?.stateNode) {
          return instance.stateNode;
        }
        if (instance instanceof Element) {
          return instance;
        }
        // Fallback: return null to prevent crashes
        console.warn('findDOMNode polyfill: Could not find DOM node, returning null');
        return null;
      };
    }
    
    // Make ReactDOM available globally for React-Quill
    (window as any).ReactDOM = ReactDOM;
  });
}

export default {};
