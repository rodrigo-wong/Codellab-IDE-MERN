import './App.css';
import Editor from './pages/Editor';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ChatBox from './components/ChatBox';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/editor' Component={Editor}/>
        <Route path= '/chat' Component={ChatBox}/>
      </Routes>
    </>
  );
}

export default App;
