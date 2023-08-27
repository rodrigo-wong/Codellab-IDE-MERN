import './App.css';
import Room from './pages/Room';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import QuillEditor from './components/QuillEditor';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' exact Component={Home}/>
        <Route path='/room/:roomId' Component={Room}/>
        <Route path='/quill' Component={QuillEditor}/>
      </Routes>
    </>
  );
}

export default App;
