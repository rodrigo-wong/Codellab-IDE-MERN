import React from "react";
import { useUserContext } from "../context/UserContext";
import { Container } from "react-bootstrap";

const Codellaborators = () => {
  const { roomInfo, colorScheme } = useUserContext();

  return (
    <Container
      className={
        "container-fit-content d-flex flex-wrap border border-secondary align-items-center py-0 " +
        colorScheme.backgroundColor +
        colorScheme.textColor
      }
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
  );
};

export default Codellaborators;
