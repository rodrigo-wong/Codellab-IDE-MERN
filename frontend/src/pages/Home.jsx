import React from "react";
import { Container, Tabs, Tab, Image } from "react-bootstrap";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";
import { useState } from "react";

const Home = () => {
  const [key, setKey] = useState("createRoom");

  return (
    <Container fluid>
      <Container fluid className="w-50 mx-auto text-center m-5">
        <Image
          src="/codellab-logo.png"
          alt="logo"
          style={{ width: "40%" }}
          fluid
        />
      </Container>
      <Container fluid className="w-50 mx-auto">
        <Tabs
          activeKey={key}
          onSelect={(k) => setKey(k)}
          id="home-options"
          className="mb-3"
          fill
        >
          <Tab eventKey="createRoom" title="Create Room">
            <CreateRoom/>
          </Tab>
          <Tab eventKey="joinRoom" title="Join Room">
            <JoinRoom/>
          </Tab>
        </Tabs>
      </Container>
    </Container>
  );
};

export default Home;
