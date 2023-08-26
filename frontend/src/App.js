import './App.css';
import Room from './pages/Room';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/room/:roomId' Component={Room}/>
      </Routes>
    </>
  );
}

export default App;
