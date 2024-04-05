import React, { useState } from "react";
import { Button, Dropdown, ButtonGroup } from "react-bootstrap";
import { useUserContext } from "../context/UserContext";
import socket from "../socket";

const EditRights = ({ admin }) => {
  const { roomInfo, colorScheme } = useUserContext();
  const [publicEdit, setPublicEdit] = useState(false);

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

  return (
    <div className="d-flex mb-2">
      <div className={"fs-5 " + colorScheme.textColor}>Editor: &nbsp;</div>
      {admin ? (
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
      ) : (
        ""
      )}
    </div>
  );
};

export default EditRights;
