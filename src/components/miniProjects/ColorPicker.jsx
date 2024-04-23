import { useContext, useState } from "react";
import ThemeContext from "../ThemeContext";

function ColorPicker() {
  const { theme } = useContext(ThemeContext);
  const [diffC, diffI] =
    theme === "dark" ? ["#000000", "#FFFFFF"] : ["#FFFFFF", "#000000"];
  const [color, setColor] = useState(diffC);
  const [inverse, setInverse] = useState(diffI);
  const calculateInverseColor = (hexColor) => {
    hexColor = hexColor.replace("#", "");
    let r = parseInt(hexColor.substring(0, 2), 16);
    let g = parseInt(hexColor.substring(2, 4), 16);
    let b = parseInt(hexColor.substring(4, 6), 16);
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    setInverse(
      "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    );
  };
  const divStyle = {
    backgroundColor: color,
    color: inverse,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "150px",
    height: "120px",
    borderRadius: "20px",
    transition: "0.7s ease",
    marginBottom: "25px",
    textAlign: "center",
    border:
      "5px solid " + (theme === "dark" ? "hsl(2,10%,80%)" : "hsl(0,0%,40%)"),
  };
  return (
    <div className="color-picker">
      <h2>Color Picker</h2>
      <div style={divStyle}>selected color : {color}</div>
      <label>Pick color</label>
      <input
        type="color"
        value={color}
        onChange={(e) => {
          let c = e.target.value;
          setColor(c);
          calculateInverseColor(c);
        }}
      />
    </div>
  );
}

export default ColorPicker;
