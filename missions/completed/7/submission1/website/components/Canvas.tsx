import { useEffect, useRef, useState } from "react";
import Menu from "./Menu";

function Canvas({ size, typeIndex }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [lineColor, setLineColor] = useState("black");
  const [lineOpacity, setLineOpacity] = useState(1);

  // Initialization when the component
  // mounts for the first time
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "square";
    ctx.lineJoin = "square";
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;
  }, [lineColor, lineOpacity, lineWidth]);

  // Function for starting the drawing
  const startDrawing = (e) => {
    ctxRef.current.beginPath();
    // ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.fillRect(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY,
      10,
      10
    ); // Fill by rect shape using coords

    setIsDrawing(true);
  };

  // Function for ending the drawing
  const endDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) {
      return;
    }
    // ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.fillRect(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY,
      10,
      10
    ); // Fill by rect shape using coords
    ctxRef.current.fillStyle = lineColor;
    ctxRef.current.stroke();
  };

  return (
    <div className="p-5 rounded-lg bg-gray-700/30">
      <div className="draw-area">
        <Menu
          setLineColor={setLineColor}
          setLineWidth={setLineWidth}
          setLineOpacity={setLineOpacity}
          typeIndex={typeIndex}
          canvasRef={canvasRef.current}
        />
        <p>Canvas Board</p>
        <canvas
          className="border-2 border-gray-600 rounded-lg"
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseMove={draw}
          ref={canvasRef}
          width={size.width}
          height={size.height}
        />
      </div>
    </div>
  );
}

export default Canvas;
