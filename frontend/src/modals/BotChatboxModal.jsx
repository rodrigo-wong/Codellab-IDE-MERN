// BotChatboxModal.js
import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, InputGroup, Form } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";

const BotChatboxModal = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, colorScheme } = useUserContext();
  const [messages, setMessages] = useState([{sender: "Rodrigo", message:`Hi ${user.name}, how can I assist you today?`}])
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef(null);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSendMessage = async () => {
    const newMessages = [
      ...messages,
      { sender: user.name, message: newMessage },
      { sender: "Rodrigo", message: "" },
    ];
  
    try {
      const data = await fetch(
        `${process.env.REACT_APP_CHATBOT_URL}/predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: newMessage,
          }),
        }
      ).then((res) => res.json());
  
      newMessages[newMessages.length - 1].message = data.answer;
    } catch (err) {
      console.log(err);
    }
  
    setMessages(newMessages);
    setNewMessage("");
  };

  useEffect(()=>{
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  },[messages])

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
      🤖 AI Help Chat
      </Button>

      <Modal
        show={showModal}
        onHide={handleClose}
        dialogClassName="modal-bottom-right"
      >
        <Modal.Header closeButton>
          <Modal.Title> 🤖 Python AI Helper</Modal.Title>
        </Modal.Header>
        <Modal.Body className={colorScheme.backgroundColor + colorScheme.textColor}>
          <div
            style={{ height: "300px", overflowY: "auto", padding: "10px" }}
            ref={chatContainerRef}
          >
            {messages.map((message, index) => (
              <div key={index} className="message">
                <span className={message.sender === "Rodrigo" ? "text-primary" : "text-warning"} style={{ fontWeight: "700" }}>
                  {message.sender}:{" "}
                </span>
                <span>{message.message}</span>
              </div>
            ))}
          </div>
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
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BotChatboxModal;
