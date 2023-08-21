import React from "react";
import { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";

const ChatBox = () => {
  const [messages, setMessages] = useState(["hello"]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") {
      return;
    }

    setMessages([...messages, newMessage]);
    setNewMessage("");
  };

  return (
      <Row>
        <Col className="border border-2 p-0">
          <Container style={{height:'18vh'}}>
            {messages.map((message, index) => (
              <div key={index} className="message">
                {message}
              </div>
            ))}
          </Container>
          <Form>
            <Form.Group controlId="newMessage" className="d-flex">
              <Form.Control
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <Button variant="primary" onClick={handleSendMessage}>
                Send
              </Button>
            </Form.Group>
          </Form>
        </Col>
      </Row>
  );
};
export default ChatBox;
