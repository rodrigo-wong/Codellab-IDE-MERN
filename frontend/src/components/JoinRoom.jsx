import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {toast} from 'react-toastify';

const JoinRoom = () => {
  const navigate = useNavigate();
  const { setUser, setRoomInfo, darkMode } = useUserContext();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  const joinRoom = async () => {
    if (name && room) {
      try {
        const data = await fetch(`${process.env.REACT_APP_API_URL}/room/join`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: room,
            name: name,
          }),
        })
        if (data.status === 400 || data.status === 401) {
          throw new Error("Room does not exist");
        }
        const response = await data.json();
        sessionStorage.setItem("roomInfo", JSON.stringify(response));
        sessionStorage.setItem(
          "user",
          JSON.stringify({ name: name, room: room })
        );
        setUser({ name: name, room: room });
        setRoomInfo(response);
        navigate(`/room/${room}`);
      } catch (err) {
        //console.log(err.message);
        toast.error(err.message, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } else {
      toast.warn("Please fill all required fields",  {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      })
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    joinRoom();
  };

  return (
    <Container fluid>
      <Form className="">
        <Form.Group
          className="mb-3"
          controlId="name"
          onChange={(e) => setName(e.target.value)}
        >
          <Form.Label className={darkMode? "text-light" : "text-dark"}>Name</Form.Label>
          <Form.Control type="text" placeholder="Enter Name" />
        </Form.Group>

        <Form.Group
          className="mb-3"
          controlId="roomNumber"
          onChange={(e) => setRoom(e.target.value)}
        >
          <Form.Label className={darkMode? "text-light" : "text-dark"}>Room ID</Form.Label>
          <Form.Control type="text" placeholder="Enter Room#" />
        </Form.Group>

        <Container className="text-center">
          <Button variant="primary" type="submit" onClick={handleSubmit}>
            Submit
          </Button>
        </Container>
      </Form>
    </Container>
  );
};
export default JoinRoom;
