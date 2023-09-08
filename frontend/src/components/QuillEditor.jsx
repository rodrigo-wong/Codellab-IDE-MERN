import React, { useEffect, useState, useCallback, memo } from "react";
import "react-quill/dist/quill.snow.css";
import Quill from "quill";
import socket from "../socket";
import { useUserContext } from "../context/UserContext";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const QuillEditor = (data) => {
  const [quill, setQuill] = useState(null);
  const { roomInfo, user, code, setCode} = useUserContext();
  const [updateTimeOut, setUpdateTimeOut] = useState(null);

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
      }, 2000)
    );
  };

  useEffect(() => {
    if (quill === null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
      setCode(quill.getText());
    };
    socket.on("receiveChanges", handler);
    return () => {
      socket.off("receiveChanges", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (quill === null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("sendChanges", { delta: delta, roomId: roomInfo.roomId });
      const value = quill.getText();
      setCode(value);
    };
    quill.on("text-change", handler);
  }, [socket, quill]);

  useEffect(() => {
    delayedUpdateRequest(code);
  }, [code]);

  useEffect(() => {
    if (quill) {
      const syntaxButton = document.querySelector(".ql-code-block");
      const buttonDescription = document.createElement("span");
      buttonDescription.style.alignSelf = "center";
      buttonDescription.innerText = " Highlight Syntax";
      syntaxButton.append(buttonDescription);
      syntaxButton.style.display = "flex";
      syntaxButton.style.width = "100%";
      syntaxButton.style.border = "1px solid black";
    }
  }, [quill]);

  const wrapperRef = useCallback(async (wrapper) => {
    if (wrapper === null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      modules: {
        syntax: {
          highlight: (text) => hljs.highlight("python", text).value,
        },
        toolbar: [["code-block"]],
      },
      theme: "snow",
    });
    setQuill(q);
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

      q.setText(fetchedCode);
      setCode(fetchedCode);
      console.log(fetchedCode);
    } catch (err) {
      console.log(err.message);
    }
  }, []);

  useEffect(() => {

    if (quill) {
      if (!data.admin) {
        console.log("in disable");
        if(roomInfo.editingPrivacy){
        quill.enable();
        } else {
          quill.disable();
        }
      } else {
        quill.enable();
      }
    }
  }, [data.admin, roomInfo, quill]);

  return <div className="editor" ref={wrapperRef}></div>;
};

export default memo(QuillEditor);
