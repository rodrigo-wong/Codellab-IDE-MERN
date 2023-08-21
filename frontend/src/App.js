import './App.css';
import Editor from './pages/Editor';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import ChatBox from './components/ChatBox';
import { ToastContainer } from "react-toastify";

function App() {

  return (
    <>
      <Routes>
        <Route path='/' Component={Home}/>
        <Route path='/editor' Component={Editor}/>
        <Route path= '/chat' Component={ChatBox}/>
        <ToastContainer/>
      </Routes>
    </>
  );
}

export default App;
