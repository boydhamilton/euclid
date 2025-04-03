import React from "react";
import LatexRenderer from "./components/LatexRenderer";

function App() {
  return (
    <div className="App">
      <h1 style={styles.title}>euclid</h1>
      <LatexRenderer />
    </div>
  );
}

const styles = {
  title: {
    fontSize : '2em',
    padding: '5px',
    marginLeft: '20px'
  }
};

export default App;