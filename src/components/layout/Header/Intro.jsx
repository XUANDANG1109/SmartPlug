   import React, { useState } from 'react';
   import './Intro.css'; 

   const Intro = () => {
       const [isDropdownOpen, setDropdownOpen] = useState(false);

       const toggleDropdown = () => {
           setDropdownOpen(!isDropdownOpen);
       };

       return (
           <div>
               <header className="navbar">
                   <div className="logo">GROUP 7</div>
                   <nav className="nav-links">
                       <span>Home</span>
                       <span>Customer support</span>
                       <div className="dropdown">
                           <span onClick={toggleDropdown}>About us</span>
                           {isDropdownOpen && (
                               <div className="dropdown-menu">
                                    <a href="#">Information</a>
                                    <a href="#">Join us</a>
                                    <a href="#">Contact us</a>
                               </div>
                           )}
                       </div> 
                   </nav>
                   <div className="actions">
                       <button className="buy-button">Buy Smart Plug</button>
                       <button className="login-button">Login</button>
                       <div className="language">EN</div>
                       <div className="search-icon">🔍</div>
                   </div>
               </header>
               <div>
                   <h1>Smart Plug Control</h1>
               </div>
           </div>
       );
   };

   export default Intro;