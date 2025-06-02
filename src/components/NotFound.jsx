import React from "react";
import "./NotFound.css";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="not-found" data-oid="1jk1py6">
      <h1 data-oid="f3f6_l-">404</h1>
      <h2 data-oid="6go.pw2">Page Not Found</h2>
      <p data-oid="_w0jx6q">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="home-link" data-oid="v9guh05">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
