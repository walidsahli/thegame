import React from 'react'
import './global-stylessheet.css'
import ListItem from './ListItem'
import Firebase from '../Config/Firebase'
import { useHistory } from 'react-router-dom'
import { playerContext } from '../App'

const ListGames = () => {
    const { player, setPlayer } = React.useContext(playerContext)
    const [display, setDisplay] = React.useState(false)
    const [listGames, setListGames] = React.useState([])
    const { push } = useHistory()
    var unsubscribe;

    // on mount we subscribe games list
    React.useEffect(() => {
        unsubscribe = Firebase.firestore().collection("games").onSnapshot(data => {
            const listgames = data.docChanges().map(({doc}) => ({ ...doc.data(), id: doc.id }))
            setListGames(listgames)
        })
        return () => {
            unsubscribe()
        }
    }, [])

    // we add new document of the new game
    const createNewGame = () => {
        if (!!player) {
            Firebase.firestore().collection("games").add({
                owner: player,
                turn: player,
                ownerScore: 0,
                visitorScore: 0,
                visitor: null,
                lines: [],
                status: 'waiting'
            }).then((response) => {
                const { id } = response
                push(`/game/${id}`)
            }).catch(e => console.log(e))
        } else {
            setDisplay(true)
        }
    }

    return (
        <div className='list-games-container'>
            <button className='new-game-btn' onClick={createNewGame}>Create new Game</button>
            {
                listGames.map(game => <ListItem key={game.id} game={game} setDisplay={setDisplay} />)
            }
            <div className='modal' style={{ display: display ? 'flex' : 'none' }}>
                <div className='modal-content'>
                    <h1>Enter your name : </h1>
                    <input
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                        className='player-name-input'
                        style={{ borderColor: !!!player ? 'red' : 'grey' }}
                    />
                    <div className='btn-block'>
                        <button className='play-btn' disabled={!!!player} onClick={createNewGame}>Play</button>
                        <button style={{ backgroundColor: '#c55757' }} className='play-btn' onClick={() => setDisplay(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListGames