

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { evaluateLatexExpression } from "./LatexInterpreter";

const LatexRenderer = () => {
  const [latexLines, setLatexLines] = useState([""]);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [animatedText, setAnimatedText] = useState("");
  const [activeLineIndex, setActiveLineIndex] = useState(0);


  const isTypingRef = useRef(false);

  const evaluateLineAtIndex = useCallback((index, line) => {
    try {
      if (!line.trim()) {
        setEvaluationResults((prev) => {
          const newResults = [...prev];
          newResults[index] = "";
          return newResults;
        });
        return;
      }
  
      const result = evaluateLatexExpression(line);
      setEvaluationResults((prev) => {
        const newResults = [...prev];
        newResults[index] = result === "" || result === undefined ? "" : `= ${result}`;
        return newResults;
      });
    } catch (error) {
      // Optional: log or show error message
      setEvaluationResults((prev) => {
        const newResults = [...prev];
        newResults[index] = "";
        return newResults;
      });
    }
  }, []);
  
  // tutorial
  useEffect(() => {
    const allLinesEmpty = latexLines.length === 0 || (latexLines.length === 1 && latexLines[0].trim() === "");
    if (!allLinesEmpty || isTypingRef.current) return;

    var i = 0;
    const library = [' \\sum_{i=0}^{10} \\sqrt{i}', ' \\prod_{j=2}^{8} j \\cdot \\sin(j)', ' \\int_{0}^{9} e^{x} * x^{2} dx', ' \\frac{d}{dx}|_{x=0}\\sin(x)', 
      ' \\frac{d}{dx} 2x+1'];
    const randomIndex = Math.floor(Math.random() * library.length);
    const txt = " "+library[randomIndex]; 
    var speed = 40; 

    setAnimatedText("");

    isTypingRef.current = true;
    function typeWriter() {
      if (i < txt.length) {
        setAnimatedText((prev) => prev + txt.charAt(i));
        i++;
        setTimeout(typeWriter, speed);
      }else{
        isTypingRef.current = false;
      }
    }

    typeWriter();

  }, [latexLines]);

  useEffect(() => {
    const handleKeyPress = (e) => {

      setLatexLines((prev) => {
        let newLines = [...prev];
        let current = activeLineIndex;
  
        if (e.key === "Backspace") {
          if (newLines[current].length > 0) {
            newLines[current] = newLines[current].slice(0, -1);
          } else if (newLines.length > 1) {
            newLines.splice(current, 1);
            setEvaluationResults((prevResults) => {
              const updated = [...prevResults];
              updated.splice(current, 1);
              return updated;
            });
            setActiveLineIndex((i) => Math.max(0, i - 1));
            return newLines;
          }
  
          evaluateLineAtIndex(current, newLines[current]);
          return newLines;
        }
  
        if (e.key === "Enter") {
          newLines.splice(current + 1, 0, "");
          setEvaluationResults((prevResults) => {
            const updated = [...prevResults];
            updated.splice(current + 1, 0, "");
            return updated;
          });
          setActiveLineIndex(current + 1);
          return newLines;
        }
  
        if (!/^[a-zA-Z0-9\\{}.,<>!&|_^+\-*/=()\[\] ]$/.test(e.key)) return newLines;
  
        newLines[current] += e.key;
        evaluateLineAtIndex(current, newLines[current]);
        return newLines;
      });
    };
  
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [activeLineIndex, evaluateLineAtIndex]);
  

  return (
    <div style={styles.container}>
      {latexLines.length < 1 || (latexLines.length === 1 && latexLines[0] === "") ? (
        <div style={styles.lineContainer}>
          <div style={styles.animatedText}>
            <p>{animatedText}</p>
          </div>
        </div>
      ) : latexLines.map((line, index) => (
        <div key={index}
          onClick={() => setActiveLineIndex(index)}
          style={{
            ...styles.lineContainer,
            backgroundColor: index === activeLineIndex ? "#eef" : "transparent",
            
          }}
        >
          <div style={{
            ...styles.latexWithCursor,
            paddingBottom: "5px",
            borderBottom: "2px solid #d3d3d3",}
            }>
            <BlockMath math={line} />
          </div>
          {evaluationResults[index] && (
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
  resultDisplay: {
    fontSize: "1.2em",
    padding: "8px",
    border: "1px solid #000",
    backgroundColor: "#fff",
    marginLeft: "20px",
  },
  latexWithCursor: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  animatedText: {
    fontSize: "1.1em",
    color: "#b84242",
    padding: "8px",
  },
};

export default LatexRenderer;