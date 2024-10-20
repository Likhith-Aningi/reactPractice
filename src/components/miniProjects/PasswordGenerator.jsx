import React, { useState, useContext, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeContext from "../ThemeContext";
const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const { theme } = useContext(ThemeContext);
  const notify = () =>
    toast.info("Password copied to clipboard", {
      autoClose: 5000,
      pauseOnHover: false,
      theme: theme,
      position: "top-center",
      toastId: 'noDup',
    });
    const error = () =>
      toast.error("Please select at least one option for generating the password.", {
        autoClose: 5000,
        pauseOnHover: false,
        theme: theme,
        position: "top-right",
        toastId: 'noDup',
      });  
  function generatePassword() {
    const length = document.getElementById("lengthInput").value;
    const useUpperCase = document.getElementById("uppercaseCheckbox").checked;
    const useLowerCase = document.getElementById("lowercaseCheckbox").checked;
    const useNumbers = document.getElementById("numbersCheckbox").checked;
    const useSpecialChars = document.getElementById(
      "specialCharsCheckbox"
    ).checked;

    if (!useUpperCase && !useLowerCase && !useNumbers && !useSpecialChars) {
      error();
      setPassword("");  
      document.getElementById("uppercaseCheckbox").checked = true;
      return;
    }
    if (length < 4 || length > 20) {
      alert("Length of the password should be between 4 and 20 inclusively");
      document.getElementById("lengthInput").value = 12;
      document.getElementById("lengthInput").focus();
      return;
    }

    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()-_+=~`[]{}|;:,.<>?";

    let validChars = "";
    if (useUpperCase) validChars += uppercaseChars;
    if (useLowerCase) validChars += lowercaseChars;
    if (useNumbers) validChars += numberChars;
    if (useSpecialChars) validChars += specialChars;

    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * validChars.length);
      newPassword += validChars[randomIndex];
    }
    console.log(newPassword);
    setPassword(newPassword);
  }

  function copyToClipboard() {
    if (password) {
      navigator.clipboard.writeText(password);
      notify();
    }
  }

  return (
    <>
      <ToastContainer />
      <div className="pwd-gen-container">
        <h1>Random Password Generator</h1>
        <div className="cbs">
          <label>
            <input type="checkbox" id="uppercaseCheckbox" defaultChecked />
            Uppercase Letters
          </label>
          <label>
            <input type="checkbox" id="lowercaseCheckbox" /> Lowercase Letters
          </label>
          <label>
            <input type="checkbox" id="numbersCheckbox" /> Numbers
          </label>
          <label>
            <input type="checkbox" id="specialCharsCheckbox" /> Special
            Characters
          </label>
        </div>
        <div>
          <label htmlFor="lengthInput">Length:</label>
          <input
            type="number"
            id="lengthInput"
            min="6"
            max="20"
            defaultValue="12"
          />
        </div>
        <button onClick={() => generatePassword()}>Generate Password</button>
        <div>
          <input type="text" id="password" readOnly value={password} />
          {password && <button style={{marginLeft:'10px'}} onClick={copyToClipboard}>Copy</button>}
        </div>
      </div>
    </>
  );
};

export default PasswordGenerator;
