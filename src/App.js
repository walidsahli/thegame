import React, { useEffect } from 'react';
import './App.css';
import Game from './Components/Game';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import ListGames from './Components/ListGames';


export const playerContext = React.createContext({
  player: null,
  setPlayer : null,
})

function App() {
  // creating context to store user's name 
  const [player , setPlayer ] = React.useState('')
  return (
    <playerContext.Provider value={{
      player,
      setPlayer
    }}>
      <div className="App">
        <Router>
          <Switch>
            <Route path='/' exact>
              <ListGames />
            </Route>
            <Route path='/game/:id' >
              <Game />
            </Route>
            <Route path='**'>
              <Redirect to='/' />
            </Route>
          </Switch>
        </Router>
      </div>
    </playerContext.Provider>
  );
}

export default App;
