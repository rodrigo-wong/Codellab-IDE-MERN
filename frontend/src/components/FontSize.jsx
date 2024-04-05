import React from "react";
import { Dropdown } from "react-bootstrap";

const FontSize = ({fontSize, setFontSize, admin}) => {
  return (
    <div>
      <Dropdown
        className={admin ? "ms-2" : ""}
        onSelect={(size) => setFontSize(size)}
      >
        <Dropdown.Toggle variant="secondary" id="dropdown-basic" size="sm">
          Font Size: {fontSize}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {["10", "12", "14", "16", "18", "20", "22"].map((fontSize) => (
            <Dropdown.Item key={fontSize} eventKey={fontSize}>
              {fontSize}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default FontSize;
