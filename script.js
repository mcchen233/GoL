const { useState, useRef, useEffect } = React;

const createGrid = (columns, rows, random = false) => {
  const grid = Array(columns).
    fill().
    map((d, column) =>
      Array(rows).
        fill().
        map((d, row) => ({
          column,
          row,
          isAlive: random ? Math.random() > 0.75 : false
        })));
  // describe the structure of the grid and the 1 dimensional array detailing the individual cells
  const cells = grid.reduce((acc, curr) => [...acc, ...curr], []);
  return {
    columns,
    rows,
    cells
  };
};

// RLE format
const patterns = {
  Glider: { x: 3, y: 3, code: 'bob$2bo$3o!' },
  Cross: { x: 8, y: 8, code: '2b4o2b$2bo2bo2b$3o2b3o$o6bo$o6bo$3o2b3o$2bo2bo2b$2b4o!' },
  "Gosper glider gun": { x: 36, y: 9, code: '24bo$22bobo$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o$2o8bo3bob2o4bobo$10bo5bo7bo$11bo3bo$12b2o!' },
  Ants: { x: 44, y: 4, code: '2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o2b$2b2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o$2b2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o$2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o3b2o!' },
  traffic: { x: 48, y: 48, code: '21b2o4b2o19b$21bobo2bobo19b$23bo2bo21b$22b2o2b2o20b$21b3o2b3o19b$23bo2bo21b$31bo16b$30bob2o14b$34bo13b$26bo3bo2bobo12b$26bo5bo2bo12b$26bo6b2o13b$9b2o37b$8bo2bo10b3o3b3o17b$7bobobo36b$6b3obo15bo21b$6b3o17bo21b$26bo21b$12b3o33b$2o2bo16b3o24b$o2b2o5bo5bo31b$b5o4bo5bo2bo5bo17bo2b2o$10bo5bo2bo5bo17b2o2bo$19bo5bo7b3o6b5ob$b5o6b3o33b$o2b2o16b3o7bo5bo10b$2o2bo26bo5bo4b5ob$31bo5bo5b2o2bo$43bo2b2o$33b3o12b$39b2o7b$38b3o7b$37bob2o7b$36bobo9b$20b3o13bo2bo8b$37b2o9b$13b2o4bo2bo25b$12bo2bo32b$12bobobo31b$13bo2bo31b$17bo30b$14bobo31b$21bo2bo23b$19b3o2b3o21b$20b2o2b2o22b$21bo2bo23b$19bobo2bobo21b$19b2o4b2o!' },
  SCM: { x: 59, y: 46, code: '59b$38bo20b$10bo27bo20b$12b2obo20b4o19b$11b4o23bobobo6bo7bob$11b2obobo4b2o16b3o3bo3bo5bo3b$12b2obo3b6o12bobob2o3bob4o3bobob$3bo8bobob5obo14bob4o2b3obo4b3o2b$4bobo3b3ob2ob2o2b3o5b2obob2o4bo2b3o2bo5b2o3b$3b3o6b2ob2o6b2obo6b4o2bo3b2o2b3o3b3o2bo$2bob2obo5bob2obo7bo2b4o2bob2o3b2obob2obo2b3obob$6bo4bob3o2b5o2bob4ob4o2bo3b5ob5o3b3o$6b2o2bo2b3o5bobo3b3o2bo2bo4bo2b2o2bo3bobo2b3o$4bob2o4bo4b2o3b5o4b3o4b2o2b2o2b2o2bo6bob$5b2o8b2ob2ob2o2b2o2b2obobob3obo2b2ob3o8bob$6bobo3bobo2bo2bobo4b5obo2bobobo3b2ob2obo8b$5bobo2bo2b2o4b2ob3obobob2o2bo2bobob2o3bobo10b$3b5obo2bob2ob3o3bob3o2b2obobo2bo3b2ob4o10b$5b3o3bo2bo8b2obo4bo5bobo4bo4b2obo6b$6bo2bob2o2b2o3bob2o3b3o3b2o2bobo2b2o5b3o2bo4b$6b3ob2o5bobo2bobobobo3bo2bo6b2ob3obob2obo4b$4bob3obob2o3b2o4bob2o2b4o2b3obo2bo2b2o2b2ob4o3b$6b3o2bob2o4b3o3bo2b2obo3b3obobo6bob2o2bobobo$5bobo2bobo3b2o3bo7bobo2bo2b3obob2o4bobo3b3ob$9bo4bo6b2o2b2obobobobo6b2obo11bo2b$8bo2b5obo2b2o5b3obob2o2b4obobobob2o4bob2ob$7b2o4bo2bo2b2o3b3o3bo2bo3b2o2bobo5b3o4b2ob$8bo6bo4bo3b3ob3o2bo2b2o4bo2bobo3b5ob2o$7bo4bo3b3o2bobo5bo3b3ob2o2bo3bo3bo2bob5o$8bo3b3o5b2o4bo2b2o7bob2obobo2b2o2b2o3bob$8b2o3bo2bobob9obo5bo2bob2ob2o2bo3b3o3bo$12bo3bo5bo2bo3bo2bo4b2obo3bo2bo2bob3o4b$6bo2b2obo2b2o4b2o3bobob4obobo6b2o3bo3b3o3b$7b2obobo2b2o2bo3bob2o3bo3bo2bo2bobobobo2bo3b2obo2b$12b2obob2o2bo2b2o2bo2b2o2bo2bo3b2o6b2obo5b$4bo4bo5bo2bo3bo2bob2o2bobo2bo4bo3bo4b6o3b$6b5obo2bo4b2obo2b3obo3b2obob2o3bobo4bobo5b$5b4o2b2o5b2o3b3o6bob2o4bob2ob4o2b2o6b$5b2o5bobo3bobo8bobo2b2o3bob3o3b5o7b$3b2o6b2o4b2o2bobobob3o3b2o10b2o2b2obo6b$b4o6b2o4b2o10b4obo8b4o12b$3bo8b2o2b2o12bob5o8bo13b$4bo7b5obo11bo2bob4o7bo12b$13bobo16bo3bo22b$12bo3bobo17bo22b$59b!' }
};

// function retrieving the string value for each pattern
const getPatterns = () => Object.keys(patterns);

// function returning the grid for the input pattern which will be set center in the box grid
const getPattern = (key, boxCols, boxRows) => {
  const pattern = patterns[key];
  let columns = pattern.x;
  let rows = pattern.y;

  const strings = pattern.code.split("$");
  const decoded = [];
  for (let i = 0; i < strings.length; i++) {
    var decodedRow = new String();
    for (let j = 0; j < strings[i].length; j++) {
      if (strings[i][j] === 'b' || strings[i][j] === 'o') {
        decodedRow = decodedRow + strings[i][j];
      } else if (strings[i][j] === '!') {
        decodedRow = decodedRow + "b".repeat(columns - decodedRow.length);
      }
      else {
        var repeat = parseInt(strings[i].substring(j));
        if (j + String(repeat).length < strings[i].length) {
          decodedRow = decodedRow + strings[i][j + String(repeat).length].repeat(repeat);
        }
        else {
          let temp = (strings[i][j - 1] === "o") ? "b" : "o";
          decodedRow = decodedRow + temp.repeat(repeat);
        }
        j = j + String(repeat).length;
      }
    }
    if (decodedRow.length < columns) {
      decodedRow = decodedRow + "b".repeat(columns - decodedRow.length);
    }
    decoded.push(decodedRow);
  }
  for (let i = strings.length; i < rows; i++) {
    decoded.push("b".repeat(columns));
  }

  var translate = [Math.floor((boxCols - columns) / 2), Math.floor((boxRows - rows) / 2)];

  const grid = Array(boxCols).
    fill().
    map((d, column) =>
      Array(boxRows).
        fill().
        map((d, row) => ({
          column,
          row,
          isAlive: (column - translate[0] >= 0 && column - translate[0] < columns && row - translate[1] >= 0 && row - translate[1] < rows) ? decoded[row - translate[1]][column - translate[0]] === 'o' : false
        })));
  const cells = grid.reduce((acc, curr) => [...acc, ...curr], []);

  return {
    columns,
    rows,
    cells
  };
};


function App() {

  const { columns, rows, cells: initialCells } = createGrid(60, 60);
  const patterns = getPatterns();
  const [cells, setCells] = useState(initialCells);
  const [gen, setGen] = useState(0); //number of generations


  const [isAnimating, setIsAnimating] = useState(false);
  const toggleAnimation = () => setIsAnimating(!isAnimating);

  const [isDraging, setIsDraging] = useState(false);
  const [requestID, setRequestID] = useState(null);
  const [timeoutID, setTimeoutID] = useState(null);

  const originSize = 10; //grid minimal size
  const [size, setSize] = useState(originSize);

  const [{ translateX, translateY }, setTranslate] = useState({ translateX: 0, translateY: 0 });
  const [{ translateXO, translateYO }, setTranslateO] = useState({ translateXO: 0, translateYO: 0 });
  const [{ clientX, clientY }, setClient] = useState({ clientX: 0, clientY: 0 });

  const svgRef = useRef();
  const svgStyle = {
    width: columns * originSize,
    height: rows * originSize
  };


  const speed = useRef(7); //generation speed

  function updateSpeed(event) {
    speed.current = event.target.value;
    if (isAnimating) {
      clearTimeout(timeoutID);
      cancelAnimationFrame(requestID);
      animateCells();
    }
  };

  // function updating the cells by moving 1 generation onward
  function updateCells() {
    setGen(gen => gen + 1);
    // update the boolean isAlive according to the existing neighbors and the previous state
    setCells(previousCells => previousCells.map(({ column, row, isAlive }, index, array) => {
      const neighbors = [
        array.find(cell => cell.column === column - 1 && cell.row === row - 1),
        array.find(cell => cell.column === column && cell.row === row - 1),
        array.find(cell => cell.column === column + 1 && cell.row === row - 1),
        array.find(cell => cell.column === column - 1 && cell.row === row),
        array.find(cell => cell.column === column + 1 && cell.row === row),
        array.find(cell => cell.column === column - 1 && cell.row === row + 1),
        array.find(cell => cell.column === column && cell.row === row + 1),
        array.find(cell => cell.column === column + 1 && cell.row === row + 1)];

      const aliveNeighbors = neighbors.filter(cell => cell && cell.isAlive).length;

      if (isAlive && (aliveNeighbors <= 1 || aliveNeighbors >= 4)) {
        return {
          column,
          row,
          isAlive: false
        };
      }
      if (!isAlive && aliveNeighbors === 3) {
        return {
          column,
          row,
          isAlive: true
        };
      }
      return {
        column,
        row,
        isAlive
      };
    }));
  }

  // reset the grid with all cells dead
  function resetCells() {
    setGen(0);
    setCells(createGrid(60, 60).cells);
    setTranslate({translateX:0,translateY:0});
    setSize(10);
  }

  // reset the grid with a new random set of cells
  function randomCells() {
    setGen(0);
    setCells(createGrid(60, 60, true).cells);
    setTranslate({translateX:0,translateY:0});
    setSize(10);
  }

  // set the grid to match a specific pattern
  function setPattern(key, boxCols, boxCols) {
    setGen(0);
    setCells(getPattern(key, boxCols, boxCols).cells);
    setTranslate({translateX:0,translateY:0});
    setSize(10);
  }

  // animate the cells through request animation frame
  function animateCells() {
    const timeout = setTimeout(() => {
      updateCells();
      const id = requestAnimationFrame(animateCells);
      setRequestID(id);
      clearTimeout(timeoutID);
    }, 1000 / speed.current);
    setTimeoutID(timeout);
  }

  function handleAnimation() {
    if (!isAnimating) {
      animateCells();
    } else {
      clearTimeout(timeoutID);
      cancelAnimationFrame(requestID);
    }
    toggleAnimation();
  }

  // click to add/delete alive cell
  function handleClick({ clientX: x, clientY: y }) {
    //draging
    if (x != clientX || y != clientY) return

    // find the column and row considering the distance of the element from the left and top side
    const { left, top } = svgRef.current.getBoundingClientRect();
    const column = Math.floor((x - left - translateX) / size);
    const row = Math.floor((y - top - translateY) / size);

    // toggle the isAlive boolean of the cell being clicked
    setCells(previousCells => previousCells.map(cell => {
      if (cell.column === column && cell.row === row) {
        return {
          column,
          row,
          isAlive: !cell.isAlive
        };
      }
      return cell;
    }));
  }

  // zoom
  function handleWheel(event) {
    const { left, top } = svgRef.current.getBoundingClientRect();
    if (event.deltaY > 0) {
      let dx = event.clientX - (event.clientX - (left + translateX)) * 1.1 - left;
      let dy = event.clientY - (event.clientY - (top + translateY)) * 1.1 - top;

      if (dx > 0) {
        dx = 0;
      }
      else if (dx < svgStyle.width - size * 1.1 * columns) {
        dx = svgStyle.width - size * 1.1 * columns;
      }
      if (dy > 0) {
        dy = 0
      }
      else if (dy < svgStyle.height - size * 1.1 * rows) {
        dy = svgStyle.height - size * 1.1 * rows;
      }
      setTranslate({ translateX: dx, translateY: dy })
      setSize(size => size * 1.1);
    }
    else {
      let newSize = Math.max(size / 1.1, originSize);
      let dx = event.clientX - (event.clientX - (left + translateX)) * newSize / size - left;
      let dy = event.clientY - (event.clientY - (top + translateY)) * newSize / size - top;

      if (dx > 0) {
        dx = 0;
      }
      else if (dx < svgStyle.width - newSize * columns) {
        dx = svgStyle.width - newSize * columns;
      }
      if (dy > 0) { dy = 0 }
      else if (dy < svgStyle.height - newSize * rows) {
        dy = svgStyle.height - newSize * rows;
      }
      setTranslate({ translateX: dx, translateY: dy })
      setSize(newSize);
    }
  }

  //start pan
  function handleDragStart(event) {
    setIsDraging(true);
    setClient({ clientX: event.clientX, clientY: event.clientY });
    setTranslateO({ translateXO: translateX, translateYO: translateY })
  }

  //pan
  function handleDrag(event) {
    if (isDraging && Math.abs(event.clientX - clientX) > 0.1 && Math.abs(event.clientY - clientY) > 0.1) {
      let dx = translateXO + event.clientX - clientX;
      let dy = translateYO + event.clientY - clientY;
      if (dx > 0) {
        dx = 0;
      }
      else if (dx < svgStyle.width - size * columns) {
        dx = svgStyle.width - size * columns;
      }

      if (dy > 0) { dy = 0 }
      else if (dy < svgStyle.height - size * rows) {
        dy = svgStyle.height - size * rows;
      }
      setTranslate({ translateX: dx, translateY: dy });
    }
  }

  //end pan
  function handleDragEnd(event) {
    setIsDraging(false);
  }

  // draw svg 
  const svg = [];
  cells.forEach(({ column, row, isAlive }) => {
    svg.push(React.createElement("rect", {
      width: size, height: size, fill: isAlive ? 'black' : 'white',
      stroke: "#ccc", strokeWidth: "1",
      x: size * column + translateX, y: size * row + translateY,
    }))
  });

  return (
    React.createElement(React.Fragment, null,

      React.createElement("h1", null, "John Horton Conway’s Game of Life\n"),

      React.createElement("div", { className: "column" },
        React.createElement("h3", null, "Controls: "),
        React.createElement("button", { onClick: resetCells }, "ClearAll"),
        React.createElement("button", { onClick: randomCells }, "Random"),
        React.createElement("button", { onClick: updateCells }, "Step1"),
        React.createElement("button", { id: "startButton", className: isAnimating ? "danger" : "success", onClick: handleAnimation }, isAnimating ? 'Pause' : 'Animate'),
        React.createElement("h3", null, "Speed: ",
          React.createElement("input", { id: "speed", type: "range", min: "1", max: "15", defaultValue: 7, onChange: updateSpeed })),
        React.createElement("h3", null, "Patterns: "), patterns.map((pattern) => React.createElement("button", { className: "info", key: pattern, onClick: () => setPattern(pattern, columns, rows) }, pattern)),
        React.createElement("h3", null, "Generation: ", gen),
        React.createElement("h3", null, "Notes: "),
        React.createElement("p", null, "1. Recommended Browser: Chrome (more fluent than Safari)"),
        React.createElement("p", null, "2. Right Mouse-click: change the state (alive/dead) of the ceil "),
        React.createElement("p", null, "3. Zoom: mouse wheel; Pan: drag with mouse left down. Note that the max grid size is 60 * 60"),
        React.createElement("p", null, "4. \"SCM\" pattern will show the letter \"SCM\" after the 3rd generation, and button \"step 1\" is recommeneded to check each change"),

      ),

      React.createElement("div", { className: "column" },
        React.createElement("svg", { id: "svg", ref: svgRef, width: svgStyle.width, height: svgStyle.height, onClick: handleClick, onWheel: handleWheel, onMouseDown: handleDragStart, onMouseMove: handleDrag, onMouseUp: handleDragEnd, onMouseLeave: () => setIsDraging(false) }, svg))
    ));
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
