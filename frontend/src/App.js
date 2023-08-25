import './App.css';
import Editor from './pages/Editor';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/editor' Component={Editor}/>
      </Routes>
    </>
  );
}

export default App;
