import React from "react";
import { useUserContext } from "../context/UserContext";
import { useEffect, useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { bbedit, darcula } from "@uiw/codemirror-themes-all";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { Button, Container, Row, Col, Form, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import DownloadModal from "../modals/DownloadModal";
import ChatBox from "../components/ChatBox";
import socket from "../socket";
import Codellaborators from "../components/Codellaborators";
import EditRights from "../components/EditRights";
import FontSize from "../components/FontSize";

const Room = () => {
  const { user, roomInfo, setRoomInfo, setUser, darkMode, colorScheme } =
    useUserContext();
  const [editorContent, setEditorContent] = useState("");
  const [output, setOutput] = useState("");
  const [codeRunning, setCodeRunning] = useState(false);
  const [input, setInput] = useState("");
  const outputRef = useRef(null);
  const providerRef = useRef("null");
  const [admin, setAdmin] = useState(false);
  const [fontSize, setFontSize] = useState("16");
  const navigate = useNavigate();
  const [readOnly, setReadOnly] = useState(false);

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Add event listener for content changes
    const model = editorRef.current.getModel();
    model.onDidChangeContent(() => {
      setEditorContent(model.getValue());
    });

    // initialize YJS
    const doc = new Y.Doc();

    //Connect with WebRTC
    providerRef.current = new WebrtcProvider(user.room, doc, {
      signaling: [process.env.REACT_APP_WEBRTC_URL], // Use your socket for signaling
    });
    const type = doc.getText("monaco");
    // Bind YJS to Monaco
    const binding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      providerRef.current.awareness
    );
  };

  const handleRun = () => {
    setOutput("");
    if (!codeRunning) {
      setCodeRunning(true);
      socket.emit("runPython", editorContent);
    } else {
      setCodeRunning(false);
      socket.emit("runPython", editorContent);
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
      providerRef.current.destroy();
      setRoomInfo(null);
      setUser(null);
      navigate("/");
    }
  };

  useEffect(() => {
    if (roomInfo && user) {
      socket.emit("joinRoom", roomInfo);
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
  }, [roomInfo]);

  useEffect(() => {
    if (!admin) {
      setReadOnly(true);
    } else {
      setReadOnly(false);
    }
  }, [admin, roomInfo]);

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
          <Container fluid className="p-0" style={{ width: "100%" }}>
            <NavBar handleLeave={handleLeave} />
          </Container>
          <Container fluid className="mt-2">
            <Row>
              <Col lg={7} className="p-0 mb-3" style={{ height: "92vh" }}>
                <Container className="text-center mt-1">
                  <Container className="d-flex justify-content-center">
                    <EditRights admin={admin} />
                    <FontSize
                      fontSize={fontSize}
                      setFontSize={setFontSize}
                      admin={admin}
                    />
                  </Container>
                  <Container>
                    <Editor
                      className="border border-1 border-secondary"
                      width="100%"
                      height="77vh"
                      theme={darkMode ? "vs-dark" : "vs"}
                      language="python"
                      options={{
                        readOnly: readOnly,
                        fontSize: fontSize, // Set your desired font size here
                      }}
                      onMount={handleEditorDidMount}
                    />
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
                  <DownloadModal code={editorContent} />
                </Container>
              </Col>

              <Col lg={5} className="p-0">
                <Container className="mt-2" style={{ width: "100%" }}>
                  <Codellaborators />
                  <p
                    className={"text-center my-1 fs-5 " + colorScheme.textColor}
                  >
                    Shell
                  </p>
                  <div className="border border-1 border-secondary">
                    <CodeMirror
                      ref={outputRef}
                      height="40vh"
                      value={output}
                      theme={darkMode ? darcula : bbedit}
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
                    <p
                      className={
                        "fs-5 text-center m-1 " + colorScheme.textColor
                      }
                    >
                      Chat
                    </p>
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
