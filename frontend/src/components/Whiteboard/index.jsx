import { useEffect, useLayoutEffect, useState } from "react";
import rough from "roughjs";


const roughGenerator = rough.generator();

const WhiteBoard = ({ canvasRef, ctxRef, elements, setElements, tool, color, user, socket }) => {

  const [img, setImg] = useState(null); 

  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imageURL);
    });
  },[])



  if(!user?.presenter){
    return (
      <div
      className="border border-dark border-3 h-100 w-100 overflow-hidden"
    >
    <img src={img} 
    alt="Real time WhiteBoard image shared by presenter" 
    // className="w-100 h-100"
    style={{
      height: window.innerHeight * 2,
      width: "285%",
    }}
    />

    </div>
    );
  }


  const [isDrawing, setIsDrawing] = useState(false);


  useEffect(()=>{
    const canvas = canvasRef.current;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctxRef.current = ctx;
  }, []);


  useEffect(() => {
    ctxRef.current.strokeStyle = color;
  }, [color]);


  useLayoutEffect(()=>{
    if(canvasRef){
    const roughCanvas = rough.canvas(canvasRef.current);
    
    if (elements.length > 0) {
      ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
    
    elements.forEach((element) => {
      if (element.type === "pencil") {
      roughCanvas.linearPath(element.path, {
        stroke: element.stroke,
        roughness: 0,
        strokeWidth: 5,
      }
    );
      }
      else if(element.type === "line"){
        roughCanvas.draw(
        roughGenerator.line(element.offsetX, element.offsetY, element.width, element.height, 
          {
            stroke: element.stroke,
            roughness: 0,
            strokeWidth: 5,
          }
        )
        );
      }
      else if(element.type === "rect"){
        roughCanvas.draw(
          roughGenerator.rectangle(element.offsetX, element.offsetY, element.width, element.height ,
            {
              stroke: element.stroke,
              roughness: 0,
              strokeWidth: 5,
            }
          )
        )
      }
    });

    const canvasImage = canvasRef.current.toDataURL();
    socket.emit("whiteboardData", canvasImage);

  }
  },[elements])




  const handleMouseDown = (e) => {
    // console.log("Mouse down", e);
    const { offsetX, offsetY } = e.nativeEvent;
    // console.log(offsetX, offsetY)

    if (tool === "pencil") {
    setElements((prevElements) => [
      ...prevElements,
      {
        type: "pencil",
        offsetX,
        offsetY,
        path: [[offsetX, offsetY]],
        stroke: color,
      },
    ]);
  }

  else if (tool === "line"){
    setElements((prevElements) => [
      ...prevElements,
      {
        type: "line",
        offsetX,
        offsetY,
        width: offsetX,
        height: offsetY,
        stroke: color,
      },
    ]);
  }

  else if(tool === "rect"){
    setElements((prevElements) => [
      ...prevElements,
      {
        type: "rect",
        offsetX,
        offsetY,
        width: offsetX,
        height: offsetY,
        stroke: color,
      },
    ]);
  }

    setIsDrawing(true);
  }

  const handleMouseMove = (e) => {
    // console.log("Mouse move", e);
    const { offsetX, offsetY } = e.nativeEvent;

    if (isDrawing) {
    // console.log(offsetX, offsetY)

    //pencil ny default
    if (tool === "pencil") {
    const {path} = elements[elements.length - 1];
    const newPath = [ ...path, [offsetX,offsetY]];

    
    setElements((prevElements) => 
      prevElements.map((ele, index) => {
        if(index === elements.length - 1){
          return{
            ...ele,
            path: newPath,
          };
        } else {
          return ele;
        }
      })
    );
  }
  else if (tool === "line") {
    setElements((prevElements) => 
      prevElements.map((ele, index) => {
        if(index === elements.length - 1){
          return{
            ...ele,
            width: offsetX,
            height: offsetY,
          };
        } else {
          return ele;
        }
      })
    );
  }
  else if (tool === "rect"){
    setElements((prevElements) => 
      prevElements.map((ele, index) => {
        if(index === elements.length - 1){
          return{
            ...ele,
            width: offsetX - ele.offsetX,
            height: offsetY - ele.offsetY,
          };
        } else {
          return ele;
        }
      })
    );
  }
    }
  };

  const handleMouseUP = (e) => {
    // console.log("Mouse Up", e);
    setIsDrawing(false);
  }





  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUP}
      className="border border-dark border-3 h-100 w-100 overflow-hidden"
    >
    <canvas ref={canvasRef}/>
    </div>


  )
}

export default WhiteBoard