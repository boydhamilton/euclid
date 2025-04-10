import React, { useState, useEffect, useCallback } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { evaluateLatexExpression } from "./LatexInterpreter";

const LatexRenderer = () => {
  const [latexLines, setLatexLines] = useState([""]);
  const [evaluationResults, setEvaluationResults] = useState([]);

  const evaluateExpressions = useCallback((lines) => {
    const results = lines.map((line) => {
      try {
        if (!line.trim()) return "";
        const result = evaluateLatexExpression(line);
        if (result === "" || result === undefined) return "";
        return `= ${result.toFixed(9)}`;
      } catch (error) {
        return "";
      }
    });
    setEvaluationResults(results);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Backspace") {
        setLatexLines((prev) => {
          let newLines = [...prev];
          if (newLines[newLines.length - 1].length > 0) {
            newLines[newLines.length - 1] = newLines[newLines.length - 1].slice(0, -1);
          } else if (newLines.length > 1) {
            newLines.pop();
          }
          evaluateExpressions(newLines);
          return newLines;
        });
        return;
      }

      if (e.key === "Enter") {
        setLatexLines((prev) => [...prev, ""]);
        return;
      }

      if (!/^[a-zA-Z0-9\\{}._^+\-*/=()\[\] ]$/.test(e.key)) return;

      setLatexLines((prev) => {
        let newLines = [...prev];
        newLines[newLines.length - 1] += e.key;
        evaluateExpressions(newLines);
        return newLines;
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [evaluateExpressions]);

  return (
    <div style={styles.container}>
      {latexLines.map((line, index) => (
        <div key={index} style={styles.lineContainer}>
          <div style={styles.latexContainer}>
            <BlockMath math={line} />
          </div>

          {evaluationResults[index] !== "" && 
          evaluationResults[index] !== null && 
          evaluationResults[index] !== undefined &&(
            <div style={styles.resultDisplay}>{evaluationResults[index]}</div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#fff",
  },
  lineContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "600px",
    marginBottom: "10px",
  },
  latexContainer: {
    paddingBottom: "5px",
    borderBottom: "2px solid #d3d3d3",
  },
  resultDisplay: {
    fontSize: "1.2em",
    padding: "8px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    marginLeft: "20px",
  },
};

export default LatexRenderer;