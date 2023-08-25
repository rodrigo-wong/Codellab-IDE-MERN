import React from "react";
import { useUserContext } from "../context/UserContext";
import { useEffect, useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-themes-all";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { Button, Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import DownloadModal from "../modals/DownloadModal";
import ChatBox from "../components/ChatBox";
import socket from "../socket";

const EditorPage = () => {
  const { user, roomInfo, setRoomInfo, setUser } = useUserContext();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [input, setInput] = useState("");
  const [updateTimeOut, setUpdateTimeOut] = useState(null);
  const mirrorView = useRef(null);
  const [updateCaret, setUpdateCaret] = useState(false);
  const [currentCursor, setCurrentCursor] = useState(0);

  const navigate = useNavigate();

  const fetchCode = async () => {
    if (roomInfo && user) {
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
    } else {
      navigate("/")
    }
  };

  const updateCode = async (value) => {
    try {
      await fetch(
        `${process.env.REACT_APP_API_URL}/room/codeUpdate?roomId=${user.room}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: value,
          }),
        }
      ).then((res) => res.text());
      //console.log("updated");
    } catch (err) {
      console.log(err.message);
    }
  };

  const delayedUpdateRequest = (value) => {
    //console.log("in delayed request");
    clearTimeout(updateTimeOut);
    setUpdateTimeOut(
      setTimeout(() => {
        updateCode(value);
      }, 5000)
    );
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

  const handleCodeChange = (value, view) => {
    const n = view.view.viewState.state.selection.ranges[0].from;
    //console.log(n);
    setCode(value);
    setCurrentCursor(n);
    delayedUpdateRequest(value);
    socket.emit("sendCodeUpdate", {
      code: value,
      room: user.room,
      cursor: n,
    });
  };

  const handleLeave = () => {
    if (roomInfo) {
      navigate("/");
      socket.emit("leaveRoom", { roomInfo, user });
      sessionStorage.clear();
      setRoomInfo(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (roomInfo) {
      socket.emit("joinRoom", roomInfo);
      fetchCode();
    } else {
      navigate("/");
    }
  }, []);

  const check = (originCursor, newCode) => {
    let newLocation;
    if (originCursor < currentCursor) {
      if (newCode.length > code.length) {
        newLocation = currentCursor + 1;
      } else {
        newLocation = currentCursor - 1;
      }
      setCurrentCursor(newLocation);
    }
    if (currentCursor > newCode.length) {
      setCurrentCursor(newCode.length);
    }
  };

  useEffect(() => {
    socket.on("receiveCodeUpdate", (data) => {
      check(data.cursor, data.code);
      setCode(data.code);
    });
  });

  useEffect(() => {
    if (mirrorView !== null && mirrorView.current !== null) {
      if (mirrorView.current.view !== undefined) {
        mirrorView.current.view.viewState.state.selection.ranges[0].from =
          currentCursor;
        mirrorView.current.view.viewState.state.selection.ranges[0].to =
          currentCursor;
        mirrorView.current.state.selection.ranges[0].from = currentCursor;
        mirrorView.current.state.selection.ranges[0].to = currentCursor;
        //console.log(mirrorView.current.view.viewState.state.selection.ranges[0], "view");
        //console.log(mirrorView.current.state.selection.ranges[0], "state");
      }
    }
  }, [check]);

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
  }, [code]);

  useEffect(() => {
    const handlePopState = () => {
      handleLeave();
    };
    window.addEventListener("beforeunload", handleLeave);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleLeave);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <Container fluid className="p-0">
      {user ? (
        <Container fluid className="p-0">
          <NavBar handleLeave={handleLeave} />
          <Container fluid className="">
            <Row>
              <Col lg={7} className="p-0 mb-3">
                <Container className="mt-2">
                  <p className="text-center fs-5 mb-1">Editor</p>
                  <CodeMirror
                    ref={mirrorView}
                    value={code}
                    theme={dracula}
                    extensions={loadLanguage("python")}
                    onChange={handleCodeChange}
                    onKeyDown={(e) => {
                      let caret =
                        mirrorView.current.view.viewState.state.selection
                          .ranges[0].from;
                      setCurrentCursor(caret);
                    }}
                    height="77vh"
                  />
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

export default EditorPage;
