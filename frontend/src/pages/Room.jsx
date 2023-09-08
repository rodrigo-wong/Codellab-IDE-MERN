import React from "react";
import { useUserContext } from "../context/UserContext";
import { useEffect, useState, useRef, memo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { darcula } from "@uiw/codemirror-themes-all";
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
import QuillEditor from "../components/QuillEditor";

const Room = () => {
  const { user, roomInfo, setRoomInfo, setUser, code} = useUserContext();
  const [output, setOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [input, setInput] = useState("");
  const outputRef = useRef(null);
  const [admin, setAdmin] = useState(false)
  const [publicEdit, setPublicEdit] = useState(false);
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

  const handleDropdown = async () => {
    setPublicEdit(!publicEdit);
    try {
      const data = await fetch(`${process.env.REACT_APP_API_URL}/room/privacy`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privacy: !publicEdit,
          roomId: roomInfo.roomId,
        }),
      }).then(res => res.json());
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
  }, [roomInfo,admin]);

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

    //return () => {
    //window.removeEventListener("beforeunload", handleLeave);
    //window.removeEventListener("popstate", handlePopState);
    //};
  }, []);

  return (
    <Container fluid className="p-0 bg-dark">
      {roomInfo ? (
        <Container fluid className="p-0">
          <Container fluid className="p-0" style={{ height: "8vh" }}>
            <NavBar handleLeave={handleLeave} />
          </Container>
          <Container fluid className="mt-2">
            <Row>
              <Col lg={7} className="p-0 mb-3" style={{ height: "92vh" }}>
                <Container className="text-center mt-1">
                  <Container className="d-flex justify-content-center">
                    <div className="d-flex mb-2">
                      <div className="fs-5 text-light">Editor&nbsp;</div>
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
                                onClick={handleDropdown}
                                active={publicEdit ? false : true}
                              >
                                Private
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={handleDropdown}
                                active={publicEdit ? true : false}
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
                  </Container>
                  <Container
                    style={{
                      backgroundColor: "#333",
                      padding: "0",
                      height: "77vh",
                    }}
                  >
                    <QuillEditor admin={admin} />
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

              <Col lg={5} className="p-0">
                <Container className="mt-2">
                  <Container
                    className="container-fit-content d-flex flex-wrap border border-secondary align-items-center py-0 text-light"
                    style={{
                      height: "9vh",
                      overflowY: "scroll",
                      backgroundColor: "#333",
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
                  <p className="text-center text-light my-1 fs-5">Shell</p>
                  <CodeMirror
                    ref={outputRef}
                    height="40vh"
                    value={output}
                    readOnly={true}
                    theme={darcula}
                  />
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
                    <p className="fs-5 text-center text-light m-1">Chat</p>
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
