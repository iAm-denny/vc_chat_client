import React from "react";

function Input(props) {
  return (
    <div>
      <input
        type={props.type}
        id={props.id}
        className={props.class}
        onChange={props.onChange}
        placeholder={props.placeholder ? props.placeholder : ""}
        value={props.value && props.value}
      />
    </div>
  );
}

export default Input;
