import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useUserContext } from "../context/UserContext";

const DownloadModal = (data) => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleOpen = () => setShow(true);
  const { roomInfo } = useUserContext();

  const blob = new Blob([data.code], { type: "text/x-python" });
  const blobURL = URL.createObjectURL(blob);

  return (
    <>
      <Button variant="warning" size="lg" onClick={handleOpen}>
        Download file
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>File generated</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {blobURL ? (
            <a href={blobURL} download={`${roomInfo.roomId}.py`}>
              Download file
            </a>
          ) : (
            ""
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DownloadModal;
