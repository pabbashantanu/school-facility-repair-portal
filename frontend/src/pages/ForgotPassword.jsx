import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input type="email" id="email" className="form-control" placeholder="enter your email" required />
      </div>
      <button type="submit" className="btn">Request Reset Link</button>
      <div className="auth-footer">
        <p>Back to <Link to="/login">Sign In</Link></p>
      </div>
    </form>
  );
};

export default ForgotPassword;
