

import React, { useState, useEffect, useCallback, useRef } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import { evaluateLatexExpression } from "./LatexInterpreter";

const LatexRenderer = () => {
  const [latexLines, setLatexLines] = useState([""]);
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [animatedText, setAnimatedText] = useState("");


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
      if (e.key === "Backspace") {
        setLatexLines((prev) => {
          let newLines = [...prev];
          if (newLines[newLines.length - 1].length > 0) {
            newLines[newLines.length - 1] = newLines[newLines.length - 1].slice(0, -1);
          } else if (newLines.length > 1) {
            newLines.pop();
            setEvaluationResults((prevResults) => prevResults.slice(0, -1));
          }
          evaluateLineAtIndex(newLines.length - 1, newLines[newLines.length - 1]);
          return newLines;
        });
        return;
      }
    
      if (e.key === "Enter") {
        setLatexLines((prev) => {
          const newLines = [...prev, ""];
          setEvaluationResults((prevResults) => [...prevResults, ""]);
          return newLines;
        });
        return;
      }
    
      if (!/^[a-zA-Z0-9\\{}.,&|_^+\-*/=()\[\] ]$/.test(e.key)) return;
    
      setLatexLines((prev) => {
        let newLines = [...prev];
        newLines[newLines.length - 1] += e.key;
        evaluateLineAtIndex(newLines.length - 1, newLines[newLines.length - 1]);
        return newLines;
      });
    };
    

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [evaluateLineAtIndex]);

  return (
    <div style={styles.container}>

      {latexLines.length < 1 || (latexLines.length === 1 && latexLines[0] === "") ? (
        <div style={styles.lineContainer}>
          <div style={styles.latexContainer}>
            <p>{animatedText}</p>
          </div>
        </div>
      ) : (
        latexLines.map((line, index) => (
          <div key={index} style={styles.lineContainer}>
            <div style={styles.latexContainer}>
              <BlockMath math={line} />
            </div>
  
            {evaluationResults[index] !== "" && 
            evaluationResults[index] !== null && 
            evaluationResults[index] !== undefined && (
              <div style={styles.resultDisplay}>{evaluationResults[index]}</div>
            )}
          </div>
        ))
      )}
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