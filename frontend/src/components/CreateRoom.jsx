import React from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";

const CreateRoom = () => {
  const navigate = useNavigate();
  const { setUser, setRoomInfo, darkMode } = useUserContext();
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [loading, setLoading] = useState(false);
  const [isServerIdle, setIsServerIdle] = useState(false);

  const createRoom = async () => {
    setLoading(true);
    setTimeout(() => {
      setIsServerIdle(true);
    }, 3000);
    if (name && room) {
      try {
        const data = await fetch(
          `${process.env.REACT_APP_API_URL}/room/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              roomId: room,
              name: name,
            }),
          }
        );
        if (data.status === 400 || data.status === 401) {
          throw new Error("This room already exist");
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
      toast.warn("Please fill all required fields", {
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
    setIsServerIdle(false);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createRoom();
  };

  return (
    <Container fluid>
      <Form>
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
      {loading ? (
        <div className="position-fixed top-50 start-50 translate-middle text-center">
          <Spinner animation="border" variant="warning" />
          <p className="text-primary fs-4">
            Loading...<br></br>
            {isServerIdle ? (
              <span className="fs-5">
                Rebooting the server, this may take 1-2 minutes
              </span>
            ) : (
              ""
            )}
          </p>
        </div>
      ) : (
        ""
      )}
    </Container>
  );
};

export default CreateRoom;
