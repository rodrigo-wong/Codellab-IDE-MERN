import React from "react";
import { useUserContext } from "../context/UserContext";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { dracula } from "@uiw/codemirror-themes-all";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { Button, Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import DownloadModal from "../modals/DownloadModal";

const socket = io("http://localhost:5020");

const Editor = () => {
  const { user, roomInfo, setRoomInfo} = useUserContext();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [input, setInput] = useState("");
  const [updateTimeOut, setUpdateTimeOut] = useState(null);
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

  const updateCode = async (code) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/room/codeUpdate?roomId=${user.room}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
        }),
      }).then((res) => res.text());
      //console.log("updated");
    } catch (err) {
      console.log(err.message);
    }
  };

  const delayedUpdateRequest = (code) => {
    //console.log("in delayed request");
    clearTimeout(updateTimeOut);
    setUpdateTimeOut(
      setTimeout(() => {
        updateCode(code);
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
    socket.emit("send-input", input);
    setInput("");
    setOutput((prevOutput) => prevOutput + input + "\n");
  };

  const handleCodeChange = (editor) => {
    const value = editor;
    //console.log(value);
    setCode(value);
    socket.emit("sendCodeUpdate", { code: value, room: user.room });
    delayedUpdateRequest(value);
  };

  const leaveRoomRequest = async () => {
    if (roomInfo) {
      try {
        const data = await fetch(`${process.env.REACT_APP_API_URL}/room/leave`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: user.room,
            name: user.name,
          }),
        }).then((res)=>res.json());
        //console.log(data);
        socket.emit("leaveRoom", data)
        setRoomInfo(null)
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoomRequest();
      sessionStorage.clear();
      navigate("/");
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    socket.on("receiveCodeUpdate", (code) => {
      //console.log("in receiveCodeUpdate");
      setCode(code);
    });
    //delayedUpdateRequest();
  }, []);

  useEffect(() => {
    socket.on("python-output", (data) => {
      if(data.output){
        setOutput((prevOutput) => prevOutput + data.output);
      }
      if (data.kill) {
        setCodeRunning(false);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (roomInfo) {
      socket.emit("joinRoom", roomInfo);
      fetchCode();
    } else {
      navigate("/");
    }
  }, []);

  useEffect(() => {
    socket.on("usersUpdate", (newInfo) => {
      setRoomInfo(newInfo);
    });
  }, []);

  useEffect(() => {
    const handlePopState = (e)=> {
      e.preventDefault();
      handleLeave()
    }
    window.addEventListener("beforeunload", handleLeave);
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener("beforeunload", handlePopState);
      window.removeEventListener("popstate", handlePopState)
    };
  }, []);

  return (
    <Container fluid className="p-0">
      {user ? (
        <Container fluid className="p-0">
          <NavBar handleLeave={handleLeave} />
          <Container fluid>
            <Row>
              <Col lg={7}>
                <Container className="mt-3">
                  <p className="text-center fs-3">Editor</p>
                  <CodeMirror
                    value={code}
                    theme={dracula}
                    extensions={loadLanguage("python")}
                    onChange={handleCodeChange}
                    height="600px"
                  />
                </Container>
              </Col>

              <Col lg={5} className="me-0">
                <Container className="mt-3 ">
                  <Container
                    className="d-flex flex-wrap border align-items-center"
                    style={{ height: "10vh", overflowY: true }}
                  >
                    <span className="fs-6 font-weight-bold">
                      <strong>Codellaborators:&nbsp;</strong>
                    </span>
                    {roomInfo.users.map((user,index) => (
                      <span className="fs-6" key={index}>
                        {user} ; &nbsp;
                      </span>
                    ))}
                  </Container>
                  <p className="text-center mt-3 fs-4">Shell</p>
                  <CodeMirror height="400px" value={output} readOnly={true} />
                  <InputGroup className="mb-2 w-100 mt-2">
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
                  <Container className="d-flex justify-content-around">
                    <Button
                      size="lg"
                      className={
                        codeRunning
                          ? "text-center btn-danger"
                          : "text-center btn-lg btn-primary"
                      }
                      onClick={handleRun}
                    >
                      {codeRunning ? "Stop" : "Run"}
                    </Button>
                    <DownloadModal code={code}/>
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

export default Editor;
