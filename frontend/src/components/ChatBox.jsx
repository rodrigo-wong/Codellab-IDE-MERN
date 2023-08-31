import React from "react";
import { useEffect } from "react";
import { useState, useRef } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import socket from "../socket";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);
  const { user } = useUserContext();

  const handleSendMessage = () => {
    setMessages([...messages, { sender: user.name, message: newMessage }]);
    socket.emit("sendMessage", { user, newMessage });
    setNewMessage("");
  };

  useEffect(() => {
    if (user) {
      socket.on("receiveMessage", (data) => {
        setMessages([
          ...messages,
          { sender: data.sender, message: data.message },
        ]);
      });
    }
  }, [messages]);

  useEffect(()=>{
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  },[messages])

  return (
    <Row>
      <Col className="border border-2 border-secondary p-0 text-light " style={{backgroundColor:'#333'}}>
        <Container style={{ height: "18vh", overflowY: "auto" }} ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className="message">
              <span className='text-warning' style={{fontWeight: "700" }}>
                {message.sender}:{" "}
              </span>
              <span>{message.message}</span>
            </div>
          ))}
        </Container>
        <InputGroup className="mt-2 ">
          <Form.Control
            value={newMessage}
            placeholder="Type your message here"
            aria-describedby="basic-addon2"
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <Button variant="primary" onClick={handleSendMessage}>
            Send
          </Button>
        </InputGroup>
      </Col>
    </Row>
  );
};
export default ChatBox;
