import { useState } from "react";
import RestClient from "../../services/RestClient.jsx";

const buttonStyle = { marginRight: "5px" };
function GetData() {
  const [data, setData] = useState("");
  const GetButton = () => (
    <button
      style={buttonStyle}
      type="button"
      onClick={() => {
        fetchData();
      }}
    >
      Get Data
    </button>
  );
  const GetPostButton = () => (
    <button
      style={buttonStyle}
      type="button"
      onClick={() => {
        fetchData(true);
      }}
    >
      Get Post Data
    </button>
  );
  const ClearDiv = () => (
    <button
      style={buttonStyle}
      type="button"
      onClick={() => {
        setData("");
      }}
    >
      clear
    </button>
  );
  const fetchData = async (postCall = false) => {
    try {
      const resp = postCall
        ? await RestClient.post("likit/test/getJSON")
        : await RestClient.get("likit/test/getJSON", null, null);
      console.log(resp);
      setData(resp.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <h4>Get data from api</h4>
      <GetButton />
      <GetPostButton />
      <ClearDiv />
      <div style={{ backgroundColor: "magenta", height: "25px" }}>
        <p>{data}</p>
      </div>
    </div>
  );
}
export default GetData;
