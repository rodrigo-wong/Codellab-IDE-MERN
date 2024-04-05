import React, { useEffect } from "react";
import { Container, Tabs, Tab, Image } from "react-bootstrap";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserContext } from "../context/UserContext";
import ThemeSwitch from "../components/ThemeSwitch";

const Home = () => {
  const [key, setKey] = useState("createRoom");
  const { colorScheme } = useUserContext();
  return (
    <Container
      fluid
      className={
        "vh-100 custom-container p-0 m-0 " + colorScheme.backgroundColor
      }
    >
      <Container className={"d-flex justify-content-end p-0 text-white pt-3"} >
        <ThemeSwitch isNav={false}/>
      </Container>
      <Container fluid className="w-50 mx-auto text-center p-5">
        <Image
          src="/codellab-logo.png"
          alt="logo"
          style={{ width: "45%", minWidth: "200px" }}
          fluid
        />
      </Container>
      <Container fluid className="w-25 mx-auto">
        <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k)}
          id="home-options"
          className="mb-3"
          fill
        >
          <Tab eventKey="createRoom" title="Create Room">
            <CreateRoom />
          </Tab>
          <Tab eventKey="joinRoom" title="Join Room">
            <JoinRoom />
          </Tab>
        </Tabs>
      </Container>
      <ToastContainer />
    </Container>
  );
};

export default Home;
