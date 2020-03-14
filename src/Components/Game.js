import React from 'react'
import './global-stylessheet.css'
import {
    useParams,
    useHistory
} from 'react-router-dom'
import firebase from '../Config/Firebase'
import { playerContext } from '../App'


// these are all cooordinations of points
const allPoints = [
    [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }, { x: 300, y: 0 }],
    [{ x: 0, y: 100 }, { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 }],
    [{ x: 0, y: 200 }, { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 }],
    [{ x: 0, y: 300 }, { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 }]
]

const size = 300

export default () => {
    //this state will contain all played vectors 
    const [lines, setLines] = React.useState([])

    // this is the game id
    const { id } = useParams()
    const { push } = useHistory()

    // we extract here the player name from the context
    const { player } = React.useContext(playerContext)

    // we save here the game's data
    const [gameData, setGameData] = React.useState({})


    //// on mount effect
    React.useEffect(() => {
        var unsubscribe;
        // subscribe to our collection games to get live data
        unsubscribe = firebase.firestore().collection("games").onSnapshot(value => {
            const currentDoc = value.docChanges().filter(({ doc }) => doc.id === id)
            if (currentDoc.length > 0) {
                const data = currentDoc.map(({ doc }) => doc.data())[0]
                setGameData({
                    owner: data.owner,
                    ownerScore: data.ownerScore,
                    visitorScore: data.visitorScore,
                    turn: data.turn,
                    visitor: data.visitor,
                    status: data.status
                })
                setLines(data.lines)
            }
        })
        return () => {
            // clear up to unsbscribe and when player leave game notify the other player
            unsubscribe()
            if (gameData.status !== 'closed')
                firebase.firestore().collection("games").doc(id).update({
                    status: 'closed'
                }).catch(e => null)
        }
    }, [])

    const closeGame = () => {
        // delete game when the last player left the game
        firebase.firestore().collection("games").doc(id).delete().then(() => push('/')).catch(e => null)
    }


    const PlayYourRole = (indexDotFrom, indexDotTo) => {
        /**
         * this array contain the number of vectors down the line if the line is horizontal and at the right of the line if the line is vertical
         * so down here will be the positive direction of vectors ( f(x) = x )
         */
        const downSquare = lines.filter(vector => {
            return (
                (   // this condition checks if the played line is horizontal
                    (indexDotFrom.line == indexDotTo.line) && (
                        /**
                         * so here we will check the 3 other vectors that will create a square for the current vector
                         * which has a start points indexDotFrom and end points indexDotTo
                         * 
                         * >>>>>>>>>    >>>>> : is our selected line and the rest of the vectors that we 
                         * |       |            will check if they are already played
                         * |       | 
                         * |       |
                         * |       v 
                         * v------->
                         */
                        (vector.start.line === indexDotFrom.line && vector.start.column === indexDotFrom.column && vector.end.line === indexDotTo.line + 1 && vector.end.column === indexDotTo.column - 1) ||
                        (vector.start.line === indexDotTo.line + 1 && vector.start.column === indexDotTo.column - 1 && vector.end.line === indexDotTo.line + 1 && vector.end.column === indexDotTo.column) ||
                        (vector.start.line === indexDotTo.line && vector.start.column === indexDotTo.column && vector.end.line === indexDotTo.line + 1 && vector.end.column === indexDotTo.column)
                    )
                )
                || (
                    // this condition checked if the selected line is vertical
                    (indexDotFrom.column == indexDotTo.column) && (
                        /**
                         * so if the played or checked line is horizental so we will have to check the appropriate vectors the form a square
                         * 
                         * ------->     >>>> : is our vector played and we will check for the rest of vectors that form a square
                         * v      |             if they are played
                         * v      |  
                         * v      v  
                         * v------>
                         */
                        (vector.start.line === indexDotFrom.line && vector.start.column === indexDotFrom.column && vector.end.line === indexDotTo.line - 1 && vector.end.column === indexDotTo.column + 1) ||
                        (vector.start.line === indexDotFrom.line && vector.start.column === indexDotFrom.column + 1 && vector.end.line === indexDotTo.line && vector.end.column === indexDotTo.column + 1) ||
                        (vector.start.line === indexDotFrom.line + 1 && vector.start.column === indexDotFrom.column && vector.end.line === indexDotTo.line && vector.end.column === indexDotTo.column + 1)
                    )
                )
            )
        }).length

        /**
         * this array contain the number of vectors up the line if the line is horizontal and at the left of the line if the line is vertical
         * so down here will be the positive direction of vectors ( f(x) = x )
         */
        const aboveSquare = lines.filter(vector => {
            return (
                // we check if the played line is horizental 
                ((indexDotFrom.line == indexDotTo.line) && (
                    (   // we check that we have vectors up the played line
                        (indexDotFrom.line > 0) &&
                        /**
                         * so here we will check the 3 other vectors that will create a square for the current vector
                         * which has a start points indexDotFrom and end points indexDotTo
                         * -------->    >>>> : is our selected vector and the other vectors that we will check if they are played
                         * |       | 
                         * |       | 
                         * |       v 
                         * v>>>>>>>>
                         */
                        (vector.start.line === indexDotFrom.line - 1 && vector.start.column === indexDotFrom.column && vector.end.line === indexDotTo.line - 1 && vector.end.column === indexDotTo.column) ||
                        (vector.start.line === indexDotTo.line - 1 && vector.start.column === indexDotTo.column && vector.end.line === indexDotTo.line && vector.end.column === indexDotTo.column) ||
                        (vector.start.line === indexDotTo.line - 1 && vector.start.column === indexDotTo.column - 1 && vector.end.line === indexDotTo.line && vector.end.column === indexDotTo.column - 1)
                    ))
                    // we check if the played line is vertical
                ) || ((indexDotFrom.column == indexDotTo.column) && (
                    // we check that we have vectors at the left of the played line
                    (indexDotFrom.column > 0) && (
                        /**
                         * so here we will check the 3 other vectors that will create a square for the current vector
                         * which has a start points indexDotFrom and end points indexDotTo
                         * -------->
                         * |       v    >>>> : is our selected vector and the other vectors that we will check if they are played  
                         * |       v
                         * |       v 
                         * v------->
                         * 
                         */
                        (vector.start.line === indexDotFrom.line && vector.start.column === indexDotFrom.column - 1 && vector.end.line === indexDotTo.line && vector.end.column === indexDotTo.column - 1) ||
                        (vector.start.line === indexDotTo.line && vector.start.column === indexDotTo.column - 1 && vector.end.line === indexDotTo.line && vector.end.column === indexDotTo.column) ||
                        (vector.start.line === indexDotTo.line - 1 && vector.start.column === indexDotTo.column - 1 && vector.end.line === indexDotTo.line - 1 && vector.end.column === indexDotTo.column)
                    ))
                )
            )
        }).length
        // here will make sure that the selectd line is not already played
        if (lines.filter(line => line.start.line === indexDotFrom.line && line.start.column === indexDotFrom.column && line.end.line === indexDotTo.line && line.end.column === indexDotTo.column).length == 0) {
            // check the player turn
            if (gameData.turn == player) {
                var turn;
                // if the current player form a square so he will play the next turn
                if (Math.floor(downSquare / 3) + Math.floor(aboveSquare / 3) > 0) {
                    turn = player;
                } else {
                    // the other player get the next turn
                    turn = player === gameData.owner ? gameData.visitor : gameData.owner
                }
                // we update our database
                /**
                 * the score will be the sum of the number of vectors selected that can form a square with the played vector
                 * if we have 3 down square vectors so math.floor(3/3) will give one which is a point for the current player
                 */
                firebase.firestore().collection('games').doc(id).update({
                    ownerScore: player === gameData.owner ? gameData.ownerScore + Math.floor(downSquare / 3) + Math.floor(aboveSquare / 3) : gameData.ownerScore,
                    visitorScore: player !== gameData.owner ? gameData.visitorScore + Math.floor(downSquare / 3) + Math.floor(aboveSquare / 3) : gameData.visitorScore,
                    lines: [...lines, { start: indexDotFrom, end: indexDotTo }],
                    turn: turn
                })
            } else {
                alert("wait your turn")
            }
        } else {
            alert("Already drawn ! ")
        }

    }

    return (
        <div className='game-container'>
            <h1>{gameData.turn === player ? "It's your turn" : 'Wait for your turn'}</h1>
            <svg width={size} height={size} style={{ margin: 50, overflow: 'visible' }}>
                {/** we are drawing points here :) */}
                {allPoints.map(lines => lines.map(dot => <circle key={`${dot.x}///${dot.y}`} cx={dot.x} cy={dot.y} r="10" strokeWidth="2" fill="grey" style={{ zIndex: 1 }} />))}
                {
                    allPoints.map((line, indexLine) => {
                        return line.map((dot, indexDot) => {
                            return (<>
                                {/** we are drawing default lines here :) */}
                                {/** the line color ( stroke) will be blue id the vector exist in lines which means it's already played */}
                                {indexDot < 3 && <line key={`${indexLine}l${indexDot}d`}
                                    x1={allPoints[indexLine][indexDot].x}
                                    y1={allPoints[indexLine][indexDot].y}
                                    x2={allPoints[indexLine][indexDot + 1].x}
                                    y2={allPoints[indexLine][indexDot + 1].y}
                                    stroke={
                                        lines.filter(line => allPoints[line.start.line][line.start.column].x === allPoints[indexLine][indexDot].x && allPoints[line.start.line][line.start.column].y === allPoints[indexLine][indexDot].y
                                            && allPoints[line.end.line][line.end.column].x === allPoints[indexLine][indexDot + 1].x && allPoints[line.end.line][line.end.column].y === allPoints[indexLine][indexDot + 1].y).length > 0 ? "blue" : "grey"
                                    } strokeWidth="3"
                                    onClick={() => PlayYourRole({ line: indexLine, column: indexDot }, { line: indexLine, column: indexDot + 1 })} />}
                                {indexLine < 3 && <line
                                    key={`${indexDot}d${indexLine}d`}
                                    x1={allPoints[indexLine][indexDot].x}
                                    y1={allPoints[indexLine][indexDot].y}
                                    x2={allPoints[indexLine + 1][indexDot].x}
                                    y2={allPoints[indexLine + 1][indexDot].y}
                                    stroke={
                                        lines.filter(line => allPoints[line.start.line][line.start.column].x === allPoints[indexLine][indexDot].x && allPoints[line.start.line][line.start.column].y === allPoints[indexLine][indexDot].y
                                            && allPoints[line.end.line][line.end.column].x === allPoints[indexLine + 1][indexDot].x && allPoints[line.end.line][line.end.column].y === allPoints[indexLine + 1][indexDot].y).length > 0 ? "blue" : "grey"
                                    } strokeWidth="3"
                                    onClick={() => PlayYourRole({ line: indexLine, column: indexDot }, { line: indexLine + 1, column: indexDot })} />}
                            </>)
                        })
                    })
                }
            </svg>
            {/** this is score panel */}
            <div className='score-sheet'>
                <h3 className='me-score'>Me : {player === gameData.owner ? gameData.ownerScore : gameData.visitorScore}</h3>
                <h3 style={{color : 'black'}}>Score</h3>
                <h3 className = 'versus-score'>{player !== gameData.owner ? gameData.ownerScore : gameData.visitorScore} : {player !== gameData.owner ? gameData.owner : gameData.visitor}</h3>
            </div>
            {/** this modal will showing while waiting for an other player */}
            <div className="modal" style={{ display: !!!gameData.visitor ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <h1 style={{ padding: 10 }}>Waiting for an other player to join you ...</h1>
                    <button onClick={closeGame} className='leave-btn'>Leave</button>
                </div>
            </div>
            {/** this modal is shown when the other player left the game */}
            <div className="modal" style={{ display: gameData.status === 'closed' ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <h1 style={{ padding: 20 }}>{player !== gameData.owner ? gameData.owner : gameData.visitor} left the game ...</h1>
                    <button onClick={closeGame} className='leave-btn'>Leave</button>
                </div>
            </div>
            {/** final score modal */}
            <div className="modal" style={{ display: lines.length === 24 ? 'flex' : 'none' }}>
                <div className="modal-content">
                    <h1 style={{ padding: 10 }}>The Winner is : </h1>
                    <h2 style={{ padding: 10 }}>{
                        gameData.ownerScore > gameData.visitorScore ?
                            gameData.owner : gameData.visitor
                    }</h2>
                    <button onClick={closeGame} className='leave-btn'>OK</button>
                </div>
            </div>
        </div>
    )
}
