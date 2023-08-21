import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

const CreateRoom = () => {
  const navigate = useNavigate();
  const { setUser, setRoomInfo } = useUserContext();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("")

  const createRoom = async () => {
    if (name && room) {
      try {
        const data = await fetch(`${process.env.REACT_APP_API_URL}/room/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: room,
            name: name,
          }),
        });
        if (data.status === 401) {
          throw new Error("This room already exist");
        }
        const response = await data.json();
        sessionStorage.setItem("roomInfo", JSON.stringify(response));
        sessionStorage.setItem("user", JSON.stringify({ name: name, room: room }));
        setUser({ name: name, room: room });
        setRoomInfo(response);
        navigate("/editor");
      } catch (err) {
        //console.log(err.message);
        toast.error(err.message);
      }
    } else {
      toast.warning("Please fill all required fields to proceed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createRoom();
  };

  return (
    <Container fluid >
      <Form>
        <Form.Group
          className="mb-3"
          controlId="name"
          onChange={(e) => setName(e.target.value)}
        >
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" placeholder="Enter Name" />
        </Form.Group>

        <Form.Group
          className="mb-3"
          controlId="roomNumber"
          onChange={(e) => setRoom(e.target.value)}
        >
          <Form.Label>Room ID</Form.Label>
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

export default CreateRoom;
