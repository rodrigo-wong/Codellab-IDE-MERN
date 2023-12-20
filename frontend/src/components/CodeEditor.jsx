import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { bbedit, darcula } from "@uiw/codemirror-themes-all";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import socket from "../socket";
import { useUserContext } from "../context/UserContext";

const CodeEditor = (data) => {
  const { roomInfo, user, code, setCode, darkMode, colorScheme} = useUserContext();
  const [readOnly, setReadOnly] = useState(false);
  const [updateTimeOut, setUpdateTimeOut] = useState(null);

  const fetchedCode = async () => {
    try {
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
    } catch (err) {
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

  useEffect(() => {
    fetchedCode();
  }, []);

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
    <div className="border border-1 border-secondary">
      <CodeMirror
        height="77vh"
        value={code}
        theme={darkMode? darcula : bbedit }
        readOnly={readOnly? true : false}
        onChange={handleCodeChange}
        extensions={loadLanguage("python")}
      />
    </div>
  );
};

export default CodeEditor;
