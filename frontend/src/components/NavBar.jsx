import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Button } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import { FaSignOutAlt } from "react-icons/fa";
import ThemeSwitch from "./ThemeSwitch";
import BotChatboxModal from "../modals/BotChatboxModal";

const NavBar = (leaveRoom) => {
  const { user } = useUserContext();
  return (
    <Container fluid className="h-100 m-0 p-0 ">
      <Navbar className="bg-body-tertiary m-0 p-0">
        <Container fluid className="p-1" style={{ backgroundColor: "#777" }}>
          <Container className="p-0 mx-3">
            <Container className="d-flex align-items-center">
              <Navbar.Text className="fs-3" style={{ color: "white" }}>
                Room#: {user.room}
              </Navbar.Text>
              <Button
                className="btn-danger ms-4 me-4"
                onClick={leaveRoom.handleLeave}
              >
                Leave room
                <FaSignOutAlt className="logout-icon ms-2" />
              </Button>
              <BotChatboxModal/>
            </Container>
          </Container>
          <Navbar.Collapse className="mx-3 text-white">
            <ThemeSwitch isNav={true}/>
            <Navbar.Text className="m-0 p-0" style={{ color: "white" }}>
              Signed in as: {user.name}
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Container>
  );
};

export default NavBar;
