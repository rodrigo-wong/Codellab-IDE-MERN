import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import { Button } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import { FaSignOutAlt } from "react-icons/fa";

const NavBar = (leaveRoom) => {
  const { user } = useUserContext();
  return (
    <Container fluid className="m-0 p-0">
    <Navbar className="bg-body-tertiary m-0">
      <Container className="p-0 mx-3">
        <Container className="d-flex align-items-center">
            <Navbar.Text className="fs-3">Room#: {user.room}</Navbar.Text>
            <Button className="btn-danger ms-4" onClick={leaveRoom.handleLeave}>
              Leave room
              <FaSignOutAlt className="logout-icon ms-2" />
            </Button>
          </Container>
        </Container>
        <Navbar.Collapse className="justify-content-end mx-3">
          <Navbar.Text className="m-0 p-0">
            Signed in as: {user.name}
          </Navbar.Text>
        </Navbar.Collapse>
    </Navbar>
  </Container>
  );
};

export default NavBar;
