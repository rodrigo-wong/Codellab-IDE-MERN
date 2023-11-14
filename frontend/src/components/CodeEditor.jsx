import React, { useState, useEffect } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-monokai";
import socket from "../socket";
import { useUserContext } from "../context/UserContext";

const CodeEditor = (data) => {
  const { roomInfo, user, code, setCode } = useUserContext();
  const [readOnly, setReadOnly] = useState(false);
  const [updateTimeOut, setUpdateTimeOut] = useState(null);

  const fetchedCode = async () => {
      try{
        const dbCode = await fetch(
        `${process.env.REACT_APP_API_URL}/room/fetchCode?roomId=${user.room}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then((res) => res.text());

      setCode(dbCode);
      } catch(err) {
        console.log(err.message);
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

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("sendChanges", { code: newCode, roomId: roomInfo.roomId });
  };

  const delayedUpdateRequest = (value) => {
    //console.log("in delayed request");
    clearTimeout(updateTimeOut);
    setUpdateTimeOut(
      setTimeout(() => {
        updateCode(value);
      }, 2000)
    );
  };

  useEffect(()=>{
    fetchedCode();
  },[])

  useEffect(() => {
    delayedUpdateRequest(code);
  }, [code]);

  useEffect(() => {
    socket.on("receiveChanges", (newCode) => {
      setCode(newCode);
    });
  }, []);

  useEffect(() => {
    if (!data.admin) {
      if (roomInfo.editingPrivacy) {
        setReadOnly(true);
      } else {
        setReadOnly(false);
      }
    }
  }, [data.admin, roomInfo]);

  return (
    <AceEditor
      mode="python"
      theme="monokai"
      name="editor"
      value={code}
      fontSize={14}
      editorProps={{ $blockScrolling: true }}
      onChange={handleCodeChange}
      readOnly={readOnly}
      width="100%" // Optional: Set width directly in the component
      height="77vh" // Optional: Set height directly in the component
      style= {{border:'1px solid #888'}}
    />
  );
};

export default CodeEditor;
