import React from "react";
import { useUserContext } from "../context/UserContext";
import { useEffect, useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { Button, Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import DownloadModal from "../modals/DownloadModal";
import ChatBox from "../components/ChatBox";
import socket from "../socket";
import QuillEditor from "../components/QuillEditor";

const Room = () => {
  const { user, roomInfo, setRoomInfo, setUser, code, setCode } =
    useUserContext();
  const [output, setOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const fetchCode = async () => {
    try {
      const fetchedCode = await fetch(
        `${process.env.REACT_APP_API_URL}/room/fetchCode?roomId=${user.room}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.text());
      setCode(fetchedCode);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleRun = () => {
    setOutput("");
    if (!codeRunning) {
      setCodeRunning(true);
      socket.emit("run-python", code);
    } else {
      setCodeRunning(false);
      socket.emit("run-python", code);
    }
  };

  const sendInput = () => {
    setOutput((prevOutput) => prevOutput + input + "\n");
    socket.emit("send-input", input);
    setInput("");
  };

  const handleLeave = () => {
    if (roomInfo) {
      socket.emit("leaveRoom", { roomInfo, user });
      sessionStorage.clear();
      setRoomInfo(null);
      setUser(null);
      navigate("/");
    }
  };

  useEffect(() => {
    if (roomInfo && user) {
      socket.emit("joinRoom", roomInfo);
      //fetchCode();
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    socket.on("python-output", (data) => {
      if (data.output) {
        setOutput((prevOutput) => prevOutput + data.output + "\n");
      }
      if (data.kill) {
        setCodeRunning(false);
      }
    });
  }, [socket]);

  useEffect(() => {
    socket.on("usersUpdate", (newInfo) => {
      setRoomInfo(newInfo);
    });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      handleLeave();
    };
    window.addEventListener("beforeunload", handleLeave);
    window.addEventListener("popstate", handlePopState);

    //return () => {
    //window.removeEventListener("beforeunload", handleLeave);
    //window.removeEventListener("popstate", handlePopState);
    //};
  }, []);

  return (
    <Container fluid className="p-0">
      {roomInfo ? (
        <Container fluid className="p-0">
          <NavBar handleLeave={handleLeave} />
          <Container fluid className="">
            <Row>
              <Col lg={7} className="p-0 mb-3">
                <Container className="mt-2">
                  <p className="text-center fs-5 mb-1">Editor</p>
                  <QuillEditor/>
                </Container>
                <Container
                  className="d-flex justify-content-center"
                  style={{ marginTop: "65px" }}
                >
                  <Button
                    size="lg"
                    className={
                      "text-center mx-1 " +
                      `${codeRunning ? "btn-danger" : "btn-primary"}`
                    }
                    onClick={handleRun}
                  >
                    {codeRunning ? "Stop" : "Run"}
                  </Button>
                  <DownloadModal code={code} />
                </Container>
              </Col>

              <Col lg={5} className="p-0">
                <Container className="mt-2 mb-3">
                  <Container
                    className="container-fit-content d-flex flex-wrap border align-items-center py-0"
                    style={{ height: "9vh", overflowY: "scroll" }}
                  >
                    <span>
                      <strong>Codellaborators:&nbsp;</strong>
                    </span>
                    {roomInfo.users.map((user, index) => (
                      <span key={index}>{user} ; &nbsp;</span>
                    ))}
                  </Container>
                  <p className="text-center my-1 fs-5">Shell</p>
                  <CodeMirror height="40vh" value={output} readOnly={true} />
                  <InputGroup className="mb-1 w-100 mt-2">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      Input :
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      placeholder={codeRunning ? "Enter input here..." : ""}
                      type="text"
                      value={codeRunning ? input : ""}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendInput();
                        }
                      }}
                      disabled={!codeRunning}
                    />
                  </InputGroup>
                  <Container fluid>
                    <p className="fs-5 text-center m-1">Chat</p>
                    <ChatBox />
                  </Container>
                </Container>
              </Col>
            </Row>
          </Container>
        </Container>
      ) : (
        ""
      )}
    </Container>
  );
};

export default Room;
