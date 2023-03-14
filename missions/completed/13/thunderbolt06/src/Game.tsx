import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Header } from './components/layout/Header';
import { GameSection } from './components/layout/GameSection';
import { StatusSection } from './components/layout/StatusSection';
import { Footer } from './components/layout/Footer';
import { getUniqueSudoku } from './solver/UniqueSudoku';
import { useSudokuContext } from './context/SudokuContext';
import { stringify } from 'querystring';
import './App.css';
const script = require('./script')

/**
 * Game is the main React component.
 */
export const Game: React.FC<{}> = () => {
  /**
   * All the variables for holding state:
   * gameArray: Holds the current state of the game.
   * initArray: Holds the initial state of the game.
   * solvedArray: Holds the solved position of the game.
   * difficulty: Difficulty level - 'Easy', 'Medium' or 'Hard'
   * numberSelected: The Number selected in the Status section.
   * timeGameStarted: Time the current game was started.
   * mistakesMode: Is Mistakes allowed or not?
   * fastMode: Is Fast Mode enabled?
   * cellSelected: If a game cell is selected by the user, holds the index.
   * history: history of the current game, for 'Undo' purposes.
   * overlay: Is the 'Game Solved' overlay enabled?
   * won: Is the game 'won'?
   */
  let { numberSelected, setNumberSelected,
        gameArray, setGameArray,
        difficulty, setDifficulty,
        setTimeGameStarted,
        fastMode, setFastMode,
        cellSelected, setCellSelected,
        initArray, setInitArray,
        won, setWon } = useSudokuContext();
  let [ mistakesMode, setMistakesMode ] = useState<boolean>(false);
  let [ history, setHistory ] = useState<string[][]>([]);
  
  let [ solvedArray, setSolvedArray ] = useState<string[]>([]);
  let [ overlay, setOverlay ] = useState<boolean>(false);
  let [ loading, setLoading ] = useState<boolean>(false);

  /**
   * Creates a new game and initializes the state variables.
   */
  async function _createNewGame(e?: React.ChangeEvent<HTMLSelectElement>) {
    let [ temporaryInitArray, temporarySolvedArray ] = getUniqueSudoku(difficulty, e);

    const board =  await script.currentBoard();
    var temp = [];
    for(var i=0;i<9;i++){
      for(var j=0;j<9;j++){
        // console.log(board[i][j].toString());
        temp.push(board[i][j].toString());
      }
    }
    temporaryInitArray = temp;
    temporarySolvedArray = temp;
    setInitArray(temporaryInitArray);
    setGameArray(temporaryInitArray);
    setSolvedArray(temporarySolvedArray);
    setNumberSelected('0');
    setTimeGameStarted(moment());
    setCellSelected(-1);
    setHistory([]);
    setWon(false);
  }

  /**
   * Checks if the game is solved.
   */
  async function _isSolved(index: number, value: string) {
    console.log('is solved');
    // console.log(script.hello());
    // return script.hello();
    return await script.verifyWin();
    
    if (gameArray.every((cell: string, cellIndex: number) => {
          if (cellIndex === index)
            return value === solvedArray[cellIndex];
          else
            return cell === solvedArray[cellIndex];
        })) {
      return true;
    }
    return false;
  }

  /**
   * Fills the cell with the given 'value'
   * Used to Fill / Erase as required.
   */
  async function _fillCell(index: number, value: string) {
    if (initArray[index] === '0') {
      // Direct copy results in interesting set of problems, investigate more!
      let tempArray = gameArray.slice();
      let tempHistory = history.slice();

      // Can't use tempArray here, due to Side effect below!!
      tempHistory.push(gameArray.slice());
      setHistory(tempHistory);

      tempArray[index] = value;
      setGameArray(tempArray);

      // if (await _isSolved(index, value)) {
      //   setOverlay(true);
      //   setWon(true);
      // }
    }
  }

  /**
   * A 'user fill' will be passed on to the
   * _fillCell function above.
   */
  function _userFillCell(index: number, value: string) {
    if (mistakesMode) {
      if (value === solvedArray[index]) {
        _fillCell(index, value);
      }
      else {
        // TODO: Flash - Mistakes not allowed in Mistakes Mode
      }
    } else {
      _fillCell(index, value);
    }
  }

  /**
   * On Click of 'New Game' link,
   * create a new game.
   */
  function onClickNewGame() {
    _createNewGame();
  }

  /**
   * On Click of a Game cell.
   */
  function onClickCell(indexOfArray: number) {
    if (fastMode && numberSelected !== '0') {
      _userFillCell(indexOfArray, numberSelected);
    }
    setCellSelected(indexOfArray);
  }

  /**
   * On Change Difficulty,
   * 1. Update 'Difficulty' level
   * 2. Create New Game
   */
  function onChangeDifficulty(e: React.ChangeEvent<HTMLSelectElement>) {
    setDifficulty(e.target.value);
    _createNewGame(e);
  }

  /**
   * On Click of Number in Status section,
   * either fill cell or set the number.
   */
  function onClickNumber(number: string) {
    if (fastMode) {
      setNumberSelected(number)
    } else if (cellSelected !== -1) {
      _userFillCell(cellSelected,number);
    }
  }

  /**
   * On Click Undo,
   * try to Undo the latest change.
   */
  function onClickUndo() {
    if(history.length) {
      let tempHistory = history.slice();
      let tempArray = tempHistory.pop();
      setHistory(tempHistory);
      if (tempArray !== undefined)
        setGameArray(tempArray);
    }
  }

  /**
   * On Click Erase,
   * try to delete the cell.
   */
  function onClickErase() {
    if(cellSelected !== -1 && gameArray[cellSelected] !== '0') {
      _fillCell(cellSelected, '0');
    }
  }

  /**
   * On Click submit,
   * fill the selected cell if its empty or wrong number is filled.
   */
  function onClicksubmit() {
    console.log("submit");
    if (cellSelected !== -1) {
      _fillCell(cellSelected, solvedArray[cellSelected]);
    }
  }

  /**
   * Toggle Mistakes Mode
   */
  function  onClickMistakesMode() {
    setMistakesMode(!mistakesMode);
  }

  /**
   * Toggle Fast Mode
   */
  function onClickFastMode() {
    if (fastMode) {
      setNumberSelected('0');
    }
    setCellSelected(-1);
    setFastMode(!fastMode);
  }

  /**
   * Close the overlay on Click.
   */
  function onClickOverlay() {
    setOverlay(false);
    _createNewGame();
  }

  /**
   * On load, create a New Game.
   */
  useEffect(() => {
    _createNewGame();

  }, []);
  async function onClickSubmit() {
    console.log("loading");
    setLoading(true);
    setOverlay(true);
    console.log(Number(gameArray[0]),Number(gameArray[10]));
    if(await script.verifyWin(0, 0, Number(gameArray[0]) , 1, 1, Number(gameArray[10]))){
      setWon(true);
    }
    else {
      setWon(false);
    }
    setLoading(false);
    setOverlay(true);
    // return await script.verifyWin(x1, y1, i1 , x2, y2, i2);
    // console.log("submit");
    // return true;
  }
  // let answer;
  // if(won) {
  //   answer = <h2 className="overlay__text">
  //         You <span className="overlay__textspan1">solved</span> <span className="overlay__textspan2">it!</span>
  //       </h2>;
  // }

  return (
    <>
      <div className={overlay?"container blur":"container"}>
        <Header onClick={onClickNewGame}/>
        <div className="innercontainer">
          <GameSection
            onClick={(indexOfArray: number) => onClickCell(indexOfArray)}
          />
          <StatusSection
            onClickNumber={(number: string) => onClickNumber(number)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChangeDifficulty(e)}
            onClickUndo={onClickUndo}
            onClickErase={onClickErase}
            // onClicksubmit={onClicksubmit}
            onClickMistakesMode={onClickMistakesMode}
            onClickFastMode={onClickFastMode}
            onClickSubmit={onClickSubmit}
          />
          <button className="connect-wallet" onClick={onClickSubmit}>
            Submit
          </button>

        <button className="connect-wallet" onClick={script.getAccounts}>Connect Wallet</button>
        </div>
        <Footer />
      </div>
      <div className= { overlay
                        ? "overlay overlay--visible"
                        : "overlay"
                      }
           onClick={onClickOverlay}
      >{
        loading ? 
        <h2 className="overlay__text">
          <span className="overlay__textspan1">Loading!!!</span> 
        </h2> : ""
      }
        {!loading && (
        (won) ? 
        <h2 className="overlay__text">
          You <span className="overlay__textspan1">solved</span> <span className="overlay__textspan2">it!</span>
        </h2>
        
        : 
        
        
        <h2 className="overlay__text">
        Please <span className="overlay__textspan1">try</span> <span className="overlay__textspan2"> again</span>
      </h2>)}
      </div>
    </>
  );
}
