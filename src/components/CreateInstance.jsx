import React from "react";

export default function CreateInstance({ onSubmit }) {
  const [name, setName] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(name, null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 d-flex justify-content-end"
    >
      <div className="d-flex col-md-5 p-2 border rounded bg-light">
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter the instance name"
          required
        />
        <button type="submit" className="btn btn-primary ms-2">Crear</button>
      </div>
    </form>
  );
}