import React, { useState, useEffect } from "react";
import "./App.css"; // Import your styles

const App = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div>
      <header className={isSticky ? "header sticky" : "header"}>
        <h1>Header</h1>
      </header>
      <div
        id="menu-icon"
        className={menuOpen ? "menu-icon bx-x" : "menu-icon"}
        onClick={toggleMenu}
      >
        &#9776;
      </div>
      <nav className={menuOpen ? "nav open" : "nav"}>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default App;
