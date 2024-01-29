import React from "react";
import { useUserContext } from "../context/UserContext";
import { useEffect, useState, useRef, memo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { bbedit, darcula } from "@uiw/codemirror-themes-all";
import CodeEditor from "../components/CodeEditor";
import {
  Button,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import DownloadModal from "../modals/DownloadModal";
import ChatBox from "../components/ChatBox";
import socket from "../socket";

const Room = () => {
  const { user, roomInfo, setRoomInfo, setUser, code, darkMode, colorScheme } = useUserContext();
  const [output, setOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [input, setInput] = useState("");
  const outputRef = useRef(null);
  const [admin, setAdmin] = useState(false);
  const [publicEdit, setPublicEdit] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const navigate = useNavigate();

  const handleRun = () => {
    setOutput("");
    if (!codeRunning) {
      setCodeRunning(true);
      socket.emit("runPython", code);
    } else {
      setCodeRunning(false);
      socket.emit("runPython", code);
    }
  };

  const sendInput = () => {
    setOutput((prevOutput) => prevOutput + input + "\n");
    socket.emit("sendInput", input);
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

  const handleDropdownPublic = async () => {
    setPublicEdit(false);
    try {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/room/privacy`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            privacy: false,
            roomId: roomInfo.roomId,
          }),
        }
      ).then((res) => res.json());
      socket.emit("privacyUpdate", data);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleDropdownPrivate = async () => {
    setPublicEdit(true);
    try {
      const data = await fetch(
        `${process.env.REACT_APP_API_URL}/room/privacy`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            privacy: true,
            roomId: roomInfo.roomId,
          }),
        }
      ).then((res) => res.json());
      socket.emit("privacyUpdate", data);
    } catch (err) {
      console.log(err.message);
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
    socket.on("pythonOutput", (data) => {
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
      sessionStorage.setItem("roomInfo", JSON.stringify(newInfo));
    });
  }, []);

  useEffect(() => {
    if (user) {
      if (user.name === roomInfo.users[0]) {
        setAdmin(true);
      } else {
        setAdmin(false);
      }
    }
  }, [roomInfo, admin]);

  useEffect(() => {
    if (outputRef.current !== null) {
      if (outputRef.current.view !== undefined) {
        outputRef.current.view.viewState.scrollAnchorPos = output.length;
      }
    }
  }, [output]);

  useEffect(() => {
    const handlePopState = () => {
      handleLeave();
    };
    window.addEventListener("beforeunload", handleLeave);
    window.addEventListener("popstate", handlePopState);
  }, []);

  return (
    <Container fluid className={"p-0 " + colorScheme.backgroundColor}>
      {roomInfo ? (
        <Container fluid className="p-0">
          <Container fluid className="p-0" style={{ width:"100%" }}>
            <NavBar handleLeave={handleLeave} />
          </Container>
          <Container fluid className="mt-2">
            <Row>
              <Col lg={6} className="p-0 mb-3" style={{ height: "92vh" }}>
                <Container
                  className="text-center mt-1"
                  style={{ marginLeft: "5%" }}
                >
                  <Container className="d-flex justify-content-center">
                    <div className="d-flex mb-2">
                      <div className={"fs-5 " + colorScheme.textColor}>Editor: &nbsp;</div>
                      {admin ? (
                        <div>
                          <Dropdown as={ButtonGroup} size="sm">
                            <Button variant="secondary">Editing rights:</Button>
                            <Dropdown.Toggle
                              split
                              variant="secondary"
                              id="dropdown-split-basic"
                            />

                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={handleDropdownPrivate}
                                active={publicEdit ? true : false}
                              >
                                Private
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={handleDropdownPublic}
                                active={publicEdit ? false : true}
                              >
                                Public
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                    <Dropdown
                      className={admin ? "ms-2" : ""}
                      onSelect={(size) => setFontSize(size)}
                    >
                      <Dropdown.Toggle
                        variant="secondary"
                        id="dropdown-basic"
                        size="sm"
                      >
                        Font Size: {fontSize}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {["10", "12", "14", "16", "18", "20", "22"].map(
                          (fontSize) => (
                            <Dropdown.Item key={fontSize} eventKey={fontSize}>
                              {fontSize}
                            </Dropdown.Item>
                          )
                        )}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Container>
                  <Container
                    style={{
                      padding: "0",
                      width: "100%",
                      height: "77vh",
                      textAlign: "left",
                      fontSize: `${fontSize}px`,
                    }}
                  >
                    <CodeEditor admin={admin} />
                  </Container>
                </Container>
                <Container className="d-flex justify-content-center mt-3">
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

              <Col lg={6} className="p-0">
                <Container className="mt-2" style={{ width: "90%" }}>
                  <Container
                    className={"container-fit-content d-flex flex-wrap border border-secondary align-items-center py-0 " + colorScheme.backgroundColor + colorScheme.textColor}
                    style={{
                      height: "9vh",
                      overflowY: "scroll",
                    }}
                  >
                    <span>
                      <strong>Codellaborators:&nbsp;</strong>
                    </span>
                    {roomInfo.users.map((user, index) => (
                      <span key={index}>
                        {index == 0 ? user + " (Admin)" : user} ; &nbsp;
                      </span>
                    ))}
                  </Container>
                  <p className={"text-center my-1 fs-5 " + colorScheme.textColor}>Shell</p>
                  <div className="border border-1 border-secondary">
                    <CodeMirror
                      ref={outputRef}
                      height="40vh"
                      value={output}
                      theme={darkMode ? darcula :bbedit}
                      readOnly={true}
                    />
                  </div>
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
                  <Container fluid className="mb-3">
                    <p className={"fs-5 text-center m-1 " + colorScheme.textColor}>Chat</p>
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

export default memo(Room);
