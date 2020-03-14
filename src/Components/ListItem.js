import React from 'react'
import './global-stylessheet.css'
import { useHistory } from 'react-router-dom'
import firebase from '../Config/Firebase'
import { playerContext } from '../App'


const ListItem = props => {
    const { push } = useHistory()
    const { player, setPlayer } = React.useContext(playerContext)
    const [show, setShow] = React.useState(false)

    // join a game
    const join = () => {
        if (!!!player) {
            return
        }
        // we always check if game already exist because firestore is not updating after deleting a doc
        // and we ensure that only 2 players can play for each room 
        firebase.firestore().collection('games').doc(props.game.id).get().then((doc) => {
            if (doc.exists) {
                if (!!!doc.data().visitor) {
                    doc.ref.update({
                        visitor: player,
                        status: 'playing'
                    })
                    push(`game/${props.game.id}`)
                } else {
                    alert('this room is full')
                    document.location.reload()
                }
            } else {
                alert("this game is already closed")
                document.location.reload()
            }
        })
    }
    return (
        <>
            <div className='game-item-container'>
                <h1>{props.game.owner}'s Game</h1>
                <h4 style={{color:!!!props.game.visitor ? "green" : "red"}}>Status : {!!!props.game.visitor ? "available" : "full"}</h4>
                <button className='join-btn' onClick={() => setShow(true)}>Join</button>
            </div>
            <div className='modal' style={{ display: show ? 'flex' : 'none' }}>
                <div className='modal-content' style={{ padding: 10 }}>
                    <h1>Enter your name to join game : </h1>
                    <input
                        value={player}
                        onChange={(e) => setPlayer(e.target.value)}
                        className='player-name-input'
                        style={{ borderColor: !!!player ? 'red' : 'grey' }}
                    />
                    <div className='btn-block'>
                        <button className='play-btn' disabled={!!!player} onClick={join}>Play</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ListItem 
